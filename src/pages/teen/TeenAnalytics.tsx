import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTeenBudget } from '@/hooks/use-teen-budget';
import { useMonthlySpending } from '@/hooks/use-monthly-spending';
import { useWalletTransactions } from '@/hooks/use-wallet';
import { SPENDING_CATEGORIES, SpendingCategory } from '@/types/kivara';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, CalendarDays } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useMonthlySummary } from '@/hooks/use-monthly-summary';
import { useFeatureGate, FEATURES } from '@/hooks/use-feature-gate';
import UpgradePrompt, { FeatureGateWrapper } from '@/components/UpgradePrompt';
import { useT } from '@/contexts/LanguageContext';

const CHART_COLORS = [
  'hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))',
  'hsl(var(--chart-4))', 'hsl(var(--chart-5))', 'hsl(var(--primary))', 'hsl(var(--secondary))',
];

export default function TeenAnalytics() {
  const t = useT();
  const { allowed: analyticsAllowed, tierName, loading: gateLoading } = useFeatureGate(FEATURES.ADVANCED_ANALYTICS);
  const [summaryMonths, setSummaryMonths] = useState<3 | 6 | 12>(6);
  const { data: monthlySummary } = useMonthlySummary(summaryMonths);
  const { data: realBudget } = useTeenBudget();
  const { data: ledgerTx = [] } = useWalletTransactions(undefined, 100);

  const monthlyBudget = realBudget && realBudget > 0 ? realBudget : 0;

  // Derive totals from real ledger transactions
  const mapType = (tx: { entry_type: string; direction: string }) => {
    switch (tx.entry_type) {
      case 'allowance': return 'allowance';
      case 'task_reward': case 'mission_reward': return 'earned';
      case 'purchase': return 'spent';
      case 'vault_deposit': case 'vault_interest': return 'saved';
      case 'donation': return 'donated';
      default: return tx.direction === 'credit' ? 'earned' : 'spent';
    }
  };

  const transactions = ledgerTx.map(tx => ({
    ...tx,
    mappedType: mapType(tx),
    category: (tx.metadata as any)?.category as SpendingCategory | undefined,
  }));

  const totalSpent = transactions.filter(tx => tx.mappedType === 'spent').reduce((s, tx) => s + tx.amount, 0);
  const totalSaved = transactions.filter(tx => tx.mappedType === 'saved').reduce((s, tx) => s + tx.amount, 0);
  const totalIncome = transactions.filter(tx => tx.mappedType === 'earned' || tx.mappedType === 'allowance').reduce((s, tx) => s + tx.amount, 0);
  const totalDonated = transactions.filter(tx => tx.mappedType === 'donated').reduce((s, tx) => s + tx.amount, 0);
  const savingsRate = totalIncome > 0 ? Math.round((totalSaved / totalIncome) * 100) : 0;
  const budgetUsed = monthlyBudget > 0 ? Math.round((totalSpent / monthlyBudget) * 100) : 0;

  const categorySpend = transactions
    .filter(tx => tx.mappedType === 'spent' && tx.category)
    .reduce((acc, tx) => { acc[tx.category!] = (acc[tx.category!] || 0) + tx.amount; return acc; }, {} as Record<string, number>);

  const sortedCategories = Object.entries(categorySpend).sort(([, a], [, b]) => b - a);

  const pieData = sortedCategories.map(([cat, amount]) => ({
    name: SPENDING_CATEGORIES[cat as SpendingCategory]?.label,
    value: amount,
    icon: SPENDING_CATEGORIES[cat as SpendingCategory]?.icon,
  }));

  const barData = [
    { name: t('teen.analytics.received'), value: totalIncome },
    { name: t('teen.analytics.spent'), value: totalSpent },
    { name: t('teen.analytics.saved'), value: totalSaved },
    { name: t('teen.analytics.donated'), value: totalDonated },
  ];

  const barColors = ['hsl(var(--chart-3))', 'hsl(var(--chart-1))', 'hsl(var(--primary))', 'hsl(var(--chart-4))'];

  const insights = [
    savingsRate >= 30
      ? { icon: CheckCircle, text: t('teen.analytics.savings_excellent').replace('{rate}', String(savingsRate)), color: 'text-chart-3' }
      : { icon: AlertTriangle, text: t('teen.analytics.savings_improve').replace('{rate}', String(savingsRate)), color: 'text-chart-1' },
    monthlyBudget > 0 && budgetUsed > 80
      ? { icon: TrendingDown, text: t('teen.analytics.budget_over').replace('{used}', String(budgetUsed)), color: 'text-destructive' }
      : monthlyBudget > 0
      ? { icon: TrendingUp, text: t('teen.analytics.budget_ok').replace('{used}', String(budgetUsed)), color: 'text-chart-3' }
      : null,
    sortedCategories[0]
      ? { icon: TrendingUp, text: t('teen.analytics.top_spend').replace('{category}', SPENDING_CATEGORIES[sortedCategories[0][0] as SpendingCategory]?.label).replace('{amount}', String(sortedCategories[0][1])), color: 'text-primary' }
      : null,
  ].filter(Boolean);

  const CustomPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, icon }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    if (percent < 0.08) return null;
    return <text x={x} y={y} textAnchor="middle" dominantBaseline="central" className="text-sm">{icon}</text>;
  };

  return (
    <FeatureGateWrapper
      allowed={analyticsAllowed || gateLoading}
      featureName={t('teen.analytics.feature_name')}
      description={t('teen.analytics.feature_desc')}
      tierName={tierName}
    >
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-display font-bold text-foreground">{t('teen.analytics.title')}</h1>
        <p className="text-muted-foreground text-sm">{t('teen.analytics.subtitle')}</p>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: t('teen.analytics.received'), value: totalIncome, color: 'text-chart-3' },
          { label: t('teen.analytics.spent'), value: totalSpent, color: 'text-destructive' },
          { label: t('teen.analytics.saved'), value: totalSaved, color: 'text-primary' },
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

      {/* Pie Chart */}
      {pieData.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-display">{t('teen.analytics.category_chart')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={3} dataKey="value" label={CustomPieLabel} labelLine={false} animationBegin={200} animationDuration={800}>
                      {pieData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} strokeWidth={0} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '12px' }} formatter={(value: number, name: string) => [`${value} 🪙`, name]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
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
      )}

      {/* Bar Chart */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-display">{t('teen.analytics.money_flow')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} barCategoryGap="25%">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} width={35} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '12px' }} formatter={(value: number) => [`${value} 🪙`]} cursor={{ fill: 'hsl(var(--muted) / 0.3)' }} />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]} animationDuration={800}>
                    {barData.map((_, i) => <Cell key={i} fill={barColors[i]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Monthly Summary */}
      {monthlySummary && monthlySummary.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-display flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-primary" />
                  {t('teen.analytics.monthly_summary')}
                </CardTitle>
                <div className="flex gap-1">
                  {([3, 6, 12] as const).map((m) => (
                    <button key={m} onClick={() => setSummaryMonths(m)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-display font-bold transition-all duration-200 ${summaryMonths === m ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted/50 text-muted-foreground hover:bg-muted'}`}>
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
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} width={35} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '12px' }}
                      formatter={(value: number, name: string) => [`${value} 🪙`, name === 'income' ? t('teen.analytics.income') : name === 'expenses' ? t('teen.analytics.expenses') : t('teen.analytics.net')]}
                      labelFormatter={(label) => `${t('teen.analytics.month_label')}: ${label}`} cursor={{ fill: 'hsl(var(--muted) / 0.3)' }} />
                    <Legend formatter={(value) => value === 'income' ? t('teen.analytics.income') : value === 'expenses' ? t('teen.analytics.expenses') : t('teen.analytics.net')} wrapperStyle={{ fontSize: '11px' }} />
                    <Bar dataKey="income" fill="hsl(var(--chart-3))" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="expenses" fill="hsl(var(--chart-1))" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {monthlySummary.slice(-3).map((m) => (
                  <div key={m.month} className="bg-muted/50 rounded-lg p-2 text-center">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{m.label}</p>
                    <p className={`font-display font-bold text-sm ${m.net >= 0 ? 'text-chart-3' : 'text-destructive'}`}>{m.net >= 0 ? '+' : ''}{m.net} 🪙</p>
                    <p className="text-[9px] text-muted-foreground">{t('teen.analytics.net').toLowerCase()}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Savings Rate */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-display">{t('teen.analytics.savings_rate')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-3">
              <span className="text-3xl font-display font-bold text-foreground">{savingsRate}%</span>
              <span className="text-xs text-muted-foreground mb-1">{t('teen.analytics.of_income')}</span>
            </div>
            <Progress value={savingsRate} className="h-3 mt-2" />
            <p className="text-[10px] text-muted-foreground mt-1">{t('teen.analytics.recommended')}</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Insights */}
      {insights.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-display">{t('teen.analytics.insights')}</CardTitle>
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
      )}
    </div>
    </FeatureGateWrapper>
  );
}
