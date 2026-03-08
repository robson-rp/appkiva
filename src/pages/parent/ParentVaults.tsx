import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { PiggyBank, Sparkles, TrendingUp, Settings2, Trash2, Users, Plus } from 'lucide-react';
import { useChildren } from '@/hooks/use-children';
import { useHouseholdVaults, useUpdateVaultInterestRate, useDeleteSavingsVault, useCreateSavingsVault } from '@/hooks/use-savings-vaults';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { createNotification } from '@/hooks/use-notifications';
import { useFeatureGate, FEATURES } from '@/hooks/use-feature-gate';
import UpgradePrompt from '@/components/UpgradePrompt';
import { useT } from '@/contexts/LanguageContext';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

export default function ParentVaults() {
  const t = useT();
  const { allowed: vaultsAllowed, tierName, loading: gateLoading } = useFeatureGate(FEATURES.SAVINGS_VAULTS);
  const { data: children = [], isLoading: childrenLoading } = useChildren();
  const { data: allVaults = [], isLoading: vaultsLoading } = useHouseholdVaults();
  const updateRate = useUpdateVaultInterestRate();
  const deleteVault = useDeleteSavingsVault();
  const createVault = useCreateSavingsVault();

  const [rateDialogOpen, setRateDialogOpen] = useState(false);
  const [editVault, setEditVault] = useState<{ id: string; name: string; icon: string; interestRate: number } | null>(null);
  const [newRate, setNewRate] = useState(1);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newVaultName, setNewVaultName] = useState('');
  const [newVaultTarget, setNewVaultTarget] = useState('');
  const [newVaultRate, setNewVaultRate] = useState(1);
  const [newVaultChild, setNewVaultChild] = useState('');
  const [newVaultIcon, setNewVaultIcon] = useState('🐷');

  const isLoading = childrenLoading || vaultsLoading;
  const childMap = new Map(children.map(c => [c.profileId, c]));

  const vaultsByChild = new Map<string, typeof allVaults>();
  for (const v of allVaults) {
    const list = vaultsByChild.get(v.profileId) ?? [];
    list.push(v);
    vaultsByChild.set(v.profileId, list);
  }

  const totalSaved = allVaults.reduce((s, v) => s + v.currentAmount, 0);
  const totalTarget = allVaults.reduce((s, v) => s + v.targetAmount, 0);

  const openRateDialog = (vault: { id: string; name: string; icon: string; interestRate: number }) => {
    setEditVault(vault); setNewRate(vault.interestRate); setRateDialogOpen(true);
  };

  const handleSaveRate = () => {
    if (!editVault) return;
    updateRate.mutate({ vaultId: editVault.id, interestRate: newRate }, {
      onSuccess: () => {
        setRateDialogOpen(false);
        toast({ title: t('parent.vaults.rate_updated'), description: t('parent.vaults.rate_desc').replace('{rate}', String(newRate)) });
        const vault = allVaults.find(v => v.id === editVault.id);
        if (vault) createNotification({ profileId: vault.profileId, title: t('parent.vaults.rate_updated'), message: `${editVault.name}: ${newRate}%${t('parent.vaults.per_month')}`, type: 'vault', metadata: { vaultId: editVault.id, newRate } });
      },
    });
  };

  const handleCreateVault = async () => {
    if (!newVaultName.trim() || !newVaultTarget || !newVaultChild) return;
    const target = Number(newVaultTarget);
    if (target <= 0) return;
    try {
      await createVault.mutateAsync({ name: newVaultName.trim().slice(0, 100), icon: newVaultIcon, targetAmount: target, interestRate: newVaultRate, profileId: newVaultChild });
      toast({ title: t('parent.vaults.vault_created'), description: t('parent.vaults.vault_created_desc').replace('{name}', newVaultName) });
      createNotification({ profileId: newVaultChild, title: t('parent.vaults.vault_created'), message: `${newVaultName} — ${target} 🪙`, type: 'vault', metadata: { vaultName: newVaultName, targetAmount: target, interestRate: newVaultRate } });
      setCreateDialogOpen(false); setNewVaultName(''); setNewVaultTarget(''); setNewVaultRate(1); setNewVaultChild(''); setNewVaultIcon('🐷');
    } catch {
      toast({ title: t('common.error'), description: t('parent.vaults.create_error'), variant: 'destructive' });
    }
  };

  if (!vaultsAllowed && !gateLoading) {
    return (
      <div className="max-w-3xl mx-auto py-12">
        <UpgradePrompt featureName={t('parent.vaults.title')} description={t('parent.vaults.subtitle')} currentTier={tierName} variant="inline" />
      </div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-5xl mx-auto">
      {/* Hero */}
      <motion.div variants={item}>
        <Card className="border-0 overflow-hidden relative shadow-kivara">
          <div className="absolute inset-0 gradient-kivara" />
          <div className="absolute top-[-30%] right-[-10%] w-[45%] h-[80%] rounded-full bg-white/5 blur-3xl" />
          <CardContent className="relative z-10 p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-2">
                <p className="text-primary-foreground/60 text-xs font-medium uppercase tracking-wider">{t('parent.vaults.management')}</p>
                <h1 className="font-display text-2xl md:text-3xl font-bold text-primary-foreground flex items-center gap-3">
                  <PiggyBank className="h-7 w-7" /> {t('parent.vaults.title')}
                </h1>
                <p className="text-primary-foreground/60 text-sm max-w-md">{t('parent.vaults.subtitle')}</p>
                {children.length > 0 && (
                  <Button size="sm" className="rounded-2xl font-display gap-1.5 bg-white/15 hover:bg-white/25 text-primary-foreground border-0 backdrop-blur-sm shadow-lg mt-2" onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4" /> {t('parent.vaults.create')}
                  </Button>
                )}
              </div>
              <div className="flex gap-3">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-3 text-center">
                  <p className="text-primary-foreground/60 text-[10px] uppercase tracking-wider font-medium">{t('parent.vaults.total_saved')}</p>
                  <p className="font-display text-2xl font-bold text-primary-foreground mt-1">{totalSaved} <span className="text-base">🪙</span></p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-3 text-center">
                  <p className="text-primary-foreground/60 text-[10px] uppercase tracking-wider font-medium">{t('parent.vaults.vault_count')}</p>
                  <p className="font-display text-2xl font-bold text-primary-foreground mt-1">{allVaults.length}</p>
                </div>
              </div>
            </div>
            {totalTarget > 0 && (
              <div className="mt-4">
                <div className="flex justify-between text-xs text-primary-foreground/60 mb-1">
                  <span>{t('parent.vaults.total_progress')}</span>
                  <span>{Math.round((totalSaved / totalTarget) * 100)}%</span>
                </div>
                <Progress value={Math.round((totalSaved / totalTarget) * 100)} className="h-2 bg-white/20" />
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Vaults by Child */}
      {isLoading ? (
        <div className="space-y-4">{[1, 2].map(i => (<Card key={i} className="border-border/50"><CardContent className="p-6 space-y-3"><div className="flex items-center gap-3"><Skeleton className="w-12 h-12 rounded-2xl" /><Skeleton className="h-5 w-32" /></div><Skeleton className="h-24 rounded-xl" /></CardContent></Card>))}</div>
      ) : allVaults.length === 0 ? (
        <motion.div variants={item}>
          <Card className="border-border/50"><CardContent className="p-12 text-center"><div className="text-5xl mb-4">🐷</div><h3 className="font-display font-bold text-lg mb-2">{t('parent.vaults.no_vaults')}</h3><p className="text-sm text-muted-foreground">{t('parent.vaults.no_vaults_hint')}</p></CardContent></Card>
        </motion.div>
      ) : (
        Array.from(vaultsByChild.entries()).map(([profileId, vaults]) => {
          const child = childMap.get(profileId);
          return (
            <motion.div key={profileId} variants={item}>
              <Card className="border-border/50 overflow-hidden">
                <div className="h-1 gradient-kivara" />
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-display flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[hsl(var(--kivara-light-blue))] to-[hsl(var(--kivara-light-green))] flex items-center justify-center text-xl shadow-sm">{child?.avatar ?? '👧'}</div>
                    <div>
                      <span className="text-base font-bold">{child?.displayName ?? t('nav.parent.children')}</span>
                      <p className="text-[10px] text-muted-foreground font-normal">{vaults.length} {t('parent.vaults.vault_count').toLowerCase()} · {vaults.reduce((s, v) => s + v.currentAmount, 0)} 🪙 {t('parent.vaults.total_label')}</p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {vaults.map((vault) => {
                    const pct = vault.targetAmount > 0 ? Math.round((vault.currentAmount / vault.targetAmount) * 100) : 0;
                    const goalReached = vault.targetAmount > 0 && vault.currentAmount >= vault.targetAmount;
                    const monthlyInterest = Math.round(vault.currentAmount * (vault.interestRate / 100));
                    return (
                      <div key={vault.id} className={`rounded-2xl border p-4 transition-all duration-200 ${goalReached ? 'border-secondary/40 bg-secondary/5 ring-1 ring-secondary/20' : 'border-border/50 bg-muted/30'}`}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center text-xl">{vault.icon}</div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-display font-bold text-sm">{vault.name}</h4>
                                {goalReached && <span className="text-[10px] font-display font-bold text-secondary bg-secondary/15 px-2 py-0.5 rounded-full border border-secondary/25">{t('parent.vaults.goal_reached')}</span>}
                              </div>
                              <p className="text-[10px] text-muted-foreground">{t('parent.vaults.created_on')} {new Date(vault.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-display font-bold text-sm">{vault.currentAmount} / {vault.targetAmount} 🪙</p>
                            <p className="text-[10px] text-muted-foreground">{pct}% {t('parent.vaults.completed')}</p>
                          </div>
                        </div>
                        <Progress value={pct} className="h-2 mb-3" />
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1"><Sparkles className="h-3 w-3 text-secondary" /><span className="font-display font-bold text-secondary">{vault.interestRate}%{t('parent.vaults.per_month')}</span></div>
                            {monthlyInterest > 0 && <span className="text-muted-foreground">→ +{monthlyInterest} 🪙{t('parent.vaults.per_month')}</span>}
                          </div>
                          <div className="flex gap-1.5">
                            <Button variant="outline" size="sm" className="rounded-xl text-xs font-display h-7 gap-1 px-2 hover:bg-primary hover:text-primary-foreground transition-colors" onClick={() => openRateDialog({ id: vault.id, name: vault.name, icon: vault.icon, interestRate: vault.interestRate })}>
                              <Settings2 className="h-3 w-3" /> {t('parent.vaults.interest')}
                            </Button>
                            {vault.currentAmount === 0 && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="sm" className="rounded-xl text-xs font-display h-7 gap-1 px-2 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors">
                                    <Trash2 className="h-3 w-3" /> {t('parent.vaults.delete')}
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="font-display">{t('parent.vaults.delete_vault')}</AlertDialogTitle>
                                    <AlertDialogDescription>{t('parent.vaults.delete_vault_desc').replace('{name}', vault.name).replace('{child}', child?.displayName ?? '')}</AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel className="rounded-xl font-display">{t('common.cancel')}</AlertDialogCancel>
                                    <AlertDialogAction className="rounded-xl font-display bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => deleteVault.mutate(vault.id)}>{t('common.delete')}</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </motion.div>
          );
        })
      )}

      {/* Interest Rate Dialog */}
      <Dialog open={rateDialogOpen} onOpenChange={setRateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <span className="text-2xl">{editVault?.icon}</span>
              {t('parent.vaults.adjust_interest')} — {editVault?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="bg-muted/50 rounded-xl p-4 text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{t('parent.vaults.interest_rate')}</p>
              <p className="font-display text-4xl font-bold text-primary">{newRate}%</p>
            </div>
            <div className="space-y-3">
              <Slider value={[newRate]} onValueChange={([v]) => setNewRate(v)} min={0} max={10} step={0.5} className="py-2" />
              <div className="flex justify-between text-[10px] text-muted-foreground"><span>0%</span><span>5%</span><span>10%</span></div>
            </div>
            <Button className="w-full rounded-xl font-display gap-2" onClick={handleSaveRate} disabled={updateRate.isPending}>
              <Sparkles className="h-4 w-4" />
              {updateRate.isPending ? t('profile.saving') : t('common.save')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Vault Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" /> {t('parent.vaults.create')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t('parent.vaults.for_child')}</Label>
              <Select value={newVaultChild} onValueChange={setNewVaultChild}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder={t('parent.vaults.select_child')} /></SelectTrigger>
                <SelectContent>{children.map((c) => (<SelectItem key={c.profileId} value={c.profileId}><span className="flex items-center gap-2"><span>{c.avatar}</span> {c.displayName}</span></SelectItem>))}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('parent.vaults.vault_name')}</Label>
              <Input placeholder="Ex: ..." value={newVaultName} onChange={e => setNewVaultName(e.target.value)} maxLength={100} className="rounded-xl" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>{t('parent.vaults.target_amount')} (KVC)</Label>
                <Input type="number" placeholder="500" value={newVaultTarget} onChange={e => setNewVaultTarget(e.target.value)} min={1} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>{t('parent.vaults.icon')}</Label>
                <div className="flex gap-1.5 flex-wrap">
                  {['🐷', '🎯', '🚲', '📱', '🎮', '📚', '✈️', '🎸'].map((icon) => (
                    <button key={icon} type="button" onClick={() => setNewVaultIcon(icon)} className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all ${newVaultIcon === icon ? 'bg-primary/15 ring-2 ring-primary scale-110' : 'bg-muted/50 hover:bg-muted'}`}>{icon}</button>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">{t('parent.vaults.interest_monthly')}: {newVaultRate}%</Label>
              <Slider value={[newVaultRate]} onValueChange={([v]) => setNewVaultRate(v)} min={0} max={10} step={0.5} className="py-2" />
              <div className="flex justify-between text-[10px] text-muted-foreground"><span>0%</span><span>5%</span><span>10%</span></div>
            </div>
            <Button className="w-full rounded-xl font-display gap-2" onClick={handleCreateVault} disabled={createVault.isPending || !newVaultChild || !newVaultName.trim() || !newVaultTarget}>
              <PiggyBank className="h-4 w-4" />
              {createVault.isPending ? t('common.creating') : t('parent.vaults.create')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
