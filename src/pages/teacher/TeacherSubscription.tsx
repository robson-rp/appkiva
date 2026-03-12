import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Crown, Check, Sparkles, Shield, Users, GraduationCap } from 'lucide-react';
import { useSubscriptionTiers, useUpgradeSubscription } from '@/hooks/use-subscription';
import { useTeacherLimits } from '@/hooks/use-teacher-limits';
import { useTenantCurrency } from '@/components/CurrencyDisplay';
import { useExchangeRates, formatPrice } from '@/hooks/use-exchange-rates';
import { useRegionalPrices, getRegionalPrice } from '@/hooks/use-regional-prices';
import PaymentSimulator from '@/components/PaymentSimulator';
import { cn } from '@/lib/utils';
import { useT } from '@/contexts/LanguageContext';

const FEATURE_LABELS_KEYS: Record<string, string> = {
  basic_wallet: 'feature.basic_wallet',
  basic_tasks: 'feature.basic_tasks',
  classroom_mode: 'feature.classroom_mode',
  advanced_analytics: 'feature.advanced_analytics',
  export_reports: 'feature.export_reports',
  priority_support: 'feature.priority_support',
};

const TIER_ICONS: Record<string, string> = {
  'Professor Gratuito': '📚',
  'Professor Premium': '🎓',
};

export default function TeacherSubscription() {
  const t = useT();
  const limits = useTeacherLimits();
  const { data: allTiers = [], isLoading } = useSubscriptionTiers();
  const { upgrade, loading: upgradeLoading } = useUpgradeSubscription();
  const [paymentOpen, setPaymentOpen] = useState(false);
  const { data: tenantCurrency } = useTenantCurrency();
  const { data: rates = [] } = useExchangeRates();
  const { data: regionalPrices = [] } = useRegionalPrices();

  const currencySymbol = tenantCurrency?.symbol ?? 'Kz';
  const currencyCode = tenantCurrency?.code ?? 'AOA';
  const dec = tenantCurrency?.decimalPlaces ?? 0;

  const localPrice = (tierId: string, usdAmount: number, field: 'price_monthly' | 'price_yearly' = 'price_monthly') => {
    const converted = getRegionalPrice(tierId, field, usdAmount, currencyCode, regionalPrices, rates);
    return formatPrice(converted, currencySymbol, dec);
  };

  const teacherTiers = allTiers.filter(t => t.tierType === 'teacher');
  const currentTierIndex = teacherTiers.findIndex(t => t.name === limits.tierName);

  if (isLoading || limits.loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Current Plan Hero */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-primary via-primary/90 to-accent text-primary-foreground">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl">
                  {TIER_ICONS[limits.tierName] ?? '📋'}
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest opacity-70">{t('teacher.subscription.current_plan')}</p>
                  <h1 className="font-display text-2xl font-bold">{limits.tierName}</h1>
                  <p className="text-sm opacity-80 mt-0.5">
                    {limits.priceMonthly > 0
                      ? `${localPrice(teacherTiers.find(tier => tier.name === limits.tierName)?.id ?? '', limits.priceMonthly)}/${t('common.month_short')}`
                      : t('teacher.subscription.free')}
                  </p>
                </div>
              </div>
              <Badge className="bg-white/20 text-white border-0 font-display">
                <Shield className="h-3 w-3 mr-1" /> {t('teacher.subscription.active')}
              </Badge>
            </div>

            {/* Usage bars */}
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="opacity-70">{t('teacher.subscription.classrooms')}</span>
                  <span className="font-bold">{limits.usedClassrooms}/{limits.maxClassrooms}</span>
                </div>
                <Progress
                  value={(limits.usedClassrooms / limits.maxClassrooms) * 100}
                  className="h-2 bg-white/20 [&>div]:bg-white"
                />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="opacity-70">{t('teacher.subscription.students')}</span>
                  <span className="font-bold">{limits.usedStudents}/{limits.maxStudents}</span>
                </div>
                <Progress
                  value={(limits.usedStudents / limits.maxStudents) * 100}
                  className="h-2 bg-white/20 [&>div]:bg-white"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Plans Comparison */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <h2 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" /> {t('teacher.subscription.compare_plans')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teacherTiers.map((tier, idx) => {
            const isCurrent = tier.name === limits.tierName;
            const isUpgrade = idx > currentTierIndex;
            return (
              <Card
                key={tier.id}
                className={cn(
                  'rounded-2xl transition-all',
                  isCurrent
                    ? 'border-primary ring-2 ring-primary/20'
                    : 'border-border/50 hover:shadow-md'
                )}
              >
                <CardContent className="p-5 space-y-4">
                  <div className="text-center">
                    <span className="text-3xl">{TIER_ICONS[tier.name] ?? '📋'}</span>
                    <h3 className="font-display font-bold mt-2">{tier.name}</h3>
                    <p className="text-2xl font-bold text-foreground mt-1">
                      {tier.priceMonthly > 0 ? localPrice(tier.id, tier.priceMonthly) : t('teacher.subscription.free')}
                      {tier.priceMonthly > 0 && <span className="text-xs text-muted-foreground font-normal">/{t('common.month_short')}</span>}
                    </p>
                    {isCurrent && (
                      <Badge className="mt-2 bg-primary/10 text-primary border-0 text-[10px]">
                        <Crown className="h-3 w-3 mr-1" /> {t('teacher.subscription.current')}
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="h-3.5 w-3.5 text-primary" />
                      <span>{t('teacher.subscription.up_to_students').replace('{count}', String(tier.maxChildren))}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-3.5 w-3.5 text-primary" />
                      <span>{t('teacher.subscription.up_to_classrooms').replace('{count}', String(tier.name.includes('Premium') ? '20' : '3'))}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    {tier.features.map(f => (
                      <div key={f} className="flex items-center gap-2 text-xs">
                        <Check className="h-3 w-3 text-primary shrink-0" />
                        <span>{t(FEATURE_LABELS_KEYS[f] ?? f)}</span>
                      </div>
                    ))}
                  </div>

                  {isUpgrade && (
                    <Button
                      onClick={() => setPaymentOpen(true)}
                      className="w-full rounded-xl font-display gap-1.5"
                      size="sm"
                    >
                      <Crown className="h-3.5 w-3.5" /> {t('teacher.subscription.upgrade')}
                    </Button>
                  )}
                  {isCurrent && (
                    <Button disabled variant="outline" className="w-full rounded-xl" size="sm">
                      {t('teacher.subscription.current')}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </motion.div>

      <PaymentSimulator
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
        currentTierName={limits.tierName}
        tiers={teacherTiers}
        onConfirmUpgrade={upgrade}
      />
    </div>
  );
}
