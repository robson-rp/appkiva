import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Send, Users, BarChart3, Search, Trash2, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

const NOTIF_TYPES = [
  { value: 'task', label: 'Tarefa' },
  { value: 'mission', label: 'Missão' },
  { value: 'achievement', label: 'Conquista' },
  { value: 'savings', label: 'Poupança' },
  { value: 'streak', label: 'Sequência' },
  { value: 'class', label: 'Turma' },
  { value: 'reward', label: 'Recompensa' },
  { value: 'vault', label: 'Cofre' },
  { value: 'system', label: 'Sistema' },
];

function useNotificationStats() {
  return useQuery({
    queryKey: ['admin-notification-stats'],
    queryFn: async () => {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const weekAgo = new Date(now.getTime() - 7 * 86400000).toISOString();

      const [totalRes, todayRes, unreadRes, urgentRes] = await Promise.all([
        supabase.from('notifications').select('id', { count: 'exact', head: true }),
        supabase.from('notifications').select('id', { count: 'exact', head: true }).gte('created_at', today),
        supabase.from('notifications').select('id', { count: 'exact', head: true }).eq('read', false),
        supabase.from('notifications').select('id', { count: 'exact', head: true }).eq('urgent', true).eq('read', false),
      ]);

      return {
        total: totalRes.count ?? 0,
        today: todayRes.count ?? 0,
        unread: unreadRes.count ?? 0,
        urgent: urgentRes.count ?? 0,
      };
    },
  });
}

