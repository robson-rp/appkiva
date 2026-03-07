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

const EVENT_LABELS: Record<string, string> = {
  task_created: 'Tarefa criada',
  task_completed: 'Tarefa concluída',
  task_approved: 'Tarefa aprovada',
  lesson_completed: 'Lição concluída',
  donation_made: 'Doação feita',
  reward_claimed: 'Recompensa resgatada',
  allowance_sent: 'Mesada enviada',
  vault_deposit: 'Depósito cofre',
  vault_withdraw: 'Levantamento cofre',
  vault_milestone: 'Meta cofre',
  streak_milestone: 'Marco sequência',
  badge_unlocked: 'Badge desbloqueado',
  level_up: 'Subida de nível',
  budget_warning: 'Alerta orçamento',
  system_broadcast: 'Broadcast sistema',
};

const RECIPIENT_LABELS: Record<string, string> = {
  self: 'Próprio',
  parent: 'Pai/Mãe',
  child: 'Criança',
  all: 'Todos',
};

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
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { id: string; title_template: string; message_template: string; icon: string; is_urgent: boolean; cooldown_minutes: number }) => {
      const { id, ...rest } = payload;
      const { error } = await supabase
        .from('notification_templates')
        .update(rest as any)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-notification-templates'] });
      toast({ title: '✅ Template atualizado!' });
    },
    onError: (e: any) => {
      toast({ title: 'Erro', description: e?.message, variant: 'destructive' });
    },
  });
}

function EditTemplateDialog({ template, children }: { template: any; children: React.ReactNode }) {
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
          <DialogTitle className="font-display">Editar Template</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Badge variant="outline">{EVENT_LABELS[template.event] ?? template.event}</Badge>
            <Badge variant="secondary">→ {RECIPIENT_LABELS[template.recipient_role] ?? template.recipient_role}</Badge>
          </div>
          <div className="grid grid-cols-[60px_1fr] gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Ícone</Label>
              <Input value={icon} onChange={e => setIcon(e.target.value)} className="text-center text-lg" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Título (com placeholders)</Label>
              <Input value={title} onChange={e => setTitle(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Mensagem (com placeholders)</Label>
            <Textarea value={message} onChange={e => setMessage(e.target.value)} rows={3} />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch checked={urgent} onCheckedChange={setUrgent} id="edit-urgent" />
                <Label htmlFor="edit-urgent" className="text-xs">Urgente</Label>
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-xs whitespace-nowrap">Cooldown (min)</Label>
                <Input value={cooldown} onChange={e => setCooldown(e.target.value)} className="w-20" type="number" />
              </div>
            </div>
            <Button onClick={handleSave} disabled={update.isPending} size="sm">
              Guardar
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground">
            Placeholders disponíveis: {'{{child_name}}, {{parent_name}}, {{task_title}}, {{amount}}, {{vault_name}}, {{points}}, {{level}}, {{badge_name}}, {{cause_name}}, {{percent}}, {{days}}, {{score}}, {{lesson_title}}, {{reward_name}}, {{title}}, {{message}}'}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function NotificationTemplateManager() {
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
          placeholder="Pesquisar templates..."
          className="pl-9"
        />
      </div>

      <Card className="border-border/50">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">A carregar...</div>
          ) : (templates ?? []).length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">Nenhum template encontrado</div>
          ) : (
            <div className="divide-y divide-border/30">
              {(templates ?? []).map((t: any) => (
                <div key={t.id} className="px-4 py-3 flex items-center gap-3 hover:bg-muted/30 transition-colors">
                  <span className="text-xl shrink-0">{t.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-display font-bold truncate">{t.title_template}</span>
                      <Badge variant="outline" className="text-[10px] shrink-0">
                        {EVENT_LABELS[t.event] ?? t.event}
                      </Badge>
                      <Badge variant="secondary" className="text-[10px] shrink-0">
                        → {RECIPIENT_LABELS[t.recipient_role] ?? t.recipient_role}
                      </Badge>
                      {t.is_urgent && <Badge variant="destructive" className="text-[10px]">Urgente</Badge>}
                      {t.cooldown_minutes > 0 && (
                        <span className="text-[10px] text-muted-foreground">⏱ {t.cooldown_minutes}min</span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">{t.message_template}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Switch
                      checked={t.is_active}
                      onCheckedChange={(checked) => toggle.mutate({ id: t.id, is_active: checked })}
                    />
                    <EditTemplateDialog template={t}>
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
