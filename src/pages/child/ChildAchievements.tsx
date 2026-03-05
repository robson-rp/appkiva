import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { mockAchievements, mockChildren } from '@/data/mock-data';
import { LevelBadge } from '@/components/LevelBadge';
import { Kivo } from '@/components/Kivo';
import { Lock } from 'lucide-react';

export default function ChildAchievements() {
  const child = mockChildren[0];
  const unlocked = mockAchievements.filter((a) => a.childId === child.id && a.unlockedAt);
  const locked = mockAchievements.filter((a) => !a.unlockedAt || a.childId !== child.id);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="font-display text-xl font-bold">Conquistas</h1>
        <LevelBadge level={child.level} points={child.kivaPoints} showProgress />
      </div>

      <div>
        <h2 className="font-display font-semibold text-sm mb-3 text-secondary">Desbloqueadas ({unlocked.length})</h2>
        <div className="grid grid-cols-2 gap-3">
          {unlocked.map((ach, i) => (
            <motion.div key={ach.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}>
              <Card className="border-accent/30 bg-kivara-light-gold/30">
                <CardContent className="p-4 text-center">
                  <span className="text-3xl block mb-2">{ach.icon}</span>
                  <h3 className="font-display font-semibold text-sm">{ach.title}</h3>
                  <p className="text-[10px] text-muted-foreground mt-1">{ach.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="font-display font-semibold text-sm mb-3 text-muted-foreground">Por Desbloquear ({locked.length})</h2>
        <div className="grid grid-cols-2 gap-3">
          {locked.map((ach) => (
            <Card key={ach.id} className="opacity-60">
              <CardContent className="p-4 text-center">
                <div className="relative inline-block">
                  <span className="text-3xl block mb-2 blur-sm">{ach.icon}</span>
                  <Lock className="h-4 w-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-muted-foreground" />
                </div>
                <h3 className="font-display font-semibold text-sm">{ach.title}</h3>
                <p className="text-[10px] text-muted-foreground mt-1">{ach.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Kivo page="achievements" />
    </div>
  );
}
