import { motion } from 'framer-motion';
import { Level, LEVEL_CONFIG } from '@/types/kivara';
import { useAuth } from '@/contexts/AuthContext';
import { useStreakData } from '@/hooks/use-streaks';
import { Zap } from 'lucide-react';
import { useT } from '@/contexts/LanguageContext';

export function XPProgressBar() {
  const t = useT();
  const { user } = useAuth();
  const { data: streakData } = useStreakData();

  // Calculate KivaPoints from real streak data
  const points = streakData?.totalActiveDays ? streakData.totalActiveDays * 15 : 0;

  // Determine level from points
  const levels = Object.entries(LEVEL_CONFIG) as [Level, (typeof LEVEL_CONFIG)[Level]][];
  let level: Level = 'apprentice';
  for (const [key, cfg] of levels) {
    if (points >= cfg.minPoints) level = key;
  }

  const config = LEVEL_CONFIG[level];
  const currentIndex = levels.findIndex(([k]) => k === level);
  const nextLevel = levels[currentIndex + 1];
  const progress = nextLevel
    ? ((points - config.minPoints) / (nextLevel[1].minPoints - config.minPoints)) * 100
    : 100;
  const remaining = nextLevel ? nextLevel[1].minPoints - points : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-4 mt-1 mb-0"
    >
      <div className="flex items-center gap-2 bg-card/60 backdrop-blur-md rounded-2xl px-3 py-2 border border-border/30">
        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-lg shrink-0">
          {config.avatar}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[10px] font-display font-bold text-foreground">{config.label}</span>
            <div className="flex items-center gap-1">
              <Zap className="h-3 w-3 text-accent" />
              <span className="text-[10px] font-display font-bold text-accent-foreground">{points} FXP</span>
            </div>
          </div>
          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
          {nextLevel && (
            <p className="text-[9px] text-muted-foreground mt-0.5">
              {t('xp.to_next').replace('{remaining}', String(remaining)).replace('{label}', nextLevel[1].label).replace('{avatar}', nextLevel[1].avatar)}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
