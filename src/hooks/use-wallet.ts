import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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

export function useWalletBalance(profileId?: string) {
  const { user } = useAuth();
  const id = profileId || user?.profileId;

  return useQuery({
    queryKey: ['wallet-balance', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('wallet_balances')
        .select('*')
        .eq('profile_id', id)
        .eq('wallet_type', 'virtual')
        .eq('currency', 'KVC')
        .maybeSingle();

      if (error) throw error;
      return (data as WalletBalance | null);
    },
    enabled: !!id,
  });
}

export function useWalletTransactions(profileId?: string, limit = 20) {
  const { user } = useAuth();
  const id = profileId || user?.profileId;

  return useQuery({
    queryKey: ['wallet-transactions', id, limit],
    queryFn: async () => {
      if (!id) return [];
      
      // Get wallet id first
      const { data: wallet } = await supabase
        .from('wallets')
        .select('id')
        .eq('profile_id', id)
        .eq('wallet_type', 'virtual')
        .eq('currency', 'KVC')
        .maybeSingle();

      if (!wallet) return [];

      const { data, error } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('wallet_id', wallet.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data as WalletTransaction[]) ?? [];
    },
    enabled: !!id,
  });
}
