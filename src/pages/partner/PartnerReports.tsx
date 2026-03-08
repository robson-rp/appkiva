import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, BookOpen, Trophy, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { usePartnerPrograms, useSponsoredChallenges } from '@/hooks/use-partner-data';
import { useTenantCurrency } from '@/components/CurrencyDisplay';
import { useExchangeRates, convertPrice, formatPrice } from '@/hooks/use-exchange-rates';
import { useT } from '@/contexts/LanguageContext';

export default function PartnerReports() {
  const t = useT();
  const { data: programs, isLoading: loadingP } = usePartnerPrograms();
  const { data: challenges, isLoading: loadingC } = useSponsoredChallenges();

  const { data: tenantCurrency } = useTenantCurrency();
  const { data: rates = [] } = useExchangeRates();
  const sym = tenantCurrency?.symbol ?? 'Kz';
  const cCode = tenantCurrency?.code ?? 'AOA';
  const dec = tenantCurrency?.decimalPlaces ?? 0;
  const fmtP = (usdAmount: number) => formatPrice(convertPrice(usdAmount, 'USD', cCode, rates), sym, dec);

  const isLoading = loadingP || loadingC;

  const totalChildren = programs?.reduce((sum, p) => sum + p.children_count, 0) ?? 0;
  const totalInvestment = programs?.reduce((sum, p) => sum + Number(p.investment_amount), 0) ?? 0;
  const totalParticipants = challenges?.reduce((sum, c) => sum + c.participants_count, 0) ?? 0;
  const completedChallenges = challenges?.filter(c => c.status === 'completed').length ?? 0;
  const avgCompletion = challenges?.filter(c => c.status !== 'draft').length
    ? Math.round(challenges.filter(c => c.status !== 'draft').reduce((sum, c) => sum + Number(c.completion_rate), 0) / challenges.filter(c => c.status !== 'draft').length)
    : 0;
  const avgSavingsPerChild = totalChildren > 0 ? Math.round(totalInvestment / totalChildren) : 0;

  const chartData = (() => {
    if (!programs) return [];
    const months: Record<string, { families: number; children: number }> = {};
    programs.forEach(p => {
      const d = new Date(p.started_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!months[key]) months[key] = { families: 0, children: 0 };
      months[key].families += 1;
      months[key].children += p.children_count;
    });
    return Object.entries(months)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, val]) => {
        const d = new Date(key + '-01');
        return { month: d.toLocaleDateString('pt', { month: 'short' }).replace('.', ''), ...val };
      });
  })();

  const impactMetrics = [
    { label: t('partner.reports.total_participants'), value: totalParticipants.toLocaleString(), icon: BookOpen, color: 'text-primary' },
    { label: t('partner.reports.completed_challenges'), value: String(completedChallenges), icon: Trophy, color: 'text-chart-3' },
    { label: t('partner.reports.investment_per_child'), value: fmtP(avgSavingsPerChild), icon: TrendingUp, color: 'text-secondary' },
    { label: t('partner.reports.avg_completion'), value: `${avgCompletion}%`, icon: BarChart3, color: 'text-accent-foreground' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-heading md:text-heading-lg text-foreground">{t('partner.reports.title')}</h1>
          <p className="text-small text-muted-foreground font-body">{t('partner.reports.subtitle')}</p>
        </div>
        <Button variant="outline" className="rounded-xl gap-2 w-full sm:w-auto">
          <Download className="h-4 w-4" />
          {t('partner.reports.export')}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {impactMetrics.map(m => (
          <Card key={m.label} className="rounded-2xl border-border/50">
            <CardContent className="p-5">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center mb-3">
                <m.icon className={`h-5 w-5 ${m.color}`} />
              </div>
              <p className="font-display text-2xl font-bold text-foreground">{m.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{m.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {chartData.length > 0 && (
        <Card className="rounded-2xl border-border/50">
          <CardHeader>
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              {t('partner.reports.programs_by_month')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '12px' }} />
                  <Bar dataKey="families" name={t('partner.reports.chart_programs')} fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="children" name={t('partner.reports.chart_children')} fill="hsl(var(--secondary))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="rounded-2xl border-border/50">
        <CardHeader>
          <CardTitle className="font-display text-lg">{t('partner.reports.general_summary')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 rounded-xl bg-muted/50">
              <p className="font-display text-3xl font-bold text-foreground">{programs?.length ?? 0}</p>
              <p className="text-sm text-muted-foreground mt-1">{t('partner.reports.active_programs')}</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-muted/50">
              <p className="font-display text-3xl font-bold text-foreground">{totalChildren}</p>
              <p className="text-sm text-muted-foreground mt-1">{t('partner.reports.children_impacted')}</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-muted/50">
              <p className="font-display text-3xl font-bold text-foreground">{fmtP(totalInvestment)}</p>
              <p className="text-sm text-muted-foreground mt-1">{t('partner.reports.total_investment')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
