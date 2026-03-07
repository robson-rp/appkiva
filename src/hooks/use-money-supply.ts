import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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
      const { data, error } = await supabase.rpc('get_money_supply_stats');
      if (error) throw error;
      return data as unknown as MoneySupplyStats;
    },
    refetchInterval: 30000, // refresh every 30s
  });
}
