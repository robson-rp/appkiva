import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Kivo } from '@/components/Kivo';
import { useDreamVaults, useCreateDreamVault, useDepositToDream } from '@/hooks/use-dream-vaults';
import { useAuth } from '@/contexts/AuthContext';
import { mockDreamVaults, mockChildren } from '@/data/mock-data';
import { Plus, MessageCircle, Sparkles, Heart, ChevronDown, ChevronUp } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useFeatureGate, FEATURES } from '@/hooks/use-feature-gate';
import UpgradePrompt, { FeatureGateWrapper } from '@/components/UpgradePrompt';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

const priorityConfig = {
  high: { label: 'Prioridade Alta', className: 'bg-destructive/10 text-destructive border-destructive/20' },
  medium: { label: 'Prioridade Média', className: 'bg-accent/10 text-accent-foreground border-accent/20' },
  low: { label: 'Prioridade Baixa', className: 'bg-muted text-muted-foreground border-muted' },
};

export default function ChildDreams() {
  const { user } = useAuth();
  const { allowed: dreamVaultsAllowed, tierName, loading: gateLoading } = useFeatureGate(FEATURES.DREAM_VAULTS);
  const { data: dbDreams, isLoading } = useDreamVaults(user?.profileId);
  const createDream = useCreateDreamVault();
  const depositToDream = useDepositToDream();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [depositDialogOpen, setDepositDialogOpen] = useState(false);
  const [depositDreamId, setDepositDreamId] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newTarget, setNewTarget] = useState('');

  // Fallback to mock data
  const child = mockChildren[0];
  const mockFallback = mockDreamVaults.filter(d => d.childId === child.id).map(d => ({
    id: d.id, profileId: '', householdId: null, title: d.title, description: d.description,
    icon: d.icon, targetAmount: d.targetAmount, currentAmount: d.currentAmount,
    priority: d.priority as 'high' | 'medium' | 'low', createdAt: d.createdAt,
    parentComments: d.parentComments.map(c => ({ id: c.id, text: c.text, emoji: c.emoji ?? '💬', createdAt: c.date })),
  }));
  const dreams = (dbDreams && dbDreams.length > 0) ? dbDreams : mockFallback;

  const totalTarget = dreams.reduce((s, d) => s + d.targetAmount, 0);
  const totalSaved = dreams.reduce((s, d) => s + d.currentAmount, 0);

  const handleCreate = async () => {
    if (!newTitle || !newTarget) return;
    try {
      await createDream.mutateAsync({ title: newTitle, description: newDesc || undefined, targetAmount: Number(newTarget) });
      toast.success('Sonho criado! ✨');
      setNewTitle(''); setNewDesc(''); setNewTarget(''); setDialogOpen(false);
    } catch { toast.error('Erro ao criar sonho'); }
  };

  const handleDeposit = async () => {
    if (!depositDreamId || !depositAmount) return;
    const amount = Number(depositAmount);
    if (isNaN(amount) || amount <= 0) return;
    try {
      await depositToDream.mutateAsync({ dreamId: depositDreamId, amount });
      toast.success(`+${amount} 🪙 depositados no sonho!`);
      setDepositAmount('');
      setDepositDialogOpen(false);
      setDepositDreamId(null);
    } catch { toast.error('Erro ao depositar'); }
  };

  // Set first expanded if not set
  if (!expandedId && dreams.length > 0 && dreams[0].parentComments.length > 0) {
    setExpandedId(dreams[0].id);
  }

  return (
    <FeatureGateWrapper
      allowed={dreamVaultsAllowed || gateLoading}
      featureName="Cofres de Sonhos"
      description="Cria um vision board dos teus sonhos, acompanha o progresso e recebe incentivos dos pais. Disponível no plano Família Premium."
      tierName={tierName}
    >
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="relative overflow-hidden border-0 text-primary-foreground">
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--kivara-purple))] via-primary to-accent" />
          <div className="absolute top-[-20%] right-[-10%] w-[40%] h-[70%] rounded-full bg-white/8 blur-3xl" />
          <div className="absolute bottom-[-15%] left-[-5%] w-[30%] h-[50%] rounded-full bg-white/5 blur-2xl" />
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl">✨</div>
              <div>
                <p className="text-xs opacity-70 uppercase tracking-wider font-medium">Cofre dos Sonhos</p>
                <h1 className="font-display text-xl font-bold">Os meus desejos</h1>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 mt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm opacity-80">{dreams.length} sonhos activos</span>
                <span className="font-display font-bold">🪙 {totalSaved} / {totalTarget}</span>
              </div>
              {totalTarget > 0 && <Progress value={Math.round((totalSaved / totalTarget) * 100)} className="h-2.5 bg-white/20" />}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-display text-lg font-bold">Vision Board</h2>
          <p className="text-xs text-muted-foreground">Visualiza e acompanha os teus sonhos</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="rounded-xl font-display gap-1"><Plus className="h-4 w-4" /> Novo Sonho</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle className="font-display">Adicionar Sonho</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2"><Label>O que sonhas?</Label><Input placeholder="Ex: Ir à Disneylândia" value={newTitle} onChange={e => setNewTitle(e.target.value)} /></div>
              <div className="space-y-2"><Label>Descreve o teu sonho</Label><Textarea placeholder="Porque é importante para ti?" value={newDesc} onChange={e => setNewDesc(e.target.value)} /></div>
              <div className="space-y-2"><Label>Quanto precisas? (KivaCoins)</Label><Input type="number" placeholder="500" value={newTarget} onChange={e => setNewTarget(e.target.value)} /></div>
              <Button className="w-full rounded-xl font-display" onClick={handleCreate} disabled={createDream.isPending}>
                {createDream.isPending ? 'A criar...' : '✨ Criar Sonho'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Dream Cards */}
      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">A carregar sonhos...</div>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
          {dreams.map((dream) => {
            const pct = dream.targetAmount > 0 ? Math.round((dream.currentAmount / dream.targetAmount) * 100) : 0;
            const isExpanded = expandedId === dream.id;
            const priority = priorityConfig[dream.priority];

            return (
              <motion.div key={dream.id} variants={item}>
                <Card className="overflow-hidden border-border/50 hover:shadow-lg transition-all duration-300">
                  <div className="relative bg-gradient-to-r from-muted/60 to-muted/30 p-5">
                    <div className="flex items-start gap-4">
                      <motion.div className="w-16 h-16 rounded-2xl bg-card shadow-md flex items-center justify-center text-4xl border border-border/30" whileHover={{ scale: 1.1, rotate: 5 }} transition={{ type: 'spring', stiffness: 400 }}>
                        {dream.icon}
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="font-display font-bold text-base">{dream.title}</h3>
                          <span className={`text-[10px] px-2 py-0.5 rounded-lg font-display font-semibold border ${priority.className}`}>{priority.label}</span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">{dream.description}</p>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-display font-bold text-primary">🪙 {dream.currentAmount}</span>
                        <span className="text-muted-foreground font-display">Meta: {dream.targetAmount}</span>
                      </div>
                      <div className="relative">
                        <Progress value={pct} className="h-3 rounded-full" />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-bold text-primary-foreground drop-shadow">{pct}%</span>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-3">
                      <Button variant="outline" size="sm" className="rounded-xl text-xs font-display h-8 gap-1 flex-1 hover:bg-primary hover:text-primary-foreground transition-colors" onClick={() => { setDepositDreamId(dream.id); setDepositAmount(''); setDepositDialogOpen(true); }}>
                        <Plus className="h-3 w-3" /> Poupar
                      </Button>
                      <Button variant="ghost" size="sm" className="rounded-xl text-xs font-display h-8 gap-1" onClick={() => setExpandedId(isExpanded ? null : dream.id)}>
                        <MessageCircle className="h-3 w-3" />
                        {dream.parentComments.length}
                        {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      </Button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {isExpanded && dream.parentComments.length > 0 && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25, ease: 'easeInOut' }} className="overflow-hidden">
                        <CardContent className="pt-4 pb-4 space-y-3 bg-muted/20 border-t border-border/30">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground font-display font-semibold">
                            <Heart className="h-3.5 w-3.5 text-destructive" /> Mensagens dos pais
                          </div>
                          {dream.parentComments.map((comment) => (
                            <motion.div key={comment.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex gap-3 items-start">
                              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-sm shrink-0">{comment.emoji || '💬'}</div>
                              <div className="flex-1 bg-card rounded-2xl rounded-tl-sm p-3 shadow-sm border border-border/30">
                                <p className="text-sm leading-relaxed">{comment.text}</p>
                                <p className="text-[10px] text-muted-foreground mt-1.5">{new Date(comment.createdAt).toLocaleDateString('pt-PT')}</p>
                              </div>
                            </motion.div>
                          ))}
                        </CardContent>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Motivational Section */}
      <motion.div variants={item} initial="hidden" animate="show">
        <Card className="border-border/50 bg-gradient-to-r from-secondary/5 to-accent/5">
          <CardContent className="p-5 text-center space-y-2">
            <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }} className="text-4xl">
              <Sparkles className="h-8 w-8 text-accent-foreground mx-auto" />
            </motion.div>
            <h3 className="font-display font-bold text-sm">Cada moeda te aproxima dos teus sonhos!</h3>
            <p className="text-xs text-muted-foreground">Poupa um pouco todos os dias e vê a magia acontecer. ✨</p>
          </CardContent>
        </Card>
      </motion.div>

      <Kivo page="dreams" />
    </div>
    </FeatureGateWrapper>
  );
}
