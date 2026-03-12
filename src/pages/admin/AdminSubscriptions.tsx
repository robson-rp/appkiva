import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
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
import { CreditCard, Plus, Pencil, Trash2, Search, Package, CheckCircle, XCircle, Users, Globe } from 'lucide-react';
import {
  useSubscriptionTiers, useCreateSubscriptionTier, useUpdateSubscriptionTier, useDeleteSubscriptionTier,
} from '@/hooks/use-tenants';
import { useRegionalPrices, useUpsertRegionalPrice, useDeleteRegionalPrice, type RegionalPrice } from '@/hooks/use-regional-prices';
import { useT } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { z } from 'zod';

function useTierTypeLabels() {
  const t = useT();
  return {
    free: t('admin.subs.type_free'),
    family_premium: t('admin.subs.type_family'),
    school_institutional: t('admin.subs.type_school'),
    partner_program: t('admin.subs.type_partner'),
  } as Record<string, string>;
}

export default function AdminSubscriptions() {
  const t = useT();
  const tierTypeLabels = useTierTypeLabels();
  const { data: tiers, isLoading } = useSubscriptionTiers(true);
  const createTier = useCreateSubscriptionTier();
  const updateTier = useUpdateSubscriptionTier();
  const deleteTier = useDeleteSubscriptionTier();

  const { data: allRegionalPrices = [] } = useRegionalPrices();
  const upsertRegional = useUpsertRegionalPrice();
  const deleteRegional = useDeleteRegionalPrice();
  const [rpCurrency, setRpCurrency] = useState('');
  const [rpMonthly, setRpMonthly] = useState(0);
  const [rpYearly, setRpYearly] = useState(0);
  const [rpExtra, setRpExtra] = useState(0);

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [deactivateConfirmOpen, setDeactivateConfirmOpen] = useState(false);

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const tierSchema = useMemo(() => z.object({
    name: z.string().trim().min(1, t('admin.subs.name_required')).max(100),
    tier_type: z.enum(['free', 'family_premium', 'school_institutional', 'partner_program']),
    price_monthly: z.number().min(0, t('admin.subs.must_be_gte_zero')),
    price_yearly: z.number().min(0, t('admin.subs.must_be_gte_zero')),
    max_children: z.number().int().min(0),
    max_classrooms: z.number().int().min(0),
    extra_child_price: z.number().min(0, t('admin.subs.must_be_gte_zero')),
    currency: z.string().trim().min(1).max(10),
    is_active: z.boolean(),
    features: z.array(z.string()),
  }), [t]);

  type TierForm = z.infer<typeof tierSchema>;

  const emptyForm: TierForm = {
    name: '', tier_type: 'free', price_monthly: 0, price_yearly: 0,
    max_children: 5, max_classrooms: 0, extra_child_price: 0,
    currency: 'AOA', is_active: true, features: [],
  };

  const [form, setForm] = useState<TierForm>(emptyForm);
  const [featuresText, setFeaturesText] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const tierRegionalPrices = useMemo(
    () => editId ? allRegionalPrices.filter(rp => rp.tier_id === editId) : [],
    [editId, allRegionalPrices]
  );

  const filtered = useMemo(() => {
    if (!tiers) return [];
    return tiers.filter((tier: any) => {
      if (typeFilter !== 'all' && tier.tier_type !== typeFilter) return false;
      if (statusFilter === 'active' && !tier.is_active) return false;
      if (statusFilter === 'inactive' && tier.is_active) return false;
      if (search && !tier.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [tiers, search, typeFilter, statusFilter]);

  const stats = useMemo(() => {
    if (!tiers) return { total: 0, active: 0, inactive: 0 };
    return {
      total: tiers.length,
      active: tiers.filter((tier: any) => tier.is_active).length,
      inactive: tiers.filter((tier: any) => !tier.is_active).length,
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
      name: tier.name, tier_type: tier.tier_type,
      price_monthly: Number(tier.price_monthly), price_yearly: Number(tier.price_yearly),
      max_children: tier.max_children, max_classrooms: tier.max_classrooms,
      extra_child_price: Number(tier.extra_child_price ?? 0),
      currency: tier.currency, is_active: tier.is_active, features,
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
        toast.success(t('admin.subs.plan_updated'));
      } else {
        await createTier.mutateAsync({
          name: validData.name, tier_type: validData.tier_type,
          price_monthly: validData.price_monthly, price_yearly: validData.price_yearly,
          max_children: validData.max_children, max_classrooms: validData.max_classrooms,
          extra_child_price: validData.extra_child_price, currency: validData.currency,
          is_active: validData.is_active, features: validData.features,
        });
        toast.success(t('admin.subs.plan_created'));
      }
      setDialogOpen(false);
    } catch (err: any) {
      toast.error(err.message || t('admin.subs.save_error'));
    }
  }

  function canDelete(tier: any) {
    return !tier.is_active && (tier.tenant_count ?? 0) === 0;
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteTier.mutateAsync(deleteTarget.id);
      toast.success(t('admin.subs.deleted').replace('{name}', deleteTarget.name));
    } catch (err: any) {
      toast.error(err.message || t('admin.subs.delete_error'));
    } finally {
      setDeleteTarget(null);
    }
  }

  const isSaving = createTier.isPending || updateTier.isPending;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">{t('admin.subs.title')}</h1>
        <p className="text-sm text-muted-foreground">{t('admin.subs.subtitle')}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: t('admin.subs.total_plans'), value: stats.total, icon: Package, color: 'text-primary' },
          { label: t('admin.subs.active'), value: stats.active, icon: CheckCircle, color: 'text-secondary' },
          { label: t('admin.subs.inactive'), value: stats.inactive, icon: XCircle, color: 'text-muted-foreground' },
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
            <Label className="text-xs text-muted-foreground mb-1 block">{t('admin.subs.search')}</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder={t('admin.subs.search_placeholder')} value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
          </div>
          <div className="min-w-[160px]">
            <Label className="text-xs text-muted-foreground mb-1 block">{t('admin.subs.type_filter')}</Label>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('admin.subs.all')}</SelectItem>
                <SelectItem value="free">{t('admin.subs.type_free')}</SelectItem>
                <SelectItem value="family_premium">{t('admin.subs.type_family')}</SelectItem>
                <SelectItem value="school_institutional">{t('admin.subs.type_school')}</SelectItem>
                <SelectItem value="partner_program">{t('admin.subs.type_partner')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="min-w-[140px]">
            <Label className="text-xs text-muted-foreground mb-1 block">{t('admin.subs.status_filter')}</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('admin.subs.all')}</SelectItem>
                <SelectItem value="active">{t('admin.subs.status_active')}</SelectItem>
                <SelectItem value="inactive">{t('admin.subs.status_inactive')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={openCreate} className="gap-1.5">
            <Plus className="h-4 w-4" /> {t('admin.subs.new_plan')}
          </Button>
        </CardContent>
      </Card>

      {/* Table */}
      {isLoading ? (
        <p className="text-center text-muted-foreground py-8">{t('admin.subs.loading')}</p>
      ) : (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-border/50">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('admin.subs.col_name')}</TableHead>
                    <TableHead>{t('admin.subs.col_type')}</TableHead>
                    <TableHead className="text-right">{t('admin.subs.col_monthly')}</TableHead>
                    <TableHead className="text-right">{t('admin.subs.col_yearly')}</TableHead>
                    <TableHead className="text-center">{t('admin.subs.col_children')}</TableHead>
                    <TableHead className="text-center">{t('admin.subs.col_classrooms')}</TableHead>
                    <TableHead>{t('admin.subs.col_currency')}</TableHead>
                    <TableHead className="text-center">{t('admin.subs.col_tenants')}</TableHead>
                    <TableHead>{t('admin.subs.col_status')}</TableHead>
                    <TableHead className="text-right">{t('admin.subs.col_actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center text-muted-foreground py-8">{t('admin.subs.no_plans')}</TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((tier: any) => (
                      <TableRow key={tier.id}>
                        <TableCell className="font-medium">{tier.name}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">{tierTypeLabels[tier.tier_type] ?? tier.tier_type}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono">{tier.currency} {tier.price_monthly}</TableCell>
                        <TableCell className="text-right font-mono">{tier.currency} {tier.price_yearly}</TableCell>
                        <TableCell className="text-center">{tier.max_children}</TableCell>
                        <TableCell className="text-center">{tier.max_classrooms}</TableCell>
                        <TableCell>{tier.currency}</TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={tier.is_active && (tier.tenant_count ?? 0) >= 3 ? 'destructive' : (tier.tenant_count ?? 0) > 0 ? 'default' : 'outline'}
                            className="text-xs font-mono"
                          >
                            {tier.tenant_count ?? 0}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={tier.is_active ? 'default' : 'outline'} className="text-xs">
                            {tier.is_active ? t('admin.subs.status_active') : t('admin.subs.status_inactive')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(tier)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost" size="icon" disabled={!canDelete(tier)}
                            title={canDelete(tier) ? t('admin.subs.delete_btn') : t('admin.subs.delete_only_inactive')}
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
            <DialogTitle>{editId ? t('admin.subs.edit_title') : t('admin.subs.create_title')}</DialogTitle>
            <DialogDescription>
              {editId ? t('admin.subs.edit_desc') : t('admin.subs.create_desc')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>{t('admin.subs.field_name')}</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
            </div>

            <div>
              <Label>{t('admin.subs.field_type')}</Label>
              <Select value={form.tier_type} onValueChange={v => setForm(f => ({ ...f, tier_type: v as any }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">{t('admin.subs.type_free')}</SelectItem>
                  <SelectItem value="family_premium">{t('admin.subs.type_family')}</SelectItem>
                  <SelectItem value="school_institutional">{t('admin.subs.type_school')}</SelectItem>
                  <SelectItem value="partner_program">{t('admin.subs.type_partner')}</SelectItem>
                  <SelectItem value="teacher">{t('admin.subs.type_teacher')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>{t('admin.subs.field_monthly')}</Label>
                <Input type="number" min={0} step={0.01} value={form.price_monthly} onChange={e => setForm(f => ({ ...f, price_monthly: parseFloat(e.target.value) || 0 }))} />
                {errors.price_monthly && <p className="text-xs text-destructive mt-1">{errors.price_monthly}</p>}
              </div>
              <div>
                <Label>{t('admin.subs.field_yearly')}</Label>
                <Input type="number" min={0} step={0.01} value={form.price_yearly} onChange={e => setForm(f => ({ ...f, price_yearly: parseFloat(e.target.value) || 0 }))} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>{t('admin.subs.field_max_children')}</Label>
                <Input type="number" min={0} value={form.max_children} onChange={e => setForm(f => ({ ...f, max_children: parseInt(e.target.value) || 0 }))} />
              </div>
              <div>
                <Label>{t('admin.subs.field_max_classrooms')}</Label>
                <Input type="number" min={0} value={form.max_classrooms} onChange={e => setForm(f => ({ ...f, max_classrooms: parseInt(e.target.value) || 0 }))} />
              </div>
              <div>
                <Label>{t('admin.subs.field_extra_child')}</Label>
                <Input type="number" min={0} step={0.01} value={form.extra_child_price} onChange={e => setForm(f => ({ ...f, extra_child_price: parseFloat(e.target.value) || 0 }))} />
                {errors.extra_child_price && <p className="text-xs text-destructive mt-1">{errors.extra_child_price}</p>}
              </div>
            </div>

            <div>
              <Label>{t('admin.subs.field_currency')}</Label>
              <Input value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))} maxLength={10} />
            </div>

            <div className="flex items-center gap-3">
              <Switch
                checked={form.is_active}
                onCheckedChange={v => {
                  if (!v && editId) {
                    const currentTier = tiers?.find((ti: any) => ti.id === editId);
                    if (currentTier && (currentTier.tenant_count ?? 0) > 0 && currentTier.is_active) {
                      setDeactivateConfirmOpen(true);
                      return;
                    }
                  }
                  setForm(f => ({ ...f, is_active: v }));
                }}
              />
              <Label>{t('admin.subs.field_active')}</Label>
            </div>

            <div>
              <Label>{t('admin.subs.field_features')}</Label>
              <Textarea rows={4} value={featuresText} onChange={e => setFeaturesText(e.target.value)} placeholder="savings_vaults&#10;dream_vaults&#10;advanced_reports" />
            </div>
          </div>

          {/* Regional Prices Section */}
          {editId && (
            <>
              <Separator className="my-2" />
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-primary" />
                  <Label className="font-semibold text-sm">{t('admin.subs.regional_prices')}</Label>
                </div>
                <p className="text-xs text-muted-foreground">{t('admin.subs.regional_desc')}</p>

                {tierRegionalPrices.length > 0 && (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">{t('admin.subs.rp_currency')}</TableHead>
                        <TableHead className="text-xs text-right">{t('admin.subs.rp_monthly')}</TableHead>
                        <TableHead className="text-xs text-right">{t('admin.subs.rp_yearly')}</TableHead>
                        <TableHead className="text-xs text-right">{t('admin.subs.rp_extra')}</TableHead>
                        <TableHead className="w-10" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tierRegionalPrices.map((rp) => (
                        <TableRow key={rp.id}>
                          <TableCell className="font-mono text-xs">{rp.currency_code}</TableCell>
                          <TableCell className="text-right font-mono text-xs">{rp.price_monthly}</TableCell>
                          <TableCell className="text-right font-mono text-xs">{rp.price_yearly}</TableCell>
                          <TableCell className="text-right font-mono text-xs">{rp.extra_child_price}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost" size="icon" className="h-7 w-7"
                              onClick={async () => {
                                try {
                                  await deleteRegional.mutateAsync(rp.id);
                                  toast.success(t('admin.subs.rp_removed').replace('{currency}', rp.currency_code));
                                } catch (e: any) { toast.error(e.message); }
                              }}
                            >
                              <Trash2 className="h-3.5 w-3.5 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}

                <div className="grid grid-cols-4 gap-2 items-end">
                  <div>
                    <Label className="text-[10px]">{t('admin.subs.rp_currency')}</Label>
                    <Input placeholder="AOA" value={rpCurrency} onChange={(e) => setRpCurrency(e.target.value.toUpperCase())} maxLength={5} className="font-mono" />
                  </div>
                  <div>
                    <Label className="text-[10px]">{t('admin.subs.rp_monthly')}</Label>
                    <Input type="number" min={0} value={rpMonthly} onChange={(e) => setRpMonthly(parseFloat(e.target.value) || 0)} />
                  </div>
                  <div>
                    <Label className="text-[10px]">{t('admin.subs.rp_yearly')}</Label>
                    <Input type="number" min={0} value={rpYearly} onChange={(e) => setRpYearly(parseFloat(e.target.value) || 0)} />
                  </div>
                  <Button
                    size="sm" variant="outline" disabled={!rpCurrency || upsertRegional.isPending}
                    onClick={async () => {
                      try {
                        await upsertRegional.mutateAsync({
                          tier_id: editId, currency_code: rpCurrency,
                          price_monthly: rpMonthly, price_yearly: rpYearly, extra_child_price: rpExtra,
                        });
                        toast.success(t('admin.subs.rp_saved').replace('{currency}', rpCurrency));
                        setRpCurrency(''); setRpMonthly(0); setRpYearly(0); setRpExtra(0);
                      } catch (e: any) { toast.error(e.message); }
                    }}
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    {t('admin.subs.rp_add')}
                  </Button>
                </div>
              </div>
            </>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>{t('admin.subs.cancel')}</Button>
            <Button onClick={handleSubmit} disabled={isSaving}>
              {isSaving ? t('admin.subs.saving') : editId ? t('admin.subs.save') : t('admin.subs.create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('admin.subs.delete_title').replace('{name}', deleteTarget?.name ?? '')}</AlertDialogTitle>
            <AlertDialogDescription>{t('admin.subs.delete_desc')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('admin.subs.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {t('admin.subs.delete_btn')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Deactivate confirmation */}
      <AlertDialog open={deactivateConfirmOpen} onOpenChange={setDeactivateConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('admin.subs.deactivate_title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('admin.subs.deactivate_desc').replace('{count}', String(editId ? (tiers?.find((ti: any) => ti.id === editId)?.tenant_count ?? 0) : 0))}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('admin.subs.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={() => { setForm(f => ({ ...f, is_active: false })); setDeactivateConfirmOpen(false); }}>
              {t('admin.subs.deactivate_btn')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
