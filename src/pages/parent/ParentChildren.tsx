import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CoinDisplay } from '@/components/CoinDisplay';
import { Plus, Edit, Trash2, TrendingUp, Users, Copy, Link2, QrCode, Share2, Check, RefreshCw, Shield, Wallet, Send, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useChildren, useUpdateChildBudget } from '@/hooks/use-children';
import { usePendingBudgetExceptions, useResolveBudgetException } from '@/hooks/use-budget-exceptions';
import { createNotification } from '@/hooks/use-notifications';
import { Skeleton } from '@/components/ui/skeleton';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export default function ParentChildren() {
  const { data: children = [], isLoading } = useChildren();
  const updateBudget = useUpdateChildBudget();
  const { data: pendingExceptions = [] } = usePendingBudgetExceptions();
  const resolveException = useResolveBudgetException();
  const totalBalance = children.reduce((s, c) => s + c.balance, 0);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState(() => generateCode());
  const [copied, setCopied] = useState<'code' | 'link' | null>(null);

  // Budget edit dialog
  const [budgetDialogOpen, setBudgetDialogOpen] = useState(false);
  const [budgetChild, setBudgetChild] = useState<{ childId: string; profileId: string; displayName: string; monthlyBudget: number } | null>(null);
  const [budgetValue, setBudgetValue] = useState('');

  const openBudgetDialog = (child: typeof budgetChild & {}) => {
    setBudgetChild(child);
    setBudgetValue(String(child.monthlyBudget || ''));
    setBudgetDialogOpen(true);
  };

  const handleSaveBudget = async () => {
    if (!budgetChild) return;
    const val = Number(budgetValue);
    if (isNaN(val) || val < 0) return;
    try {
      await updateBudget.mutateAsync({ childId: budgetChild.childId, monthlyBudget: val });
      toast({ title: 'Limite atualizado! 💰', description: `Limite de gasto mensal definido para ${val} 🪙.` });
      createNotification({
        profileId: budgetChild.profileId,
        title: 'Limite de gasto atualizado 💰',
        message: val > 0
          ? `O teu limite de gasto mensal foi definido para ${val} 🪙.`
          : 'O teu limite de gasto mensal foi removido.',
        type: 'vault',
        metadata: { monthlyBudget: val },
      });
      setBudgetDialogOpen(false);
    } catch {
      toast({ title: 'Erro', description: 'Não foi possível atualizar o limite.', variant: 'destructive' });
    }
  };

  const inviteLink = `${window.location.origin}/join/${inviteCode}`;

  const handleCopy = (text: string, type: 'code' | 'link') => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    toast({ title: 'Copiado! 📋', description: type === 'code' ? 'Código copiado para a área de transferência.' : 'Link copiado para a área de transferência.' });
    setTimeout(() => setCopied(null), 2000);
  };

  const handleRegenerate = () => {
    setInviteCode(generateCode());
    toast({ title: 'Novo código gerado! 🔄' });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Junta-te à minha família no KIVARA!', text: `Usa o código ${inviteCode} ou clica no link para te juntares à família.`, url: inviteLink });
      } catch {}
    } else {
      handleCopy(inviteLink, 'link');
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-2xl gradient-kivara p-6 text-primary-foreground">
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute bottom-0 left-1/4 w-60 h-20 rounded-full bg-white/5 blur-2xl" />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-primary-foreground/60 text-[10px] uppercase tracking-wider font-medium">Gestão</p>
            <h1 className="font-display text-2xl font-bold mt-1">Crianças</h1>
            <p className="text-sm text-primary-foreground/60 mt-1">Gere os perfis das tuas crianças</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" className="rounded-2xl font-display gap-1.5 bg-white/15 hover:bg-white/25 text-primary-foreground border-0 backdrop-blur-sm shadow-lg text-xs sm:text-sm" onClick={() => setInviteOpen(true)}>
              <Link2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Convidar
            </Button>
            <Button size="sm" className="rounded-2xl font-display gap-1.5 bg-white/15 hover:bg-white/25 text-primary-foreground border-0 backdrop-blur-sm shadow-lg text-xs sm:text-sm">
              <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Adicionar
            </Button>
          </div>
        </div>
        <div className="relative flex flex-wrap items-center gap-2 sm:gap-4 mt-4">
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-3 sm:px-4 py-2">
            <Users className="h-4 w-4" />
            <span className="font-display font-bold text-base sm:text-lg">{children.length}</span>
            <span className="text-[10px] sm:text-xs text-primary-foreground/60">crianças</span>
          </div>
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-3 sm:px-4 py-2">
            <TrendingUp className="h-4 w-4" />
            <span className="font-display font-bold text-base sm:text-lg">🪙 {totalBalance}</span>
            <span className="text-[10px] sm:text-xs text-primary-foreground/60">saldo total</span>
          </div>
        </div>
      </motion.div>

      {/* Pending Budget Exceptions */}
      {pendingExceptions.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-chart-1/30 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-chart-1 to-accent" />
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-chart-1/10 flex items-center justify-center">
                  <Send className="h-3.5 w-3.5 text-chart-1" />
                </div>
                <div>
                  <p className="text-sm font-display font-bold">Pedidos de Exceção</p>
                  <p className="text-[10px] text-muted-foreground">{pendingExceptions.length} pedido(s) pendente(s)</p>
                </div>
              </div>
              {pendingExceptions.map((req) => (
                <div key={req.id} className="flex items-center justify-between gap-3 bg-muted/40 rounded-xl p-3 border border-border/30">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xl">{req.reward_icon || '🎁'}</span>
                    <div className="min-w-0">
                      <p className="text-xs font-display font-bold truncate">{req.child_name}</p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        {req.reward_name} — 🪙 {req.amount}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-xl h-8 px-2.5 text-xs font-display gap-1 border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => resolveException.mutate({ requestId: req.id, action: 'reject' })}
                      disabled={resolveException.isPending}
                    >
                      {resolveException.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <XCircle className="h-3 w-3" />}
                    </Button>
                    <Button
                      size="sm"
                      className="rounded-xl h-8 px-2.5 text-xs font-display gap-1"
                      onClick={() => resolveException.mutate({ requestId: req.id, action: 'approve' })}
                      disabled={resolveException.isPending}
                    >
                      {resolveException.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
                      Aprovar
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Children Grid */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {[1, 2].map(i => (
            <Card key={i} className="overflow-hidden border-border/50">
              <div className="h-1 gradient-kivara" />
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="w-16 h-16 rounded-2xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Skeleton className="h-20 rounded-2xl" />
                  <Skeleton className="h-20 rounded-2xl" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : children.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="p-12 text-center">
            <div className="text-5xl mb-4">👶</div>
            <h3 className="font-display font-bold text-lg mb-2">Ainda sem crianças</h3>
            <p className="text-sm text-muted-foreground mb-4">Adiciona ou convida uma criança para começar.</p>
            <Button className="rounded-xl font-display gap-1.5" onClick={() => setInviteOpen(true)}>
              <Link2 className="h-4 w-4" /> Convidar Criança
            </Button>
          </CardContent>
        </Card>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show" className="grid md:grid-cols-2 gap-4">
          {children.map((child) => (
            <motion.div key={child.childId} variants={item} whileHover={{ y: -4 }}>
              <Card className="group hover:shadow-kivara transition-all duration-300 overflow-hidden border-border/50">
                <div className="h-1 gradient-kivara" />
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[hsl(var(--kivara-light-blue))] to-[hsl(var(--kivara-light-green))] flex items-center justify-center text-4xl shadow-sm group-hover:scale-110 transition-transform duration-300">
                      {child.avatar}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-display font-bold text-lg">{child.displayName}</h3>
                      {child.nickname && (
                        <p className="text-xs text-muted-foreground">Alcunha: {child.nickname}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-5">
                    <div className="bg-[hsl(var(--kivara-light-blue))] rounded-2xl p-3.5 text-center">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1">Saldo</p>
                      <CoinDisplay amount={child.balance} size="sm" />
                    </div>
                    <div
                      className="bg-muted/50 rounded-2xl p-3.5 text-center cursor-pointer hover:bg-muted/80 transition-colors group/budget"
                      onClick={() => openBudgetDialog({ childId: child.childId, profileId: child.profileId, displayName: child.displayName, monthlyBudget: child.monthlyBudget })}
                    >
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1 flex items-center justify-center gap-1">
                        <Wallet className="h-3 w-3" /> Limite Mensal
                      </p>
                      <p className="font-display font-bold text-lg text-foreground">
                        {child.monthlyBudget > 0 ? `${child.monthlyBudget} 🪙` : <span className="text-muted-foreground text-sm">Definir</span>}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" className="flex-1 min-w-[100px] rounded-xl font-display gap-1.5 border-border/50 hover:bg-primary hover:text-primary-foreground transition-all duration-200 text-xs sm:text-sm">
                      <Edit className="h-3.5 w-3.5" /> Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 min-w-[100px] rounded-xl font-display gap-1.5 border-border/50 hover:bg-accent hover:text-accent-foreground transition-all duration-200 text-xs sm:text-sm"
                      onClick={() => openBudgetDialog({ childId: child.childId, profileId: child.profileId, displayName: child.displayName, monthlyBudget: child.monthlyBudget })}
                    >
                      <Wallet className="h-3.5 w-3.5" /> Limite
                    </Button>
                    <Button variant="outline" size="icon" className="rounded-xl border-border/50 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all duration-200 h-9 w-9">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Invite Dialog */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl border-border/50">
          <DialogHeader>
            <DialogTitle className="font-display text-xl flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-[hsl(var(--kivara-light-blue))] flex items-center justify-center">
                <Link2 className="h-5 w-5 text-primary" />
              </div>
              Convidar Criança
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Partilha o código ou link para a criança se juntar à família.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 mt-2">
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Código de convite</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-muted/50 rounded-2xl p-4 text-center border border-border/30">
                  <motion.p key={inviteCode} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="font-display text-3xl font-bold tracking-[0.3em] text-foreground">
                    {inviteCode}
                  </motion.p>
                  <p className="text-[10px] text-muted-foreground mt-1">Válido por 48 horas</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 rounded-xl font-display gap-1.5 border-border/50" onClick={() => handleCopy(inviteCode, 'code')}>
                  <AnimatePresence mode="wait">
                    {copied === 'code' ? (
                      <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><Check className="h-3.5 w-3.5 text-secondary" /></motion.div>
                    ) : (
                      <motion.div key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><Copy className="h-3.5 w-3.5" /></motion.div>
                    )}
                  </AnimatePresence>
                  {copied === 'code' ? 'Copiado!' : 'Copiar código'}
                </Button>
                <Button variant="outline" size="sm" className="rounded-xl font-display gap-1.5 border-border/50" onClick={handleRegenerate}>
                  <RefreshCw className="h-3.5 w-3.5" /> Novo
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-border/50" />
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">ou</span>
              <div className="flex-1 h-px bg-border/50" />
            </div>
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Link de convite</p>
              <div className="flex gap-2">
                <Input readOnly value={inviteLink} className="rounded-xl border-border/50 text-xs bg-muted/30 font-mono" />
                <Button variant="outline" size="icon" className="rounded-xl border-border/50 shrink-0" onClick={() => handleCopy(inviteLink, 'link')}>
                  {copied === 'link' ? <Check className="h-4 w-4 text-secondary" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <Button className="w-full rounded-xl font-display gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm" onClick={handleShare}>
              <Share2 className="h-4 w-4" /> Partilhar convite
            </Button>
            <div className="bg-[hsl(var(--kivara-light-gold))] rounded-2xl p-4 flex items-start gap-3">
              <QrCode className="h-5 w-5 text-accent-foreground shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-display font-bold text-accent-foreground">Como funciona?</p>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                  A criança introduz o código ao criar a conta ou acede ao link. Depois de se registar, aparecerá automaticamente na tua lista de crianças.
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Budget Dialog */}
      <Dialog open={budgetDialogOpen} onOpenChange={setBudgetDialogOpen}>
        <DialogContent className="sm:max-w-sm rounded-2xl border-border/50">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" />
              Limite de Gasto Mensal
            </DialogTitle>
            <DialogDescription>
              Define quanto {budgetChild?.displayName} pode gastar por mês.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Limite mensal (KivaCoins)</Label>
              <Input
                type="number"
                placeholder="Ex: 500"
                value={budgetValue}
                onChange={e => setBudgetValue(e.target.value)}
                min={0}
                className="rounded-xl text-lg font-display text-center"
              />
              <p className="text-[10px] text-muted-foreground text-center">
                Define 0 para remover o limite
              </p>
            </div>

            <div className="flex gap-2 flex-wrap justify-center">
              {[100, 250, 500, 1000].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setBudgetValue(String(v))}
                  className={`px-3 py-1.5 rounded-xl text-xs font-display font-bold transition-all ${
                    budgetValue === String(v)
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {v} 🪙
                </button>
              ))}
            </div>

            <Button
              className="w-full rounded-xl font-display gap-2"
              onClick={handleSaveBudget}
              disabled={updateBudget.isPending}
            >
              <Wallet className="h-4 w-4" />
              {updateBudget.isPending ? 'A guardar...' : 'Guardar Limite'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
