import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useSavingsVaults, useCreateSavingsVault, useDepositToVault, useWithdrawFromVault } from '@/hooks/use-savings-vaults';
import { useWalletBalance } from '@/hooks/use-wallet';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Sparkles, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import { VaultGrowthChart } from '@/components/VaultGrowthChart';
import { VaultInterestHistory } from '@/components/VaultInterestHistory';
import { ConfettiCelebration } from '@/components/ConfettiCelebration';

const calcMonthlyInterest = (amount: number, rate: number) =>
  Math.round(amount * (rate / 100));

const calcProjection = (amount: number, rate: number, months: number) =>
  Math.round(amount * Math.pow(1 + rate / 100, months));

const teenVaultsFallback = [
  { id: 'tvault-1', profileId: '', householdId: null, name: 'Portátil novo', targetAmount: 2000, currentAmount: 850, icon: '💻', createdAt: '2026-01-15', interestRate: 2 },
  { id: 'tvault-2', profileId: '', householdId: null, name: 'Curso de Design', targetAmount: 600, currentAmount: 320, icon: '🎨', createdAt: '2026-02-01', interestRate: 1.5 },
  { id: 'tvault-3', profileId: '', householdId: null, name: 'Festival de Música', targetAmount: 400, currentAmount: 180, icon: '🎵', createdAt: '2026-02-20', interestRate: 1 },
];

