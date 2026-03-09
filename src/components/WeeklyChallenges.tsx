import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Clock, CheckCircle2, Flame, Users, Medal, Crown, Share2 } from 'lucide-react';
import { useWeeklyChallenges, useClassroomLeaderboard, useHouseholdLeaderboard } from '@/hooks/use-weekly-challenges';
import { WeeklyChallenge, WeeklyChallengeStatus, ClassLeaderboardEntry } from '@/types/kivara';
import { LeagueBadge } from '@/components/LeagueBadge';
import { useT } from '@/contexts/LanguageContext';
import { Skeleton } from '@/components/ui/skeleton';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

const typeConfig: Record<string, { bg: string; key: string }> = {
  saving: { bg: 'bg-[hsl(var(--kivara-light-green))]', key: 'challenges.type_saving' },
  tasks: { bg: 'bg-[hsl(var(--kivara-light-blue))]', key: 'challenges.type_tasks' },
  learning: { bg: 'bg-[hsl(var(--kivara-light-gold))]', key: 'challenges.type_learning' },
  mixed: { bg: 'bg-[hsl(var(--kivara-purple))]/15', key: 'challenges.type_mixed' },
  social: { bg: 'bg-[hsl(var(--kivara-pink))]/15', key: 'challenges.type_social' },
};

const statusConfig: Record<WeeklyChallengeStatus, { key: string; badge: string; icon: typeof Clock }> = {
  active: { key: 'challenges.status_active', badge: 'bg-accent text-accent-foreground', icon: Clock },
  completed: { key: 'challenges.status_completed', badge: 'bg-secondary text-secondary-foreground', icon: CheckCircle2 },
  expired: { key: 'challenges.status_expired', badge: 'bg-muted text-muted-foreground', icon: Clock },
};

const rankMedals: Record<number, { icon: typeof Crown; color: string }> = {
  1: { icon: Crown, color: 'text-yellow-500' },
  2: { icon: Medal, color: 'text-slate-400' },
  3: { icon: Medal, color: 'text-orange-500' },
};

function daysLeft(endDate: string): number {
  return Math.max(0, Math.ceil((new Date(endDate).getTime() - Date.now()) / 86400000));
}

type RankingFilter = 'class' | 'friends';

