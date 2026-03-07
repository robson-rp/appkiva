import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

const NOTIF_TYPES = [
  { value: 'task', label: 'Tarefa' },
  { value: 'mission', label: 'Missão' },
  { value: 'achievement', label: 'Conquista' },
  { value: 'savings', label: 'Poupança' },
  { value: 'streak', label: 'Sequência' },
  { value: 'reward', label: 'Recompensa' },
  { value: 'vault', label: 'Cofre' },
  { value: 'system', label: 'Sistema' },
];

function relativeDate(date: string) {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
  if (diff < 1) return 'Agora';
  if (diff < 60) return `${diff}m`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h`;
  return `${Math.floor(diff / 1440)}d`;
}

export default function NotificationHistory() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

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
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Pesquisar..." className="pl-9" />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Tipo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {NOTIF_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card className="border-border/50">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">A carregar...</div>
          ) : (notifications ?? []).length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">Nenhuma notificação encontrada</div>
          ) : (
            <div className="divide-y divide-border/30">
              {(notifications ?? []).map((n: any) => (
                <div key={n.id} className="px-4 py-3 flex items-start gap-3 hover:bg-muted/30 transition-colors">
                  <span className="text-lg shrink-0 mt-0.5">{(n.profiles as any)?.avatar ?? '👤'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-display font-bold truncate">{n.title}</span>
                      <Badge variant="outline" className="text-[10px] shrink-0">{n.type}</Badge>
                      {n.urgent && <Badge variant="destructive" className="text-[10px]">Urgente</Badge>}
                      {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">{n.message}</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                      {(n.profiles as any)?.display_name ?? 'Desconhecido'} · {relativeDate(n.created_at)}
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
