import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ChildWithBalance {
  childId: string;
  profileId: string;
  nickname: string | null;
  displayName: string;
  avatar: string;
  balance: number;
  monthlyBudget: number;
  dailySpendLimit: number;
  dateOfBirth: string | null;
  schoolTenantId: string | null;
}

export function useChildren() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['children', user?.profileId],
    queryFn: async (): Promise<ChildWithBalance[]> => {
      if (!user?.profileId) return [];

      const { data: children, error } = await supabase
        .from('children')
        .select(`
          id,
          nickname,
          profile_id,
          monthly_budget,
          daily_spend_limit,
          date_of_birth,
          school_tenant_id,
          profiles!children_profile_id_fkey (
            id,
            display_name,
            avatar
          )
        `)
        .eq('parent_profile_id', user.profileId);

      if (error) throw error;
      if (!children?.length) return [];

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
        monthlyBudget: Number(c.monthly_budget) || 0,
        dailySpendLimit: Number(c.daily_spend_limit) || 50,
        dateOfBirth: c.date_of_birth ?? null,
      }));
    },
    enabled: !!user?.profileId && user?.role === 'parent',
  });
}

export function useUpdateChildBudget() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ childId, monthlyBudget }: { childId: string; monthlyBudget: number }) => {
      const { data, error } = await supabase
        .from('children')
        .update({ monthly_budget: monthlyBudget })
        .eq('id', childId)
        .select('id, monthly_budget')
        .single();
      if (error) throw error;
      if (!data) throw new Error('Não foi possível atualizar o orçamento mensal');
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['children'] }),
  });
}

export function useUpdateChildDailyLimit() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ childId, dailySpendLimit }: { childId: string; dailySpendLimit: number }) => {
      const { data, error } = await supabase
        .from('children')
        .update({ daily_spend_limit: dailySpendLimit })
        .eq('id', childId)
        .select('id, daily_spend_limit')
        .single();
      if (error) throw error;
      if (!data) throw new Error('Não foi possível atualizar o limite diário');
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['children'] }),
  });
}

export function useUpdateChild() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      childId,
      nickname,
      avatar,
      dateOfBirth,
    }: {
      childId: string;
      profileId: string;
      nickname: string | null;
      avatar: string;
      dateOfBirth: string | null;
    }) => {
      const { error } = await supabase.rpc('update_child_profile', {
        _child_id: childId,
        _nickname: nickname,
        _avatar: avatar,
        _date_of_birth: dateOfBirth,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['children'] }),
  });
}
