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
import { useT } from '@/contexts/LanguageContext';

interface UpgradePromptProps {
  featureName: string;
  description?: string;
  currentTier?: string | null;
  variant?: 'inline' | 'overlay' | 'banner';
  icon?: React.ReactNode;
  onUpgrade?: () => void;
  className?: string;
}

const TIER_UPGRADE_MAP: Record<string, string> = {
  Free: 'Família Premium',
  Gratuito: 'Família Premium',
  'Família Premium': 'Escola Institucional',
  'Escola Institucional': 'Parceiro',
};

export default function UpgradePrompt({ featureName, description, currentTier, variant = 'inline', icon, onUpgrade, className }: UpgradePromptProps) {
  const t = useT();
  const suggestedTier = currentTier ? TIER_UPGRADE_MAP[currentTier] ?? 'Família Premium' : 'Família Premium';
  const tierLabel = currentTier ?? t('upgrade.free');

  if (variant === 'banner') {
    return (
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className={cn('rounded-2xl border border-accent/30 bg-gradient-to-r from-accent/10 via-accent/5 to-transparent p-4', className)}>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-accent/20 flex items-center justify-center shrink-0"><Lock className="h-4 w-4 text-accent-foreground" /></div>
            <div>
              <p className="text-sm font-display font-bold text-foreground">{t('upgrade.requires').replace('{feature}', featureName)}</p>
              <p className="text-xs text-muted-foreground">{t('upgrade.current_plan')}: <span className="font-semibold">{tierLabel}</span></p>
            </div>
          </div>
          <Button size="sm" className="rounded-xl font-display gap-1.5 bg-accent hover:bg-accent/90 text-accent-foreground" onClick={onUpgrade}>
            <Crown className="h-3.5 w-3.5" />{t('upgrade.btn')}
          </Button>
        </div>
      </motion.div>
    );
  }

  if (variant === 'overlay') {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={cn('absolute inset-0 z-20 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-[inherit]', className)}>
        <div className="text-center space-y-3 max-w-xs px-4">
          <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }} className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent/20 to-primary/10 flex items-center justify-center mx-auto">
            {icon ?? <Lock className="h-6 w-6 text-accent-foreground" />}
          </motion.div>
          <div>
            <p className="font-display font-bold text-sm">{featureName}</p>
            {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
          </div>
          <div className="bg-muted/60 rounded-xl px-3 py-2 text-[10px] text-muted-foreground">
            <span className="font-semibold text-foreground">{tierLabel}</span>{' → '}<span className="font-semibold text-accent-foreground">{suggestedTier}</span>
          </div>
          <Button size="sm" className="rounded-xl font-display gap-1.5 bg-accent hover:bg-accent/90 text-accent-foreground w-full" onClick={onUpgrade}>
            <Sparkles className="h-3.5 w-3.5" />{t('upgrade.do_upgrade')}<ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className={className}>
      <Card className="border-accent/20 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-accent via-primary to-accent" />
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <motion.div animate={{ rotate: [0, -8, 8, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }} className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent/20 to-primary/10 flex items-center justify-center shrink-0">
              {icon ?? <Lock className="h-5 w-5 text-accent-foreground" />}
            </motion.div>
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="font-display font-bold text-sm">{featureName}</h3>
                {description && <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{description}</p>}
              </div>
              <div className="flex items-center gap-2 text-[10px]">
                <span className="px-2 py-1 rounded-lg bg-muted text-muted-foreground font-semibold uppercase tracking-wider">{tierLabel}</span>
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                <span className="px-2 py-1 rounded-lg bg-accent/15 text-accent-foreground font-semibold uppercase tracking-wider">{suggestedTier}</span>
              </div>
              <Button size="sm" className="rounded-xl font-display gap-1.5 bg-accent hover:bg-accent/90 text-accent-foreground" onClick={onUpgrade}>
                <Crown className="h-3.5 w-3.5" />{t('upgrade.upgrade_to').replace('{tier}', suggestedTier)}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function FeatureGateWrapper({ allowed, featureName, description, tierName, children, className }: {
  allowed: boolean; featureName: string; description?: string; tierName?: string | null; children: React.ReactNode; className?: string;
}) {
  const t = useT();
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const { data: tiers = [] } = useSubscriptionTiers();
  const { upgrade } = useUpgradeSubscription();
  const { user } = useAuth();

  const isChildOrTeen = user?.role === 'child' || user?.role === 'teen';
  const suggestedTier = tierName ? TIER_UPGRADE_MAP[tierName] ?? 'Família Premium' : 'Família Premium';
  const tierLabel = tierName ?? t('upgrade.free');

  const handleRequestUpgrade = async () => {
    if (!user?.householdId || !user?.profileId) return;
    setRequesting(true);
    try {
      const { data: parentProfiles } = await supabase.from('profiles').select('id').eq('household_id', user.householdId).neq('id', user.profileId);
      if (!parentProfiles?.length) {
        toast({ title: t('common.error'), description: t('upgrade.request_error'), variant: 'destructive' });
        return;
      }
      for (const parent of parentProfiles) {
        await supabase.from('notifications').insert({
          profile_id: parent.id,
          title: t('upgrade.request_title'),
          message: t('upgrade.request_msg').replace('{name}', user.name ?? '').replace('{feature}', featureName),
          type: 'achievement', urgent: true,
          metadata: { feature: featureName, requester_profile_id: user.profileId, requester_name: user.name },
        } as any);
      }
      toast({ title: t('upgrade.request_sent'), description: t('upgrade.request_sent_desc') });
    } catch {
      toast({ title: t('common.error'), description: t('upgrade.request_fail'), variant: 'destructive' });
    } finally {
      setRequesting(false);
    }
  };

  return (
    <div className={cn('relative', className)}>
      {!allowed && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="sticky top-0 z-20 mb-4 rounded-2xl border border-accent/30 bg-gradient-to-r from-accent/10 via-accent/5 to-transparent p-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-accent/20 flex items-center justify-center shrink-0"><Lock className="h-4 w-4 text-accent-foreground" /></div>
              <div>
                <p className="text-sm font-display font-bold text-foreground">{t('upgrade.requires').replace('{feature}', featureName)}</p>
                {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
                <p className="text-[10px] text-muted-foreground">
                  {t('upgrade.current_plan')}: <span className="font-semibold">{tierLabel}</span>{' → '}<span className="font-semibold text-accent-foreground">{suggestedTier}</span>
                </p>
              </div>
            </div>
            {isChildOrTeen ? (
              <Button size="sm" className="rounded-xl font-display gap-1.5" onClick={handleRequestUpgrade} disabled={requesting}>
                <Send className="h-3.5 w-3.5" />{requesting ? t('upgrade.sending') : t('upgrade.ask_parent')}
              </Button>
            ) : (
              <Button size="sm" className="rounded-xl font-display gap-1.5 bg-accent hover:bg-accent/90 text-accent-foreground" onClick={() => setPaymentOpen(true)}>
                <Crown className="h-3.5 w-3.5" />{t('upgrade.btn')}
              </Button>
            )}
          </div>
        </motion.div>
      )}
      {children}
      {!isChildOrTeen && (
        <PaymentSimulator open={paymentOpen} onOpenChange={setPaymentOpen} currentTierName={tierName} tiers={tiers} onConfirmUpgrade={upgrade} />
      )}
    </div>
  );
}
