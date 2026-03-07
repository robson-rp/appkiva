import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useLessonProgress() {
  const { user } = useAuth();
  const profileId = user?.profileId;

  const query = useQuery({
    queryKey: ['lesson-progress', profileId],
    enabled: !!profileId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lesson_progress')
        .select('lesson_id, kiva_points_earned, score')
        .eq('profile_id', profileId!);

      if (error) throw error;
      return data ?? [];
    },
  });

  const completedIds = new Set((query.data ?? []).map(r => r.lesson_id));
  const totalPoints = (query.data ?? []).reduce((s, r) => s + r.kiva_points_earned, 0);
  const scoreMap = new Map((query.data ?? []).map(r => [r.lesson_id, r.score]));

  return { ...query, completedIds, totalPoints, scoreMap };
}

export function useCompleteLessonMutation() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ lessonId, score, kivaPoints }: { lessonId: string; score: number; kivaPoints: number }) => {
      const { error } = await supabase
        .from('lesson_progress')
        .upsert(
          {
            profile_id: user!.profileId,
            lesson_id: lessonId,
            score,
            kiva_points_earned: kivaPoints,
          },
          { onConflict: 'profile_id,lesson_id' }
        );
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lesson-progress'] });
    },
  });
}
