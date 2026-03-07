import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { Eye, SkipForward, CheckCircle2, TrendingDown, Users } from 'lucide-react';

const ROLES = ['parent', 'child', 'teen', 'teacher', 'admin', 'partner'] as const;

const ROLE_LABELS: Record<string, string> = {
  parent: 'Encarregado',
  child: 'Criança',
  teen: 'Adolescente',
  teacher: 'Professor',
  admin: 'Admin',
  partner: 'Parceiro',
};

const ROLE_STEPS: Record<string, number> = {
  parent: 4,
  child: 4,
  teen: 4,
  teacher: 3,
  admin: 3,
  partner: 3,
};

const PIE_COLORS = [
  'hsl(var(--kivara-blue))',
  'hsl(var(--kivara-green))',
  'hsl(var(--kivara-gold))',
  'hsl(var(--destructive))',
  'hsl(var(--primary))',
  'hsl(var(--secondary))',
];

interface AnalyticsRow {
  event_type: string;
  step_index: number;
  role: string;
  profile_id: string;
  created_at: string;
}

function useOnboardingAnalytics() {
  return useQuery({
    queryKey: ['admin-onboarding-analytics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('onboarding_analytics')
        .select('event_type, step_index, role, profile_id, created_at')
        .order('created_at', { ascending: true });

      if (error) throw error;
      return (data ?? []) as AnalyticsRow[];
    },
  });
}

