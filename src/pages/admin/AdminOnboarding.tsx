import { lazy, Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Eye, SkipForward, CheckCircle2, TrendingDown, Users } from 'lucide-react';
import { QueryError } from '@/components/ui/query-error';
import { useT } from '@/contexts/LanguageContext';

const OnboardingStepManager = lazy(() => import('@/components/admin/OnboardingStepManager'));

const ROLES = ['parent', 'child', 'teen', 'teacher', 'admin', 'partner'] as const;

const ROLE_STEPS: Record<string, number> = { parent: 4, child: 4, teen: 4, teacher: 3, admin: 3, partner: 3 };

const PIE_COLORS = [
  'hsl(var(--kivara-blue))', 'hsl(var(--kivara-green))', 'hsl(var(--kivara-gold))',
  'hsl(var(--destructive))', 'hsl(var(--primary))', 'hsl(var(--secondary))',
];

interface AnalyticsRow { event_type: string; step_index: number; role: string; profile_id: string; created_at: string; }

function useOnboardingAnalytics() {
  return useQuery({
    queryKey: ['admin-onboarding-analytics'],
    queryFn: async () => {
      const res = await api.get<any>('/admin/onboarding-analytics');
      const data = Array.isArray(res) ? res : (res?.data ?? []);
      return data as AnalyticsRow[];
    },
  });
}

function computeMetrics(rows: AnalyticsRow[]) {
  const byRole: Record<string, { uniqueUsers: Set<string>; views: Map<number, Set<string>>; skips: Set<string>; completes: Set<string> }> = {};
  for (const role of ROLES) byRole[role] = { uniqueUsers: new Set(), views: new Map(), skips: new Set(), completes: new Set() };
  for (const row of rows) {
    const r = byRole[row.role]; if (!r) continue;
    r.uniqueUsers.add(row.profile_id);
    if (row.event_type === 'view') { if (!r.views.has(row.step_index)) r.views.set(row.step_index, new Set()); r.views.get(row.step_index)!.add(row.profile_id); }
    if (row.event_type === 'skip') r.skips.add(row.profile_id);
    if (row.event_type === 'complete') r.completes.add(row.profile_id);
  }
  return byRole;
}

