import { useState } from 'react';
import { usePrefetchRoutes } from '@/hooks/use-prefetch-routes';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { LevelBadge } from '@/components/LevelBadge';
import { AvatarGlow } from '@/components/AvatarGlow';
import { LevelUpCeremony } from '@/components/LevelUpCeremony';
import { PlayerCard } from '@/components/PlayerCard';
import { Kivo } from '@/components/Kivo';
import { useBadgesWithProgress } from '@/hooks/use-badges';
import { useChildMissions } from '@/hooks/use-missions';
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
import { PlanSummaryWidget } from '@/components/PlanSummaryWidget';
import { useChildTasks } from '@/hooks/use-child-tasks';
import { useDreamVaults } from '@/hooks/use-dream-vaults';
import { useStreakData } from '@/hooks/use-streaks';
import { useKivaPoints } from '@/hooks/use-kiva-points';
import { useT } from '@/contexts/LanguageContext';
import { TodayLoop } from '@/components/TodayLoop';
import { BehaviorNudge } from '@/components/BehaviorNudge';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

export default function ChildDashboard() {
  const t = useT();
  usePrefetchRoutes('child');
  const { user } = useAuth();
  const { data: walletBalance } = useWalletBalance();
  const { data: ledgerTransactions } = useWalletTransactions(undefined, 4);
  const { data: monthlyBudget = 0 } = useTeenBudget();
  const { data: monthlySpent = 0 } = useMonthlySpending();
  const { data: monthlySummary = [] } = useMonthlySummary(6);
  const { data: weeklyData } = useWeeklySparkline();
  const { data: tasks = [] } = useChildTasks();
  const { data: dbVaults } = useDreamVaults(user?.profileId);
  const { data: streakData } = useStreakData();

  const childName = user?.name ?? t('child.dashboard.explorer');
  const childAvatar = user?.avatar ?? '🦊';
  const balance = walletBalance?.balance ?? 0;
  const { data: kivaPoints = 0 } = useKivaPoints();
  const childKivaPoints = kivaPoints;

  // Dynamic level calculation from KivaPoints
  const levels = Object.keys(LEVEL_CONFIG) as Level[];
  const childLevel: Level = [...levels].reverse().find(l => kivaPoints >= LEVEL_CONFIG[l].minPoints) ?? 'apprentice';
  const streakDays = streakData?.currentStreak ?? 0;

  const [showLevelUp, setShowLevelUp] = useState(false);
  const navigate = useNavigate();

  const budgetPct = monthlyBudget > 0 ? Math.min((monthlySpent / monthlyBudget) * 100, 100) : 0;
  const pendingTasks = tasks.filter((t) => t.status === 'pending' || t.status === 'in_progress');
  const { data: missionsList = [] } = useChildMissions();
  const activeMissions = missionsList.filter((m) => m.status === 'available' || m.status === 'in_progress');
  const vaults = dbVaults ?? [];
  const vaultsMapped = vaults.map(v => ({
    id: v.id,
    childId: user?.profileId ?? '',
    name: v.title,
    targetAmount: v.targetAmount,
    currentAmount: v.currentAmount,
    icon: v.icon,
    createdAt: v.createdAt,
    interestRate: 0,
  }));

  const recentTransactions = ledgerTransactions && ledgerTransactions.length > 0
    ? ledgerTransactions.map(tx => ({
        id: tx.id,
        description: tx.description,
        amount: tx.amount,
        type: tx.direction === 'credit' ? 'earned' : 'spent',
        date: new Date(tx.created_at).toLocaleDateString('pt-PT'),
      }))
    : [];

  const badgesData = useBadgesWithProgress();
  const unlockedAchievements = badgesData
    .filter(b => b.unlockedAt)
    .map(b => ({ id: b.id, icon: b.icon, title: b.name }));

  const levels = Object.keys(LEVEL_CONFIG) as Level[];
  const currentLevelIndex = levels.indexOf(childLevel);
  const previousLevel = currentLevelIndex > 0 ? levels[currentLevelIndex - 1] : levels[0];

  const stats = [
    { label: t('child.dashboard.tasks'), value: pendingTasks.length, icon: ListTodo, gradient: 'from-kivara-blue/10 to-kivara-light-blue', iconColor: 'text-primary', to: '/child/tasks' },
    { label: t('child.dashboard.missions'), value: activeMissions.length, icon: Target, gradient: 'from-kivara-green/10 to-kivara-light-green', iconColor: 'text-secondary', to: '/child/missions' },
    { label: t('child.dashboard.vaults'), value: vaults.length, icon: PiggyBank, gradient: 'from-kivara-gold/10 to-kivara-light-gold', iconColor: 'text-accent', to: '/child/vaults' },
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-5 max-w-2xl mx-auto pb-4">
      {showLevelUp && (
        <LevelUpCeremony fromLevel={previousLevel} toLevel={childLevel} onComplete={() => setShowLevelUp(false)} />
      )}

      {/* Player Card (Hero) */}
      <motion.div variants={itemVariants} data-onboarding="wallet">
        <PlayerCard
          name={childName}
          level={childLevel}
          points={childKivaPoints}
          balance={balance}
          streakDays={streakDays}
          badgeCount={unlockedAchievements.length}
          weeklyPoints={childKivaPoints}
          onLevelUpClick={() => setShowLevelUp(true)}
        />
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
      <motion.div variants={itemVariants} className="grid grid-cols-3 gap-4">
        {stats.map((stat) => (
          <motion.div key={stat.label} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
            <Card className="cursor-pointer border border-border/50 hover:shadow-md transition-all duration-200 overflow-hidden" onClick={() => navigate(stat.to)}>
              <CardContent className="p-5 text-center relative">
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-40`} />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-card/80 backdrop-blur flex items-center justify-center mx-auto mb-2.5 shadow-sm">
                    <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
                  </div>
                  <p className="font-display text-3xl font-bold">{stat.value}</p>
                  <p className="text-caption text-muted-foreground font-semibold tracking-wide uppercase mt-1">{stat.label}</p>
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
      <motion.div variants={itemVariants} data-onboarding="missions">
        <ChildPendingTasks tasks={pendingTasks.map(t => ({
          id: t.id,
          childId: user?.profileId ?? '',
          title: t.title,
          description: t.description ?? '',
          reward: t.reward,
          category: t.category,
          status: t.status,
          parentId: '',
          createdAt: t.createdAt,
        }))} />
      </motion.div>

      {/* Savings */}
      <motion.div variants={itemVariants} data-onboarding="dreams">
        <ChildSavingsProgress vaults={vaultsMapped} />
      </motion.div>

      {/* Recent Activity */}
      <motion.div variants={itemVariants}>
        <ChildRecentActivity transactions={recentTransactions} />
      </motion.div>

      {/* Achievements */}
      <motion.div variants={itemVariants} data-onboarding="achievements">
        <ChildAchievementsStrip achievements={unlockedAchievements} />
      </motion.div>

      {/* Plan Summary */}
      <motion.div variants={itemVariants}>
        <PlanSummaryWidget compact />
      </motion.div>

      <Kivo page="dashboard" />
    </motion.div>
  );
}
