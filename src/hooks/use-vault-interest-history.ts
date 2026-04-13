import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
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

interface InterestEntryResponse {
  id: string;
  amount: number;
  description: string;
  created_at: string;
  reference_id: string | null;
  metadata: {
    vault_name?: string;
    interest_rate?: number;
    principal?: number;
  } | null;
}

function mapRow(row: InterestEntryResponse): InterestEntry {
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

      const queryParams = `?profile_id=${id}&entry_type=vault_interest&limit=50`;
      const data = await api.get<InterestEntryResponse[]>(`/ledger-entries${queryParams}`);
      return data.map(mapRow);
    },
    enabled: !!id,
  });
}
