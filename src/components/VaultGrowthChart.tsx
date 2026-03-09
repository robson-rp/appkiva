import { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useT } from '@/contexts/LanguageContext';

interface Vault {
  id: string;
  name: string;
  icon: string;
  currentAmount: number;
  targetAmount: number;
  interestRate: number;
}

interface VaultGrowthChartProps {
  vaults: Vault[];
}

function generateProjectionData(vault: Vault, months: number, t: (key: string) => string) {
  const data = [];
  let balance = vault.currentAmount;
  for (let i = 0; i <= months; i++) {
    data.push({
      month: i === 0 ? t('vault.chart.now') : t('vault.chart.month').replace('{n}', String(i)),
      saldo: Math.round(balance),
      meta: vault.targetAmount,
    });
    balance += balance * (vault.interestRate / 100);
  }
  return data;
}

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--secondary))',
  'hsl(var(--accent))',
  'hsl(210, 80%, 55%)',
  'hsl(280, 65%, 55%)',
];

export function VaultGrowthChart({ vaults }: VaultGrowthChartProps) {
  const t = useT();
  const [selectedVaultId, setSelectedVaultId] = useState<string | null>(null);

  const activeVault = vaults.find(v => v.id === selectedVaultId) ?? vaults[0];

  const data = useMemo(() => {
    if (!activeVault) return [];
    return generateProjectionData(activeVault, 12, t);
  }, [activeVault, t]);

  if (vaults.length === 0) return null;

  const monthsToTarget = activeVault
    ? (() => {
        let bal = activeVault.currentAmount;
        if (bal >= activeVault.targetAmount) return 0;
        if (activeVault.interestRate <= 0) return null;
        for (let m = 1; m <= 120; m++) {
          bal += bal * (activeVault.interestRate / 100);
          if (bal >= activeVault.targetAmount) return m;
        }
        return null;
      })()
    : null;

  return (
    <Card className="border-border/50">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          <h3 className="font-display font-bold text-sm text-foreground">{t('vault.chart.title')}</h3>
        </div>

        {vaults.length > 1 && (
          <div className="flex flex-wrap gap-1.5">
            {vaults.map((v) => (
              <Button
                key={v.id}
                variant={activeVault?.id === v.id ? 'default' : 'outline'}
                size="sm"
                className="rounded-xl text-xs gap-1 h-7 px-2.5"
                onClick={() => setSelectedVaultId(v.id)}
              >
                {v.icon} {v.name}
              </Button>
            ))}
          </div>
        )}

        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="vaultGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={false}
                interval={2}
              />
              <YAxis
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${v}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontFamily: 'var(--font-display)',
                }}
                formatter={(value: number) => [`${value} 🪙`, t('vault.chart.balance')]}
                labelStyle={{ fontWeight: 'bold', color: 'hsl(var(--foreground))' }}
              />
              {activeVault && (
                <ReferenceLine
                  y={activeVault.targetAmount}
                  stroke="hsl(var(--secondary))"
                  strokeDasharray="5 5"
                  strokeWidth={1.5}
                  label={{
                    value: t('vault.chart.target').replace('{amount}', String(activeVault.targetAmount)),
                    position: 'right',
                    fill: 'hsl(var(--secondary))',
                    fontSize: 10,
                  }}
                />
              )}
              <Area
                type="monotone"
                dataKey="saldo"
                stroke="hsl(var(--primary))"
                strokeWidth={2.5}
                fill="url(#vaultGradient)"
                dot={false}
                activeDot={{ r: 4, fill: 'hsl(var(--primary))', strokeWidth: 2, stroke: 'hsl(var(--background))' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {activeVault && (
          <div className="flex items-center justify-between bg-muted/40 rounded-xl p-3 border border-border/30">
            <div className="text-xs text-muted-foreground">
              <span className="text-xl mr-1.5">{activeVault.icon}</span>
              {activeVault.interestRate}%{t('vault.chart.rate_month')}
            </div>
            <div className="text-right">
              {monthsToTarget !== null && monthsToTarget > 0 ? (
                <p className="text-xs font-display font-bold text-primary">
                  {t('vault.chart.target_in')
                    .replace('{months}', String(monthsToTarget))
                    .replace('{unit}', monthsToTarget === 1 ? t('vault.chart.month_singular') : t('vault.chart.month_plural'))}
                </p>
              ) : monthsToTarget === 0 ? (
                <p className="text-xs font-display font-bold text-secondary">{t('vault.chart.target_reached')}</p>
              ) : (
                <p className="text-xs text-muted-foreground">{t('vault.chart.no_interest')}</p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
