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

function toNumber(value: unknown): number {
  const num = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(num) ? num : 0;
}

/** Subscribe to ledger changes and invalidate wallet queries */
function useWalletRealtime(enabled: boolean) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) return;

    const channel = supabase
      .channel('wallet-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ledger_entries' },
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
  }, [enabled, queryClient]);
}

export function useWalletBalance(profileId?: string) {
  const { user } = useAuth();
  const id = profileId || user?.profileId;

  useWalletRealtime(!!id);

  return useQuery({
    queryKey: ['wallet-balance', id],
    queryFn: async () => {
      if (!id) return null;

      let balance = 0;

      const { data: rpcData } = await supabase.rpc('get_profile_balance', { _profile_id: id });
      balance = toNumber(rpcData);

      if (balance === 0) {
        const { data: fallbackRow } = await supabase
          .from('wallet_balances')
          .select('wallet_id, profile_id, wallet_type, currency, balance')
          .eq('profile_id', id)
          .eq('wallet_type', 'virtual')
          .eq('currency', 'KVC')
          .maybeSingle();

        if (fallbackRow) {
          return {
            wallet_id: fallbackRow.wallet_id,
            profile_id: fallbackRow.profile_id,
            wallet_type: fallbackRow.wallet_type,
            currency: fallbackRow.currency,
            balance: toNumber(fallbackRow.balance),
          } as WalletBalance;
        }
      }

      return {
        wallet_id: '',
        profile_id: id,
        wallet_type: 'virtual',
        currency: 'KVC',
        balance,
      } as WalletBalance;
    },
    enabled: !!id,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
    refetchInterval: 15000,
    refetchIntervalInBackground: true,
    retry: 2,
  });
}

export function useWalletTransactions(profileId?: string, limit = 20) {
  const { user } = useAuth();
  const id = profileId || user?.profileId;

  return useQuery({
    queryKey: ['wallet-transactions', id, limit],
    queryFn: async () => {
      if (!id) return [];

      const { data: rpcData } = await supabase.rpc('get_wallet_transactions', {
        _profile_id: id,
        _limit: limit,
      });

      return ((rpcData as WalletTransaction[]) ?? []).map((tx) => ({
        ...tx,
        amount: toNumber(tx.amount),
        metadata: (tx.metadata ?? {}) as Record<string, unknown>,
      }));
    },
    enabled: !!id,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
    refetchInterval: 15000,
    refetchIntervalInBackground: true,
    retry: 2,
  });
}

