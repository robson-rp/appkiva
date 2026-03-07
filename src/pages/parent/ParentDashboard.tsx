import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import CurrencyDisplay from '@/components/CurrencyDisplay';
import { Users, ListTodo, CheckCircle, PiggyBank, TrendingUp, ChevronRight, ArrowUpRight, ArrowDownLeft, Sparkles, Target, Handshake, Send, Gauge } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { useChildren } from '@/hooks/use-children';
import { SendAllowanceDialog } from '@/components/SendAllowanceDialog';
import { useHouseholdTransactions } from '@/hooks/use-household-transactions';
import { Skeleton } from '@/components/ui/skeleton';
import { ParentChildrenStreaks } from '@/components/parent/ParentChildrenStreaks';
import { useEmissionStats } from '@/hooks/use-emission-stats';
import { useAllFeatures } from '@/hooks/use-feature-gate';
import { PlanSummaryWidget } from '@/components/PlanSummaryWidget';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

export default function ParentDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: children = [], isLoading: childrenLoading } = useChildren();
  const { data: realTransactions = [], isLoading: txLoading } = useHouseholdTransactions(8);
  const [allowanceOpen, setAllowanceOpen] = useState(false);
  const { data: emissionStats } = useEmissionStats();
  const { loading: featuresLoading } = useAllFeatures();

  const totalBalance = children.reduce((s, c) => s + c.balance, 0);

  const totalDistributed = realTransactions
    .filter((t) => t.entryType === 'allowance' && t.direction === 'in')
    .reduce((s, t) => s + t.amount, 0);

  const stats = [
    { label: 'Crianças', value: children.length, icon: Users, bg: 'bg-[hsl(var(--kivara-light-blue))]', iconColor: 'text-primary', to: '/parent/children' },
    { label: 'Distribuído', value: totalDistributed, icon: PiggyBank, bg: 'bg-[hsl(var(--kivara-light-gold))]', iconColor: 'text-accent-foreground', to: '/parent/allowance', isCurrency: true },
    { label: 'Transacções', value: realTransactions.length, icon: CheckCircle, bg: 'bg-[hsl(var(--kivara-light-green))]', iconColor: 'text-secondary', to: '/parent/tasks' },
    { label: 'Crianças', value: children.length, icon: ListTodo, bg: 'bg-[hsl(var(--kivara-pink))]', iconColor: 'text-destructive', to: '/parent/children' },
  ];

  const entryLabel: Record<string, string> = {
    allowance: 'Mesada',
    task_reward: 'Tarefa',
    mission_reward: 'Missão',
    purchase: 'Compra',
    donation: 'Doação',
    vault_deposit: 'Cofre ↓',
    vault_withdraw: 'Cofre ↑',
    transfer: 'Transferência',
    adjustment: 'Ajuste',
    refund: 'Reembolso',
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
                <p className="text-primary-foreground/60 text-xs font-medium uppercase tracking-wider">Painel Familiar</p>
                <h1 className="font-display text-2xl md:text-3xl font-bold text-primary-foreground">
                  Olá, {user?.name}! 👋
                </h1>
                <p className="text-primary-foreground/60 text-sm max-w-md">
                  Acompanha a evolução financeira dos teus filhos. Pequenos hábitos, grandes futuros.
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 text-center">
                <p className="text-primary-foreground/60 text-[10px] uppercase tracking-wider font-medium">Saldo Total</p>
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
            <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[hsl(var(--kivara-light-gold))] flex items-center justify-center">
                  <Send className="h-5 w-5 text-accent-foreground" />
                </div>
                <div>
                  <p className="font-display font-bold text-sm">Enviar Mesada</p>
                  <p className="text-xs text-muted-foreground">
                    {children.length} {children.length === 1 ? 'criança' : 'crianças'} · Saldo total: <CurrencyDisplay amount={totalBalance} size="sm" className="inline" />
                  </p>
                </div>
              </div>
              <Button
                className="rounded-xl font-display gap-2 bg-accent hover:bg-accent/90 text-accent-foreground shadow-sm"
                onClick={() => setAllowanceOpen(true)}
              >
                <Send className="h-4 w-4" /> Enviar Agora
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
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Gauge className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-display font-bold text-sm">Limite de Emissão Mensal</p>
                    <p className="text-[10px] text-muted-foreground">Controlo de inflação KVC</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-display font-bold text-sm">
                    <CurrencyDisplay amount={emissionStats.emitted_this_month} size="sm" className="inline" />
                    <span className="text-muted-foreground font-normal"> / </span>
                    <CurrencyDisplay amount={emissionStats.emission_limit} size="sm" className="inline" />
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Restante: <CurrencyDisplay amount={emissionStats.remaining} size="sm" className="inline" />
                  </p>
                </div>
              </div>
              <Progress 
                value={Math.min(emissionStats.percentage_used, 100)} 
                className="h-2"
              />
              {emissionStats.percentage_used >= 80 && (
                <p className="text-[10px] text-destructive mt-1.5 font-medium">
                  ⚠️ {emissionStats.percentage_used >= 100 ? 'Limite atingido! Não podes emitir mais KVC este mês.' : `Atenção: ${emissionStats.percentage_used}% do limite utilizado.`}
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Subscription Plan Summary */}
      {!featuresLoading && (
        <motion.div variants={item}>
          <PlanSummaryWidget onClick={() => navigate('/parent/subscription')} upgradeLabel="Faz upgrade para desbloquear tudo! 🚀" />
        </motion.div>
      )}


      <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-3" data-onboarding="tasks">
        {stats.map((stat, i) => (
          <motion.div key={`${stat.label}-${i}`} whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}>
            <Card
              className="cursor-pointer border-border/50 hover:shadow-kivara transition-all duration-300 overflow-hidden"
              onClick={() => navigate(stat.to)}
            >
              <div className="h-0.5 gradient-kivara" />
              <CardContent className="p-4">
                <div className={`w-10 h-10 rounded-2xl ${stat.bg} flex items-center justify-center mb-3`}>
                  <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                </div>
                {(stat as any).isCurrency ? (
                  <CurrencyDisplay amount={stat.value} size="xl" className="font-display" />
                ) : (
                  <p className="font-display text-2xl font-bold">{stat.value}</p>
                )}
                <p className="text-[10px] text-muted-foreground font-semibold tracking-wider uppercase">{stat.label}</p>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Children Overview */}
        <motion.div variants={item} data-onboarding="vaults">
          <Card className="border-border/50 h-full overflow-hidden">
            <div className="h-0.5 gradient-kivara" />
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-display flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[hsl(var(--kivara-light-blue))] flex items-center justify-center">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                Crianças
              </CardTitle>
              <button onClick={() => navigate('/parent/children')} className="text-xs text-primary font-semibold flex items-center gap-0.5 hover:underline">
                Ver todas <ChevronRight className="h-3 w-3" />
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
                  <p className="text-muted-foreground text-sm">Nenhuma criança associada.</p>
                  <p className="text-muted-foreground text-xs mt-1">Adiciona crianças na secção Crianças.</p>
                </div>
              ) : (
                children.map((child) => (
                  <motion.div
                    key={child.childId}
                    whileHover={{ x: 4 }}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-muted/40 hover:bg-muted/70 transition-all duration-200 cursor-pointer border border-transparent hover:border-border/50"
                    onClick={() => navigate('/parent/children')}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[hsl(var(--kivara-light-blue))] to-[hsl(var(--kivara-light-green))] flex items-center justify-center text-2xl shadow-sm">
                      {child.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-display font-bold text-sm">{child.displayName}</p>
                      <CurrencyDisplay amount={child.balance} size="sm" className="text-muted-foreground" />
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
              <CardTitle className="text-sm font-display flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[hsl(var(--kivara-light-blue))] flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                Actividade Recente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {txLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-border/30 last:border-0">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-9 h-9 rounded-xl" />
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
                  <p className="text-muted-foreground text-sm">Ainda sem transacções.</p>
                  <p className="text-muted-foreground text-xs mt-1">Envia uma mesada para começar!</p>
                </div>
              ) : (
                realTransactions.map((tx) => {
                  const isCredit = tx.direction === 'in';
                  const formattedDate = tx.createdAt
                    ? format(new Date(tx.createdAt), "d MMM, HH:mm", { locale: pt })
                    : '';
                  return (
                    <div key={tx.id} className="flex items-center justify-between py-3 border-b border-border/30 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-muted/60 flex items-center justify-center">
                          {isCredit
                            ? <ArrowDownLeft className="h-3.5 w-3.5 text-secondary" />
                            : <ArrowUpRight className="h-3.5 w-3.5 text-destructive" />}
                        </div>
                        <div>
                          <p className="text-sm font-display font-bold">{tx.description || entryLabel[tx.entryType] || tx.entryType}</p>
                          <p className="text-[11px] text-muted-foreground">
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
