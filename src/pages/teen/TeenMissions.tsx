import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { mockMissions } from '@/data/mock-data';
import { Target, CheckCircle, Clock, Swords } from 'lucide-react';
import { WeeklyChallenges } from '@/components/WeeklyChallenges';

type Tab = 'missions' | 'challenges';

export default function TeenMissions() {
  const [tab, setTab] = useState<Tab>('missions');

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-display font-bold text-foreground">Missões</h1>
        <p className="text-muted-foreground text-sm">Desafios financeiros para subires de nível</p>
      </motion.div>

      {/* Tab Switcher */}
      <div className="flex gap-2 bg-muted/50 rounded-2xl p-1">
        {[
          { id: 'missions' as Tab, label: 'Missões', icon: Target },
          { id: 'challenges' as Tab, label: 'Desafios Semanais', icon: Swords },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-display font-bold transition-all duration-200 ${
              tab === t.id ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground/70'
            }`}
          >
            <t.icon className="h-3.5 w-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'challenges' ? (
        <WeeklyChallenges />
      ) : (
        <div className="space-y-3">
          {mockMissions.map((mission, i) => (
            <motion.div key={mission.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {mission.status === 'completed' ? (
                        <CheckCircle className="h-5 w-5 text-chart-3" />
                      ) : mission.status === 'in_progress' ? (
                        <Target className="h-5 w-5 text-primary" />
                      ) : (
                        <Clock className="h-5 w-5 text-muted-foreground" />
                      )}
                      <h3 className="font-display font-bold text-foreground">{mission.title}</h3>
                    </div>
                    <Badge variant={mission.status === 'completed' ? 'default' : mission.status === 'in_progress' ? 'secondary' : 'outline'} className="text-[10px]">
                      {mission.status === 'completed' ? 'Completa' : mission.status === 'in_progress' ? 'Em curso' : 'Disponível'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{mission.description}</p>
                  {mission.targetAmount && (
                    <Progress value={mission.status === 'completed' ? 100 : mission.status === 'in_progress' ? 45 : 0} className="h-2 mb-2" />
                  )}
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    <span>🪙 {mission.reward} moedas</span>
                    <span>⭐ {mission.kivaPointsReward} pontos</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
