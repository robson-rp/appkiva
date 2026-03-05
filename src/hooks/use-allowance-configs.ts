import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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

export function useAllowanceConfigs() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['allowance-configs', user?.profileId],
    queryFn: async (): Promise<AllowanceConfig[]> => {
      if (!user?.profileId) return [];

      const { data, error } = await supabase
        .from('allowance_configs')
        .select('*')
        .eq('parent_profile_id', user.profileId);

      if (error) throw error;

      return (data ?? []).map((c: any) => ({
        id: c.id,
        childProfileId: c.child_profile_id,
        parentProfileId: c.parent_profile_id,
        baseAmount: Number(c.base_amount) || 25,
        frequency: c.frequency as 'weekly' | 'monthly',
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
      childProfileId: string;
      baseAmount: number;
      frequency: string;
      taskBonus: number;
      missionBonus: number;
    }) => {
      if (!user?.profileId) throw new Error('Não autenticado');

      const { error } = await supabase
        .from('allowance_configs')
        .upsert(
          {
            child_profile_id: input.childProfileId,
            parent_profile_id: user.profileId,
            base_amount: input.baseAmount,
            frequency: input.frequency,
            task_bonus: input.taskBonus,
            mission_bonus: input.missionBonus,
          },
          { onConflict: 'child_profile_id,parent_profile_id' }
        );

      if (error) throw error;
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
      const { error } = await supabase
        .from('allowance_configs')
        .update({ last_sent_at: new Date().toISOString() })
        .eq('id', configId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allowance-configs'] });
    },
  });
}
