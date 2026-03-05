import { Card, CardContent } from '@/components/ui/card';
import { mockChildren, mockTasks, mockTransactions, mockVaults, mockInsights } from '@/data/mock-data';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Area, AreaChart,
} from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, PiggyBank, ArrowUpRight, Lightbulb, AlertTriangle, CheckCircle, Minus } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

const COLORS = {
  green: 'hsl(160, 54%, 40%)',
  gold: 'hsl(39, 89%, 57%)',
  blue: 'hsl(214, 64%, 33%)',
  red: 'hsl(0, 72%, 55%)',
};

const weeklyTrend = [
  { week: 'Sem 1', ganho: 45, gasto: 20, poupado: 25 },
  { week: 'Sem 2', ganho: 70, gasto: 35, poupado: 35 },
  { week: 'Sem 3', ganho: 55, gasto: 15, poupado: 40 },
  { week: 'Sem 4', ganho: 80, gasto: 30, poupado: 50 },
];

const periodComparison = [
  { period: 'Fev', poupanca: 32, gasto: 45 },
  { period: 'Mar (atual)', poupanca: 43, gasto: 28 },
];

export default function ParentReports() {
  const taskData = mockChildren.map((child) => ({
    name: child.name,
    completas: mockTasks.filter((t) => t.childId === child.id && (t.status === 'completed' || t.status === 'approved')).length,
    pendentes: mockTasks.filter((t) => t.childId === child.id && t.status === 'pending').length,
    progresso: mockTasks.filter((t) => t.childId === child.id && t.status === 'in_progress').length,
  }));

  const totalEarned = mockTransactions.filter(t => t.type === 'earned' || t.type === 'allowance').reduce((s, t) => s + t.amount, 0);
  const totalSpent = mockTransactions.filter(t => t.type === 'spent').reduce((s, t) => s + t.amount, 0);
  const totalSaved = mockTransactions.filter(t => t.type === 'saved').reduce((s, t) => s + t.amount, 0);
  const savingsRate = Math.round((totalSaved / totalEarned) * 100);

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

  const insightConfig = {
    positive: { icon: CheckCircle, color: 'text-secondary', bg: 'bg-[hsl(var(--kivara-light-green))]', border: 'border-secondary/20' },
    warning: { icon: AlertTriangle, color: 'text-destructive', bg: 'bg-[hsl(var(--kivara-pink))]', border: 'border-destructive/20' },
    neutral: { icon: Minus, color: 'text-muted-foreground', bg: 'bg-muted/60', border: 'border-border/50' },
  };

  const trendIcon = (trend?: string) => {
    if (trend === 'up') return <TrendingUp className="h-3 w-3 text-secondary" />;
    if (trend === 'down') return <TrendingDown className="h-3 w-3 text-destructive" />;
    return <Minus className="h-3 w-3 text-muted-foreground" />;
  };

  return (
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

      {/* Behavioral Insights */}
      <motion.div variants={item} initial="hidden" animate="show">
        <Card className="border-border/50 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-secondary via-accent to-destructive" />
          <CardContent className="p-5">
            <h3 className="font-display font-bold text-sm mb-4 flex items-center gap-2">
              <span className="text-lg">🧠</span> Insights Comportamentais
            </h3>
            <div className="space-y-3">
              {mockInsights.map((insight) => {
                const cfg = insightConfig[insight.type];
                const child = mockChildren.find(c => c.id === insight.childId);
                return (
                  <motion.div
                    key={insight.id}
                    whileHover={{ x: 4 }}
                    className={`flex items-start gap-3 p-3.5 rounded-2xl border ${cfg.border} ${cfg.bg}/30 transition-all`}
                  >
                    <div className={`w-8 h-8 rounded-xl ${cfg.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                      <cfg.icon className={`h-4 w-4 ${cfg.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-display font-bold">{insight.title}</p>
                        <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground font-medium">{child?.name}</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{insight.description}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {insight.metric && <span className="font-display font-bold text-xs">{insight.metric}</span>}
                      {trendIcon(insight.trend)}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Period Comparison */}
      <motion.div variants={item} initial="hidden" animate="show">
        <Card className="border-border/50 overflow-hidden">
          <div className="h-1 gradient-gold" />
          <CardContent className="p-5">
            <h3 className="font-display font-bold text-sm mb-4 flex items-center gap-2">
              <span className="text-lg">📊</span> Comparação entre Períodos
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {periodComparison.map((p, i) => (
                <div key={p.period} className={`rounded-2xl p-4 border ${i === 1 ? 'border-primary/30 bg-primary/5' : 'border-border/30 bg-muted/30'}`}>
                  <p className="text-xs font-display font-bold mb-3">{p.period}</p>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-[10px] text-muted-foreground">Poupança</span>
                        <span className="text-[10px] font-display font-bold text-secondary">{p.poupanca}%</span>
                      </div>
                      <Progress value={p.poupanca} className="h-1.5" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-[10px] text-muted-foreground">Gasto</span>
                        <span className="text-[10px] font-display font-bold text-destructive">{p.gasto}%</span>
                      </div>
                      <Progress value={p.gasto} className="h-1.5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2 bg-[hsl(var(--kivara-light-green))] rounded-xl p-3">
              <TrendingUp className="h-4 w-4 text-secondary shrink-0" />
              <p className="text-[11px] text-foreground">
                <strong>Melhoria de +11%</strong> na taxa de poupança em relação ao mês anterior! 🎉
              </p>
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
              {mockChildren.map((child) => {
                const childVaults = mockVaults.filter(v => v.childId === child.id);
                const totalTarget = childVaults.reduce((s, v) => s + v.targetAmount, 0);
                const totalCurrent = childVaults.reduce((s, v) => s + v.currentAmount, 0);
                const vaultProgress = totalTarget > 0 ? Math.round((totalCurrent / totalTarget) * 100) : 0;
                const childTasks = mockTasks.filter(t => t.childId === child.id);
                const completedTasks = childTasks.filter(t => t.status === 'completed' || t.status === 'approved').length;
                const taskProgress = childTasks.length > 0 ? Math.round((completedTasks / childTasks.length) * 100) : 0;

                return (
                  <div key={child.id} className="bg-muted/30 rounded-2xl p-4 space-y-3 border border-border/30">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(var(--kivara-light-blue))] to-[hsl(var(--kivara-light-green))] flex items-center justify-center text-xl shadow-sm">
                        {child.avatar}
                      </div>
                      <div className="flex-1">
                        <p className="font-display font-bold text-sm">{child.name}</p>
                        <p className="text-[10px] text-muted-foreground">Nível: {child.level} · 🪙 {child.balance}</p>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-[10px] text-muted-foreground font-medium">Tarefas</span>
                        <span className="text-[10px] font-display font-bold text-secondary">{taskProgress}%</span>
                      </div>
                      <Progress value={taskProgress} className="h-1.5 rounded-full" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-[10px] text-muted-foreground font-medium">Cofres</span>
                        <span className="text-[10px] font-display font-bold text-primary">{vaultProgress}%</span>
                      </div>
                      <Progress value={vaultProgress} className="h-1.5 rounded-full" />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Insight Card */}
      <motion.div variants={item}>
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
                  A Ana poupou 43% das moedas ganhas este mês — excelente! 🎉 O Pedro precisa de mais incentivos para poupar. Considere criar uma meta partilhada ou aumentar o bónus por tarefas.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
