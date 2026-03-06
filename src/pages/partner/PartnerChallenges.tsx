import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Plus, Users, Calendar, Loader2 } from 'lucide-react';
import { useSponsoredChallenges } from '@/hooks/use-partner-data';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import CreateChallengeDialog from '@/components/partner/CreateChallengeDialog';

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  active: { label: 'Activo', variant: 'default' },
  draft: { label: 'Rascunho', variant: 'secondary' },
  completed: { label: 'Concluído', variant: 'outline' },
};

export default function PartnerChallenges() {
  const { data: challenges, isLoading } = useSponsoredChallenges();
  const [dialogOpen, setDialogOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
        {(challenges ?? []).map(ch => {
          const cfg = statusConfig[ch.status] ?? statusConfig.draft;
          return (
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
                        <Badge variant={cfg.variant} className="text-[10px]">
                          {cfg.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{ch.description}</p>
                      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {ch.participants_count} participantes
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(ch.start_date), 'dd MMM yyyy', { locale: pt })} — {format(new Date(ch.end_date), 'dd MMM yyyy', { locale: pt })}
                        </span>
                      </div>
                    </div>
                  </div>
                  {ch.status !== 'draft' && (
                    <div className="text-right shrink-0">
                      <p className="font-display text-2xl font-bold text-foreground">{Number(ch.completion_rate)}%</p>
                      <p className="text-[10px] text-muted-foreground">conclusão</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
        {(!challenges || challenges.length === 0) && (
          <p className="text-sm text-muted-foreground text-center py-8">Nenhum desafio criado</p>
        )}
      </div>
    </div>
  );
}
