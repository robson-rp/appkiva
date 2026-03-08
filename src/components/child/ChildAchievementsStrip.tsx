import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useT } from '@/contexts/LanguageContext';

interface Achievement {
  id: string;
  icon: string;
  title: string;
}

interface ChildAchievementsStripProps {
  achievements: Achievement[];
}

export function ChildAchievementsStrip({ achievements }: ChildAchievementsStripProps) {
  const t = useT();
  const navigate = useNavigate();

  if (achievements.length === 0) return null;

  return (
    <Card className="border border-border/50 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-kivara-light-gold/30 to-kivara-light-blue/30 opacity-50" />
      <CardContent className="p-4 relative">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-display font-bold flex items-center gap-1.5">{t('child.strip.achievements')}</p>
          <button onClick={() => navigate('/child/achievements')} className="text-xs text-primary font-semibold flex items-center gap-0.5 hover:underline">
            {t('child.strip.view_all')} <ChevronRight className="h-3 w-3" />
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-1">
          {achievements.map((ach) => (
            <motion.div key={ach.id} whileHover={{ scale: 1.02 }} className="flex-shrink-0 w-20 text-center">
              <div className="w-14 h-14 rounded-2xl bg-card shadow-sm flex items-center justify-center mx-auto mb-1 text-2xl">
                {ach.icon}
              </div>
              <p className="text-[10px] font-semibold text-muted-foreground leading-tight">{ach.title}</p>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
