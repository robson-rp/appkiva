import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, Calculator, BarChart3 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

function useTenantsByTier() {
  return useQuery({
    queryKey: ['admin_tenants_by_tier'],
    queryFn: async () => {
      const { data: tenants } = await supabase
        .from('tenants')
        .select('id, name, subscription_tier_id, is_active, tenant_type')
        .eq('is_active', true);
      const { data: tiers } = await supabase
        .from('subscription_tiers')
        .select('*');
      return { tenants: tenants ?? [], tiers: tiers ?? [] };
    },
  });
}

export default function AdminFinance() {
  const { data, isLoading } = useTenantsByTier();
  const tenants = data?.tenants ?? [];
  const tiers = data?.tiers ?? [];

  // Simulator state
  const [simTier, setSimTier] = useState('');
  const [simCount, setSimCount] = useState('10');
  const [simPeriod, setSimPeriod] = useState<'monthly' | 'yearly'>('monthly');

  const revenueByTier = useMemo(() => {
    return tiers.map(tier => {
      const count = tenants.filter(t => t.subscription_tier_id === tier.id).length;
      const monthly = count * Number(tier.price_monthly);
      const yearly = count * Number(tier.price_yearly);
      return { name: tier.name, count, monthly, yearly, tierType: tier.tier_type, currency: tier.currency };
    }).filter(t => t.count > 0 || Number(tiers.find(ti => ti.name === t.name)?.price_monthly) > 0);
  }, [tenants, tiers]);

  const totalMonthly = revenueByTier.reduce((s, r) => s + r.monthly, 0);
  const totalYearly = revenueByTier.reduce((s, r) => s + r.yearly, 0);
  const totalTenants = tenants.length;

  const simTierData = tiers.find(t => t.id === simTier);
  const simRevenue = simTierData
    ? Number(simCount) * (simPeriod === 'monthly' ? Number(simTierData.price_monthly) : Number(simTierData.price_yearly))
    : 0;

  const pieData = revenueByTier.filter(r => r.monthly > 0).map(r => ({ name: r.name, value: r.monthly }));
  const barData = revenueByTier.map(r => ({ name: r.name, Receita: r.monthly }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Módulo Financeiro</h1>
        <p className="text-sm text-muted-foreground">Receitas, simulações e projecções de subscrições</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: 'Receita Mensal', value: `${totalMonthly.toLocaleString()} AOA`, icon: DollarSign, color: 'text-primary' },
          { label: 'Receita Anual', value: `${totalYearly.toLocaleString()} AOA`, icon: TrendingUp, color: 'text-secondary' },
          { label: 'Tenants Activos', value: totalTenants, icon: BarChart3, color: 'text-chart-3' },
          { label: 'Planos', value: tiers.length, icon: Calculator, color: 'text-chart-4' },
        ].map(s => (
          <Card key={s.label} className="border-border/50">
            <CardContent className="flex items-center gap-3 p-4">
              <s.icon className={`h-5 w-5 ${s.color}`} />
              <div>
                <p className="text-xl font-display font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-display">Receita Mensal por Plano</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="Receita" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-display">Distribuição de Receita</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Revenue Table */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-display">Detalhe por Plano</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plano</TableHead>
                <TableHead className="text-center">Tenants</TableHead>
                <TableHead className="text-right">Receita Mensal</TableHead>
                <TableHead className="text-right">Receita Anual</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">A carregar...</TableCell></TableRow>
              ) : revenueByTier.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Sem dados</TableCell></TableRow>
              ) : (
                <>
                  {revenueByTier.map(r => (
                    <TableRow key={r.name}>
                      <TableCell className="font-medium">{r.name}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="font-mono text-xs">{r.count}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono">{r.currency} {r.monthly.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-mono">{r.currency} {r.yearly.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="font-bold border-t-2">
                    <TableCell>Total</TableCell>
                    <TableCell className="text-center">{totalTenants}</TableCell>
                    <TableCell className="text-right font-mono">AOA {totalMonthly.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-mono">AOA {totalYearly.toLocaleString()}</TableCell>
                  </TableRow>
                </>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Simulator */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-display flex items-center gap-2">
            <Calculator className="h-4 w-4 text-primary" /> Simulador de Receita
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-muted-foreground">Simula a receita projectada com novos tenants.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <Label className="text-xs">Plano</Label>
              <Select value={simTier} onValueChange={setSimTier}>
                <SelectTrigger><SelectValue placeholder="Selecionar plano" /></SelectTrigger>
                <SelectContent>
                  {tiers.filter(t => Number(t.price_monthly) > 0).map(t => (
                    <SelectItem key={t.id} value={t.id}>{t.name} ({t.currency} {t.price_monthly}/mês)</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Nº de novos tenants</Label>
              <Input type="number" min={1} value={simCount} onChange={e => setSimCount(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Período</Label>
              <Select value={simPeriod} onValueChange={v => setSimPeriod(v as 'monthly' | 'yearly')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Mensal</SelectItem>
                  <SelectItem value="yearly">Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {simTierData && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
              <p className="text-xs text-muted-foreground">Receita projectada adicional:</p>
              <p className="text-2xl font-display font-bold text-primary mt-1">
                {simTierData.currency} {simRevenue.toLocaleString()}
                <span className="text-sm font-normal text-muted-foreground ml-2">/ {simPeriod === 'monthly' ? 'mês' : 'ano'}</span>
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Total projectado ({simPeriod === 'monthly' ? 'mensal' : 'anual'}): {simTierData.currency} {(simPeriod === 'monthly' ? totalMonthly + simRevenue : totalYearly + simRevenue).toLocaleString()}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
