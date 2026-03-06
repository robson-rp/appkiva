import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Plus, Users, Calendar } from 'lucide-react';

const challenges = [
  {
    id: '1',
    title: 'Poupar para o Futuro',
    description: 'Desafio de poupança mensal para crianças dos 8-12 anos',
    status: 'active' as const,
    participants: 145,
    completionRate: 78,
    startDate: '01 Fev 2026',
    endDate: '28 Fev 2026',
  },
  {
    id: '2',
    title: 'Mercado Escolar',
    description: 'Simulação de compras inteligentes no ambiente escolar',
    status: 'active' as const,
    participants: 89,
    completionRate: 62,
    startDate: '15 Fev 2026',
    endDate: '15 Mar 2026',
  },
  {
    id: '3',
    title: 'Desafio Familiar',
    description: 'Poupança em família com metas semanais partilhadas',
    status: 'draft' as const,
    participants: 0,
    completionRate: 0,
    startDate: '01 Abr 2026',
    endDate: '30 Abr 2026',
  },
  {
    id: '4',
    title: 'Educação Financeira Básica',
    description: 'Completar 10 lições de literacia financeira',
    status: 'completed' as const,
    participants: 210,
    completionRate: 91,
    startDate: '01 Jan 2026',
    endDate: '31 Jan 2026',
  },
];

const statusConfig = {
  active: { label: 'Activo', variant: 'default' as const },
  draft: { label: 'Rascunho', variant: 'secondary' as const },
  completed: { label: 'Concluído', variant: 'outline' as const },
};

export default function PartnerChallenges() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Desafios Patrocinados 🏆</h1>
          <p className="text-muted-foreground font-body">Crie e gira desafios para as escolas e famílias do programa</p>
        </div>
        <Button className="rounded-xl gap-2">
          <Plus className="h-4 w-4" />
          Novo Desafio
        </Button>
      </div>

      <div className="space-y-4">
        {challenges.map(ch => (
          <Card key={ch.id} className="rounded-2xl border-border/50">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center shrink-0">
                    <Trophy className="h-6 w-6 text-accent-foreground" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-display font-bold text-foreground">{ch.title}</h3>
                      <Badge variant={statusConfig[ch.status].variant} className="text-[10px]">
                        {statusConfig[ch.status].label}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{ch.description}</p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {ch.participants} participantes
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {ch.startDate} — {ch.endDate}
                      </span>
                    </div>
                  </div>
                </div>
                {ch.status !== 'draft' && (
                  <div className="text-right shrink-0">
                    <p className="font-display text-2xl font-bold text-foreground">{ch.completionRate}%</p>
                    <p className="text-[10px] text-muted-foreground">conclusão</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
