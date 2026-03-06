import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, School, TrendingUp, Trophy, ArrowUpRight, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePartnerPrograms, useSponsoredChallenges } from '@/hooks/use-partner-data';

export default function PartnerDashboard() {
  const { user } = useAuth();
  const { data: programs, isLoading: loadingPrograms } = usePartnerPrograms();
  const { data: challenges, isLoading: loadingChallenges } = useSponsoredChallenges();

  const isLoading = loadingPrograms || loadingChallenges;

  const totalFamilies = programs?.filter(p => p.program_type === 'family' && p.status === 'active').length ?? 0;
  const totalSchools = programs?.filter(p => p.program_type === 'school' && p.status === 'active').length ?? 0;
  const totalChildren = programs?.reduce((sum, p) => sum + p.children_count, 0) ?? 0;
  const activeChallenges = challenges?.filter(c => c.status === 'active').length ?? 0;
  const totalInvestment = programs?.reduce((sum, p) => sum + Number(p.investment_amount), 0) ?? 0;
  const avgCompletion = challenges?.length
    ? Math.round(challenges.filter(c => c.status !== 'draft').reduce((sum, c) => sum + Number(c.completion_rate), 0) / challenges.filter(c => c.status !== 'draft').length)
    : 0;

  const kpis = [
    { label: 'Famílias Patrocinadas', value: totalFamilies, icon: Users, color: 'text-primary' },
    { label: 'Escolas Associadas', value: totalSchools, icon: School, color: 'text-chart-3' },
    { label: 'Crianças Impactadas', value: totalChildren, icon: Users, color: 'text-secondary' },
    { label: 'Desafios Activos', value: activeChallenges, icon: Trophy, color: 'text-accent-foreground' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                  <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                </div>
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
              <p className="font-display text-4xl font-bold text-foreground">€{totalInvestment.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground mt-2">Investimento acumulado no programa</p>
              <div className="flex justify-center gap-6 mt-6 text-sm">
                <div>
                  <p className="font-bold text-foreground">{programs?.length ?? 0}</p>
                  <p className="text-muted-foreground text-xs">Programas</p>
                </div>
                <div>
                  <p className="font-bold text-foreground">{avgCompletion}%</p>
                  <p className="text-muted-foreground text-xs">Taxa de conclusão</p>
                </div>
                <div>
                  <p className="font-bold text-foreground">{challenges?.length ?? 0}</p>
                  <p className="text-muted-foreground text-xs">Total desafios</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/50">
          <CardHeader>
            <CardTitle className="font-display text-lg">Programas Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {programs?.slice(0, 4).map((prog) => (
                <div key={prog.id} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                  <div>
                    <p className="text-sm text-foreground">{prog.program_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {prog.children_count} crianças • {prog.program_type === 'school' ? 'Escola' : 'Família'}
                    </p>
                  </div>
                </div>
              ))}
              {(!programs || programs.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">Nenhum programa registado</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
