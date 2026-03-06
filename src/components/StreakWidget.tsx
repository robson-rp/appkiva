import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Flame } from 'lucide-react';
import { useStreakData } from '@/hooks/use-streaks';
import { mockStreakData } from '@/data/streaks-data';

interface StreakWidgetProps {
  onClick?: () => void;
}

const flameVariants = {
  idle: {
    scale: [1, 1.15, 1],
    rotate: [0, -5, 5, 0],
    transition: { duration: 1.8, repeat: Infinity, ease: 'easeInOut' as const },
  },
};

const pulseRing = {
  initial: { scale: 0.8, opacity: 0.6 },
  animate: {
    scale: [0.8, 1.4],
    opacity: [0.5, 0],
    transition: { duration: 1.6, repeat: Infinity, ease: 'easeOut' as const },
  },
};

const dayDotVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: (i: number) => ({
    scale: 1,
    opacity: 1,
    transition: { delay: i * 0.06, type: 'spring' as const, stiffness: 400, damping: 15 },
  }),
};

export function StreakWidget({ onClick }: StreakWidgetProps) {
  const isActive = mockStreakData.currentStreak > 0;
  const isHot = mockStreakData.currentStreak >= 7;

  return (
    <motion.div whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.985 }}>
      <Card
        className="border border-border/50 cursor-pointer hover:shadow-lg transition-shadow duration-300 overflow-hidden relative"
        onClick={onClick}
      >
        {/* Top gradient bar with glow when hot */}
        <div className={`h-1.5 ${isHot
          ? 'bg-gradient-to-r from-destructive via-chart-1 to-accent'
          : 'bg-gradient-to-r from-destructive/60 via-chart-1/60 to-accent/60'
        }`} />

        {/* Background glow effect for hot streaks */}
        {isHot && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-destructive/5 rounded-full blur-2xl" />
            <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-chart-1/5 rounded-full blur-2xl" />
          </div>
        )}

        <CardContent className="p-4 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Flame icon with pulse ring */}
              <div className="relative">
                {isActive && (
                  <motion.div
                    className="absolute inset-0 rounded-2xl bg-destructive/20"
                    variants={pulseRing}
                    initial="initial"
                    animate="animate"
                  />
                )}
                <motion.div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    isHot
                      ? 'bg-gradient-to-br from-destructive/20 to-chart-1/20'
                      : 'bg-destructive/10'
                  }`}
                  variants={isActive ? flameVariants : undefined}
                  animate={isActive ? 'idle' : undefined}
                >
                  <Flame className={`h-6 w-6 ${isHot ? 'text-destructive drop-shadow-[0_0_6px_hsl(var(--destructive)/0.5)]' : 'text-destructive'}`} />
                </motion.div>
              </div>
              <div>
                <p className="text-sm font-display font-bold">Sequência Diária</p>
                <p className="text-xs text-muted-foreground">{mockStreakData.totalActiveDays} dias activos no total</p>
              </div>
            </div>
            <div className="text-right">
              <motion.p
                key={mockStreakData.currentStreak}
                initial={{ scale: 1.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 12 }}
                className={`text-2xl font-display font-bold ${isHot ? 'text-destructive' : 'text-destructive/80'}`}
              >
                {mockStreakData.currentStreak} 🔥
              </motion.p>
              <p className="text-[10px] text-muted-foreground">Recorde: {mockStreakData.longestStreak}</p>
            </div>
          </div>

          {/* Activity dots with staggered spring animation */}
          <div className="flex gap-1.5 mt-3">
            <AnimatePresence>
              {Array.from({ length: 7 }).map((_, i) => {
                const d = new Date();
                d.setDate(d.getDate() - (6 - i));
                const dateStr = d.toISOString().split('T')[0];
                const isActiveDay = mockStreakData.activeDates.includes(dateStr);
                return (
                  <motion.div
                    key={i}
                    custom={i}
                    variants={dayDotVariants}
                    initial="hidden"
                    animate="visible"
                    className={`flex-1 h-2.5 rounded-full relative overflow-hidden ${
                      isActiveDay
                        ? 'bg-gradient-to-r from-destructive to-chart-1 shadow-[0_0_4px_hsl(var(--destructive)/0.3)]'
                        : 'bg-muted/50'
                    }`}
                  >
                    {isActiveDay && (
                      <motion.div
                        className="absolute inset-0 bg-white/20 rounded-full"
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3, ease: 'easeInOut' }}
                      />
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Streak label for hot streaks */}
          {isHot && (
            <motion.p
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-[10px] text-center text-destructive/70 font-semibold mt-2 tracking-wide uppercase"
            >
              🔥 Em chamas! Continua assim!
            </motion.p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
