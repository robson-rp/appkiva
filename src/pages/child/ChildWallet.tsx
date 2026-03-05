import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CoinDisplay } from '@/components/CoinDisplay';
import { Kivo } from '@/components/Kivo';
import { mockChildren, mockTransactions } from '@/data/mock-data';
import { ArrowUpCircle, ArrowDownCircle, PiggyBank, Coins } from 'lucide-react';

export default function ChildWallet() {
  const child = mockChildren[0];
  const transactions = mockTransactions.filter((t) => t.childId === child.id);

  const earned = transactions.filter((t) => t.type === 'earned' || t.type === 'allowance').reduce((s, t) => s + t.amount, 0);
  const spent = transactions.filter((t) => t.type === 'spent').reduce((s, t) => s + t.amount, 0);
  const saved = transactions.filter((t) => t.type === 'saved').reduce((s, t) => s + t.amount, 0);

  const typeConfig = {
    earned: { icon: ArrowUpCircle, color: 'text-secondary', label: 'Ganho', bg: 'bg-kivara-light-green' },
    allowance: { icon: Coins, color: 'text-accent', label: 'Mesada', bg: 'bg-kivara-light-gold' },
    spent: { icon: ArrowDownCircle, color: 'text-destructive', label: 'Gasto', bg: 'bg-kivara-pink' },
    saved: { icon: PiggyBank, color: 'text-primary', label: 'Poupado', bg: 'bg-kivara-light-blue' },
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="gradient-kivara text-white border-0">
          <CardContent className="p-6 text-center">
            <p className="text-white/70 text-sm mb-2">Saldo Total</p>
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-4xl">🪙</span>
              <span className="font-display text-5xl font-bold">{child.balance}</span>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="text-center">
                <p className="text-white/60 text-xs">Ganho</p>
                <p className="font-display font-bold">{earned}</p>
              </div>
              <div className="text-center">
                <p className="text-white/60 text-xs">Gasto</p>
                <p className="font-display font-bold">{spent}</p>
              </div>
              <div className="text-center">
                <p className="text-white/60 text-xs">Poupado</p>
                <p className="font-display font-bold">{saved}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-display">Histórico</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {transactions.map((tx) => {
            const cfg = typeConfig[tx.type];
            return (
              <div key={tx.id} className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl ${cfg.bg} flex items-center justify-center`}>
                  <cfg.icon className={`h-4 w-4 ${cfg.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{tx.description}</p>
                  <p className="text-xs text-muted-foreground">{tx.date}</p>
                </div>
                <span className={`font-display font-bold text-sm ${tx.type === 'spent' || tx.type === 'saved' ? 'text-destructive' : 'text-secondary'}`}>
                  {tx.type === 'spent' || tx.type === 'saved' ? '-' : '+'}{tx.amount}
                </span>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Kivo page="wallet" />
    </div>
  );
}
