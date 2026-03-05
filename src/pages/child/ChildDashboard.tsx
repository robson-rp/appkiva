import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LevelBadge } from '@/components/LevelBadge';
import { Kivo } from '@/components/Kivo';
import { mockChildren, mockTasks, mockMissions, mockVaults, mockTransactions, mockAchievements } from '@/data/mock-data';
import { Progress } from '@/components/ui/progress';
import { ListTodo, Target, PiggyBank, TrendingUp, ArrowUpRight, ArrowDownLeft, Sparkles, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import kivoImg from '@/assets/kivo.svg';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

export default function ChildDashboard() {
  const child = mockChildren[0];
  const pendingTasks = mockTasks.filter((t) => t.childId === child.id && t.status === 'pending');
  const activeMissions = mockMissions.filter((m) => m.status === 'available' || (m.status === 'in_progress' && m.childId === child.id));
  const vaults = mockVaults.filter((v) => v.childId === child.id);
  const recentTransactions = mockTransactions.filter((t) => t.childId === child.id).slice(0, 4);
  const unlockedAchievements = mockAchievements.filter((a) => a.childId === child.id && a.unlockedAt);
  const navigate = useNavigate();

  const stats = [
    { label: 'Tarefas', value: pendingTasks.length, icon: ListTodo, gradient: 'from-kivara-blue/10 to-kivara-light-blue', iconColor: 'text-primary', to: '/child/wallet' },
    { label: 'Missões', value: activeMissions.length, icon: Target, gradient: 'from-kivara-green/10 to-kivara-light-green', iconColor: 'text-secondary', to: '/child/missions' },
    { label: 'Cofres', value: vaults.length, icon: PiggyBank, gradient: 'from-kivara-gold/10 to-kivara-light-gold', iconColor: 'text-accent', to: '/child/vaults' },
  ];

  const txIcon = (type: string) => {
    if (type === 'earned' || type === 'allowance') return <ArrowDownLeft className="h-3.5 w-3.5 text-secondary" />;
    return <ArrowUpRight className="h-3.5 w-3.5 text-destructive" />;
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-5 max-w-2xl mx-auto pb-4"
    >
      {/* Hero Balance Card */}
      <motion.div variants={itemVariants}>
        <Card className="border-0 overflow-hidden relative shadow-kivara">
          <div className="absolute inset-0 gradient-kivara" />
          <div className="absolute top-[-30%] right-[-15%] w-[55%] h-[80%] rounded-full bg-white/5 blur-3xl" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[40%] h-[60%] rounded-full bg-white/5 blur-3xl" />
          <CardContent className="relative z-10 p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-3">
                <p className="text-white/70 text-sm font-body">A tua carteira</p>
                <div className="flex items-baseline gap-2">
                  <motion.span
                    key={child.balance}
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="font-display text-5xl font-bold text-white"
                  >
                    {child.balance}
                  </motion.span>
                  <span className="text-2xl">🪙</span>
                </div>
                <div className="pt-1">
                  <LevelBadge level={child.level} points={child.kivaPoints} showProgress />
                </div>
              </div>
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                className="mt-1"
              >
                <img src={kivoImg} alt="Kivo" className="w-20 h-20 drop-shadow-2xl" />
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-3 gap-3">
        {stats.map((stat) => (
          <motion.div
            key={stat.label}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Card
              className="cursor-pointer border border-border/50 hover:shadow-md transition-all duration-200 overflow-hidden"
              onClick={() => navigate(stat.to)}
            >
              <CardContent className="p-4 text-center relative">
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-40`} />
                <div className="relative z-10">
                  <div className="w-11 h-11 rounded-2xl bg-card/80 backdrop-blur flex items-center justify-center mx-auto mb-2 shadow-sm">
                    <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                  </div>
                  <p className="font-display text-2xl font-bold">{stat.value}</p>
                  <p className="text-[10px] text-muted-foreground font-semibold tracking-wide uppercase">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Active Tasks Preview */}
      {pendingTasks.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card className="border border-border/50">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-display flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                  <ListTodo className="h-3.5 w-3.5 text-primary" />
                </div>
                Próximas Tarefas
              </CardTitle>
              <button onClick={() => navigate('/child/wallet')} className="text-xs text-primary font-semibold flex items-center gap-0.5 hover:underline">
                Ver todas <ChevronRight className="h-3 w-3" />
              </button>
            </CardHeader>
            <CardContent className="space-y-2">
              {pendingTasks.slice(0, 2).map((task) => (
                <motion.div
                  key={task.id}
                  whileHover={{ x: 4 }}
                  className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-sm">
                      {task.category === 'cleaning' ? '🧹' : task.category === 'studying' ? '📚' : '🤝'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{task.title}</p>
                      <p className="text-[11px] text-muted-foreground">{task.description?.slice(0, 35)}...</p>
                    </div>
                  </div>
                  <span className="text-sm font-display font-bold text-secondary">+{task.reward} 🪙</span>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Savings Progress */}
      {vaults.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card className="border border-border/50">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-display flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-secondary/10 flex items-center justify-center">
                  <TrendingUp className="h-3.5 w-3.5 text-secondary" />
                </div>
                Poupanças
              </CardTitle>
              <button onClick={() => navigate('/child/vaults')} className="text-xs text-primary font-semibold flex items-center gap-0.5 hover:underline">
                Ver cofres <ChevronRight className="h-3 w-3" />
              </button>
            </CardHeader>
            <CardContent className="space-y-3">
              {vaults.map((vault) => {
                const pct = Math.round((vault.currentAmount / vault.targetAmount) * 100);
                return (
                  <div key={vault.id} className="space-y-1.5">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-semibold flex items-center gap-1.5">
                        <span className="text-base">{vault.icon}</span> {vault.name}
                      </span>
                      <span className="text-xs text-muted-foreground font-display font-bold">
                        {vault.currentAmount}/{vault.targetAmount} 🪙
                      </span>
                    </div>
                    <div className="relative">
                      <Progress value={pct} className="h-3 rounded-full" />
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
      )}

      {/* Recent Transactions */}
      <motion.div variants={itemVariants}>
        <Card className="border border-border/50">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-display flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center">
                <Sparkles className="h-3.5 w-3.5 text-accent" />
              </div>
              Actividade Recente
            </CardTitle>
            <button onClick={() => navigate('/child/wallet')} className="text-xs text-primary font-semibold flex items-center gap-0.5 hover:underline">
              Ver tudo <ChevronRight className="h-3 w-3" />
            </button>
          </CardHeader>
          <CardContent className="space-y-1">
            {recentTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between py-2.5 border-b border-border/30 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    {txIcon(tx.type)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{tx.description}</p>
                    <p className="text-[11px] text-muted-foreground">{tx.date}</p>
                  </div>
                </div>
                <span className={`text-sm font-display font-bold ${tx.type === 'earned' || tx.type === 'allowance' ? 'text-secondary' : 'text-destructive'}`}>
                  {tx.type === 'earned' || tx.type === 'allowance' ? '+' : '-'}{tx.amount}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Achievements Strip */}
      {unlockedAchievements.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card className="border border-border/50 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-kivara-light-gold/30 to-kivara-light-blue/30 opacity-50" />
            <CardContent className="p-4 relative">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-display font-bold flex items-center gap-1.5">🏆 Conquistas</p>
                <button onClick={() => navigate('/child/achievements')} className="text-xs text-primary font-semibold flex items-center gap-0.5 hover:underline">
                  Ver todas <ChevronRight className="h-3 w-3" />
                </button>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-1">
                {unlockedAchievements.map((ach) => (
                  <motion.div
                    key={ach.id}
                    whileHover={{ scale: 1.05 }}
                    className="flex-shrink-0 w-20 text-center"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-card shadow-sm flex items-center justify-center mx-auto mb-1 text-2xl">
                      {ach.icon}
                    </div>
                    <p className="text-[10px] font-semibold text-muted-foreground leading-tight">{ach.title}</p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <Kivo page="dashboard" />
    </motion.div>
  );
}