function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string | number; color?: string }) {
  return (
    <Card className="border-border/50">
      <CardContent className="p-4 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: color ?? 'hsl(var(--primary) / 0.1)' }}>
          <Icon className="h-5 w-5" style={{ color: color ? 'white' : 'hsl(var(--primary))' }} />
        </div>
        <div>
          <p className="text-2xl font-display font-bold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function AnalyticsTab() {
  const t = useT();
  const { data: rows, isLoading, error, refetch } = useOnboardingAnalytics();

  const getRoleLabel = (role: string) => t(`admin.onboarding.role_${role}`);

  if (isLoading) return (<div className="space-y-6"><div className="grid grid-cols-1 md:grid-cols-4 gap-4">{[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}</div></div>);

  if (error) return <QueryError error={error} onRetry={() => refetch()} />;

  const allRows = rows ?? [];
  const metrics = computeMetrics(allRows);
  const totalUsers = new Set(allRows.map(r => r.profile_id)).size;
  const totalCompletes = allRows.filter(r => r.event_type === 'complete').length;
  const totalSkips = allRows.filter(r => r.event_type === 'skip').length;
  const completionRate = totalUsers > 0 ? Math.round((new Set(allRows.filter(r => r.event_type === 'complete').map(r => r.profile_id)).size / totalUsers) * 100) : 0;

  const roleBarData = ROLES.map(role => {
    const m = metrics[role]; const total = m.uniqueUsers.size;
    return {
      role: getRoleLabel(role),
      [t('admin.onboarding.completed')]: total > 0 ? Math.round((m.completes.size / total) * 100) : 0,
      [t('admin.onboarding.skipped')]: total > 0 ? Math.round((m.skips.size / total) * 100) : 0,
      [t('admin.onboarding.dropoff')]: total > 0 ? Math.round(((total - m.completes.size - m.skips.size) / total) * 100) : 0,
    };
  });

  const pieData = ROLES.map((role, i) => ({ name: getRoleLabel(role), value: metrics[role].uniqueUsers.size, fill: PIE_COLORS[i] })).filter(d => d.value > 0);

  const funnelData = ROLES.map(role => {
    const m = metrics[role]; const totalSteps = ROLE_STEPS[role];
    const steps: { step: string; users: number }[] = [];
    for (let i = 0; i < totalSteps; i++) steps.push({ step: `${t('admin.onboarding.step')} ${i + 1}`, users: m.views.get(i)?.size ?? 0 });
    return { role, label: getRoleLabel(role), steps, total: m.uniqueUsers.size };
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Users} label={t('admin.onboarding.unique_users')} value={totalUsers} />
        <StatCard icon={CheckCircle2} label={t('admin.onboarding.completion_rate')} value={`${completionRate}%`} color="hsl(var(--kivara-green))" />
        <StatCard icon={SkipForward} label={t('admin.onboarding.total_skips')} value={totalSkips} color="hsl(var(--kivara-gold))" />
        <StatCard icon={TrendingDown} label={t('admin.onboarding.total_completions')} value={totalCompletes} color="hsl(var(--kivara-blue))" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-display">{t('admin.onboarding.rate_by_role')}</CardTitle>
            <CardDescription className="text-xs">{t('admin.onboarding.rate_by_role_desc')}</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={roleBarData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="role" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" unit="%" />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12, fontSize: 12 }} />
                <Bar dataKey={t('admin.onboarding.completed')} fill="hsl(var(--kivara-green))" radius={[4, 4, 0, 0]} />
                <Bar dataKey={t('admin.onboarding.skipped')} fill="hsl(var(--kivara-gold))" radius={[4, 4, 0, 0]} />
                <Bar dataKey={t('admin.onboarding.dropoff')} fill="hsl(var(--destructive) / 0.6)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-display">{t('admin.onboarding.dist_by_role')}</CardTitle>
            <CardDescription className="text-xs">{t('admin.onboarding.dist_by_role_desc')}</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3}>
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                  <Legend wrapperStyle={{ fontSize: 11 }} formatter={(value: string) => <span className="text-muted-foreground">{value}</span>} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">{t('admin.onboarding.no_data_yet')}</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-display">{t('admin.onboarding.funnel_title')}</CardTitle>
          <CardDescription className="text-xs">{t('admin.onboarding.funnel_desc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {funnelData.map(({ role, label, steps, total }) => (
              <div key={role} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-display font-bold text-foreground">{label}</h3>
                  <Badge variant="secondary" className="text-xs">{total} {t('admin.onboarding.users')}</Badge>
                </div>
                <div className="space-y-1.5">
                  {steps.map((s, i) => {
                    const pct = total > 0 ? Math.round((s.users / total) * 100) : 0;
                    const prevPct = i > 0 && total > 0 ? Math.round((steps[i - 1].users / total) * 100) : 100;
                    const dropDelta = i > 0 ? prevPct - pct : 0;
                    return (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-14 shrink-0">{s.step}</span>
                        <div className="flex-1 h-5 bg-muted rounded-md overflow-hidden relative">
                          <div className="h-full rounded-md transition-all duration-500" style={{ width: `${pct}%`, background: pct > 60 ? 'hsl(var(--kivara-green))' : pct > 30 ? 'hsl(var(--kivara-gold))' : 'hsl(var(--destructive) / 0.7)' }} />
                          <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-foreground">{s.users} ({pct}%)</span>
                        </div>
                        {dropDelta > 0 && <span className="text-xs text-destructive font-medium w-8 text-right">-{dropDelta}%</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {allRows.length === 0 && (
        <Card className="border-border/50">
          <CardContent className="py-12 text-center">
            <Eye className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
            <h3 className="text-lg font-display font-bold text-foreground mb-1">{t('admin.onboarding.no_data_title')}</h3>
            <p className="text-sm text-muted-foreground">{t('admin.onboarding.no_data_desc')}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function AdminOnboarding() {
  const t = useT();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">{t('admin.onboarding.title')}</h1>
        <p className="text-sm text-muted-foreground">{t('admin.onboarding.subtitle')}</p>
      </div>
      <Tabs defaultValue="analytics">
        <TabsList>
          <TabsTrigger value="analytics">{t('admin.onboarding.tab_analytics')}</TabsTrigger>
          <TabsTrigger value="gestao">{t('admin.onboarding.tab_management')}</TabsTrigger>
        </TabsList>
        <TabsContent value="analytics" className="mt-4"><AnalyticsTab /></TabsContent>
        <TabsContent value="gestao" className="mt-4">
          <Suspense fallback={<Skeleton className="h-64 rounded-xl" />}><OnboardingStepManager /></Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}
