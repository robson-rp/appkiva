import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Wallet, Target, CheckCircle2, Trophy, TrendingUp, Clock, Coins } from 'lucide-react';
import { mockChildren, mockLeaderboard, mockTasks, mockTransactions, mockVaults, mockAchievements } from '@/data/mock-data';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

const statusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pendente', color: 'bg-muted text-muted-foreground' },
  in_progress: { label: 'Em curso', color: 'bg-primary/10 text-primary' },
  completed: { label: 'Completa', color: 'bg-secondary/10 text-secondary' },
  approved: { label: 'Aprovada', color: 'bg-secondary/10 text-secondary' },
};

const txTypeLabels: Record<string, { label: string; color: string; sign: string }> = {
  allowance: { label: 'Mesada', color: 'text-primary', sign: '+' },
  earned: { label: 'Ganho', color: 'text-secondary', sign: '+' },
  saved: { label: 'Poupança', color: 'text-blue-500', sign: '→' },
  spent: { label: 'Gasto', color: 'text-destructive', sign: '-' },
  donated: { label: 'Doação', color: 'text-amber-500', sign: '-' },
};

export default function TeacherStudentProfile() {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();

  const leaderboard = mockLeaderboard.find(s => s.childId === studentId);
  const child = mockChildren.find(c => c.id === studentId);
  const studentTransactions = mockTransactions.filter(t => t.childId === studentId);
  const balance = child?.balance ?? 0;
  const [chartPeriod, setChartPeriod] = useState<'weekly' | 'monthly'>('weekly');

  const savingsChartData = useMemo(() => {
    const sorted = [...studentTransactions].sort((a, b) => a.date.localeCompare(b.date));
    let cumSaved = 0;
    let cumBalance = 0;
    const points = sorted.map(tx => {
      if (tx.type === 'saved') cumSaved += tx.amount;
      if (tx.type === 'allowance' || tx.type === 'earned') cumBalance += tx.amount;
      if (tx.type === 'spent' || tx.type === 'donated') cumBalance -= tx.amount;
      const d = new Date(tx.date);
      return { date: `${d.getDate()}/${d.getMonth() + 1}`, poupança: cumSaved, saldo: Math.max(0, cumBalance) };
    });

    const base = balance > 0 ? balance : 100;
    if (chartPeriod === 'weekly') {
      if (points.length >= 4) return points;
      const weeks = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6'];
      return weeks.map((w, i) => ({
        date: w,
        poupança: Math.round(base * 0.15 * (i + 1)),
        saldo: Math.round(base * (0.4 + i * 0.12)),
      }));
    }
    // monthly
    const months = ['Out', 'Nov', 'Dez', 'Jan', 'Fev', 'Mar'];
    return months.map((m, i) => ({
      date: m,
      poupança: Math.round(base * 0.08 * (i + 1) * (i + 1)),
      saldo: Math.round(base * (0.2 + i * 0.16)),
    }));
  }, [studentTransactions, balance, chartPeriod]);

  if (!leaderboard) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <p className="text-muted-foreground">Aluno não encontrado.</p>
        <Button variant="outline" onClick={() => navigate('/teacher/classes')} className="rounded-xl">
          <ArrowLeft className="h-4 w-4 mr-2" /> Voltar às Turmas
        </Button>
      </div>
    );
  }
  const studentVaults = mockVaults.filter(v => v.childId === studentId);
  const studentTasks = mockTasks.filter(t => t.childId === studentId);
  const studentAchievements = mockAchievements.filter(a => a.childId === studentId);
  const kivaPoints = leaderboard.kivaPoints;
  const completedTasks = studentTasks.filter(t => t.status === 'completed' || t.status === 'approved').length;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4 sm:space-y-6 max-w-4xl mx-auto">
      {/* Back */}
      <motion.div variants={item}>
        <Button variant="ghost" onClick={() => navigate('/teacher/classes')} className="rounded-xl text-muted-foreground hover:text-foreground gap-2">
          <ArrowLeft className="h-4 w-4" /> Voltar às Turmas
        </Button>
      </motion.div>

      {/* Hero */}
      <motion.div variants={item}>
        <Card className="border-0 overflow-hidden relative shadow-kivara">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-secondary" />
          <div className="absolute top-[-30%] right-[-10%] w-[45%] h-[80%] rounded-full bg-white/5 blur-3xl" />
          <CardContent className="relative z-10 p-6 sm:p-8">
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center text-4xl sm:text-5xl">
                {leaderboard.avatar}
              </div>
              <div className="space-y-1">
                <h1 className="font-display text-xl sm:text-2xl md:text-3xl font-bold text-primary-foreground">{leaderboard.name}</h1>
                <div className="flex flex-wrap items-center gap-2">
                  {child && (
                    <Badge className="bg-white/15 text-primary-foreground border-0 text-[10px] uppercase tracking-wider">
                      Nível: {child.level}
                    </Badge>
                  )}
                  <span className="text-primary-foreground/60 text-xs">⭐ {kivaPoints} KivaPoints</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Saldo', value: `${balance}`, icon: Wallet, color: 'text-primary' },
          { label: 'Poupança', value: `${leaderboard.savingsRate}%`, icon: TrendingUp, color: 'text-secondary' },
          { label: 'Tarefas', value: `${completedTasks}`, icon: CheckCircle2, color: 'text-emerald-500' },
          { label: 'KivaPoints', value: `${kivaPoints}`, icon: Coins, color: 'text-amber-500' },
        ].map(stat => (
          <Card key={stat.label} className="border-border/50">
            <CardContent className="p-4 text-center space-y-1">
              <stat.icon className={`h-5 w-5 mx-auto ${stat.color}`} />
              <p className="font-display font-bold text-xl">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Savings Evolution Chart */}
      <motion.div variants={item}>
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-display flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-secondary" /> Evolução da Poupança
              </CardTitle>
              <div className="flex gap-1">
                <Button
                  variant={chartPeriod === 'weekly' ? 'default' : 'outline'}
                  size="sm"
                  className="h-7 text-[10px] rounded-lg px-3 font-display"
                  onClick={() => setChartPeriod('weekly')}
                >
                  Semanal
                </Button>
                <Button
                  variant={chartPeriod === 'monthly' ? 'default' : 'outline'}
                  size="sm"
                  className="h-7 text-[10px] rounded-lg px-3 font-display"
                  onClick={() => setChartPeriod('monthly')}
                >
                  Mensal
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={savingsChartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorPoupanca" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorSaldo" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--secondary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.75rem',
                      fontSize: '12px',
                    }}
                  />
                  <Area type="monotone" dataKey="saldo" stroke="hsl(var(--secondary))" fill="url(#colorSaldo)" strokeWidth={2} name="Saldo" />
                  <Area type="monotone" dataKey="poupança" stroke="hsl(var(--primary))" fill="url(#colorPoupanca)" strokeWidth={2} name="Poupança" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Vaults */}
        <motion.div variants={item}>
          <Card className="border-border/50 h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-display flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" /> Cofres
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {studentVaults.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">Sem cofres ativos</p>
              ) : studentVaults.map(vault => {
                const pct = Math.round((vault.currentAmount / vault.targetAmount) * 100);
                return (
                  <div key={vault.id} className="space-y-1.5 p-3 rounded-xl bg-muted/20">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-display font-semibold">{vault.icon} {vault.name}</span>
                      <span className="text-xs font-bold text-primary">{pct}%</span>
                    </div>
                    <Progress value={pct} className="h-2" />
                    <p className="text-[10px] text-muted-foreground">{vault.currentAmount} / {vault.targetAmount} moedas</p>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>

        {/* Tasks */}
        <motion.div variants={item}>
          <Card className="border-border/50 h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-display flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-secondary" /> Tarefas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {studentTasks.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">Sem tarefas</p>
              ) : studentTasks.map(task => {
                const s = statusLabels[task.status] ?? statusLabels.pending;
                return (
                  <div key={task.id} className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-muted/20">
                    <div className="min-w-0">
                      <p className="text-sm font-display font-semibold truncate">{task.title}</p>
                      <p className="text-[10px] text-muted-foreground">+{task.reward} moedas</p>
                    </div>
                    <Badge className={`${s.color} border-0 text-[10px] shrink-0`}>{s.label}</Badge>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>

        {/* Achievements */}
        <motion.div variants={item}>
          <Card className="border-border/50 h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-display flex items-center gap-2">
                <Trophy className="h-4 w-4 text-amber-500" /> Conquistas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {studentAchievements.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">Sem conquistas</p>
              ) : studentAchievements.map(ach => (
                <div key={ach.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/20">
                  <span className="text-2xl">{ach.icon}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-display font-semibold">{ach.title}</p>
                    <p className="text-[10px] text-muted-foreground">{ach.description}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Transactions */}
        <motion.div variants={item}>
          <Card className="border-border/50 h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-display flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" /> Histórico
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {studentTransactions.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">Sem transações</p>
              ) : studentTransactions.map(tx => {
                const t = txTypeLabels[tx.type] ?? txTypeLabels.earned;
                return (
                  <div key={tx.id} className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-muted/20">
                    <div className="min-w-0">
                      <p className="text-sm font-display font-medium truncate">{tx.description}</p>
                      <p className="text-[10px] text-muted-foreground">{tx.date}</p>
                    </div>
                    <span className={`text-sm font-display font-bold shrink-0 ${t.color}`}>
                      {t.sign}{tx.amount}
                    </span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
