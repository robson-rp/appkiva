import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ChildWithBalance {
  childId: string;
  profileId: string;
  nickname: string | null;
  displayName: string;
  avatar: string;
  balance: number;
}

export function useChildren() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['children', user?.profileId],
    queryFn: async (): Promise<ChildWithBalance[]> => {
      if (!user?.profileId) return [];

      // Fetch children linked to this parent
      const { data: children, error } = await supabase
        .from('children')
        .select(`
          id,
          nickname,
          profile_id,
          profiles!children_profile_id_fkey (
            id,
            display_name,
            avatar
          )
        `)
        .eq('parent_profile_id', user.profileId);

      if (error) throw error;
      if (!children?.length) return [];

      // Fetch balances for all child profiles
      const profileIds = children.map((c: any) => c.profile_id);
      const { data: balances } = await supabase
        .from('wallet_balances')
        .select('profile_id, balance')
        .in('profile_id', profileIds)
        .eq('wallet_type', 'virtual')
        .eq('currency', 'KVC');

      const balanceMap = new Map(
        (balances ?? []).map((b) => [b.profile_id, Number(b.balance) || 0])
      );

      return children.map((c: any) => ({
        childId: c.id,
        profileId: c.profile_id,
        nickname: c.nickname,
        displayName: (c.profiles as any)?.display_name ?? c.nickname ?? 'Criança',
        avatar: (c.profiles as any)?.avatar ?? '👧',
        balance: balanceMap.get(c.profile_id) ?? 0,
      }));
    },
    enabled: !!user?.profileId && user?.role === 'parent',
  });
}
