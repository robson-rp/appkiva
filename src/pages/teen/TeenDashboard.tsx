import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { mockTeens, mockTeenTransactions, mockVaults } from '@/data/mock-data';
import { SPENDING_CATEGORIES, SpendingCategory } from '@/types/kivara';
import { LEVEL_CONFIG } from '@/types/kivara';
import { Wallet, TrendingUp, PiggyBank, Target, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function TeenDashboard() {
  const teen = mockTeens[0];
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
    </div>
  );
}
