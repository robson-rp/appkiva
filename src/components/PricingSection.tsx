import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Check, Crown, ChevronRight } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSubscriptionTiers } from '@/hooks/use-subscription';
import { useExchangeRates, formatPrice } from '@/hooks/use-exchange-rates';
import { useRegionalPrices, getRegionalPrice } from '@/hooks/use-regional-prices';
import { COUNTRY_CURRENCIES } from '@/data/countries-currencies';
import { cn } from '@/lib/utils';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};
const stagger = { visible: { transition: { staggerChildren: 0.1 } } };

// Map tier_type to display order and styling
const TIER_CONFIG: Record<string, { order: number; popular?: boolean; icon: string }> = {
  free: { order: 0, icon: '🆓' },
  family_premium: { order: 1, popular: true, icon: '👨‍👩‍👧‍👦' },
  school_institutional: { order: 2, icon: '🏫' },
};

const FEATURE_LABELS: Record<string, string> = {
  basic_wallet: 'feature.basic_wallet',
  basic_tasks: 'feature.basic_tasks',
  savings_vaults: 'feature.savings_vaults',
  dream_vaults: 'feature.dream_vaults',
  custom_rewards: 'feature.custom_rewards',
  budget_exceptions: 'feature.budget_exceptions',
  multi_child: 'feature.multi_child',
  advanced_analytics: 'feature.advanced_analytics',
  export_reports: 'feature.export_reports',
  real_money_wallet: 'feature.real_money_wallet',
  priority_support: 'feature.priority_support',
  classroom_mode: 'feature.classroom_mode',
  teacher_dashboard: 'feature.teacher_dashboard',
  custom_branding: 'feature.custom_branding',
  api_access: 'feature.api_access',
};

export default function PricingSection() {
  const { t } = useLanguage();
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');
  const [currency, setCurrency] = useState('USD');
  const { data: tiers = [] } = useSubscriptionTiers();
  const { data: rates = [] } = useExchangeRates();
  const { data: regionalPrices = [] } = useRegionalPrices();

  const currencyInfo = COUNTRY_CURRENCIES.find(c => c.currency === currency) ?? COUNTRY_CURRENCIES[0];
  const symbol = currencyInfo.currencySymbol;

  // Filter to family-facing tiers only
  const displayTiers = tiers
    .filter(tier => TIER_CONFIG[tier.tierType])
    .sort((a, b) => (TIER_CONFIG[a.tierType]?.order ?? 99) - (TIER_CONFIG[b.tierType]?.order ?? 99));

  const getPrice = (tier: typeof tiers[0]) => {
    const field = billing === 'monthly' ? 'price_monthly' : 'price_yearly';
    const usdAmount = billing === 'monthly' ? tier.priceMonthly : tier.priceYearly;
    if (usdAmount === 0) return 0;
    return getRegionalPrice(tier.id, field, usdAmount, currency === 'USD' ? 'USD' : currency, regionalPrices, rates);
  };

  // Unique currencies from COUNTRY_CURRENCIES
  const uniqueCurrencies = COUNTRY_CURRENCIES.reduce((acc, c) => {
    if (!acc.find(x => x.currency === c.currency)) acc.push(c);
    return acc;
  }, [] as typeof COUNTRY_CURRENCIES);

  return (
    <motion.section
      id="precos"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      variants={stagger}
      className="px-5 sm:px-8 lg:px-12 py-16 md:py-24 bg-muted/30"
    >
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <motion.div variants={fadeUp} className="text-center mb-10">
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-balance leading-[1.1]">
            {t('pricing.title')}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto text-balance">
            {t('pricing.subtitle')}
          </p>
        </motion.div>

        {/* Controls */}
        <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
          {/* Billing toggle */}
          <div className="flex items-center bg-card border border-border rounded-2xl p-1">
            <button
              onClick={() => setBilling('monthly')}
              className={cn(
                'px-5 py-2 rounded-xl text-sm font-semibold transition-all',
                billing === 'monthly'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {t('pricing.monthly')}
            </button>
            <button
              onClick={() => setBilling('yearly')}
              className={cn(
                'px-5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2',
                billing === 'yearly'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {t('pricing.yearly')}
              <span className="bg-accent text-accent-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
                {t('pricing.save')}
              </span>
            </button>
          </div>

          {/* Currency selector */}
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger className="w-[180px] rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {uniqueCurrencies.map(c => (
                <SelectItem key={c.currency} value={c.currency}>
                  {c.currencySymbol} {c.currency}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>

        {/* Cards */}
        <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {displayTiers.map((tier, i) => {
            const config = TIER_CONFIG[tier.tierType];
            const isPopular = config?.popular;
            const price = getPrice(tier);
            const isFree = price === 0;

            return (
              <motion.div
                key={tier.id}
                variants={fadeUp}
                whileHover={{ y: -6, boxShadow: '0 20px 40px -12px hsl(var(--primary) / 0.15)' }}
                className={cn(
                  'relative bg-card rounded-2xl border p-6 flex flex-col transition-all',
                  isPopular
                    ? 'border-primary shadow-lg ring-2 ring-primary/20 scale-[1.02]'
                    : 'border-border'
                )}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-full flex items-center gap-1">
                    <Crown className="h-3 w-3" /> {t('pricing.popular')}
                  </div>
                )}

                <div className="text-center mb-6">
                  <span className="text-3xl mb-2 block">{config?.icon}</span>
                  <h3 className="font-display text-xl font-bold">{tier.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('pricing.up_to')} {tier.maxChildren} {t('pricing.children')}
                  </p>
                </div>

                <div className="text-center mb-6">
                  {isFree ? (
                    <span className="font-display text-4xl font-bold text-primary">
                      {t('pricing.free')}
                    </span>
                  ) : (
                    <>
                      <span className="font-display text-4xl font-bold text-foreground">
                        {formatPrice(price, symbol, price >= 100 ? 0 : 2)}
                      </span>
                      <span className="text-muted-foreground text-sm">
                        {billing === 'monthly' ? t('pricing.per_month') : t('pricing.per_year')}
                      </span>
                    </>
                  )}
                </div>

                <ul className="space-y-2.5 mb-8 flex-1">
                  {tier.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>{t(FEATURE_LABELS[feat] ?? feat)}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={cn(
                    'w-full rounded-xl font-display gap-2',
                    isPopular ? '' : 'variant-outline'
                  )}
                  variant={isPopular ? 'default' : 'outline'}
                  size="lg"
                  asChild
                >
                  <Link to="/login">
                    {isFree ? t('pricing.cta_free') : t('pricing.cta')}
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </motion.section>
  );
}
