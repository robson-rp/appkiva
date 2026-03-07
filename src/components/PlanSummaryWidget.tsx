import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Check, Lock, ChevronRight } from 'lucide-react';
import { useAllFeatures, FEATURES } from '@/hooks/use-feature-gate';

const FEATURE_LIST = [
  { key: FEATURES.SAVINGS_VAULTS, label: 'Cofres de Poupança', icon: '🐷' },
  { key: FEATURES.ADVANCED_ANALYTICS, label: 'Relatórios Avançados', icon: '📊' },
  { key: FEATURES.CUSTOM_REWARDS, label: 'Recompensas Custom', icon: '🎁' },
  { key: FEATURES.BUDGET_EXCEPTIONS, label: 'Excepções Orçamento', icon: '📩' },
  { key: FEATURES.DREAM_VAULTS, label: 'Cofres de Sonhos', icon: '✨' },
  { key: FEATURES.EXPORT_REPORTS, label: 'Exportar Dados', icon: '📥' },
];

interface PlanSummaryWidgetProps {
  compact?: boolean;
  onClick?: () => void;
  upgradeLabel?: string;
}

export function PlanSummaryWidget({ compact = false, onClick, upgradeLabel }: PlanSummaryWidgetProps) {
  const { enabledFeatures, tierName, loading } = useAllFeatures();

  if (loading) return null;

  const isFree = tierName === 'Free' || !tierName;
  const displayName = isFree ? 'Plano Gratuito' : tierName;

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
              <p className="text-[10px] text-muted-foreground">{activeCount}/{FEATURE_LIST.length} funcionalidades activas</p>
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
              <p className="font-display font-bold text-sm">Plano Familiar</p>
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
              {upgradeLabel || 'Pede ao teu encarregado para fazer upgrade! 🚀'}
            </p>
            <ChevronRight className="h-4 w-4 text-accent-foreground" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
