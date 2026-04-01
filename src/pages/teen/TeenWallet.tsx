import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SPENDING_CATEGORIES, SpendingCategory } from '@/types/kivara';
import { ArrowUpRight, ArrowDownRight, PiggyBank, Filter } from 'lucide-react';
import { useState } from 'react';
import CurrencyDisplay from '@/components/CurrencyDisplay';
import { useLanguage } from '@/contexts/LanguageContext';
import { useWalletBalance, useWalletTransactions } from '@/hooks/use-wallet';

export default function TeenWallet() {
  const { t } = useLanguage();
  const { data: walletBalance } = useWalletBalance();
  const { data: ledgerTx = [] } = useWalletTransactions(undefined, 50);
  const [categoryFilter, setCategoryFilter] = useState<SpendingCategory | 'all'>('all');

  const balance = walletBalance?.balance ?? 0;

  const mapType = (tx: { entry_type: string; direction: string }) => {
    switch (tx.entry_type) {
      case 'allowance': return 'allowance';
      case 'task_reward': case 'mission_reward': return 'earned';
      case 'purchase': return 'spent';
      case 'vault_deposit': case 'vault_interest': return 'saved';
      case 'donation': return 'donated';
      default: return tx.direction === 'credit' ? 'earned' : 'spent';
    }
  };

  const transactions = ledgerTx.map(tx => ({
    id: tx.id,
    description: tx.description,
    amount: tx.amount,
    type: mapType(tx) as 'earned' | 'allowance' | 'spent' | 'saved' | 'donated',
    date: new Date(tx.created_at).toLocaleDateString('pt-PT'),
    category: (tx.metadata as any)?.category as SpendingCategory | undefined,
  }));

  const filtered = categoryFilter === 'all'
    ? transactions
    : transactions.filter(t => t.category === categoryFilter);

  const income = transactions.filter(t => t.type === 'earned' || t.type === 'allowance').reduce((s, t) => s + t.amount, 0);
  const expenses = transactions.filter(t => t.type === 'spent').reduce((s, t) => s + t.amount, 0);
  const saved = transactions.filter(t => t.type === 'saved').reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-display font-bold text-foreground">{t('teen.wallet.title')}</h1>
        <p className="text-muted-foreground text-sm">{t('child.wallet.balance')}</p>
      </motion.div>

      {/* Balance Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground">{t('child.wallet.balance')}</p>
            <CurrencyDisplay amount={balance} size="xl" className="mt-1" />
            <div className="flex justify-center gap-6 mt-4 text-sm">
              <div><CurrencyDisplay amount={income} size="sm" className="text-chart-3 font-bold" /> <span className="text-muted-foreground">{t('common.balance')}</span></div>
              <div><CurrencyDisplay amount={expenses} size="sm" className="text-destructive font-bold" /> <span className="text-muted-foreground">{t('tx.purchase')}</span></div>
              <div><CurrencyDisplay amount={saved} size="sm" className="text-primary font-bold" /> <span className="text-muted-foreground">{t('tx.vault_deposit')}</span></div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Category Filters */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="flex items-center gap-2 mb-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground font-semibold">{t('common.filter')}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              categoryFilter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {t('common.view_all')}
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
            <CardTitle className="text-sm font-display">{t('parent.dashboard.transactions')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">{t('common.no_data')}</p>
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
                      <p className="text-xs text-muted-foreground">
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
