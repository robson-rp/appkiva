import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb } from 'lucide-react';
import { useT } from '@/contexts/LanguageContext';
import { StreakData } from '@/types/kivara';
import { DreamVault } from '@/hooks/use-dream-vaults';
import { MissionRow } from '@/hooks/use-missions';
import { useMemo } from 'react';

interface BehaviorNudgeProps {
  streakData: StreakData | undefined;
  missions: MissionRow[];
  vaults: DreamVault[];
  weeklyPoints: number;
  kivaPoints: number;
}

export function BehaviorNudge({ streakData, missions, vaults, weeklyPoints, kivaPoints }: BehaviorNudgeProps) {
  const t = useT();

  const nudge = useMemo(() => {
    const streak = streakData?.currentStreak ?? 0;
    const lastActive = streakData?.lastActiveDate;
    const today = new Date().toISOString().slice(0, 10);
    const isActiveToday = lastActive === today;

    // Streak at risk — has streak but not active today
    if (streak > 0 && !isActiveToday) {
      return { key: 'streak_risk', text: t('nudge.streak_risk'), emoji: '🔥', priority: 1 };
    }

    // Re-engagement — no streak at all
    if (streak === 0 && !isActiveToday) {
      return { key: 'comeback', text: t('nudge.comeback'), emoji: '👋', priority: 2 };
    }

    // Close to savings milestone
    const nearGoal = vaults.find(v => {
      if (v.targetAmount <= 0) return false;
      const pct = v.currentAmount / v.targetAmount;
      return pct >= 0.75 && pct < 1;
    });
    if (nearGoal) {
      const remaining = Math.ceil(nearGoal.targetAmount - nearGoal.currentAmount);
      return {
        key: 'goal_close',
        text: t('nudge.goal_close').replace('{amount}', String(remaining)).replace('{goal}', nearGoal.title),
        emoji: '🎯',
        priority: 3,
      };
    }

    // Unfinished missions
    const inProgress = missions.filter(m => m.status === 'in_progress');
    if (inProgress.length > 0) {
      return { key: 'mission_pending', text: t('nudge.mission_pending'), emoji: '⚡', priority: 4 };
    }

    // Positive reinforcement
    if (streak >= 3 && isActiveToday) {
      return { key: 'keep_going', text: t('nudge.keep_going').replace('{streak}', String(streak)), emoji: '💪', priority: 5 };
    }

    return null;
  }, [streakData, missions, vaults, weeklyPoints, kivaPoints, t]);

  if (!nudge) return null;

  return (
    <AnimatePresence>
      <motion.div
        key={nudge.key}
        initial={{ opacity: 0, y: 8, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.3 }}
        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-accent/5 border border-accent/10"
      >
        <span className="text-lg shrink-0">{nudge.emoji}</span>
        <p className="text-xs text-foreground/80 flex-1">{nudge.text}</p>
        <Lightbulb className="h-3.5 w-3.5 text-accent/50 shrink-0" />
      </motion.div>
    </AnimatePresence>
  );
}
