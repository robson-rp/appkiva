import { motion } from 'framer-motion';
import { LeagueTier, LEAGUE_TIERS, getLeagueTier } from '@/types/league';
import { Shield } from 'lucide-react';
import { useT } from '@/contexts/LanguageContext';

interface LeagueBadgeProps {
  weeklyPoints: number;
  compact?: boolean;
}

export function LeagueBadge({ weeklyPoints, compact = false }: LeagueBadgeProps) {
  const t = useT();
  const tier = getLeagueTier(weeklyPoints);
  const config = LEAGUE_TIERS[tier];

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-display font-bold ${config.bg} ${config.color}`}>
        <span>{config.icon}</span>
        <span>{config.label}</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`relative flex items-center gap-2 px-3 py-2 rounded-xl ${config.bg} shadow-sm ${config.glow}`}
    >
      <motion.div
        animate={{ rotate: [0, 5, -5, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="text-2xl"
      >
        {config.icon}
      </motion.div>
      <div>
        <p className={`text-xs font-display font-bold ${config.color}`}>{t('league.title').replace('{label}', config.label)}</p>
        <p className="text-[10px] text-muted-foreground">{t('league.weekly_pts').replace('{pts}', String(weeklyPoints))}</p>
      </div>
      <Shield className={`h-4 w-4 ml-auto ${config.color} opacity-50`} />
    </motion.div>
  );
}
