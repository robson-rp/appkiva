import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Flame } from 'lucide-react';
import { motion } from 'framer-motion';
import { ChildWithBalance } from '@/hooks/use-children';
import { useT } from '@/contexts/LanguageContext';

interface StreakInfo {
  profileId: string;
  currentStreak: number;
  longestStreak: number;
  totalActiveDays: number;
}

function useChildrenStreaks(profileIds: string[]) {
  return useQuery<StreakInfo[]>({
    queryKey: ['children-streaks', profileIds],
    queryFn: async () => {
      if (!profileIds.length) return [];
      try {
        const data = await api.get<any[]>('/streaks?profiles=' + profileIds.join(','));
        return (data ?? []).map(s => ({
          profileId: s.profile_id,
          currentStreak: s.current_streak,
          longestStreak: s.longest_streak,
          totalActiveDays: s.total_active_days,
        }));
      } catch {
        return [];
      }
    },
    enabled: profileIds.length > 0,
    staleTime: 60_000,
  });
}

interface Props {
  children: ChildWithBalance[];
}

export function ParentChildrenStreaks({ children }: Props) {
  const t = useT();
  const profileIds = children.map(c => c.profileId);
  const { data: streaks = [] } = useChildrenStreaks(profileIds);
  const streakMap = new Map(streaks.map(s => [s.profileId, s]));

  if (children.length === 0) return null;

  return (
    <Card className="border-border/50 overflow-hidden">
      <div className="h-0.5 bg-gradient-to-r from-destructive via-chart-1 to-accent" />
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-display flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-destructive/10 flex items-center justify-center">
            <Flame className="h-4 w-4 text-destructive" />
          </div>
          {t('parent.children_streaks')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {children.map((child, i) => {
          const streak = streakMap.get(child.profileId);
          const current = streak?.currentStreak ?? 0;
          const longest = streak?.longestStreak ?? 0;
          const isHot = current >= 7;

          return (
            <motion.div
              key={child.childId}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3 p-3 rounded-2xl bg-muted/40 border border-transparent hover:border-border/50 transition-all"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[hsl(var(--kivara-light-blue))] to-[hsl(var(--kivara-light-green))] flex items-center justify-center text-xl">
                {child.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-display font-bold text-sm truncate">{child.displayName}</p>
                <p className="text-xs text-muted-foreground">
                  {t('parent.streak_record').replace('{count}', String(longest)).replace('{active}', String(streak?.totalActiveDays ?? 0))}
                </p>
              </div>
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${
                isHot
                  ? 'bg-destructive/10 text-destructive'
                  : current > 0
                  ? 'bg-chart-1/10 text-chart-1'
                  : 'bg-muted/60 text-muted-foreground'
              }`}>
                <Flame className="h-3.5 w-3.5" />
                <span className="font-display font-bold text-sm">{current}</span>
              </div>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
}
