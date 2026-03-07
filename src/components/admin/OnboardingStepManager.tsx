import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { SplashIllustration } from '@/components/SplashIllustration';
import { ArrowUp, ArrowDown, Pencil, Trash2, Plus, Eye, EyeOff, ChevronRight, Copy } from 'lucide-react';
import { toast } from 'sonner';

const ROLES = ['parent', 'child', 'teen', 'teacher', 'admin', 'partner'] as const;

const ROLE_LABELS: Record<string, string> = {
  parent: 'Encarregado',
  child: 'Criança',
  teen: 'Adolescente',
  teacher: 'Professor',
  admin: 'Admin',
  partner: 'Parceiro',
};

const ILLUSTRATION_KEYS = [
  'parent-welcome', 'parent-tasks', 'parent-dashboard', 'parent-savings',
  'child-kivo', 'child-coins', 'child-dreams', 'child-achievements',
  'teen-welcome', 'teen-budget', 'teen-invest', 'teen-level-up',
  'teacher-classroom', 'teacher-manage', 'teacher-challenges',
  'admin-overview', 'admin-tenants', 'admin-analytics',
  'partner-welcome', 'partner-programs', 'partner-challenges',
];

interface StepRow {
  id: string;
  role: string;
  step_index: number;
  title: string;
  description: string;
  illustration_key: string;
  cta: string | null;
  is_active: boolean;
}

type FormData = {
  title: string;
  description: string;
  illustration_key: string;
  cta: string;
  is_active: boolean;
};

