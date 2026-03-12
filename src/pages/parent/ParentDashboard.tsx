import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import CurrencyDisplay from '@/components/CurrencyDisplay';
import { Users, ListTodo, CheckCircle, PiggyBank, ChevronRight, ArrowUpRight, ArrowDownLeft, Sparkles, Brain, Send, Gauge } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { useChildren } from '@/hooks/use-children';
import { SendAllowanceDialog } from '@/components/SendAllowanceDialog';
import { useHouseholdTransactions } from '@/hooks/use-household-transactions';
import { Skeleton } from '@/components/ui/skeleton';
import { ParentChildrenStreaks } from '@/components/parent/ParentChildrenStreaks';
import { ParentWeeklySummary } from '@/components/parent/ParentWeeklySummary';
import { useEmissionStats } from '@/hooks/use-emission-stats';
import { format, differenceInYears } from 'date-fns';
import { pt } from 'date-fns/locale';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePrefetchRoutes } from '@/hooks/use-prefetch-routes';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

export default function ParentDashboard() {
  const navigate = useNavigate();
  usePrefetchRoutes('parent');
  const { user } = useAuth();
  const { t } = useLanguage();
  const { data: children = [], isLoading: childrenLoading } = useChildren();
  const { data: txData, isLoading: txLoading } = useHouseholdTransactions(4);
  const realTransactions = (txData?.pages?.flat() ?? []).slice(0, 4);
  const [allowanceOpen, setAllowanceOpen] = useState(false);
  const { data: emissionStats } = useEmissionStats();

  const totalBalance = children.reduce((s, c) => s + c.balance, 0);

  const totalDistributed = realTransactions
    .filter((t) => t.entryType === 'allowance' && t.direction === 'in')
    .reduce((s, t) => s + t.amount, 0);

  const stats = [
    { label: t('parent.dashboard.children'), value: children.length, icon: Users, bg: 'bg-[hsl(var(--kivara-light-blue))]', iconColor: 'text-primary', to: '/parent/children' },
    { label: t('parent.dashboard.distributed'), value: totalDistributed, icon: PiggyBank, bg: 'bg-[hsl(var(--kivara-light-gold))]', iconColor: 'text-accent-foreground', to: '/parent/allowance', isCurrency: true },
    { label: t('parent.dashboard.transactions'), value: realTransactions.length, icon: CheckCircle, bg: 'bg-[hsl(var(--kivara-light-green))]', iconColor: 'text-secondary', to: '/parent/tasks' },
    { label: t('parent.dashboard.children'), value: children.length, icon: ListTodo, bg: 'bg-[hsl(var(--kivara-pink))]', iconColor: 'text-destructive', to: '/parent/children' },
  ];

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
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-5xl mx-auto">
      {/* Hero Welcome */}
      <motion.div variants={item} data-onboarding="dashboard">
        <Card className="border-0 overflow-hidden relative shadow-kivara">
          <div className="absolute inset-0 gradient-kivara" />
          <div className="absolute top-[-30%] right-[-10%] w-[45%] h-[80%] rounded-full bg-white/5 blur-3xl" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[35%] h-[60%] rounded-full bg-white/5 blur-3xl" />
          <CardContent className="relative z-10 p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-2">
                <p className="text-primary-foreground/60 text-small font-medium uppercase tracking-wider">{t('parent.dashboard.family_panel')}</p>
                <h1 className="font-display text-heading md:text-heading-lg font-bold text-primary-foreground">
                  {t('parent.dashboard.hello')} {user?.name}! 👋
                </h1>
                <p className="text-primary-foreground/60 text-base max-w-md">
                  {t('parent.dashboard.subtitle')}
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-5 text-center">
                <p className="text-primary-foreground/60 text-caption uppercase tracking-wider font-medium">{t('parent.dashboard.total_balance')}</p>
                <motion.div
                  key={totalBalance}
                  initial={{ scale: 1.15, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="mt-1"
                >
                  <CurrencyDisplay amount={totalBalance} size="xl" className="text-primary-foreground" />
                </motion.div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Action: Send Allowance */}
      {children.length > 0 && (
        <motion.div variants={item} data-onboarding="allowance">
          <Card className="border-border/50 overflow-hidden border-dashed border-2 border-secondary/40 bg-secondary/5">
            <CardContent className="p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[hsl(var(--kivara-light-gold))] flex items-center justify-center">
                  <Send className="h-5 w-5 text-accent-foreground" />
                </div>
                <div>
                  <p className="font-display font-bold text-base">{t('parent.dashboard.send_allowance')}</p>
                  <p className="text-small text-muted-foreground">
                    {children.length} {children.length === 1 ? t('parent.children.max_children').replace('s','') : t('parent.children.max_children')} · {t('common.total_balance')}: <CurrencyDisplay amount={totalBalance} size="sm" className="inline" />
                  </p>
                </div>
              </div>
              <Button
                className="rounded-xl font-display gap-2 bg-accent hover:bg-accent/90 text-accent-foreground shadow-sm"
                onClick={() => setAllowanceOpen(true)}
              >
                <Send className="h-4 w-4" /> {t('parent.dashboard.send_now')}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <SendAllowanceDialog
        open={allowanceOpen}
        onOpenChange={setAllowanceOpen}
        children={children}
      />

      {/* Emission Limit Widget */}
      {emissionStats && (
        <motion.div variants={item}>
          <Card className="border-border/50 overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Gauge className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-display font-bold text-base">{t('parent.dashboard.emission_limit')}</p>
                    <p className="text-small text-muted-foreground">{t('parent.dashboard.inflation_control')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-display font-bold text-base">
                    <CurrencyDisplay amount={emissionStats.emitted_this_month} size="sm" className="inline" />
                    <span className="text-muted-foreground font-normal"> / </span>
                    <CurrencyDisplay amount={emissionStats.emission_limit} size="sm" className="inline" />
                  </p>
                  <p className="text-small text-muted-foreground">
                    {t('parent.dashboard.remaining')}: <CurrencyDisplay amount={emissionStats.remaining} size="sm" className="inline" />
                  </p>
                </div>
              </div>
              <Progress 
                value={Math.min(emissionStats.percentage_used, 100)} 
                className="h-2.5"
              />
              {emissionStats.percentage_used >= 80 && (
                <p className="text-small text-destructive mt-2 font-medium">
                  ⚠️ {emissionStats.percentage_used >= 100 ? t('parent.dashboard.limit_reached') : t('parent.dashboard.limit_warning').replace('{pct}', String(emissionStats.percentage_used))}
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}


      <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-4" data-onboarding="tasks">
        {stats.map((stat, i) => (
          <motion.div key={`${stat.label}-${i}`} whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}>
            <Card
              className="cursor-pointer border-border/50 hover:shadow-kivara transition-all duration-300 overflow-hidden"
              onClick={() => navigate(stat.to)}
            >
              <div className="h-0.5 gradient-kivara" />
              <CardContent className="p-5">
                <div className={`w-11 h-11 rounded-2xl ${stat.bg} flex items-center justify-center mb-3`}>
                  <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                </div>
                {(stat as any).isCurrency ? (
                  <CurrencyDisplay amount={stat.value} size="xl" className="font-display" />
                ) : (
                  <p className="font-display text-2xl font-bold">{stat.value}</p>
                )}
                <p className="text-caption text-muted-foreground font-semibold tracking-wider uppercase mt-1">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Children Streaks */}
      {children.length > 0 && (
        <motion.div variants={item}>
          <ParentChildrenStreaks children={children} />
        </motion.div>
      )}

      {/* AI Insights compact link */}
      {children.length > 0 && (
        <motion.div variants={item}>
          <Card
            className="border-border/50 cursor-pointer hover:shadow-kivara transition-all duration-300 overflow-hidden"
            onClick={() => navigate('/parent/insights')}
          >
            <CardContent className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Brain className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-display font-bold text-base">{t('parent.insights.title')}</p>
                  <p className="text-small text-muted-foreground">{t('parent.insights.description')}</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Weekly Summary */}
      {children.length > 0 && (
        <motion.div variants={item}>
          <ParentWeeklySummary householdId={user?.householdId || null} />
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Children Overview */}
        <motion.div variants={item} data-onboarding="vaults">
          <Card className="border-border/50 h-full overflow-hidden">
            <div className="h-0.5 gradient-kivara" />
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-display flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[hsl(var(--kivara-light-blue))] flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                {t('parent.dashboard.children')}
              </CardTitle>
              <button onClick={() => navigate('/parent/children')} className="text-small text-primary font-semibold flex items-center gap-0.5 hover:underline min-h-[44px]">
                {t('common.view_all')} <ChevronRight className="h-4 w-4" />
              </button>
            </CardHeader>
            <CardContent className="space-y-3">
              {childrenLoading ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-muted/40">
                    <Skeleton className="w-12 h-12 rounded-2xl" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                ))
              ) : children.length === 0 ? (
                <div className="py-6 text-center">
                  <p className="text-muted-foreground text-base">{t('parent.dashboard.no_children')}</p>
                  <p className="text-muted-foreground text-small mt-1">{t('parent.dashboard.add_children_hint')}</p>
                </div>
              ) : (
                children.map((child) => (
                  <motion.div
                    key={child.childId}
                    whileHover={{ x: 4 }}
                    className="flex items-center gap-3 p-3.5 rounded-2xl bg-muted/40 hover:bg-muted/70 transition-all duration-200 cursor-pointer border border-transparent hover:border-border/50 min-h-[60px]"
                    onClick={() => navigate('/parent/children')}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[hsl(var(--kivara-light-blue))] to-[hsl(var(--kivara-light-green))] flex items-center justify-center text-2xl shadow-sm">
                      {child.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-display font-bold text-base">{child.displayName}</p>
                      <p className="text-small text-muted-foreground">
                        {child.dateOfBirth
                          ? `${differenceInYears(new Date(), new Date(child.dateOfBirth))} ${t('common.years')}`
                          : <CurrencyDisplay amount={child.balance} size="sm" className="text-muted-foreground" />}
                      </p>
                    </div>
                    <CurrencyDisplay amount={child.balance} size="sm" />
                  </motion.div>
                ))
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div variants={item} data-onboarding="reports">
          <Card className="border-border/50 h-full overflow-hidden">
            <div className="h-0.5 bg-primary" />
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
             <CardTitle className="text-base font-display flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[hsl(var(--kivara-light-blue))] flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                {t('parent.dashboard.recent_activity')}
              </CardTitle>
              <button onClick={() => navigate('/parent/activity')} className="text-small text-primary font-semibold flex items-center gap-0.5 hover:underline min-h-[44px]">
                {t('common.view_all')} <ChevronRight className="h-4 w-4" />
              </button>
            </CardHeader>
            <CardContent className="space-y-1">
              {txLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
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
              ) : realTransactions.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground text-base">{t('parent.dashboard.no_transactions')}</p>
                  <p className="text-muted-foreground text-small mt-1">{t('parent.dashboard.send_to_start')}</p>
                </div>
              ) : (
                realTransactions.map((tx) => {
                  const isCredit = tx.direction === 'in';
                  const formattedDate = tx.createdAt
                    ? format(new Date(tx.createdAt), "d MMM, HH:mm", { locale: pt })
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
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
