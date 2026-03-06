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
import { motion } from 'framer-motion';

export default function AdminTenants() {
  const { data: tenants, isLoading } = useTenants();
  const { data: tiers } = useSubscriptionTiers();
  const createTenant = useCreateTenant();
  const updateTenant = useUpdateTenant();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [tenantType, setTenantType] = useState('family');
  const [currency, setCurrency] = useState('USD');
  const [tierId, setTierId] = useState('');

  const handleCreate = async () => {
    if (!name.trim()) return;
    try {
      await createTenant.mutateAsync({
        name: name.trim(),
        tenant_type: tenantType,
        currency,
        subscription_tier_id: tierId || undefined,
      });
      toast({ title: 'Tenant criado com sucesso' });
      setOpen(false);
      setName('');
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' });
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      await updateTenant.mutateAsync({ id, is_active: !isActive });
      toast({ title: isActive ? 'Tenant desactivado' : 'Tenant activado' });
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' });
    }
  };

  const typeLabels: Record<string, string> = {
    family: 'Família',
    school: 'Escola',
    institutional_partner: 'Parceiro',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Gestão de Tenants</h1>
          <p className="text-sm text-muted-foreground">Gerir organizações na plataforma</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Novo Tenant</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Tenant</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <Input placeholder="Nome da organização" value={name} onChange={(e) => setName(e.target.value)} />
              <Select value={tenantType} onValueChange={setTenantType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="family">Família</SelectItem>
                  <SelectItem value="school">Escola</SelectItem>
                  <SelectItem value="institutional_partner">Parceiro Institucional</SelectItem>
                </SelectContent>
              </Select>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="AOA">AOA (Kwanza)</SelectItem>
                  <SelectItem value="NGN">NGN (Naira)</SelectItem>
                  <SelectItem value="KES">KES (Shilling)</SelectItem>
                </SelectContent>
              </Select>
              {tiers && (
                <Select value={tierId} onValueChange={setTierId}>
                  <SelectTrigger><SelectValue placeholder="Subscrição" /></SelectTrigger>
                  <SelectContent>
                    {tiers.map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <Button className="w-full" onClick={handleCreate} disabled={createTenant.isPending}>
                {createTenant.isPending ? 'A criar...' : 'Criar Tenant'}
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
              <p className="text-sm text-muted-foreground py-8 text-center">A carregar...</p>
            ) : !tenants?.length ? (
              <p className="text-sm text-muted-foreground py-8 text-center">Nenhum tenant criado ainda.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Moeda</TableHead>
                    <TableHead>Subscrição</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acções</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tenants.map((t: any) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-medium">{t.name}</TableCell>
                      <TableCell>{typeLabels[t.tenant_type] ?? t.tenant_type}</TableCell>
                      <TableCell>{t.currency}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{t.subscription_tiers?.name ?? 'Sem plano'}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={t.is_active ? 'default' : 'outline'}>
                          {t.is_active ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="ghost" onClick={() => toggleActive(t.id, t.is_active)}>
                          {t.is_active ? 'Desactivar' : 'Activar'}
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
