import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useT } from '@/contexts/LanguageContext';

interface TeenBudgetBarProps {
  totalSpent: number;
  monthlyBudget: number;
  budgetUsed: number;
}

export function TeenBudgetBar({ totalSpent, monthlyBudget, budgetUsed }: TeenBudgetBarProps) {
  const t = useT();
  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-display">{t('teen.monthly_budget')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between text-xs text-muted-foreground mb-2">
          <span>{t('teen.spent').replace('{amount}', String(totalSpent))}</span>
          <span>{t('teen.limit').replace('{amount}', String(monthlyBudget))}</span>
        </div>
        <Progress value={budgetUsed} className="h-3" />
        <p className="text-xs text-muted-foreground mt-2">
          {t('teen.remaining')} <span className="font-bold text-foreground">{monthlyBudget - totalSpent} 🪙</span> {t('teen.this_month')}
        </p>
      </CardContent>
    </Card>
  );
}
