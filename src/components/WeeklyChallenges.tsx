import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Trophy, Clock, CheckCircle2, Flame, Users, Medal, Crown, ChevronRight } from 'lucide-react';
import { mockWeeklyChallenges, mockClassLeaderboard } from '@/data/weekly-challenges-data';
import { WeeklyChallenge, WeeklyChallengeStatus } from '@/types/kivara';
import { LeagueBadge } from '@/components/LeagueBadge';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

const typeConfig: Record<string, { bg: string; label: string }> = {
  saving: { bg: 'bg-[hsl(var(--kivara-light-green))]', label: 'Poupança' },
  tasks: { bg: 'bg-[hsl(var(--kivara-light-blue))]', label: 'Tarefas' },
  learning: { bg: 'bg-[hsl(var(--kivara-light-gold))]', label: 'Aprendizagem' },
  mixed: { bg: 'bg-[hsl(var(--kivara-purple))]/15', label: 'Misto' },
};

const statusConfig: Record<WeeklyChallengeStatus, { label: string; badge: string; icon: typeof Clock }> = {
  active: { label: 'Em Curso', badge: 'bg-accent text-accent-foreground', icon: Clock },
  completed: { label: 'Completo', badge: 'bg-secondary text-secondary-foreground', icon: CheckCircle2 },
  expired: { label: 'Expirado', badge: 'bg-muted text-muted-foreground', icon: Clock },
};

const rankMedals: Record<number, { icon: typeof Crown; color: string }> = {
  1: { icon: Crown, color: 'text-yellow-500' },
  2: { icon: Medal, color: 'text-slate-400' },
  3: { icon: Medal, color: 'text-orange-500' },
};

function daysLeft(endDate: string): number {
  return Math.max(0, Math.ceil((new Date(endDate).getTime() - Date.now()) / 86400000));
}

