import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { mockChildren, mockTasks, mockTransactions, mockVaults } from '@/data/mock-data';
import { CoinDisplay } from '@/components/CoinDisplay';
import { Users, ListTodo, CheckCircle, PiggyBank, TrendingUp, ChevronRight, ArrowUpRight, ArrowDownLeft, Sparkles, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

export default function ParentDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const totalDistributed = mockTransactions
    .filter((t) => t.type === 'allowance')
    .reduce((s, t) => s + t.amount, 0);
  const totalBalance = mockChildren.reduce((s, c) => s + c.balance, 0);
  const tasksCompleted = mockTasks.filter((t) => t.status === 'completed' || t.status === 'approved').length;
  const tasksPending = mockTasks.filter((t) => t.status === 'completed').length;
  const recentTransactions = mockTransactions.slice(0, 5);

  const stats = [
    { label: 'Crianças', value: mockChildren.length, icon: Users, bg: 'bg-[hsl(var(--kivara-light-blue))]', iconColor: 'text-primary', to: '/parent/children' },
    { label: 'Distribuído', value: totalDistributed, icon: PiggyBank, bg: 'bg-[hsl(var(--kivara-light-gold))]', iconColor: 'text-accent-foreground', to: '/parent/allowance', suffix: ' 🪙' },
    { label: 'Concluídas', value: tasksCompleted, icon: CheckCircle, bg: 'bg-[hsl(var(--kivara-light-green))]', iconColor: 'text-secondary', to: '/parent/tasks' },
    { label: 'A Aprovar', value: tasksPending, icon: ListTodo, bg: 'bg-[hsl(var(--kivara-pink))]', iconColor: 'text-destructive', to: '/parent/tasks' },
  ];

  const txIcon = (type: string) => {
    if (type === 'earned' || type === 'allowance') return <ArrowDownLeft className="h-3.5 w-3.5 text-secondary" />;
    return <ArrowUpRight className="h-3.5 w-3.5 text-destructive" />;
  };

  const statusConfig: Record<string, { label: string; className: string }> = {
    pending: { label: 'Pendente', className: 'bg-muted text-muted-foreground' },
    in_progress: { label: 'Em Progresso', className: 'bg-[hsl(var(--kivara-light-blue))] text-primary' },
    completed: { label: 'A Aprovar', className: 'bg-[hsl(var(--kivara-light-gold))] text-accent-foreground' },
    approved: { label: 'Aprovada', className: 'bg-[hsl(var(--kivara-light-green))] text-secondary' },
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-5xl mx-auto">
      {/* Hero Welcome */}
      <motion.div variants={item}>
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
                <motion.p
                  key={totalBalance}
                  initial={{ scale: 1.15, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mt-1"
                >
                  {totalBalance} <span className="text-xl">🪙</span>
                </motion.p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((stat) => (
          <motion.div key={stat.label} whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}>
            <Card
              className="cursor-pointer border-border/50 hover:shadow-kivara transition-all duration-300 overflow-hidden"
              onClick={() => navigate(stat.to)}
            >
              <div className="h-0.5 gradient-kivara" />
              <CardContent className="p-4">
                <div className={`w-10 h-10 rounded-2xl ${stat.bg} flex items-center justify-center mb-3`}>
                  <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                </div>
                <p className="font-display text-2xl font-bold">{stat.value}{stat.suffix || ''}</p>
                <p className="text-[10px] text-muted-foreground font-semibold tracking-wider uppercase">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Children Overview */}
        <motion.div variants={item}>
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
              {mockChildren.map((child) => {
                const childVaults = mockVaults.filter((v) => v.childId === child.id);
                const totalSaved = childVaults.reduce((s, v) => s + v.currentAmount, 0);
                return (
                  <motion.div
                    key={child.id}
                    whileHover={{ x: 4 }}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-muted/40 hover:bg-muted/70 transition-all duration-200 cursor-pointer border border-transparent hover:border-border/50"
                    onClick={() => navigate('/parent/children')}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[hsl(var(--kivara-light-blue))] to-[hsl(var(--kivara-light-green))] flex items-center justify-center text-2xl shadow-sm">
                      {child.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-display font-bold text-sm">{child.name}</p>
                      <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                        <span>💰 {child.balance} moedas</span>
                        <span>🏦 {totalSaved} poupado</span>
                      </div>
                    </div>
                    <CoinDisplay amount={child.balance} size="sm" />
                  </motion.div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>

        {/* Tasks to Approve */}
        <motion.div variants={item}>
          <Card className="border-border/50 h-full overflow-hidden">
            <div className="h-0.5 gradient-gold" />
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-display flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[hsl(var(--kivara-light-gold))] flex items-center justify-center">
                  <ListTodo className="h-4 w-4 text-accent-foreground" />
                </div>
                Tarefas Recentes
              </CardTitle>
              <button onClick={() => navigate('/parent/tasks')} className="text-xs text-primary font-semibold flex items-center gap-0.5 hover:underline">
                Ver todas <ChevronRight className="h-3 w-3" />
              </button>
            </CardHeader>
            <CardContent className="space-y-2">
              {mockTasks.slice(0, 4).map((task) => {
                const child = mockChildren.find((c) => c.id === task.childId);
                const status = statusConfig[task.status];
                return (
                  <motion.div
                    key={task.id}
                    whileHover={{ x: 4 }}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-muted/40 hover:bg-muted/70 transition-all duration-200 cursor-pointer border border-transparent hover:border-border/50"
                  >
                    <div className="w-10 h-10 rounded-xl bg-card shadow-sm flex items-center justify-center text-lg border border-border/30">
                      {child?.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-display font-bold truncate">{task.title}</p>
                      <p className="text-[11px] text-muted-foreground">{child?.name} · +{task.reward} 🪙</p>
                    </div>
                    <span className={`text-[10px] font-display font-semibold px-2.5 py-1 rounded-xl ${status.className}`}>
                      {status.label}
                    </span>
                  </motion.div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Savings Overview + Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Savings */}
        <motion.div variants={item}>
          <Card className="border-border/50 overflow-hidden">
            <div className="h-0.5 bg-secondary" />
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-display flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[hsl(var(--kivara-light-green))] flex items-center justify-center">
                  <Target className="h-4 w-4 text-secondary" />
                </div>
                Objectivos de Poupança
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockVaults.map((vault) => {
                const child = mockChildren.find((c) => c.id === vault.childId);
                const pct = Math.round((vault.currentAmount / vault.targetAmount) * 100);
                return (
                  <div key={vault.id} className="bg-muted/30 rounded-2xl p-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-display font-bold text-sm flex items-center gap-2">
                        <span className="text-lg">{vault.icon}</span> {vault.name}
                        <span className="text-[10px] text-muted-foreground font-normal bg-muted rounded-lg px-2 py-0.5">{child?.name}</span>
                      </span>
                      <span className="text-xs text-muted-foreground font-display font-bold">
                        {vault.currentAmount}/{vault.targetAmount} 🪙
                      </span>
                    </div>
                    <div className="relative">
                      <Progress value={pct} className="h-2.5 rounded-full" />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-bold text-primary-foreground drop-shadow">
                        {pct}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div variants={item}>
          <Card className="border-border/50 overflow-hidden">
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
              {recentTransactions.map((tx) => {
                const child = mockChildren.find((c) => c.id === tx.childId);
                return (
                  <div key={tx.id} className="flex items-center justify-between py-3 border-b border-border/30 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-muted/60 flex items-center justify-center">
                        {txIcon(tx.type)}
                      </div>
                      <div>
                        <p className="text-sm font-display font-bold">{tx.description}</p>
                        <p className="text-[11px] text-muted-foreground">{child?.name} · {tx.date}</p>
                      </div>
                    </div>
                    <span className={`text-sm font-display font-bold ${tx.type === 'earned' || tx.type === 'allowance' ? 'text-secondary' : 'text-destructive'}`}>
                      {tx.type === 'earned' || tx.type === 'allowance' ? '+' : '-'}{tx.amount}
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
