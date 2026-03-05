import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { mockChildren } from '@/data/mock-data';
import { CoinDisplay } from '@/components/CoinDisplay';
import { motion } from 'framer-motion';
import { Wallet, Send, TrendingUp, Calendar } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

export default function ParentAllowance() {
  const totalWeekly = mockChildren.reduce((s, c) => s + c.weeklyAllowance, 0);
  const totalBalance = mockChildren.reduce((s, c) => s + c.balance, 0);

  const handleSend = (childName: string) => {
    toast({ title: 'Mesada enviada! 💰', description: `A mesada foi enviada para ${childName}.` });
  };

  return (
    <div className="space-y-6">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-2xl gradient-kivara p-6 text-primary-foreground">
        <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute bottom-0 right-1/4 w-60 h-20 rounded-full bg-white/5 blur-2xl" />
        <div className="relative">
          <p className="text-primary-foreground/60 text-[10px] uppercase tracking-wider font-medium">Gestão</p>
          <h1 className="font-display text-2xl font-bold mt-1">Mesada Virtual</h1>
          <p className="text-sm text-primary-foreground/60 mt-1">Define e envia a mesada semanal</p>
        </div>
        <div className="relative flex items-center gap-4 mt-4">
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2">
            <Calendar className="h-4 w-4" />
            <span className="font-display font-bold text-lg">🪙 {totalWeekly}</span>
            <span className="text-xs text-primary-foreground/60">/semana</span>
          </div>
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2">
            <TrendingUp className="h-4 w-4" />
            <span className="font-display font-bold text-lg">🪙 {totalBalance}</span>
            <span className="text-xs text-primary-foreground/60">em circulação</span>
          </div>
        </div>
      </motion.div>

      {/* Children Cards */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid md:grid-cols-2 gap-4">
        {mockChildren.map((child) => (
          <motion.div key={child.id} variants={item} whileHover={{ y: -4 }}>
            <Card className="group hover:shadow-kivara transition-all duration-300 border-border/50 overflow-hidden">
              <div className="h-1 gradient-gold" />
              <CardContent className="p-6 space-y-5">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[hsl(var(--kivara-light-gold))] to-[hsl(var(--kivara-light-blue))] flex items-center justify-center text-3xl shadow-sm group-hover:scale-110 transition-transform duration-300">
                    {child.avatar}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display font-bold text-lg">{child.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Saldo actual</span>
                      <CoinDisplay amount={child.balance} size="sm" />
                    </div>
                  </div>
                  <div className="bg-[hsl(var(--kivara-light-gold))] rounded-2xl px-3 py-2 text-center">
                    <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-medium">Mesada</p>
                    <p className="font-display font-bold text-sm">🪙 {child.weeklyAllowance}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Valor da mesada semanal (moedas)</Label>
                  <div className="flex gap-2">
                    <Input type="number" defaultValue={child.weeklyAllowance} className="rounded-xl border-border/50 focus:ring-accent" />
                    <Button className="rounded-xl font-display gap-2 bg-accent hover:bg-accent/90 text-accent-foreground shadow-sm px-5" onClick={() => handleSend(child.name)}>
                      <Send className="h-4 w-4" /> Enviar
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 rounded-xl p-3 border border-border/30">
                  <Wallet className="h-3.5 w-3.5" />
                  <span>Última mesada enviada há 3 dias</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
