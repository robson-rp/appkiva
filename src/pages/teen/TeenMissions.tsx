import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Target, CheckCircle, Clock, Swords, Sparkles, Loader2 } from 'lucide-react';
import { WeeklyChallenges } from '@/components/WeeklyChallenges';
import { useLanguage } from '@/contexts/LanguageContext';
import { useChildMissions, useStartMission, useCompleteMission } from '@/hooks/use-missions';

type Tab = 'missions' | 'challenges';

const typeEmoji: Record<string, string> = { saving: '🏦', budgeting: '📊', planning: '📋', custom: '🎯' };

export default function TeenMissions() {
  const [tab, setTab] = useState<Tab>('missions');
  const { t } = useLanguage();
  const { data: missions = [], isLoading } = useChildMissions();
  const startMission = useStartMission();
  const completeMission = useCompleteMission();

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-display font-bold text-foreground">{t('teen.missions.title')}</h1>
        <p className="text-muted-foreground text-sm">{t('teen.missions.subtitle')}</p>
      </motion.div>

      {/* Tab Switcher */}
      <div className="flex gap-2 bg-muted/50 rounded-2xl p-1">
        {[
          { id: 'missions' as Tab, label: t('teen.missions.tab.missions'), icon: Target },
          { id: 'challenges' as Tab, label: t('teen.missions.tab.challenges'), icon: Swords },
        ].map((t_item) => (
          <button
            key={t_item.id}
            onClick={() => setTab(t_item.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-display font-bold transition-all duration-200 ${
              tab === t_item.id ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground/70'
            }`}
          >
            <t_item.icon className="h-3.5 w-3.5" />
            {t_item.label}
          </button>
        ))}
      </div>

      {tab === 'challenges' ? (
        <WeeklyChallenges />
      ) : isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
      ) : missions.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center text-3xl mx-auto mb-4">🎯</div>
            <p className="font-display font-bold text-sm">{t('teen.missions.empty.title')}</p>
            <p className="text-xs text-muted-foreground mt-1">{t('teen.missions.empty.subtitle')}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {missions.map((mission, i) => (
            <motion.div key={mission.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-muted/50 flex items-center justify-center text-lg">
                        {typeEmoji[mission.type] ?? '🎯'}
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-foreground text-sm">{mission.title}</h3>
                        {mission.description && <p className="text-xs text-muted-foreground">{mission.description}</p>}
                      </div>
                    </div>
                    <Badge variant={mission.status === 'completed' ? 'default' : mission.status === 'in_progress' ? 'secondary' : 'outline'} className="text-xs">
                      {mission.status === 'completed' ? t('teen.missions.status.completed') : mission.status === 'in_progress' ? t('teen.missions.status.in_progress') : t('teen.missions.status.available')}
                    </Badge>
                  </div>
                  {mission.target_amount && (
                    <Progress value={mission.status === 'completed' ? 100 : mission.status === 'in_progress' ? 45 : 0} className="h-2 mb-2" />
                  )}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>🪙 {mission.reward} {t('common.coins')}</span>
                    <span>⭐ {mission.kiva_points_reward} {t('common.points')}</span>
                    {mission.status === 'available' && (
                      <Button size="sm" variant="outline" className="ml-auto rounded-xl text-xs h-7 gap-1" disabled={startMission.isPending} onClick={() => startMission.mutate(mission.id)}>
                        {startMission.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />} {t('teen.missions.btn.start')}
                      </Button>
                    )}
                    {mission.status === 'in_progress' && (
                      <Button size="sm" className="ml-auto rounded-xl text-xs h-7 gap-1" disabled={completeMission.isPending} onClick={() => completeMission.mutate(mission.id)}>
                        {completeMission.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3" />} {t('teen.missions.btn.complete')}
                      </Button>
                    )}
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