function useRecentNotifications(search: string, typeFilter: string) {
  return useQuery({
    queryKey: ['admin-notifications-list', search, typeFilter],
    queryFn: async () => {
      let query = supabase
        .from('notifications')
        .select('*, profiles!notifications_profile_id_fkey(display_name, avatar)')
        .order('created_at', { ascending: false })
        .limit(100);

      if (typeFilter && typeFilter !== 'all') {
        query = query.eq('type', typeFilter);
      }
      if (search) {
        query = query.or(`title.ilike.%${search}%,message.ilike.%${search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });
}

function useBroadcastNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { title: string; message: string; type: string; urgent: boolean; role?: string }) => {
      // Get all profiles (or filter by role)
      let query = supabase.from('profiles').select('id');
      if (payload.role && payload.role !== 'all') {
        const { data: roleUsers } = await supabase
          .from('user_roles')
          .select('user_id')
          .eq('role', payload.role as any);
        const userIds = (roleUsers ?? []).map(r => r.user_id);
        if (userIds.length === 0) return { sent: 0 };
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id')
          .in('user_id', userIds);
        const profileIds = (profiles ?? []).map(p => p.id);
        if (profileIds.length === 0) return { sent: 0 };
        
        const rows = profileIds.map(pid => ({
          profile_id: pid,
          title: payload.title,
          message: payload.message,
          type: payload.type,
          urgent: payload.urgent,
        }));
        const { error } = await supabase.from('notifications').insert(rows);
        if (error) throw error;
        return { sent: rows.length };
      }

      // Broadcast to all
      const { data: allProfiles } = await query;
      const profileIds = (allProfiles ?? []).map(p => p.id);
      if (profileIds.length === 0) return { sent: 0 };

      const rows = profileIds.map(pid => ({
        profile_id: pid,
        title: payload.title,
        message: payload.message,
        type: payload.type,
        urgent: payload.urgent,
      }));
      const { error } = await supabase.from('notifications').insert(rows);
      if (error) throw error;
      return { sent: rows.length };
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['admin-notification'] });
      toast({ title: '📢 Notificação enviada!', description: `Enviada para ${data?.sent ?? 0} utilizadores.` });
    },
    onError: (e: any) => {
      toast({ title: 'Erro', description: e?.message ?? 'Falha ao enviar.', variant: 'destructive' });
    },
  });
}

export default function AdminNotifications() {
  const { data: stats } = useNotificationStats();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const { data: notifications, isLoading } = useRecentNotifications(search, typeFilter);
  const broadcast = useBroadcastNotification();

  // Broadcast form state
  const [bTitle, setBTitle] = useState('');
  const [bMessage, setBMessage] = useState('');
  const [bType, setBType] = useState('system');
  const [bUrgent, setBUrgent] = useState(false);
  const [bRole, setBRole] = useState('all');

  const handleBroadcast = () => {
    if (!bTitle.trim() || !bMessage.trim()) {
      toast({ title: 'Preencha todos os campos', variant: 'destructive' });
      return;
    }
    broadcast.mutate({ title: bTitle, message: bMessage, type: bType, urgent: bUrgent, role: bRole });
    setBTitle('');
    setBMessage('');
    setBUrgent(false);
  };

  const statCards = [
    { label: 'Total Notificações', value: stats?.total ?? 0, icon: Bell, bg: 'bg-[hsl(var(--kivara-light-blue))]' },
    { label: 'Enviadas Hoje', value: stats?.today ?? 0, icon: Send, bg: 'bg-[hsl(var(--kivara-light-green))]' },
    { label: 'Não Lidas', value: stats?.unread ?? 0, icon: Eye, bg: 'bg-[hsl(var(--kivara-light-gold))]' },
    { label: 'Urgentes', value: stats?.urgent ?? 0, icon: Bell, bg: 'bg-destructive/10' },
  ];

  const relativeDate = (date: string) => {
    const diff = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
    if (diff < 1) return 'Agora';
    if (diff < 60) return `${diff}m`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h`;
    return `${Math.floor(diff / 1440)}d`;
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-6xl mx-auto">
      <motion.div variants={item}>
        <h1 className="text-heading md:text-heading-lg font-display font-bold text-foreground">Notificações</h1>
        <p className="text-small text-muted-foreground mt-1">Gestão e envio de notificações da plataforma</p>
      </motion.div>

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map(s => (
          <Card key={s.label} className="border-border/50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`${s.bg} rounded-xl p-2.5`}>
                <s.icon className="h-5 w-5 text-foreground/70" />
              </div>
              <div>
                <p className="text-2xl font-display font-bold">{s.value}</p>
                <p className="text-caption text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      <Tabs defaultValue="broadcast" className="space-y-4">
        <TabsList>
          <TabsTrigger value="broadcast">📢 Enviar</TabsTrigger>
          <TabsTrigger value="history">📋 Histórico</TabsTrigger>
        </TabsList>

        {/* Broadcast Tab */}
        <TabsContent value="broadcast">
          <motion.div variants={item}>
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-base font-display flex items-center gap-2">
                  <Send className="h-4 w-4 text-primary" />
                  Enviar Notificação
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Título</Label>
                    <Input
                      value={bTitle}
                      onChange={e => setBTitle(e.target.value)}
                      placeholder="Ex: 🎉 Nova funcionalidade disponível!"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label>Tipo</Label>
                      <Select value={bType} onValueChange={setBType}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {NOTIF_TYPES.map(t => (
                            <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Destinatários</Label>
                      <Select value={bRole} onValueChange={setBRole}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos</SelectItem>
                          <SelectItem value="parent">Pais</SelectItem>
                          <SelectItem value="child">Crianças</SelectItem>
                          <SelectItem value="teen">Adolescentes</SelectItem>
                          <SelectItem value="teacher">Professores</SelectItem>
                          <SelectItem value="partner">Parceiros</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Mensagem</Label>
                  <Textarea
                    value={bMessage}
                    onChange={e => setBMessage(e.target.value)}
                    placeholder="Escreve a mensagem da notificação..."
                    rows={3}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch checked={bUrgent} onCheckedChange={setBUrgent} id="urgent" />
                    <Label htmlFor="urgent" className="text-sm">Urgente (banner)</Label>
                  </div>
                  <Button onClick={handleBroadcast} disabled={broadcast.isPending} className="gap-2">
                    <Send className="h-4 w-4" />
                    {broadcast.isPending ? 'A enviar...' : 'Enviar'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <motion.div variants={item} className="space-y-4">
            {/* Filters */}
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Pesquisar notificações..."
                  className="pl-9"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40"><SelectValue placeholder="Tipo" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {NOTIF_TYPES.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* List */}
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
                        <div className="text-lg shrink-0 mt-0.5">
                          {(n.profiles as any)?.avatar ?? '👤'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-display font-bold truncate">{n.title}</span>
                            <Badge variant="outline" className="text-[10px] shrink-0">{n.type}</Badge>
                            {n.urgent && <Badge variant="destructive" className="text-[10px] shrink-0">Urgente</Badge>}
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
          </motion.div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
