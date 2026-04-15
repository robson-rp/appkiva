import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

export interface ExchangeRate {
  id: string;
  base_currency: string;
  target_currency: string;
  rate: number;
}

export function useExchangeRates() {
  return useQuery({
    queryKey: ['exchange-rates'],
    staleTime: 30 * 60 * 1000,
    queryFn: async () => {
      const res = await api.get<any>('/admin/exchange-rates');
      return Array.isArray(res) ? res : (res?.data ?? []);
    },
  });
}

export function useUpdateExchangeRate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, rate }: { id: string; rate: number }) => {
      const data = await api.put<ExchangeRate>(`/admin/exchange-rates/${id}`, { rate });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['exchange-rates'] }),
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

  // All rates are stored as USD → target.
  // If converting from USD, the "from" rate is implicitly 1.
  const fromRateValue = fromCurrency === 'USD'
    ? 1
    : rates.find(r => r.base_currency === 'USD' && r.target_currency === fromCurrency)?.rate;

  const toRateValue = toCurrency === 'USD'
    ? 1
    : rates.find(r => r.base_currency === 'USD' && r.target_currency === toCurrency)?.rate;

  if (!fromRateValue || !toRateValue) return amount;

  // amount in FROM → USD → TO
  const usdAmount = amount / fromRateValue;
  return usdAmount * toRateValue;
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
