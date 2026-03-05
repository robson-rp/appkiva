import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { mockChildren, mockAllowanceConfigs, mockTasks, mockMissions } from '@/data/mock-data';
import { CoinDisplay } from '@/components/CoinDisplay';
import { motion } from 'framer-motion';
import { Wallet, Send, TrendingUp, Calendar, Zap, Target, ListTodo, Settings } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

export default function ParentAllowance() {
  const [configs, setConfigs] = useState(mockAllowanceConfigs);
  const [configOpen, setConfigOpen] = useState<string | null>(null);

  const totalWeekly = configs.reduce((s, c) => s + c.baseAmount, 0);
  const totalBalance = mockChildren.reduce((s, c) => s + c.balance, 0);

  const handleSend = (childName: string, childId: string) => {
    const config = configs.find(c => c.childId === childId);
    if (!config) return;
    const completedTasks = mockTasks.filter(t => t.childId === childId && (t.status === 'completed' || t.status === 'approved')).length;
    const completedMissions = mockMissions.filter(m => m.childId === childId && m.status === 'completed').length;
    const bonus = completedTasks * config.taskBonus + completedMissions * config.missionBonus;
    const total = config.baseAmount + bonus;
    toast({
      title: 'Mesada enviada! 💰',
      description: `${childName} recebeu ${total} KivaCoins (base: ${config.baseAmount} + bónus: ${bonus}).`,
    });
  };

  const updateConfig = (childId: string, field: string, value: any) => {
    setConfigs(prev => prev.map(c => c.childId === childId ? { ...c, [field]: value } : c));
  };

  const saveConfig = (childId: string) => {
    const child = mockChildren.find(c => c.id === childId);
    toast({ title: 'Mesada configurada! ⚙️', description: `Configuração da mesada de ${child?.name} actualizada.` });
    setConfigOpen(null);
  };

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
      <motion.div variants={container} initial="hidden" animate="show" className="grid md:grid-cols-2 gap-4">
        {mockChildren.map((child) => {
          const config = configs.find(c => c.childId === child.id) || { baseAmount: child.weeklyAllowance, frequency: 'weekly' as const, taskBonus: 5, missionBonus: 10 };
          const completedTasks = mockTasks.filter(t => t.childId === child.id && (t.status === 'completed' || t.status === 'approved')).length;
          const completedMissions = mockMissions.filter(m => m.childId === child.id && m.status === 'completed').length;
          const taskBonusTotal = completedTasks * config.taskBonus;
          const missionBonusTotal = completedMissions * config.missionBonus;
          const totalAllowance = config.baseAmount + taskBonusTotal + missionBonusTotal;

          return (
            <motion.div key={child.id} variants={item} whileHover={{ y: -4 }}>
              <Card className="group hover:shadow-kivara transition-all duration-300 border-border/50 overflow-hidden">
                <div className="h-1 gradient-gold" />
                <CardContent className="p-6 space-y-5">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[hsl(var(--kivara-light-gold))] to-[hsl(var(--kivara-light-blue))] flex items-center justify-center text-3xl shadow-sm group-hover:scale-110 transition-transform duration-300">
                      {child.avatar}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-display font-bold text-lg">{child.name}</h3>
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
                          <Wallet className="h-3 w-3" /> Base ({config.frequency === 'weekly' ? 'semanal' : 'mensal'})
                        </span>
                        <span className="font-display font-bold text-xs">🪙 {config.baseAmount}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <ListTodo className="h-3 w-3" /> Bónus tarefas ({completedTasks} × {config.taskBonus})
                        </span>
                        <span className="font-display font-bold text-xs text-secondary">+{taskBonusTotal}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <Target className="h-3 w-3" /> Bónus missões ({completedMissions} × {config.missionBonus})
                        </span>
                        <span className="font-display font-bold text-xs text-secondary">+{missionBonusTotal}</span>
                      </div>
                    </div>
                    <div className="h-px bg-border/50" />
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-display font-bold">Total esta semana</span>
                      <span className="font-display font-bold text-base text-primary">🪙 {totalAllowance}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button className="flex-1 rounded-xl font-display gap-1.5 sm:gap-2 bg-accent hover:bg-accent/90 text-accent-foreground shadow-sm text-xs sm:text-sm" onClick={() => handleSend(child.name, child.id)}>
                      <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Enviar Mesada
                    </Button>
                    <Button variant="outline" size="icon" className="rounded-xl border-border/50 h-9 w-9 sm:h-10 sm:w-10" onClick={() => setConfigOpen(child.id)}>
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 rounded-xl p-3 border border-border/30">
                    <Wallet className="h-3.5 w-3.5" />
                    <span>Última mesada enviada há 3 dias</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Config Dialog */}
      <Dialog open={!!configOpen} onOpenChange={() => setConfigOpen(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl border-border/50">
          <DialogHeader>
            <DialogTitle className="font-display text-xl flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-[hsl(var(--kivara-light-gold))] flex items-center justify-center">
                <Settings className="h-5 w-5 text-accent-foreground" />
              </div>
              Configurar Mesada — {mockChildren.find(c => c.id === configOpen)?.name}
            </DialogTitle>
          </DialogHeader>
          {configOpen && (() => {
            const config = configs.find(c => c.childId === configOpen);
            if (!config) return null;
            return (
              <div className="space-y-5 mt-2">
                <div className="space-y-2">
                  <Label className="text-sm font-display font-bold">Frequência</Label>
                  <Select value={config.frequency} onValueChange={(v) => updateConfig(configOpen, 'frequency', v)}>
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
                    <span className="font-display font-bold text-sm">🪙 {config.baseAmount}</span>
                  </div>
                  <Slider value={[config.baseAmount]} onValueChange={([v]) => updateConfig(configOpen, 'baseAmount', v)} max={200} min={10} step={5} />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-display font-bold">Bónus por tarefa concluída</Label>
                    <span className="font-display font-bold text-sm">+{config.taskBonus} 🪙</span>
                  </div>
                  <Slider value={[config.taskBonus]} onValueChange={([v]) => updateConfig(configOpen, 'taskBonus', v)} max={30} min={0} step={1} />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-display font-bold">Bónus por missão concluída</Label>
                    <span className="font-display font-bold text-sm">+{config.missionBonus} 🪙</span>
                  </div>
                  <Slider value={[config.missionBonus]} onValueChange={([v]) => updateConfig(configOpen, 'missionBonus', v)} max={50} min={0} step={1} />
                </div>
                <Button className="w-full rounded-xl font-display gap-2" onClick={() => saveConfig(configOpen)}>
                  Guardar Configuração
                </Button>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
