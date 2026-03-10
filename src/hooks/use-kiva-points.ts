import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useKivaPoints(profileId?: string) {
  const { user } = useAuth();
  const id = profileId || user?.profileId;

  return useQuery({
    queryKey: ['kiva-points', id],
    enabled: !!id,
    queryFn: async () => {
      // 1. Lesson points
      const { data: lessons } = await supabase
        .from('lesson_progress')
        .select('kiva_points_earned')
        .eq('profile_id', id!);

      const lessonPoints = (lessons ?? []).reduce((s, r) => s + (r.kiva_points_earned ?? 0), 0);

      // 2. Completed mission points
      const { data: missions } = await supabase
        .from('missions')
        .select('kiva_points_reward')
        .eq('child_profile_id', id!)
        .eq('status', 'completed');

      const missionPoints = (missions ?? []).reduce((s, r) => s + (r.kiva_points_reward ?? 0), 0);

      // 3. Streak rewards (if table exists)
      let streakPoints = 0;
      try {
        const { data: streaks } = await supabase
          .from('streak_rewards' as any)
          .select('kiva_points')
          .eq('profile_id', id!)
          .eq('claimed', true);
        streakPoints = (streaks ?? []).reduce((s: number, r: any) => s + (r.kiva_points ?? 0), 0);
      } catch {
        // streak_rewards table may not exist
      }

      return lessonPoints + missionPoints + streakPoints;
    },
  });
}
