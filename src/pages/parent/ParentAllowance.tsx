import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { CoinDisplay } from '@/components/CoinDisplay';
import { motion } from 'framer-motion';
import { Wallet, Send, TrendingUp, Calendar, Zap, Target, ListTodo, Settings, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useChildren } from '@/hooks/use-children';
import { useHouseholdTasks } from '@/hooks/use-household-tasks';
import { useAllowanceConfigs, useUpsertAllowanceConfig, useUpdateLastSent, type AllowanceConfig } from '@/hooks/use-allowance-configs';
import { createTransaction } from '@/lib/ledger-api';
import { useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { pt } from 'date-fns/locale';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

const DEFAULT_CONFIG: Omit<AllowanceConfig, 'id' | 'childProfileId' | 'parentProfileId' | 'lastSentAt'> = {
  baseAmount: 25,
  frequency: 'weekly',
  taskBonus: 5,
  missionBonus: 10,
};

export default function ParentAllowance() {
  const { data: children = [], isLoading: loadingChildren } = useChildren();
  const { data: configs = [], isLoading: loadingConfigs } = useAllowanceConfigs();
  const { data: tasks = [] } = useHouseholdTasks();
  const upsertConfig = useUpsertAllowanceConfig();
  const updateLastSent = useUpdateLastSent();
  const queryClient = useQueryClient();

  const [configOpen, setConfigOpen] = useState<string | null>(null);
  const [editConfig, setEditConfig] = useState<typeof DEFAULT_CONFIG>(DEFAULT_CONFIG);
  const [sendingFor, setSendingFor] = useState<string | null>(null);

  const isLoading = loadingChildren || loadingConfigs;

  const getConfig = (childProfileId: string) =>
    configs.find(c => c.childProfileId === childProfileId) ?? null;

  const getEffective = (childProfileId: string) => {
    const cfg = getConfig(childProfileId);
    return cfg ?? { ...DEFAULT_CONFIG, lastSentAt: null as string | null };
  };

  const totalWeekly = children.reduce((s, c) => s + getEffective(c.profileId).baseAmount, 0);
  const totalBalance = children.reduce((s, c) => s + c.balance, 0);

  const openConfig = (childProfileId: string) => {
    const eff = getEffective(childProfileId);
    setEditConfig({ baseAmount: eff.baseAmount, frequency: eff.frequency, taskBonus: eff.taskBonus, missionBonus: eff.missionBonus });
    setConfigOpen(childProfileId);
  };

  const saveConfig = () => {
    if (!configOpen) return;
    upsertConfig.mutate(
      { childProfileId: configOpen, ...editConfig },
      { onSuccess: () => setConfigOpen(null) }
    );
  };

  const handleSend = async (childProfileId: string) => {
    const child = children.find(c => c.profileId === childProfileId);
    if (!child) return;

    const eff = getEffective(childProfileId);
    const completedTasks = tasks.filter(t => t.childProfileId === childProfileId && (t.status === 'completed' || t.status === 'approved')).length;
    const taskBonusTotal = completedTasks * eff.taskBonus;
    // missions not yet in DB, so missionBonus = 0 for now
    const total = eff.baseAmount + taskBonusTotal;

    setSendingFor(childProfileId);
    try {
      const result = await createTransaction({
        entry_type: 'allowance',
        amount: total,
        description: `Mesada ${eff.frequency === 'weekly' ? 'semanal' : 'mensal'}`,
        target_profile_id: childProfileId,
      });

      // Update last_sent_at
      const cfg = getConfig(childProfileId);
      if (cfg) updateLastSent.mutate(cfg.id);

      queryClient.invalidateQueries({ queryKey: ['children'] });
      queryClient.invalidateQueries({ queryKey: ['wallet-balance'] });
      queryClient.invalidateQueries({ queryKey: ['household-transactions'] });

      toast({
        title: 'Mesada enviada! 💰',
        description: `${child.displayName} recebeu ${total} KivaCoins (base: ${eff.baseAmount} + bónus: ${taskBonusTotal}). Novo saldo: ${result.new_balance} KVC.`,
      });
    } catch (err: any) {
      toast({ title: 'Erro ao enviar mesada', description: err.message, variant: 'destructive' });
    } finally {
      setSendingFor(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 rounded-2xl" />
        <div className="grid md:grid-cols-2 gap-4">
          <Skeleton className="h-72 rounded-2xl" />
          <Skeleton className="h-72 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-2xl gradient-kivara p-6 text-primary-foreground">
        <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute bottom-0 right-1/4 w-60 h-20 rounded-full bg-white/5 blur-2xl" />
        <div className="relative">
          <p className="text-primary-foreground/60 text-[10px] uppercase tracking-wider font-medium">Gestão</p>
          <h1 className="font-display text-2xl font-bold mt-1">Mesada Inteligente</h1>
          <p className="text-sm text-primary-foreground/60 mt-1">Base + bónus por tarefas e missões</p>
        </div>
        <div className="relative flex flex-wrap items-center gap-2 sm:gap-4 mt-4">
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-3 sm:px-4 py-2">
            <Calendar className="h-4 w-4" />
            <span className="font-display font-bold text-base sm:text-lg">🪙 {totalWeekly}</span>
            <span className="text-[10px] sm:text-xs text-primary-foreground/60">base/sem</span>
          </div>
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-3 sm:px-4 py-2">
            <TrendingUp className="h-4 w-4" />
            <span className="font-display font-bold text-base sm:text-lg">🪙 {totalBalance}</span>
            <span className="text-[10px] sm:text-xs text-primary-foreground/60">em circulação</span>
          </div>
        </div>
      </motion.div>

      {/* Children Cards */}
      {children.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center text-3xl mx-auto mb-4">👶</div>
            <p className="font-display font-bold text-sm">Sem crianças registadas</p>
            <p className="text-xs text-muted-foreground mt-1">Adiciona uma criança para configurar a mesada.</p>
          </CardContent>
        </Card>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show" className="grid md:grid-cols-2 gap-4">
          {children.map((child) => {
            const eff = getEffective(child.profileId);
            const completedTasks = tasks.filter(t => t.childProfileId === child.profileId && (t.status === 'completed' || t.status === 'approved')).length;
            const taskBonusTotal = completedTasks * eff.taskBonus;
            const missionBonusTotal = 0; // missions not yet in DB
            const totalAllowance = eff.baseAmount + taskBonusTotal + missionBonusTotal;
            const isSending = sendingFor === child.profileId;

            return (
              <motion.div key={child.profileId} variants={item} whileHover={{ y: -4 }}>
                <Card className="group hover:shadow-kivara transition-all duration-300 border-border/50 overflow-hidden">
                  <div className="h-1 gradient-gold" />
                  <CardContent className="p-6 space-y-5">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[hsl(var(--kivara-light-gold))] to-[hsl(var(--kivara-light-blue))] flex items-center justify-center text-3xl shadow-sm group-hover:scale-110 transition-transform duration-300">
                        {child.avatar}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-display font-bold text-lg">{child.displayName}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Saldo actual</span>
                          <CoinDisplay amount={child.balance} size="sm" />
                        </div>
                      </div>
                    </div>

                    {/* Allowance Breakdown */}
                    <div className="bg-muted/30 rounded-2xl p-4 border border-border/30 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium flex items-center gap-1">
                          <Zap className="h-3 w-3" /> Composição da mesada
                        </span>
                        <span className="font-display font-bold text-sm text-secondary">🪙 {totalAllowance}</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <Wallet className="h-3 w-3" /> Base ({eff.frequency === 'weekly' ? 'semanal' : 'mensal'})
                          </span>
                          <span className="font-display font-bold text-xs">🪙 {eff.baseAmount}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <ListTodo className="h-3 w-3" /> Bónus tarefas ({completedTasks} × {eff.taskBonus})
                          </span>
                          <span className="font-display font-bold text-xs text-secondary">+{taskBonusTotal}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <Target className="h-3 w-3" /> Bónus missões (0 × {eff.missionBonus})
                          </span>
                          <span className="font-display font-bold text-xs text-secondary">+0</span>
                        </div>
                      </div>
                      <div className="h-px bg-border/50" />
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-display font-bold">Total esta semana</span>
                        <span className="font-display font-bold text-base text-primary">🪙 {totalAllowance}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        className="flex-1 rounded-xl font-display gap-1.5 sm:gap-2 bg-accent hover:bg-accent/90 text-accent-foreground shadow-sm text-xs sm:text-sm"
                        disabled={isSending}
                        onClick={() => handleSend(child.profileId)}
                      >
                        {isSending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                        {isSending ? 'A enviar...' : 'Enviar Mesada'}
                      </Button>
                      <Button variant="outline" size="icon" className="rounded-xl border-border/50 h-9 w-9 sm:h-10 sm:w-10" onClick={() => openConfig(child.profileId)}>
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 rounded-xl p-3 border border-border/30">
                      <Wallet className="h-3.5 w-3.5" />
                      <span>
                        {eff.lastSentAt
                          ? `Última mesada enviada ${formatDistanceToNow(new Date(eff.lastSentAt), { addSuffix: true, locale: pt })}`
                          : 'Nenhuma mesada enviada ainda'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Config Dialog */}
      <Dialog open={!!configOpen} onOpenChange={() => setConfigOpen(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl border-border/50">
          <DialogHeader>
            <DialogTitle className="font-display text-xl flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-[hsl(var(--kivara-light-gold))] flex items-center justify-center">
                <Settings className="h-5 w-5 text-accent-foreground" />
              </div>
              Configurar Mesada — {children.find(c => c.profileId === configOpen)?.displayName}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5 mt-2">
            <div className="space-y-2">
              <Label className="text-sm font-display font-bold">Frequência</Label>
              <Select value={editConfig.frequency} onValueChange={(v) => setEditConfig(prev => ({ ...prev, frequency: v as 'weekly' | 'monthly' }))}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Semanal</SelectItem>
                  <SelectItem value="monthly">Mensal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-display font-bold">Valor base</Label>
                <span className="font-display font-bold text-sm">🪙 {editConfig.baseAmount}</span>
              </div>
              <Slider value={[editConfig.baseAmount]} onValueChange={([v]) => setEditConfig(prev => ({ ...prev, baseAmount: v }))} max={200} min={10} step={5} />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-display font-bold">Bónus por tarefa concluída</Label>
                <span className="font-display font-bold text-sm">+{editConfig.taskBonus} 🪙</span>
              </div>
              <Slider value={[editConfig.taskBonus]} onValueChange={([v]) => setEditConfig(prev => ({ ...prev, taskBonus: v }))} max={30} min={0} step={1} />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-display font-bold">Bónus por missão concluída</Label>
                <span className="font-display font-bold text-sm">+{editConfig.missionBonus} 🪙</span>
              </div>
              <Slider value={[editConfig.missionBonus]} onValueChange={([v]) => setEditConfig(prev => ({ ...prev, missionBonus: v }))} max={50} min={0} step={1} />
            </div>
            <Button
              className="w-full rounded-xl font-display gap-2"
              onClick={saveConfig}
              disabled={upsertConfig.isPending}
            >
              {upsertConfig.isPending ? 'A guardar...' : 'Guardar Configuração'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
