import { Card, CardContent } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';
import { LineChart, Line, XAxis, ResponsiveContainer } from 'recharts';
import { DailyPoint } from '@/hooks/use-weekly-sparkline';
import { useT } from '@/contexts/LanguageContext';

interface WeeklySparklineProps {
  points: DailyPoint[];
  totalEarned: number;
  totalSpent: number;
}

export function WeeklySparkline({ points, totalEarned, totalSpent }: WeeklySparklineProps) {
  const t = useT();
  if (points.length === 0) return null;

  return (
    <Card className="border border-border/50 overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-secondary/10 flex items-center justify-center">
              <Sparkles className="h-3 w-3 text-secondary" />
            </div>
            <span className="text-xs font-display font-bold text-foreground">{t('sparkline.this_week')}</span>
          </div>
          <div className="flex items-center gap-3 text-xs font-display">
            <span className="text-secondary font-bold">+{totalEarned} 🪙</span>
            <span className="text-destructive font-bold">-{totalSpent} 🪙</span>
          </div>
        </div>
        <div className="h-16">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={points}>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} />
              <Line type="monotone" dataKey="earned" stroke="hsl(var(--secondary))" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="spent" stroke="hsl(var(--destructive))" strokeWidth={2} dot={false} strokeDasharray="4 2" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