export default function TeenVaults() {
  const { user } = useAuth();
  const { data: dbVaults, isLoading } = useSavingsVaults(user?.profileId);
  const { data: walletBalance } = useWalletBalance();
  const createVault = useCreateSavingsVault();
  const depositToVault = useDepositToVault();
  const withdrawFromVault = useWithdrawFromVault();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newTarget, setNewTarget] = useState('');

  // Deposit dialog
  const [depositDialogOpen, setDepositDialogOpen] = useState(false);
  const [depositVault, setDepositVault] = useState<{ id: string; name: string; icon: string; currentAmount: number; targetAmount: number } | null>(null);
  const [depositAmount, setDepositAmount] = useState('');

  // Withdraw dialog
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [withdrawVault, setWithdrawVault] = useState<{ id: string; name: string; icon: string; currentAmount: number } | null>(null);
  const [withdrawAmount, setWithdrawAmount] = useState('');

  // Confetti
  const [confettiActive, setConfettiActive] = useState(false);
  const [confettiVault, setConfettiVault] = useState<{ name: string; icon: string } | null>(null);

  const balance = walletBalance?.balance ?? 0;
  const vaults = (dbVaults && dbVaults.length > 0) ? dbVaults : teenVaultsFallback;

  const handleCreate = async () => {
    if (!newName || !newTarget) return;
    try {
      await createVault.mutateAsync({ name: newName, targetAmount: Number(newTarget) });
      toast.success('Cofre criado!');
      setNewName(''); setNewTarget(''); setDialogOpen(false);
    } catch { toast.error('Erro ao criar cofre'); }
  };

  const openDepositDialog = (vault: typeof depositVault) => {
    setDepositVault(vault);
    setDepositAmount('');
    setDepositDialogOpen(true);
  };

  const handleDeposit = () => {
    if (!depositVault || !depositAmount) return;
    const amount = Number(depositAmount);
    if (amount <= 0) return;

    const willReachTarget = depositVault.targetAmount > 0 &&
      depositVault.currentAmount < depositVault.targetAmount &&
      (depositVault.currentAmount + amount) >= depositVault.targetAmount;

    depositToVault.mutate(
      { vaultId: depositVault.id, amount },
      {
        onSuccess: () => {
          setDepositDialogOpen(false);
          setDepositAmount('');
          if (willReachTarget) {
            setConfettiVault({ name: depositVault.name, icon: depositVault.icon });
            setConfettiActive(true);
          }
          setDepositVault(null);
        },
      }
    );
  };

  const remaining = depositVault ? Math.max(0, depositVault.targetAmount - depositVault.currentAmount) : 0;
  const maxDeposit = Math.min(balance, remaining > 0 ? remaining : balance);

  const openWithdrawDialog = (vault: typeof withdrawVault) => {
    setWithdrawVault(vault);
    setWithdrawAmount('');
    setWithdrawDialogOpen(true);
  };

  const handleWithdraw = () => {
    if (!withdrawVault || !withdrawAmount) return;
    const amount = Number(withdrawAmount);
    if (amount <= 0) return;
    withdrawFromVault.mutate(
      { vaultId: withdrawVault.id, amount },
      {
        onSuccess: () => {
          setWithdrawDialogOpen(false);
          setWithdrawVault(null);
          setWithdrawAmount('');
        },
      }
    );
  };

  const maxWithdraw = withdrawVault?.currentAmount ?? 0;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Cofres</h1>
          <p className="text-muted-foreground text-sm">Poupa para os teus objectivos • Carteira: {balance} 🪙</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="rounded-xl gap-1"><Plus className="h-4 w-4" /> Novo</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle className="font-display">Criar Novo Cofre</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2"><Label>Nome</Label><Input placeholder="Ex: Portátil novo" value={newName} onChange={e => setNewName(e.target.value)} /></div>
              <div className="space-y-2"><Label>Meta (KivaCoins)</Label><Input type="number" placeholder="1000" value={newTarget} onChange={e => setNewTarget(e.target.value)} /></div>
              <Button className="w-full rounded-xl font-display" onClick={handleCreate} disabled={createVault.isPending}>
                {createVault.isPending ? 'A criar...' : 'Criar Cofre'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Growth Chart */}
      {!isLoading && vaults.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <VaultGrowthChart vaults={vaults} />
        </motion.div>
      )}

      {/* Interest History */}
      {!isLoading && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <VaultInterestHistory profileId={user?.profileId} />
        </motion.div>
      )}

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">A carregar cofres...</div>
      ) : (
        <div className="space-y-3">
          {vaults.map((vault, i) => {
            const pct = vault.targetAmount > 0 ? (vault.currentAmount / vault.targetAmount) * 100 : 0;
            const monthlyInterest = calcMonthlyInterest(vault.currentAmount, vault.interestRate);
            const projection3m = calcProjection(vault.currentAmount, vault.interestRate, 3);
            const projection6m = calcProjection(vault.currentAmount, vault.interestRate, 6);
            return (
              <motion.div key={vault.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-xl">{vault.icon}</div>
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
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-[10px] text-muted-foreground">{Math.round(pct)}% concluído</p>
                      <div className="flex gap-1.5">
                        {vault.currentAmount > 0 && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-xl text-xs font-display h-7 gap-1 px-2 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors"
                            onClick={() => openWithdrawDialog({
                              id: vault.id, name: vault.name, icon: vault.icon, currentAmount: vault.currentAmount,
                            })}
                          >
                            <ArrowUpFromLine className="h-3 w-3" /> Levantar
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-xl text-xs font-display h-7 gap-1 px-2 hover:bg-primary hover:text-primary-foreground transition-colors"
                          onClick={() => openDepositDialog({
                            id: vault.id, name: vault.name, icon: vault.icon,
                            currentAmount: vault.currentAmount, targetAmount: vault.targetAmount,
                          })}
                        >
                          <ArrowDownToLine className="h-3 w-3" /> Depositar
                        </Button>
                      </div>
                    </div>

                    {/* Interest projections */}
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-secondary" />
                        <span className="text-xs font-display font-bold text-secondary">Projeção de juros</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-muted/50 rounded-lg p-2 text-center">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Este mês</p>
                          <p className="font-display font-bold text-sm text-secondary">+{monthlyInterest} 🪙</p>
                        </div>
                        <div className="bg-muted/50 rounded-lg p-2 text-center">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Em 3 meses</p>
                          <p className="font-display font-bold text-sm text-primary">{projection3m} 🪙</p>
                        </div>
                        <div className="bg-muted/50 rounded-lg p-2 text-center">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Em 6 meses</p>
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
              Depositar em {depositVault?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-xl p-3 text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Saldo da carteira</span>
                <span className="font-display font-bold">🪙 {balance}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">No cofre</span>
                <span className="font-display font-bold">🪙 {depositVault?.currentAmount ?? 0}</span>
              </div>
              {remaining > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Falta para a meta</span>
                  <span className="font-display font-bold text-primary">🪙 {remaining}</span>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>Montante a depositar</Label>
              <Input type="number" placeholder="Ex: 10" value={depositAmount} onChange={e => setDepositAmount(e.target.value)} max={maxDeposit} min={1} />
              {maxDeposit > 0 && (
                <div className="flex gap-2">
                  {[5, 10, 25, 50].filter(v => v <= maxDeposit).map(v => (
                    <Button key={v} variant="outline" size="sm" className="rounded-lg text-xs font-display h-7" onClick={() => setDepositAmount(String(v))}>
                      {v} KVC
                    </Button>
                  ))}
                  {maxDeposit > 50 && (
                    <Button variant="outline" size="sm" className="rounded-lg text-xs font-display h-7" onClick={() => setDepositAmount(String(maxDeposit))}>
                      Máx ({maxDeposit})
                    </Button>
                  )}
                </div>
              )}
            </div>
            <Button
              className="w-full rounded-xl font-display gap-2"
              disabled={!depositAmount || Number(depositAmount) <= 0 || Number(depositAmount) > balance || depositToVault.isPending}
              onClick={handleDeposit}
            >
              {depositToVault.isPending ? 'A depositar...' : (<><ArrowDownToLine className="h-4 w-4" /> Depositar {depositAmount ? `${depositAmount} KVC` : ''}</>)}
            </Button>
            {Number(depositAmount) > balance && <p className="text-xs text-destructive text-center">Saldo insuficiente!</p>}
          </div>
        </DialogContent>
      </Dialog>

      {/* Withdraw Dialog */}
      <Dialog open={withdrawDialogOpen} onOpenChange={setWithdrawDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <span className="text-2xl">{withdrawVault?.icon}</span>
              Levantar de {withdrawVault?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-xl p-3 text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Saldo da carteira</span>
                <span className="font-display font-bold">🪙 {balance}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">No cofre</span>
                <span className="font-display font-bold text-primary">🪙 {withdrawVault?.currentAmount ?? 0}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Montante a levantar</Label>
              <Input type="number" placeholder="Ex: 10" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} max={maxWithdraw} min={1} />
              {maxWithdraw > 0 && (
                <div className="flex gap-2">
                  {[5, 10, 25, 50].filter(v => v <= maxWithdraw).map(v => (
                    <Button key={v} variant="outline" size="sm" className="rounded-lg text-xs font-display h-7" onClick={() => setWithdrawAmount(String(v))}>
                      {v} KVC
                    </Button>
                  ))}
                  <Button variant="outline" size="sm" className="rounded-lg text-xs font-display h-7" onClick={() => setWithdrawAmount(String(maxWithdraw))}>
                    Tudo ({maxWithdraw})
                  </Button>
                </div>
              )}
            </div>
            <Button
              className="w-full rounded-xl font-display gap-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              disabled={!withdrawAmount || Number(withdrawAmount) <= 0 || Number(withdrawAmount) > maxWithdraw || withdrawFromVault.isPending}
              onClick={handleWithdraw}
            >
              {withdrawFromVault.isPending ? 'A levantar...' : (<><ArrowUpFromLine className="h-4 w-4" /> Levantar {withdrawAmount ? `${withdrawAmount} KVC` : ''}</>)}
            </Button>
            {Number(withdrawAmount) > maxWithdraw && maxWithdraw > 0 && (
              <p className="text-xs text-destructive text-center">Montante excede o saldo do cofre!</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <ConfettiCelebration
        active={confettiActive}
        onComplete={() => setConfettiActive(false)}
        vaultName={confettiVault?.name}
        vaultIcon={confettiVault?.icon}
      />
    </div>
  );
}
