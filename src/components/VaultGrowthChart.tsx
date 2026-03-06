import { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

const MONTHS_LABEL = ['Agora', 'Mês 1', 'Mês 2', 'Mês 3', 'Mês 4', 'Mês 5', 'Mês 6', 'Mês 7', 'Mês 8', 'Mês 9', 'Mês 10', 'Mês 11', 'Mês 12'];

function generateProjectionData(vault: Vault, months: number) {
  const data = [];
  let balance = vault.currentAmount;
  for (let i = 0; i <= months; i++) {
    data.push({
      month: MONTHS_LABEL[i] ?? `Mês ${i}`,
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
  const [selectedVaultId, setSelectedVaultId] = useState<string | null>(null);

  const activeVault = vaults.find(v => v.id === selectedVaultId) ?? vaults[0];

  const data = useMemo(() => {
    if (!activeVault) return [];
    return generateProjectionData(activeVault, 12);
  }, [activeVault]);

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
          <h3 className="font-display font-bold text-sm text-foreground">Evolução do Saldo</h3>
        </div>

        {/* Vault selector pills */}
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

        {/* Chart */}
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
                formatter={(value: number) => [`${value} 🪙`, 'Saldo']}
                labelStyle={{ fontWeight: 'bold', color: 'hsl(var(--foreground))' }}
              />
              {activeVault && (
                <ReferenceLine
                  y={activeVault.targetAmount}
                  stroke="hsl(var(--secondary))"
                  strokeDasharray="5 5"
                  strokeWidth={1.5}
                  label={{
                    value: `Meta: ${activeVault.targetAmount}`,
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

        {/* Summary */}
        {activeVault && (
          <div className="flex items-center justify-between bg-muted/40 rounded-xl p-3 border border-border/30">
            <div className="text-xs text-muted-foreground">
              <span className="text-xl mr-1.5">{activeVault.icon}</span>
              {activeVault.interestRate}%/mês
            </div>
            <div className="text-right">
              {monthsToTarget !== null && monthsToTarget > 0 ? (
                <p className="text-xs font-display font-bold text-primary">
                  Meta em ~{monthsToTarget} {monthsToTarget === 1 ? 'mês' : 'meses'}
                </p>
              ) : monthsToTarget === 0 ? (
                <p className="text-xs font-display font-bold text-secondary">Meta atingida! 🎉</p>
              ) : (
                <p className="text-xs text-muted-foreground">Sem juros configurados</p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
