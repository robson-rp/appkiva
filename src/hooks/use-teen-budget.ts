import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useTeenBudget() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['teen-budget', user?.profileId],
    queryFn: async (): Promise<number> => {
      if (!user?.profileId) return 0;

      const { data, error } = await supabase
        .from('children')
        .select('monthly_budget')
        .eq('profile_id', user.profileId)
        .maybeSingle();

      if (error) throw error;
      return Number(data?.monthly_budget) || 0;
    },
    enabled: !!user?.profileId && (user?.role === 'teen' || user?.role === 'child'),
  });
}
