import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

export interface WalletBalance {
  wallet_id: string;
  profile_id: string;
  wallet_type: string;
  currency: string;
  balance: number;
}

export interface WalletTransaction {
  id: string;
  amount: number;
  entry_type: string;
  description: string;
  created_at: string;
  direction: 'credit' | 'debit';
  metadata: Record<string, unknown>;
}

/** Subscribe to ledger_entries changes and invalidate wallet queries */
function useWalletRealtime() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('wallet-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'ledger_entries' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['wallet-balance'] });
          queryClient.invalidateQueries({ queryKey: ['wallet-transactions'] });
          queryClient.invalidateQueries({ queryKey: ['children'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}

export function useWalletBalance(profileId?: string) {
  const { user } = useAuth();
  const id = profileId || user?.profileId;

  useWalletRealtime();

  return useQuery({
    queryKey: ['wallet-balance', id],
    queryFn: async () => {
      if (!id) return null;
      
      // Use security definer function to bypass RLS
      const { data, error } = await supabase
        .rpc('get_profile_balance', { _profile_id: id });

      if (error) throw error;
      
      return {
        wallet_id: '',
        profile_id: id,
        wallet_type: 'virtual',
        currency: 'KVC',
        balance: (data as number) ?? 0,
      } as WalletBalance;
    },
    enabled: !!id,
    refetchInterval: 30000,
  });
}

export function useWalletTransactions(profileId?: string, limit = 20) {
  const { user } = useAuth();
  const id = profileId || user?.profileId;

  return useQuery({
    queryKey: ['wallet-transactions', id, limit],
    queryFn: async () => {
      if (!id) return [];
      
      // Use security definer function to bypass RLS
      const { data, error } = await supabase
        .rpc('get_wallet_transactions', { _profile_id: id, _limit: limit });

      if (error) throw error;
      return (data as WalletTransaction[]) ?? [];
    },
    enabled: !!id,
    refetchInterval: 30000,
  });
}