export function WeeklyChallenges() {
  const active = mockWeeklyChallenges.filter(c => c.status === 'active');
  const past = mockWeeklyChallenges.filter(c => c.status !== 'active');
  const currentUser = mockClassLeaderboard.find(e => e.isCurrentUser);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-5">
      {/* League Badge */}
      <motion.div variants={item}>
        <LeagueBadge weeklyPoints={currentUser?.score ?? 0} />
      </motion.div>

      {/* Leaderboard Summary */}
      <motion.div variants={item}>
        <Card className="border-0 overflow-hidden shadow-kivara">
          <div className="absolute inset-0 gradient-kivara" />
          <CardContent className="relative z-10 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="h-5 w-5 text-white" />
              <h2 className="font-display font-bold text-white">Ranking da Turma</h2>
            </div>

            {/* Top 3 */}
            <div className="flex justify-center items-end gap-3 mb-4">
              {mockClassLeaderboard.slice(0, 3).map((entry, i) => {
                const order = [1, 0, 2]; // show 2nd, 1st, 3rd
                const e = mockClassLeaderboard[order[i]];
                const heights = ['h-20', 'h-24', 'h-16'];
                const MedalIcon = rankMedals[e.rank]?.icon || Medal;
                const medalColor = rankMedals[e.rank]?.color || 'text-muted-foreground';
                return (
                  <motion.div
                    key={e.rank}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    className="flex flex-col items-center"
                  >
                    <div className={`relative mb-1 ${e.isCurrentUser ? 'ring-2 ring-white/60 rounded-full' : ''}`}>
                      <div className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center text-xl">
                        {e.avatar}
                      </div>
                      <div className="absolute -top-1.5 -right-1.5">
                        <MedalIcon className={`h-4 w-4 ${medalColor}`} />
                      </div>
                    </div>
                    <p className="text-[10px] text-white/80 font-semibold truncate max-w-[60px] text-center">{e.name}</p>
                    <div className={`${heights[i]} w-14 rounded-t-xl bg-white/15 mt-1 flex items-end justify-center pb-1.5`}>
                      <span className="text-xs font-display font-bold text-white">{e.score}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Current user position */}
            {currentUser && currentUser.rank > 3 && (
              <div className="bg-white/10 rounded-xl p-2.5 flex items-center gap-3">
                <span className="text-xs font-display font-bold text-white/60 w-6 text-center">#{currentUser.rank}</span>
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm">{currentUser.avatar}</div>
                <div className="flex-1">
                  <p className="text-xs font-display font-bold text-white">{currentUser.name} (Tu)</p>
                </div>
                <span className="text-xs font-display font-bold text-white">{currentUser.score} pts</span>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Active Challenges */}
      {active.length > 0 && (
        <motion.div variants={item}>
          <h2 className="font-display font-bold text-sm mb-3 flex items-center gap-2">
            <Flame className="h-4 w-4 text-accent-foreground" /> Desafios desta Semana
          </h2>
          <div className="space-y-3">
            {active.map((ch) => (
              <ChallengeCard key={ch.id} challenge={ch} />
            ))}
          </div>
        </motion.div>
      )}

      {/* Full Leaderboard */}
      <motion.div variants={item}>
        <h2 className="font-display font-bold text-sm mb-3 flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" /> Classificação Completa
        </h2>
        <Card className="border-border/50">
          <CardContent className="p-0 divide-y divide-border/30">
            {mockClassLeaderboard.map((entry) => {
              const MedalIcon = rankMedals[entry.rank]?.icon;
              const medalColor = rankMedals[entry.rank]?.color;
              return (
                <div
                  key={entry.rank}
                  className={`flex items-center gap-3 px-4 py-3 ${entry.isCurrentUser ? 'bg-primary/[0.05]' : ''}`}
                >
                  <span className="w-6 text-center font-display font-bold text-sm text-muted-foreground">
                    {MedalIcon ? <MedalIcon className={`h-4 w-4 mx-auto ${medalColor}`} /> : `#${entry.rank}`}
                  </span>
                  <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-lg">{entry.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-display ${entry.isCurrentUser ? 'font-bold text-primary' : 'font-semibold'}`}>
                      {entry.name} {entry.isCurrentUser && <span className="text-[10px] text-muted-foreground">(Tu)</span>}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{entry.challengesCompleted} desafios completos</p>
                  </div>
                  <span className="font-display font-bold text-sm">{entry.score} <span className="text-[10px] text-muted-foreground">pts</span></span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </motion.div>

      {/* Past Challenges */}
      {past.length > 0 && (
        <motion.div variants={item}>
          <h2 className="font-display font-bold text-sm mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" /> Anteriores
          </h2>
          <div className="space-y-3">
            {past.map((ch) => (
              <ChallengeCard key={ch.id} challenge={ch} />
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

function ChallengeCard({ challenge: ch }: { challenge: WeeklyChallenge }) {
  const type = typeConfig[ch.type];
  const status = statusConfig[ch.status];
  const progress = Math.min(Math.round((ch.currentValue / ch.targetValue) * 100), 100);
  const remaining = daysLeft(ch.weekEnd);

  return (
    <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
      <Card className={`border-border/50 overflow-hidden ${ch.status === 'expired' ? 'opacity-60' : ''}`}>
        {ch.status === 'active' && <div className="h-1 gradient-kivara" />}
        {ch.status === 'completed' && <div className="h-1 gradient-gold" />}
        <CardContent className="p-4">
          <div className="flex items-start gap-3 mb-3">
            <div className={`w-11 h-11 rounded-2xl ${type.bg} flex items-center justify-center text-xl shrink-0`}>
              {ch.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="font-display font-bold text-sm truncate">{ch.title}</h3>
                <Badge className={`text-[9px] ${status.badge} border-0 rounded-lg shrink-0`}>{status.label}</Badge>
              </div>
              <p className="text-[11px] text-muted-foreground line-clamp-2">{ch.description}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="font-display font-bold text-sm">🪙 {ch.reward}</p>
              <p className="text-[10px] text-muted-foreground">+{ch.kivaPointsReward} pts</p>
            </div>
          </div>

          {ch.status === 'active' && (
            <>
              <div className="space-y-1.5 mb-2">
                <div className="flex justify-between">
                  <span className="text-[10px] text-muted-foreground">{ch.currentValue}/{ch.targetValue}</span>
                  <span className="text-[10px] font-display font-bold text-primary">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2 rounded-full" />
              </div>
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {ch.participantCount} participantes</span>
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {remaining} dias restantes</span>
              </div>
            </>
          )}

          {ch.status === 'completed' && (
            <div className="flex items-center gap-2 text-secondary">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-xs font-display font-semibold">Desafio completo! 🎉</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
