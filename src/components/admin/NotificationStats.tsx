import { Card, CardContent } from '@/components/ui/card';
import { Bell, Send, Eye, AlertTriangle } from 'lucide-react';
import { api } from '@/lib/api-client';
import { useQuery } from '@tanstack/react-query';
import { useT } from '@/contexts/LanguageContext';

export function useNotificationStats() {
  return useQuery({
    queryKey: ['admin-notification-stats'],
    queryFn: async () => {
      const res = await api.get<any>('/admin/stats');
      const data = res?.data ?? res ?? {};
      return {
        total: data?.total ?? 0,
        today: data?.today ?? 0,
        unread: data?.unread ?? 0,
        urgent: data?.urgent ?? 0,
        activeTemplates: data?.activeTemplates ?? 0,
      };
    },
  });
}

interface NotificationStatsProps {
  stats: ReturnType<typeof useNotificationStats>['data'];
}

export default function NotificationStats({ stats }: NotificationStatsProps) {
  const t = useT();

  const cards = [
    { label: t('admin.notif.stat_total'), value: stats?.total ?? 0, icon: Bell, color: 'text-primary' },
    { label: t('admin.notif.stat_today'), value: stats?.today ?? 0, icon: Send, color: 'text-accent-foreground' },
    { label: t('admin.notif.stat_unread'), value: stats?.unread ?? 0, icon: Eye, color: 'text-muted-foreground' },
    { label: t('admin.notif.stat_urgent'), value: stats?.urgent ?? 0, icon: AlertTriangle, color: 'text-destructive' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map(s => (
        <Card key={s.label} className="border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-xl bg-muted p-2.5">
              <s.icon className={`h-5 w-5 ${s.color}`} />
            </div>
            <div>
              <p className="text-2xl font-display font-bold">{s.value}</p>
              <p className="text-caption text-muted-foreground">{s.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
