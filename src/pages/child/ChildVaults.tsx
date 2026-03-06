import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Kivo } from '@/components/Kivo';
import { useSavingsVaults, useCreateSavingsVault, useDepositToVault } from '@/hooks/use-savings-vaults';
import { useWalletBalance } from '@/hooks/use-wallet';
import { useAuth } from '@/contexts/AuthContext';
import { mockVaults, mockChildren } from '@/data/mock-data';
import { Plus, PiggyBank, Target, TrendingUp, Sparkles, ArrowDownToLine } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function ChildVaults() {
  const { user } = useAuth();
  const { data: dbVaults, isLoading } = useSavingsVaults(user?.profileId);
  const { data: walletBalance } = useWalletBalance();
  const createVault = useCreateSavingsVault();
  const depositToVault = useDepositToVault();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newTarget, setNewTarget] = useState('');

  // Deposit dialog state
  const [depositDialogOpen, setDepositDialogOpen] = useState(false);
  const [depositVault, setDepositVault] = useState<{ id: string; name: string; icon: string; currentAmount: number; targetAmount: number } | null>(null);
  const [depositAmount, setDepositAmount] = useState('');

  const balance = walletBalance?.balance ?? 0;

  // Fallback to mock data if no DB vaults
  const child = mockChildren[0];
  const mockFallback = mockVaults.filter((v) => v.childId === child.id).map(v => ({
    id: v.id, profileId: '', householdId: null, name: v.name, icon: v.icon,
    targetAmount: v.targetAmount, currentAmount: v.currentAmount, interestRate: v.interestRate, createdAt: v.createdAt,
  }));
  const vaults = (dbVaults && dbVaults.length > 0) ? dbVaults : mockFallback;

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
    depositToVault.mutate(
      { vaultId: depositVault.id, amount },
      {
        onSuccess: () => {
          setDepositDialogOpen(false);
          setDepositVault(null);
          setDepositAmount('');
        },
      }
    );
  };

  const remaining = depositVault ? Math.max(0, depositVault.targetAmount - depositVault.currentAmount) : 0;
  const maxDeposit = Math.min(balance, remaining > 0 ? remaining : balance);

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
                <p className="text-sm opacity-80">Total Poupado</p>
                <h2 className="text-3xl font-display font-bold">🪙 {totalSaved}</h2>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm opacity-80">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                <span>Meta total: {totalTarget} KivaCoins</span>
              </div>
              <span>Carteira: {balance} KVC</span>
            </div>
            {totalTarget > 0 && <Progress value={Math.round((totalSaved / totalTarget) * 100)} className="h-2 mt-3 bg-white/20" />}
          </CardContent>
        </Card>
      </motion.div>

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display text-xl font-bold">Cofres de Poupança</h1>
          <p className="text-sm text-muted-foreground">{vaults.length} cofres activos</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="rounded-xl font-display gap-1">
              <Plus className="h-4 w-4" /> Novo Cofre
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display">Criar Novo Cofre</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nome do objectivo</Label>
                <Input placeholder="Ex: Bicicleta nova" value={newName} onChange={e => setNewName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Meta (KivaCoins)</Label>
                <Input type="number" placeholder="500" value={newTarget} onChange={e => setNewTarget(e.target.value)} />
              </div>
              <Button className="w-full rounded-xl font-display" onClick={handleCreate} disabled={createVault.isPending}>
                {createVault.isPending ? 'A criar...' : 'Criar Cofre'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Vault Cards */}
      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">A carregar cofres...</div>
      ) : (
        <div className="space-y-4">
          {vaults.map((vault, i) => {
            const pct = vault.targetAmount > 0 ? Math.round((vault.currentAmount / vault.targetAmount) * 100) : 0;
            const monthlyInterest = calcMonthlyInterest(vault.currentAmount, vault.interestRate);
            const projection3m = calcProjection(vault.currentAmount, vault.interestRate, 3);
            return (
              <motion.div key={vault.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1, type: 'spring', stiffness: 300, damping: 30 }}>
                <Card className="hover:shadow-lg transition-all duration-300 border-border/50 bg-card/80 backdrop-blur-sm hover:-translate-y-0.5">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <motion.div className="w-14 h-14 rounded-2xl bg-accent/20 flex items-center justify-center text-3xl" whileHover={{ scale: 1.1, rotate: 5 }} transition={{ type: 'spring', stiffness: 400 }}>
                          {vault.icon}
                        </motion.div>
                        <div>
                          <h3 className="font-display font-semibold text-base">{vault.name}</h3>
                          <p className="text-xs text-muted-foreground">Criado em {new Date(vault.createdAt).toLocaleDateString('pt-PT')}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-display font-bold text-lg text-primary">{pct}%</span>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <TrendingUp className="h-3 w-3" />
                          <span>progresso</span>
                        </div>
                      </div>
                    </div>
                    <Progress value={pct} className="h-3 mb-3" />
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm text-muted-foreground font-medium">🪙 {vault.currentAmount} / {vault.targetAmount}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl text-xs font-display h-8 gap-1 hover:bg-primary hover:text-primary-foreground transition-colors"
                        onClick={() => openDepositDialog({
                          id: vault.id,
                          name: vault.name,
                          icon: vault.icon,
                          currentAmount: vault.currentAmount,
                          targetAmount: vault.targetAmount,
                        })}
                      >
                        <ArrowDownToLine className="h-3 w-3" /> Depositar
                      </Button>
                    </div>

                    {/* Interest Rate Info */}
                    <div className="bg-secondary/10 rounded-xl p-3 border border-secondary/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-3.5 w-3.5 text-secondary" />
                        <span className="text-xs font-display font-bold text-secondary">Juros: {vault.interestRate}%/mês</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-card/60 rounded-lg p-2 text-center">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Este mês</p>
                          <p className="font-display font-bold text-sm text-secondary">+{monthlyInterest} 🪙</p>
                        </div>
                        <div className="bg-card/60 rounded-lg p-2 text-center">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Em 3 meses</p>
                          <p className="font-display font-bold text-sm text-primary">{projection3m} 🪙</p>
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
              <Input
                type="number"
                placeholder="Ex: 10"
                value={depositAmount}
                onChange={e => setDepositAmount(e.target.value)}
                max={maxDeposit}
                min={1}
              />
              {maxDeposit > 0 && (
                <div className="flex gap-2">
                  {[5, 10, 25].filter(v => v <= maxDeposit).map(v => (
                    <Button
                      key={v}
                      variant="outline"
                      size="sm"
                      className="rounded-lg text-xs font-display h-7"
                      onClick={() => setDepositAmount(String(v))}
                    >
                      {v} KVC
                    </Button>
                  ))}
                  {maxDeposit > 25 && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-lg text-xs font-display h-7"
                      onClick={() => setDepositAmount(String(maxDeposit))}
                    >
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
              {depositToVault.isPending ? (
                'A depositar...'
              ) : (
                <>
                  <ArrowDownToLine className="h-4 w-4" />
                  Depositar {depositAmount ? `${depositAmount} KVC` : ''}
                </>
              )}
            </Button>

            {Number(depositAmount) > balance && (
              <p className="text-xs text-destructive text-center">Saldo insuficiente!</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Kivo page="vaults" />
    </div>
  );
}
