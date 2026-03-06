import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface InterestEntry {
  id: string;
  amount: number;
  description: string;
  createdAt: string;
  vaultId: string | null;
  vaultName: string | null;
  interestRate: number | null;
  principal: number | null;
}

function mapRow(row: any): InterestEntry {
  const meta = row.metadata ?? {};
  return {
    id: row.id,
    amount: Number(row.amount),
    description: row.description,
    createdAt: row.created_at,
    vaultId: row.reference_id,
    vaultName: meta.vault_name ?? null,
    interestRate: meta.interest_rate ?? null,
    principal: meta.principal ?? null,
  };
}

export function useVaultInterestHistory(profileId?: string) {
  const { user } = useAuth();
  const id = profileId || user?.profileId;

  return useQuery({
    queryKey: ['vault-interest-history', id],
    queryFn: async () => {
      if (!id) return [];

      // Get wallet id
      const { data: wallet } = await supabase
        .from('wallets')
        .select('id')
        .eq('profile_id', id)
        .eq('wallet_type', 'virtual')
        .eq('currency', 'KVC')
        .maybeSingle();

      if (!wallet) return [];

      const { data, error } = await supabase
        .from('ledger_entries')
        .select('id, amount, description, created_at, metadata, reference_id')
        .eq('entry_type', 'vault_interest')
        .eq('credit_wallet_id', wallet.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return (data ?? []).map(mapRow);
    },
    enabled: !!id,
  });
}
