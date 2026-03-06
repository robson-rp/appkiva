import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { mockTeens, mockTeenTransactions } from '@/data/mock-data';
import { SPENDING_CATEGORIES, SpendingCategory } from '@/types/kivara';
import { ArrowUpRight, ArrowDownRight, PiggyBank, Filter } from 'lucide-react';
import { useState } from 'react';
import CurrencyDisplay from '@/components/CurrencyDisplay';

export default function TeenWallet() {
  const teen = mockTeens[0];
  const [categoryFilter, setCategoryFilter] = useState<SpendingCategory | 'all'>('all');

  const filtered = categoryFilter === 'all'
    ? mockTeenTransactions
    : mockTeenTransactions.filter(t => t.category === categoryFilter);

  const income = mockTeenTransactions.filter(t => t.type === 'earned' || t.type === 'allowance').reduce((s, t) => s + t.amount, 0);
  const expenses = mockTeenTransactions.filter(t => t.type === 'spent').reduce((s, t) => s + t.amount, 0);
  const saved = mockTeenTransactions.filter(t => t.type === 'saved').reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-display font-bold text-foreground">Carteira</h1>
        <p className="text-muted-foreground text-sm">Gere o teu dinheiro como um profissional</p>
      </motion.div>

      {/* Balance Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground">Saldo disponível</p>
            <CurrencyDisplay amount={teen.balance} size="xl" className="mt-1" />
            <div className="flex justify-center gap-6 mt-4 text-sm">
              <div><CurrencyDisplay amount={income} size="sm" className="text-chart-3 font-bold" /> <span className="text-muted-foreground">recebido</span></div>
              <div><CurrencyDisplay amount={expenses} size="sm" className="text-destructive font-bold" /> <span className="text-muted-foreground">gasto</span></div>
              <div><CurrencyDisplay amount={saved} size="sm" className="text-primary font-bold" /> <span className="text-muted-foreground">poupado</span></div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Category Filters */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="flex items-center gap-2 mb-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground font-semibold">Filtrar por categoria</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              categoryFilter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            Todos
          </button>
          {Object.entries(SPENDING_CATEGORIES).map(([key, cat]) => (
            <button
              key={key}
              onClick={() => setCategoryFilter(key as SpendingCategory)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                categoryFilter === key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Transactions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-display">Transações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Sem transações nesta categoria</p>
            ) : (
              filtered.map((tx, i) => (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center justify-between py-2 border-b border-border/30 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm ${
                      tx.type === 'earned' || tx.type === 'allowance' ? 'bg-chart-3/15' : tx.type === 'saved' ? 'bg-primary/15' : 'bg-destructive/15'
                    }`}>
                      {tx.type === 'earned' || tx.type === 'allowance' ? <ArrowUpRight className="h-4 w-4 text-chart-3" /> : tx.type === 'saved' ? <PiggyBank className="h-4 w-4 text-primary" /> : <ArrowDownRight className="h-4 w-4 text-destructive" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{tx.description}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {tx.date}
                        {tx.category && ` • ${SPENDING_CATEGORIES[tx.category]?.icon} ${SPENDING_CATEGORIES[tx.category]?.label}`}
                      </p>
                    </div>
                  </div>
                  <CurrencyDisplay
                    amount={tx.amount}
                    size="sm"
                    className={`font-display font-bold ${
                      tx.type === 'earned' || tx.type === 'allowance' ? 'text-chart-3' : tx.type === 'saved' ? 'text-primary' : 'text-destructive'
                    }`}
                  />
                </motion.div>
              ))
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
