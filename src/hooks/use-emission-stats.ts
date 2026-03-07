import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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
      const { data, error } = await supabase.rpc('get_parent_emission_stats', {
        _parent_profile_id: user.profileId,
      });
      if (error) throw error;
      return data as unknown as EmissionStats;
    },
    enabled: !!user?.profileId && user?.role === 'parent',
    refetchInterval: 60000,
  });
}
