import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { mockChildren } from '@/data/mock-data';
import { CoinDisplay } from '@/components/CoinDisplay';
import { LevelBadge } from '@/components/LevelBadge';
import { Plus, Edit, Trash2, TrendingUp, Users, Copy, Link2, QrCode, Share2, Check, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export default function ParentChildren() {
  const totalBalance = mockChildren.reduce((s, c) => s + c.balance, 0);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState(() => generateCode());
  const [copied, setCopied] = useState<'code' | 'link' | null>(null);

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
        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-primary-foreground/60 text-[10px] uppercase tracking-wider font-medium">Gestão</p>
            <h1 className="font-display text-2xl font-bold mt-1">Crianças</h1>
            <p className="text-sm text-primary-foreground/60 mt-1">Gere os perfis das tuas crianças</p>
          </div>
          <div className="flex gap-2">
            <Button
              className="rounded-2xl font-display gap-2 bg-white/15 hover:bg-white/25 text-primary-foreground border-0 backdrop-blur-sm shadow-lg"
              onClick={() => setInviteOpen(true)}
            >
              <Link2 className="h-4 w-4" /> Convidar
            </Button>
            <Button className="rounded-2xl font-display gap-2 bg-white/15 hover:bg-white/25 text-primary-foreground border-0 backdrop-blur-sm shadow-lg">
              <Plus className="h-4 w-4" /> Adicionar
            </Button>
          </div>
        </div>
        <div className="relative flex items-center gap-4 mt-4">
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2">
            <Users className="h-4 w-4" />
            <span className="font-display font-bold text-lg">{mockChildren.length}</span>
            <span className="text-xs text-primary-foreground/60">crianças</span>
          </div>
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2">
            <TrendingUp className="h-4 w-4" />
            <span className="font-display font-bold text-lg">🪙 {totalBalance}</span>
            <span className="text-xs text-primary-foreground/60">saldo total</span>
          </div>
        </div>
      </motion.div>

      {/* Children Grid */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid md:grid-cols-2 gap-4">
        {mockChildren.map((child) => {
          const savingsPercent = Math.round((child.balance / (child.balance + child.weeklyAllowance * 4)) * 100);
          return (
            <motion.div key={child.id} variants={item} whileHover={{ y: -4 }}>
              <Card className="group hover:shadow-kivara transition-all duration-300 overflow-hidden border-border/50">
                <div className="h-1 gradient-kivara" />
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[hsl(var(--kivara-light-blue))] to-[hsl(var(--kivara-light-green))] flex items-center justify-center text-4xl shadow-sm group-hover:scale-110 transition-transform duration-300">
                      {child.avatar}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-display font-bold text-lg">{child.name}</h3>
                      <p className="text-xs text-muted-foreground">@{child.username} · PIN: {child.pin}</p>
                      <LevelBadge level={child.level} points={child.kivaPoints} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-5">
                    <div className="bg-[hsl(var(--kivara-light-blue))] rounded-2xl p-3.5 text-center">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1">Saldo</p>
                      <CoinDisplay amount={child.balance} size="sm" />
                    </div>
                    <div className="bg-[hsl(var(--kivara-light-gold))] rounded-2xl p-3.5 text-center">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1">Mesada</p>
                      <CoinDisplay amount={child.weeklyAllowance} size="sm" />
                    </div>
                  </div>

                  <div className="mb-5 bg-muted/30 rounded-2xl p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Hábito de poupança</span>
                      <span className="text-xs font-display font-bold text-secondary">{savingsPercent}%</span>
                    </div>
                    <Progress value={savingsPercent} className="h-2 rounded-full" />
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 rounded-xl font-display gap-1.5 border-border/50 hover:bg-primary hover:text-primary-foreground transition-all duration-200">
                      <Edit className="h-3.5 w-3.5" /> Editar
                    </Button>
                    <Button variant="outline" size="icon" className="rounded-xl border-border/50 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all duration-200 h-9 w-9">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

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
            {/* Invite Code */}
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Código de convite</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-muted/50 rounded-2xl p-4 text-center border border-border/30">
                  <motion.p
                    key={inviteCode}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="font-display text-3xl font-bold tracking-[0.3em] text-foreground"
                  >
                    {inviteCode}
                  </motion.p>
                  <p className="text-[10px] text-muted-foreground mt-1">Válido por 48 horas</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 rounded-xl font-display gap-1.5 border-border/50"
                  onClick={() => handleCopy(inviteCode, 'code')}
                >
                  <AnimatePresence mode="wait">
                    {copied === 'code' ? (
                      <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                        <Check className="h-3.5 w-3.5 text-secondary" />
                      </motion.div>
                    ) : (
                      <motion.div key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                        <Copy className="h-3.5 w-3.5" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  {copied === 'code' ? 'Copiado!' : 'Copiar código'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl font-display gap-1.5 border-border/50"
                  onClick={handleRegenerate}
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Novo
                </Button>
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-border/50" />
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">ou</span>
              <div className="flex-1 h-px bg-border/50" />
            </div>

            {/* Invite Link */}
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Link de convite</p>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={inviteLink}
                  className="rounded-xl border-border/50 text-xs bg-muted/30 font-mono"
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-xl border-border/50 shrink-0"
                  onClick={() => handleCopy(inviteLink, 'link')}
                >
                  {copied === 'link' ? <Check className="h-4 w-4 text-secondary" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Share Button */}
            <Button
              className="w-full rounded-xl font-display gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4" /> Partilhar convite
            </Button>

            {/* Info */}
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
    </div>
  );
}
