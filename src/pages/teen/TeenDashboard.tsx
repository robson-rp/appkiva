import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { mockTeens, mockTeenTransactions } from '@/data/mock-data';
import { useTeenBudget } from '@/hooks/use-teen-budget';
import { LEVEL_CONFIG } from '@/types/kivara';
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

export default function TeenDashboard() {
  const teen = mockTeens[0];
  const navigate = useNavigate();
  const { data: realBudget } = useTeenBudget();
  const { data: monthlySummary = [] } = useMonthlySummary(6);
  const { data: weeklyData } = useWeeklySparkline();
  const monthlyBudget = realBudget && realBudget > 0 ? realBudget : teen.monthlyBudget;
  const levelConfig = LEVEL_CONFIG[teen.level];
  const nextLevel = Object.entries(LEVEL_CONFIG).find(([, v]) => v.minPoints > teen.kivaPoints);
  const progressToNext = nextLevel ? ((teen.kivaPoints - levelConfig.minPoints) / (nextLevel[1].minPoints - levelConfig.minPoints)) * 100 : 100;

  const recentTx = mockTeenTransactions.slice(0, 5);
  const totalSpent = mockTeenTransactions.filter(t => t.type === 'spent').reduce((s, t) => s + t.amount, 0);
  const totalSaved = mockTeenTransactions.filter(t => t.type === 'saved').reduce((s, t) => s + t.amount, 0);
  const budgetUsed = monthlyBudget > 0 ? (totalSpent / monthlyBudget) * 100 : 0;

  const categorySpend = mockTeenTransactions
    .filter(t => t.type === 'spent' && t.category)
    .reduce((acc, t) => {
      acc[t.category!] = (acc[t.category!] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const topCategories = Object.entries(categorySpend)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4) as [string, number][];

  const stats = [
    { label: 'Saldo', value: `${teen.balance} 🪙`, icon: Wallet, color: 'text-primary' },
    { label: 'Orçamento', value: `${Math.round(budgetUsed)}% usado`, icon: Target, color: budgetUsed > 80 ? 'text-destructive' : 'text-chart-3' },
    { label: 'Poupado', value: `${totalSaved} 🪙`, icon: PiggyBank, color: 'text-chart-3' },
    { label: 'Gasto', value: `${totalSpent} 🪙`, icon: TrendingUp, color: 'text-chart-1' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
          Olá, {teen.name}! 💪
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {levelConfig.avatar} {levelConfig.label} • {teen.kivaPoints} KivaPoints
        </p>
        <Progress value={progressToNext} className="mt-2 h-2" />
        <p className="text-[10px] text-muted-foreground mt-1">
          {nextLevel ? `${nextLevel[1].minPoints - teen.kivaPoints} pontos para ${nextLevel[1].label}` : 'Nível máximo!'}
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3" data-onboarding="wallet">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  <span className="text-xs text-muted-foreground">{stat.label}</span>
                </div>
                <p className="text-lg font-display font-bold text-foreground">{stat.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Streak */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <StreakWidget onClick={() => navigate('/teen/streaks')} />
      </motion.div>

      {/* Weekly Sparkline */}
      {weeklyData && weeklyData.points.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <WeeklySparkline points={weeklyData.points} totalEarned={weeklyData.totalEarned} totalSpent={weeklyData.totalSpent} />
        </motion.div>
      )}

      {/* Budget */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} data-onboarding="missions">
        <TeenBudgetBar totalSpent={totalSpent} monthlyBudget={monthlyBudget} budgetUsed={budgetUsed} />
      </motion.div>

      {/* Categories */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} data-onboarding="vaults">
        <TeenCategoryBreakdown topCategories={topCategories} totalSpent={totalSpent} />
      </motion.div>

      {/* Recent Transactions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <TeenRecentTransactions transactions={recentTx} />
      </motion.div>

      {/* Monthly Chart */}
      {monthlySummary.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} data-onboarding="analytics">
          <MonthlyEvolutionChart data={monthlySummary} />
        </motion.div>
      )}
    </div>
  );
}
