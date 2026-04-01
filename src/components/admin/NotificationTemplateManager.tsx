import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Pencil, Plus, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { useT } from '@/contexts/LanguageContext';

function useEventLabels() {
  const t = useT();
  return {
    task_created: t('admin.notif.event_task_created'),
    task_completed: t('admin.notif.event_task_completed'),
    task_approved: t('admin.notif.event_task_approved'),
    lesson_completed: t('admin.notif.event_lesson_completed'),
    donation_made: t('admin.notif.event_donation_made'),
    reward_claimed: t('admin.notif.event_reward_claimed'),
    allowance_sent: t('admin.notif.event_allowance_sent'),
    vault_deposit: t('admin.notif.event_vault_deposit'),
    vault_withdraw: t('admin.notif.event_vault_withdraw'),
    vault_milestone: t('admin.notif.event_vault_milestone'),
    streak_milestone: t('admin.notif.event_streak_milestone'),
    badge_unlocked: t('admin.notif.event_badge_unlocked'),
    level_up: t('admin.notif.event_level_up'),
    budget_warning: t('admin.notif.event_budget_warning'),
    system_broadcast: t('admin.notif.event_system_broadcast'),
  } as Record<string, string>;
}

function useRecipientLabels() {
  const t = useT();
  return {
    self: t('admin.notif.recipient_self'),
    parent: t('admin.notif.recipient_parent'),
    child: t('admin.notif.recipient_child'),
    all: t('admin.notif.recipient_all'),
  } as Record<string, string>;
}

function useTemplates(search: string) {
  return useQuery({
    queryKey: ['admin-notification-templates', search],
    queryFn: async () => {
      let query = (supabase as any)
        .from('notification_templates')
        .select('*')
        .order('event', { ascending: true });

      if (search) {
        query = query.or(`title_template.ilike.%${search}%,message_template.ilike.%${search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });
}

function useToggleTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await (supabase as any)
        .from('notification_templates')
        .update({ is_active } as any)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-notification-templates'] });
      qc.invalidateQueries({ queryKey: ['admin-notification-stats'] });
    },
  });
}

function useUpdateTemplate() {
  const t = useT();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { id: string; title_template: string; message_template: string; icon: string; is_urgent: boolean; cooldown_minutes: number }) => {
      const { id, ...rest } = payload;
      const { error } = await (supabase as any)
        .from('notification_templates')
        .update(rest as any)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-notification-templates'] });
      toast({ title: t('admin.notif.template_updated') });
    },
    onError: (e: any) => {
      toast({ title: 'Erro', description: e?.message, variant: 'destructive' });
    },
  });
}

function EditTemplateDialog({ template, children }: { template: any; children: React.ReactNode }) {
  const t = useT();
  const eventLabels = useEventLabels();
  const recipientLabels = useRecipientLabels();
  const update = useUpdateTemplate();
  const [title, setTitle] = useState(template.title_template);
  const [message, setMessage] = useState(template.message_template);
  const [icon, setIcon] = useState(template.icon);
  const [urgent, setUrgent] = useState(template.is_urgent);
  const [cooldown, setCooldown] = useState(String(template.cooldown_minutes));
  const [open, setOpen] = useState(false);

  const handleSave = () => {
    update.mutate({
      id: template.id,
      title_template: title,
      message_template: message,
      icon,
      is_urgent: urgent,
      cooldown_minutes: parseInt(cooldown) || 0,
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display">{t('admin.notif.edit_template')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Badge variant="outline">{eventLabels[template.event] ?? template.event}</Badge>
            <Badge variant="secondary">→ {recipientLabels[template.recipient_role] ?? template.recipient_role}</Badge>
          </div>
          <div className="grid grid-cols-[60px_1fr] gap-2">
            <div className="space-y-1">
              <Label className="text-xs">{t('admin.notif.icon')}</Label>
              <Input value={icon} onChange={e => setIcon(e.target.value)} className="text-center text-lg" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">{t('admin.notif.title_placeholders')}</Label>
              <Input value={title} onChange={e => setTitle(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">{t('admin.notif.message_placeholders')}</Label>
            <Textarea value={message} onChange={e => setMessage(e.target.value)} rows={3} />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch checked={urgent} onCheckedChange={setUrgent} id="edit-urgent" />
                <Label htmlFor="edit-urgent" className="text-xs">{t('admin.notif.urgent')}</Label>
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-xs whitespace-nowrap">{t('admin.notif.cooldown')}</Label>
                <Input value={cooldown} onChange={e => setCooldown(e.target.value)} className="w-20" type="number" />
              </div>
            </div>
            <Button onClick={handleSave} disabled={update.isPending} size="sm">
              {t('admin.notif.save')}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            {t('admin.notif.placeholders_info')} {'{{child_name}}, {{parent_name}}, {{task_title}}, {{amount}}, {{vault_name}}, {{points}}, {{level}}, {{badge_name}}, {{cause_name}}, {{percent}}, {{days}}, {{score}}, {{lesson_title}}, {{reward_name}}, {{title}}, {{message}}'}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function NotificationTemplateManager() {
  const t = useT();
  const eventLabels = useEventLabels();
  const recipientLabels = useRecipientLabels();
  const [search, setSearch] = useState('');
  const { data: templates, isLoading } = useTemplates(search);
  const toggle = useToggleTemplate();

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={t('admin.notif.search_templates')}
          className="pl-9"
        />
      </div>

      <Card className="border-border/50">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">{t('admin.notif.loading')}</div>
          ) : (templates ?? []).length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">{t('admin.notif.no_templates')}</div>
          ) : (
            <div className="divide-y divide-border/30">
              {(templates ?? []).map((tpl: any) => (
                <div key={tpl.id} className="px-4 py-3 flex items-center gap-3 hover:bg-muted/30 transition-colors">
                  <span className="text-xl shrink-0">{tpl.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-display font-bold truncate">{tpl.title_template}</span>
                      <Badge variant="outline" className="text-xs shrink-0">
                        {eventLabels[tpl.event] ?? tpl.event}
                      </Badge>
                      <Badge variant="secondary" className="text-xs shrink-0">
                        → {recipientLabels[tpl.recipient_role] ?? tpl.recipient_role}
                      </Badge>
                      {tpl.is_urgent && <Badge variant="destructive" className="text-xs">{t('admin.notif.urgent')}</Badge>}
                      {tpl.cooldown_minutes > 0 && (
                        <span className="text-xs text-muted-foreground">⏱ {tpl.cooldown_minutes}min</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{tpl.message_template}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Switch
                      checked={tpl.is_active}
                      onCheckedChange={(checked) => toggle.mutate({ id: tpl.id, is_active: checked })}
                    />
                    <EditTemplateDialog template={tpl}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    </EditTemplateDialog>
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
