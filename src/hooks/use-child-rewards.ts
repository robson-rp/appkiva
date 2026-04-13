import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
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

interface ChildRewardResponse {
  id: string;
  name: string;
  description: string | null;
  price: number;
  icon: string;
  category: RewardCategory;
  available: boolean;
  claimed_by: string | null;
  claimed_at: string | null;
  parent_profile_id: string;
}

export function useChildRewards() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['child-rewards', user?.profileId],
    queryFn: async (): Promise<ChildReward[]> => {
      if (!user?.profileId) return [];

      const response = await api.get<{ data: ChildRewardResponse[] }>('/rewards?available=true');

      return response.data
        .filter((r) => !r.claimed_by)
        .map((r) => ({
          id: r.id,
          name: r.name,
          description: r.description,
          price: Number(r.price) || 0,
          icon: r.icon,
          category: r.category,
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
      const response = await api.post<{ data: { name: string; price: number; claimed_by: string } }>(`/rewards/${reward.id}/claim`);
      
      return {
        success: true,
        reward_name: response.data.name,
        new_balance: 0,
      };
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['child-rewards'] });
      queryClient.invalidateQueries({ queryKey: ['wallet-balance'] });
      queryClient.invalidateQueries({ queryKey: ['wallet-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['children'] });
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
      
      if (variables.parentProfileId) {
        notifyRewardClaimed(variables.parentProfileId, user?.name ?? 'O teu filho', data.reward_name, variables.price);
      }
      toast({
        title: 'Recompensa resgatada! 🎉',
        description: `Parabéns! Resgataste "${data.reward_name}".`,
      });
    },
    onError: (err: any) => {
      toast({ title: 'Erro ao resgatar', description: err.message, variant: 'destructive' });
    },
  });
}
