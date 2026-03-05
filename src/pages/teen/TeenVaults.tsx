import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { mockVaults } from '@/data/mock-data';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const teenVaults = [
  { id: 'tvault-1', childId: 'teen-1', name: 'Portátil novo', targetAmount: 2000, currentAmount: 850, icon: '💻', createdAt: '2026-01-15', interestRate: 2 },
  { id: 'tvault-2', childId: 'teen-1', name: 'Curso de Design', targetAmount: 600, currentAmount: 320, icon: '🎨', createdAt: '2026-02-01', interestRate: 1.5 },
  { id: 'tvault-3', childId: 'teen-1', name: 'Festival de Música', targetAmount: 400, currentAmount: 180, icon: '🎵', createdAt: '2026-02-20', interestRate: 1 },
];

export default function TeenVaults() {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Cofres</h1>
          <p className="text-muted-foreground text-sm">Poupa para os teus objectivos</p>
        </div>
        <Button size="sm" className="rounded-xl gap-1">
          <Plus className="h-4 w-4" /> Novo
        </Button>
      </motion.div>

      <div className="space-y-3">
        {teenVaults.map((vault, i) => {
          const pct = (vault.currentAmount / vault.targetAmount) * 100;
          return (
            <motion.div key={vault.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-xl">
                        {vault.icon}
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-foreground">{vault.name}</h3>
                        <p className="text-[10px] text-muted-foreground">📈 {vault.interestRate}% juros/mês</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-display font-bold text-foreground">{vault.currentAmount} 🪙</p>
                      <p className="text-[10px] text-muted-foreground">de {vault.targetAmount}</p>
                    </div>
                  </div>
                  <Progress value={pct} className="h-2" />
                  <p className="text-[10px] text-muted-foreground mt-1">{Math.round(pct)}% concluído</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
