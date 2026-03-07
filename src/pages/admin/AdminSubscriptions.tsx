import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { CreditCard, Plus, Pencil, Trash2, Search, Package, CheckCircle, XCircle, Users } from 'lucide-react';
import {
  useSubscriptionTiers, useCreateSubscriptionTier, useUpdateSubscriptionTier, useDeleteSubscriptionTier,
} from '@/hooks/use-tenants';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { z } from 'zod';

const tierTypeLabels: Record<string, string> = {
  free: 'Gratuito',
  family_premium: 'Família Premium',
  school_institutional: 'Escolar',
  partner_program: 'Parceiro',
};

const tierSchema = z.object({
  name: z.string().trim().min(1, 'Nome obrigatório').max(100),
  tier_type: z.enum(['free', 'family_premium', 'school_institutional', 'partner_program']),
  price_monthly: z.number().min(0, 'Deve ser ≥ 0'),
  price_yearly: z.number().min(0, 'Deve ser ≥ 0'),
  max_children: z.number().int().min(0),
  max_classrooms: z.number().int().min(0),
  currency: z.string().trim().min(1).max(10),
  is_active: z.boolean(),
  features: z.array(z.string()),
});

type TierForm = z.infer<typeof tierSchema>;

const emptyForm: TierForm = {
  name: '',
  tier_type: 'free',
  price_monthly: 0,
  price_yearly: 0,
  max_children: 5,
  max_classrooms: 0,
  currency: 'USD',
  is_active: true,
  features: [],
};

