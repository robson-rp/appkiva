import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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
      const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id, country')
        .eq('user_id', user!.id)
        .single();

      if (!profile) return null;

      // Determine currency code: tenant overrides country
      let currencyCode: string | null = null;

      if (profile.tenant_id) {
        const { data: tenant } = await supabase
          .from('tenants')
          .select('currency')
          .eq('id', profile.tenant_id)
          .single();
        currencyCode = tenant?.currency ?? null;
      }

      if (!currencyCode && profile.country) {
        currencyCode = getCurrencyByCountry(profile.country);
      }

      if (!currencyCode) currencyCode = 'AOA';

      const { data: currency } = await supabase
        .from('supported_currencies')
        .select('code, symbol, name, decimal_places')
        .eq('code', currencyCode)
        .eq('is_active', true)
        .single();

      if (!currency) return null;

      return {
        code: currency.code,
        symbol: currency.symbol,
        name: currency.name,
        decimalPlaces: currency.decimal_places,
      } as CurrencyInfo;
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
 * ```tsx
 * <CurrencyDisplay amount={42.5} type="virtual" />        // 🪙 43
 * <CurrencyDisplay amount={1500} type="real" />            // $ 1 500.00
 * <CurrencyDisplay amount={1500} type="real" compact />    // $ 1.5k
 * ```
 */
export default function CurrencyDisplay({
  amount,
  type = 'virtual',
  compact = false,
  showCode = false,
  className,
  size = 'md',
}: CurrencyDisplayProps) {
  const { data: tenantCurrency } = useTenantCurrency();

  const currency =
    type === 'real' && tenantCurrency ? tenantCurrency : DEFAULT_CURRENCY;

  const display = formatValue(amount, currency, compact);

  return (
    <span
      className={cn(
        sizeClasses[size],
        type === 'virtual' ? 'text-secondary' : 'text-primary',
        'tabular-nums whitespace-nowrap',
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
