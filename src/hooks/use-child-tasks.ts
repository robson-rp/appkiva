import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { notifyTaskCompleted } from '@/lib/notify';
import type { TaskCategory, TaskStatus } from '@/hooks/use-household-tasks';

export interface ChildTask {
  id: string;
  title: string;
  description: string | null;
  reward: number;
  category: TaskCategory;
  status: TaskStatus;
  createdAt: string;
  completedAt: string | null;
  approvedAt: string | null;
}

export function useChildTasks() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['child-tasks', user?.profileId],
    queryFn: async (): Promise<ChildTask[]> => {
      if (!user?.profileId) return [];

      const data = await api.get<any[]>('/tasks?child_profile_id=' + user.profileId);

      return (data ?? []).map((t: any) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        reward: Number(t.reward) || 0,
        category: t.category as TaskCategory,
        status: t.status as TaskStatus,
        createdAt: t.created_at,
        completedAt: t.completed_at,
        approvedAt: t.approved_at,
      }));
    },
    enabled: !!user?.profileId && (user?.role === 'child' || user?.role === 'teen'),
    refetchInterval: 30000, // Poll every 30 seconds
  });
}

export function useCompleteTask() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (taskId: string) => {
      // Complete task via API endpoint
      const result = await api.post<{
        task: any;
        parent_profile_id: string;
        title: string;
      }>(`/tasks/${taskId}/complete`, {});

      // Notify parent about task completion
      const childName = user?.name ?? 'O teu filho';
      await notifyTaskCompleted(result.parent_profile_id, childName, result.title, taskId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['child-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['household-tasks'] });
      toast({ title: 'Tarefa concluída! 🎉', description: 'Agora aguarda aprovação do encarregado.' });
    },
    onError: () => {
      toast({ title: 'Erro', description: 'Não foi possível concluir a tarefa.', variant: 'destructive' });
    },
  });
}
