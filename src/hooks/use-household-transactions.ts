import { useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';

export interface HouseholdTransaction {
  id: string;
  amount: number;
  description: string;
  entryType: string;
  direction: 'in' | 'out';
  createdAt: string;
  profileId: string;
  displayName: string;
  avatar: string;
}

interface TransactionResponse {
  id: string;
  amount: number;
  description: string;
  entry_type: string;
  direction: 'credit' | 'debit';
  created_at: string;
  profile_id: string;
  display_name: string;
  avatar: string;
}

interface TransactionsApiResponse {
  data: TransactionResponse[];
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

const PAGE_SIZE = 10;

export function useHouseholdTransactions(initialLimit?: number) {
  const { user } = useAuth();
  const pageSize = initialLimit ?? PAGE_SIZE;

  return useInfiniteQuery({
    queryKey: ['household-transactions', user?.householdId, pageSize],
    queryFn: async ({ pageParam = 1 }): Promise<HouseholdTransaction[]> => {
      if (!user?.householdId) return [];

      const response = await api.get<TransactionsApiResponse>(
        `/households/${user.householdId}/transactions?page=${pageParam}&per_page=${pageSize}`
      );

      return (response.data ?? []).map((tx) => ({
        id: tx.id,
        amount: Number(tx.amount) || 0,
        description: tx.description ?? '',
        entryType: tx.entry_type ?? '',
        direction: tx.direction === 'credit' ? 'in' : 'out',
        createdAt: tx.created_at ?? '',
        profileId: tx.profile_id ?? '',
        displayName: tx.display_name ?? 'Criança',
        avatar: tx.avatar ?? '👧',
      }));
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages, lastPageParam) => {
      if (!lastPage || lastPage.length < pageSize) return undefined;
      return (lastPageParam as number) + 1;
    },
    enabled: !!user?.householdId && user?.role === 'parent',
  });
}
