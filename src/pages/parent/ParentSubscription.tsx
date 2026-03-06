import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Crown, Check, ArrowDown, Sparkles, Shield, AlertTriangle } from 'lucide-react';
import { useAllFeatures } from '@/hooks/use-feature-gate';
import { useSubscriptionTiers, useUpgradeSubscription } from '@/hooks/use-subscription';
import PaymentSimulator from '@/components/PaymentSimulator';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

const FEATURE_LABELS: Record<string, string> = {
  savings_vaults: 'Cofres de Poupança',
  dream_vaults: 'Cofres de Sonhos',
  custom_rewards: 'Recompensas Personalizadas',
  budget_exceptions: 'Exceções de Orçamento',
  multi_child: 'Multi-Criança',
  advanced_analytics: 'Relatórios Avançados',
  analytics: 'Relatórios Avançados',
  export_reports: 'Exportar Relatórios',
  real_money_wallet: 'Carteira Dinheiro Real',
  classroom_mode: 'Modo Sala de Aula',
  priority_support: 'Suporte Prioritário',
  basic_wallet: 'Carteira Básica',
  basic_tasks: 'Tarefas Básicas',
  basic_rewards: 'Recompensas Básicas',
  teacher_dashboard: 'Painel do Professor',
  api_access: 'Acesso API',
  custom_branding: 'Marca Personalizada',
};

const ALL_FEATURES = Object.keys(FEATURE_LABELS);

export default function ParentSubscription() {
  const { enabledFeatures, tierName, loading: gateLoading } = useAllFeatures();
  const { data: tiers = [], isLoading: tiersLoading } = useSubscriptionTiers();
  const { upgrade, loading: upgradeLoading } = useUpgradeSubscription();
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [downgradeOpen, setDowngradeOpen] = useState(false);
  const [downgradeTarget, setDowngradeTarget] = useState<typeof tiers[0] | null>(null);

  const currentTier = tiers.find((t) => t.name === tierName);
  const currentIndex = tiers.findIndex((t) => t.name === tierName);
  const lowerTiers = tiers.filter((_, i) => i < currentIndex);
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
                  <p className="text-xs uppercase tracking-widest opacity-70">Plano actual</p>
                  <h1 className="font-display text-2xl font-bold">
                    {gateLoading ? '...' : tierName ?? 'Gratuito'}
                  </h1>
                  {currentTier && (
                    <p className="text-sm opacity-80 mt-0.5">
                      {currentTier.priceMonthly > 0
                        ? `€${currentTier.priceMonthly}/mês`
                        : 'Gratuito'}
                    </p>
                  )}
                </div>
              </div>
              <Badge className="bg-white/20 text-white border-0 font-display">
                <Shield className="h-3 w-3 mr-1" /> Activo
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
              <h2 className="font-display font-semibold">Funcionalidades incluídas</h2>
            </div>

            <div className="grid gap-2">
              {ALL_FEATURES.map((feature) => {
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
                      {FEATURE_LABELS[feature] ?? feature}
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
        {/* Upgrade */}
        <Button
          onClick={() => setPaymentOpen(true)}
          className="w-full rounded-xl font-display h-12 text-base gap-2 bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          <Crown className="h-4 w-4" /> Fazer Upgrade
        </Button>

        {/* Downgrade */}
        {!isFreeTier && lowerTiers.length > 0 && (
          <div className="space-y-2">
            <Separator />
            <p className="text-xs text-muted-foreground text-center">
              Ou mudar para um plano inferior
            </p>
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

      {/* Payment Simulator */}
      <PaymentSimulator
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
        currentTierName={tierName}
        tiers={tiers}
        onConfirmUpgrade={upgrade}
      />

      {/* Downgrade Confirmation Dialog */}
      <Dialog open={downgradeOpen} onOpenChange={setDowngradeOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Confirmar downgrade
            </DialogTitle>
            <DialogDescription>
              Ao mudar para <strong>{downgradeTarget?.name}</strong>, perderás acesso a algumas funcionalidades premium.
              Esta alteração é imediata.
            </DialogDescription>
          </DialogHeader>

          {downgradeTarget && (
            <div className="space-y-2 py-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Funcionalidades que perdes:
              </p>
              {enabledFeatures
                .filter((f) => !downgradeTarget.features.includes(f))
                .map((f) => (
                  <div key={f} className="flex items-center gap-2 text-sm text-destructive/80">
                    <span>✕</span>
                    <span>{FEATURE_LABELS[f] ?? f}</span>
                  </div>
                ))}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDowngradeOpen(false)} className="rounded-xl">
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDowngrade}
              disabled={upgradeLoading}
              className="rounded-xl font-display gap-1.5"
            >
              <ArrowDown className="h-3.5 w-3.5" />
              {upgradeLoading ? 'A processar...' : 'Confirmar Downgrade'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
