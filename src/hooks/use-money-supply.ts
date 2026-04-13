import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

export interface MoneySupplyStats {
  total_emitted: number;
  total_burned: number;
  total_in_circulation: number;
  total_in_wallets: number;
  total_in_vaults: number;
  wallet_count: number;
  system_wallet_id: string;
  audit_timestamp: string;
  error?: string;
}

export function useMoneySupply() {
  return useQuery({
    queryKey: ['money-supply-stats'],
    queryFn: async (): Promise<MoneySupplyStats> => {
      const data = await api.get<{ money_supply: MoneySupplyStats }>('/admin/stats');
      return data.money_supply;
    },
    refetchInterval: 30000,
  });
}
