import { Card, CardContent } from '@/components/ui/card';
import { Bell, Send, Eye, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

export function useNotificationStats() {
  return useQuery({
    queryKey: ['admin-notification-stats'],
    queryFn: async () => {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

      const [totalRes, todayRes, unreadRes, urgentRes, templatesRes] = await Promise.all([
        supabase.from('notifications').select('id', { count: 'exact', head: true }),
        supabase.from('notifications').select('id', { count: 'exact', head: true }).gte('created_at', today),
        supabase.from('notifications').select('id', { count: 'exact', head: true }).eq('read', false),
        supabase.from('notifications').select('id', { count: 'exact', head: true }).eq('urgent', true).eq('read', false),
        (supabase as any).from('notification_templates').select('id', { count: 'exact', head: true }).eq('is_active', true),
      ]);

      return {
        total: totalRes.count ?? 0,
        today: todayRes.count ?? 0,
        unread: unreadRes.count ?? 0,
        urgent: urgentRes.count ?? 0,
        activeTemplates: templatesRes.count ?? 0,
      };
    },
  });
}

interface NotificationStatsProps {
  stats: ReturnType<typeof useNotificationStats>['data'];
}

export default function NotificationStats({ stats }: NotificationStatsProps) {
  const cards = [
    { label: 'Total Enviadas', value: stats?.total ?? 0, icon: Bell, color: 'text-primary' },
    { label: 'Hoje', value: stats?.today ?? 0, icon: Send, color: 'text-accent-foreground' },
    { label: 'Não Lidas', value: stats?.unread ?? 0, icon: Eye, color: 'text-muted-foreground' },
    { label: 'Urgentes', value: stats?.urgent ?? 0, icon: AlertTriangle, color: 'text-destructive' },
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
