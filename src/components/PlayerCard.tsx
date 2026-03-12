import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Level, LEVEL_CONFIG } from '@/types/kivara';
import { getLeagueTier, LEAGUE_TIERS } from '@/types/league';
import { AvatarGlow } from '@/components/AvatarGlow';
import { LeagueBadge } from '@/components/LeagueBadge';
import { Flame, Trophy, Star, Zap, RefreshCw } from 'lucide-react';
import { useT } from '@/contexts/LanguageContext';
import { useQueryClient } from '@tanstack/react-query';

interface PlayerCardProps {
  name: string;
  level: Level;
  points: number;
  balance: number;
  streakDays: number;
  badgeCount: number;
  weeklyPoints?: number;
  onLevelUpClick?: () => void;
}

export function PlayerCard({
  name,
  level,
  points,
  balance,
  streakDays,
  badgeCount,
  weeklyPoints = 0,
  onLevelUpClick,
}: PlayerCardProps) {
  const t = useT();
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    queryClient.invalidateQueries({ queryKey: ['wallet-balance'] });
    queryClient.invalidateQueries({ queryKey: ['wallet-transactions'] });
    queryClient.invalidateQueries({ queryKey: ['children'] });
    setTimeout(() => setIsRefreshing(false), 1500);
  };

  const levels = Object.entries(LEVEL_CONFIG) as [Level, typeof config][];
  const currentIndex = levels.findIndex(([k]) => k === level);
  const nextLevel = levels[currentIndex + 1];
  const progress = nextLevel
    ? ((points - config.minPoints) / (nextLevel[1].minPoints - config.minPoints)) * 100
    : 100;

  return (
    <Card className="border-0 overflow-hidden relative shadow-kivara">
      <div className="absolute inset-0 gradient-kivara" />
      <div className="absolute top-[-30%] right-[-15%] w-[55%] h-[80%] rounded-full bg-white/5 blur-3xl" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[40%] h-[60%] rounded-full bg-white/5 blur-3xl" />

      <CardContent className="relative z-10 p-5">
        <div className="flex items-start gap-4">
          <AvatarGlow level={level} size="md" />
          <div className="flex-1 min-w-0">
            <p className="text-white/60 text-[10px] font-display uppercase tracking-wider">{t('player.player')}</p>
            <h2 className="font-display text-xl font-bold text-white truncate">{name}</h2>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[10px] font-display font-bold bg-white/15 text-white px-2 py-0.5 rounded-full">
                {config.label} {config.avatar}
              </span>
              <LeagueBadge weeklyPoints={weeklyPoints} compact />
            </div>
          </div>
          <div className="text-right shrink-0">
            <motion.span
              key={balance}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="font-display text-3xl font-bold text-white block"
            >
              {balance}
            </motion.span>
            <span className="text-[10px] text-white/50 font-display">{t('player.kivacoins')}</span>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1">
              <Zap className="h-3 w-3 text-white/60" />
              <span className="text-[10px] text-white/60 font-display">{points} FXP</span>
            </div>
            {nextLevel && (
              <span className="text-[10px] text-white/40 font-display">
                {t('player.to_next').replace('{points}', String(nextLevel[1].minPoints - points)).replace('{next}', nextLevel[1].avatar)}
              </span>
            )}
          </div>
          <div className="h-2 rounded-full bg-white/15 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-white/70 to-white/40"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-4">
          {[
            { icon: Flame, label: t('player.streak'), value: `${streakDays}d`, color: 'text-orange-300' },
            { icon: Trophy, label: t('player.badges'), value: badgeCount, color: 'text-yellow-300' },
            { icon: Star, label: 'FXP', value: points, color: 'text-cyan-300' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white/10 backdrop-blur-sm rounded-xl px-2 py-2 text-center">
              <stat.icon className={`h-3.5 w-3.5 mx-auto mb-0.5 ${stat.color}`} />
              <p className="font-display font-bold text-white text-sm">{stat.value}</p>
              <p className="text-[8px] text-white/40 uppercase tracking-wider font-semibold">{stat.label}</p>
            </div>
          ))}
        </div>

        {onLevelUpClick && (
          <button
            onClick={onLevelUpClick}
            className="mt-3 text-[10px] text-white/40 hover:text-white/70 transition-colors font-display"
          >
            {t('player.see_evolution')}
          </button>
        )}
      </CardContent>
    </Card>
  );
}
