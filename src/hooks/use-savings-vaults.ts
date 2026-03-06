import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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

function mapRow(row: any): SavingsVault {
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
      let query = supabase.from('savings_vaults').select('*').order('created_at', { ascending: false });

      if (profileId) {
        query = query.eq('profile_id', profileId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []).map(mapRow);
    },
    enabled: !!user,
  });
}

export function useCreateSavingsVault() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: { name: string; icon?: string; targetAmount: number; interestRate?: number }) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase.from('savings_vaults').insert({
        profile_id: user.profileId,
        household_id: user.householdId,
        name: input.name,
        icon: input.icon ?? '🐷',
        target_amount: input.targetAmount,
        interest_rate: input.interestRate ?? 1,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['savings-vaults'] }),
  });
}

export function useDepositToVault() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ vaultId, amount }: { vaultId: string; amount: number }) => {
      const { data, error } = await supabase.functions.invoke('vault-deposit', {
        body: { vault_id: vaultId, amount },
      });

      if (error) throw error;

      // Check for application-level errors
      if (data?.error) {
        throw new Error(data.error);
      }

      return data as { deposited: number; vault_balance: number; wallet_balance: number };
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
