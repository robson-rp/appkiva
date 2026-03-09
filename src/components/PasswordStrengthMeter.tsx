import { useMemo } from 'react';
import { Check, X } from 'lucide-react';
import { checkPasswordRules, getPasswordStrength, isCommonPassword, type PasswordStrength } from '@/lib/password-validation';
import { Progress } from '@/components/ui/progress';
import { useT } from '@/contexts/LanguageContext';

const STRENGTH_CONFIG: Record<PasswordStrength, { label: string; color: string; value: number }> = {
  weak: { label: 'password.strength.weak', color: 'bg-destructive', value: 20 },
  moderate: { label: 'password.strength.moderate', color: 'bg-[hsl(var(--accent))]', value: 50 },
  strong: { label: 'password.strength.strong', color: 'bg-secondary', value: 75 },
  very_strong: { label: 'password.strength.very_strong', color: 'bg-[hsl(160,54%,30%)]', value: 100 },
};

const RULE_LABELS: Record<string, string> = {
  minLength: 'password.rule.minLength',
  uppercase: 'password.rule.uppercase',
  lowercase: 'password.rule.lowercase',
  number: 'password.rule.number',
  special: 'password.rule.special',
};

export function PasswordStrengthMeter({ password }: { password: string }) {
  const t = useT();

  const { strength, rules, common } = useMemo(() => ({
    strength: getPasswordStrength(password),
    rules: checkPasswordRules(password),
    common: isCommonPassword(password),
  }), [password]);

  if (!password) return null;

  const cfg = STRENGTH_CONFIG[strength];

  return (
    <div className="space-y-2.5 animate-in fade-in-50 slide-in-from-top-2 duration-200">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{t('password.strength_label')}</span>
        <span className="text-xs font-semibold text-foreground">{t(cfg.label)}</span>
      </div>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all duration-300 ${cfg.color}`}
          style={{ width: `${cfg.value}%` }}
        />
      </div>
      {common && (
        <p className="text-xs text-destructive font-medium">{t('password.common_warning')}</p>
      )}
      <ul className="grid grid-cols-1 gap-1">
        {rules.map((r) => (
          <li key={r.key} className="flex items-center gap-1.5 text-xs">
            {r.passed ? (
              <Check className="h-3.5 w-3.5 text-secondary shrink-0" />
            ) : (
              <X className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
            )}
            <span className={r.passed ? 'text-foreground' : 'text-muted-foreground'}>
              {t(RULE_LABELS[r.key])}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
