import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SPENDING_CATEGORIES, SpendingCategory } from '@/types/kivara';
import { useT } from '@/contexts/LanguageContext';

interface TeenCategoryBreakdownProps {
  topCategories: [string, number][];
  totalSpent: number;
}

export function TeenCategoryBreakdown({ topCategories, totalSpent }: TeenCategoryBreakdownProps) {
  const t = useT();
  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-display">{t('teen.category_breakdown')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {topCategories.map(([cat, amount]) => {
          const config = SPENDING_CATEGORIES[cat as SpendingCategory];
          const pct = (amount / totalSpent) * 100;
          return (
            <div key={cat}>
              <div className="flex justify-between items-center text-sm mb-1">
                <span>{config.icon} {config.label}</span>
                <span className="font-bold">{amount} 🪙</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="h-full rounded-full bg-primary"
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