export default function AdminSubscriptions() {
  const { data: tiers, isLoading } = useSubscriptionTiers(true);
  const createTier = useCreateSubscriptionTier();
  const updateTier = useUpdateSubscriptionTier();
  const deleteTier = useDeleteSubscriptionTier();

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<TierForm>(emptyForm);
  const [featuresText, setFeaturesText] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filtered = useMemo(() => {
    if (!tiers) return [];
    return tiers.filter((t: any) => {
      if (typeFilter !== 'all' && t.tier_type !== typeFilter) return false;
      if (statusFilter === 'active' && !t.is_active) return false;
      if (statusFilter === 'inactive' && t.is_active) return false;
      if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [tiers, search, typeFilter, statusFilter]);

  const stats = useMemo(() => {
    if (!tiers) return { total: 0, active: 0, inactive: 0 };
    return {
      total: tiers.length,
      active: tiers.filter((t: any) => t.is_active).length,
      inactive: tiers.filter((t: any) => !t.is_active).length,
    };
  }, [tiers]);

  function openCreate() {
    setEditId(null);
    setForm(emptyForm);
    setFeaturesText('');
    setErrors({});
    setDialogOpen(true);
  }

  function openEdit(tier: any) {
    setEditId(tier.id);
    const features = Array.isArray(tier.features) ? tier.features : [];
    setForm({
      name: tier.name,
      tier_type: tier.tier_type,
      price_monthly: Number(tier.price_monthly),
      price_yearly: Number(tier.price_yearly),
      max_children: tier.max_children,
      max_classrooms: tier.max_classrooms,
      currency: tier.currency,
      is_active: tier.is_active,
      features,
    });
    setFeaturesText(features.join('\n'));
    setErrors({});
    setDialogOpen(true);
  }

  async function handleSubmit() {
    const parsed = tierSchema.safeParse({
      ...form,
      features: featuresText.split('\n').map(f => f.trim()).filter(Boolean),
    });
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.errors.forEach(e => { fieldErrors[e.path[0] as string] = e.message; });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    const validData = parsed.data;
    try {
      if (editId) {
        await updateTier.mutateAsync({ id: editId, ...validData });
        toast.success('Plano atualizado');
      } else {
        await createTier.mutateAsync({
          name: validData.name,
          tier_type: validData.tier_type,
          price_monthly: validData.price_monthly,
          price_yearly: validData.price_yearly,
          max_children: validData.max_children,
          max_classrooms: validData.max_classrooms,
          currency: validData.currency,
          is_active: validData.is_active,
          features: validData.features,
        });
        toast.success('Plano criado');
      }
      setDialogOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Erro ao guardar');
    }
  }

  function canDelete(tier: any) {
    return !tier.is_active && (tier.tenant_count ?? 0) === 0;
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteTier.mutateAsync(deleteTarget.id);
      toast.success(`Plano "${deleteTarget.name}" eliminado`);
    } catch (err: any) {
      toast.error(err.message || 'Erro ao eliminar');
    } finally {
      setDeleteTarget(null);
    }
  }

  const isSaving = createTier.isPending || updateTier.isPending;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Planos de Subscrição</h1>
        <p className="text-sm text-muted-foreground">Gestão completa dos tiers de subscrição da plataforma</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total de Planos', value: stats.total, icon: Package, color: 'text-primary' },
          { label: 'Activos', value: stats.active, icon: CheckCircle, color: 'text-secondary' },
          { label: 'Inactivos', value: stats.inactive, icon: XCircle, color: 'text-muted-foreground' },
        ].map(s => (
          <Card key={s.label} className="border-border/50">
            <CardContent className="flex items-center gap-3 p-4">
              <s.icon className={`h-5 w-5 ${s.color}`} />
              <div>
                <p className="text-2xl font-display font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="border-border/50">
        <CardContent className="flex flex-wrap items-end gap-3 p-4">
          <div className="flex-1 min-w-[180px]">
            <Label className="text-xs text-muted-foreground mb-1 block">Pesquisar</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Nome do plano..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <div className="min-w-[160px]">
            <Label className="text-xs text-muted-foreground mb-1 block">Tipo</Label>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="free">Gratuito</SelectItem>
                <SelectItem value="family_premium">Família Premium</SelectItem>
                <SelectItem value="school_institutional">Escolar</SelectItem>
                <SelectItem value="partner_program">Parceiro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="min-w-[140px]">
            <Label className="text-xs text-muted-foreground mb-1 block">Estado</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Activo</SelectItem>
                <SelectItem value="inactive">Inactivo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={openCreate} className="gap-1.5">
            <Plus className="h-4 w-4" /> Novo Plano
          </Button>
        </CardContent>
      </Card>

      {/* Table */}
      {isLoading ? (
        <p className="text-center text-muted-foreground py-8">A carregar...</p>
      ) : (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-border/50">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Mensal</TableHead>
                    <TableHead className="text-right">Anual</TableHead>
                    <TableHead className="text-center">Crianças</TableHead>
                    <TableHead className="text-center">Turmas</TableHead>
                    <TableHead>Moeda</TableHead>
                    <TableHead className="text-center">Tenants</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acções</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                        Nenhum plano encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((tier: any) => (
                      <TableRow key={tier.id}>
                        <TableCell className="font-medium">{tier.name}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">
                            {tierTypeLabels[tier.tier_type] ?? tier.tier_type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono">${tier.price_monthly}</TableCell>
                        <TableCell className="text-right font-mono">${tier.price_yearly}</TableCell>
                        <TableCell className="text-center">{tier.max_children}</TableCell>
                        <TableCell className="text-center">{tier.max_classrooms}</TableCell>
                        <TableCell>{tier.currency}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className="text-xs font-mono">
                            {tier.tenant_count ?? 0}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={tier.is_active ? 'default' : 'outline'} className="text-xs">
                            {tier.is_active ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(tier)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={!canDelete(tier)}
                            title={canDelete(tier) ? 'Eliminar plano' : 'Apenas planos inactivos sem tenants podem ser eliminados'}
                            onClick={() => setDeleteTarget({ id: tier.id, name: tier.name })}
                          >
                            <Trash2 className={`h-4 w-4 ${canDelete(tier) ? 'text-destructive' : 'text-muted-foreground'}`} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editId ? 'Editar Plano' : 'Novo Plano'}</DialogTitle>
            <DialogDescription>
              {editId ? 'Altere os detalhes do plano de subscrição.' : 'Preencha os dados para criar um novo plano.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Nome</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
            </div>

            <div>
              <Label>Tipo</Label>
              <Select value={form.tier_type} onValueChange={v => setForm(f => ({ ...f, tier_type: v as any }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Gratuito</SelectItem>
                  <SelectItem value="family_premium">Família Premium</SelectItem>
                  <SelectItem value="school_institutional">Escolar</SelectItem>
                  <SelectItem value="partner_program">Parceiro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Preço Mensal</Label>
                <Input type="number" min={0} step={0.01} value={form.price_monthly} onChange={e => setForm(f => ({ ...f, price_monthly: parseFloat(e.target.value) || 0 }))} />
                {errors.price_monthly && <p className="text-xs text-destructive mt-1">{errors.price_monthly}</p>}
              </div>
              <div>
                <Label>Preço Anual</Label>
                <Input type="number" min={0} step={0.01} value={form.price_yearly} onChange={e => setForm(f => ({ ...f, price_yearly: parseFloat(e.target.value) || 0 }))} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Máx. Crianças</Label>
                <Input type="number" min={0} value={form.max_children} onChange={e => setForm(f => ({ ...f, max_children: parseInt(e.target.value) || 0 }))} />
              </div>
              <div>
                <Label>Máx. Turmas</Label>
                <Input type="number" min={0} value={form.max_classrooms} onChange={e => setForm(f => ({ ...f, max_classrooms: parseInt(e.target.value) || 0 }))} />
              </div>
            </div>

            <div>
              <Label>Moeda</Label>
              <Input value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))} maxLength={10} />
            </div>

            <div className="flex items-center gap-3">
              <Switch checked={form.is_active} onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))} />
              <Label>Plano activo</Label>
            </div>

            <div>
              <Label>Funcionalidades (uma por linha)</Label>
              <Textarea rows={4} value={featuresText} onChange={e => setFeaturesText(e.target.value)} placeholder="savings_vaults&#10;dream_vaults&#10;advanced_reports" />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSubmit} disabled={isSaving}>
              {isSaving ? 'A guardar...' : editId ? 'Guardar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
