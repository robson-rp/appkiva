import { ParentInsightsWidget } from '@/components/parent/ParentInsightsWidget';
import { useChildren } from '@/hooks/use-children';
import { Brain } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ParentInsights() {
  const { t } = useLanguage();
  const { data: children = [], isLoading } = useChildren();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-3xl mx-auto"
    >
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Brain className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="font-display text-heading font-bold">{t('parent.insights.title')}</h1>
          <p className="text-muted-foreground text-small">{t('parent.insights.description')}</p>
        </div>
      </div>

      {!isLoading && children.length > 0 && (
        <ParentInsightsWidget
          children={children.map((c) => ({
            childId: c.childId,
            profileId: c.profileId,
            displayName: c.displayName,
            dateOfBirth: c.dateOfBirth,
          }))}
        />
      )}

      {!isLoading && children.length === 0 && (
        <p className="text-muted-foreground text-center py-12">{t('parent.dashboard.no_children')}</p>
      )}
    </motion.div>
  );
}
