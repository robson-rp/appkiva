import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Vault {
  id: string;
  name: string;
  icon: string;
  currentAmount: number;
  targetAmount: number;
  interestRate: number;
}

interface ChildSavingsProgressProps {
  vaults: Vault[];
}

export function ChildSavingsProgress({ vaults }: ChildSavingsProgressProps) {
  const navigate = useNavigate();

  if (vaults.length === 0) return null;

  return (
    <Card className="border border-border/50">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-display flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-secondary/10 flex items-center justify-center">
            <TrendingUp className="h-3.5 w-3.5 text-secondary" />
          </div>
          Poupanças
        </CardTitle>
        <button onClick={() => navigate('/child/vaults')} className="text-xs text-primary font-semibold flex items-center gap-0.5 hover:underline">
          Ver cofres <ChevronRight className="h-3 w-3" />
        </button>
      </CardHeader>
      <CardContent className="space-y-3">
        {vaults.map((vault) => {
          const pct = Math.round((vault.currentAmount / vault.targetAmount) * 100);
          const monthlyInterest = Math.round(vault.currentAmount * (vault.interestRate / 100));
          return (
            <div key={vault.id} className="space-y-1.5">
              <div className="flex justify-between items-center text-sm">
                <span className="font-semibold flex items-center gap-1.5">
                  <span className="text-base">{vault.icon}</span> {vault.name}
                </span>
                <div className="flex items-center gap-2">
                  <motion.span
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-[10px] text-secondary font-display font-bold bg-secondary/10 px-1.5 py-0.5 rounded-md"
                  >
                    +{monthlyInterest}/mês
                  </motion.span>
                  <span className="text-xs text-muted-foreground font-display font-bold">
                    {vault.currentAmount}/{vault.targetAmount} 🪙
                  </span>
                </div>
              </div>
              <div className="relative">
                <Progress value={pct} className="h-3 rounded-full" />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-bold text-primary-foreground drop-shadow">
                  {pct}%
                </span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
