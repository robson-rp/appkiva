import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { createNotification } from '@/hooks/use-notifications';

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'approved';
export type TaskCategory = 'cleaning' | 'studying' | 'helping' | 'other';

export interface HouseholdTask {
  id: string;
  title: string;
  description: string | null;
  reward: number;
  category: TaskCategory;
  status: TaskStatus;
  childProfileId: string;
  parentProfileId: string;
  childDisplayName: string;
  childAvatar: string;
  completedAt: string | null;
  approvedAt: string | null;
  createdAt: string;
}

export function useHouseholdTasks() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['household-tasks', user?.profileId],
    queryFn: async (): Promise<HouseholdTask[]> => {
      if (!user?.profileId) return [];

      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          profiles!tasks_child_profile_id_fkey (
            display_name,
            avatar
          )
        `)
        .eq('parent_profile_id', user.profileId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data ?? []).map((t: any) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        reward: Number(t.reward) || 0,
        category: t.category as TaskCategory,
        status: t.status as TaskStatus,
        childProfileId: t.child_profile_id,
        parentProfileId: t.parent_profile_id,
        childDisplayName: t.profiles?.display_name ?? 'Criança',
        childAvatar: t.profiles?.avatar ?? '👧',
        completedAt: t.completed_at,
        approvedAt: t.approved_at,
        createdAt: t.created_at,
      }));
    },
    enabled: !!user?.profileId && user?.role === 'parent',
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: {
      title: string;
      description?: string;
      reward: number;
      category: TaskCategory;
      childProfileId: string;
    }) => {
      if (!user?.profileId) throw new Error('Não autenticado');

      const { error } = await supabase.from('tasks').insert({
        title: input.title,
        description: input.description ?? null,
        reward: input.reward,
        category: input.category,
        child_profile_id: input.childProfileId,
        parent_profile_id: user.profileId,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['household-tasks'] });
      toast({ title: 'Tarefa criada! ✅', description: 'A tarefa foi adicionada com sucesso.' });
    },
    onError: () => {
      toast({ title: 'Erro', description: 'Não foi possível criar a tarefa.', variant: 'destructive' });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (taskId: string) => {
      if (!user?.profileId) throw new Error('Não autenticado');

      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)
        .eq('parent_profile_id', user.profileId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['household-tasks'] });
      toast({ title: 'Tarefa eliminada 🗑️', description: 'A tarefa foi removida com sucesso.' });
    },
    onError: () => {
      toast({ title: 'Erro', description: 'Não foi possível eliminar a tarefa.', variant: 'destructive' });
    },
  });
}

export function useApproveTask() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (taskId: string) => {
      if (!user?.profileId) throw new Error('Não autenticado');

      // Get the task to find the reward and child wallet
      const { data: task, error: taskError } = await supabase
        .from('tasks')
        .select('reward, child_profile_id, title')
        .eq('id', taskId)
        .single();

      if (taskError || !task) throw taskError || new Error('Tarefa não encontrada');

      // Update task status
      const { error: updateError } = await supabase
        .from('tasks')
        .update({ status: 'approved' as any, approved_at: new Date().toISOString() })
        .eq('id', taskId);

      if (updateError) throw updateError;

      // Credit the child's wallet via edge function
      const { error: txError } = await supabase.functions.invoke('create-transaction', {
        body: {
          target_profile_id: task.child_profile_id,
          amount: Number(task.reward),
          description: `Tarefa aprovada: ${task.title}`,
          entry_type: 'task_reward',
        },
      });

      if (txError) throw txError;

      // Create notification for the child
      await createNotification({
        profileId: task.child_profile_id,
        title: 'Tarefa aprovada! ✅',
        message: `A tarefa "${task.title}" foi aprovada. +${task.reward} KivaCoins!`,
        type: 'task',
        metadata: { task_id: taskId, reward: task.reward },
      });
    },
    onSuccess: (_, taskId) => {
      queryClient.invalidateQueries({ queryKey: ['household-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['children'] });
      queryClient.invalidateQueries({ queryKey: ['household-transactions'] });
      toast({ title: 'Tarefa aprovada! ✅', description: 'As moedas foram creditadas à criança.' });
    },
    onError: () => {
      toast({ title: 'Erro', description: 'Não foi possível aprovar a tarefa.', variant: 'destructive' });
    },
  });
}
