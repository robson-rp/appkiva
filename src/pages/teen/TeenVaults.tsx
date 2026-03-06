import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useSavingsVaults, useCreateSavingsVault } from '@/hooks/use-savings-vaults';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Sparkles } from 'lucide-react';

const calcMonthlyInterest = (amount: number, rate: number) =>
  Math.round(amount * (rate / 100));

const calcProjection = (amount: number, rate: number, months: number) =>
  Math.round(amount * Math.pow(1 + rate / 100, months));
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const teenVaultsFallback = [
  { id: 'tvault-1', profileId: '', householdId: null, name: 'Portátil novo', targetAmount: 2000, currentAmount: 850, icon: '💻', createdAt: '2026-01-15', interestRate: 2 },
  { id: 'tvault-2', profileId: '', householdId: null, name: 'Curso de Design', targetAmount: 600, currentAmount: 320, icon: '🎨', createdAt: '2026-02-01', interestRate: 1.5 },
  { id: 'tvault-3', profileId: '', householdId: null, name: 'Festival de Música', targetAmount: 400, currentAmount: 180, icon: '🎵', createdAt: '2026-02-20', interestRate: 1 },
];

export default function TeenVaults() {
  const { user } = useAuth();
  const { data: dbVaults, isLoading } = useSavingsVaults(user?.profileId);
  const createVault = useCreateSavingsVault();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newTarget, setNewTarget] = useState('');

  const vaults = (dbVaults && dbVaults.length > 0) ? dbVaults : teenVaultsFallback;

  const handleCreate = async () => {
    if (!newName || !newTarget) return;
    try {
      await createVault.mutateAsync({ name: newName, targetAmount: Number(newTarget) });
      toast.success('Cofre criado!');
      setNewName(''); setNewTarget(''); setDialogOpen(false);
    } catch { toast.error('Erro ao criar cofre'); }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Cofres</h1>
          <p className="text-muted-foreground text-sm">Poupa para os teus objectivos</p>
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
                    <p className="text-[10px] text-muted-foreground mt-1">{Math.round(pct)}% concluído</p>

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
    </div>
  );
}
