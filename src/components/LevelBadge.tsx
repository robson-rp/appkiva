import { Level, LEVEL_CONFIG } from '@/types/kivara';
import { Progress } from '@/components/ui/progress';

interface LevelBadgeProps {
  level: Level;
  points: number;
  showProgress?: boolean;
}

export function LevelBadge({ level, points, showProgress = false }: LevelBadgeProps) {
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
        <span className="text-xs font-display font-bold bg-accent/20 text-accent-foreground px-2 py-0.5 rounded-full">
          {config.label}
        </span>
        <span className="text-xs text-muted-foreground">{points} pts</span>
      </div>
      {showProgress && nextLevel && (
        <div className="space-y-0.5">
          <Progress value={progress} className="h-2" />
          <p className="text-[10px] text-muted-foreground">
            {nextLevel[1].minPoints - points} pts para {nextLevel[1].label}
          </p>
        </div>
      )}
    </div>
  );
}
