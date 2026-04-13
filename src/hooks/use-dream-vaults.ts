import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface DreamComment {
  id: string;
  text: string;
  emoji: string;
  createdAt: string;
}

export interface DreamVault {
  id: string;
  profileId: string;
  householdId: string | null;
  title: string;
  description: string | null;
  icon: string;
  targetAmount: number;
  currentAmount: number;
  priority: 'high' | 'medium' | 'low';
  createdAt: string;
  parentComments: DreamComment[];
}

interface DreamCommentResponse {
  id: string;
  text: string;
  emoji: string;
  created_at: string;
}

interface DreamVaultResponse {
  id: string;
  profile_id: string;
  household_id: string | null;
  title: string;
  description: string | null;
  icon: string;
  target_amount: number;
  current_amount: number;
  priority: 'high' | 'medium' | 'low';
  created_at: string;
  comments?: DreamCommentResponse[];
}

interface ContributeResponse {
  contributed: number;
  vault_balance: number;
  wallet_balance: number;
}

function mapRow(row: DreamVaultResponse): DreamVault {
  return {
    id: row.id,
    profileId: row.profile_id,
    householdId: row.household_id,
    title: row.title,
    description: row.description,
    icon: row.icon,
    targetAmount: Number(row.target_amount),
    currentAmount: Number(row.current_amount),
    priority: row.priority,
    createdAt: row.created_at,
    parentComments: (row.comments ?? []).map((c) => ({
      id: c.id,
      text: c.text,
      emoji: c.emoji ?? '💬',
      createdAt: c.created_at,
    })),
  };
}

export function useDreamVaults(profileId?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['dream-vaults', profileId ?? user?.profileId],
    queryFn: async () => {
      const queryParams = profileId ? `?profile_id=${profileId}` : '';
      const data = await api.get<DreamVaultResponse[]>(`/dream-vaults${queryParams}`);
      return data.map(mapRow);
    },
    enabled: !!user,
  });
}

export function useCreateDreamVault() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: { title: string; description?: string; icon?: string; targetAmount: number; priority?: string }) => {
      if (!user) throw new Error('Not authenticated');
      await api.post('/dream-vaults', {
        profile_id: user.profileId,
        household_id: user.householdId,
        title: input.title,
        description: input.description ?? null,
        icon: input.icon ?? '✨',
        target_amount: input.targetAmount,
        priority: input.priority ?? 'medium',
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['dream-vaults'] }),
  });
}

export function useAddDreamComment() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ dreamVaultId, text, emoji }: { dreamVaultId: string; text: string; emoji?: string }) => {
      if (!user) throw new Error('Not authenticated');
      await api.post(`/dream-vaults/${dreamVaultId}/comments`, {
        text,
        emoji: emoji ?? '💬',
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['dream-vaults'] }),
  });
}

export function useDeleteDreamComment() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ dreamVaultId, commentId }: { dreamVaultId: string; commentId: string }) => {
      await api.delete(`/dream-vaults/${dreamVaultId}/comments/${commentId}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['dream-vaults'] }),
  });
}

export function useGetDreamComments(dreamVaultId: string) {
  return useQuery({
    queryKey: ['dream-vault-comments', dreamVaultId],
    queryFn: async () => {
      const data = await api.get<DreamCommentResponse[]>(`/dream-vaults/${dreamVaultId}/comments`);
      return data.map((c) => ({
        id: c.id,
        text: c.text,
        emoji: c.emoji ?? '💬',
        createdAt: c.created_at,
      }));
    },
    enabled: !!dreamVaultId,
  });
}

export function useDepositToDream() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ dreamId, amount }: { dreamId: string; amount: number }) => {
      const data = await api.post<ContributeResponse>(`/dream-vaults/${dreamId}/contribute`, { amount });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dream-vaults'] });
      qc.invalidateQueries({ queryKey: ['wallet'] });
      qc.invalidateQueries({ queryKey: ['wallet-balance'] });
      qc.invalidateQueries({ queryKey: ['wallet-transactions'] });
      qc.invalidateQueries({ queryKey: ['profile-balance'] });
      toast({
        title: 'Contribuição realizada! ✨',
        description: 'Estás mais perto de realizar o teu sonho!',
      });
    },
    onError: (err: Error) => {
      const msg = err.message.includes('Saldo insuficiente')
        ? 'Não tens KivaCoins suficientes para esta contribuição.'
        : 'Não foi possível realizar a contribuição.';
      toast({ title: 'Erro', description: msg, variant: 'destructive' });
    },
  });
}

export function useUpdateDreamVault() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ dreamId, updates }: { dreamId: string; updates: Partial<DreamVaultResponse> }) => {
      await api.patch(`/dream-vaults/${dreamId}`, updates);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dream-vaults'] });
    },
  });
}

export function useDeleteDreamVault() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (dreamId: string) => {
      await api.delete(`/dream-vaults/${dreamId}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dream-vaults'] });
      toast({ title: 'Sonho eliminado 🗑️', description: 'O sonho foi removido com sucesso.' });
    },
    onError: () => {
      toast({ title: 'Erro', description: 'Não foi possível eliminar o sonho.', variant: 'destructive' });
    },
  });
}
