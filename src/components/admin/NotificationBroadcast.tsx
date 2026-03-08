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
import { useT } from '@/contexts/LanguageContext';

function useBroadcast() {
  const t = useT();
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
      toast({ title: t('admin.notif.sent_success'), description: t('admin.notif.sent_desc').replace('{count}', String(data?.sent ?? 0)) });
    },
    onError: (e: any) => {
      toast({ title: 'Erro', description: e?.message ?? t('admin.notif.send_error'), variant: 'destructive' });
    },
  });
}

export default function NotificationBroadcast() {
  const t = useT();
  const broadcast = useBroadcast();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('system');
  const [urgent, setUrgent] = useState(false);
  const [role, setRole] = useState('all');

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

  const handleSend = () => {
    if (!title.trim() || !message.trim()) {
      toast({ title: t('admin.notif.fill_all'), variant: 'destructive' });
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
          {t('admin.notif.send_title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>{t('admin.notif.field_title')}</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder={t('admin.notif.field_title_placeholder')} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label>{t('admin.notif.field_type')}</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {NOTIF_TYPES.map(nt => <SelectItem key={nt.value} value={nt.value}>{nt.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('admin.notif.field_recipients')}</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('admin.notif.role_all')}</SelectItem>
                  <SelectItem value="parent">{t('admin.notif.role_parent')}</SelectItem>
                  <SelectItem value="child">{t('admin.notif.role_child')}</SelectItem>
                  <SelectItem value="teen">{t('admin.notif.role_teen')}</SelectItem>
                  <SelectItem value="teacher">{t('admin.notif.role_teacher')}</SelectItem>
                  <SelectItem value="partner">{t('admin.notif.role_partner')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <Label>{t('admin.notif.field_message')}</Label>
          <Textarea value={message} onChange={e => setMessage(e.target.value)} placeholder={t('admin.notif.field_message_placeholder')} rows={3} />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Switch checked={urgent} onCheckedChange={setUrgent} id="broadcast-urgent" />
            <Label htmlFor="broadcast-urgent" className="text-sm">{t('admin.notif.urgent')}</Label>
          </div>
          <Button onClick={handleSend} disabled={broadcast.isPending} className="gap-2">
            <Send className="h-4 w-4" />
            {broadcast.isPending ? t('admin.notif.sending') : t('admin.notif.send_btn')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
