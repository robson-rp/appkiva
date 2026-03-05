import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Kivo } from '@/components/Kivo';
import { mockChildren, mockTransactions } from '@/data/mock-data';
import { ArrowUpCircle, ArrowDownCircle, PiggyBank, Coins, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import kivoImg from '@/assets/kivo.svg';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

export default function ChildWallet() {
  const child = mockChildren[0];
  const transactions = mockTransactions.filter((t) => t.childId === child.id);

  const earned = transactions.filter((t) => t.type === 'earned' || t.type === 'allowance').reduce((s, t) => s + t.amount, 0);
  const spent = transactions.filter((t) => t.type === 'spent').reduce((s, t) => s + t.amount, 0);
  const saved = transactions.filter((t) => t.type === 'saved').reduce((s, t) => s + t.amount, 0);

  const typeConfig = {
    earned: { icon: ArrowUpCircle, color: 'text-secondary', label: 'Ganho', bg: 'bg-[hsl(var(--kivara-light-green))]', sign: '+' },
    allowance: { icon: Coins, color: 'text-accent-foreground', label: 'Mesada', bg: 'bg-[hsl(var(--kivara-light-gold))]', sign: '+' },
    spent: { icon: ArrowDownCircle, color: 'text-destructive', label: 'Gasto', bg: 'bg-[hsl(var(--kivara-pink))]', sign: '-' },
    saved: { icon: PiggyBank, color: 'text-primary', label: 'Poupado', bg: 'bg-[hsl(var(--kivara-light-blue))]', sign: '-' },
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-5 max-w-2xl mx-auto pb-4">
      {/* Hero Balance */}
      <motion.div variants={item}>
        <Card className="border-0 overflow-hidden relative shadow-kivara">
          <div className="absolute inset-0 gradient-kivara" />
          <div className="absolute top-[-30%] right-[-15%] w-[55%] h-[80%] rounded-full bg-white/5 blur-3xl" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[40%] h-[60%] rounded-full bg-white/5 blur-3xl" />
          <CardContent className="relative z-10 p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="bg-white/15 backdrop-blur-sm rounded-xl p-2">
                    <Wallet className="h-4 w-4 text-white" />
                  </div>
                  <p className="text-white/70 text-sm font-body">A tua carteira</p>
                </div>
                <div className="flex items-baseline gap-2">
                  <motion.span
                    key={child.balance}
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="font-display text-5xl font-bold text-white"
                  >
                    {child.balance}
                  </motion.span>
                  <span className="text-2xl">🪙</span>
                </div>
              </div>
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <img src={kivoImg} alt="Kivo" className="w-16 h-16 drop-shadow-2xl" />
              </motion.div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-3 mt-5">
              {[
                { label: 'Ganho', value: earned, icon: TrendingUp },
                { label: 'Gasto', value: spent, icon: TrendingDown },
                { label: 'Poupado', value: saved, icon: PiggyBank },
              ].map((s) => (
                <div key={s.label} className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 text-center">
                  <s.icon className="h-3.5 w-3.5 text-white/60 mx-auto mb-1" />
                  <p className="text-[10px] text-white/50 uppercase tracking-wider font-medium">{s.label}</p>
                  <p className="font-display font-bold text-white text-lg">🪙 {s.value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Transaction History */}
      <motion.div variants={item}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-bold text-sm">📜 Histórico</h2>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">{transactions.length} movimentos</span>
        </div>
        <div className="space-y-2">
          {transactions.map((tx, i) => {
            const cfg = typeConfig[tx.type];
            return (
              <motion.div
                key={tx.id}
                variants={item}
                whileHover={{ x: 4 }}
                className="group"
              >
                <Card className="border-border/50 hover:shadow-md transition-all duration-200 overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex items-center gap-3 p-3.5">
                      <div className={`w-10 h-10 rounded-2xl ${cfg.bg} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300`}>
                        <cfg.icon className={`h-4.5 w-4.5 ${cfg.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold truncate">{tx.description}</p>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-medium ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{tx.date}</p>
                      </div>
                      <span className={`font-display font-bold text-sm shrink-0 ${tx.type === 'earned' || tx.type === 'allowance' ? 'text-secondary' : 'text-destructive'}`}>
                        {cfg.sign}{tx.amount} 🪙
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      <Kivo page="wallet" />
    </motion.div>
  );
}
