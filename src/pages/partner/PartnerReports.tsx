import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, BookOpen, Trophy, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const monthlyData = [
  { month: 'Set', families: 20, children: 110 },
  { month: 'Out', families: 28, children: 165 },
  { month: 'Nov', families: 34, children: 210 },
  { month: 'Dez', families: 38, children: 245 },
  { month: 'Jan', families: 42, children: 280 },
  { month: 'Fev', families: 48, children: 312 },
];

const impactMetrics = [
  { label: 'Lições Completadas', value: '4.230', icon: BookOpen, color: 'text-primary' },
  { label: 'Desafios Concluídos', value: '18', icon: Trophy, color: 'text-chart-3' },
  { label: 'Poupança Média/Criança', value: '€32', icon: TrendingUp, color: 'text-secondary' },
  { label: 'Taxa de Retenção', value: '94%', icon: BarChart3, color: 'text-accent-foreground' },
];

export default function PartnerReports() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Relatórios de Impacto 📊</h1>
          <p className="text-muted-foreground font-body">Métricas e evolução do programa de parceria</p>
        </div>
        <Button variant="outline" className="rounded-xl gap-2">
          <Download className="h-4 w-4" />
          Exportar PDF
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {impactMetrics.map(m => (
          <Card key={m.label} className="rounded-2xl border-border/50">
            <CardContent className="p-5">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center mb-3">
                <m.icon className={`h-5 w-5 ${m.color}`} />
              </div>
              <p className="font-display text-2xl font-bold text-foreground">{m.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{m.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="rounded-2xl border-border/50">
        <CardHeader>
          <CardTitle className="font-display text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Evolução Mensal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="families" name="Famílias" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                <Bar dataKey="children" name="Crianças" fill="hsl(var(--secondary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-border/50">
        <CardHeader>
          <CardTitle className="font-display text-lg">Resumo de Literacia Financeira</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 rounded-xl bg-muted/50">
              <p className="font-display text-3xl font-bold text-foreground">87%</p>
              <p className="text-sm text-muted-foreground mt-1">Compreendem conceito de poupança</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-muted/50">
              <p className="font-display text-3xl font-bold text-foreground">72%</p>
              <p className="text-sm text-muted-foreground mt-1">Definem metas financeiras</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-muted/50">
              <p className="font-display text-3xl font-bold text-foreground">65%</p>
              <p className="text-sm text-muted-foreground mt-1">Diferenciam necessidade vs desejo</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
