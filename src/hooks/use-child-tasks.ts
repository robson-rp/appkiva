import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('child_profile_id', user.profileId)
        .order('created_at', { ascending: false });

      if (error) throw error;

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
  });
}

export function useCompleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase
        .from('tasks')
        .update({
          status: 'completed' as any,
          completed_at: new Date().toISOString(),
        })
        .eq('id', taskId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['child-tasks'] });
      toast({ title: 'Tarefa concluída! 🎉', description: 'Agora aguarda aprovação do encarregado.' });
    },
    onError: () => {
      toast({ title: 'Erro', description: 'Não foi possível concluir a tarefa.', variant: 'destructive' });
    },
  });
}
