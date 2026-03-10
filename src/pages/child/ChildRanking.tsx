import { useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Medal, Users, Home as HomeIcon } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useHouseholdRankings } from '@/hooks/use-household-rankings';
import { useAuth } from '@/contexts/AuthContext';
import { useT } from '@/contexts/LanguageContext';
import { Skeleton } from '@/components/ui/skeleton';
import type { ClassLeaderboardEntry } from '@/types/kivara';

const MEDAL = ['🥇', '🥈', '🥉'];

/* ── Podium ── */
function Podium({ entries }: { entries: ClassLeaderboardEntry[] }) {
  const top3 = entries.slice(0, 3);
  const order = top3.length >= 3 ? [top3[1], top3[0], top3[2]] : top3;
  const heights = ['h-16', 'h-24', 'h-12'];
  const positions = top3.length >= 3 ? [1, 0, 2] : top3.map((_, i) => i);

  return (
    <div className="flex items-end justify-center gap-3 pt-6 pb-2">
      {order.map((entry, vi) => {
        const ri = positions[vi];
        return (
          <motion.div
            key={entry.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: vi * 0.1, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center"
          >
            <div className={`relative mb-1 ${entry.isCurrentUser ? 'ring-2 ring-primary ring-offset-2 ring-offset-background rounded-full' : ''}`}>
              <span className="text-3xl">{entry.avatar}</span>
              {ri === 0 && <Crown className="absolute -top-3 left-1/2 -translate-x-1/2 h-4 w-4 text-accent" />}
            </div>
            <p className={`text-xs font-bold truncate max-w-[64px] ${entry.isCurrentUser ? 'text-primary' : 'text-foreground'}`}>
              {entry.name}
            </p>
            <p className="text-[10px] text-muted-foreground">{entry.score} pts</p>
            <div className={`${heights[ri]} w-14 rounded-t-xl mt-1 flex items-start justify-center pt-1 ${ri === 0 ? 'bg-accent/20' : 'bg-muted/60'}`}>
              <span className="text-lg">{MEDAL[ri]}</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ── Leaderboard List ── */
function LeaderboardList({ entries }: { entries: ClassLeaderboardEntry[] }) {
  return (
    <div className="space-y-1.5 mt-3">
      {entries.map((e, i) => (
        <motion.div
          key={e.name + i}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.04 }}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${e.isCurrentUser ? 'bg-primary/10 border border-primary/20' : 'bg-muted/30'}`}
        >
          <span className="w-6 text-center text-sm font-bold text-muted-foreground">{e.rank}</span>
          <span className="text-xl">{e.avatar}</span>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-semibold truncate ${e.isCurrentUser ? 'text-primary' : 'text-foreground'}`}>
              {e.name}
              {e.isCurrentUser && <Badge variant="secondary" className="ml-2 text-[9px] py-0">Tu</Badge>}
            </p>
          </div>
          <span className="text-sm font-bold tabular-nums text-foreground">{e.score}</span>
        </motion.div>
      ))}
    </div>
  );
}

/* ── Siblings Tab ── */
function SiblingsTab() {
  const t = useT();
  const { user } = useAuth();
  const { data: rankings = [], isLoading } = useHouseholdRankings();

  const categories: { label: string; key: 'totalSaved' | 'balance' | 'totalDonated'; icon: string }[] = [
    { label: t('ranking.cat_savings'), key: 'totalSaved', icon: '🐷' },
    { label: t('ranking.cat_points'), key: 'balance', icon: '⭐' },
    { label: t('ranking.cat_donations'), key: 'totalDonated', icon: '💝' },
  ];

  const [cat, setCat] = useState(0);

  if (isLoading) return <Skeleton className="h-40 w-full" />;
  if (rankings.length === 0) return <p className="text-sm text-muted-foreground text-center py-8">{t('ranking.no_siblings')}</p>;

  const sorted = [...rankings].sort((a, b) => (b as any)[categories[cat].key] - (a as any)[categories[cat].key]);

  const entries: ClassLeaderboardEntry[] = sorted.map((s, i) => ({
    rank: i + 1,
    name: s.name,
    avatar: s.avatar,
    score: (s as any)[categories[cat].key],
    challengesCompleted: 0,
    isCurrentUser: s.profileId === user?.profileId,
  }));

  return (
    <div>
      <div className="flex gap-2 mb-2 overflow-x-auto pb-1">
        {categories.map((c, i) => (
          <button
            key={c.key}
            onClick={() => setCat(i)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${cat === i ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
          >
            <span>{c.icon}</span> {c.label}
          </button>
        ))}
      </div>
      {entries.length >= 2 && <Podium entries={entries} />}
      <LeaderboardList entries={entries} />
    </div>
  );
}

/* ── Classmates Tab (placeholder - needs classroom leaderboard query) ── */
function ClassmatesTab() {
  const t = useT();
  return (
    <div className="text-center py-8">
      <p className="text-sm text-muted-foreground">{t('ranking.classmates_coming_soon')}</p>
    </div>
  );
}

/* ── Page ── */
export default function ChildRanking() {
  const t = useT();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-accent/20 flex items-center justify-center">
          <Crown className="h-5 w-5 text-accent" />
        </div>
        <div>
          <h1 className="text-lg font-display font-bold text-foreground">{t('ranking.title')}</h1>
          <p className="text-xs text-muted-foreground">{t('ranking.subtitle')}</p>
        </div>
      </div>

      <Card className="border border-border/50 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-accent via-chart-1 to-destructive" />
        <CardContent className="p-4">
          <Tabs defaultValue="siblings">
            <TabsList className="w-full mb-4">
              <TabsTrigger value="siblings" className="flex-1 gap-1.5">
                <HomeIcon className="h-3.5 w-3.5" />
                {t('ranking.tab_siblings')}
              </TabsTrigger>
              <TabsTrigger value="classmates" className="flex-1 gap-1.5">
                <Users className="h-3.5 w-3.5" />
                {t('ranking.tab_classmates')}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="siblings"><SiblingsTab /></TabsContent>
            <TabsContent value="classmates"><ClassmatesTab /></TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
