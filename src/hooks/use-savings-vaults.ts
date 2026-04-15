import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface SavingsVault {
  id: string;
  profileId: string;
  householdId: string | null;
  name: string;
  icon: string;
  targetAmount: number;
  currentAmount: number;
  interestRate: number;
  createdAt: string;
}

interface SavingsVaultResponse {
  id: string;
  profile_id: string;
  household_id: string | null;
  name: string;
  icon: string;
  target_amount: number;
  current_amount: number;
  interest_rate: number;
  created_at: string;
}

interface DepositResponse {
  deposited: number;
  vault_balance: number;
  wallet_balance: number;
}

interface WithdrawResponse {
  withdrawn: number;
  vault_balance: number;
  wallet_balance: number;
}

function mapRow(row: SavingsVaultResponse): SavingsVault {
  return {
    id: row.id,
    profileId: row.profile_id,
    householdId: row.household_id,
    name: row.name,
    icon: row.icon,
    targetAmount: Number(row.target_amount),
    currentAmount: Number(row.current_amount),
    interestRate: Number(row.interest_rate),
    createdAt: row.created_at,
  };
}

export function useSavingsVaults(profileId?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['savings-vaults', profileId ?? user?.profileId],
    queryFn: async () => {
      const queryParams = profileId ? `?profile_id=${profileId}` : '';
      const res = await api.get<any>(`/savings-vaults${queryParams}`);
      const items = Array.isArray(res) ? res : (res?.data ?? []);
      return items.map(mapRow);
    },
    enabled: !!user,
  });
}

export function useCreateSavingsVault() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: { name: string; icon?: string; targetAmount: number; interestRate?: number; profileId?: string }) => {
      if (!user) throw new Error('Not authenticated');
      const targetProfileId = input.profileId || user.profileId;
      await api.post('/savings-vaults', {
        profile_id: targetProfileId,
        household_id: user.householdId,
        name: input.name,
        icon: input.icon ?? '🐷',
        target_amount: input.targetAmount,
        interest_rate: input.interestRate ?? 1,
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['savings-vaults'] }),
  });
}

export function useDepositToVault() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ vaultId, amount }: { vaultId: string; amount: number }) => {
      const data = await api.post<DepositResponse>(`/savings-vaults/${vaultId}/deposit`, { amount });
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['savings-vaults'] });
      qc.invalidateQueries({ queryKey: ['wallet-balance'] });
      qc.invalidateQueries({ queryKey: ['wallet-transactions'] });
      toast({
        title: 'Depósito realizado! 🐷',
        description: `Depositaste ${data.deposited} KivaCoins no cofre.`,
      });
    },
    onError: (err: Error) => {
      const msg = err.message.includes('Saldo insuficiente')
        ? 'Não tens KivaCoins suficientes para este depósito.'
        : 'Não foi possível realizar o depósito.';
      toast({ title: 'Erro', description: msg, variant: 'destructive' });
    },
  });
}

export function useWithdrawFromVault() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ vaultId, amount }: { vaultId: string; amount: number }) => {
      const data = await api.post<WithdrawResponse>(`/savings-vaults/${vaultId}/withdraw`, { amount });
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['savings-vaults'] });
      qc.invalidateQueries({ queryKey: ['wallet-balance'] });
      qc.invalidateQueries({ queryKey: ['wallet-transactions'] });
      toast({
        title: 'Levantamento realizado! 💰',
        description: `Levantaste ${data.withdrawn} KivaCoins do cofre.`,
      });
    },
    onError: (err: Error) => {
      const msg = err.message.includes('vazio')
        ? 'O cofre está vazio.'
        : 'Não foi possível realizar o levantamento.';
      toast({ title: 'Erro', description: msg, variant: 'destructive' });
    },
  });
}

export function useUpdateVaultInterestRate() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ vaultId, interestRate }: { vaultId: string; interestRate: number }) => {
      await api.patch(`/savings-vaults/${vaultId}`, { interest_rate: interestRate });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['savings-vaults'] });
    },
  });
}

export function useDeleteSavingsVault() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (vaultId: string) => {
      await api.delete(`/savings-vaults/${vaultId}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['savings-vaults'] });
      toast({ title: 'Cofre eliminado 🗑️', description: 'O cofre foi removido com sucesso.' });
    },
    onError: () => {
      toast({ title: 'Erro', description: 'Não foi possível eliminar o cofre.', variant: 'destructive' });
    },
  });
}

export function useHouseholdVaults() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['savings-vaults', 'household'],
    queryFn: async () => {
      const data = await api.get<SavingsVaultResponse[]>('/savings-vaults');
      return data.map(mapRow);
    },
    enabled: !!user,
  });
}
