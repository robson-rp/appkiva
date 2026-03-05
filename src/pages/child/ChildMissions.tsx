import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Kivo } from '@/components/Kivo';
import { mockMissions } from '@/data/mock-data';
import { Target, CheckCircle2, Clock } from 'lucide-react';

export default function ChildMissions() {
  const statusConfig = {
    available: { label: 'Disponível', variant: 'default' as const, icon: Target },
    in_progress: { label: 'Em Progresso', variant: 'secondary' as const, icon: Clock },
    completed: { label: 'Concluída', variant: 'outline' as const, icon: CheckCircle2 },
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="font-display text-xl font-bold">Missões</h1>
        <p className="text-sm text-muted-foreground">Completa missões para aprender e ganhar recompensas!</p>
      </div>

      <div className="space-y-4">
        {mockMissions.map((mission, i) => {
          const cfg = statusConfig[mission.status];
          return (
            <motion.div
              key={mission.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-xl bg-kivara-light-green flex items-center justify-center">
                        <cfg.icon className="h-5 w-5 text-secondary" />
                      </div>
                      <div>
                        <h3 className="font-display font-semibold text-sm">{mission.title}</h3>
                        <Badge variant={cfg.variant} className="text-[10px] mt-0.5">{cfg.label}</Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-display font-bold text-sm">🪙 {mission.reward}</p>
                      <p className="text-[10px] text-muted-foreground">+{mission.kivaPointsReward} pts</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{mission.description}</p>
                  {mission.status === 'available' && (
                    <Button size="sm" className="w-full rounded-xl font-display">Começar Missão</Button>
                  )}
                  {mission.status === 'in_progress' && (
                    <Button size="sm" variant="secondary" className="w-full rounded-xl font-display">Continuar</Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <Kivo page="missions" />
    </div>
  );
}
