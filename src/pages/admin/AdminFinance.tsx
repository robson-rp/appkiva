import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, Calculator, BarChart3, Globe, Vault, ArrowUpFromLine, ArrowDownToLine, Coins, Wallet, PiggyBank } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';
import { COUNTRY_CURRENCIES } from '@/data/countries-currencies';
import { useMoneySupply } from '@/hooks/use-money-supply';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

function getCurrencySymbol(code: string): string {
  return COUNTRY_CURRENCIES.find(c => c.currency === code)?.currencySymbol ?? code;
}

function useTenantsByTier() {
  return useQuery({
    queryKey: ['admin_tenants_by_tier'],
    queryFn: async () => {
      const { data: tenants } = await supabase
        .from('tenants')
        .select('id, name, subscription_tier_id, is_active, tenant_type, currency')
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

  const [simTier, setSimTier] = useState('');
  const [simCount, setSimCount] = useState('10');
  const [simPeriod, setSimPeriod] = useState<'monthly' | 'yearly'>('monthly');

  // Revenue grouped by currency
  const revenueByCurrency = useMemo(() => {
    const map = new Map<string, { symbol: string; monthly: number; yearly: number; tenantCount: number }>();
    tenants.forEach(t => {
      const currency = t.currency || 'AOA';
      const tier = tiers.find(ti => ti.id === t.subscription_tier_id);
      const monthly = tier ? Number(tier.price_monthly) : 0;
      const yearly = tier ? Number(tier.price_yearly) : 0;
      const existing = map.get(currency) || { symbol: getCurrencySymbol(currency), monthly: 0, yearly: 0, tenantCount: 0 };
      existing.monthly += monthly;
      existing.yearly += yearly;
      existing.tenantCount += 1;
      map.set(currency, existing);
    });
    return map;
  }, [tenants, tiers]);

  // Revenue by tier+currency for table
  const revenueByTierCurrency = useMemo(() => {
    const rows: { tierName: string; currency: string; symbol: string; count: number; monthly: number; yearly: number }[] = [];
    const grouped = new Map<string, typeof rows[0]>();

    tenants.forEach(t => {
      const currency = t.currency || 'AOA';
      const tier = tiers.find(ti => ti.id === t.subscription_tier_id);
      const tierName = tier?.name ?? 'Sem plano';
      const key = `${tierName}__${currency}`;
      const existing = grouped.get(key) || {
        tierName, currency, symbol: getCurrencySymbol(currency), count: 0, monthly: 0, yearly: 0,
      };
      existing.count += 1;
      existing.monthly += tier ? Number(tier.price_monthly) : 0;
      existing.yearly += tier ? Number(tier.price_yearly) : 0;
      grouped.set(key, existing);
    });

    return Array.from(grouped.values()).sort((a, b) => a.currency.localeCompare(b.currency));
  }, [tenants, tiers]);

  const totalTenants = tenants.length;

  // Chart data grouped by currency
  const barData = useMemo(() => {
    return Array.from(revenueByCurrency.entries()).map(([currency, d]) => ({
      name: `${d.symbol} (${currency})`,
      Receita: d.monthly,
    }));
  }, [revenueByCurrency]);

  const pieData = useMemo(() => {
    return Array.from(revenueByCurrency.entries())
      .filter(([, d]) => d.monthly > 0)
      .map(([currency, d]) => ({ name: currency, value: d.monthly }));
  }, [revenueByCurrency]);

  // Simulator
  const simTierData = tiers.find(t => t.id === simTier);
  const simRevenue = simTierData
    ? Number(simCount) * (simPeriod === 'monthly' ? Number(simTierData.price_monthly) : Number(simTierData.price_yearly))
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Módulo Financeiro</h1>
        <p className="text-sm text-muted-foreground">Receitas por moeda, simulações e projecções de subscrições</p>
      </div>

      {/* Stats — per currency */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/50">
          <CardContent className="flex items-center gap-3 p-4">
            <BarChart3 className="h-5 w-5 text-chart-3" />
            <div>
              <p className="text-xl font-display font-bold">{totalTenants}</p>
              <p className="text-xs text-muted-foreground">Tenants Activos</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="flex items-center gap-3 p-4">
            <Calculator className="h-5 w-5 text-chart-4" />
            <div>
              <p className="text-xl font-display font-bold">{tiers.length}</p>
              <p className="text-xs text-muted-foreground">Planos</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="flex items-center gap-3 p-4">
            <Globe className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xl font-display font-bold">{revenueByCurrency.size}</p>
              <p className="text-xs text-muted-foreground">Moedas Activas</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue per Currency Cards */}
      {revenueByCurrency.size > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from(revenueByCurrency.entries()).map(([currency, d]) => (
            <motion.div key={currency} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="border-border/50">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs font-mono">{currency}</Badge>
                    <span className="text-xs text-muted-foreground">{d.tenantCount} tenants</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <DollarSign className="h-4 w-4 text-primary" />
                    <p className="text-lg font-display font-bold">{d.symbol} {d.monthly.toLocaleString()}</p>
                    <span className="text-xs text-muted-foreground">/ mês</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <TrendingUp className="h-4 w-4 text-secondary" />
                    <p className="text-sm font-mono text-muted-foreground">{d.symbol} {d.yearly.toLocaleString()} / ano</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-display">Receita Mensal por Moeda</CardTitle>
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
              <CardTitle className="text-sm font-display">Distribuição de Receita por Moeda</CardTitle>
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

      {/* Revenue Table with currency subtotals */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-display">Detalhe por Plano e Moeda</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plano</TableHead>
                <TableHead>Moeda</TableHead>
                <TableHead className="text-center">Tenants</TableHead>
                <TableHead className="text-right">Receita Mensal</TableHead>
                <TableHead className="text-right">Receita Anual</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">A carregar...</TableCell></TableRow>
              ) : revenueByTierCurrency.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Sem dados</TableCell></TableRow>
              ) : (
                <>
                  {revenueByTierCurrency.map((r, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{r.tierName}</TableCell>
                      <TableCell><Badge variant="outline" className="font-mono text-xs">{r.currency}</Badge></TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="font-mono text-xs">{r.count}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono">{r.symbol} {r.monthly.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-mono">{r.symbol} {r.yearly.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                  {/* Subtotals per currency */}
                  {Array.from(revenueByCurrency.entries()).map(([currency, d]) => (
                    <TableRow key={`total-${currency}`} className="font-bold border-t-2 bg-muted/30">
                      <TableCell>Subtotal</TableCell>
                      <TableCell><Badge className="font-mono text-xs">{currency}</Badge></TableCell>
                      <TableCell className="text-center">{d.tenantCount}</TableCell>
                      <TableCell className="text-right font-mono">{d.symbol} {d.monthly.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-mono">{d.symbol} {d.yearly.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
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
                {getCurrencySymbol(simTierData.currency)} {simRevenue.toLocaleString()}
                <span className="text-sm font-normal text-muted-foreground ml-2">/ {simPeriod === 'monthly' ? 'mês' : 'ano'}</span>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
