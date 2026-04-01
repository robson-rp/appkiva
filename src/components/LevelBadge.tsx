import { motion } from 'framer-motion';
import { Level, LEVEL_CONFIG } from '@/types/kivara';
import { Progress } from '@/components/ui/progress';
import { useT } from '@/contexts/LanguageContext';

interface LevelBadgeProps {
  level: Level;
  points: number;
  showProgress?: boolean;
  showAvatar?: boolean;
}

export function LevelBadge({ level, points, showProgress = false, showAvatar = false }: LevelBadgeProps) {
  const t = useT();
  const config = LEVEL_CONFIG[level];
  const levels = Object.entries(LEVEL_CONFIG);
  const currentIndex = levels.findIndex(([k]) => k === level);
  const nextLevel = levels[currentIndex + 1];
  const progress = nextLevel
    ? ((points - config.minPoints) / (nextLevel[1].minPoints - config.minPoints)) * 100
    : 100;

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        {showAvatar && (
          <motion.span
            key={level}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="text-2xl"
          >
            {config.avatar}
          </motion.span>
        )}
        <span className="text-xs font-display font-bold bg-accent/20 text-accent-foreground px-2 py-0.5 rounded-full">
          {config.label}
        </span>
        <span className="text-xs text-muted-foreground">{points} pts</span>
      </div>
      {showProgress && nextLevel && (
        <div className="space-y-0.5">
          <Progress value={progress} className="h-2" />
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {t('level.pts_to').replace('{pts}', String(nextLevel[1].minPoints - points)).replace('{label}', nextLevel[1].label)}
            </p>
            <span className="text-xs text-muted-foreground">→ {nextLevel[1].avatar}</span>
          </div>
        </div>
      )}
    </div>
  );
}
