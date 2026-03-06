import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { mockTeens, mockTeenTransactions } from '@/data/mock-data';
import { useTeenBudget } from '@/hooks/use-teen-budget';
import { SPENDING_CATEGORIES, SpendingCategory } from '@/types/kivara';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, CalendarDays } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useMonthlySummary } from '@/hooks/use-monthly-summary';
import { useFeatureGate, FEATURES } from '@/hooks/use-feature-gate';
import UpgradePrompt from '@/components/UpgradePrompt';

const CHART_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(var(--primary))',
  'hsl(var(--secondary))',
];

export default function TeenAnalytics() {
  const { allowed: analyticsAllowed, tierName, loading: gateLoading } = useFeatureGate(FEATURES.ADVANCED_ANALYTICS);
  const [summaryMonths, setSummaryMonths] = useState<3 | 6 | 12>(6);
  const { data: monthlySummary } = useMonthlySummary(summaryMonths);
  const { data: realBudget } = useTeenBudget();
  const teen = mockTeens[0];
  const monthlyBudget = realBudget && realBudget > 0 ? realBudget : teen.monthlyBudget;
  const totalSpent = mockTeenTransactions.filter(t => t.type === 'spent').reduce((s, t) => s + t.amount, 0);
  const totalSaved = mockTeenTransactions.filter(t => t.type === 'saved').reduce((s, t) => s + t.amount, 0);
  const totalIncome = mockTeenTransactions.filter(t => t.type === 'earned' || t.type === 'allowance').reduce((s, t) => s + t.amount, 0);
  const totalDonated = mockTeenTransactions.filter(t => t.type === 'donated').reduce((s, t) => s + t.amount, 0);
  const savingsRate = totalIncome > 0 ? Math.round((totalSaved / totalIncome) * 100) : 0;
  const budgetUsed = monthlyBudget > 0 ? Math.round((totalSpent / monthlyBudget) * 100) : 0;

  const categorySpend = mockTeenTransactions
    .filter(t => t.type === 'spent' && t.category)
    .reduce((acc, t) => {
      acc[t.category!] = (acc[t.category!] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const sortedCategories = Object.entries(categorySpend).sort(([, a], [, b]) => b - a);

  // Pie chart data
  const pieData = sortedCategories.map(([cat, amount]) => ({
    name: SPENDING_CATEGORIES[cat as SpendingCategory]?.label,
    value: amount,
    icon: SPENDING_CATEGORIES[cat as SpendingCategory]?.icon,
  }));

  // Bar chart data — money flow
  const barData = [
    { name: 'Recebido', value: totalIncome },
    { name: 'Gasto', value: totalSpent },
    { name: 'Poupado', value: totalSaved },
    { name: 'Doado', value: totalDonated },
  ];

  const barColors = [
    'hsl(var(--chart-3))',
    'hsl(var(--chart-1))',
    'hsl(var(--primary))',
    'hsl(var(--chart-4))',
  ];

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

  const CustomPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, icon }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    if (percent < 0.08) return null;
    return (
      <text x={x} y={y} textAnchor="middle" dominantBaseline="central" className="text-sm">
        {icon}
      </text>
    );
  };

  if (!analyticsAllowed && !gateLoading) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <UpgradePrompt
          featureName="Relatórios Avançados"
          description="Gráficos de despesa, taxa de poupança e análise por categorias. Disponível no plano Família Premium."
          currentTier={tierName}
          variant="inline"
        />
      </div>
    );
  }

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

      {/* Pie Chart — Category Breakdown */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-display">Despesas por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                    label={CustomPieLabel}
                    labelLine={false}
                    animationBegin={200}
                    animationDuration={800}
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                    formatter={(value: number, name: string) => [`${value} 🪙`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Legend */}
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-2 justify-center">
              {pieData.map((entry, i) => (
                <div key={entry.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                  <span>{entry.icon} {entry.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Bar Chart — Money Flow */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-display">Fluxo de Dinheiro</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} barCategoryGap="25%">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={false}
                    tickLine={false}
                    width={35}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                    formatter={(value: number) => [`${value} 🪙`]}
                    cursor={{ fill: 'hsl(var(--muted) / 0.3)' }}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]} animationDuration={800}>
                    {barData.map((_, i) => (
                      <Cell key={i} fill={barColors[i]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Monthly Income vs Expenses */}
      {monthlySummary && monthlySummary.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-display flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-primary" />
                  Resumo Mensal — Receitas vs Despesas
                </CardTitle>
                <div className="flex gap-1">
                  {([3, 6, 12] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setSummaryMonths(m)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-display font-bold transition-all duration-200 ${
                        summaryMonths === m
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      {m}M
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlySummary} barCategoryGap="20%">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                      axisLine={false}
                      tickLine={false}
                      width={35}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '12px',
                        fontSize: '12px',
                      }}
                      formatter={(value: number, name: string) => [`${value} 🪙`, name === 'income' ? 'Receitas' : name === 'expenses' ? 'Despesas' : 'Líquido']}
                      labelFormatter={(label) => `Mês: ${label}`}
                      cursor={{ fill: 'hsl(var(--muted) / 0.3)' }}
                    />
                    <Legend
                      formatter={(value) => value === 'income' ? 'Receitas' : value === 'expenses' ? 'Despesas' : 'Líquido'}
                      wrapperStyle={{ fontSize: '11px' }}
                    />
                    <Bar dataKey="income" fill="hsl(var(--chart-3))" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="expenses" fill="hsl(var(--chart-1))" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {/* Net summary row */}
              <div className="mt-3 grid grid-cols-3 gap-2">
                {monthlySummary.slice(-3).map((m) => (
                  <div key={m.month} className="bg-muted/50 rounded-lg p-2 text-center">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{m.label}</p>
                    <p className={`font-display font-bold text-sm ${m.net >= 0 ? 'text-chart-3' : 'text-destructive'}`}>
                      {m.net >= 0 ? '+' : ''}{m.net} 🪙
                    </p>
                    <p className="text-[9px] text-muted-foreground">líquido</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}


      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
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
