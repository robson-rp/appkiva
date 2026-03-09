import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { mockBadges } from '@/data/badges-data';
import { BADGE_CATEGORIES, BADGE_TIERS, BadgeCategory, CollectibleBadge } from '@/types/kivara';
import { Award, Lock, Sparkles, Trophy } from 'lucide-react';
import { BadgeUnlockCeremony } from '@/components/BadgeUnlockCeremony';
import { useT } from '@/contexts/LanguageContext';

export default function BadgesPage() {
  const t = useT();
  const [selectedBadge, setSelectedBadge] = useState<CollectibleBadge | null>(null);
  const [unlockingBadge, setUnlockingBadge] = useState<CollectibleBadge | null>(null);

  const handleSimulateUnlock = useCallback((badge: CollectibleBadge) => {
    if (!badge.unlockedAt) {
      setUnlockingBadge(badge);
    } else {
      setSelectedBadge(badge);
    }
  }, []);

  const unlocked = mockBadges.filter(b => b.unlockedAt);
  const locked = mockBadges.filter(b => !b.unlockedAt);
  const totalProgress = Math.round((unlocked.length / mockBadges.length) * 100);

  const categories = Object.entries(BADGE_CATEGORIES);
  const tierOrder: Array<'bronze' | 'silver' | 'gold' | 'platinum'> = ['bronze', 'silver', 'gold', 'platinum'];

  const getCategoryProgress = (cat: BadgeCategory) => {
    const catBadges = mockBadges.filter(b => b.category === cat);
    const catUnlocked = catBadges.filter(b => b.unlockedAt);
    return { total: catBadges.length, unlocked: catUnlocked.length, pct: catBadges.length > 0 ? Math.round((catUnlocked.length / catBadges.length) * 100) : 0 };
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
          <Award className="h-6 w-6 text-primary" /> {t('badges.title')}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">{t('badges.subtitle')}</p>
      </motion.div>

      {/* Collection Progress */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                <span className="font-display font-bold text-foreground">{t('badges.collection')}</span>
              </div>
              <span className="text-sm font-display font-bold text-primary">{unlocked.length}/{mockBadges.length}</span>
            </div>
            <Progress value={totalProgress} className="h-2.5" />
            <div className="flex gap-3 mt-3">
              {tierOrder.map(tier => {
                const count = unlocked.filter(b => b.tier === tier).length;
                const config = BADGE_TIERS[tier];
                return (
                  <div key={tier} className="flex items-center gap-1.5 text-xs">
                    <div className={`w-3 h-3 rounded-full ${config.bg} border`} />
                    <span className={`font-semibold ${config.color}`}>{count}</span>
                    <span className="text-muted-foreground hidden xs:inline">{config.label}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Category Tabs */}
      <Tabs defaultValue="all">
        <TabsList className="w-full h-auto flex-wrap gap-1 bg-muted/50 p-1 rounded-xl">
          <TabsTrigger value="all" className="text-xs rounded-lg">{t('badges.all')}</TabsTrigger>
          {categories.map(([key, cat]) => {
            const prog = getCategoryProgress(key as BadgeCategory);
            return (
              <TabsTrigger key={key} value={key} className="text-xs rounded-lg gap-1">
                <span>{cat.icon}</span>
                <span className="hidden xs:inline">{cat.label}</span>
                <span className="text-[9px] text-muted-foreground">({prog.unlocked})</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="all" className="mt-4 space-y-6">
          {categories.map(([key, cat]) => {
            const catBadges = mockBadges.filter(b => b.category === key);
            const prog = getCategoryProgress(key as BadgeCategory);
            return (
              <CategorySection key={key} catKey={key as BadgeCategory} cat={cat} badges={catBadges} progress={prog} onSelect={handleSimulateUnlock} />
            );
          })}
        </TabsContent>

        {categories.map(([key, cat]) => {
          const catBadges = mockBadges.filter(b => b.category === key);
          const prog = getCategoryProgress(key as BadgeCategory);
          return (
            <TabsContent key={key} value={key} className="mt-4">
              <CategorySection catKey={key as BadgeCategory} cat={cat} badges={catBadges} progress={prog} onSelect={handleSimulateUnlock} />
            </TabsContent>
          );
        })}
      </Tabs>

      {/* Badge Detail Modal */}
      <AnimatePresence>
        {selectedBadge && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedBadge(null)}>
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} transition={{ type: 'spring', stiffness: 400, damping: 30 }} className="w-full max-w-sm" onClick={e => e.stopPropagation()}>
              <BadgeDetail badge={selectedBadge} onClose={() => setSelectedBadge(null)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {unlockingBadge && <BadgeUnlockCeremony badge={unlockingBadge} onComplete={() => setUnlockingBadge(null)} />}
      </AnimatePresence>
    </div>
  );
}

function CategorySection({ catKey, cat, badges, progress, onSelect }: { catKey: BadgeCategory; cat: { label: string; icon: string; color: string }; badges: CollectibleBadge[]; progress: { total: number; unlocked: number; pct: number }; onSelect: (b: CollectibleBadge) => void }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{cat.icon}</span>
          <h2 className="font-display font-bold text-sm text-foreground">{cat.label}</h2>
        </div>
        <span className="text-xs text-muted-foreground">{progress.unlocked}/{progress.total}</span>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {badges.map((badge, i) => <BadgeCard key={badge.id} badge={badge} index={i} onSelect={onSelect} />)}
      </div>
    </div>
  );
}

function BadgeCard({ badge, index, onSelect }: { badge: CollectibleBadge; index: number; onSelect: (b: CollectibleBadge) => void }) {
  const isUnlocked = !!badge.unlockedAt;
  const tierConfig = BADGE_TIERS[badge.tier];

  return (
    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.04, type: 'spring', stiffness: 300, damping: 25 }}>
      <Card className={`cursor-pointer transition-all duration-300 hover:-translate-y-1 active:scale-95 border-border/50 ${isUnlocked ? `hover:shadow-lg ${tierConfig.glow}` : 'opacity-60'}`} onClick={() => onSelect(badge)}>
        <CardContent className="p-3 text-center">
          <div className="relative inline-block mb-1.5">
            {isUnlocked ? (
              <motion.span className="text-3xl block" whileHover={{ scale: 1.3, rotate: [0, -10, 10, 0] }} transition={{ type: 'spring', stiffness: 400 }}>{badge.icon}</motion.span>
            ) : (
              <div className="relative">
                <span className="text-3xl block blur-sm grayscale opacity-50">{badge.icon}</span>
                <div className="absolute inset-0 flex items-center justify-center"><Lock className="h-4 w-4 text-muted-foreground" /></div>
              </div>
            )}
          </div>
          <p className="text-[10px] font-display font-bold text-foreground leading-tight truncate">{badge.name}</p>
          <Badge className={`text-[8px] mt-1 border-0 px-1.5 py-0 ${tierConfig.bg} ${tierConfig.color}`}>{tierConfig.label}</Badge>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function BadgeDetail({ badge, onClose }: { badge: CollectibleBadge; onClose: () => void }) {
  const t = useT();
  const isUnlocked = !!badge.unlockedAt;
  const tierConfig = BADGE_TIERS[badge.tier];
  const catConfig = BADGE_CATEGORIES[badge.category];

  return (
    <Card className={`border-2 ${isUnlocked ? 'border-primary/30' : 'border-border/50'} overflow-hidden`}>
      <CardContent className="p-0">
        <div className={`p-6 text-center ${isUnlocked ? 'bg-gradient-to-br from-primary/10 to-secondary/10' : 'bg-muted/50'}`}>
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}>
            {isUnlocked ? (
              <span className="text-6xl block mb-3">{badge.icon}</span>
            ) : (
              <div className="relative inline-block mb-3">
                <span className="text-6xl block blur-md grayscale opacity-40">{badge.icon}</span>
                <div className="absolute inset-0 flex items-center justify-center"><Lock className="h-8 w-8 text-muted-foreground" /></div>
              </div>
            )}
          </motion.div>
          <h3 className="text-lg font-display font-bold text-foreground">{badge.name}</h3>
          <div className="flex items-center justify-center gap-2 mt-2">
            <Badge className={`text-xs border-0 ${tierConfig.bg} ${tierConfig.color}`}>{tierConfig.label}</Badge>
            <Badge variant="outline" className="text-xs gap-1">{catConfig.icon} {catConfig.label}</Badge>
          </div>
        </div>
        <div className="p-5 space-y-3">
          <p className="text-sm text-foreground">{badge.description}</p>
          <div className="bg-muted/50 rounded-xl p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">{t('badges.how_to_unlock')}</p>
            <p className="text-xs text-foreground">{badge.requirement}</p>
          </div>
          {isUnlocked && badge.unlockedAt && (
            <div className="flex items-center gap-2 text-xs">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-chart-3 font-semibold">{t('badges.unlocked_at').replace('{date}', badge.unlockedAt)}</span>
            </div>
          )}
          <button onClick={onClose} className="w-full py-2.5 rounded-xl bg-muted hover:bg-muted/80 text-sm font-semibold text-foreground transition-colors">
            {t('badges.close')}
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
