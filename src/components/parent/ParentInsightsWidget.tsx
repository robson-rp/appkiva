import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Brain, RefreshCw, AlertTriangle, Lightbulb, ThumbsUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import { differenceInYears } from 'date-fns';

interface Insight {
  emoji: string;
  title: string;
  description: string;
  type: 'positive' | 'attention' | 'suggestion';
}

interface ChildData {
  childId: string;
  profileId: string;
  displayName: string;
  dateOfBirth?: string | null;
}

interface ParentInsightsWidgetProps {
  children: ChildData[];
}

const typeStyles: Record<string, { bg: string; border: string; icon: typeof ThumbsUp }> = {
  positive: { bg: 'bg-[hsl(var(--kivara-light-green))]', border: 'border-secondary/30', icon: ThumbsUp },
  attention: { bg: 'bg-[hsl(var(--kivara-light-gold))]', border: 'border-accent/30', icon: AlertTriangle },
  suggestion: { bg: 'bg-[hsl(var(--kivara-light-blue))]', border: 'border-primary/30', icon: Lightbulb },
};

export function ParentInsightsWidget({ children }: ParentInsightsWidgetProps) {
  const { t } = useLanguage();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedChild, setSelectedChild] = useState<string>(children[0]?.profileId || '');
  const [generated, setGenerated] = useState(false);

  const generateInsights = async () => {
    const child = children.find((c) => c.profileId === selectedChild);
    if (!child) return;

    setLoading(true);
    try {
      const childAge = child.dateOfBirth
        ? differenceInYears(new Date(), new Date(child.dateOfBirth))
        : undefined;

      const { data, error } = await supabase.functions.invoke('generate-insights', {
        body: {
          childProfileId: child.profileId,
          childName: child.displayName,
          childAge,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setInsights(data.insights || []);
      setGenerated(true);
    } catch (err: any) {
      console.error('Insights error:', err);
      toast.error(t('parent.insights.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-border/50 overflow-hidden">
      <div className="h-0.5 bg-gradient-to-r from-primary via-secondary to-accent" />
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-display flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <Brain className="h-5 w-5 text-primary" />
          </div>
          {t('parent.insights.title')}
        </CardTitle>
        {generated && (
          <Button
            variant="ghost"
            size="sm"
            onClick={generateInsights}
            disabled={loading}
            className="text-small gap-1"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            {t('parent.insights.refresh')}
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {!generated && !loading && (
          <div className="text-center py-4 space-y-3">
            <p className="text-muted-foreground text-small">{t('parent.insights.description')}</p>
            {children.length > 1 && (
              <div className="flex flex-wrap gap-2 justify-center">
                {children.map((child) => (
                  <Button
                    key={child.profileId}
                    variant={selectedChild === child.profileId ? 'default' : 'outline'}
                    size="sm"
                    className="rounded-xl text-small"
                    onClick={() => setSelectedChild(child.profileId)}
                  >
                    {child.displayName}
                  </Button>
                ))}
              </div>
            )}
            <Button
              onClick={generateInsights}
              className="rounded-xl font-display gap-2"
              disabled={!selectedChild}
            >
              <Brain className="h-4 w-4" />
              {t('parent.insights.generate')}
            </Button>
          </div>
        )}

        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-muted/40">
                <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))}
            <p className="text-center text-small text-muted-foreground animate-pulse">
              {t('parent.insights.loading')}
            </p>
          </div>
        )}

        <AnimatePresence>
          {!loading && insights.map((insight, i) => {
            const style = typeStyles[insight.type] || typeStyles.suggestion;
            const Icon = style.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, type: 'spring', stiffness: 300, damping: 24 }}
                className={`flex items-start gap-3 p-3.5 rounded-xl border ${style.border} ${style.bg}/30`}
              >
                <div className={`w-10 h-10 rounded-xl ${style.bg} flex items-center justify-center shrink-0 text-lg`}>
                  {insight.emoji}
                </div>
                <div className="min-w-0">
                  <p className="font-display font-bold text-sm">{insight.title}</p>
                  <p className="text-small text-muted-foreground mt-0.5">{insight.description}</p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
