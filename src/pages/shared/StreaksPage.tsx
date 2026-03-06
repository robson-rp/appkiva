import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useStreakData, useClaimStreakReward } from '@/hooks/use-streaks';
import { mockStreakData } from '@/data/streaks-data';
import { StreakReward } from '@/types/kivara';
import { Flame, Trophy, CalendarDays, Zap, Gift, CheckCircle, Lock, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { playSparkleSound, hapticLight } from '@/lib/celebration-effects';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

function getMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return { firstDay: firstDay === 0 ? 7 : firstDay, daysInMonth };
}

const WEEKDAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

export default function StreaksPage() {
  const { data: streakDataFromDb } = useStreakData();
  const streakData = streakDataFromDb ?? mockStreakData;
  const claimReward = useClaimStreakReward();
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());

  const activeDateSet = useMemo(() => new Set(streakData.activeDates), [streakData.activeDates]);
  const { firstDay, daysInMonth } = getMonthDays(viewYear, viewMonth);

  const nextMilestone = streakData.streakRewards.find(r => !r.claimed && r.days > streakData.currentStreak);
  const nextProgress = nextMilestone
    ? Math.round((streakData.currentStreak / nextMilestone.days) * 100)
    : 100;

  const handleClaim = (reward: StreakReward) => {
    if (reward.claimed || streakData.currentStreak < reward.days) return;
    playSparkleSound();
    hapticLight();
    claimReward.mutate(
      { milestoneDays: reward.days, kivaPoints: reward.kivaPoints },
      {
        onSuccess: () => {
          toast({
            title: `${reward.icon} Recompensa reclamada!`,
            description: `+${reward.kivaPoints} KivaPoints pelo marco de ${reward.label}!`,
          });
        },
        onError: () => {
          toast({
            title: 'Erro',
            description: 'Não foi possível reclamar a recompensa. Tenta novamente.',
            variant: 'destructive',
          });
        },
      }
    );
  };

  const monthLabel = new Date(viewYear, viewMonth).toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' });

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-5 max-w-2xl mx-auto pb-4">
      {/* Hero */}
      <motion.div variants={item}>
        <Card className="border-0 overflow-hidden relative shadow-kivara">
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--chart-1))] via-[hsl(var(--primary))] to-[hsl(var(--chart-4))]" />
          <div className="absolute top-[-30%] right-[-15%] w-[55%] h-[80%] rounded-full bg-white/10 blur-3xl" />
          <CardContent className="relative z-10 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-foreground/10 backdrop-blur-sm flex items-center justify-center">
                <Flame className="h-6 w-6 text-foreground" />
              </div>
              <div>
                <h1 className="font-display text-xl font-bold text-foreground">Sequências Diárias</h1>
                <p className="text-sm text-foreground/60 font-body">Consistência traz grandes recompensas</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-foreground/5 backdrop-blur-sm rounded-2xl p-3 text-center">
                <Flame className="h-4 w-4 text-destructive mx-auto mb-1" />
                <p className="text-[10px] text-foreground/50 uppercase tracking-wider font-medium">Actual</p>
                <motion.p
                  key={streakData.currentStreak}
                  initial={{ scale: 1.3 }}
                  animate={{ scale: 1 }}
                  className="font-display font-bold text-foreground text-2xl"
                >
                  {streakData.currentStreak} 🔥
                </motion.p>
              </div>
              <div className="bg-foreground/5 backdrop-blur-sm rounded-2xl p-3 text-center">
                <Trophy className="h-4 w-4 text-accent mx-auto mb-1" />
                <p className="text-[10px] text-foreground/50 uppercase tracking-wider font-medium">Recorde</p>
                <p className="font-display font-bold text-foreground text-2xl">{streakData.longestStreak}</p>
              </div>
              <div className="bg-foreground/5 backdrop-blur-sm rounded-2xl p-3 text-center">
                <CalendarDays className="h-4 w-4 text-primary mx-auto mb-1" />
                <p className="text-[10px] text-foreground/50 uppercase tracking-wider font-medium">Dias activos</p>
                <p className="font-display font-bold text-foreground text-2xl">{streakData.totalActiveDays}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Next Milestone */}
      {nextMilestone && (
        <motion.div variants={item}>
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  <span className="text-xs font-display font-bold">Próximo marco</span>
                </div>
                <Badge variant="outline" className="text-xs gap-1">
                  {nextMilestone.icon} {nextMilestone.label}
                </Badge>
              </div>
              <Progress value={nextProgress} className="h-2.5 mb-1.5" />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>{streakData.currentStreak} dias</span>
                <span className="font-bold text-primary">+{nextMilestone.kivaPoints} KivaPoints</span>
                <span>{nextMilestone.days} dias</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Calendar Heatmap */}
      <motion.div variants={item}>
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-display flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-primary" /> Calendário
              </CardTitle>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
                    else setViewMonth(m => m - 1);
                  }}
                  className="p-1 rounded-lg hover:bg-muted transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-xs font-display font-bold capitalize min-w-[120px] text-center">{monthLabel}</span>
                <button
                  onClick={() => {
                    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
                    else setViewMonth(m => m + 1);
                  }}
                  className="p-1 rounded-lg hover:bg-muted transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {WEEKDAYS.map(d => (
                <div key={d} className="text-[9px] text-muted-foreground text-center font-semibold">{d}</div>
              ))}
            </div>
            {/* Days */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDay - 1 }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const isActive = activeDateSet.has(dateStr);
                const isToday = dateStr === today.toISOString().split('T')[0];

                return (
                  <motion.div
                    key={day}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: i * 0.01 }}
                    className={`aspect-square rounded-lg flex items-center justify-center text-[11px] font-semibold transition-all ${
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'bg-muted/40 text-muted-foreground'
                    } ${isToday ? 'ring-2 ring-accent ring-offset-1 ring-offset-background' : ''}`}
                  >
                    {day}
                  </motion.div>
                );
              })}
            </div>
            {/* Legend */}
            <div className="flex items-center gap-3 mt-3 justify-center">
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <div className="w-3 h-3 rounded bg-primary" /> Activo
              </div>
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <div className="w-3 h-3 rounded bg-muted/40" /> Inactivo
              </div>
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <div className="w-3 h-3 rounded bg-muted/40 ring-2 ring-accent" /> Hoje
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Streak Rewards */}
      <motion.div variants={item}>
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-display flex items-center gap-2">
              <Gift className="h-4 w-4 text-accent" /> Recompensas de Sequência
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {streakData.streakRewards.map((reward, i) => {
              const isReachable = streakData.currentStreak >= reward.days;
              const canClaim = isReachable && !reward.claimed;
              return (
                <motion.div
                  key={reward.days}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    reward.claimed
                      ? 'bg-primary/5 border-primary/20'
                      : canClaim
                      ? 'bg-accent/5 border-accent/30 shadow-sm'
                      : 'bg-muted/30 border-border/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{reward.icon}</span>
                    <div>
                      <p className={`text-sm font-display font-bold ${!isReachable ? 'text-muted-foreground' : 'text-foreground'}`}>
                        {reward.label}
                      </p>
                      <p className="text-[10px] text-muted-foreground">+{reward.kivaPoints} KivaPoints</p>
                    </div>
                  </div>
                  {reward.claimed ? (
                    <CheckCircle className="h-5 w-5 text-primary" />
                  ) : canClaim ? (
                    <Button size="sm" onClick={() => handleClaim(reward)} className="rounded-xl font-display text-xs h-8 gap-1">
                      <Gift className="h-3 w-3" /> Reclamar
                    </Button>
                  ) : (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Lock className="h-3.5 w-3.5" />
                      <span className="text-[10px] font-semibold">{reward.days - streakData.currentStreak}d</span>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
