import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface TeenBudgetBarProps {
  totalSpent: number;
  monthlyBudget: number;
  budgetUsed: number;
}

export function TeenBudgetBar({ totalSpent, monthlyBudget, budgetUsed }: TeenBudgetBarProps) {
  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-display">Orçamento Mensal</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between text-xs text-muted-foreground mb-2">
          <span>{totalSpent} gasto</span>
          <span>{monthlyBudget} limite</span>
        </div>
        <Progress value={budgetUsed} className="h-3" />
        <p className="text-xs text-muted-foreground mt-2">
          Resta <span className="font-bold text-foreground">{monthlyBudget - totalSpent} 🪙</span> este mês
        </p>
      </CardContent>
    </Card>
  );
}