export default function OnboardingStepManager() {
  const [selectedRole, setSelectedRole] = useState<string>('parent');
  const [editingStep, setEditingStep] = useState<StepRow | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState<FormData>({ title: '', description: '', illustration_key: '', cta: '', is_active: true });
  const [previewKey, setPreviewKey] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: steps = [], isLoading } = useQuery({
    queryKey: ['admin-onboarding-steps', selectedRole],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('onboarding_steps')
        .select('*')
        .eq('role', selectedRole)
        .order('step_index', { ascending: true });
      if (error) throw error;
      return (data ?? []) as StepRow[];
    },
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin-onboarding-steps', selectedRole] });

  const saveMutation = useMutation({
    mutationFn: async ({ id, values }: { id?: string; values: Partial<StepRow> }) => {
      if (id) {
        const { error } = await supabase.from('onboarding_steps').update(values).eq('id', id);
        if (error) throw error;
      } else {
        const newIndex = steps.length;
        const { error } = await supabase.from('onboarding_steps').insert([{
          ...values,
          role: selectedRole,
          step_index: newIndex,
          title: values.title ?? '',
        }]);
        if (error) throw error;
      }
    },
    onSuccess: () => { invalidate(); toast.success('Passo guardado'); },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('onboarding_steps').delete().eq('id', id);
      if (error) throw error;
      // Re-index remaining steps
      const remaining = steps.filter(s => s.id !== id).sort((a, b) => a.step_index - b.step_index);
      for (let i = 0; i < remaining.length; i++) {
        if (remaining[i].step_index !== i) {
          await supabase.from('onboarding_steps').update({ step_index: i }).eq('id', remaining[i].id);
        }
      }
    },
    onSuccess: () => { invalidate(); toast.success('Passo eliminado'); },
    onError: (e: any) => toast.error(e.message),
  });

  const swapMutation = useMutation({
    mutationFn: async ({ a, b }: { a: StepRow; b: StepRow }) => {
      // Use a temporary index to avoid unique constraint violation
      const tempIndex = 9999;
      await supabase.from('onboarding_steps').update({ step_index: tempIndex }).eq('id', a.id);
      await supabase.from('onboarding_steps').update({ step_index: a.step_index }).eq('id', b.id);
      await supabase.from('onboarding_steps').update({ step_index: b.step_index }).eq('id', a.id);
    },
    onSuccess: () => invalidate(),
    onError: (e: any) => toast.error(e.message),
  });

  const openEdit = (step: StepRow) => {
    setEditingStep(step);
    setForm({
      title: step.title,
      description: step.description,
      illustration_key: step.illustration_key,
      cta: step.cta ?? '',
      is_active: step.is_active,
    });
  };

  const openCreate = () => {
    setIsCreating(true);
    setEditingStep(null);
    setForm({ title: '', description: '', illustration_key: ILLUSTRATION_KEYS[0], cta: '', is_active: true });
  };

  const handleSave = () => {
    const values = {
      title: form.title,
      description: form.description,
      illustration_key: form.illustration_key,
      cta: form.cta || null,
      is_active: form.is_active,
    };
    saveMutation.mutate(
      { id: editingStep?.id, values },
      { onSuccess: () => { setEditingStep(null); setIsCreating(false); } }
    );
  };

  const dialogOpen = !!editingStep || isCreating;

  return (
    <div className="space-y-4">
      {/* Role selector */}
      <Tabs value={selectedRole} onValueChange={setSelectedRole}>
        <TabsList className="flex-wrap h-auto gap-1">
          {ROLES.map(r => (
            <TabsTrigger key={r} value={r} className="text-xs">{ROLE_LABELS[r]}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Add button */}
      <div className="flex justify-end">
        <Button size="sm" onClick={openCreate} className="gap-1.5">
          <Plus className="h-4 w-4" /> Novo Passo
        </Button>
      </div>

      {/* Step cards */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      ) : steps.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="py-12 text-center text-muted-foreground text-sm">
            Nenhum passo configurado para este papel.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {steps.map((step, i) => (
            <Card key={step.id} className={`border-border/50 transition-opacity ${!step.is_active ? 'opacity-50' : ''}`}>
              <CardContent className="p-4 flex gap-4 items-start">
                {/* Mini preview */}
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted shrink-0 relative">
                  <div className="scale-[0.25] origin-top-left w-[320px] h-[320px]">
                    <SplashIllustration illustrationKey={step.illustration_key} />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-[10px]">Passo {step.step_index + 1}</Badge>
                    {!step.is_active && <Badge variant="secondary" className="text-[10px]"><EyeOff className="h-3 w-3 mr-1" />Inativo</Badge>}
                    {step.cta && <Badge className="text-[10px] bg-primary/10 text-primary">CTA: {step.cta}</Badge>}
                  </div>
                  <h4 className="text-sm font-display font-bold text-foreground truncate">{step.title}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{step.description}</p>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="h-7 w-7" disabled={i === 0} onClick={() => swapMutation.mutate({ a: step, b: steps[i - 1] })}>
                    <ArrowUp className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" disabled={i === steps.length - 1} onClick={() => swapMutation.mutate({ a: step, b: steps[i + 1] })}>
                    <ArrowDown className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(step)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => { if (confirm('Eliminar este passo?')) deleteMutation.mutate(step.id); }}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setPreviewKey(step.illustration_key)}>
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit / Create Dialog with live preview */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) { setEditingStep(null); setIsCreating(false); } }}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Left: Form */}
            <div className="p-6 space-y-4 overflow-y-auto max-h-[80vh]">
              <DialogHeader>
                <DialogTitle className="font-display">{editingStep ? 'Editar Passo' : 'Novo Passo'}</DialogTitle>
              </DialogHeader>
              <div>
                <Label>Título</Label>
                <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div>
                <Label>Descrição</Label>
                <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} />
              </div>
              <div>
                <Label>Ilustração</Label>
                <Select value={form.illustration_key} onValueChange={v => setForm(f => ({ ...f, illustration_key: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ILLUSTRATION_KEYS.map(k => (
                      <SelectItem key={k} value={k}>{k}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>CTA (botão, opcional)</Label>
                <Input value={form.cta} onChange={e => setForm(f => ({ ...f, cta: e.target.value }))} placeholder="Ex: Começar" />
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={form.is_active} onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))} />
                <Label>Ativo</Label>
              </div>
              <DialogFooter className="pt-2">
                <Button variant="outline" onClick={() => { setEditingStep(null); setIsCreating(false); }}>Cancelar</Button>
                <Button onClick={handleSave} disabled={!form.title || !form.illustration_key || saveMutation.isPending}>
                  {saveMutation.isPending ? 'A guardar...' : 'Guardar'}
                </Button>
              </DialogFooter>
            </div>

            {/* Right: Live preview mimicking the actual walkthrough */}
            <div className="hidden lg:flex items-center justify-center bg-background/80 backdrop-blur-sm p-6 border-l border-border/50">
              <div className="w-full max-w-sm bg-card border border-border/50 rounded-3xl shadow-2xl overflow-hidden">
                {/* Top accent */}
                <div className="h-1 bg-gradient-to-r from-primary via-chart-3 to-chart-4" />
                {/* Illustration */}
                {form.illustration_key && (
                  <div className="relative overflow-hidden">
                    <SplashIllustration illustrationKey={form.illustration_key} />
                  </div>
                )}
                {/* Content */}
                <div className="px-6 pb-6 pt-2 text-center">
                  <h2 className="text-lg font-display font-bold text-foreground mb-2">
                    {form.title || 'Título do passo'}
                  </h2>
                  <p className="text-xs text-muted-foreground leading-relaxed max-w-sm mx-auto">
                    {form.description || 'Descrição do passo aparecerá aqui...'}
                  </p>
                  {/* Dots */}
                  <div className="flex justify-center gap-1.5 mt-4 mb-4">
                    <div className="h-1.5 w-6 rounded-full bg-primary" />
                    <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/20" />
                    <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/20" />
                  </div>
                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground px-3 py-2">Saltar</span>
                    <Button size="sm" className="rounded-xl px-5 gap-1.5 font-display font-semibold shadow-md shadow-primary/20">
                      {form.cta || 'Seguinte'}
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
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
              <h2 className="text-lg font-display font-bold text-foreground mb-2">
                {steps.find(s => s.illustration_key === previewKey)?.title}
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {steps.find(s => s.illustration_key === previewKey)?.description}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
