import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { mockTeens, mockTeenTransactions, mockVaults } from '@/data/mock-data';
import { mockStreakData } from '@/data/streaks-data';
import { SPENDING_CATEGORIES, SpendingCategory } from '@/types/kivara';
import { LEVEL_CONFIG } from '@/types/kivara';
import { Wallet, TrendingUp, PiggyBank, Target, ArrowUpRight, ArrowDownRight, Flame } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TeenDashboard() {
  const teen = mockTeens[0];
  const navigate = useNavigate();
  const levelConfig = LEVEL_CONFIG[teen.level];
  const nextLevel = Object.entries(LEVEL_CONFIG).find(([, v]) => v.minPoints > teen.kivaPoints);
  const progressToNext = nextLevel ? ((teen.kivaPoints - levelConfig.minPoints) / (nextLevel[1].minPoints - levelConfig.minPoints)) * 100 : 100;

  const recentTx = mockTeenTransactions.slice(0, 5);
  const totalSpent = mockTeenTransactions.filter(t => t.type === 'spent').reduce((s, t) => s + t.amount, 0);
  const totalSaved = mockTeenTransactions.filter(t => t.type === 'saved').reduce((s, t) => s + t.amount, 0);
  const budgetUsed = (totalSpent / teen.monthlyBudget) * 100;

  // Spending by category
  const categorySpend = mockTeenTransactions
    .filter(t => t.type === 'spent' && t.category)
    .reduce((acc, t) => {
      acc[t.category!] = (acc[t.category!] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const topCategories = Object.entries(categorySpend)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4);

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
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Saldo', value: `${teen.balance} 🪙`, icon: Wallet, color: 'text-primary' },
          { label: 'Orçamento', value: `${Math.round(budgetUsed)}% usado`, icon: Target, color: budgetUsed > 80 ? 'text-destructive' : 'text-chart-3' },
          { label: 'Poupado', value: `${totalSaved} 🪙`, icon: PiggyBank, color: 'text-chart-3' },
          { label: 'Gasto', value: `${totalSpent} 🪙`, icon: TrendingUp, color: 'text-chart-1' },
        ].map((stat, i) => (
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

      {/* Budget Bar */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-display">Orçamento Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between text-xs text-muted-foreground mb-2">
              <span>{totalSpent} gasto</span>
              <span>{teen.monthlyBudget} limite</span>
            </div>
            <Progress value={budgetUsed} className="h-3" />
            <p className="text-xs text-muted-foreground mt-2">
              Resta <span className="font-bold text-foreground">{teen.monthlyBudget - totalSpent} 🪙</span> este mês
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Category Breakdown */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-display">Gastos por Categoria</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topCategories.map(([cat, amount]) => {
              const config = SPENDING_CATEGORIES[cat as SpendingCategory];
              const pct = (amount / totalSpent) * 100;
              return (
                <div key={cat}>
                  <div className="flex justify-between items-center text-sm mb-1">
                    <span>{config.icon} {config.label}</span>
                    <span className="font-bold">{amount} 🪙</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                      className="h-full rounded-full bg-primary"
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Transactions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-display">Últimas Transações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentTx.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm ${
                    tx.type === 'earned' || tx.type === 'allowance' ? 'bg-chart-3/15' : tx.type === 'saved' ? 'bg-primary/15' : 'bg-destructive/15'
                  }`}>
                    {tx.type === 'earned' || tx.type === 'allowance' ? <ArrowUpRight className="h-4 w-4 text-chart-3" /> : tx.type === 'saved' ? <PiggyBank className="h-4 w-4 text-primary" /> : <ArrowDownRight className="h-4 w-4 text-destructive" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{tx.description}</p>
                    <p className="text-[10px] text-muted-foreground">{tx.date}{tx.category ? ` • ${SPENDING_CATEGORIES[tx.category]?.label}` : ''}</p>
                  </div>
                </div>
                <span className={`font-display font-bold text-sm ${
                  tx.type === 'earned' || tx.type === 'allowance' ? 'text-chart-3' : tx.type === 'saved' ? 'text-primary' : 'text-destructive'
                }`}>
                  {tx.type === 'spent' || tx.type === 'donated' ? '-' : '+'}{tx.amount}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Streak Widget */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
        <Card
          className="border border-border/50 cursor-pointer hover:shadow-md transition-all duration-200 overflow-hidden"
          onClick={() => navigate('/teen/streaks')}
        >
          <div className="h-1 bg-gradient-to-r from-destructive via-chart-1 to-accent" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center">
                  <Flame className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <p className="text-sm font-display font-bold">Sequência Diária</p>
                  <p className="text-xs text-muted-foreground">{mockStreakData.totalActiveDays} dias activos no total</p>
                </div>
              </div>
              <div className="text-right">
                <motion.p
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  className="text-2xl font-display font-bold text-destructive"
                >
                  {mockStreakData.currentStreak} 🔥
                </motion.p>
                <p className="text-[10px] text-muted-foreground">Recorde: {mockStreakData.longestStreak}</p>
              </div>
            </div>
            <div className="flex gap-1 mt-3">
              {Array.from({ length: 7 }).map((_, i) => {
                const d = new Date();
                d.setDate(d.getDate() - (6 - i));
                const dateStr = d.toISOString().split('T')[0];
                const isActive = mockStreakData.activeDates.includes(dateStr);
                return (
                  <div
                    key={i}
                    className={`flex-1 h-2 rounded-full ${isActive ? 'bg-destructive' : 'bg-muted/60'}`}
                  />
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
