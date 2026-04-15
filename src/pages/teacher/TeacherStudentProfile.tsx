import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Wallet, Target, CheckCircle2, Trophy, TrendingUp, Clock, Coins } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useT } from '@/contexts/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { useWalletBalance, useWalletTransactions } from '@/hooks/use-wallet';
import { useBadgesWithProgress } from '@/hooks/use-badges';
import { Skeleton } from '@/components/ui/skeleton';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

function useStudentProfile(studentProfileId?: string) {
  return useQuery({
    queryKey: ['student-profile', studentProfileId],
    queryFn: async () => {
      if (!studentProfileId) return null;
      const data = await api.get<any>('/profiles/' + studentProfileId);
      return data;
    },
    enabled: !!studentProfileId,
  });
}

function useStudentTasks(studentProfileId?: string) {
  return useQuery({
    queryKey: ['student-tasks', studentProfileId],
    queryFn: async () => {
      if (!studentProfileId) return [];
      const res = await api.get<any>('/tasks?profile_id=' + studentProfileId);
      const items = Array.isArray(res) ? res : (res?.data ?? []);
      return items;
    },
    enabled: !!studentProfileId,
  });
}

function useStudentVaults(studentProfileId?: string) {
  return useQuery({
    queryKey: ['student-vaults', studentProfileId],
    queryFn: async () => {
      if (!studentProfileId) return [];
      const res = await api.get<any>('/vaults?profile_id=' + studentProfileId);
      const items = Array.isArray(res) ? res : (res?.data ?? []);
      return items;
    },
    enabled: !!studentProfileId,
  });
}

