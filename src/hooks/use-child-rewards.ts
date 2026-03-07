import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { notifyRewardClaimed } from '@/lib/notify';
import type { RewardCategory } from '@/hooks/use-rewards';

export interface ChildReward {
  id: string;
  name: string;
  description: string | null;
  price: number;
  icon: string;
  category: RewardCategory;
  available: boolean;
  claimedBy: string | null;
  claimedAt: string | null;
  parentProfileId: string;
}

export function useChildRewards() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['child-rewards', user?.profileId],
    queryFn: async (): Promise<ChildReward[]> => {
      if (!user?.profileId) return [];

      const { data, error } = await supabase
        .from('rewards')
        .select('*')
        .eq('available', true)
        .is('claimed_by', null)
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
        parentProfileId: r.parent_profile_id,
      }));
    },
    enabled: !!user?.profileId && (user?.role === 'child' || user?.role === 'teen'),
  });
}

export function useClaimReward() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (reward: { id: string; name: string; price: number; parentProfileId?: string }) => {
      const { data, error } = await supabase.functions.invoke('claim-reward', {
        body: { reward_id: reward.id },
      });

      if (error) throw new Error(error.message || 'Erro ao resgatar');
      if (data?.error) throw new Error(data.error);

      return data as { success: boolean; new_balance: number; reward_name: string };
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['child-rewards'] });
      queryClient.invalidateQueries({ queryKey: ['wallet-balance'] });
      queryClient.invalidateQueries({ queryKey: ['wallet-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['children'] });
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
      // Notify parent about the claim
      if (variables.parentProfileId) {
        notifyRewardClaimed(variables.parentProfileId, user?.name ?? 'O teu filho', data.reward_name, variables.price);
      }
      toast({
        title: 'Recompensa resgatada! 🎉',
        description: `Parabéns! Resgataste "${data.reward_name}". Novo saldo: ${data.new_balance} KVC.`,
      });
    },
    onError: (err: any) => {
      toast({ title: 'Erro ao resgatar', description: err.message, variant: 'destructive' });
    },
  });
}
