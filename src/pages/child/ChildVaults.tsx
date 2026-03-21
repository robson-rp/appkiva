import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Kivo } from '@/components/Kivo';
import { useSavingsVaults, useCreateSavingsVault, useDepositToVault, useWithdrawFromVault, useDeleteSavingsVault } from '@/hooks/use-savings-vaults';
import { useWalletBalance } from '@/hooks/use-wallet';
import { useAuth } from '@/contexts/AuthContext';

import { Plus, PiggyBank, Target, TrendingUp, Sparkles, ArrowDownToLine, ArrowUpFromLine, Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { VaultGrowthChart } from '@/components/VaultGrowthChart';
import { ConfettiCelebration } from '@/components/ConfettiCelebration';
import { VaultInterestHistory } from '@/components/VaultInterestHistory';
import { useFeatureGate, FEATURES } from '@/hooks/use-feature-gate';
import UpgradePrompt from '@/components/UpgradePrompt';
import { useT } from '@/contexts/LanguageContext';
import { BiometricPrompt } from '@/components/BiometricPrompt';

export default function ChildVaults() {
  const t = useT();
  const { user } = useAuth();
  const { allowed: vaultsAllowed, tierName, loading: gateLoading } = useFeatureGate(FEATURES.SAVINGS_VAULTS);
  const { data: dbVaults, isLoading } = useSavingsVaults(user?.profileId);
  const { data: walletBalance } = useWalletBalance();
  const createVault = useCreateSavingsVault();
  const depositToVault = useDepositToVault();
  const withdrawFromVault = useWithdrawFromVault();
  const deleteVault = useDeleteSavingsVault();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newTarget, setNewTarget] = useState('');
  const [depositDialogOpen, setDepositDialogOpen] = useState(false);
  const [depositVault, setDepositVault] = useState<{ id: string; name: string; icon: string; currentAmount: number; targetAmount: number } | null>(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [withdrawVault, setWithdrawVault] = useState<{ id: string; name: string; icon: string; currentAmount: number } | null>(null);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [confettiActive, setConfettiActive] = useState(false);
  const [confettiVault, setConfettiVault] = useState<{ name: string; icon: string } | null>(null);
  const [showBiometric, setShowBiometric] = useState(false);
  const [biometricAction, setBiometricAction] = useState<'deposit' | 'withdraw'>('deposit');

  const balance = walletBalance?.balance ?? 0;

  const vaults = dbVaults ?? [];

  const totalSaved = vaults.reduce((s, v) => s + v.currentAmount, 0);
  const totalTarget = vaults.reduce((s, v) => s + v.targetAmount, 0);

  const calcMonthlyInterest = (amount: number, rate: number) => Math.round(amount * (rate / 100));
  const calcProjection = (amount: number, rate: number, months: number) => {
    let total = amount;
    for (let i = 0; i < months; i++) total += total * (rate / 100);
    return Math.round(total);
  };

  const handleCreate = async () => {
    if (!newName || !newTarget) return;
    try {
      await createVault.mutateAsync({ name: newName, targetAmount: Number(newTarget) });
      toast(t('child.vaults.vault_created'));
      setNewName(''); setNewTarget(''); setDialogOpen(false);
    } catch { toast(t('child.vaults.vault_error')); }
  };

  const openDepositDialog = (vault: typeof depositVault) => { setDepositVault(vault); setDepositAmount(''); setDepositDialogOpen(true); };

  const handleDepositClick = () => {
    if (!depositVault || !depositAmount || Number(depositAmount) <= 0) return;
    setBiometricAction('deposit');
    setShowBiometric(true);
  };

  const handleDepositConfirmed = () => {
    if (!depositVault || !depositAmount) return;
    const amount = Number(depositAmount);
    if (amount <= 0) return;
    const willReachTarget = depositVault.targetAmount > 0 && depositVault.currentAmount < depositVault.targetAmount && (depositVault.currentAmount + amount) >= depositVault.targetAmount;
    depositToVault.mutate({ vaultId: depositVault.id, amount }, {
      onSuccess: () => {
        setDepositDialogOpen(false); setDepositAmount('');
        if (willReachTarget) { setConfettiVault({ name: depositVault.name, icon: depositVault.icon }); setConfettiActive(true); }
        setDepositVault(null);
      },
    });
  };

  const remaining = depositVault ? Math.max(0, depositVault.targetAmount - depositVault.currentAmount) : 0;
  const maxDeposit = Math.min(balance, remaining > 0 ? remaining : balance);

  const openWithdrawDialog = (vault: typeof withdrawVault) => { setWithdrawVault(vault); setWithdrawAmount(''); setWithdrawDialogOpen(true); };

  const handleWithdrawClick = () => {
    if (!withdrawVault || !withdrawAmount || Number(withdrawAmount) <= 0) return;
    setBiometricAction('withdraw');
    setShowBiometric(true);
  };

  const handleWithdrawConfirmed = () => {
    if (!withdrawVault || !withdrawAmount) return;
    const amount = Number(withdrawAmount);
    if (amount <= 0) return;
    withdrawFromVault.mutate({ vaultId: withdrawVault.id, amount }, {
      onSuccess: () => { setWithdrawDialogOpen(false); setWithdrawVault(null); setWithdrawAmount(''); },
    });
  };

  const handleBiometricVerified = () => {
    setShowBiometric(false);
    if (biometricAction === 'deposit') handleDepositConfirmed();
    else handleWithdrawConfirmed();
  };

  const maxWithdraw = withdrawVault?.currentAmount ?? 0;

  if (!vaultsAllowed && !gateLoading) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <UpgradePrompt featureName={t('child.vaults.upgrade_title')} description={t('child.vaults.upgrade_desc')} currentTier={tierName} variant="inline" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Hero Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-primary via-primary/90 to-accent text-primary-foreground">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl" />
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <PiggyBank className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm opacity-80">{t('child.vaults.total_saved')}</p>
                <h2 className="text-3xl font-display font-bold">🪙 {totalSaved}</h2>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm opacity-80">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                <span>{t('child.vaults.total_target')}: {totalTarget} KivaCoins</span>
              </div>
              <span>{t('child.vaults.wallet_balance')}: {balance} KVC</span>
            </div>
            {totalTarget > 0 && <Progress value={Math.round((totalSaved / totalTarget) * 100)} className="h-2 mt-3 bg-white/20" />}
          </CardContent>
        </Card>
      </motion.div>

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display text-xl font-bold">{t('child.vaults.title')}</h1>
          <p className="text-sm text-muted-foreground">{vaults.length} {t('child.vaults.active_vaults')}</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="rounded-xl font-display gap-1"><Plus className="h-4 w-4" /> {t('child.vaults.new_vault')}</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle className="font-display">{t('child.vaults.create_vault')}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2"><Label>{t('child.vaults.goal_name')}</Label><Input placeholder={t('child.vaults.goal_placeholder')} value={newName} onChange={e => setNewName(e.target.value)} /></div>
              <div className="space-y-2"><Label>{t('child.vaults.target_kvc')}</Label><Input type="number" placeholder="500" value={newTarget} onChange={e => setNewTarget(e.target.value)} /></div>
              <Button className="w-full rounded-xl font-display" onClick={handleCreate} disabled={createVault.isPending}>
                {createVault.isPending ? t('child.vaults.creating') : t('child.vaults.create_btn')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Growth Chart */}
      {!isLoading && vaults.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <VaultGrowthChart vaults={vaults} />
        </motion.div>
      )}

      {/* Interest History */}
      {!isLoading && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <VaultInterestHistory profileId={user?.profileId} />
        </motion.div>
      )}

      {/* Vault Cards */}
      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">{t('child.vaults.loading')}</div>
      ) : (
        <div className="space-y-4">
          {vaults.map((vault, i) => {
            const pct = vault.targetAmount > 0 ? Math.round((vault.currentAmount / vault.targetAmount) * 100) : 0;
            const goalReached = vault.targetAmount > 0 && vault.currentAmount >= vault.targetAmount;
            const monthlyInterest = calcMonthlyInterest(vault.currentAmount, vault.interestRate);
            const projection3m = calcProjection(vault.currentAmount, vault.interestRate, 3);
            const projection6m = calcProjection(vault.currentAmount, vault.interestRate, 6);
            return (
              <motion.div key={vault.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1, type: 'spring', stiffness: 300, damping: 30 }}>
                <Card className={`hover:shadow-lg transition-all duration-300 border-border/50 bg-card/80 backdrop-blur-sm hover:-translate-y-0.5 ${goalReached ? 'ring-2 ring-secondary/50 border-secondary/30' : ''}`}>
                  <CardContent className="p-5">
                    {goalReached && (
                      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="mb-3 flex items-center gap-2 bg-secondary/15 text-secondary rounded-xl px-3 py-1.5 border border-secondary/25 w-fit">
                        <span className="text-base">✅</span>
                        <span className="text-xs font-display font-bold">{t('child.vaults.goal_reached')}</span>
                        <span className="text-base">🏆</span>
                      </motion.div>
                    )}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <motion.div className="w-14 h-14 rounded-2xl bg-accent/20 flex items-center justify-center text-3xl" whileHover={{ scale: 1.1, rotate: 5 }} transition={{ type: 'spring', stiffness: 400 }}>
                          {vault.icon}
                        </motion.div>
                        <div>
                          <h3 className="font-display font-semibold text-base">{vault.name}</h3>
                          <p className="text-xs text-muted-foreground">{t('child.vaults.created_on')} {new Date(vault.createdAt).toLocaleDateString('pt-PT')}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-display font-bold text-lg text-primary">{pct}%</span>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <TrendingUp className="h-3 w-3" />
                          <span>{t('child.vaults.progress')}</span>
                        </div>
                      </div>
                    </div>
                    <Progress value={pct} className="h-3 mb-3" />
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm text-muted-foreground font-medium">🪙 {vault.currentAmount} / {vault.targetAmount}</span>
                      <div className="flex gap-2">
                        {vault.currentAmount === 0 && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" className="rounded-xl text-xs font-display h-8 gap-1 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors">
                                <Trash2 className="h-3 w-3" /> {t('child.vaults.delete')}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle className="font-display">{t('child.vaults.delete_vault')}</AlertDialogTitle>
                                <AlertDialogDescription>{t('child.vaults.delete_confirm').replace('{name}', vault.name)}</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="rounded-xl font-display">{t('common.cancel')}</AlertDialogCancel>
                                <AlertDialogAction className="rounded-xl font-display bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => deleteVault.mutate(vault.id)}>
                                  {t('common.delete')}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                        {vault.currentAmount > 0 && (
                          <Button variant="outline" size="sm" className="rounded-xl text-xs font-display h-8 gap-1 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors"
                            onClick={() => openWithdrawDialog({ id: vault.id, name: vault.name, icon: vault.icon, currentAmount: vault.currentAmount })}
                          >
                            <ArrowUpFromLine className="h-3 w-3" /> {t('child.vaults.withdraw')}
                          </Button>
                        )}
                        <Button variant="outline" size="sm" className="rounded-xl text-xs font-display h-8 gap-1 hover:bg-primary hover:text-primary-foreground transition-colors"
                          onClick={() => openDepositDialog({ id: vault.id, name: vault.name, icon: vault.icon, currentAmount: vault.currentAmount, targetAmount: vault.targetAmount })}
                        >
                          <ArrowDownToLine className="h-3 w-3" /> {t('child.vaults.deposit')}
                        </Button>
                      </div>
                    </div>

                    {/* Interest Rate Info */}
                    <div className="bg-secondary/10 rounded-xl p-3 border border-secondary/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-3.5 w-3.5 text-secondary" />
                        <span className="text-xs font-display font-bold text-secondary">{t('child.vaults.interest')}: {vault.interestRate}%{t('child.vaults.per_month')}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-card/60 rounded-lg p-2 text-center">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t('child.vaults.this_month')}</p>
                          <p className="font-display font-bold text-sm text-secondary">+{monthlyInterest} 🪙</p>
                        </div>
                        <div className="bg-card/60 rounded-lg p-2 text-center">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t('child.vaults.in_3_months')}</p>
                          <p className="font-display font-bold text-sm text-primary">{projection3m} 🪙</p>
                        </div>
                        <div className="bg-card/60 rounded-lg p-2 text-center">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t('child.vaults.in_6_months')}</p>
                          <p className="font-display font-bold text-sm text-accent-foreground">{projection6m} 🪙</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Deposit Dialog */}
      <Dialog open={depositDialogOpen} onOpenChange={setDepositDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <span className="text-2xl">{depositVault?.icon}</span>
              {t('child.vaults.deposit_in')} {depositVault?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-xl p-3 text-sm space-y-1">
              <div className="flex justify-between"><span className="text-muted-foreground">{t('child.vaults.wallet_label')}</span><span className="font-display font-bold">🪙 {balance}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">{t('child.vaults.in_vault')}</span><span className="font-display font-bold">🪙 {depositVault?.currentAmount ?? 0}</span></div>
              {remaining > 0 && <div className="flex justify-between"><span className="text-muted-foreground">{t('child.vaults.remaining_target')}</span><span className="font-display font-bold text-primary">🪙 {remaining}</span></div>}
            </div>
            <div className="space-y-2">
              <Label>{t('child.vaults.deposit_amount')}</Label>
              <Input type="number" placeholder="Ex: 10" value={depositAmount} onChange={e => setDepositAmount(e.target.value)} max={maxDeposit} min={1} />
              {maxDeposit > 0 && (
                <div className="flex gap-2">
                  {[5, 10, 25].filter(v => v <= maxDeposit).map(v => (
                    <Button key={v} variant="outline" size="sm" className="rounded-lg text-xs font-display h-7" onClick={() => setDepositAmount(String(v))}>{v} KVC</Button>
                  ))}
                  {maxDeposit > 25 && (
                    <Button variant="outline" size="sm" className="rounded-lg text-xs font-display h-7" onClick={() => setDepositAmount(String(maxDeposit))}>
                      {t('child.vaults.max')} ({maxDeposit})
                    </Button>
                  )}
                </div>
              )}
            </div>
            <Button className="w-full rounded-xl font-display gap-2" disabled={!depositAmount || Number(depositAmount) <= 0 || Number(depositAmount) > balance || depositToVault.isPending} onClick={handleDeposit}>
              {depositToVault.isPending ? t('child.vaults.depositing') : (<><ArrowDownToLine className="h-4 w-4" /> {t('child.vaults.deposit_btn')} {depositAmount ? `${depositAmount} KVC` : ''}</>)}
            </Button>
            {Number(depositAmount) > balance && <p className="text-xs text-destructive text-center">{t('child.vaults.insufficient')}</p>}
          </div>
        </DialogContent>
      </Dialog>

      {/* Withdraw Dialog */}
      <Dialog open={withdrawDialogOpen} onOpenChange={setWithdrawDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <span className="text-2xl">{withdrawVault?.icon}</span>
              {t('child.vaults.withdraw_from')} {withdrawVault?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-xl p-3 text-sm space-y-1">
              <div className="flex justify-between"><span className="text-muted-foreground">{t('child.vaults.wallet_label')}</span><span className="font-display font-bold">🪙 {balance}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">{t('child.vaults.in_vault')}</span><span className="font-display font-bold text-primary">🪙 {withdrawVault?.currentAmount ?? 0}</span></div>
            </div>
            <div className="space-y-2">
              <Label>{t('child.vaults.withdraw_amount')}</Label>
              <Input type="number" placeholder="Ex: 10" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} max={maxWithdraw} min={1} />
              {maxWithdraw > 0 && (
                <div className="flex gap-2">
                  {[5, 10, 25].filter(v => v <= maxWithdraw).map(v => (
                    <Button key={v} variant="outline" size="sm" className="rounded-lg text-xs font-display h-7" onClick={() => setWithdrawAmount(String(v))}>{v} KVC</Button>
                  ))}
                  <Button variant="outline" size="sm" className="rounded-lg text-xs font-display h-7" onClick={() => setWithdrawAmount(String(maxWithdraw))}>
                    {t('child.vaults.all')} ({maxWithdraw})
                  </Button>
                </div>
              )}
            </div>
            <Button className="w-full rounded-xl font-display gap-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground" disabled={!withdrawAmount || Number(withdrawAmount) <= 0 || Number(withdrawAmount) > maxWithdraw || withdrawFromVault.isPending} onClick={handleWithdraw}>
              {withdrawFromVault.isPending ? t('child.vaults.withdrawing') : (<><ArrowUpFromLine className="h-4 w-4" /> {t('child.vaults.withdraw_btn')} {withdrawAmount ? `${withdrawAmount} KVC` : ''}</>)}
            </Button>
            {Number(withdrawAmount) > maxWithdraw && maxWithdraw > 0 && <p className="text-xs text-destructive text-center">{t('child.vaults.exceeds_balance')}</p>}
          </div>
        </DialogContent>
      </Dialog>

      <Kivo page="vaults" />
      <ConfettiCelebration active={confettiActive} onComplete={() => setConfettiActive(false)} vaultName={confettiVault?.name} vaultIcon={confettiVault?.icon} />
    </div>
  );
}
