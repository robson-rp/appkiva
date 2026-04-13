import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export type MissionType = 'saving' | 'budgeting' | 'planning' | 'custom';
export type MissionStatus = 'available' | 'in_progress' | 'completed';

export interface MissionRow {
  id: string;
  title: string;
  description: string;
  type: MissionType;
  target_amount: number | null;
  reward: number;
  kiva_points_reward: number;
  status: MissionStatus;
  child_profile_id: string;
  parent_profile_id: string;
  household_id: string | null;
  week: number;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Child/Teen: view own missions ───
export function useChildMissions() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['missions', 'child', user?.profileId],
    queryFn: async (): Promise<MissionRow[]> => {
      if (!user?.profileId) return [];

      const data = await api.get<MissionRow[]>('/missions?child_profile_id=' + user.profileId);
      return data ?? [];
    },
    enabled: !!user?.profileId,
    refetchInterval: 30000, // Poll every 30 seconds
  });
}

// ─── Child/Teen: start a mission ───
export function useStartMission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (missionId: string) => {
      await api.post(`/missions/${missionId}/start`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['missions'] });
      toast.success('Missão iniciada! 🚀');
    },
    onError: () => toast.error('Não foi possível iniciar a missão.'),
  });
}

// ─── Child/Teen: complete a mission (via API for atomic rewards) ───
export function useCompleteMission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (missionId: string) => {
      const data = await api.post<{ 
        success: boolean; 
        reward_coins: number; 
        reward_points: number; 
        new_balance: number | null; 
        surprise_bonus?: number 
      }>(`/missions/${missionId}/complete`, {});
      
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['missions'] });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['kiva-points'] });
      const bonusMsg = data.surprise_bonus ? ` + Bónus surpresa: ${data.surprise_bonus} KVC! 🎁` : '';
      toast.success(`Missão concluída! +${data.reward_coins} KVC e +${data.reward_points} pts 🎉${bonusMsg}`);
    },
    onError: (err: any) => {
      if (err?.message?.includes('already completed')) {
        toast.info('Esta missão já foi concluída.');
      } else if (err?.message?.includes('expired')) {
        toast.error('Esta missão expirou.');
      } else {
        toast.error('Não foi possível concluir a missão.');
      }
    },
  });
}

// ─── Parent: view household missions ───
export function useHouseholdMissions() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['missions', 'parent', user?.profileId],
    queryFn: async (): Promise<(MissionRow & { child_display_name?: string; child_avatar?: string })[]> => {
      if (!user?.profileId) return [];

      const data = await api.get<any[]>('/missions?parent_profile_id=' + user.profileId);
      
      return (data ?? []).map((m: any) => ({
        ...m,
        child_display_name: m.child_display_name ?? 'Criança',
        child_avatar: m.child_avatar ?? '👧',
      }));
    },
    enabled: !!user?.profileId,
    refetchInterval: 30000, // Poll every 30 seconds
  });
}

// ─── Parent: create mission ───
export function useCreateMission() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: {
      title: string;
      description?: string;
      type: MissionType;
      target_amount?: number;
      reward: number;
      kiva_points_reward: number;
      child_profile_id: string;
    }) => {
      if (!user?.profileId) throw new Error('Não autenticado');

      await api.post('/missions', {
        title: input.title,
        description: input.description ?? '',
        type: input.type,
        target_amount: input.target_amount ?? null,
        reward: input.reward,
        kiva_points_reward: input.kiva_points_reward,
        child_profile_id: input.child_profile_id,
        parent_profile_id: user.profileId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['missions'] });
      toast.success('Missão criada! 🎯');
    },
    onError: () => toast.error('Não foi possível criar a missão.'),
  });
}

// ─── Parent: update mission ───
export function useUpdateMission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      id: string;
      title: string;
      description?: string;
      type: MissionType;
      target_amount?: number;
      reward: number;
      kiva_points_reward: number;
    }) => {
      await api.patch(`/missions/${input.id}`, {
        title: input.title,
        description: input.description ?? '',
        type: input.type,
        target_amount: input.target_amount ?? null,
        reward: input.reward,
        kiva_points_reward: input.kiva_points_reward,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['missions'] });
      toast.success('Missão actualizada! ✏️');
    },
    onError: () => toast.error('Não foi possível actualizar a missão.'),
  });
}

// ─── Parent: delete mission ───
export function useDeleteMission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (missionId: string) => {
      await api.delete(`/missions/${missionId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['missions'] });
      toast.success('Missão eliminada! 🗑️');
    },
    onError: () => toast.error('Não foi possível eliminar a missão.'),
  });
}
