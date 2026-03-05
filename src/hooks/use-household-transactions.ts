import { useQuery } from '@tanstack/react-query';
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

export function useHouseholdTransactions(limit = 10) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['household-transactions', user?.profileId, limit],
    queryFn: async (): Promise<HouseholdTransaction[]> => {
      if (!user?.profileId) return [];

      // Get all children profile ids for this parent
      const { data: children } = await supabase
        .from('children')
        .select('profile_id, nickname, profiles!children_profile_id_fkey ( display_name, avatar )')
        .eq('parent_profile_id', user.profileId);

      if (!children?.length) return [];

      const profileMap = new Map<string, { name: string; avatar: string }>();
      for (const c of children as any[]) {
        profileMap.set(c.profile_id, {
          name: c.profiles?.display_name ?? c.nickname ?? 'Criança',
          avatar: c.profiles?.avatar ?? '👧',
        });
      }

      const profileIds = children.map((c: any) => c.profile_id);

      // Fetch recent transactions from the wallet_transactions view
      const { data: txs, error } = await supabase
        .from('wallet_transactions')
        .select('*')
        .in('profile_id', profileIds)
        .order('created_at', { ascending: false })
        .limit(limit);

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
    enabled: !!user?.profileId && user?.role === 'parent',
  });
}
