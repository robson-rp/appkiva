import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { mockAchievements } from '@/data/mock-data';
import { useBadgesWithProgress } from '@/hooks/use-badges';
import { LevelBadge } from '@/components/LevelBadge';
import { Kivo } from '@/components/Kivo';
import { Lock, Trophy, Star, Award } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useT } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useStreakData } from '@/hooks/use-streaks';
import { LEVEL_CONFIG, Level } from '@/types/kivara';

export default function ChildAchievements() {
  const t = useT();
  const { user } = useAuth();
  const { data: streakData } = useStreakData();
  const badgesData = useBadgesWithProgress();

  const childKivaPoints = streakData?.totalActiveDays ? streakData.totalActiveDays * 15 : 0;
  
  // Determine level from points
  const levels = Object.entries(LEVEL_CONFIG) as [Level, (typeof LEVEL_CONFIG)[Level]][];
  let childLevel: Level = 'apprentice';
  for (const [key, cfg] of levels) {
    if (childKivaPoints >= cfg.minPoints) childLevel = key;
  }

  // Map badges to achievement format
  const allAchievements = badgesData.map(b => ({
    id: b.id,
    title: b.name,
    description: b.description,
    icon: b.icon,
    unlockedAt: b.unlockedAt ? new Date(b.unlockedAt).toLocaleDateString('pt-PT') : undefined,
    childId: user?.profileId ?? '',
  }));

  const unlocked = allAchievements.filter((a) => a.unlockedAt);
  const locked = allAchievements.filter((a) => !a.unlockedAt);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-primary via-primary/90 to-accent text-primary-foreground">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl" />
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Trophy className="h-6 w-6" />
              </div>
              <div>
                <h1 className="font-display text-xl font-bold">{t('child.achievements.title')}</h1>
                <p className="text-sm opacity-80">{unlocked.length} {t('child.achievements.of')} {allAchievements.length} {t('child.achievements.unlocked')}</p>
              </div>
            </div>
            <LevelBadge level={childLevel} points={childKivaPoints} showProgress />
          </CardContent>
        </Card>
      </motion.div>

      {/* Badges Link */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <NavLink to="/child/badges">
          <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5 hover:shadow-md transition-all cursor-pointer active:scale-[0.99]">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Award className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-display font-bold text-sm text-foreground">{t('child.achievements.badges_collection')}</p>
                  <p className="text-[10px] text-muted-foreground">{t('child.achievements.badges_desc')}</p>
                </div>
              </div>
              <span className="text-lg">→</span>
            </CardContent>
          </Card>
        </NavLink>
      </motion.div>
      {/* Unlocked */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Star className="h-4 w-4 text-primary" />
          <h2 className="font-display font-semibold text-sm text-foreground">{t('child.achievements.unlocked_section')} ({unlocked.length})</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {unlocked.map((ach, i) => (
            <motion.div
              key={ach.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1, type: 'spring', stiffness: 300, damping: 25 }}
            >
              <Card className="border-accent/30 bg-accent/10 backdrop-blur-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 group">
                <CardContent className="p-4 text-center">
                  <motion.span
                    className="text-4xl block mb-2"
                    whileHover={{ scale: 1.3, rotate: 10 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                  >
                    {ach.icon}
                  </motion.span>
                  <h3 className="font-display font-semibold text-sm">{ach.title}</h3>
                  <p className="text-[10px] text-muted-foreground mt-1">{ach.description}</p>
                  {ach.unlockedAt && (
                    <p className="text-[9px] text-primary font-medium mt-2">✓ {ach.unlockedAt}</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Locked */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Lock className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-display font-semibold text-sm text-muted-foreground">{t('child.achievements.locked_section')} ({locked.length})</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {locked.map((ach, i) => (
            <motion.div
              key={ach.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 0.7, y: 0 }}
              transition={{ delay: 0.3 + i * 0.08 }}
            >
              <Card className="border-border/30 bg-muted/30 backdrop-blur-sm">
                <CardContent className="p-4 text-center">
                  <div className="relative inline-block">
                    <span className="text-4xl block mb-2 blur-sm grayscale">{ach.icon}</span>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-muted/80 backdrop-blur-sm flex items-center justify-center">
                        <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                  <h3 className="font-display font-semibold text-sm text-muted-foreground">{ach.title}</h3>
                  <p className="text-[10px] text-muted-foreground/70 mt-1">{ach.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      <Kivo page="achievements" />
    </div>
  );
}
