import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownRight, PiggyBank } from 'lucide-react';
import { SPENDING_CATEGORIES } from '@/types/kivara';

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: string;
  date: string;
  category?: string;
}

interface TeenRecentTransactionsProps {
  transactions: Transaction[];
}

export function TeenRecentTransactions({ transactions }: TeenRecentTransactionsProps) {
  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-display">Últimas Transações</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {transactions.map((tx) => (
          <div key={tx.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm ${
                tx.type === 'earned' || tx.type === 'allowance' ? 'bg-chart-3/15' : tx.type === 'saved' ? 'bg-primary/15' : 'bg-destructive/15'
              }`}>
                {tx.type === 'earned' || tx.type === 'allowance' ? <ArrowUpRight className="h-4 w-4 text-chart-3" /> : tx.type === 'saved' ? <PiggyBank className="h-4 w-4 text-primary" /> : <ArrowDownRight className="h-4 w-4 text-destructive" />}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{tx.description}</p>
                <p className="text-[10px] text-muted-foreground">{tx.date}{tx.category ? ` • ${SPENDING_CATEGORIES[tx.category]?.label}` : ''}</p>
              </div>
            </div>
            <span className={`font-display font-bold text-sm ${
              tx.type === 'earned' || tx.type === 'allowance' ? 'text-chart-3' : tx.type === 'saved' ? 'text-primary' : 'text-destructive'
            }`}>
              {tx.type === 'spent' || tx.type === 'donated' ? '-' : '+'}{tx.amount}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
