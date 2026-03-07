export type LeagueTier = 'bronze' | 'silver' | 'gold' | 'diamond';

export const LEAGUE_TIERS: Record<LeagueTier, {
  label: string;
  icon: string;
  minPoints: number;
  color: string;
  bg: string;
  glow: string;
}> = {
  bronze: { label: 'Bronze', icon: '🥉', minPoints: 0, color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-950/30', glow: 'shadow-orange-400/30' },
  silver: { label: 'Prata', icon: '🥈', minPoints: 100, color: 'text-slate-400', bg: 'bg-slate-100 dark:bg-slate-800/30', glow: 'shadow-slate-400/30' },
  gold: { label: 'Ouro', icon: '🥇', minPoints: 300, color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-950/30', glow: 'shadow-yellow-400/40' },
  diamond: { label: 'Diamante', icon: '💎', minPoints: 600, color: 'text-cyan-400', bg: 'bg-cyan-50 dark:bg-cyan-950/30', glow: 'shadow-cyan-400/40' },
};

export function getLeagueTier(weeklyPoints: number): LeagueTier {
  const tiers = Object.entries(LEAGUE_TIERS).reverse() as [LeagueTier, typeof LEAGUE_TIERS[LeagueTier]][];
  for (const [key, config] of tiers) {
    if (weeklyPoints >= config.minPoints) return key;
  }
  return 'bronze';
}
