import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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

export function useCollectiveChallenges() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['collective-challenges', user?.profileId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('collective_challenges')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data as CollectiveChallengeRow[]) ?? [];
    },
    enabled: !!user?.profileId,
  });
}

export function useCreateCollectiveChallenge() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: Omit<CollectiveChallengeRow, 'id' | 'created_at' | 'teacher_profile_id' | 'current_amount'>) => {
      if (!user?.profileId) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('collective_challenges')
        .insert({ ...input, teacher_profile_id: user.profileId, current_amount: 0 })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['collective-challenges'] }),
  });
}

export function useUpdateCollectiveChallenge() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CollectiveChallengeRow> & { id: string }) => {
      const { error } = await supabase
        .from('collective_challenges')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['collective-challenges'] }),
  });
}

export function useDeleteCollectiveChallenge() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('collective_challenges')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['collective-challenges'] }),
  });
}
