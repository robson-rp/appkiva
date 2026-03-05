import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { mockTeens, mockTeenTransactions } from '@/data/mock-data';
import { SPENDING_CATEGORIES, SpendingCategory } from '@/types/kivara';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';

export default function TeenAnalytics() {
  const teen = mockTeens[0];
  const totalSpent = mockTeenTransactions.filter(t => t.type === 'spent').reduce((s, t) => s + t.amount, 0);
  const totalSaved = mockTeenTransactions.filter(t => t.type === 'saved').reduce((s, t) => s + t.amount, 0);
  const totalIncome = mockTeenTransactions.filter(t => t.type === 'earned' || t.type === 'allowance').reduce((s, t) => s + t.amount, 0);
  const savingsRate = totalIncome > 0 ? Math.round((totalSaved / totalIncome) * 100) : 0;
  const budgetUsed = Math.round((totalSpent / teen.monthlyBudget) * 100);

  const categorySpend = mockTeenTransactions
    .filter(t => t.type === 'spent' && t.category)
    .reduce((acc, t) => {
      acc[t.category!] = (acc[t.category!] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const sortedCategories = Object.entries(categorySpend).sort(([, a], [, b]) => b - a);

  const insights = [
    savingsRate >= 30
      ? { type: 'positive' as const, icon: CheckCircle, text: `Taxa de poupança de ${savingsRate}% — excelente!`, color: 'text-chart-3' }
      : { type: 'warning' as const, icon: AlertTriangle, text: `Taxa de poupança de ${savingsRate}% — tenta chegar a 30%`, color: 'text-chart-1' },
    budgetUsed > 80
      ? { type: 'warning' as const, icon: TrendingDown, text: `Já usaste ${budgetUsed}% do orçamento mensal`, color: 'text-destructive' }
      : { type: 'positive' as const, icon: TrendingUp, text: `Orçamento sob controlo (${budgetUsed}% usado)`, color: 'text-chart-3' },
    sortedCategories[0]
      ? { type: 'neutral' as const, icon: TrendingUp, text: `Maior gasto: ${SPENDING_CATEGORIES[sortedCategories[0][0] as SpendingCategory]?.label} (${sortedCategories[0][1]} 🪙)`, color: 'text-primary' }
      : null,
  ].filter(Boolean);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-display font-bold text-foreground">Análise Financeira</h1>
        <p className="text-muted-foreground text-sm">Entende para onde vai o teu dinheiro</p>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Recebido', value: totalIncome, color: 'text-chart-3' },
          { label: 'Gasto', value: totalSpent, color: 'text-destructive' },
          { label: 'Poupado', value: totalSaved, color: 'text-primary' },
        ].map((m, i) => (
          <motion.div key={m.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
            <Card className="border-border/50">
              <CardContent className="p-3 text-center">
                <p className="text-[10px] text-muted-foreground">{m.label}</p>
                <p className={`text-lg font-display font-bold ${m.color}`}>{m.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Savings Rate */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-display">Taxa de Poupança</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-3">
              <span className="text-3xl font-display font-bold text-foreground">{savingsRate}%</span>
              <span className="text-xs text-muted-foreground mb-1">do rendimento</span>
            </div>
            <Progress value={savingsRate} className="h-3 mt-2" />
            <p className="text-[10px] text-muted-foreground mt-1">Meta recomendada: 30%</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Category Breakdown */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-display">Despesas por Categoria</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {sortedCategories.map(([cat, amount]) => {
              const config = SPENDING_CATEGORIES[cat as SpendingCategory];
              const pct = (amount / totalSpent) * 100;
              return (
                <div key={cat}>
                  <div className="flex justify-between items-center text-sm mb-1">
                    <span>{config.icon} {config.label}</span>
                    <span className="font-bold text-foreground">{amount} 🪙 <span className="text-muted-foreground font-normal">({Math.round(pct)}%)</span></span>
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

      {/* Insights */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-display">Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {insights.map((insight, i) => insight && (
              <div key={i} className="flex items-center gap-3 p-2 rounded-xl bg-muted/50">
                <insight.icon className={`h-5 w-5 ${insight.color} shrink-0`} />
                <p className="text-sm text-foreground">{insight.text}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
