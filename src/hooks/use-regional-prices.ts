import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { convertPrice, type ExchangeRate } from '@/hooks/use-exchange-rates';

export interface RegionalPrice {
  id: string;
  tier_id: string;
  currency_code: string;
  price_monthly: number;
  price_yearly: number;
  extra_child_price: number;
}

export function useRegionalPrices() {
  return useQuery({
    queryKey: ['tier-regional-prices'],
    staleTime: 30 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tier_regional_prices')
        .select('id, tier_id, currency_code, price_monthly, price_yearly, extra_child_price');
      if (error) throw error;
      return (data ?? []) as RegionalPrice[];
    },
  });
}

/**
 * Get the regional price for a tier in a specific currency.
 * If a fixed regional price exists, use it. Otherwise fall back to dynamic conversion.
 */
export function getRegionalPrice(
  tierId: string,
  field: 'price_monthly' | 'price_yearly' | 'extra_child_price',
  usdAmount: number,
  currencyCode: string,
  regionalPrices: RegionalPrice[],
  rates: ExchangeRate[]
): number {
  const override = regionalPrices.find(
    (rp) => rp.tier_id === tierId && rp.currency_code === currencyCode
  );
  if (override) return override[field];
  return convertPrice(usdAmount, 'USD', currencyCode, rates);
}

// ── Admin CRUD mutations ──

export function useUpsertRegionalPrice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (row: Omit<RegionalPrice, 'id'> & { id?: string }) => {
      const { error } = await supabase
        .from('tier_regional_prices')
        .upsert(
          {
            tier_id: row.tier_id,
            currency_code: row.currency_code,
            price_monthly: row.price_monthly,
            price_yearly: row.price_yearly,
            extra_child_price: row.extra_child_price,
          },
          { onConflict: 'tier_id,currency_code' }
        );
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tier-regional-prices'] }),
  });
}

export function useDeleteRegionalPrice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('tier_regional_prices').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tier-regional-prices'] }),
  });
}
