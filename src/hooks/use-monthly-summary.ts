import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';

export interface MonthlySummary {
  month: string;
  label: string;
  income: number;
  expenses: number;
  net: number;
}

export function useMonthlySummary(months = 6) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['monthly-summary', user?.profileId, months],
    queryFn: async () => {
      if (!user?.profileId) return [];
      const data = await api.get<{ monthly_summary: MonthlySummary[] }>(`/children/${user.profileId}/summary?months=${months}`);
      return data.monthly_summary || [];
    },
    enabled: !!user?.profileId,
  });
}
