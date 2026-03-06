import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Flame } from 'lucide-react';
import { mockStreakData } from '@/data/streaks-data';

interface StreakWidgetProps {
  onClick?: () => void;
}

export function StreakWidget({ onClick }: StreakWidgetProps) {
  return (
    <Card
      className="border border-border/50 cursor-pointer hover:shadow-md transition-all duration-200 overflow-hidden"
      onClick={onClick}
    >
      <div className="h-1 bg-gradient-to-r from-destructive via-chart-1 to-accent" />
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center">
              <Flame className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-sm font-display font-bold">Sequência Diária</p>
              <p className="text-xs text-muted-foreground">{mockStreakData.totalActiveDays} dias activos no total</p>
            </div>
          </div>
          <div className="text-right">
            <motion.p
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className="text-2xl font-display font-bold text-destructive"
            >
              {mockStreakData.currentStreak} 🔥
            </motion.p>
            <p className="text-[10px] text-muted-foreground">Recorde: {mockStreakData.longestStreak}</p>
          </div>
        </div>
        <div className="flex gap-1 mt-3">
          {Array.from({ length: 7 }).map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            const dateStr = d.toISOString().split('T')[0];
            const isActive = mockStreakData.activeDates.includes(dateStr);
            return (
              <div
                key={i}
                className={`flex-1 h-2 rounded-full ${isActive ? 'bg-destructive' : 'bg-muted/60'}`}
              />
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
