import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Crown, Check, ArrowDown, Sparkles, Shield, AlertTriangle, Receipt, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { useAllFeatures } from '@/hooks/use-feature-gate';
import { useSubscriptionTiers, useUpgradeSubscription, useInvoices } from '@/hooks/use-subscription';
import PaymentSimulator from '@/components/PaymentSimulator';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useTenantCurrency } from '@/components/CurrencyDisplay';
import { useExchangeRates, formatPrice } from '@/hooks/use-exchange-rates';
import { useRegionalPrices, getRegionalPrice } from '@/hooks/use-regional-prices';
import { useT } from '@/contexts/LanguageContext';

const ALL_FEATURE_KEYS = [
  'basic_wallet', 'basic_tasks', 'savings_vaults', 'dream_vaults',
  'custom_rewards', 'budget_exceptions', 'multi_child', 'advanced_analytics',
  'export_reports', 'real_money_wallet', 'priority_support',
];

export default function ParentSubscription() {
  const t = useT();
  const { enabledFeatures, tierName, loading: gateLoading } = useAllFeatures();
  const { data: tiers = [], isLoading: tiersLoading } = useSubscriptionTiers();
  const { upgrade, loading: upgradeLoading } = useUpgradeSubscription();
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [downgradeOpen, setDowngradeOpen] = useState(false);
  const [downgradeTarget, setDowngradeTarget] = useState<typeof tiers[0] | null>(null);
  const { data: tenantCurrency } = useTenantCurrency();
  const { data: rates = [] } = useExchangeRates();
  const { data: regionalPrices = [] } = useRegionalPrices();

  const sym = tenantCurrency?.symbol ?? 'Kz';
  const code = tenantCurrency?.code ?? 'AOA';
  const dec = tenantCurrency?.decimalPlaces ?? 0;
  const fmtP = (tierId: string, usdAmount: number, field: 'price_monthly' | 'price_yearly' = 'price_monthly') =>
    formatPrice(getRegionalPrice(tierId, field, usdAmount, code, regionalPrices, rates), sym, dec);

  const familyTiers = tiers.filter(t => t.tierType === 'free' || t.tierType === 'family_premium');
  const currentTier = familyTiers.find((t) => t.name === tierName);
  const currentIndex = familyTiers.findIndex((t) => t.name === tierName);
  const lowerTiers = familyTiers.filter((_, i) => i < currentIndex);
  const isFreeTier = !tierName || tierName === 'Free' || tierName === 'Gratuito' || currentIndex <= 0;

  const handleDowngrade = async () => {
    if (!downgradeTarget) return;
    try {
      await upgrade(downgradeTarget.id);
      setDowngradeOpen(false);
      setDowngradeTarget(null);
    } catch {}
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Current Plan Hero */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-primary via-primary/90 to-accent text-primary-foreground">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl" />
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Crown className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest opacity-70">{t('parent.subscription.current_plan')}</p>
                  <h1 className="font-display text-2xl font-bold">
                    {gateLoading ? '...' : tierName ?? t('parent.subscription.free')}
                  </h1>
                  {currentTier && (
                    <p className="text-sm opacity-80 mt-0.5">
                      {currentTier.priceMonthly > 0
                        ? `${fmtP(currentTier.id, currentTier.priceMonthly)}/${t('parent.subscription.month')}`
                        : t('parent.subscription.free')}
                    </p>
                  )}
                </div>
              </div>
              <Badge className="bg-white/20 text-white border-0 font-display">
                <Shield className="h-3 w-3 mr-1" /> {t('parent.subscription.active')}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Features List */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-4 w-4 text-primary" />
              <h2 className="font-display font-semibold">{t('parent.subscription.features')}</h2>
            </div>

            <div className="grid gap-2">
              {ALL_FEATURE_KEYS.map((feature) => {
                const included = enabledFeatures.includes(feature);
                return (
                  <div
                    key={feature}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors',
                      included ? 'bg-primary/5' : 'bg-muted/30 opacity-50'
                    )}
                  >
                    <div
                      className={cn(
                        'w-6 h-6 rounded-lg flex items-center justify-center shrink-0',
                        included
                          ? 'bg-primary/15 text-primary'
                          : 'bg-muted text-muted-foreground'
                      )}
                    >
                      {included ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        <span className="text-[10px] font-bold">—</span>
                      )}
                    </div>
                    <span className={cn('text-sm', included ? 'font-medium' : 'text-muted-foreground')}>
                      {t(`feature.${feature}`)}
                    </span>
                    {!included && (
                      <Badge variant="outline" className="ml-auto text-[10px] border-accent/30 text-accent-foreground">
                        Premium
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Actions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-3">
        <Button
          onClick={() => setPaymentOpen(true)}
          className="w-full rounded-xl font-display h-12 text-base gap-2 bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          <Crown className="h-4 w-4" /> {t('parent.subscription.upgrade')}
        </Button>

        {!isFreeTier && lowerTiers.length > 0 && (
          <div className="space-y-2">
            <Separator />
            <p className="text-xs text-muted-foreground text-center">{t('parent.subscription.or_lower')}</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {lowerTiers.map((tier) => (
                <Button
                  key={tier.id}
                  variant="outline"
                  size="sm"
                  className="rounded-xl text-xs gap-1.5"
                  onClick={() => {
                    setDowngradeTarget(tier);
                    setDowngradeOpen(true);
                  }}
                >
                  <ArrowDown className="h-3 w-3" />
                  {tier.name}
                </Button>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      <PaymentSimulator
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
        currentTierName={tierName}
        tiers={familyTiers}
        onConfirmUpgrade={upgrade}
      />

      {/* Downgrade Confirmation Dialog */}
      <Dialog open={downgradeOpen} onOpenChange={setDowngradeOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              {t('parent.subscription.confirm_downgrade')}
            </DialogTitle>
            <DialogDescription>
              {t('parent.subscription.downgrade_desc_pre')} <strong>{downgradeTarget?.name}</strong>{t('parent.subscription.downgrade_desc_post')}
            </DialogDescription>
          </DialogHeader>

          {downgradeTarget && (
            <div className="space-y-2 py-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {t('parent.subscription.losing_features')}
              </p>
              {enabledFeatures
                .filter((f) => !downgradeTarget.features.includes(f))
                .map((f) => (
                  <div key={f} className="flex items-center gap-2 text-sm text-destructive/80">
                    <span>✕</span>
                    <span>{t(`feature.${f}`)}</span>
                  </div>
                ))}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDowngradeOpen(false)} className="rounded-xl">
              {t('parent.subscription.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDowngrade}
              disabled={upgradeLoading}
              className="rounded-xl font-display gap-1.5"
            >
              <ArrowDown className="h-3.5 w-3.5" />
              {upgradeLoading ? t('parent.subscription.processing') : t('parent.subscription.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
