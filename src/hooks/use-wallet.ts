import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
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

function toNumber(value: unknown): number {
  const num = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(num) ? num : 0;
}

export function useWalletBalance(profileId?: string) {
  const { user } = useAuth();
  const id = profileId || user?.profileId;

  return useQuery({
    queryKey: ['wallet-balance', id],
    queryFn: async () => {
      if (!id) return null;

      // Get wallets first
      const wallets = await api.get<Array<{ id: string; profile_id: string; wallet_type: string; currency: string }>>('/wallets');
      const wallet = wallets.find(w => w.profile_id === id && w.wallet_type === 'virtual' && w.currency === 'KVC');
      
      if (!wallet) {
        return {
          wallet_id: '',
          profile_id: id,
          wallet_type: 'virtual',
          currency: 'KVC',
          balance: 0,
        } as WalletBalance;
      }

      const balanceData = await api.get<{ balance: number }>(`/wallets/${wallet.id}/balance`);

      return {
        wallet_id: wallet.id,
        profile_id: id,
        wallet_type: 'virtual',
        currency: 'KVC',
        balance: toNumber(balanceData.balance),
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

      // Get wallets first
      const wallets = await api.get<Array<{ id: string; profile_id: string; wallet_type: string; currency: string }>>('/wallets');
      const wallet = wallets.find(w => w.profile_id === id && w.wallet_type === 'virtual' && w.currency === 'KVC');
      
      if (!wallet) return [];

      const transactions = await api.get<WalletTransaction[]>(`/wallets/${wallet.id}/transactions?limit=${limit}`);

      return (transactions ?? []).map((tx) => ({
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
