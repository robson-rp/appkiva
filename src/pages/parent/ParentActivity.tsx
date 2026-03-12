import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import CurrencyDisplay from '@/components/CurrencyDisplay';
import { ArrowUpRight, ArrowDownLeft, Sparkles, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useHouseholdTransactions } from '@/hooks/use-household-transactions';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ParentActivity() {
  const { t } = useLanguage();
  const { data: txData, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useHouseholdTransactions(10);
  const transactions = txData?.pages?.flat() ?? [];

  const entryLabel: Record<string, string> = {
    allowance: t('tx.allowance'),
    task_reward: t('tx.task_reward'),
    mission_reward: t('tx.mission_reward'),
    purchase: t('tx.purchase'),
    donation: t('tx.donation'),
    vault_deposit: t('tx.vault_deposit'),
    vault_withdraw: t('tx.vault_withdraw'),
    transfer: t('tx.transfer'),
    adjustment: t('tx.adjustment'),
    refund: t('tx.refund'),
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-3xl mx-auto"
    >
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-[hsl(var(--kivara-light-blue))] flex items-center justify-center">
          <Sparkles className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="font-display text-heading font-bold">{t('parent.dashboard.recent_activity')}</h1>
          <p className="text-muted-foreground text-small">{t('parent.activity.subtitle') || 'Histórico completo de transações da família'}</p>
        </div>
      </div>

      <Card className="border-border/50 overflow-hidden">
        <div className="h-0.5 bg-primary" />
        <CardContent className="p-4 space-y-1">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-border/30 last:border-0">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-xl" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="h-4 w-12" />
              </div>
            ))
          ) : transactions.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground text-base">{t('parent.dashboard.no_transactions')}</p>
            </div>
          ) : (
            transactions.map((tx) => {
              const isCredit = tx.direction === 'in';
              const formattedDate = tx.createdAt
                ? format(new Date(tx.createdAt), 'd MMM, HH:mm', { locale: pt })
                : '';
              return (
                <div key={tx.id} className="flex items-center justify-between py-3.5 border-b border-border/30 last:border-0 min-h-[56px]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-muted/60 flex items-center justify-center">
                      {isCredit
                        ? <ArrowDownLeft className="h-4 w-4 text-secondary" />
                        : <ArrowUpRight className="h-4 w-4 text-destructive" />}
                    </div>
                    <div>
                      <p className="text-base font-display font-bold">{tx.description || entryLabel[tx.entryType] || tx.entryType}</p>
                      <p className="text-small text-muted-foreground">
                        {tx.avatar} {tx.displayName} · {formattedDate}
                      </p>
                    </div>
                  </div>
                  <CurrencyDisplay
                    amount={tx.amount}
                    size="sm"
                    className={`font-display font-bold ${isCredit ? 'text-secondary' : 'text-destructive'}`}
                  />
                </div>
              );
            })
          )}
          {hasNextPage && (
            <div className="pt-3 flex justify-center">
              <Button
                variant="ghost"
                size="sm"
                className="text-primary text-small gap-1.5"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {isFetchingNextPage ? t('common.loading') || 'A carregar...' : t('common.load_more') || 'Carregar mais'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
