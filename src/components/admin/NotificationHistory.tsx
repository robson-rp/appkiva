import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useT } from '@/contexts/LanguageContext';

function useRelativeDate() {
  const t = useT();
  return (date: string) => {
    const diff = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
    if (diff < 1) return t('admin.notif.time_now');
    if (diff < 60) return `${diff}m`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h`;
    return `${Math.floor(diff / 1440)}d`;
  };
}

export default function NotificationHistory() {
  const t = useT();
  const relativeDate = useRelativeDate();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const NOTIF_TYPES = [
    { value: 'task', label: t('admin.notif.type_task') },
    { value: 'mission', label: t('admin.notif.type_mission') },
    { value: 'achievement', label: t('admin.notif.type_achievement') },
    { value: 'savings', label: t('admin.notif.type_savings') },
    { value: 'streak', label: t('admin.notif.type_streak') },
    { value: 'reward', label: t('admin.notif.type_reward') },
    { value: 'vault', label: t('admin.notif.type_vault') },
    { value: 'system', label: t('admin.notif.type_system') },
  ];

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['admin-notifications-list', search, typeFilter],
    queryFn: async () => {
      let query = supabase
        .from('notifications')
        .select('*, profiles!notifications_profile_id_fkey(display_name, avatar)')
        .order('created_at', { ascending: false })
        .limit(100);

      if (typeFilter !== 'all') query = query.eq('type', typeFilter);
      if (search) query = query.or(`title.ilike.%${search}%,message.ilike.%${search}%`);

      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('admin.notif.search')} className="pl-9" />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder={t('admin.notif.filter_type')} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('admin.notif.filter_all')}</SelectItem>
            {NOTIF_TYPES.map(nt => <SelectItem key={nt.value} value={nt.value}>{nt.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card className="border-border/50">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">{t('admin.notif.loading')}</div>
          ) : (notifications ?? []).length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">{t('admin.notif.no_notifications')}</div>
          ) : (
            <div className="divide-y divide-border/30">
              {(notifications ?? []).map((n: any) => (
                <div key={n.id} className="px-4 py-3 flex items-start gap-3 hover:bg-muted/30 transition-colors">
                  <span className="text-lg shrink-0 mt-0.5">{(n.profiles as any)?.avatar ?? '👤'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-display font-bold truncate">{n.title}</span>
                      <Badge variant="outline" className="text-[10px] shrink-0">{n.type}</Badge>
                      {n.urgent && <Badge variant="destructive" className="text-[10px]">{t('admin.notif.urgent')}</Badge>}
                      {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">{n.message}</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                      {(n.profiles as any)?.display_name ?? t('admin.notif.unknown_user')} · {relativeDate(n.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
