import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { MonthlySummary } from '@/hooks/use-monthly-summary';

interface MonthlyEvolutionChartProps {
  data: MonthlySummary[];
}

export function MonthlyEvolutionChart({ data }: MonthlyEvolutionChartProps) {
  if (data.length === 0) return null;

  return (
    <Card className="border border-border/50 overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-primary to-secondary" />
      <CardHeader className="pb-1">
        <CardTitle className="text-sm font-display flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <BarChart3 className="h-3.5 w-3.5 text-primary" />
          </div>
          Evolução Mensal
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} width={32} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))', fontSize: 12, fontFamily: 'var(--font-display)' }}
                formatter={(value: number, name: string) => [`🪙 ${value}`, name === 'income' ? 'Ganho' : 'Gasto']}
                labelFormatter={(label) => `Mês: ${label}`}
              />
              <Bar dataKey="income" name="income" fill="hsl(var(--secondary))" radius={[6, 6, 0, 0]} maxBarSize={28} />
              <Bar dataKey="expenses" name="expenses" fill="hsl(var(--destructive))" radius={[6, 6, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-4 mt-2">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-secondary" />
            <span className="text-[10px] text-muted-foreground font-medium">Ganho</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-destructive" />
            <span className="text-[10px] text-muted-foreground font-medium">Gasto</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
