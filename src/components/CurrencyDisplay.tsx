import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { getCurrencyByCountry } from '@/data/countries-currencies';

interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
  decimalPlaces: number;
}

const DEFAULT_CURRENCY: CurrencyInfo = {
  code: 'KVC',
  symbol: '🪙',
  name: 'KivaCoins',
  decimalPlaces: 0,
};

/**
 * Hook to get the user's real-money currency configuration.
 * Priority: tenant currency → profile country → AOA fallback.
 */
export function useTenantCurrency() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['tenant-currency', user?.id],
    enabled: !!user,
    staleTime: 10 * 60 * 1000,
    queryFn: async () => {
      const me = await api.get<any>('/auth/me');
      if (!me) return null;

      const tenantId: string | null = me.tenant_id ?? null;
      const country: string | null = me.country ?? null;

      let currencyCode: string | null = null;

      if (tenantId) {
        try {
          const tenant = await api.get<any>('/admin/tenants/' + tenantId);
          currencyCode = tenant?.currency ?? null;
        } catch {}
      }

      if (!currencyCode && country) {
        currencyCode = getCurrencyByCountry(country);
      }

      if (!currencyCode) currencyCode = 'AOA';

      try {
        const currencies = await api.get<any[]>('/admin/currencies');
        const currency = (currencies ?? []).find((c: any) => c.code === currencyCode && c.is_active);
        if (!currency) return null;
        return {
          code: currency.code,
          symbol: currency.symbol,
          name: currency.name,
          decimalPlaces: currency.decimal_places,
        } as CurrencyInfo;
      } catch {
        return null;
      }
    },
  });
}

/**
 * Format a numeric value as currency.
 */
function formatValue(
  amount: number,
  currency: CurrencyInfo,
  compact?: boolean
): string {
  const formatted = amount.toFixed(currency.decimalPlaces);

  // Add thousands separators
  const [intPart, decPart] = formatted.split('.');
  const withSeparators = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  const numStr = decPart ? `${withSeparators}.${decPart}` : withSeparators;

  if (compact && amount >= 1000) {
    const compactNum =
      amount >= 1_000_000
        ? `${(amount / 1_000_000).toFixed(1)}M`
        : `${(amount / 1000).toFixed(1)}k`;
    return `${currency.symbol} ${compactNum}`;
  }

  return `${currency.symbol} ${numStr}`;
}

// ─── Component Props ───────────────────────────────────────

interface CurrencyDisplayProps {
  /** The numeric amount to display */
  amount: number;
  /** Force a specific currency type instead of auto-detecting from tenant */
  type?: 'virtual' | 'real';
  /** Use compact notation for large numbers (1.2k, 3.4M) */
  compact?: boolean;
  /** Show the currency code after the value (e.g. "100 USD") */
  showCode?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Text size variant */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Show a pill/badge style with background */
  badge?: boolean;
}

const sizeClasses = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg font-semibold',
  xl: 'text-2xl font-bold',
};

/**
 * Displays a formatted currency value, automatically using the tenant's
 * real-money currency or the virtual KivaCoin format.
 *
 * Virtual (KivaCoins): golden coin styling 🪙
 * Real money: uses the tenant's currency symbol with distinct styling
 *
 * ```tsx
 * <CurrencyDisplay amount={42.5} type="virtual" />        // 🪙 43
 * <CurrencyDisplay amount={1500} type="real" />            // Kz 1 500.00
 * <CurrencyDisplay amount={1500} type="real" badge />      // [Kz 1 500.00] with bg
 * ```
 */
export default function CurrencyDisplay({
  amount,
  type = 'virtual',
  compact = false,
  showCode = false,
  className,
  size = 'md',
  badge = false,
}: CurrencyDisplayProps) {
  const { data: tenantCurrency } = useTenantCurrency();

  const currency =
    type === 'real' && tenantCurrency ? tenantCurrency : DEFAULT_CURRENCY;

  const display = formatValue(amount, currency, compact);

  const isVirtual = type === 'virtual';

  if (badge) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 px-2 py-0.5 rounded-lg font-display tabular-nums whitespace-nowrap',
          isVirtual
            ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
            : 'bg-primary/10 text-primary dark:bg-primary/20',
          sizeClasses[size],
          className
        )}
      >
        {display}
        {showCode && (
          <span className="text-[0.75em] opacity-60">{currency.code}</span>
        )}
      </span>
    );
  }

  return (
    <span
      className={cn(
        sizeClasses[size],
        isVirtual
          ? 'text-amber-600 dark:text-amber-400'
          : 'text-primary',
        'tabular-nums whitespace-nowrap font-display',
        className
      )}
    >
      {display}
      {showCode && (
        <span className="ml-1 text-muted-foreground text-[0.75em]">
          {currency.code}
        </span>
      )}
    </span>
  );
}
