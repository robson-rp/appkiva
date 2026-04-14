import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { useT } from '@/contexts/LanguageContext';

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
      try {
        const stats = await api.get<any>('/admin/stats');
        const totalSent: number = stats?.notifications_total ?? 0;
        const totalRead: number = stats?.notifications_read ?? 0;
        const readRate = totalSent > 0 ? Math.round((totalRead / totalSent) * 100) : 0;

        const allNotifs: any[] = stats?.recent_notifications ?? [];

        const typeMap = new Map<string, number>();
        const dailyMap = new Map<string, number>();

        for (const n of allNotifs) {
          typeMap.set(n.type, (typeMap.get(n.type) || 0) + 1);
          const day = (n.created_at ?? '').split('T')[0];
          if (day) dailyMap.set(day, (dailyMap.get(day) || 0) + 1);
        }

        const byType = Array.from(typeMap.entries())
          .map(([type, count]) => ({ type, count }))
          .sort((a, b) => b.count - a.count);

        const today = new Date();
        const dailyVolume: Array<{ date: string; count: number }> = [];
        for (let i = 29; i >= 0; i--) {
          const d = new Date(today);
          d.setDate(d.getDate() - i);
          const key = d.toISOString().split('T')[0];
          dailyVolume.push({ date: key.slice(5), count: dailyMap.get(key) || 0 });
        }

        return { readRate, totalSent, totalRead, byType, dailyVolume };
      } catch {
        return { readRate: 0, totalSent: 0, totalRead: 0, byType: [], dailyVolume: [] };
      }
    },
  });
}

function useTypeLabels() {
  const t = useT();
  return {
    task: t('admin.notif.type_label_task'),
    mission: t('admin.notif.type_label_mission'),
    achievement: t('admin.notif.type_label_achievement'),
    savings: t('admin.notif.type_label_savings'),
    streak: t('admin.notif.type_label_streak'),
    class: t('admin.notif.type_label_class'),
    reward: t('admin.notif.type_label_reward'),
    vault: t('admin.notif.type_label_vault'),
    report: t('admin.notif.type_label_report'),
  } as Record<string, string>;
}

export default function NotificationAnalytics() {
  const t = useT();
  const typeLabels = useTypeLabels();
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
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">{t('admin.notif.kpi_total_sent')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-display font-bold text-foreground">{data.totalSent}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">{t('admin.notif.kpi_total_read')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-display font-bold text-foreground">{data.totalRead}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">{t('admin.notif.kpi_read_rate')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-display font-bold text-primary">{data.readRate}%</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('admin.notif.chart_by_type')}</CardTitle>
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
            <CardTitle className="text-base">{t('admin.notif.chart_daily')}</CardTitle>
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
