import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { useVaultInterestHistory } from '@/hooks/use-vault-interest-history';
import { TrendingUp, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useT } from '@/contexts/LanguageContext';

export function VaultInterestHistory({ profileId }: { profileId?: string }) {
  const t = useT();
  const { data: entries, isLoading } = useVaultInterestHistory(profileId);
  const [expanded, setExpanded] = useState(false);

  if (isLoading) return null;
  if (!entries || entries.length === 0) {
    return (
      <Card className="border-border/50">
        <CardContent className="p-4 text-center">
          <TrendingUp className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
          <p className="text-sm text-muted-foreground">{t('interest.no_interest')}</p>
          <p className="text-xs text-muted-foreground/70 mt-1">{t('interest.no_interest_desc')}</p>
        </CardContent>
      </Card>
    );
  }

  const totalInterest = entries.reduce((s, e) => s + e.amount, 0);
  const visible = expanded ? entries : entries.slice(0, 3);

  return (
    <Card className="border-border/50">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-secondary/15 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-secondary" />
            </div>
            <div>
              <h3 className="font-display font-bold text-sm text-foreground">{t('interest.title')}</h3>
              <p className="text-[10px] text-muted-foreground">
                {(entries.length !== 1 ? t('interest.credits_plural') : t('interest.credits')).replace('{count}', String(entries.length))}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-display font-bold text-secondary text-sm">+{totalInterest} 🪙</p>
            <p className="text-[10px] text-muted-foreground">{t('interest.total_received')}</p>
          </div>
        </div>

        <div className="space-y-2">
          <AnimatePresence initial={false}>
            {visible.map((entry, i) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2, delay: i * 0.03 }}
                className="overflow-hidden"
              >
                <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/40 border border-border/30">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-lg shrink-0">📈</span>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">
                        {entry.vaultName ?? t('interest.vault_fallback')}
                      </p>
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                        <Calendar className="h-2.5 w-2.5 shrink-0" />
                        <span>{new Date(entry.createdAt).toLocaleDateString('pt-PT', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        {entry.interestRate != null && (
                          <span className="text-secondary">• {entry.interestRate}%</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className="font-display font-bold text-sm text-secondary shrink-0 ml-2">
                    +{entry.amount} 🪙
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {entries.length > 3 && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs text-muted-foreground font-display gap-1 h-7"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <><ChevronUp className="h-3 w-3" /> {t('interest.show_less')}</>
            ) : (
              <><ChevronDown className="h-3 w-3" /> {t('interest.show_all').replace('{count}', String(entries.length))}</>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
