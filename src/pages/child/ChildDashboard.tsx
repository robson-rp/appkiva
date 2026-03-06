import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { LevelBadge } from '@/components/LevelBadge';
import { AvatarGlow } from '@/components/AvatarGlow';
import { LevelUpCeremony } from '@/components/LevelUpCeremony';
import { Kivo } from '@/components/Kivo';
import { mockChildren, mockTasks, mockMissions, mockVaults, mockTransactions, mockAchievements } from '@/data/mock-data';
import { StreakWidget } from '@/components/StreakWidget';
import { ListTodo, Target, PiggyBank } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LEVEL_CONFIG, Level } from '@/types/kivara';
import kivoImg from '@/assets/kivo.svg';
import { Button } from '@/components/ui/button';
import { useWalletBalance, useWalletTransactions } from '@/hooks/use-wallet';
import { useAuth } from '@/contexts/AuthContext';
import { useTeenBudget } from '@/hooks/use-teen-budget';
import { useMonthlySpending } from '@/hooks/use-monthly-spending';
import { useMonthlySummary } from '@/hooks/use-monthly-summary';
import { MonthlyEvolutionChart } from '@/components/MonthlyEvolutionChart';
import { useWeeklySparkline } from '@/hooks/use-weekly-sparkline';
import { WeeklySparkline } from '@/components/WeeklySparkline';
import { TeenBudgetBar } from '@/components/teen/TeenBudgetBar';
import { ChildFamilyRankings } from '@/components/child/ChildFamilyRankings';
import { ChildPendingTasks } from '@/components/child/ChildPendingTasks';
import { ChildSavingsProgress } from '@/components/child/ChildSavingsProgress';
import { ChildRecentActivity } from '@/components/child/ChildRecentActivity';
import { ChildAchievementsStrip } from '@/components/child/ChildAchievementsStrip';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

