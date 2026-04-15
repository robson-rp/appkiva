import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { notifyTaskApproved, notifyNewTask } from '@/lib/notify';

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

      const res = await api.get<any>('/tasks?parent_profile_id=' + user.profileId);
      const data = Array.isArray(res) ? res : (res?.data ?? []);
      return data.map((t: any) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        reward: Number(t.reward) || 0,
        category: t.category as TaskCategory,
        status: t.status as TaskStatus,
        childProfileId: t.child_profile_id,
        parentProfileId: t.parent_profile_id,
        childDisplayName: t.child_display_name ?? 'Criança',
        childAvatar: t.child_avatar ?? '👧',
        completedAt: t.completed_at,
        approvedAt: t.approved_at,
        createdAt: t.created_at,
      }));
    },
    enabled: !!user?.profileId && user?.role === 'parent',
    refetchInterval: 30000, // Poll every 30 seconds
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
      isRecurring?: boolean;
      recurrence?: string;
    }) => {
      if (!user?.profileId) throw new Error('Não autenticado');

      await api.post('/tasks', {
        title: input.title,
        description: input.description ?? null,
        reward: input.reward,
        category: input.category,
        child_profile_id: input.childProfileId,
        parent_profile_id: user.profileId,
        is_recurring: input.isRecurring ?? false,
        recurrence: input.recurrence ?? null,
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['household-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['child-tasks'] });
      // Notify the child about the new task
      notifyNewTask(variables.childProfileId, variables.title, variables.reward);
      toast({ title: 'Tarefa criada! ✅', description: 'A tarefa foi adicionada com sucesso.' });
    },
    onError: () => {
      toast({ title: 'Erro', description: 'Não foi possível criar a tarefa.', variant: 'destructive' });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: {
      taskId: string;
      title: string;
      reward: number;
      category: TaskCategory;
    }) => {
      if (!user?.profileId) throw new Error('Não autenticado');

      await api.patch(`/tasks/${input.taskId}`, {
        title: input.title,
        reward: input.reward,
        category: input.category,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['household-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['child-tasks'] });
      toast({ title: 'Tarefa actualizada ✏️', description: 'As alterações foram guardadas.' });
    },
    onError: () => {
      toast({ title: 'Erro', description: 'Não foi possível actualizar a tarefa.', variant: 'destructive' });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (taskId: string) => {
      if (!user?.profileId) throw new Error('Não autenticado');

      await api.delete(`/tasks/${taskId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['household-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['child-tasks'] });
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

      const res = await api.post<any>(`/tasks/${taskId}/approve`, {});
      const result = res?.data ?? res;

      // Notify child about approval
      await notifyTaskApproved(
        result.child_profile_id,
        result.title,
        Number(result.reward),
        taskId
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['household-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['child-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['children'] });
      queryClient.invalidateQueries({ queryKey: ['household-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      toast({ title: 'Tarefa aprovada! ✅', description: 'As moedas foram creditadas à criança.' });
    },
    onError: () => {
      toast({ title: 'Erro', description: 'Não foi possível aprovar a tarefa.', variant: 'destructive' });
    },
  });
}
