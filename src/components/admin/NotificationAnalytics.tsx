import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

interface AnalyticsData {
  readRate: number;
  totalSent: number;
  totalRead: number;
  byType: Array<{ type: string; count: number }>;
  dailyVolume: Array<{ date: string; count: number }>;
}

function useNotificationAnalytics() {
  return useQuery({
    queryKey: ['notification-analytics'],
    queryFn: async (): Promise<AnalyticsData> => {
      // Get total and read counts
      const { count: totalSent } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true });

      const { count: totalRead } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('read', true);

      const sent = totalSent ?? 0;
      const read = totalRead ?? 0;
      const readRate = sent > 0 ? Math.round((read / sent) * 100) : 0;

      // Get notifications by type
      const { data: allNotifs } = await supabase
        .from('notifications')
        .select('type, created_at, read')
        .order('created_at', { ascending: false })
        .limit(1000);

      const typeMap = new Map<string, number>();
      const dailyMap = new Map<string, number>();

      for (const n of allNotifs ?? []) {
        typeMap.set(n.type, (typeMap.get(n.type) || 0) + 1);
        const day = n.created_at.split('T')[0];
        dailyMap.set(day, (dailyMap.get(day) || 0) + 1);
      }

      const byType = Array.from(typeMap.entries())
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count);

      // Last 30 days volume
      const today = new Date();
      const dailyVolume: Array<{ date: string; count: number }> = [];
      for (let i = 29; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const key = d.toISOString().split('T')[0];
        dailyVolume.push({ date: key.slice(5), count: dailyMap.get(key) || 0 });
      }

      return { readRate, totalSent: sent, totalRead: read, byType, dailyVolume };
    },
  });
}

const typeLabels: Record<string, string> = {
  task: '📋 Tarefas',
  mission: '🎯 Missões',
  achievement: '🏆 Conquistas',
  savings: '🐷 Poupança',
  streak: '🔥 Sequências',
  class: '🏫 Turmas',
  reward: '🎁 Recompensas',
  vault: '💰 Cofres',
  report: '📊 Relatórios',
};

export default function NotificationAnalytics() {
  const { data, isLoading } = useNotificationAnalytics();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map(i => (
          <Card key={i}><CardContent className="p-6"><Skeleton className="h-20 w-full" /></CardContent></Card>
        ))}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Enviadas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-display font-bold text-foreground">{data.totalSent}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Lidas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-display font-bold text-foreground">{data.totalRead}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Taxa de Leitura</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-display font-bold text-primary">{data.readRate}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notificações por Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.byType.map(d => ({ ...d, label: typeLabels[d.type] || d.type }))}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Volume Diário (30 dias)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={data.dailyVolume}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
