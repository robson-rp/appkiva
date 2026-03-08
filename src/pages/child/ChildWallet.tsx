import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Kivo } from '@/components/Kivo';
import { mockChildren } from '@/data/mock-data';
import { ArrowUpCircle, ArrowDownCircle, PiggyBank, Coins, TrendingUp, TrendingDown, Wallet, Heart, HandHeart, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import kivoImg from '@/assets/kivo.svg';
import { useWalletBalance, useWalletTransactions } from '@/hooks/use-wallet';
import CurrencyDisplay from '@/components/CurrencyDisplay';
import { useDonationCauses, useMyDonations, useDonate } from '@/hooks/use-donations';
import { useT } from '@/contexts/LanguageContext';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

export default function ChildWallet() {
  const t = useT();
  const child = mockChildren[0];
  const { data: walletBalance } = useWalletBalance();
  const { data: ledgerTx } = useWalletTransactions();
  const balance = walletBalance?.balance ?? child.balance;

  // Real donations data
  const { data: causes = [] } = useDonationCauses();
  const { data: myDonations = [] } = useMyDonations();
  const donateMutation = useDonate();

  const totalDonated = myDonations.reduce((s, d) => s + d.amount, 0);
  const uniqueCauses = new Set(myDonations.map(d => d.causeId)).size;
  const [selectedCause, setSelectedCause] = useState<string | null>(null);
  const [donateAmount, setDonateAmount] = useState('');
  const [donateDialogOpen, setDonateDialogOpen] = useState(false);

  const mapTxType = (tx: { entry_type: string; direction: string }): string => {
    switch (tx.entry_type) {
      case 'vault_deposit': return 'saved';
      case 'vault_withdraw': return 'earned';
      case 'vault_interest': return 'saved';
      case 'allowance': return 'allowance';
      case 'purchase': return 'spent';
      case 'donation': return 'donated';
      default: return tx.direction === 'credit' ? 'earned' : 'spent';
    }
  };

  const transactions = ledgerTx && ledgerTx.length > 0
    ? ledgerTx
        .filter(tx => tx.entry_type !== 'vault_interest')
        .map(tx => ({
          id: tx.id,
          childId: child.id,
          description: tx.entry_type === 'vault_deposit'
            ? `${t('child.wallet.saving_vault')}: ${(tx.metadata as any)?.vault_name ?? 'Cofre'}`
            : tx.entry_type === 'vault_withdraw'
            ? `${t('child.wallet.withdrawal_vault')}: ${(tx.metadata as any)?.vault_name ?? 'Cofre'}`
            : tx.description,
          amount: tx.amount,
          type: mapTxType(tx) as 'earned' | 'spent' | 'saved' | 'allowance' | 'donated',
          date: new Date(tx.created_at).toLocaleDateString('pt-PT'),
        }))
    : [];

  const earned = transactions.filter((t) => t.type === 'earned' || t.type === 'allowance').reduce((s, t) => s + t.amount, 0);
  const spent = transactions.filter((t) => t.type === 'spent').reduce((s, t) => s + t.amount, 0);
  const saved = transactions.filter((t) => (t as any).type === 'saved').reduce((s, t) => s + t.amount, 0);

  const typeConfig: Record<string, any> = {
    earned: { icon: ArrowUpCircle, color: 'text-secondary', label: t('child.wallet.earned'), bg: 'bg-[hsl(var(--kivara-light-green))]', sign: '+' },
    allowance: { icon: Coins, color: 'text-accent-foreground', label: t('child.wallet.allowance'), bg: 'bg-[hsl(var(--kivara-light-gold))]', sign: '+' },
    spent: { icon: ArrowDownCircle, color: 'text-destructive', label: t('child.wallet.spent'), bg: 'bg-[hsl(var(--kivara-pink))]', sign: '-' },
    saved: { icon: PiggyBank, color: 'text-primary', label: t('child.wallet.saved'), bg: 'bg-[hsl(var(--kivara-light-blue))]', sign: '-' },
    donated: { icon: Heart, color: 'text-destructive', label: t('child.wallet.donated'), bg: 'bg-[hsl(var(--kivara-pink))]', sign: '-' },
  };

  const handleDonate = () => {
    const amount = parseInt(donateAmount);
    if (!selectedCause || !amount || amount <= 0) return;
    donateMutation.mutate(
      { causeId: selectedCause, amount },
      {
        onSuccess: () => {
          setSelectedCause(null);
          setDonateAmount('');
          setDonateDialogOpen(false);
        },
      }
    );
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
                   <p className="text-white/70 text-sm font-body">{t('child.wallet.your_wallet')}</p>
                </div>
                <div className="flex items-baseline gap-2">
                  <motion.span
                    key={balance}
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="font-display text-5xl font-bold text-white"
                  >
                    {balance}
                  </motion.span>
                  <span className="text-lg text-white/70 font-display font-medium">KivaCoins</span>
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
                  <p className="font-display font-bold text-white text-lg">
                    <CurrencyDisplay amount={s.value} size="lg" className="text-white" />
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Donation Impact Card */}
      <motion.div variants={item}>
        <Card className="border-border/50 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-pink-500 to-purple-500" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[hsl(var(--kivara-pink))]/20 flex items-center justify-center">
                  <HandHeart className="h-4 w-4 text-destructive" />
                </div>
                <h2 className="font-display font-bold text-sm">Impacto Solidário</h2>
              </div>
              <Dialog open={donateDialogOpen} onOpenChange={setDonateDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="rounded-xl font-display gap-1 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white border-0">
                    <Heart className="h-3.5 w-3.5" /> Doar
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="font-display flex items-center gap-2">
                      <Heart className="h-5 w-5 text-destructive" /> Fazer uma Doação
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    {causes.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">Sem causas disponíveis de momento.</p>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {causes.map((cause) => (
                          <motion.button
                            key={cause.id}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => setSelectedCause(cause.id)}
                            className={`p-3 rounded-xl border-2 text-left transition-all ${
                              selectedCause === cause.id
                                ? 'border-primary bg-primary/10'
                                : 'border-border/50 hover:border-primary/30'
                            }`}
                          >
                            <span className="text-2xl block mb-1">{cause.icon}</span>
                            <p className="font-display font-bold text-xs">{cause.name}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{cause.description}</p>
                          </motion.button>
                        ))}
                      </div>
                    )}
                    <div className="space-y-2">
                      <p className="text-xs font-medium">Quanto queres doar? (KivaCoins)</p>
                      <Input
                        type="number"
                        placeholder="Ex: 10"
                        value={donateAmount}
                        onChange={(e) => setDonateAmount(e.target.value)}
                        className="rounded-xl"
                      />
                    </div>
                    <Button
                      className="w-full rounded-xl font-display gap-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white border-0"
                      onClick={handleDonate}
                      disabled={!selectedCause || !donateAmount || donateMutation.isPending}
                    >
                      {donateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Heart className="h-4 w-4" />}
                      {donateMutation.isPending ? 'A processar...' : 'Confirmar Doação'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted/40 rounded-xl p-3 text-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total doado</p>
                <CurrencyDisplay amount={totalDonated} size="lg" className="font-display font-bold text-lg" />
              </div>
              <div className="bg-muted/40 rounded-xl p-3 text-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Causas apoiadas</p>
                <p className="font-display font-bold text-lg">💜 {uniqueCauses}</p>
              </div>
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
          {transactions.length === 0 ? (
            <Card className="border-border/50">
              <CardContent className="py-8 text-center">
                <p className="text-sm text-muted-foreground">Sem movimentos ainda</p>
              </CardContent>
            </Card>
          ) : transactions.map((tx) => {
            const cfg = typeConfig[tx.type] || typeConfig.earned;
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
                      <CurrencyDisplay
                        amount={tx.amount}
                        size="sm"
                        className={`font-display font-bold shrink-0 ${tx.type === 'earned' || tx.type === 'allowance' ? 'text-secondary' : 'text-destructive'}`}
                      />
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
