import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';

export function useTeenBudget() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['teen-budget', user?.profileId],
    queryFn: async (): Promise<number> => {
      if (!user?.profileId) return 0;
      const data = await api.get<{ monthly_budget: number }>(`/children/${user.profileId}/summary`);
      return data.monthly_budget || 0;
    },
    enabled: !!user?.profileId && (user?.role === 'teen' || user?.role === 'child'),
  });
}
