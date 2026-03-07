import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Sparkles, Crown, ArrowRight, Send } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import PaymentSimulator from '@/components/PaymentSimulator';
import { useSubscriptionTiers, useUpgradeSubscription } from '@/hooks/use-subscription';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface UpgradePromptProps {
  /** The name of the blocked feature (e.g. "Cofres de Sonhos") */
  featureName: string;
  /** Short description of what the feature does */
  description?: string;
  /** Current tier name from useFeatureGate */
  currentTier?: string | null;
  /** Visual variant */
  variant?: 'inline' | 'overlay' | 'banner';
  /** Icon to show (defaults to Lock) */
  icon?: React.ReactNode;
  /** Callback when upgrade is clicked */
  onUpgrade?: () => void;
  /** Additional CSS classes */
  className?: string;
}

const TIER_UPGRADE_MAP: Record<string, string> = {
  Free: 'Família Premium',
  Gratuito: 'Família Premium',
  'Família Premium': 'Escola Institucional',
  'Escola Institucional': 'Parceiro',
};

export default function UpgradePrompt({
  featureName,
  description,
  currentTier,
  variant = 'inline',
  icon,
  onUpgrade,
  className,
}: UpgradePromptProps) {
  const suggestedTier = currentTier
    ? TIER_UPGRADE_MAP[currentTier] ?? 'Família Premium'
    : 'Família Premium';

  if (variant === 'banner') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          'rounded-2xl border border-accent/30 bg-gradient-to-r from-accent/10 via-accent/5 to-transparent p-4',
          className
        )}
      >
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-accent/20 flex items-center justify-center shrink-0">
              <Lock className="h-4 w-4 text-accent-foreground" />
            </div>
            <div>
              <p className="text-sm font-display font-bold text-foreground">
                {featureName} requer upgrade
              </p>
              <p className="text-xs text-muted-foreground">
                Plano actual: <span className="font-semibold">{currentTier ?? 'Gratuito'}</span>
              </p>
            </div>
          </div>
          <Button
            size="sm"
            className="rounded-xl font-display gap-1.5 bg-accent hover:bg-accent/90 text-accent-foreground"
            onClick={onUpgrade}
          >
            <Crown className="h-3.5 w-3.5" />
            Upgrade
          </Button>
        </div>
      </motion.div>
    );
  }

  if (variant === 'overlay') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={cn(
          'absolute inset-0 z-20 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-[inherit]',
          className
        )}
      >
        <div className="text-center space-y-3 max-w-xs px-4">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent/20 to-primary/10 flex items-center justify-center mx-auto"
          >
            {icon ?? <Lock className="h-6 w-6 text-accent-foreground" />}
          </motion.div>
          <div>
            <p className="font-display font-bold text-sm">{featureName}</p>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          <div className="bg-muted/60 rounded-xl px-3 py-2 text-[10px] text-muted-foreground">
            <span className="font-semibold text-foreground">{currentTier ?? 'Gratuito'}</span>
            {' → '}
            <span className="font-semibold text-accent-foreground">{suggestedTier}</span>
          </div>
          <Button
            size="sm"
            className="rounded-xl font-display gap-1.5 bg-accent hover:bg-accent/90 text-accent-foreground w-full"
            onClick={onUpgrade}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Fazer Upgrade
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </motion.div>
    );
  }

  // Default: inline card
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      <Card className="border-accent/20 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-accent via-primary to-accent" />
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <motion.div
              animate={{ rotate: [0, -8, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent/20 to-primary/10 flex items-center justify-center shrink-0"
            >
              {icon ?? <Lock className="h-5 w-5 text-accent-foreground" />}
            </motion.div>
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="font-display font-bold text-sm">{featureName}</h3>
                {description && (
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {description}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 text-[10px]">
                <span className="px-2 py-1 rounded-lg bg-muted text-muted-foreground font-semibold uppercase tracking-wider">
                  {currentTier ?? 'Gratuito'}
                </span>
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                <span className="px-2 py-1 rounded-lg bg-accent/15 text-accent-foreground font-semibold uppercase tracking-wider">
                  {suggestedTier}
                </span>
              </div>

              <Button
                size="sm"
                className="rounded-xl font-display gap-1.5 bg-accent hover:bg-accent/90 text-accent-foreground"
                onClick={onUpgrade}
              >
                <Crown className="h-3.5 w-3.5" />
                Upgrade para {suggestedTier}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/**
 * Wrapper that conditionally shows the UpgradePrompt overlay on blocked features.
 *
 * Usage:
 * ```tsx
 * <FeatureGateWrapper feature="dream_vaults" featureName="Cofres de Sonhos">
 *   <DreamVaultsContent />
 * </FeatureGateWrapper>
 * ```
 */
export function FeatureGateWrapper({
  allowed,
  featureName,
  description,
  tierName,
  children,
  variant = 'overlay',
  className,
}: {
  allowed: boolean;
  featureName: string;
  description?: string;
  tierName?: string | null;
  children: React.ReactNode;
  variant?: 'inline' | 'overlay';
  className?: string;
}) {
  const [paymentOpen, setPaymentOpen] = useState(false);
  const { data: tiers = [] } = useSubscriptionTiers();
  const { upgrade } = useUpgradeSubscription();

  return (
    <div className={cn('relative', className)}>
      {children}
      {!allowed && (
        <>
          <UpgradePrompt
            featureName={featureName}
            description={description}
            currentTier={tierName}
            variant={variant}
            onUpgrade={() => setPaymentOpen(true)}
          />
          <PaymentSimulator
            open={paymentOpen}
            onOpenChange={setPaymentOpen}
            currentTierName={tierName}
            tiers={tiers}
            onConfirmUpgrade={upgrade}
          />
        </>
      )}
    </div>
  );
}