function computeMetrics(rows: AnalyticsRow[]) {
  const byRole: Record<string, {
    uniqueUsers: Set<string>;
    views: Map<number, Set<string>>;
    skips: Set<string>;
    completes: Set<string>;
  }> = {};

  for (const role of ROLES) {
    byRole[role] = { uniqueUsers: new Set(), views: new Map(), skips: new Set(), completes: new Set() };
  }

  for (const row of rows) {
    const r = byRole[row.role];
    if (!r) continue;
    r.uniqueUsers.add(row.profile_id);

    if (row.event_type === 'view') {
      if (!r.views.has(row.step_index)) r.views.set(row.step_index, new Set());
      r.views.get(row.step_index)!.add(row.profile_id);
    }
    if (row.event_type === 'skip') r.skips.add(row.profile_id);
    if (row.event_type === 'complete') r.completes.add(row.profile_id);
  }

  return byRole;
}

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string; color?: string;
}) {
  return (
    <Card className="border-border/50">
      <CardContent className="p-4 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: color ?? 'hsl(var(--primary) / 0.1)' }}>
          <Icon className="h-5 w-5" style={{ color: color ? 'white' : 'hsl(var(--primary))' }} />
        </div>
        <div>
          <p className="text-2xl font-display font-bold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
          {sub && <p className="text-[10px] text-muted-foreground/70">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminOnboarding() {
  const { data: rows, isLoading } = useOnboardingAnalytics();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Analytics de Onboarding</h1>
          <p className="text-sm text-muted-foreground">A carregar dados...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      </div>
    );
  }

  const allRows = rows ?? [];
  const metrics = computeMetrics(allRows);

  const totalUsers = new Set(allRows.map(r => r.profile_id)).size;
  const totalCompletes = allRows.filter(r => r.event_type === 'complete').length;
  const totalSkips = allRows.filter(r => r.event_type === 'skip').length;
  const completionRate = totalUsers > 0 ? Math.round((new Set(allRows.filter(r => r.event_type === 'complete').map(r => r.profile_id)).size / totalUsers) * 100) : 0;

  // Per-role summary for bar chart
  const roleBarData = ROLES.map(role => {
    const m = metrics[role];
    const total = m.uniqueUsers.size;
    return {
      role: ROLE_LABELS[role],
      'Concluíram': total > 0 ? Math.round((m.completes.size / total) * 100) : 0,
      'Saltaram': total > 0 ? Math.round((m.skips.size / total) * 100) : 0,
      'Drop-off': total > 0 ? Math.round(((total - m.completes.size - m.skips.size) / total) * 100) : 0,
    };
  });

  // Pie chart data for completion breakdown
  const pieData = ROLES.map((role, i) => ({
    name: ROLE_LABELS[role],
    value: metrics[role].uniqueUsers.size,
    fill: PIE_COLORS[i],
  })).filter(d => d.value > 0);

  // Drop-off funnel per role
  const funnelData = ROLES.map(role => {
    const m = metrics[role];
    const totalSteps = ROLE_STEPS[role];
    const steps: { step: string; users: number }[] = [];
    for (let i = 0; i < totalSteps; i++) {
      steps.push({
        step: `Passo ${i + 1}`,
        users: m.views.get(i)?.size ?? 0,
      });
    }
    return { role, label: ROLE_LABELS[role], steps, total: m.uniqueUsers.size };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Analytics de Onboarding</h1>
        <p className="text-sm text-muted-foreground">Taxas de conclusão, saltos e pontos de abandono por papel</p>
      </div>

      {/* Global stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Utilizadores únicos" value={totalUsers} />
        <StatCard icon={CheckCircle2} label="Taxa de conclusão" value={`${completionRate}%`} color="hsl(var(--kivara-green))" />
        <StatCard icon={SkipForward} label="Total de saltos" value={totalSkips} color="hsl(var(--kivara-gold))" />
        <StatCard icon={TrendingDown} label="Total concluídos" value={totalCompletes} color="hsl(var(--kivara-blue))" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Bar chart - per role completion/skip rates */}
        <Card className="lg:col-span-2 border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-display">Taxa por Papel (%)</CardTitle>
            <CardDescription className="text-xs">Conclusão, salto e drop-off por tipo de utilizador</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={roleBarData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="role" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" unit="%" />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="Concluíram" fill="hsl(var(--kivara-green))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Saltaram" fill="hsl(var(--kivara-gold))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Drop-off" fill="hsl(var(--destructive) / 0.6)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie chart - user distribution */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-display">Distribuição por Papel</CardTitle>
            <CardDescription className="text-xs">Utilizadores que viram o onboarding</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={3}
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Legend
                    wrapperStyle={{ fontSize: 11 }}
                    formatter={(value: string) => <span className="text-muted-foreground">{value}</span>}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                Sem dados ainda
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Drop-off funnel per role */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-display">Funil de Drop-off por Papel</CardTitle>
          <CardDescription className="text-xs">Número de utilizadores que viram cada passo do walkthrough</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {funnelData.map(({ role, label, steps, total }) => (
              <div key={role} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-display font-bold text-foreground">{label}</h3>
                  <Badge variant="secondary" className="text-[10px]">{total} utilizadores</Badge>
                </div>
                <div className="space-y-1.5">
                  {steps.map((s, i) => {
                    const pct = total > 0 ? Math.round((s.users / total) * 100) : 0;
                    const prevPct = i > 0 && total > 0
                      ? Math.round(((steps[i - 1].users) / total) * 100)
                      : 100;
                    const dropDelta = i > 0 ? prevPct - pct : 0;

                    return (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground w-14 shrink-0">{s.step}</span>
                        <div className="flex-1 h-5 bg-muted rounded-md overflow-hidden relative">
                          <div
                            className="h-full rounded-md transition-all duration-500"
                            style={{
                              width: `${pct}%`,
                              background: pct > 60
                                ? 'hsl(var(--kivara-green))'
                                : pct > 30
                                ? 'hsl(var(--kivara-gold))'
                                : 'hsl(var(--destructive) / 0.7)',
                            }}
                          />
                          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-medium text-foreground">
                            {s.users} ({pct}%)
                          </span>
                        </div>
                        {dropDelta > 0 && (
                          <span className="text-[9px] text-destructive font-medium w-8 text-right">-{dropDelta}%</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Empty state */}
      {allRows.length === 0 && (
        <Card className="border-border/50">
          <CardContent className="py-12 text-center">
            <Eye className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
            <h3 className="text-lg font-display font-bold text-foreground mb-1">Sem dados de onboarding</h3>
            <p className="text-sm text-muted-foreground">
              Os dados aparecerão aqui à medida que os utilizadores completarem o walkthrough de boas-vindas.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
