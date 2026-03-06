import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, School, TrendingUp, Trophy, ArrowUpRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const kpis = [
  { label: 'Famílias Patrocinadas', value: 48, icon: Users, change: '+12%', color: 'text-primary' },
  { label: 'Escolas Associadas', value: 6, icon: School, change: '+2', color: 'text-chart-3' },
  { label: 'Crianças Impactadas', value: 312, icon: Users, change: '+8%', color: 'text-secondary' },
  { label: 'Desafios Activos', value: 5, icon: Trophy, change: '3 novos', color: 'text-accent-foreground' },
];

const recentActivity = [
  { text: 'Escola Primária Sol concluiu o desafio "Poupar para o Futuro"', time: '2h atrás' },
  { text: '15 novas famílias aderiram ao programa', time: '1 dia atrás' },
  { text: 'Relatório mensal de Fevereiro gerado', time: '3 dias atrás' },
  { text: 'Desafio "Mercado Escolar" lançado em 3 escolas', time: '5 dias atrás' },
];

export default function PartnerDashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">
          Olá, {user?.name ?? 'Parceiro'} 🏢
        </h1>
        <p className="text-muted-foreground font-body">Painel do programa de parceria institucional</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="rounded-2xl border-border/50">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl bg-muted flex items-center justify-center`}>
                  <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                </div>
                <Badge variant="secondary" className="text-[10px] font-semibold gap-1">
                  <ArrowUpRight className="h-3 w-3" />
                  {kpi.change}
                </Badge>
              </div>
              <p className="font-display text-2xl font-bold text-foreground">{kpi.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{kpi.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="rounded-2xl border-border/50">
          <CardHeader>
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Investimento Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="font-display text-4xl font-bold text-foreground">€12.450</p>
              <p className="text-sm text-muted-foreground mt-2">Investimento acumulado no programa</p>
              <div className="flex justify-center gap-6 mt-6 text-sm">
                <div>
                  <p className="font-bold text-foreground">€2.100</p>
                  <p className="text-muted-foreground text-xs">Este mês</p>
                </div>
                <div>
                  <p className="font-bold text-foreground">92%</p>
                  <p className="text-muted-foreground text-xs">Taxa de engajamento</p>
                </div>
                <div>
                  <p className="font-bold text-foreground">4.8/5</p>
                  <p className="text-muted-foreground text-xs">Satisfação</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/50">
          <CardHeader>
            <CardTitle className="font-display text-lg">Actividade Recente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                  <div>
                    <p className="text-sm text-foreground">{item.text}</p>
                    <p className="text-xs text-muted-foreground">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
