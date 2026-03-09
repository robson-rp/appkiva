import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useTeenBudget } from '@/hooks/use-teen-budget';
import { LEVEL_CONFIG, Level } from '@/types/kivara';
import { Wallet, TrendingUp, PiggyBank, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMonthlySummary } from '@/hooks/use-monthly-summary';
import { useWeeklySparkline } from '@/hooks/use-weekly-sparkline';
import { MonthlyEvolutionChart } from '@/components/MonthlyEvolutionChart';
import { WeeklySparkline } from '@/components/WeeklySparkline';
import { TeenBudgetBar } from '@/components/teen/TeenBudgetBar';
import { TeenCategoryBreakdown } from '@/components/teen/TeenCategoryBreakdown';
import { TeenRecentTransactions } from '@/components/teen/TeenRecentTransactions';
import { StreakWidget } from '@/components/StreakWidget';
import { PlanSummaryWidget } from '@/components/PlanSummaryWidget';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useWalletBalance, useWalletTransactions } from '@/hooks/use-wallet';
import { useStreakData } from '@/hooks/use-streaks';
import { useMonthlySpending } from '@/hooks/use-monthly-spending';

export default function TeenDashboard() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Real data hooks
  const { data: walletData } = useWalletBalance();
  const { data: walletTx = [] } = useWalletTransactions(undefined, 10);
  const { data: realBudget } = useTeenBudget();
  const { data: monthlySummary = [] } = useMonthlySummary(6);
  const { data: weeklyData } = useWeeklySparkline();
  const { data: streakData } = useStreakData();
  const { data: monthlySpent = 0 } = useMonthlySpending();

  const teenName = user?.name ?? 'Teen';
  const balance = Number(walletData?.balance ?? 0);
  const monthlyBudget = realBudget && realBudget > 0 ? realBudget : 0;
  const kivaPoints = streakData?.totalActiveDays ? streakData.totalActiveDays * 15 : 0;

  // Determine level from points
  const levels = Object.entries(LEVEL_CONFIG) as [Level, (typeof LEVEL_CONFIG)[Level]][];
  let teenLevel: Level = 'apprentice';
  for (const [key, cfg] of levels) {
    if (kivaPoints >= cfg.minPoints) teenLevel = key;
  }
  const levelConfig = LEVEL_CONFIG[teenLevel];
  const nextLevel = levels.find(([, v]) => v.minPoints > kivaPoints);
  const progressToNext = nextLevel ? ((kivaPoints - levelConfig.minPoints) / (nextLevel[1].minPoints - levelConfig.minPoints)) * 100 : 100;

  // Compute spending from wallet transactions
  const totalSpent = walletTx.filter(t => t.direction === 'debit').reduce((s, t) => s + t.amount, 0) || monthlySpent;
  const totalSaved = walletTx.filter(t => t.entry_type === 'vault_deposit').reduce((s, t) => s + t.amount, 0);
  const budgetUsed = monthlyBudget > 0 ? (totalSpent / monthlyBudget) * 100 : 0;

  // Category breakdown from wallet transactions
  const categorySpend = walletTx
    .filter(t => t.direction === 'debit' && t.metadata && (t.metadata as any).category)
    .reduce((acc, t) => {
      const cat = (t.metadata as any).category as string;
      acc[cat] = (acc[cat] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const topCategories = Object.entries(categorySpend)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4) as [string, number][];

  // Map wallet transactions for the recent list
  const recentTx = walletTx.slice(0, 5).map(tx => ({
    id: tx.id,
    childId: user?.profileId ?? '',
    amount: tx.amount,
    type: tx.direction === 'credit' ? ('earned' as const) : ('spent' as const),
    description: tx.description,
    date: new Date(tx.created_at).toLocaleDateString('pt-PT'),
    category: (tx.metadata as any)?.category,
  }));

  const stats = [
    { label: t('common.balance'), value: `${balance} 🪙`, icon: Wallet, color: 'text-primary' },
    { label: t('teen.wallet.title'), value: monthlyBudget > 0 ? `${Math.round(budgetUsed)}%` : '—', icon: Target, color: budgetUsed > 80 ? 'text-destructive' : 'text-chart-3' },
    { label: t('tx.vault_deposit'), value: `${totalSaved} 🪙`, icon: PiggyBank, color: 'text-chart-3' },
    { label: t('tx.purchase'), value: `${totalSpent} 🪙`, icon: TrendingUp, color: 'text-chart-1' },
  ];

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-heading md:text-heading-lg font-display font-bold text-foreground">
          {t('parent.dashboard.hello')} {teenName}! 💪
        </h1>
        <p className="text-muted-foreground text-base mt-1">
          {levelConfig.avatar} {levelConfig.label} • {kivaPoints} KivaPoints
        </p>
        <Progress value={progressToNext} className="mt-3 h-3" />
        <p className="text-small text-muted-foreground mt-1.5">
          {nextLevel ? `${nextLevel[1].minPoints - kivaPoints} ${t('teen.dashboard.points_to_next')} ${nextLevel[1].label}` : t('teen.dashboard.max_level')}
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4" data-onboarding="wallet">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="border-border/50">
              <CardContent className="p-5">
                <div className="flex items-center gap-2.5 mb-2">
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  <span className="text-small text-muted-foreground">{stat.label}</span>
                </div>
                <p className="text-xl font-display font-bold text-foreground">{stat.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Streak */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <StreakWidget onClick={() => navigate('/teen/streaks')} />
      </motion.div>

      {/* Weekly Sparkline */}
      {weeklyData && weeklyData.points.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <WeeklySparkline points={weeklyData.points} totalEarned={weeklyData.totalEarned} totalSpent={weeklyData.totalSpent} />
        </motion.div>
      )}

      {/* Budget */}
      {monthlyBudget > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} data-onboarding="missions">
          <TeenBudgetBar totalSpent={totalSpent} monthlyBudget={monthlyBudget} budgetUsed={budgetUsed} />
        </motion.div>
      )}

      {/* Categories */}
      {topCategories.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} data-onboarding="vaults">
          <TeenCategoryBreakdown topCategories={topCategories} totalSpent={totalSpent} />
        </motion.div>
      )}

      {/* Recent Transactions */}
      {recentTx.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <TeenRecentTransactions transactions={recentTx} />
        </motion.div>
      )}

      {/* Monthly Chart */}
      {monthlySummary.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} data-onboarding="analytics">
          <MonthlyEvolutionChart data={monthlySummary} />
        </motion.div>
      )}

      {/* Plan Summary */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <PlanSummaryWidget compact />
      </motion.div>
    </div>
  );
}