export function WeeklyChallenges() {
  const t = useT();
  const [rankFilter, setRankFilter] = useState<RankingFilter>('class');
  const { data: challenges = [], isLoading } = useWeeklyChallenges();
  const { data: classLeaderboard = [] } = useClassroomLeaderboard();
  const { data: friendsLeaderboard = [] } = useHouseholdLeaderboard();

  const active = challenges.filter(c => c.status === 'active');
  const past = challenges.filter(c => c.status !== 'active');
  const leaderboard = rankFilter === 'friends' ? friendsLeaderboard : classLeaderboard;
  const currentUser = leaderboard.find(e => e.isCurrentUser);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-5">
      <motion.div variants={item}><LeagueBadge weeklyPoints={currentUser?.score ?? 0} /></motion.div>

      {/* Leaderboard with filter */}
      {leaderboard.length > 0 && (
        <motion.div variants={item}>
          <Card className="border-0 overflow-hidden shadow-kivara">
            <div className="absolute inset-0 gradient-kivara" />
            <CardContent className="relative z-10 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2"><Trophy className="h-5 w-5 text-white" /><h2 className="font-display font-bold text-white">{rankFilter === 'friends' ? t('challenges.friends_ranking') : t('challenges.ranking')}</h2></div>
                <div className="flex gap-1 bg-white/10 rounded-xl p-0.5">
                  {(['class', 'friends'] as RankingFilter[]).map((f) => (
                    <button
                      key={f}
                      onClick={() => setRankFilter(f)}
                      className={`px-3 py-1 rounded-lg text-[10px] font-display font-bold transition-all ${rankFilter === f ? 'bg-white/25 text-white' : 'text-white/50 hover:text-white/80'}`}
                    >
                      {f === 'class' ? t('challenges.filter_class') : t('challenges.filter_friends')}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-center items-end gap-3 mb-4">
                {leaderboard.slice(0, 3).map((_, i) => {
                  const order = [1, 0, 2];
                  const idx = order[i];
                  if (idx >= leaderboard.length) return null;
                  const e = leaderboard[idx];
                  const heights = ['h-20', 'h-24', 'h-16'];
                  const MedalIcon = rankMedals[e.rank]?.icon || Medal;
                  const medalColor = rankMedals[e.rank]?.color || 'text-muted-foreground';
                  return (
                    <motion.div key={e.rank} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 + i * 0.1 }} className="flex flex-col items-center">
                      <div className={`relative mb-1 ${e.isCurrentUser ? 'ring-2 ring-white/60 rounded-full' : ''}`}>
                        <div className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center text-xl">{e.avatar}</div>
                        <div className="absolute -top-1.5 -right-1.5"><MedalIcon className={`h-4 w-4 ${medalColor}`} /></div>
                      </div>
                      <p className="text-[10px] text-white/80 font-semibold truncate max-w-[60px] text-center">{e.name}</p>
                      <div className={`${heights[i]} w-14 rounded-t-xl bg-white/15 mt-1 flex items-end justify-center pb-1.5`}><span className="text-xs font-display font-bold text-white">{e.score}</span></div>
                    </motion.div>
                  );
                })}
              </div>
              {currentUser && currentUser.rank > 3 && (
                <div className="bg-white/10 rounded-xl p-2.5 flex items-center gap-3">
                  <span className="text-xs font-display font-bold text-white/60 w-6 text-center">#{currentUser.rank}</span>
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm">{currentUser.avatar}</div>
                  <div className="flex-1"><p className="text-xs font-display font-bold text-white">{currentUser.name} ({t('challenges.you')})</p></div>
                  <span className="text-xs font-display font-bold text-white">{currentUser.score} {t('challenges.pts')}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {active.length > 0 && (
        <motion.div variants={item}>
          <h2 className="font-display font-bold text-sm mb-3 flex items-center gap-2"><Flame className="h-4 w-4 text-accent-foreground" /> {t('challenges.this_week')}</h2>
          <div className="space-y-3">{active.map((ch) => <ChallengeCard key={ch.id} challenge={ch} />)}</div>
        </motion.div>
      )}

      {leaderboard.length > 0 && (
        <motion.div variants={item}>
          <h2 className="font-display font-bold text-sm mb-3 flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> {t('challenges.full_ranking')}</h2>
          <Card className="border-border/50">
            <CardContent className="p-0 divide-y divide-border/30">
              {leaderboard.map((entry) => {
                const MedalIcon = rankMedals[entry.rank]?.icon;
                const medalColor = rankMedals[entry.rank]?.color;
                return (
                  <div key={entry.rank} className={`flex items-center gap-3 px-4 py-3 ${entry.isCurrentUser ? 'bg-primary/[0.05]' : ''}`}>
                    <span className="w-6 text-center font-display font-bold text-sm text-muted-foreground">{MedalIcon ? <MedalIcon className={`h-4 w-4 mx-auto ${medalColor}`} /> : `#${entry.rank}`}</span>
                    <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-lg">{entry.avatar}</div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-display ${entry.isCurrentUser ? 'font-bold text-primary' : 'font-semibold'}`}>{entry.name} {entry.isCurrentUser && <span className="text-[10px] text-muted-foreground">({t('challenges.you')})</span>}</p>
                      <p className="text-[10px] text-muted-foreground">{entry.challengesCompleted} {t('challenges.completed_count')}</p>
                    </div>
                    <span className="font-display font-bold text-sm">{entry.score} <span className="text-[10px] text-muted-foreground">{t('challenges.pts')}</span></span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {past.length > 0 && (
        <motion.div variants={item}>
          <h2 className="font-display font-bold text-sm mb-3 flex items-center gap-2"><Clock className="h-4 w-4 text-muted-foreground" /> {t('challenges.previous')}</h2>
          <div className="space-y-3">{past.map((ch) => <ChallengeCard key={ch.id} challenge={ch} />)}</div>
        </motion.div>
      )}

      {challenges.length === 0 && leaderboard.length === 0 && (
        <motion.div variants={item} className="text-center py-12">
          <span className="text-4xl block mb-3">🏆</span>
          <p className="text-sm text-muted-foreground">{t('challenges.no_challenges') ?? 'Ainda não há desafios semanais. Volta em breve!'}</p>
        </motion.div>
      )}
    </motion.div>
  );
}

function ChallengeCard({ challenge: ch }: { challenge: WeeklyChallenge }) {
  const t = useT();
  const type = typeConfig[ch.type] || typeConfig.mixed;
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
            <div className={`w-11 h-11 rounded-2xl ${type.bg} flex items-center justify-center text-xl shrink-0`}>{ch.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="font-display font-bold text-sm truncate">{ch.title}</h3>
                <Badge className={`text-[9px] ${status.badge} border-0 rounded-lg shrink-0`}>{t(status.key)}</Badge>
                {ch.type === 'social' && <Badge className="text-[9px] bg-[hsl(var(--kivara-pink))]/15 text-[hsl(var(--kivara-pink))] border-0 rounded-lg shrink-0">{t('challenges.type_social')}</Badge>}
              </div>
              <p className="text-[11px] text-muted-foreground line-clamp-2">{ch.description}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="font-display font-bold text-sm">🪙 {ch.reward}</p>
              <p className="text-[10px] text-muted-foreground">+{ch.kivaPointsReward} {t('challenges.pts')}</p>
            </div>
          </div>
          {ch.status === 'active' && (
            <>
              <div className="space-y-1.5 mb-2">
                <div className="flex justify-between"><span className="text-[10px] text-muted-foreground">{ch.currentValue}/{ch.targetValue}</span><span className="text-[10px] font-display font-bold text-primary">{progress}%</span></div>
                <Progress value={progress} className="h-2 rounded-full" />
              </div>
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {ch.participantCount} {t('challenges.participants')}</span>
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {remaining} {t('challenges.days_left')}</span>
              </div>
              {ch.type === 'social' && (
                <div className="mt-2 bg-[hsl(var(--kivara-pink))]/10 rounded-xl p-2.5 flex items-center gap-2">
                  <Share2 className="h-3.5 w-3.5 text-[hsl(var(--kivara-pink))]" />
                  <p className="text-[10px] text-muted-foreground font-medium">{t('challenges.social_hint')}</p>
                </div>
              )}
            </>
          )}
          {ch.status === 'completed' && (
            <div className="flex items-center gap-2 text-secondary"><CheckCircle2 className="h-4 w-4" /><span className="text-xs font-display font-semibold">{t('challenges.complete')}</span></div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
