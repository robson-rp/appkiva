import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { SplashIllustration } from '@/components/SplashIllustration';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ArrowUp, ArrowDown, Pencil, Trash2, Plus, Eye, Copy, CalendarIcon, Clock, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { useT } from '@/contexts/LanguageContext';

const ROLES = ['parent', 'child', 'teen', 'teacher', 'admin', 'partner'] as const;

const ILLUSTRATION_KEYS = [
  'parent-welcome', 'parent-tasks', 'parent-dashboard', 'parent-savings',
  'child-kivo', 'child-coins', 'child-dreams', 'child-achievements',
  'teen-welcome', 'teen-budget', 'teen-invest', 'teen-level-up',
  'teacher-classroom', 'teacher-manage', 'teacher-challenges',
  'admin-overview', 'admin-tenants', 'admin-analytics',
  'partner-welcome', 'partner-programs', 'partner-challenges',
];

interface StepRow {
  id: string; role: string; step_index: number; title: string; description: string;
  illustration_key: string; cta: string | null; is_active: boolean;
  visible_from: string | null; visible_until: string | null;
}

type FormData = {
  title: string; description: string; illustration_key: string; cta: string;
  is_active: boolean; visible_from: Date | null; visible_until: Date | null;
};

function getVisibilityStatus(step: StepRow): 'active' | 'scheduled' | 'expired' | 'inactive' {
  if (!step.is_active) return 'inactive';
  const now = new Date();
  if (step.visible_from && new Date(step.visible_from) > now) return 'scheduled';
  if (step.visible_until && new Date(step.visible_until) < now) return 'expired';
  return 'active';
}

function DatePickerField({ label, value, onChange }: { label: string; value: Date | null; onChange: (d: Date | null) => void }) {
  const t = useT();
  return (
    <div>
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className={cn("flex-1 justify-start text-left font-normal", !value && "text-muted-foreground")}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {value ? format(value, "dd/MM/yyyy HH:mm") : t('admin.onboarding.no_limit')}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="single" selected={value ?? undefined} onSelect={(d) => onChange(d ?? null)} className={cn("p-3 pointer-events-auto")} />
          </PopoverContent>
        </Popover>
        {value && (<Button variant="ghost" size="icon" className="h-10 w-10 shrink-0" onClick={() => onChange(null)}>✕</Button>)}
      </div>
    </div>
  );
}

