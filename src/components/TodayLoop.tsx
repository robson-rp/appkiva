import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Target, Flame, Trophy, PiggyBank, ChevronRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useT } from '@/contexts/LanguageContext';
import { MissionRow } from '@/hooks/use-missions';
import { StreakData, STREAK_MILESTONES } from '@/types/kivara';
import { DreamVault } from '@/hooks/use-dream-vaults';
import { getLeagueTier, LEAGUE_TIERS } from '@/types/league';
import { Level, LEVEL_CONFIG } from '@/types/kivara';

interface TodayLoopProps {
  missions: MissionRow[];
  streakData: StreakData | undefined;
  kivaPoints: number;
  weeklyPoints: number;
  vaults: DreamVault[];
  level: Level;
}

export function TodayLoop({ missions, streakData, kivaPoints, weeklyPoints, vaults, level }: TodayLoopProps) {
  const t = useT();
  const navigate = useNavigate();

  // Today's first available mission
  const todayMission = missions.find(m => m.status === 'available' || m.status === 'in_progress');

  // Streak
  const streak = streakData?.currentStreak ?? 0;

  // League
  const leagueTier = getLeagueTier(weeklyPoints);
  const leagueConfig = LEAGUE_TIERS[leagueTier];

  // Nearest goal
  const activeVault = vaults
    .filter(v => v.targetAmount > 0 && v.currentAmount < v.targetAmount)
    .sort((a, b) => (b.currentAmount / b.targetAmount) - (a.currentAmount / a.targetAmount))[0];

  const vaultPct = activeVault ? Math.min((activeVault.currentAmount / activeVault.targetAmount) * 100, 100) : 0;

  // Next streak milestone
  const nextMilestone = STREAK_MILESTONES.find(m => m.days > streak);

  // Next level
  const levels = Object.entries(LEVEL_CONFIG) as [Level, (typeof LEVEL_CONFIG)[Level]][];
  const currentIdx = levels.findIndex(([k]) => k === level);
  const nextLevel = levels[currentIdx + 1];

  return (
    <Card className="overflow-hidden border-border/50 bg-gradient-to-br from-card to-card/80">
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-accent" />
          <span className="text-xs font-display font-bold text-foreground uppercase tracking-wide">
            {t('today.title')}
          </span>
        </div>

        {/* Mission Row */}
        {todayMission && (
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 p-2.5 rounded-xl bg-primary/5 border border-primary/10 cursor-pointer hover:bg-primary/10 transition-colors"
            onClick={() => navigate('/child/missions')}
          >
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Target className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">{todayMission.title}</p>
              <p className="text-[10px] text-muted-foreground">
                +{todayMission.reward} KVC · +{todayMission.kiva_points_reward} FXP
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
          </motion.div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2">
          {/* Streak */}
          <div
            className="flex flex-col items-center p-2 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted transition-colors"
            onClick={() => navigate('/child/streaks')}
          >
            <Flame className="h-4 w-4 text-orange-500 mb-0.5" />
            <span className="text-sm font-display font-bold text-foreground">{streak}</span>
            <span className="text-[9px] text-muted-foreground">{t('today.streak')}</span>
          </div>

          {/* League */}
          <div className="flex flex-col items-center p-2 rounded-lg bg-muted/50">
            <span className="text-base mb-0.5">{leagueConfig.icon}</span>
            <span className={`text-[10px] font-display font-bold ${leagueConfig.color}`}>{leagueConfig.label}</span>
            <span className="text-[9px] text-muted-foreground">{weeklyPoints} FXP</span>
          </div>

          {/* Next reward */}
          <div className="flex flex-col items-center p-2 rounded-lg bg-muted/50">
            {nextMilestone ? (
              <>
                <span className="text-base mb-0.5">{nextMilestone.icon}</span>
                <span className="text-[10px] font-display font-bold text-foreground">
                  {nextMilestone.days - streak}d
                </span>
                <span className="text-[9px] text-muted-foreground">{t('today.next_reward')}</span>
              </>
            ) : nextLevel ? (
              <>
                <span className="text-base mb-0.5">{nextLevel[1].avatar}</span>
                <span className="text-[10px] font-display font-bold text-foreground">
                  {nextLevel[1].minPoints - kivaPoints} FXP
                </span>
                <span className="text-[9px] text-muted-foreground">{t('today.next_level')}</span>
              </>
            ) : (
              <>
                <Trophy className="h-4 w-4 text-accent mb-0.5" />
                <span className="text-[10px] font-display font-bold text-accent">MAX</span>
                <span className="text-[9px] text-muted-foreground">{t('today.max_level')}</span>
              </>
            )}
          </div>
        </div>

        {/* Goal Progress */}
        {activeVault && (
          <div
            className="flex items-center gap-2.5 p-2 rounded-lg bg-secondary/5 border border-secondary/10 cursor-pointer hover:bg-secondary/10 transition-colors"
            onClick={() => navigate('/child/dreams')}
          >
            <span className="text-lg shrink-0">{activeVault.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-semibold text-foreground truncate">{activeVault.title}</p>
              <Progress value={vaultPct} className="h-1.5 mt-0.5" />
            </div>
            <span className="text-[10px] font-display font-bold text-secondary shrink-0">
              {Math.round(vaultPct)}%
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
