import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
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
      return api.get<ChildWithBalance[]>('/children');
    },
    enabled: !!user && user.role === 'parent',
  });
}

export function useUpdateChildBudget() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ childId, monthlyBudget }: { childId: string; monthlyBudget: number }) => {
      return api.patch(`/children/${childId}`, { monthly_budget: monthlyBudget });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['children'] }),
  });
}

export function useUpdateChildDailyLimit() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ childId, dailySpendLimit }: { childId: string; dailySpendLimit: number }) => {
      return api.patch(`/children/${childId}`, { daily_spend_limit: dailySpendLimit });
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
      schoolTenantId,
    }: {
      childId: string;
      profileId: string;
      nickname: string | null;
      avatar: string;
      dateOfBirth: string | null;
      schoolTenantId?: string | null;
    }) => {
      return api.patch(`/children/${childId}`, {
        nickname,
        avatar,
        date_of_birth: dateOfBirth,
        school_tenant_id: schoolTenantId,
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['children'] }),
  });
}