export default function TeacherStudentProfile() {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const t = useT();

  const { data: profile, isLoading: loadingProfile } = useStudentProfile(studentId);
  const { data: walletData } = useWalletBalance(studentId);
  const { data: walletTx = [] } = useWalletTransactions(studentId, 10);
  const { data: tasks = [] } = useStudentTasks(studentId);
  const { data: vaults = [] } = useStudentVaults(studentId);
  const badgesData = useBadgesWithProgress(studentId);

  const [chartPeriod, setChartPeriod] = useState<'weekly' | 'monthly'>('weekly');

  const statusLabels: Record<string, { label: string; color: string }> = {
    available: { label: t('teacher.student.status_pending'), color: 'bg-muted text-muted-foreground' },
    in_progress: { label: t('teacher.student.status_in_progress'), color: 'bg-primary/10 text-primary' },
    completed: { label: t('teacher.student.status_completed'), color: 'bg-secondary/10 text-secondary' },
  };

  const balance = Number(walletData?.balance ?? 0);
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const unlockedBadges = badgesData.filter(b => b.unlockedAt);

  const savingsChartData = useMemo(() => {
    if (walletTx.length === 0) {
      const base = balance > 0 ? balance : 100;
      if (chartPeriod === 'weekly') {
        const weeks = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6'];
        return weeks.map((w, i) => ({ date: w, poupança: Math.round(base * 0.15 * (i + 1)), saldo: Math.round(base * (0.4 + i * 0.12)) }));
      }
      const months = ['Out', 'Nov', 'Dez', 'Jan', 'Fev', 'Mar'];
      return months.map((m, i) => ({ date: m, poupança: Math.round(base * 0.08 * (i + 1) * (i + 1)), saldo: Math.round(base * (0.2 + i * 0.16)) }));
    }

    let cumSaved = 0;
    let cumBalance = 0;
    return walletTx.map(tx => {
      if (tx.entry_type === 'vault_deposit') cumSaved += tx.amount;
      if (tx.direction === 'credit') cumBalance += tx.amount;
      if (tx.direction === 'debit') cumBalance -= tx.amount;
      const d = new Date(tx.created_at);
      return { date: `${d.getDate()}/${d.getMonth() + 1}`, poupança: cumSaved, saldo: Math.max(0, cumBalance) };
    });
  }, [walletTx, balance, chartPeriod]);

  if (loadingProfile) {
    return <div className="space-y-4"><Skeleton className="h-10 w-32" /><Skeleton className="h-40 w-full" /></div>;
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <p className="text-muted-foreground">{t('teacher.student.not_found')}</p>
        <Button variant="outline" onClick={() => navigate('/teacher/classes')} className="rounded-xl">
          <ArrowLeft className="h-4 w-4 mr-2" /> {t('teacher.student.back')}
        </Button>
      </div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4 sm:space-y-6 max-w-4xl mx-auto">
      <motion.div variants={item}>
        <Button variant="ghost" onClick={() => navigate('/teacher/classes')} className="rounded-xl text-muted-foreground hover:text-foreground gap-2">
          <ArrowLeft className="h-4 w-4" /> {t('teacher.student.back')}
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
                {profile.avatar ?? '👤'}
              </div>
              <div className="space-y-1">
                <h1 className="font-display text-xl sm:text-2xl md:text-3xl font-bold text-primary-foreground">{profile.display_name}</h1>
                <span className="text-primary-foreground/60 text-xs">🪙 {balance} KVC</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: t('teacher.student.balance'), value: `${balance}`, icon: Wallet, color: 'text-primary' },
          { label: t('teacher.student.savings'), value: `${vaults.length}`, icon: TrendingUp, color: 'text-secondary' },
          { label: t('teacher.student.tasks'), value: `${completedTasks}`, icon: CheckCircle2, color: 'text-emerald-500' },
          { label: 'Badges', value: `${unlockedBadges.length}`, icon: Coins, color: 'text-amber-500' },
        ].map(stat => (
          <Card key={stat.label} className="border-border/50">
            <CardContent className="p-4 text-center space-y-1">
              <stat.icon className={`h-5 w-5 mx-auto ${stat.color}`} />
              <p className="font-display font-bold text-xl">{stat.value}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</p>
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
                <TrendingUp className="h-4 w-4 text-secondary" /> {t('teacher.student.savings_evolution')}
              </CardTitle>
              <div className="flex gap-1">
                <Button variant={chartPeriod === 'weekly' ? 'default' : 'outline'} size="sm" className="h-7 text-xs rounded-lg px-3 font-display" onClick={() => setChartPeriod('weekly')}>
                  {t('teacher.student.weekly')}
                </Button>
                <Button variant={chartPeriod === 'monthly' ? 'default' : 'outline'} size="sm" className="h-7 text-xs rounded-lg px-3 font-display" onClick={() => setChartPeriod('monthly')}>
                  {t('teacher.student.monthly')}
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
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '0.75rem', fontSize: '12px' }} />
                  <Area type="monotone" dataKey="saldo" stroke="hsl(var(--secondary))" fill="url(#colorSaldo)" strokeWidth={2} name={t('teacher.student.chart_balance')} />
                  <Area type="monotone" dataKey="poupança" stroke="hsl(var(--primary))" fill="url(#colorPoupanca)" strokeWidth={2} name={t('teacher.student.chart_savings')} />
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
                <Target className="h-4 w-4 text-primary" /> {t('teacher.student.vaults')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {vaults.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">{t('teacher.student.no_vaults')}</p>
              ) : vaults.map(vault => {
                const targetAmount = Number(vault.target_amount);
                const currentAmount = Number(vault.current_amount);
                const pct = targetAmount > 0 ? Math.round((currentAmount / targetAmount) * 100) : 0;
                return (
                  <div key={vault.id} className="space-y-1.5 p-3 rounded-xl bg-muted/20">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-display font-semibold">{vault.icon} {vault.title}</span>
                      <span className="text-xs font-bold text-primary">{pct}%</span>
                    </div>
                    <Progress value={pct} className="h-2" />
                    <p className="text-xs text-muted-foreground">{currentAmount} / {targetAmount} KVC</p>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>

        {/* Tasks / Missions */}
        <motion.div variants={item}>
          <Card className="border-border/50 h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-display flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-secondary" /> {t('teacher.student.tasks')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {tasks.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">{t('teacher.student.no_tasks')}</p>
              ) : tasks.map(task => {
                const s = statusLabels[task.status] ?? statusLabels.available;
                return (
                  <div key={task.id} className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-muted/20">
                    <div className="min-w-0">
                      <p className="text-sm font-display font-semibold truncate">{task.title}</p>
                      <p className="text-xs text-muted-foreground">+{task.reward} KVC</p>
                    </div>
                    <Badge className={`${s.color} border-0 text-xs shrink-0`}>{s.label}</Badge>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>

        {/* Badges/Achievements */}
        <motion.div variants={item}>
          <Card className="border-border/50 h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-display flex items-center gap-2">
                <Trophy className="h-4 w-4 text-amber-500" /> {t('teacher.student.achievements')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {unlockedBadges.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">{t('teacher.student.no_achievements')}</p>
              ) : unlockedBadges.map(b => (
                <div key={b.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/20">
                  <span className="text-2xl">{b.icon}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-display font-semibold">{b.name}</p>
                    <p className="text-xs text-muted-foreground">{b.description}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Transactions */}
        <motion.div variants={item}>
          <Card className="border-border/50 h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-display flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" /> {t('teacher.student.history')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {walletTx.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">{t('teacher.student.no_transactions')}</p>
              ) : walletTx.map(tx => (
                <div key={tx.id} className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-muted/20">
                  <div className="min-w-0">
                    <p className="text-sm font-display font-medium truncate">{tx.description}</p>
                    <p className="text-xs text-muted-foreground">{new Date(tx.created_at).toLocaleDateString('pt-PT')}</p>
                  </div>
                  <span className={`text-sm font-display font-bold shrink-0 ${tx.direction === 'credit' ? 'text-secondary' : 'text-destructive'}`}>
                    {tx.direction === 'credit' ? '+' : '-'}{tx.amount}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
