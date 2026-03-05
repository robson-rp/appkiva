import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export type RewardCategory = 'experience' | 'privilege' | 'physical' | 'digital';

export interface Reward {
  id: string;
  name: string;
  description: string | null;
  price: number;
  icon: string;
  category: RewardCategory;
  available: boolean;
  claimedBy: string | null;
  claimedAt: string | null;
  createdAt: string;
}

export function useRewards() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['rewards', user?.profileId],
    queryFn: async (): Promise<Reward[]> => {
      if (!user?.profileId) return [];

      const { data, error } = await supabase
        .from('rewards')
        .select('*')
        .eq('parent_profile_id', user.profileId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data ?? []).map((r: any) => ({
        id: r.id,
        name: r.name,
        description: r.description,
        price: Number(r.price) || 0,
        icon: r.icon,
        category: r.category as RewardCategory,
        available: r.available,
        claimedBy: r.claimed_by,
        claimedAt: r.claimed_at,
        createdAt: r.created_at,
      }));
    },
    enabled: !!user?.profileId && user?.role === 'parent',
  });
}

export function useCreateReward() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: {
      name: string;
      description?: string;
      price: number;
      icon: string;
      category: RewardCategory;
    }) => {
      if (!user?.profileId) throw new Error('Não autenticado');

      const { error } = await supabase.from('rewards').insert({
        name: input.name,
        description: input.description ?? null,
        price: input.price,
        icon: input.icon,
        category: input.category,
        parent_profile_id: user.profileId,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
      toast({ title: 'Recompensa criada! 🎁', description: 'A recompensa foi adicionada.' });
    },
    onError: () => {
      toast({ title: 'Erro', description: 'Não foi possível criar a recompensa.', variant: 'destructive' });
    },
  });
}

export function useDeleteReward() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rewardId: string) => {
      const { error } = await supabase.from('rewards').delete().eq('id', rewardId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
      toast({ title: 'Recompensa removida', description: 'A recompensa foi eliminada.' });
    },
    onError: () => {
      toast({ title: 'Erro', description: 'Não foi possível remover.', variant: 'destructive' });
    },
  });
}
