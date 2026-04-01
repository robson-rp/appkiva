import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, ChevronRight, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useT } from '@/contexts/LanguageContext';

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: string;
  date: string;
}

interface ChildRecentActivityProps {
  transactions: Transaction[];
}

function TxIcon({ type }: { type: string }) {
  if (type === 'earned' || type === 'allowance') return <ArrowDownLeft className="h-3.5 w-3.5 text-secondary" />;
  return <ArrowUpRight className="h-3.5 w-3.5 text-destructive" />;
}

export function ChildRecentActivity({ transactions }: ChildRecentActivityProps) {
  const t = useT();
  const navigate = useNavigate();

  return (
    <Card className="border border-border/50">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-display flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
          </div>
          {t('child.activity.title')}
        </CardTitle>
        <button onClick={() => navigate('/child/wallet')} className="text-xs text-primary font-semibold flex items-center gap-0.5 hover:underline">
          {t('child.activity.view_all')} <ChevronRight className="h-3 w-3" />
        </button>
      </CardHeader>
      <CardContent className="space-y-1">
        {transactions.map((tx) => (
          <div key={tx.id} className="flex items-center justify-between py-2.5 border-b border-border/30 last:border-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <TxIcon type={tx.type} />
              </div>
              <div>
                <p className="text-sm font-semibold">{tx.description}</p>
                <p className="text-xs text-muted-foreground">{tx.date}</p>
              </div>
            </div>
            <span className={`text-sm font-display font-bold ${tx.type === 'earned' || tx.type === 'allowance' ? 'text-secondary' : 'text-destructive'}`}>
              {tx.type === 'earned' || tx.type === 'allowance' ? '+' : '-'}{tx.amount}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