export default function OnboardingStepManager() {
  const t = useT();
  const getRoleLabel = (role: string) => t(`admin.onboarding.role_${role}`);

  const STATUS_BADGES: Record<string, { label: string; className: string }> = {
    active: { label: t('admin.onboarding.status_active'), className: 'bg-green-500/10 text-green-600' },
    scheduled: { label: t('admin.onboarding.status_scheduled'), className: 'bg-chart-4/10 text-chart-4' },
    expired: { label: t('admin.onboarding.status_expired'), className: 'bg-destructive/10 text-destructive' },
    inactive: { label: t('admin.onboarding.status_inactive'), className: 'bg-muted text-muted-foreground' },
  };

  const [selectedRole, setSelectedRole] = useState<string>('parent');
  const [editingStep, setEditingStep] = useState<StepRow | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState<FormData>({ title: '', description: '', illustration_key: '', cta: '', is_active: true, visible_from: null, visible_until: null });
  const [previewKey, setPreviewKey] = useState<string | null>(null);
  const [duplicatingStep, setDuplicatingStep] = useState<StepRow | null>(null);
  const [dupTargetRoles, setDupTargetRoles] = useState<string[]>([]);
  const queryClient = useQueryClient();

  const { data: steps = [], isLoading } = useQuery({
    queryKey: ['admin-onboarding-steps', selectedRole],
    queryFn: async () => {
      const data = await api.get<StepRow[]>('/admin/onboarding-steps?role=' + selectedRole);
      return (data ?? []) as StepRow[];
    },
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin-onboarding-steps', selectedRole] });

  const saveMutation = useMutation({
    mutationFn: async ({ id, values }: { id?: string; values: Partial<StepRow> }) => {
      if (id) {
        await api.put('/admin/onboarding-steps/' + id, values);
      } else {
        const newIndex = steps.length;
        await api.post('/admin/onboarding-steps', { ...values, role: selectedRole, step_index: newIndex, title: values.title ?? '' });
      }
    },
    onSuccess: () => { invalidate(); toast.success(t('admin.onboarding.step_saved')); },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete('/admin/onboarding-steps/' + id);
      const remaining = steps.filter(s => s.id !== id).sort((a, b) => a.step_index - b.step_index);
      for (let i = 0; i < remaining.length; i++) {
        if (remaining[i].step_index !== i) await api.put('/admin/onboarding-steps/' + remaining[i].id, { step_index: i });
      }
    },
    onSuccess: () => { invalidate(); toast.success(t('admin.onboarding.step_deleted')); },
    onError: (e: any) => toast.error(e.message),
  });

  const swapMutation = useMutation({
    mutationFn: async ({ a, b }: { a: StepRow; b: StepRow }) => {
      const tempIndex = 9999;
      await api.put('/admin/onboarding-steps/' + a.id, { step_index: tempIndex });
      await api.put('/admin/onboarding-steps/' + b.id, { step_index: a.step_index });
      await api.put('/admin/onboarding-steps/' + a.id, { step_index: b.step_index });
    },
    onSuccess: () => invalidate(),
    onError: (e: any) => toast.error(e.message),
  });

  const duplicateMutation = useMutation({
    mutationFn: async ({ step, targetRoles }: { step: StepRow; targetRoles: string[] }) => {
      for (const role of targetRoles) {
        const existing = await api.get<any[]>('/admin/onboarding-steps?role=' + role);
        const nextIndex = (existing && existing.length > 0 ? existing[existing.length - 1].step_index + 1 : 0);
        await api.post('/admin/onboarding-steps', { role, step_index: nextIndex, title: step.title, description: step.description, illustration_key: step.illustration_key, cta: step.cta, is_active: step.is_active });
      }
    },
    onSuccess: (_, { targetRoles }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-onboarding-steps'] });
      toast.success(t('admin.onboarding.step_duplicated').replace('{count}', String(targetRoles.length)));
      setDuplicatingStep(null); setDupTargetRoles([]);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const openEdit = (step: StepRow) => { setEditingStep(step); setForm({ title: step.title, description: step.description, illustration_key: step.illustration_key, cta: step.cta ?? '', is_active: step.is_active, visible_from: step.visible_from ? new Date(step.visible_from) : null, visible_until: step.visible_until ? new Date(step.visible_until) : null }); };
  const openCreate = () => { setIsCreating(true); setEditingStep(null); setForm({ title: '', description: '', illustration_key: ILLUSTRATION_KEYS[0], cta: '', is_active: true, visible_from: null, visible_until: null }); };
  const handleSave = () => {
    const values = { title: form.title, description: form.description, illustration_key: form.illustration_key, cta: form.cta || null, is_active: form.is_active, visible_from: form.visible_from?.toISOString() ?? null, visible_until: form.visible_until?.toISOString() ?? null };
    saveMutation.mutate({ id: editingStep?.id, values }, { onSuccess: () => { setEditingStep(null); setIsCreating(false); } });
  };

  const dialogOpen = !!editingStep || isCreating;

  return (
    <div className="space-y-4">
      <Tabs value={selectedRole} onValueChange={setSelectedRole}>
        <TabsList className="flex-wrap h-auto gap-1">
          {ROLES.map(r => <TabsTrigger key={r} value={r} className="text-xs">{getRoleLabel(r)}</TabsTrigger>)}
        </TabsList>
      </Tabs>

      <div className="flex justify-end">
        <Button size="sm" onClick={openCreate} className="gap-1.5"><Plus className="h-4 w-4" /> {t('admin.onboarding.new_step')}</Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>
      ) : steps.length === 0 ? (
        <Card className="border-border/50"><CardContent className="py-12 text-center text-muted-foreground text-sm">{t('admin.onboarding.no_steps')}</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {steps.map((step, i) => (
            <Card key={step.id} className={`border-border/50 transition-opacity ${!step.is_active ? 'opacity-50' : ''}`}>
              <CardContent className="p-4 flex gap-4 items-start">
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted shrink-0 relative">
                  <div className="scale-[0.25] origin-top-left w-[320px] h-[320px]"><SplashIllustration illustrationKey={step.illustration_key} /></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <Badge variant="outline" className="text-xs">{t('admin.onboarding.step')} {step.step_index + 1}</Badge>
                    {(() => { const status = getVisibilityStatus(step); const badge = STATUS_BADGES[status]; return <Badge className={cn("text-xs", badge.className)}>{status === 'scheduled' && <Clock className="h-3 w-3 mr-1" />}{badge.label}</Badge>; })()}
                    {step.cta && <Badge className="text-xs bg-primary/10 text-primary">CTA: {step.cta}</Badge>}
                    {(step.visible_from || step.visible_until) && (<span className="text-xs text-muted-foreground">{step.visible_from ? format(new Date(step.visible_from), 'dd/MM/yy') : '∞'}{' → '}{step.visible_until ? format(new Date(step.visible_until), 'dd/MM/yy') : '∞'}</span>)}
                  </div>
                  <h4 className="text-sm font-display font-bold text-foreground truncate">{step.title}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{step.description}</p>
                </div>
                <div className="flex flex-col gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="h-7 w-7" disabled={i === 0} onClick={() => swapMutation.mutate({ a: step, b: steps[i - 1] })}><ArrowUp className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" disabled={i === steps.length - 1} onClick={() => swapMutation.mutate({ a: step, b: steps[i + 1] })}><ArrowDown className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(step)}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => { if (confirm(t('admin.onboarding.delete_confirm'))) deleteMutation.mutate(step.id); }}><Trash2 className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setPreviewKey(step.illustration_key)}><Eye className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setDuplicatingStep(step); setDupTargetRoles([]); }}><Copy className="h-3.5 w-3.5" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit / Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) { setEditingStep(null); setIsCreating(false); } }}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="p-6 space-y-4 overflow-y-auto max-h-[80vh]">
              <DialogHeader><DialogTitle className="font-display">{editingStep ? t('admin.onboarding.edit_step') : t('admin.onboarding.new_step_dialog')}</DialogTitle></DialogHeader>
              <div><Label>{t('admin.onboarding.label_title')}</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
              <div><Label>{t('admin.onboarding.label_description')}</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} /></div>
              <div><Label>{t('admin.onboarding.label_illustration')}</Label><Select value={form.illustration_key} onValueChange={v => setForm(f => ({ ...f, illustration_key: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{ILLUSTRATION_KEYS.map(k => <SelectItem key={k} value={k}>{k}</SelectItem>)}</SelectContent></Select></div>
              <div><Label>{t('admin.onboarding.label_cta')}</Label><Input value={form.cta} onChange={e => setForm(f => ({ ...f, cta: e.target.value }))} placeholder={t('admin.onboarding.cta_placeholder')} /></div>
              <div className="flex items-center gap-3"><Switch checked={form.is_active} onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))} /><Label>{t('admin.onboarding.label_active')}</Label></div>
              <DatePickerField label={t('admin.onboarding.visible_from')} value={form.visible_from} onChange={d => setForm(f => ({ ...f, visible_from: d }))} />
              <DatePickerField label={t('admin.onboarding.visible_until')} value={form.visible_until} onChange={d => setForm(f => ({ ...f, visible_until: d }))} />
              <DialogFooter className="pt-2">
                <Button variant="outline" onClick={() => { setEditingStep(null); setIsCreating(false); }}>{t('admin.onboarding.cancel')}</Button>
                <Button onClick={handleSave} disabled={!form.title || !form.illustration_key || saveMutation.isPending}>{saveMutation.isPending ? t('admin.onboarding.saving') : t('admin.onboarding.save')}</Button>
              </DialogFooter>
            </div>
            <div className="hidden lg:flex items-center justify-center bg-background/80 backdrop-blur-sm p-6 border-l border-border/50">
              <div className="w-full max-w-sm bg-card border border-border/50 rounded-3xl shadow-2xl overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-primary via-chart-3 to-chart-4" />
                {form.illustration_key && (<div className="relative overflow-hidden"><SplashIllustration illustrationKey={form.illustration_key} /></div>)}
                <div className="px-6 pb-6 pt-2 text-center">
                  <h2 className="text-lg font-display font-bold text-foreground mb-2">{form.title || t('admin.onboarding.label_title')}</h2>
                  <p className="text-xs text-muted-foreground leading-relaxed max-w-sm mx-auto">{form.description || t('admin.onboarding.label_description')}</p>
                  <div className="flex justify-center gap-1.5 mt-4 mb-4"><div className="h-1.5 w-6 rounded-full bg-primary" /><div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/20" /><div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/20" /></div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground px-3 py-2">{t('admin.onboarding.skipped')}</span>
                    <Button size="sm" className="rounded-xl px-5 gap-1.5 font-display font-semibold shadow-md shadow-primary/20">{form.cta || t('admin.onboarding.save')}<ChevronRight className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Full Preview Dialog */}
      <Dialog open={!!previewKey} onOpenChange={() => setPreviewKey(null)}>
        <DialogContent className="max-w-md p-0 overflow-hidden">
          <div className="w-full max-w-sm mx-auto bg-card border border-border/50 rounded-3xl shadow-2xl overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-primary via-chart-3 to-chart-4" />
            {previewKey && <SplashIllustration illustrationKey={previewKey} />}
            <div className="px-6 pb-6 pt-2 text-center">
              <h2 className="text-lg font-display font-bold text-foreground mb-2">{steps.find(s => s.illustration_key === previewKey)?.title}</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">{steps.find(s => s.illustration_key === previewKey)?.description}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Duplicate Dialog */}
      <Dialog open={!!duplicatingStep} onOpenChange={(open) => { if (!open) { setDuplicatingStep(null); setDupTargetRoles([]); } }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display">{t('admin.onboarding.dup_title')}</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">{t('admin.onboarding.dup_desc')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {ROLES.filter(r => r !== duplicatingStep?.role).map(r => (
              <label key={r} className="flex items-center gap-3 cursor-pointer">
                <Checkbox checked={dupTargetRoles.includes(r)} onCheckedChange={(checked) => { setDupTargetRoles(prev => checked ? [...prev, r] : prev.filter(x => x !== r)); }} />
                <span className="text-sm">{getRoleLabel(r)}</span>
              </label>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDuplicatingStep(null); setDupTargetRoles([]); }}>{t('admin.onboarding.cancel')}</Button>
            <Button disabled={dupTargetRoles.length === 0 || duplicateMutation.isPending} onClick={() => duplicatingStep && duplicateMutation.mutate({ step: duplicatingStep, targetRoles: dupTargetRoles })}>
              {duplicateMutation.isPending ? t('admin.onboarding.dup_duplicating') : `${t('admin.onboarding.dup_btn')} (${dupTargetRoles.length})`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
