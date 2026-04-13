import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';

export interface EmissionStats {
  emitted_this_month: number;
  emission_limit: number;
  remaining: number;
  percentage_used: number;
  month_start: string;
  has_override: boolean;
}

export function useEmissionStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['emission-stats', user?.profileId],
    queryFn: async (): Promise<EmissionStats | null> => {
      if (!user?.profileId) return null;
      const data = await api.get<{ emission_stats: EmissionStats }>('/admin/stats');
      return data.emission_stats;
    },
    enabled: !!user?.profileId && user?.role === 'parent',
    refetchInterval: 60000,
  });
}
