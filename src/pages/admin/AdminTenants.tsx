import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Building2 } from 'lucide-react';
import { useTenants, useSubscriptionTiers, useCreateTenant, useUpdateTenant } from '@/hooks/use-tenants';
import { useToast } from '@/hooks/use-toast';
import { useT } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { COUNTRY_CURRENCIES, getCurrencyByCountry } from '@/data/countries-currencies';

export default function AdminTenants() {
  const t = useT();
  const { data: tenants, isLoading } = useTenants();
  const { data: tiers } = useSubscriptionTiers();
  const createTenant = useCreateTenant();
  const updateTenant = useUpdateTenant();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [tenantType, setTenantType] = useState('family');
  const [country, setCountry] = useState('AO');
  const [currency, setCurrency] = useState('AOA');
  const [tierId, setTierId] = useState('');

  const handleCountryChange = (code: string) => {
    setCountry(code);
    setCurrency(getCurrencyByCountry(code));
  };

  const handleCreate = async () => {
    if (!name.trim()) return;
    try {
      await createTenant.mutateAsync({
        name: name.trim(),
        tenant_type: tenantType,
        currency,
        subscription_tier_id: tierId || undefined,
      });
      toast({ title: t('admin.tenants.created') });
      setOpen(false);
      setName('');
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' });
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      await updateTenant.mutateAsync({ id, is_active: !isActive });
      toast({ title: isActive ? t('admin.tenants.deactivated') : t('admin.tenants.activated') });
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' });
    }
  };

  const typeLabels: Record<string, string> = {
    family: t('admin.tenants.type_family'),
    school: t('admin.tenants.type_school'),
    institutional_partner: t('admin.tenants.type_partner'),
  };

  const uniqueCurrencies = Array.from(
    new Map(COUNTRY_CURRENCIES.map(c => [c.currency, c])).values()
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">{t('admin.tenants.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('admin.tenants.subtitle')}</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />{t('admin.tenants.new')}</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('admin.tenants.create_title')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <Input placeholder={t('admin.tenants.org_name')} value={name} onChange={(e) => setName(e.target.value)} />
              <Select value={tenantType} onValueChange={setTenantType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="family">{t('admin.tenants.type_family')}</SelectItem>
                  <SelectItem value="school">{t('admin.tenants.type_school')}</SelectItem>
                  <SelectItem value="institutional_partner">{t('admin.tenants.type_partner')}</SelectItem>
                </SelectContent>
              </Select>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">{t('admin.tenants.country')}</label>
                <Select value={country} onValueChange={handleCountryChange}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {COUNTRY_CURRENCIES.map(c => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.name} ({c.currencySymbol} {c.currency})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">{t('admin.tenants.currency')}</label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {uniqueCurrencies.map(c => (
                      <SelectItem key={c.currency} value={c.currency}>
                        {c.currencySymbol} — {c.currency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {tiers && (
                <Select value={tierId} onValueChange={setTierId}>
                  <SelectTrigger><SelectValue placeholder={t('admin.tenants.subscription')} /></SelectTrigger>
                  <SelectContent>
                    {tiers.map((tier) => (
                      <SelectItem key={tier.id} value={tier.id}>{tier.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <Button className="w-full" onClick={handleCreate} disabled={createTenant.isPending}>
                {createTenant.isPending ? t('admin.tenants.creating') : t('admin.tenants.create_btn')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base font-display flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Tenants ({tenants?.length ?? 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-muted-foreground py-8 text-center">{t('admin.tenants.loading')}</p>
            ) : !tenants?.length ? (
              <p className="text-sm text-muted-foreground py-8 text-center">{t('admin.tenants.no_tenants')}</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('admin.tenants.col_name')}</TableHead>
                    <TableHead>{t('admin.tenants.col_type')}</TableHead>
                    <TableHead>{t('admin.tenants.col_currency')}</TableHead>
                    <TableHead>{t('admin.tenants.col_subscription')}</TableHead>
                    <TableHead>{t('admin.tenants.col_status')}</TableHead>
                    <TableHead>{t('admin.tenants.col_actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tenants.map((tenant: any) => (
                    <TableRow key={tenant.id}>
                      <TableCell className="font-medium">{tenant.name}</TableCell>
                      <TableCell>{typeLabels[tenant.tenant_type] ?? tenant.tenant_type}</TableCell>
                      <TableCell>{tenant.currency}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{tenant.subscription_tiers?.name ?? t('admin.tenants.no_plan')}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={tenant.is_active ? 'default' : 'outline'}>
                          {tenant.is_active ? t('admin.tenants.active') : t('admin.tenants.inactive')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="ghost" onClick={() => toggleActive(tenant.id, tenant.is_active)}>
                          {tenant.is_active ? t('admin.tenants.deactivate') : t('admin.tenants.activate')}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
