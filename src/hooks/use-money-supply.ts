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
      const res = await api.get<{ data: { money_supply?: MoneySupplyStats } }>('/admin/stats');
      const ms = res?.data?.money_supply;
      return ms ?? {
        total_emitted: 0, total_burned: 0, total_in_circulation: 0,
        total_in_wallets: 0, total_in_vaults: 0, wallet_count: 0,
        system_wallet_id: '', audit_timestamp: new Date().toISOString(),
      };
    },
    refetchInterval: 30000,
  });
}
