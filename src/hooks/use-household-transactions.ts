import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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

const PAGE_SIZE = 10;

export function useHouseholdTransactions(initialLimit?: number) {
  const { user } = useAuth();
  const pageSize = initialLimit ?? PAGE_SIZE;

  return useInfiniteQuery({
    queryKey: ['household-transactions', user?.profileId, pageSize],
    queryFn: async ({ pageParam = 0 }): Promise<HouseholdTransaction[]> => {
      if (!user?.profileId) return [];

      // Get all children profile ids for this parent
      const { data: children } = await supabase
        .from('children')
        .select('profile_id, nickname, profiles!children_profile_id_fkey ( display_name, avatar )')
        .eq('parent_profile_id', user.profileId);

      const profileMap = new Map<string, { name: string; avatar: string }>();

      // Add parent to map
      profileMap.set(user.profileId, {
        name: user.name ?? 'Encarregado',
        avatar: user.avatar ?? '👤',
      });

      // Add children to map
      for (const c of (children ?? []) as any[]) {
        profileMap.set(c.profile_id, {
          name: c.profiles?.display_name ?? c.nickname ?? 'Criança',
          avatar: c.profiles?.avatar ?? '👧',
        });
      }

      const profileIds = [
        user.profileId,
        ...(children ?? []).map((c: any) => c.profile_id),
      ];

      // Fetch transactions from the wallet_transactions view for all household members
      const { data: txs, error } = await supabase
        .from('wallet_transactions')
        .select('*')
        .in('profile_id', profileIds)
        .order('created_at', { ascending: false })
        .range(pageParam * pageSize, (pageParam + 1) * pageSize - 1);

      if (error) throw error;

      return (txs ?? []).map((tx: any) => {
        const profile = profileMap.get(tx.profile_id);
        return {
          id: tx.id,
          amount: Number(tx.amount) || 0,
          description: tx.description ?? '',
          entryType: tx.entry_type ?? '',
          direction: tx.direction === 'credit' ? 'in' : 'out',
          createdAt: tx.created_at ?? '',
          profileId: tx.profile_id ?? '',
          displayName: profile?.name ?? 'Criança',
          avatar: profile?.avatar ?? '👧',
        };
      });
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage || lastPage.length < pageSize) return undefined;
      return allPages.length;
    },
    enabled: !!user?.profileId && user?.role === 'parent',
  });
}
