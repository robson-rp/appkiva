import { Card, CardContent } from '@/components/ui/card';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Area, AreaChart,
} from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, PiggyBank, ArrowUpRight, Lightbulb, AlertTriangle, CheckCircle, Minus } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useFeatureGate, FEATURES } from '@/hooks/use-feature-gate';
import { FeatureGateWrapper } from '@/components/UpgradePrompt';
import { useChildren } from '@/hooks/use-children';
import { useHouseholdTasks } from '@/hooks/use-household-tasks';
import { useHouseholdTransactions } from '@/hooks/use-household-transactions';
import { useDreamVaults } from '@/hooks/use-dream-vaults';
import { Skeleton } from '@/components/ui/skeleton';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

const COLORS = {
  green: 'hsl(160, 54%, 40%)',
  gold: 'hsl(39, 89%, 57%)',
  blue: 'hsl(214, 64%, 33%)',
  red: 'hsl(0, 72%, 55%)',
};

export default function ParentReports() {
  const { allowed: reportsAllowed, tierName, loading: gateLoading } = useFeatureGate(FEATURES.ADVANCED_ANALYTICS);
  const { data: children = [], isLoading: loadingChildren } = useChildren();
  const { data: householdTasks = [], isLoading: loadingTasks } = useHouseholdTasks();
  const { data: householdTx = [], isLoading: loadingTx } = useHouseholdTransactions(100);

  const isLoading = loadingChildren || loadingTasks || loadingTx;

  // Build task data per child
  const taskData = children.map((child) => {
    const childTasks = householdTasks.filter(t => t.childProfileId === child.profileId);
    return {
      name: child.displayName,
      completas: childTasks.filter(t => t.status === 'completed' || t.status === 'approved').length,
      pendentes: childTasks.filter(t => t.status === 'pending').length,
      progresso: childTasks.filter(t => t.status === 'in_progress').length,
    };
  });

  // Compute financial totals from real transactions
  const totalEarned = householdTx.filter(t => t.direction === 'in').reduce((s, t) => s + t.amount, 0);
  const totalSpent = householdTx.filter(t => t.direction === 'out').reduce((s, t) => s + t.amount, 0);
  const totalSaved = Math.max(totalEarned - totalSpent, 0);
  const savingsRate = totalEarned > 0 ? Math.round((totalSaved / totalEarned) * 100) : 0;

  const pieData = [
    { name: 'Ganho', value: totalEarned },
    { name: 'Gasto', value: totalSpent },
    { name: 'Poupado', value: totalSaved },
  ];
  const pieColors = [COLORS.green, COLORS.red, COLORS.blue];

  const customTooltipStyle = {
    backgroundColor: 'hsl(0, 0%, 100%)',
    border: '1px solid hsl(210, 20%, 90%)',
    borderRadius: '12px',
    padding: '8px 12px',
    fontSize: '12px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
  };

  // Generate weekly trend from real transactions (last 4 weeks)
  const now = new Date();
  const weeklyTrend = Array.from({ length: 4 }, (_, i) => {
    const weekEnd = new Date(now);
    weekEnd.setDate(weekEnd.getDate() - i * 7);
    const weekStart = new Date(weekEnd);
    weekStart.setDate(weekStart.getDate() - 7);
    const weekTxs = householdTx.filter(t => {
      const d = new Date(t.createdAt);
      return d >= weekStart && d < weekEnd;
    });
    const ganho = weekTxs.filter(t => t.direction === 'in').reduce((s, t) => s + t.amount, 0);
    const gasto = weekTxs.filter(t => t.direction === 'out').reduce((s, t) => s + t.amount, 0);
    return { week: `Sem ${4 - i}`, ganho, gasto, poupado: Math.max(ganho - gasto, 0) };
  }).reverse();

  // Insights derived from real data
  const topSaver = [...children].sort((a, b) => b.balance - a.balance)[0];
  const topTaskCompleter = taskData.reduce((best, c) => c.completas > (best?.completas ?? 0) ? c : best, taskData[0]);

  return (
    <FeatureGateWrapper
      allowed={reportsAllowed || gateLoading}
      featureName="Relatórios Educativos"
      description="Acompanha o progresso financeiro dos teus filhos com gráficos detalhados e insights comportamentais. Disponível no plano Família Premium."
      tierName={tierName}
    >
    <div className="space-y-6">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-2xl gradient-kivara p-6 text-primary-foreground">
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute bottom-0 left-1/2 w-60 h-20 rounded-full bg-white/5 blur-2xl" />
        <div className="relative">
          <p className="text-primary-foreground/60 text-[10px] uppercase tracking-wider font-medium">Análise</p>
          <h1 className="font-display text-2xl font-bold mt-1">Relatórios Educativos</h1>
          <p className="text-sm text-primary-foreground/60 mt-1">Insights comportamentais e progresso financeiro</p>
        </div>
      </motion.div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-28 rounded-2xl" />)}
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Total Ganho', value: totalEarned, icon: TrendingUp, bg: 'bg-[hsl(var(--kivara-light-green))]', color: 'text-secondary' },
              { label: 'Total Gasto', value: totalSpent, icon: TrendingDown, bg: 'bg-[hsl(var(--kivara-pink))]', color: 'text-destructive' },
              { label: 'Total Poupado', value: totalSaved, icon: PiggyBank, bg: 'bg-[hsl(var(--kivara-light-blue))]', color: 'text-primary' },
              { label: 'Taxa Poupança', value: `${savingsRate}%`, icon: ArrowUpRight, bg: 'bg-[hsl(var(--kivara-light-gold))]', color: 'text-accent-foreground' },
            ].map((s) => (
              <motion.div key={s.label} variants={item} whileHover={{ scale: 1.03, y: -2 }}>
                <Card className="border-border/50 hover:shadow-kivara transition-all duration-300 overflow-hidden">
                  <div className="h-0.5 gradient-kivara" />
                  <CardContent className="p-4">
                    <div className={`${s.bg} rounded-2xl p-2.5 w-fit mb-2`}>
                      <s.icon className={`h-4 w-4 ${s.color}`} />
                    </div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{s.label}</p>
                    <p className="font-display font-bold text-xl mt-0.5">
                      {typeof s.value === 'number' ? `🪙 ${s.value}` : s.value}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Insight da Semana */}
          <motion.div variants={item} initial="hidden" animate="show">
            <Card className="gradient-kivara text-primary-foreground border-0 overflow-hidden relative">
              <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
              <CardContent className="p-6 relative">
                <div className="flex items-start gap-3">
                  <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-3 shrink-0">
                    <Lightbulb className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-display font-bold text-lg mb-1">Insight da Semana</p>
                    <p className="text-primary-foreground/70 text-sm leading-relaxed">
                      {topSaver && totalEarned > 0
                        ? `${topSaver.displayName} tem o maior saldo com 🪙 ${topSaver.balance}. A taxa de poupança geral é de ${savingsRate}%. ${savingsRate >= 30 ? 'Excelente resultado! 🎉' : 'Considere criar metas de poupança para motivar mais.'}`
                        : 'Adicione crianças e comece a registar atividade para ver insights personalizados.'
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Behavioral Insights from real data */}
          <motion.div variants={item} initial="hidden" animate="show">
            <Card className="border-border/50 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-secondary via-accent to-destructive" />
              <CardContent className="p-5">
                <h3 className="font-display font-bold text-sm mb-4 flex items-center gap-2">
                  <span className="text-lg">🧠</span> Insights Comportamentais
                </h3>
                <div className="space-y-3">
                  {children.map((child) => {
                    const childTasks = householdTasks.filter(t => t.childProfileId === child.profileId);
                    const completedCount = childTasks.filter(t => t.status === 'completed' || t.status === 'approved').length;
                    const taskRate = childTasks.length > 0 ? Math.round((completedCount / childTasks.length) * 100) : 0;
                    const isGood = taskRate >= 50;
                    const cfg = isGood
                      ? { icon: CheckCircle, color: 'text-secondary', bg: 'bg-[hsl(var(--kivara-light-green))]', border: 'border-secondary/20' }
                      : { icon: AlertTriangle, color: 'text-destructive', bg: 'bg-[hsl(var(--kivara-pink))]', border: 'border-destructive/20' };
                    return (
                      <motion.div
                        key={child.childId}
                        whileHover={{ x: 4 }}
                        className={`flex items-start gap-3 p-3.5 rounded-2xl border ${cfg.border} ${cfg.bg}/30 transition-all`}
                      >
                        <div className={`w-8 h-8 rounded-xl ${cfg.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                          <cfg.icon className={`h-4 w-4 ${cfg.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="text-sm font-display font-bold">
                              {isGood ? 'Bom progresso' : 'Precisa de incentivo'}
                            </p>
                            <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground font-medium">{child.displayName}</span>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {completedCount} de {childTasks.length} tarefas concluídas ({taskRate}%). Saldo: 🪙 {child.balance}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <span className="font-display font-bold text-xs">{taskRate}%</span>
                          {isGood ? <TrendingUp className="h-3 w-3 text-secondary" /> : <TrendingDown className="h-3 w-3 text-destructive" />}
                        </div>
                      </motion.div>
                    );
                  })}
                  {children.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">Adicione crianças para ver insights.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Charts Row */}
          <motion.div variants={container} initial="hidden" animate="show" className="grid md:grid-cols-2 gap-4">
            {/* Weekly Trend */}
            <motion.div variants={item}>
              <Card className="border-border/50 overflow-hidden">
                <div className="h-1 gradient-kivara" />
                <CardContent className="p-5">
                  <h3 className="font-display font-bold text-sm mb-4 flex items-center gap-2">
                    <span className="text-lg">📈</span> Tendência Semanal
                  </h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={weeklyTrend}>
                      <defs>
                        <linearGradient id="gradGanho" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={COLORS.green} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={COLORS.green} stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gradPoupado" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={COLORS.blue} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={COLORS.blue} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 20%, 92%)" />
                      <XAxis dataKey="week" tick={{ fontSize: 11 }} stroke="hsl(214, 20%, 70%)" />
                      <YAxis tick={{ fontSize: 11 }} stroke="hsl(214, 20%, 70%)" />
                      <Tooltip contentStyle={customTooltipStyle} />
                      <Area type="monotone" dataKey="ganho" stroke={COLORS.green} fill="url(#gradGanho)" strokeWidth={2} />
                      <Area type="monotone" dataKey="poupado" stroke={COLORS.blue} fill="url(#gradPoupado)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center gap-4 mt-3">
                    {[{ name: 'Ganho', color: COLORS.green }, { name: 'Poupado', color: COLORS.blue }, { name: 'Gasto', color: COLORS.red }].map((l) => (
                      <div key={l.name} className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: l.color }} />
                        <span className="text-[10px] text-muted-foreground font-medium">{l.name}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Pie Chart */}
            <motion.div variants={item}>
              <Card className="border-border/50 overflow-hidden">
                <div className="h-1 gradient-gold" />
                <CardContent className="p-5">
                  <h3 className="font-display font-bold text-sm mb-4 flex items-center gap-2">
                    <span className="text-lg">🍩</span> Distribuição Financeira
                  </h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value" strokeWidth={0}>
                        {pieData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={pieColors[index]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={customTooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap justify-center gap-3 sm:gap-5 mt-3">
                    {pieData.map((entry, i) => (
                      <div key={entry.name} className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: pieColors[i] }} />
                        <span className="text-[10px] text-muted-foreground font-medium">{entry.name}</span>
                        <span className="text-xs font-display font-bold">🪙 {entry.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Tasks Bar Chart + Child Progress */}
          <motion.div variants={container} initial="hidden" animate="show" className="grid md:grid-cols-2 gap-4">
            <motion.div variants={item}>
              <Card className="border-border/50 overflow-hidden">
                <div className="h-1 bg-secondary" />
                <CardContent className="p-5">
                  <h3 className="font-display font-bold text-sm mb-4 flex items-center gap-2">
                    <span className="text-lg">📊</span> Tarefas por Criança
                  </h3>
                  {taskData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={taskData} barGap={2}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 20%, 92%)" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(214, 20%, 70%)" />
                        <YAxis tick={{ fontSize: 11 }} stroke="hsl(214, 20%, 70%)" />
                        <Tooltip contentStyle={customTooltipStyle} />
                        <Bar dataKey="completas" fill={COLORS.green} radius={[6, 6, 0, 0]} />
                        <Bar dataKey="progresso" fill={COLORS.gold} radius={[6, 6, 0, 0]} />
                        <Bar dataKey="pendentes" fill="hsl(214, 20%, 85%)" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">Sem dados de tarefas</p>
                  )}
                  <div className="flex justify-center gap-4 mt-3">
                    {[{ name: 'Completas', color: COLORS.green }, { name: 'Progresso', color: COLORS.gold }, { name: 'Pendentes', color: 'hsl(214, 20%, 85%)' }].map((l) => (
                      <div key={l.name} className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: l.color }} />
                        <span className="text-[10px] text-muted-foreground font-medium">{l.name}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card className="border-border/50 overflow-hidden">
                <div className="h-1 bg-accent" />
                <CardContent className="p-5 space-y-4">
                  <h3 className="font-display font-bold text-sm flex items-center gap-2">
                    <span className="text-lg">🎯</span> Progresso por Criança
                  </h3>
                  {children.map((child) => {
                    const childTasks = householdTasks.filter(t => t.childProfileId === child.profileId);
                    const completedCount = childTasks.filter(t => t.status === 'completed' || t.status === 'approved').length;
                    const taskProgress = childTasks.length > 0 ? Math.round((completedCount / childTasks.length) * 100) : 0;

                    return (
                      <div key={child.childId} className="bg-muted/30 rounded-2xl p-4 space-y-3 border border-border/30">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(var(--kivara-light-blue))] to-[hsl(var(--kivara-light-green))] flex items-center justify-center text-xl shadow-sm">
                            {child.avatar}
                          </div>
                          <div className="flex-1">
                            <p className="font-display font-bold text-sm">{child.displayName}</p>
                            <p className="text-[10px] text-muted-foreground">🪙 {child.balance}</p>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-[10px] text-muted-foreground font-medium">Tarefas</span>
                            <span className="text-[10px] font-display font-bold text-secondary">{taskProgress}%</span>
                          </div>
                          <Progress value={taskProgress} className="h-1.5 rounded-full" />
                        </div>
                      </div>
                    );
                  })}
                  {children.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">Sem crianças registadas</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </>
      )}
    </div>
    </FeatureGateWrapper>
  );
}
