import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, PiggyBank, Target, Medal } from 'lucide-react';
import { mockChildren, mockVaults, mockDonations } from '@/data/mock-data';

export function ChildFamilyRankings() {
  const rankings = mockChildren.map((c) => {
    const childVaults = mockVaults.filter((v) => v.childId === c.id);
    const totalSaved = childVaults.reduce((s, v) => s + v.currentAmount, 0);
    const childDonations = mockDonations.filter((d) => d.childId === c.id);
    const totalDonated = childDonations.reduce((s, d) => s + d.amount, 0);
    return { ...c, totalSaved, totalDonated };
  });

  const bestSaver = [...rankings].sort((a, b) => b.totalSaved - a.totalSaved);
  const bestDonor = [...rankings].sort((a, b) => b.totalDonated - a.totalDonated);
  const bestPlanner = [...rankings].sort((a, b) => b.kivaPoints - a.kivaPoints);

  const categories = [
    { title: '🏆 Poupador', data: bestSaver, metric: (c: any) => `${c.totalSaved} 🪙`, icon: PiggyBank },
    { title: '🎯 Planeador', data: bestPlanner, metric: (c: any) => `${c.kivaPoints} pts`, icon: Target },
    { title: '💜 Doador', data: bestDonor, metric: (c: any) => `${c.totalDonated} 🪙`, icon: Medal },
  ];

  return (
    <Card className="border border-border/50 overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-accent via-chart-1 to-destructive" />
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-display flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[hsl(var(--kivara-light-gold))] flex items-center justify-center">
            <Crown className="h-3.5 w-3.5 text-accent-foreground" />
          </div>
          Ranking Familiar
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2">
          {categories.map((cat) => (
            <motion.div
              key={cat.title}
              whileHover={{ scale: 1.01 }}
              className="bg-muted/40 rounded-xl p-3 text-center border border-border/30"
            >
              <p className="text-[10px] font-display font-bold mb-2">{cat.title}</p>
              {cat.data.slice(0, 2).map((c, i) => (
                <div key={c.id} className={`flex items-center gap-1.5 justify-center mb-1 ${i === 0 ? 'text-foreground' : 'text-muted-foreground'}`}>
                  <span className="text-xs">{i === 0 ? '🥇' : '🥈'}</span>
                  <span className="text-lg">{c.avatar}</span>
                  <div className="text-left">
                    <p className={`text-[10px] font-bold ${i === 0 ? '' : 'font-normal'}`}>{c.name}</p>
                    <p className="text-[9px] text-muted-foreground">{cat.metric(c)}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
