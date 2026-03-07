import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ExchangeRate {
  base_currency: string;
  target_currency: string;
  rate: number;
}

export function useExchangeRates() {
  return useQuery({
    queryKey: ['exchange-rates'],
    staleTime: 30 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('currency_exchange_rates')
        .select('base_currency, target_currency, rate');
      if (error) throw error;
      return (data ?? []) as ExchangeRate[];
    },
  });
}

/**
 * Convert a price from one currency to another using exchange rates.
 * All rates are stored as EUR → target, so we convert via EUR as intermediary.
 */
export function convertPrice(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  rates: ExchangeRate[]
): number {
  if (fromCurrency === toCurrency) return amount;

  const fromRate = rates.find(r => r.base_currency === 'EUR' && r.target_currency === fromCurrency);
  const toRate = rates.find(r => r.base_currency === 'EUR' && r.target_currency === toCurrency);

  if (!fromRate || !toRate) return amount;

  // amount in FROM → EUR → TO
  const eurAmount = amount / fromRate.rate;
  return eurAmount * toRate.rate;
}

/**
 * Format a price with a currency symbol.
 */
export function formatPrice(amount: number, symbol: string, decimals = 2): string {
  const formatted = amount.toFixed(decimals);
  const [intPart, decPart] = formatted.split('.');
  const withSeparators = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  const numStr = decPart && Number(decPart) > 0 ? `${withSeparators}.${decPart}` : withSeparators;
  return `${symbol} ${numStr}`;
}
