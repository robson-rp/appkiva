import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, Calculator, BarChart3, Globe, Vault, ArrowUpFromLine, ArrowDownToLine, Coins, Wallet, PiggyBank, ShieldAlert, Lock, AlertTriangle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';
import { COUNTRY_CURRENCIES } from '@/data/countries-currencies';
import { useMoneySupply } from '@/hooks/use-money-supply';
import { useT } from '@/contexts/LanguageContext';

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
  const t = useT();
  const { data, isLoading } = useTenantsByTier();
  const { data: moneySupply, isLoading: moneyLoading } = useMoneySupply();
  const tenants = data?.tenants ?? [];
  const tiers = data?.tiers ?? [];

  const [simTier, setSimTier] = useState('');
  const [simCount, setSimCount] = useState('10');
  const [simPeriod, setSimPeriod] = useState<'monthly' | 'yearly'>('monthly');

  // Frozen wallets query
  const { data: frozenWallets } = useQuery({
    queryKey: ['admin_frozen_wallets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wallets')
        .select('id, profile_id, is_frozen, frozen_at, frozen_by, freeze_reason')
        .eq('is_frozen', true);
      if (error) throw error;
      // Get profile names for display
      const profileIds = [...new Set((data ?? []).flatMap(w => [w.profile_id, w.frozen_by].filter(Boolean)))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, display_name')
        .in('id', profileIds);
      const profileMap = new Map((profiles ?? []).map(p => [p.id, p.display_name]));
      return (data ?? []).map(w => ({
        ...w,
        owner_name: profileMap.get(w.profile_id) ?? w.profile_id,
        frozen_by_name: w.frozen_by ? (profileMap.get(w.frozen_by) ?? w.frozen_by) : '—',
      }));
    },
  });

  // Risk flags query
  const { data: riskFlags } = useQuery({
    queryKey: ['admin_risk_flags_active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('risk_flags')
        .select('*')
        .is('resolved_at', null)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data ?? [];
    },
  });

  const revenueByCurrency = useMemo(() => {
    const map = new Map<string, { symbol: string; monthly: number; yearly: number; tenantCount: number }>();
    tenants.forEach(tn => {
      const currency = tn.currency || 'AOA';
      const tier = tiers.find(ti => ti.id === tn.subscription_tier_id);
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

  const revenueByTierCurrency = useMemo(() => {
    const grouped = new Map<string, { tierName: string; currency: string; symbol: string; count: number; monthly: number; yearly: number }>();
    tenants.forEach(tn => {
      const currency = tn.currency || 'AOA';
      const tier = tiers.find(ti => ti.id === tn.subscription_tier_id);
      const tierName = tier?.name ?? t('admin.finance.no_plan');
      const key = `${tierName}__${currency}`;
      const existing = grouped.get(key) || { tierName, currency, symbol: getCurrencySymbol(currency), count: 0, monthly: 0, yearly: 0 };
      existing.count += 1;
      existing.monthly += tier ? Number(tier.price_monthly) : 0;
      existing.yearly += tier ? Number(tier.price_yearly) : 0;
      grouped.set(key, existing);
    });
    return Array.from(grouped.values()).sort((a, b) => a.currency.localeCompare(b.currency));
  }, [tenants, tiers, t]);

  const totalTenants = tenants.length;

  const barData = useMemo(() => {
    return Array.from(revenueByCurrency.entries()).map(([currency, d]) => ({
      name: `${d.symbol} (${currency})`,
      [t('admin.finance.revenue')]: d.monthly,
    }));
  }, [revenueByCurrency, t]);

  const pieData = useMemo(() => {
    return Array.from(revenueByCurrency.entries())
      .filter(([, d]) => d.monthly > 0)
      .map(([currency, d]) => ({ name: currency, value: d.monthly }));
  }, [revenueByCurrency]);

  const simTierData = tiers.find(ti => ti.id === simTier);
  const simRevenue = simTierData
    ? Number(simCount) * (simPeriod === 'monthly' ? Number(simTierData.price_monthly) : Number(simTierData.price_yearly))
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">{t('admin.finance.title')}</h1>
        <p className="text-sm text-muted-foreground">{t('admin.finance.subtitle')}</p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">{t('admin.finance.title')}</TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-1.5">
            <ShieldAlert className="h-3.5 w-3.5" /> {t('admin.finance.wallet_security')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-4">

      {/* Money Supply Audit */}
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-display flex items-center gap-2">
            <Vault className="h-4 w-4 text-primary" /> {t('admin.finance.money_audit')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {moneyLoading ? (
            <p className="text-sm text-muted-foreground">{t('admin.finance.loading')}</p>
          ) : moneySupply?.error ? (
            <p className="text-sm text-destructive">{moneySupply.error}</p>
          ) : moneySupply ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <ArrowUpFromLine className="h-3.5 w-3.5 text-emerald-500" /> {t('admin.finance.emitted')}
                </div>
                <p className="text-lg font-display font-bold text-emerald-600">{Number(moneySupply.total_emitted).toLocaleString()} <span className="text-xs font-normal">KVC</span></p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <ArrowDownToLine className="h-3.5 w-3.5 text-red-500" /> {t('admin.finance.burned')}
                </div>
                <p className="text-lg font-display font-bold text-red-600">{Number(moneySupply.total_burned).toLocaleString()} <span className="text-xs font-normal">KVC</span></p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Coins className="h-3.5 w-3.5 text-primary" /> {t('admin.finance.circulation')}
                </div>
                <p className="text-lg font-display font-bold text-primary">{Number(moneySupply.total_in_circulation).toLocaleString()} <span className="text-xs font-normal">KVC</span></p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Wallet className="h-3.5 w-3.5 text-chart-3" /> {t('admin.finance.in_wallets')}
                </div>
                <p className="text-lg font-display font-bold">{Number(moneySupply.total_in_wallets).toLocaleString()} <span className="text-xs font-normal">KVC</span></p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <PiggyBank className="h-3.5 w-3.5 text-chart-4" /> {t('admin.finance.in_vaults')}
                </div>
                <p className="text-lg font-display font-bold">{Number(moneySupply.total_in_vaults).toLocaleString()} <span className="text-xs font-normal">KVC</span></p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <BarChart3 className="h-3.5 w-3.5" /> {t('admin.finance.active_wallets')}
                </div>
                <p className="text-lg font-display font-bold">{moneySupply.wallet_count}</p>
              </div>
            </div>
          ) : null}
          {moneySupply && !moneySupply.error && (
            <p className="text-xs text-muted-foreground mt-3">
              {t('admin.finance.last_audit')} {new Date(moneySupply.audit_timestamp).toLocaleString('pt-PT')}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/50">
          <CardContent className="flex items-center gap-3 p-4">
            <BarChart3 className="h-5 w-5 text-chart-3" />
            <div>
              <p className="text-xl font-display font-bold">{totalTenants}</p>
              <p className="text-xs text-muted-foreground">{t('admin.finance.active_tenants')}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="flex items-center gap-3 p-4">
            <Calculator className="h-5 w-5 text-chart-4" />
            <div>
              <p className="text-xl font-display font-bold">{tiers.length}</p>
              <p className="text-xs text-muted-foreground">{t('admin.finance.plans')}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="flex items-center gap-3 p-4">
            <Globe className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xl font-display font-bold">{revenueByCurrency.size}</p>
              <p className="text-xs text-muted-foreground">{t('admin.finance.active_currencies')}</p>
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
                    <span className="text-xs text-muted-foreground">/ {t('admin.finance.month')}</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <TrendingUp className="h-4 w-4 text-secondary" />
                    <p className="text-sm font-mono text-muted-foreground">{d.symbol} {d.yearly.toLocaleString()} / {t('admin.finance.year')}</p>
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
              <CardTitle className="text-sm font-display">{t('admin.finance.monthly_revenue_currency')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey={t('admin.finance.revenue')} fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-display">{t('admin.finance.revenue_distribution')}</CardTitle>
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
          <CardTitle className="text-sm font-display">{t('admin.finance.detail_plan_currency')}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('admin.finance.col_plan')}</TableHead>
                <TableHead>{t('admin.finance.col_currency')}</TableHead>
                <TableHead className="text-center">{t('admin.finance.col_tenants')}</TableHead>
                <TableHead className="text-right">{t('admin.finance.col_monthly')}</TableHead>
                <TableHead className="text-right">{t('admin.finance.col_yearly')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">{t('admin.finance.loading')}</TableCell></TableRow>
              ) : revenueByTierCurrency.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">{t('admin.finance.no_data')}</TableCell></TableRow>
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
                  {Array.from(revenueByCurrency.entries()).map(([currency, d]) => (
                    <TableRow key={`total-${currency}`} className="font-bold border-t-2 bg-muted/30">
                      <TableCell>{t('admin.finance.subtotal')}</TableCell>
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
            <Calculator className="h-4 w-4 text-primary" /> {t('admin.finance.simulator')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-muted-foreground">{t('admin.finance.sim_desc')}</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <Label className="text-xs">{t('admin.finance.sim_plan')}</Label>
              <Select value={simTier} onValueChange={setSimTier}>
                <SelectTrigger><SelectValue placeholder={t('admin.finance.sim_plan_placeholder')} /></SelectTrigger>
                <SelectContent>
                  {tiers.filter(ti => Number(ti.price_monthly) > 0).map(ti => (
                    <SelectItem key={ti.id} value={ti.id}>{ti.name} ({ti.currency} {ti.price_monthly}/{t('admin.finance.month')})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">{t('admin.finance.sim_count')}</Label>
              <Input type="number" min={1} value={simCount} onChange={e => setSimCount(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">{t('admin.finance.sim_period')}</Label>
              <Select value={simPeriod} onValueChange={v => setSimPeriod(v as 'monthly' | 'yearly')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">{t('admin.finance.sim_monthly')}</SelectItem>
                  <SelectItem value="yearly">{t('admin.finance.sim_yearly')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {simTierData && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
              <p className="text-xs text-muted-foreground">{t('admin.finance.sim_result')}</p>
              <p className="text-2xl font-display font-bold text-primary mt-1">
                {getCurrencySymbol(simTierData.currency)} {simRevenue.toLocaleString()}
                <span className="text-sm font-normal text-muted-foreground ml-2">/ {simPeriod === 'monthly' ? t('admin.finance.month') : t('admin.finance.year')}</span>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6 mt-4">
          {/* Frozen Wallets */}
          <Card className="border-destructive/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-display flex items-center gap-2">
                <Lock className="h-4 w-4 text-destructive" /> {t('admin.finance.frozen_wallets')}
                {frozenWallets && frozenWallets.length > 0 && (
                  <Badge variant="destructive" className="ml-auto text-xs">{frozenWallets.length}</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {!frozenWallets || frozenWallets.length === 0 ? (
                <p className="text-sm text-muted-foreground p-4">{t('admin.finance.no_frozen')}</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('admin.finance.wallet_owner')}</TableHead>
                      <TableHead>{t('admin.finance.freeze_reason')}</TableHead>
                      <TableHead>{t('admin.finance.frozen_at')}</TableHead>
                      <TableHead>{t('admin.finance.frozen_by')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {frozenWallets.map((w) => (
                      <TableRow key={w.id}>
                        <TableCell className="font-medium">{w.owner_name}</TableCell>
                        <TableCell className="text-sm">{w.freeze_reason ?? '—'}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {w.frozen_at ? new Date(w.frozen_at).toLocaleString('pt-PT') : '—'}
                        </TableCell>
                        <TableCell className="text-sm">{w.frozen_by_name}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Risk Flags */}
          <Card className="border-amber-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-display flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" /> {t('admin.finance.risk_flags')}
                {riskFlags && riskFlags.length > 0 && (
                  <Badge className="ml-auto text-xs bg-amber-500">{riskFlags.length}</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {!riskFlags || riskFlags.length === 0 ? (
                <p className="text-sm text-muted-foreground p-4">{t('admin.finance.no_risk_flags')}</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Severidade</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Data</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {riskFlags.map((flag) => (
                      <TableRow key={flag.id}>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">{flag.flag_type}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={flag.severity === 'critical' || flag.severity === 'high' ? 'destructive' : 'secondary'} className="text-xs">
                            {flag.severity}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm max-w-[300px] truncate">{flag.description}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(flag.created_at).toLocaleString('pt-PT')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
