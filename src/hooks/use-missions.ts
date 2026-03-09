import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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

      const { data, error } = await supabase
        .from('missions')
        .select('*')
        .eq('child_profile_id', user.profileId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data ?? []) as unknown as MissionRow[];
    },
    enabled: !!user?.profileId,
  });
}

// ─── Child/Teen: start a mission ───
export function useStartMission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (missionId: string) => {
      const { error } = await supabase
        .from('missions')
        .update({ status: 'in_progress' as any })
        .eq('id', missionId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['missions'] });
      toast.success('Missão iniciada! 🚀');
    },
    onError: () => toast.error('Não foi possível iniciar a missão.'),
  });
}

// ─── Child/Teen: complete a mission ───
export function useCompleteMission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (missionId: string) => {
      const { error } = await supabase
        .from('missions')
        .update({ status: 'completed' as any, completed_at: new Date().toISOString() } as any)
        .eq('id', missionId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['missions'] });
      toast.success('Missão concluída! 🎉');
    },
    onError: () => toast.error('Não foi possível concluir a missão.'),
  });
}

// ─── Parent: view household missions ───
export function useHouseholdMissions() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['missions', 'parent', user?.profileId],
    queryFn: async (): Promise<(MissionRow & { child_display_name?: string; child_avatar?: string })[]> => {
      if (!user?.profileId) return [];

      const { data, error } = await supabase
        .from('missions')
        .select(`
          *,
          profiles!missions_child_profile_id_fkey (
            display_name,
            avatar
          )
        `)
        .eq('parent_profile_id', user.profileId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data ?? []).map((m: any) => ({
        ...m,
        child_display_name: m.profiles?.display_name ?? 'Criança',
        child_avatar: m.profiles?.avatar ?? '👧',
      })) as any;
    },
    enabled: !!user?.profileId,
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

      const { error } = await supabase.from('missions').insert({
        title: input.title,
        description: input.description ?? '',
        type: input.type as any,
        target_amount: input.target_amount ?? null,
        reward: input.reward,
        kiva_points_reward: input.kiva_points_reward,
        child_profile_id: input.child_profile_id,
        parent_profile_id: user.profileId,
      } as any);

      if (error) throw error;
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
      const { error } = await supabase
        .from('missions')
        .update({
          title: input.title,
          description: input.description ?? '',
          type: input.type as any,
          target_amount: input.target_amount ?? null,
          reward: input.reward,
          kiva_points_reward: input.kiva_points_reward,
        } as any)
        .eq('id', input.id);
      if (error) throw error;
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
      const { error } = await supabase
        .from('missions')
        .delete()
        .eq('id', missionId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['missions'] });
      toast.success('Missão eliminada! 🗑️');
    },
    onError: () => toast.error('Não foi possível eliminar a missão.'),
  });
}
