import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface BudgetExceptionRequest {
  id: string;
  child_profile_id: string;
  parent_profile_id: string;
  reward_id: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  reason: string | null;
  resolved_at: string | null;
  resolved_by: string | null;
  created_at: string;
  // Joined fields
  reward_name?: string;
  reward_icon?: string;
  child_name?: string;
}

interface BudgetExceptionResponse {
  data: BudgetExceptionRequest | BudgetExceptionRequest[];
}

interface PendingExceptionResponse {
  data: {
    id: string;
    status: string;
  } | null;
}

/** Child: check if there's already a pending request for a reward */
export function usePendingExceptionForReward(rewardId: string | undefined) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['budget-exception', 'pending', rewardId, user?.profileId],
    queryFn: async () => {
      if (!user?.profileId || !rewardId) return null;
      
      const response = await api.get<PendingExceptionResponse>(
        `/wallets/budget-exceptions?reward_id=${rewardId}&status=pending`
      );
      
      return response.data;
    },
    enabled: !!user?.profileId && !!rewardId,
  });
}

/** Child: create an exception request */
export function useRequestBudgetException() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      childProfileId: string;
      parentProfileId: string;
      rewardId: string;
      amount: number;
      reason?: string;
    }) => {
      const response = await api.post<BudgetExceptionResponse>('/wallets/budget-exceptions', {
        child_profile_id: params.childProfileId,
        parent_profile_id: params.parentProfileId,
        reward_id: params.rewardId,
        amount: params.amount,
        reason: params.reason ?? null,
      });

      return response.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['budget-exception'] });
      toast({
        title: 'Pedido enviado! 📩',
        description: 'O teu encarregado vai receber o pedido de autorização.',
      });
    },
    onError: () => {
      toast({ title: 'Erro', description: 'Não foi possível enviar o pedido.', variant: 'destructive' });
    },
  });
}

/** Parent: list pending exceptions for their household */
export function usePendingBudgetExceptions() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['budget-exceptions-pending', user?.profileId],
    queryFn: async (): Promise<BudgetExceptionRequest[]> => {
      if (!user?.profileId) return [];

      const response = await api.get<BudgetExceptionResponse>(
        '/wallets/budget-exceptions?status=pending'
      );

      return Array.isArray(response.data) ? response.data : [];
    },
    enabled: !!user?.profileId && user?.role === 'parent',
  });
}

/** Parent: approve or reject */
export function useResolveBudgetException() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { requestId: string; action: 'approve' | 'reject' }) => {
      const response = await api.patch<{ reward_name?: string }>(
        `/wallets/budget-exceptions/${params.requestId}`,
        { action: params.action }
      );
      return response;
    },
    onSuccess: (data, variables) => {
      qc.invalidateQueries({ queryKey: ['budget-exceptions-pending'] });
      qc.invalidateQueries({ queryKey: ['budget-exception'] });
      qc.invalidateQueries({ queryKey: ['child-rewards'] });
      qc.invalidateQueries({ queryKey: ['wallet-balance'] });
      qc.invalidateQueries({ queryKey: ['rewards'] });
      toast({
        title: variables.action === 'approve' ? 'Exceção aprovada! ✅' : 'Pedido recusado',
        description: variables.action === 'approve'
          ? `Recompensa "${data.reward_name}" resgatada com sucesso.`
          : 'O pedido foi recusado.',
      });
    },
    onError: (err: any) => {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    },
  });
}
