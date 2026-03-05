import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { mockChildren } from '@/data/mock-data';
import { CoinDisplay } from '@/components/CoinDisplay';
import { LevelBadge } from '@/components/LevelBadge';
import { Plus, Edit, Trash2, TrendingUp, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

export default function ParentChildren() {
  const totalBalance = mockChildren.reduce((s, c) => s + c.balance, 0);

  return (
    <div className="space-y-6">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-2xl gradient-kivara p-6 text-primary-foreground">
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold">Gestão de Crianças</h1>
            <p className="text-sm text-primary-foreground/70 mt-1">Gere os perfis das tuas crianças</p>
          </div>
          <Button className="rounded-2xl font-display gap-2 bg-white/20 hover:bg-white/30 text-primary-foreground border-0 backdrop-blur-sm">
            <Plus className="h-4 w-4" /> Adicionar
          </Button>
        </div>
        <div className="relative flex items-center gap-6 mt-4">
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2">
            <Users className="h-4 w-4" />
            <span className="font-display font-bold text-lg">{mockChildren.length}</span>
            <span className="text-xs text-primary-foreground/70">crianças</span>
          </div>
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2">
            <TrendingUp className="h-4 w-4" />
            <span className="font-display font-bold text-lg">🪙 {totalBalance}</span>
            <span className="text-xs text-primary-foreground/70">saldo total</span>
          </div>
        </div>
      </motion.div>

      {/* Children Grid */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid md:grid-cols-2 gap-4">
        {mockChildren.map((child) => {
          const savingsPercent = Math.round((child.balance / (child.balance + child.weeklyAllowance * 4)) * 100);
          return (
            <motion.div key={child.id} variants={item}>
              <Card className="group hover:shadow-kivara transition-all duration-300 hover:-translate-y-1 overflow-hidden border-border/50">
                {/* Color accent bar */}
                <div className="h-1 gradient-kivara" />
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[hsl(var(--kivara-light-blue))] to-[hsl(var(--kivara-light-green))] flex items-center justify-center text-4xl shadow-sm group-hover:scale-105 transition-transform duration-300">
                      {child.avatar}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-display font-bold text-lg">{child.name}</h3>
                      <p className="text-xs text-muted-foreground">@{child.username} · PIN: {child.pin}</p>
                      <LevelBadge level={child.level} points={child.kivaPoints} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-5">
                    <div className="bg-[hsl(var(--kivara-light-blue))] rounded-2xl p-3.5 text-center">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1">Saldo</p>
                      <CoinDisplay amount={child.balance} size="sm" />
                    </div>
                    <div className="bg-[hsl(var(--kivara-light-gold))] rounded-2xl p-3.5 text-center">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1">Mesada</p>
                      <CoinDisplay amount={child.weeklyAllowance} size="sm" />
                    </div>
                  </div>

                  {/* Savings progress */}
                  <div className="mb-5">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Hábito de poupança</span>
                      <span className="text-xs font-display font-bold text-secondary">{savingsPercent}%</span>
                    </div>
                    <Progress value={savingsPercent} className="h-2 rounded-full" />
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 rounded-xl font-display gap-1.5 hover:bg-primary hover:text-primary-foreground transition-colors duration-200">
                      <Edit className="h-3.5 w-3.5" /> Editar
                    </Button>
                    <Button variant="outline" size="icon" className="rounded-xl text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors duration-200 h-9 w-9">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
