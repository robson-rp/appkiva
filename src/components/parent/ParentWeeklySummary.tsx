import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import CurrencyDisplay from '@/components/CurrencyDisplay';
import { CalendarDays, CheckCircle, Target, TrendingUp, TrendingDown, Flame, RefreshCw, PiggyBank } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

interface ChildSummary {
  profileId: string;
  displayName: string;
  avatar: string;
  balance: number;
  weeklyNetChange: number;
  tasksCompleted: number;
  tasksEarned: number;
  missionsCompleted: number;
  missionsActive: number;
  missionsEarned: number;
  totalSaved: number;
  currentStreak: number;
  longestStreak: number;
}

interface ParentWeeklySummaryProps {
  householdId: string | null;
}

export function ParentWeeklySummary({ householdId }: ParentWeeklySummaryProps) {
  const { t } = useLanguage();
  const [summaries, setSummaries] = useState<ChildSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const fetchSummary = async () => {
    if (!householdId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('weekly-summary', {
        body: { householdId },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setSummaries(data.children || []);
      setLoaded(true);
    } catch (err: any) {
      console.error('Weekly summary error:', err);
      toast.error(t('parent.weekly.error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (householdId) fetchSummary();
  }, [householdId]);

  if (!householdId) return null;

  return (
    <Card className="border-border/50 overflow-hidden">
      <div className="h-0.5 bg-gradient-to-r from-secondary via-primary to-accent" />
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-display flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-secondary/10 flex items-center justify-center">
            <CalendarDays className="h-5 w-5 text-secondary" />
          </div>
          {t('parent.weekly.title')}
        </CardTitle>
        {loaded && (
          <Button variant="ghost" size="sm" onClick={fetchSummary} disabled={loading} className="text-small gap-1">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            {t('parent.weekly.refresh')}
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {loading && !loaded && (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="p-4 rounded-xl bg-muted/40 space-y-2">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-xl" />
                  <Skeleton className="h-5 w-28" />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Skeleton className="h-14 rounded-lg" />
                  <Skeleton className="h-14 rounded-lg" />
                  <Skeleton className="h-14 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        )}

        {loaded && summaries.length === 0 && (
          <p className="text-center text-muted-foreground text-small py-4">
            {t('parent.weekly.no_data')}
          </p>
        )}

        {loaded && summaries.map((child, idx) => (
          <motion.div
            key={child.profileId}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="p-4 rounded-xl bg-muted/30 border border-border/40 space-y-3"
          >
            {/* Child header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(var(--kivara-light-blue))] to-[hsl(var(--kivara-light-green))] flex items-center justify-center text-xl shadow-sm">
                  {child.avatar}
                </div>
                <div>
                  <p className="font-display font-bold text-sm">{child.displayName}</p>
                  <div className="flex items-center gap-1 text-small text-muted-foreground">
                    <Flame className="h-3.5 w-3.5 text-accent-foreground" />
                    {child.currentStreak} {t('parent.weekly.days_streak')}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <CurrencyDisplay amount={child.balance} size="sm" className="font-display font-bold" />
                <div className={`flex items-center gap-0.5 text-small font-medium justify-end ${child.weeklyNetChange >= 0 ? 'text-secondary' : 'text-destructive'}`}>
                  {child.weeklyNetChange >= 0 ? (
                    <TrendingUp className="h-3.5 w-3.5" />
                  ) : (
                    <TrendingDown className="h-3.5 w-3.5" />
                  )}
                  {child.weeklyNetChange >= 0 ? '+' : ''}{child.weeklyNetChange} KVC
                </div>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-background/60 rounded-lg p-2.5 text-center border border-border/30">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <CheckCircle className="h-3.5 w-3.5 text-secondary" />
                </div>
                <p className="font-display font-bold text-base">{child.tasksCompleted}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{t('parent.weekly.tasks')}</p>
              </div>
              <div className="bg-background/60 rounded-lg p-2.5 text-center border border-border/30">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Target className="h-3.5 w-3.5 text-primary" />
                </div>
                <p className="font-display font-bold text-base">{child.missionsCompleted}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{t('parent.weekly.missions')}</p>
              </div>
              <div className="bg-background/60 rounded-lg p-2.5 text-center border border-border/30">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <PiggyBank className="h-3.5 w-3.5 text-accent-foreground" />
                </div>
                <CurrencyDisplay amount={child.totalSaved} size="sm" className="font-display font-bold" />
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{t('parent.weekly.saved')}</p>
              </div>
            </div>

            {/* Earnings summary */}
            <div className="flex items-center justify-between text-small text-muted-foreground bg-background/40 rounded-lg px-3 py-2 border border-border/20">
              <span>{t('parent.weekly.earned_this_week')}</span>
              <CurrencyDisplay amount={child.tasksEarned + child.missionsEarned} size="sm" className="font-display font-bold text-secondary" />
            </div>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}
