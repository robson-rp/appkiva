import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, PiggyBank, Target, Medal } from 'lucide-react';
import { useHouseholdRankings } from '@/hooks/use-household-rankings';
import { useT } from '@/contexts/LanguageContext';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';

export function ChildFamilyRankings() {
  const t = useT();
  const { user } = useAuth();
  const { data: rankings = [], isLoading } = useHouseholdRankings();

  if (isLoading) {
    return <Skeleton className="h-40 w-full rounded-2xl" />;
  }

  if (rankings.length < 2) return null;

  const categories = [
    { title: t('child.rankings.saver'), data: [...rankings].sort((a, b) => b.totalSaved - a.totalSaved), metric: (c: typeof rankings[0]) => `${c.totalSaved} 🪙`, icon: PiggyBank },
    { title: t('child.rankings.planner'), data: [...rankings].sort((a, b) => b.balance - a.balance), metric: (c: typeof rankings[0]) => `${c.balance} 🪙`, icon: Target },
    { title: t('child.rankings.donor'), data: [...rankings].sort((a, b) => b.totalDonated - a.totalDonated), metric: (c: typeof rankings[0]) => `${c.totalDonated} 🪙`, icon: Medal },
  ];

  return (
    <Card className="border border-border/50 overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-accent via-chart-1 to-destructive" />
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-display flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[hsl(var(--kivara-light-gold))] flex items-center justify-center">
            <Crown className="h-3.5 w-3.5 text-accent-foreground" />
          </div>
          {t('child.rankings.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2">
          {categories.map((cat) => (
            <motion.div
              key={cat.title}
              whileHover={{ scale: 1.01 }}
              className="bg-muted/40 rounded-xl p-3 text-center border border-border/30"
            >
              <p className="text-[10px] font-display font-bold mb-2">{cat.title}</p>
              {cat.data.slice(0, 2).map((c, i) => (
                <div key={c.profileId} className={`flex items-center gap-1.5 justify-center mb-1 ${i === 0 ? 'text-foreground' : 'text-muted-foreground'}`}>
                  <span className="text-xs">{i === 0 ? '🥇' : '🥈'}</span>
                  <span className="text-lg">{c.avatar}</span>
                  <div className="text-left">
                    <p className={`text-[10px] font-bold ${i === 0 ? '' : 'font-normal'}`}>{c.name}</p>
                    <p className="text-[9px] text-muted-foreground">{cat.metric(c)}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
