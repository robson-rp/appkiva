import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Sparkles, CheckCircle2 } from 'lucide-react';
import { Mission } from '@/types/kivara';
import { useEffect, useState } from 'react';
import { useT } from '@/contexts/LanguageContext';

interface DailyMissionCardProps {
  mission: Mission;
  type: 'daily' | 'weekly';
}

function useCountdown(endDate: string) {
  const t = useT();
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const update = () => {
      const diff = new Date(endDate).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft(t('streak.expired')); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setTimeLeft(h > 24 ? `${Math.ceil(h / 24)}d` : `${h}h ${m}m`);
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [endDate, t]);

  return timeLeft;
}

const typeEmoji: Record<string, string> = { saving: '🏦', budgeting: '📊', planning: '📋' };

export function DailyMissionCard({ mission, type }: DailyMissionCardProps) {
  const t = useT();
  const endDate = type === 'daily'
    ? new Date(Date.now() + 8 * 3600000).toISOString()
    : new Date(Date.now() + 5 * 86400000).toISOString();

  const countdown = useCountdown(endDate);
  const isCompleted = mission.status === 'completed';

  return (
    <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
      <Card className={`border-border/50 overflow-hidden ${isCompleted ? 'opacity-70' : ''}`}>
        {type === 'daily' && <div className="h-0.5 bg-gradient-to-r from-accent to-accent/50" />}
        {type === 'weekly' && <div className="h-0.5 gradient-kivara" />}
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-xl ${type === 'daily' ? 'bg-accent/10' : 'bg-primary/10'} flex items-center justify-center text-xl shrink-0`}>
              {isCompleted ? <CheckCircle2 className="h-5 w-5 text-secondary" /> : typeEmoji[mission.type] || '🎯'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="font-display font-bold text-sm truncate">{mission.title}</h3>
                <Badge className={`text-xs border-0 rounded-lg shrink-0 ${
                  type === 'daily'
                    ? 'bg-accent/15 text-accent-foreground'
                    : 'bg-primary/15 text-primary'
                }`}>
                  {type === 'daily' ? t('mission.daily') : t('mission.weekly')}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-1">{mission.description}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Sparkles className="h-3 w-3 text-accent" /> {mission.kivaPointsReward} FXP
                </span>
                <span className="text-xs font-display font-bold text-muted-foreground">🪙 {mission.reward}</span>
                {!isCompleted && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
                    <Clock className="h-3 w-3" /> {countdown}
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