export default function ChildDashboard() {
  const child = mockChildren[0];
  const { user } = useAuth();
  const { data: walletBalance } = useWalletBalance();
  const { data: ledgerTransactions } = useWalletTransactions(undefined, 4);
  const { data: monthlyBudget = 0 } = useTeenBudget();
  const { data: monthlySpent = 0 } = useMonthlySpending();
  const { data: monthlySummary = [] } = useMonthlySummary(6);
  const { data: weeklyData } = useWeeklySparkline();
  const balance = walletBalance?.balance ?? child.balance;
  const [showLevelUp, setShowLevelUp] = useState(false);
  const navigate = useNavigate();

  const budgetPct = monthlyBudget > 0 ? Math.min((monthlySpent / monthlyBudget) * 100, 100) : 0;
  const pendingTasks = mockTasks.filter((t) => t.childId === child.id && t.status === 'pending');
  const activeMissions = mockMissions.filter((m) => m.status === 'available' || (m.status === 'in_progress' && m.childId === child.id));
  const vaults = mockVaults.filter((v) => v.childId === child.id);
  const recentTransactions = ledgerTransactions && ledgerTransactions.length > 0
    ? ledgerTransactions.map(tx => ({
        id: tx.id,
        description: tx.description,
        amount: tx.amount,
        type: tx.direction === 'credit' ? 'earned' : 'spent',
        date: new Date(tx.created_at).toLocaleDateString('pt-PT'),
      }))
    : mockTransactions.filter((t) => t.childId === child.id).slice(0, 4);
  const unlockedAchievements = mockAchievements.filter((a) => a.childId === child.id && a.unlockedAt);

  const levels = Object.keys(LEVEL_CONFIG) as Level[];
  const currentLevelIndex = levels.indexOf(child.level);
  const previousLevel = currentLevelIndex > 0 ? levels[currentLevelIndex - 1] : levels[0];

  const stats = [
    { label: 'Tarefas', value: pendingTasks.length, icon: ListTodo, gradient: 'from-kivara-blue/10 to-kivara-light-blue', iconColor: 'text-primary', to: '/child/wallet' },
    { label: 'Missões', value: activeMissions.length, icon: Target, gradient: 'from-kivara-green/10 to-kivara-light-green', iconColor: 'text-secondary', to: '/child/missions' },
    { label: 'Cofres', value: vaults.length, icon: PiggyBank, gradient: 'from-kivara-gold/10 to-kivara-light-gold', iconColor: 'text-accent', to: '/child/vaults' },
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-5 max-w-2xl mx-auto pb-4">
      {showLevelUp && (
        <LevelUpCeremony fromLevel={previousLevel} toLevel={child.level} onComplete={() => setShowLevelUp(false)} />
      )}

      {/* Hero Balance Card */}
      <motion.div variants={itemVariants}>
        <Card className="border-0 overflow-hidden relative shadow-kivara">
          <div className="absolute inset-0 gradient-kivara" />
          <div className="absolute top-[-30%] right-[-15%] w-[55%] h-[80%] rounded-full bg-white/5 blur-3xl" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[40%] h-[60%] rounded-full bg-white/5 blur-3xl" />
          <CardContent className="relative z-10 p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <AvatarGlow level={child.level} size="md" />
                  <div>
                    <p className="text-white/70 text-sm font-body">A tua carteira</p>
                    <div className="flex items-baseline gap-2">
                      <motion.span key={balance} initial={{ scale: 1.2, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="font-display text-4xl font-bold text-white">
                        {balance}
                      </motion.span>
                      <span className="text-sm text-white/60 font-display">KivaCoins</span>
                    </div>
                  </div>
                </div>
                <div className="pt-1">
                  <LevelBadge level={child.level} points={child.kivaPoints} showProgress showAvatar={false} />
                </div>
              </div>
              <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }} className="mt-1">
                <img src={kivoImg} alt="Kivo" className="w-20 h-20 drop-shadow-2xl" />
              </motion.div>
            </div>
            <Button size="sm" variant="ghost" onClick={() => setShowLevelUp(true)} className="mt-2 text-[10px] text-white/50 hover:text-white/80 hover:bg-white/10 font-display">
              ✨ Ver evolução
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Streak */}
      <motion.div variants={itemVariants}>
        <StreakWidget onClick={() => navigate('/child/streaks')} />
      </motion.div>

      {/* Weekly Sparkline */}
      {weeklyData && weeklyData.points.length > 0 && (
        <motion.div variants={itemVariants}>
          <WeeklySparkline points={weeklyData.points} totalEarned={weeklyData.totalEarned} totalSpent={weeklyData.totalSpent} />
        </motion.div>
      )}

      {/* Quick Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-3 gap-3">
        {stats.map((stat) => (
          <motion.div key={stat.label} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Card className="cursor-pointer border border-border/50 hover:shadow-md transition-all duration-200 overflow-hidden" onClick={() => navigate(stat.to)}>
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

      {/* Monthly Budget */}
      {monthlyBudget > 0 && (
        <motion.div variants={itemVariants}>
          <TeenBudgetBar totalSpent={monthlySpent} monthlyBudget={monthlyBudget} budgetUsed={budgetPct} />
        </motion.div>
      )}

      {/* Monthly Chart */}
      {monthlySummary.length > 0 && (
        <motion.div variants={itemVariants}>
          <MonthlyEvolutionChart data={monthlySummary} />
        </motion.div>
      )}

      {/* Family Rankings */}
      <motion.div variants={itemVariants}>
        <ChildFamilyRankings />
      </motion.div>

      {/* Pending Tasks */}
      <motion.div variants={itemVariants}>
        <ChildPendingTasks tasks={pendingTasks} />
      </motion.div>

      {/* Savings */}
      <motion.div variants={itemVariants}>
        <ChildSavingsProgress vaults={vaults} />
      </motion.div>

      {/* Recent Activity */}
      <motion.div variants={itemVariants}>
        <ChildRecentActivity transactions={recentTransactions} />
      </motion.div>

      {/* Achievements */}
      <motion.div variants={itemVariants}>
        <ChildAchievementsStrip achievements={unlockedAchievements} />
      </motion.div>

      <Kivo page="dashboard" />
    </motion.div>
  );
}
