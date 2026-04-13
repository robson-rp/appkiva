import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface AllowanceConfig {
  id: string;
  childProfileId: string;
  parentProfileId: string;
  baseAmount: number;
  frequency: 'weekly' | 'monthly';
  taskBonus: number;
  missionBonus: number;
  lastSentAt: string | null;
}

interface AllowanceConfigResponse {
  id: string;
  child_profile_id: string;
  parent_profile_id: string;
  base_amount: number;
  frequency: 'weekly' | 'monthly';
  task_bonus: number;
  mission_bonus: number;
  last_sent_at: string | null;
}

export function useAllowanceConfigs() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['allowance-configs', user?.profileId],
    queryFn: async (): Promise<AllowanceConfig[]> => {
      if (!user?.profileId) return [];

      const response = await api.get<{ data: AllowanceConfigResponse[] }>('/allowances');

      return response.data.map((c) => ({
        id: c.id,
        childProfileId: c.child_profile_id,
        parentProfileId: c.parent_profile_id,
        baseAmount: Number(c.base_amount) || 25,
        frequency: c.frequency,
        taskBonus: Number(c.task_bonus) || 5,
        missionBonus: Number(c.mission_bonus) || 10,
        lastSentAt: c.last_sent_at,
      }));
    },
    enabled: !!user?.profileId && user?.role === 'parent',
  });
}

export function useUpsertAllowanceConfig() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: {
      id?: string;
      childProfileId: string;
      baseAmount: number;
      frequency: string;
      taskBonus: number;
      missionBonus: number;
    }) => {
      if (!user?.profileId) throw new Error('Não autenticado');

      const body = {
        child_profile_id: input.childProfileId,
        base_amount: input.baseAmount,
        frequency: input.frequency,
        task_bonus: input.taskBonus,
        mission_bonus: input.missionBonus,
      };

      if (input.id) {
        await api.patch(`/allowances/${input.id}`, body);
      } else {
        await api.post('/allowances', body);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allowance-configs'] });
      toast({ title: 'Mesada configurada! ⚙️', description: 'Configuração guardada com sucesso.' });
    },
    onError: () => {
      toast({ title: 'Erro', description: 'Não foi possível guardar a configuração.', variant: 'destructive' });
    },
  });
}

export function useUpdateLastSent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (configId: string) => {
      await api.post(`/allowances/${configId}/send-now`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allowance-configs'] });
    },
  });
}
