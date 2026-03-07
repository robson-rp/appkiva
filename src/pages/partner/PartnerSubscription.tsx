import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Crown, Check, Sparkles, Shield, Zap, Building2 } from 'lucide-react';
import { useSubscriptionTiers, useUpgradeSubscription } from '@/hooks/use-subscription';
import { usePartnerLimits } from '@/hooks/use-partner-limits';
import PaymentSimulator from '@/components/PaymentSimulator';
import { cn } from '@/lib/utils';

const FEATURE_LABELS: Record<string, string> = {
  basic_wallet: 'Carteira Básica',
  basic_tasks: 'Tarefas Básicas',
  advanced_analytics: 'Relatórios Avançados',
  export_reports: 'Exportar Relatórios',
  custom_branding: 'Marca Personalizada',
  api_access: 'Acesso API',
  priority_support: 'Suporte Prioritário',
};

const TIER_ICONS: Record<string, string> = {
  'Parceiro Starter': '🌱',
  'Parceiro Pro': '🚀',
  'Parceiro Enterprise': '🏢',
};

export default function PartnerSubscription() {
  const limits = usePartnerLimits();
  const { data: allTiers = [], isLoading } = useSubscriptionTiers();
  const { upgrade, loading: upgradeLoading } = useUpgradeSubscription();
  const [paymentOpen, setPaymentOpen] = useState(false);

  const partnerTiers = allTiers.filter(t => t.tierType === 'partner_program');
  const currentTierIndex = partnerTiers.findIndex(t => t.name === limits.tierName);

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
                  <p className="text-xs uppercase tracking-widest opacity-70">Plano actual</p>
                  <h1 className="font-display text-2xl font-bold">{limits.tierName}</h1>
                  <p className="text-sm opacity-80 mt-0.5">
                    {limits.priceMonthly > 0 ? `€${limits.priceMonthly}/mês` : 'Gratuito'}
                  </p>
                </div>
              </div>
              <Badge className="bg-white/20 text-white border-0 font-display">
                <Shield className="h-3 w-3 mr-1" /> Activo
              </Badge>
            </div>

            {/* Usage bars */}
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="opacity-70">Programas</span>
                  <span className="font-bold">
                    {limits.usedPrograms}/{limits.maxPrograms >= 99999 ? '∞' : limits.maxPrograms}
                  </span>
                </div>
                <Progress
                  value={limits.maxPrograms >= 99999 ? 5 : (limits.usedPrograms / limits.maxPrograms) * 100}
                  className="h-2 bg-white/20 [&>div]:bg-white"
                />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="opacity-70">Crianças</span>
                  <span className="font-bold">
                    {limits.usedChildren}/{limits.maxChildren >= 99999 ? '∞' : limits.maxChildren}
                  </span>
                </div>
                <Progress
                  value={limits.maxChildren >= 99999 ? 5 : (limits.usedChildren / limits.maxChildren) * 100}
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
          <Sparkles className="h-4 w-4 text-primary" /> Comparar Planos
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {partnerTiers.map((tier, idx) => {
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
                      {tier.priceMonthly > 0 ? `€${tier.priceMonthly}` : 'Grátis'}
                      {tier.priceMonthly > 0 && <span className="text-xs text-muted-foreground font-normal">/mês</span>}
                    </p>
                    {isCurrent && (
                      <Badge className="mt-2 bg-primary/10 text-primary border-0 text-[10px]">
                        <Crown className="h-3 w-3 mr-1" /> Plano Actual
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-3.5 w-3.5 text-primary" />
                      <span>{tier.maxChildren >= 99999 ? 'Crianças ilimitadas' : `Até ${tier.maxChildren} crianças`}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="h-3.5 w-3.5 text-primary" />
                      <span>
                        {/* max_programs not in tier type yet, derive from name */}
                        {tier.name.includes('Enterprise') ? 'Programas ilimitados' :
                         tier.name.includes('Pro') ? 'Até 10 programas' : 'Até 2 programas'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    {tier.features.map(f => (
                      <div key={f} className="flex items-center gap-2 text-xs">
                        <Check className="h-3 w-3 text-primary shrink-0" />
                        <span>{FEATURE_LABELS[f] ?? f}</span>
                      </div>
                    ))}
                  </div>

                  {isUpgrade && (
                    <Button
                      onClick={() => setPaymentOpen(true)}
                      className="w-full rounded-xl font-display gap-1.5"
                      size="sm"
                    >
                      <Crown className="h-3.5 w-3.5" /> Upgrade
                    </Button>
                  )}
                  {isCurrent && (
                    <Button disabled variant="outline" className="w-full rounded-xl" size="sm">
                      Plano Actual
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
        tiers={partnerTiers}
        onConfirmUpgrade={upgrade}
      />
    </div>
  );
}
