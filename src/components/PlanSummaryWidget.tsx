import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Check, Lock, ChevronRight } from 'lucide-react';
import { useAllFeatures, FEATURES } from '@/hooks/use-feature-gate';
import { useT } from '@/contexts/LanguageContext';

interface PlanSummaryWidgetProps {
  compact?: boolean;
  onClick?: () => void;
  upgradeLabel?: string;
}

export function PlanSummaryWidget({ compact = false, onClick, upgradeLabel }: PlanSummaryWidgetProps) {
  const t = useT();
  const { enabledFeatures, tierName, loading } = useAllFeatures();

  const FEATURE_LIST = [
    { key: FEATURES.SAVINGS_VAULTS, label: t('plan.savings_vaults'), icon: '🐷' },
    { key: FEATURES.ADVANCED_ANALYTICS, label: t('plan.advanced_analytics'), icon: '📊' },
    { key: FEATURES.CUSTOM_REWARDS, label: t('plan.custom_rewards'), icon: '🎁' },
    { key: FEATURES.BUDGET_EXCEPTIONS, label: t('plan.budget_exceptions'), icon: '📩' },
    { key: FEATURES.DREAM_VAULTS, label: t('plan.dream_vaults'), icon: '✨' },
    { key: FEATURES.EXPORT_REPORTS, label: t('plan.export_reports'), icon: '📥' },
  ];

  if (loading) return null;

  const isFree = tierName === 'Free' || !tierName;
  const displayName = isFree ? t('plan.free') : tierName;

  if (compact) {
    const activeCount = FEATURE_LIST.filter(f => enabledFeatures.includes(f.key)).length;
    return (
      <Card className="border-border/50 overflow-hidden">
        <div className="h-0.5 bg-gradient-to-r from-accent via-primary to-secondary" />
        <CardContent className="p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-accent/15 flex items-center justify-center">
              <Crown className="h-3.5 w-3.5 text-accent-foreground" />
            </div>
            <div>
              <p className="font-display font-bold text-xs">{displayName}</p>
              <p className="text-[10px] text-muted-foreground">{t('plan.features_active').replace('{count}', String(activeCount)).replace('{total}', String(FEATURE_LIST.length))}</p>
            </div>
          </div>
          <Badge variant={isFree ? 'secondary' : 'default'} className="font-display text-[10px] gap-0.5">
            <Crown className="h-2.5 w-2.5" />
            {tierName || 'Free'}
          </Badge>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-border/50 overflow-hidden${onClick ? ' cursor-pointer hover:shadow-kivara transition-all duration-300' : ''}`} onClick={onClick}>
      <div className="h-0.5 bg-gradient-to-r from-accent via-primary to-secondary" />
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-accent/15 flex items-center justify-center">
              <Crown className="h-4 w-4 text-accent-foreground" />
            </div>
            <div>
              <p className="font-display font-bold text-sm">{t('plan.family_plan')}</p>
              <p className="text-[10px] text-muted-foreground">{displayName}</p>
            </div>
          </div>
          <Badge variant={isFree ? 'secondary' : 'default'} className="font-display text-xs gap-1">
            <Crown className="h-3 w-3" />
            {tierName || 'Free'}
          </Badge>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {FEATURE_LIST.map((f) => {
            const active = enabledFeatures.includes(f.key);
            return (
              <div
                key={f.key}
                className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                  active ? 'bg-secondary/10 text-foreground' : 'bg-muted/30 text-muted-foreground'
                }`}
              >
                {active ? (
                  <Check className="h-3 w-3 text-secondary shrink-0" />
                ) : (
                  <Lock className="h-3 w-3 text-muted-foreground/60 shrink-0" />
                )}
                <span className="truncate">{f.icon} {f.label}</span>
              </div>
            );
          })}
        </div>
        {isFree && (
          <div className="mt-3 flex items-center justify-between bg-accent/10 rounded-xl px-3 py-2">
            <p className="text-[11px] text-accent-foreground font-display font-bold">
              {upgradeLabel || t('plan.upgrade_prompt')}
            </p>
            <ChevronRight className="h-4 w-4 text-accent-foreground" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
