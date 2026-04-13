import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';

export function useMonthlySpending() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['monthly-spending', user?.profileId],
    queryFn: async (): Promise<number> => {
      if (!user?.profileId) return 0;
      const data = await api.get<{ monthly_spending: number }>(`/children/${user.profileId}/summary`);
      return data.monthly_spending || 0;
    },
    enabled: !!user?.profileId && (user?.role === 'child' || user?.role === 'teen'),
  });
}
