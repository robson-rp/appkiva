import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';

export interface CollectiveChallengeRow {
  id: string;
  title: string;
  description: string;
  classroom_id: string;
  teacher_profile_id: string;
  type: string;
  icon: string;
  target_amount: number;
  current_amount: number;
  reward: number;
  kiva_points_reward: number;
  status: string;
  start_date: string;
  end_date: string;
  created_at: string;
}

interface CollectiveChallengesResponse {
  data: CollectiveChallengeRow[];
}

export function useCollectiveChallenges() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['collective-challenges', user?.profileId],
    queryFn: async () => {
      const response = await api.get<CollectiveChallengesResponse>('/challenges/collective');
      return response.data ?? [];
    },
    enabled: !!user?.profileId,
    refetchInterval: 60000,
  });
}

export function useCreateCollectiveChallenge() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: Omit<CollectiveChallengeRow, 'id' | 'created_at' | 'teacher_profile_id' | 'current_amount'>) => {
      if (!user?.profileId) throw new Error('Not authenticated');
      const response = await api.post<{ data: CollectiveChallengeRow }>('/challenges/collective', {
        ...input,
        teacher_profile_id: user.profileId,
      });
      return response.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['collective-challenges'] }),
  });
}

export function useUpdateCollectiveChallenge() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CollectiveChallengeRow> & { id: string }) => {
      await api.patch(`/challenges/collective/${id}`, updates);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['collective-challenges'] }),
  });
}

export function useDeleteCollectiveChallenge() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/challenges/collective/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['collective-challenges'] }),
  });
}

export function useCompleteCollectiveChallenge() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (challengeId: string) => {
      await api.post(`/challenges/${challengeId}/complete`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['collective-challenges'] });
      qc.invalidateQueries({ queryKey: ['kiva-points'] });
    },
  });
}
