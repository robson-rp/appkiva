import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';

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

function useBroadcast() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { title: string; message: string; type: string; urgent: boolean; role?: string }) => {
      let profileIds: string[] = [];

      if (payload.role && payload.role !== 'all') {
        const { data: roleUsers } = await supabase
          .from('user_roles')
          .select('user_id')
          .eq('role', payload.role as any);
        const userIds = (roleUsers ?? []).map(r => r.user_id);
        if (userIds.length === 0) return { sent: 0 };
        const { data: profiles } = await supabase.from('profiles').select('id').in('user_id', userIds);
        profileIds = (profiles ?? []).map(p => p.id);
      } else {
        const { data: profiles } = await supabase.from('profiles').select('id');
        profileIds = (profiles ?? []).map(p => p.id);
      }

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

export default function NotificationBroadcast() {
  const broadcast = useBroadcast();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('system');
  const [urgent, setUrgent] = useState(false);
  const [role, setRole] = useState('all');

  const handleSend = () => {
    if (!title.trim() || !message.trim()) {
      toast({ title: 'Preencha todos os campos', variant: 'destructive' });
      return;
    }
    broadcast.mutate({ title, message, type, urgent, role });
    setTitle('');
    setMessage('');
    setUrgent(false);
  };

  return (
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
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: 🎉 Nova funcionalidade!" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {NOTIF_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Destinatários</Label>
              <Select value={role} onValueChange={setRole}>
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
          <Textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Escreve a mensagem..." rows={3} />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Switch checked={urgent} onCheckedChange={setUrgent} id="broadcast-urgent" />
            <Label htmlFor="broadcast-urgent" className="text-sm">Urgente</Label>
          </div>
          <Button onClick={handleSend} disabled={broadcast.isPending} className="gap-2">
            <Send className="h-4 w-4" />
            {broadcast.isPending ? 'A enviar...' : 'Enviar'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
