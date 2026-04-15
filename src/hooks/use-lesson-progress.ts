import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';

interface LessonProgressResponse {
  lesson_id: string;
  kiva_points_earned: number;
  score: number;
}

interface CompleteLessonRequest {
  score: number;
  kiva_points_earned: number;
}

export function useLessonProgress() {
  const { user } = useAuth();
  const profileId = user?.profileId;

  const query = useQuery({
    queryKey: ['lesson-progress', profileId],
    enabled: !!profileId,
    queryFn: async () => {
      const res = await api.get<any>('/lessons/progress');
      const data = Array.isArray(res) ? res : (res?.data ?? []);
      return data;
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
      await api.post<void>(`/lessons/${lessonId}/complete`, {
        score,
        kiva_points_earned: kivaPoints,
      } as CompleteLessonRequest);
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['lesson-progress'] });
      // Fire-and-forget notification
      import('@/lib/notify').then(({ notifyLessonCompleted }) => {
        if (user?.profileId) {
          notifyLessonCompleted(user.profileId, variables.lessonId, variables.kivaPoints);
        }
      });
    },
  });
}
