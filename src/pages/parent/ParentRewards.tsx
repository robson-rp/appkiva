import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockParentRewards, mockChildren, mockDreamVaults } from '@/data/mock-data';
import { Plus, Gift, Star, Eye, Sparkles, ChevronRight, MessageCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

const categoryLabels: Record<string, string> = {
  experience: 'Experiência',
  privilege: 'Privilégio',
  physical: 'Físico',
  digital: 'Digital',
};

const categoryColors: Record<string, string> = {
  experience: 'bg-primary/10 text-primary border-primary/20',
  privilege: 'bg-accent/10 text-accent-foreground border-accent/20',
  physical: 'bg-secondary/10 text-secondary border-secondary/20',
  digital: 'bg-muted text-muted-foreground border-muted',
};

export default function ParentRewards() {
  const [rewards] = useState(mockParentRewards);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-5xl mx-auto">
      {/* Hero */}
      <motion.div variants={item}>
        <Card className="border-0 overflow-hidden relative shadow-kivara">
          <div className="absolute inset-0 gradient-kivara" />
          <div className="absolute top-[-30%] right-[-10%] w-[45%] h-[80%] rounded-full bg-white/5 blur-3xl" />
          <CardContent className="relative z-10 p-6 md:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-2">
                <p className="text-primary-foreground/60 text-xs font-medium uppercase tracking-wider">Gestão</p>
                <h1 className="font-display text-2xl md:text-3xl font-bold text-primary-foreground">Recompensas Familiares</h1>
                <p className="text-primary-foreground/60 text-sm">
                  Cria recompensas personalizadas para motivar as crianças
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-2 text-center">
                  <p className="text-[10px] text-primary-foreground/60 uppercase tracking-wider">Activas</p>
                  <p className="font-display text-xl font-bold text-primary-foreground">{rewards.filter(r => r.available).length}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-2 text-center">
                  <p className="text-[10px] text-primary-foreground/60 uppercase tracking-wider">Resgatadas</p>
                  <p className="font-display text-xl font-bold text-primary-foreground">{rewards.filter(r => r.claimedAt).length}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Add Reward */}
      <motion.div variants={item} className="flex justify-between items-center">
        <div>
          <h2 className="font-display text-lg font-bold flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" /> Recompensas
          </h2>
          <p className="text-xs text-muted-foreground">{rewards.length} recompensas criadas</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" className="rounded-xl font-display gap-1">
              <Plus className="h-4 w-4" /> Nova Recompensa
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display">Criar Recompensa</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input placeholder="Ex: Noite de cinema" />
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea placeholder="Descreve a recompensa..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Preço (KivaCoins)</Label>
                  <Input type="number" placeholder="50" />
                </div>
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Escolhe" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="experience">Experiência</SelectItem>
                      <SelectItem value="privilege">Privilégio</SelectItem>
                      <SelectItem value="physical">Físico</SelectItem>
                      <SelectItem value="digital">Digital</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button className="w-full rounded-xl font-display">🎁 Criar Recompensa</Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Rewards Grid */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {rewards.map((reward, i) => (
          <motion.div
            key={reward.id}
            variants={item}
            whileHover={{ y: -4 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <Card className="h-full border-border/50 overflow-hidden hover:shadow-lg transition-all duration-300">
              <div className="h-0.5 gradient-kivara" />
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center text-3xl">
                    {reward.icon}
                  </div>
                  <Badge variant="outline" className={`text-[10px] ${categoryColors[reward.category]}`}>
                    {categoryLabels[reward.category]}
                  </Badge>
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm">{reward.name}</h3>
                  <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{reward.description}</p>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-border/30">
                  <span className="font-display font-bold text-sm">🪙 {reward.price}</span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" className="h-7 rounded-lg text-xs font-display"
                      onClick={() => toast({ title: 'Recompensa editada', description: `"${reward.name}" actualizada.` })}
                    >
                      Editar
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 rounded-lg text-xs font-display text-destructive hover:text-destructive"
                      onClick={() => toast({ title: 'Recompensa removida', description: `"${reward.name}" foi removida.`, variant: 'destructive' })}
                    >
                      Remover
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Dream Vaults Overview for parents */}
      <motion.div variants={item}>
        <Card className="border-border/50 overflow-hidden">
          <div className="h-0.5 bg-gradient-to-r from-[hsl(var(--kivara-purple))] to-primary" />
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-display flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[hsl(var(--kivara-purple))]/20 flex items-center justify-center">
                <Star className="h-4 w-4 text-primary" />
              </div>
              Cofre dos Sonhos — Visão Geral
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockDreamVaults.map((dream) => {
              const child = mockChildren.find(c => c.id === dream.childId);
              const pct = Math.round((dream.currentAmount / dream.targetAmount) * 100);
              return (
                <div key={dream.id} className="bg-muted/30 rounded-2xl p-4 space-y-3 border border-border/30">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{dream.icon}</span>
                      <div>
                        <span className="font-display font-bold text-sm">{dream.title}</span>
                        <p className="text-[10px] text-muted-foreground">{child?.name} · {dream.parentComments.length} comentários</p>
                      </div>
                    </div>
                    <span className="font-display font-bold text-xs text-primary">{pct}%</span>
                  </div>
                  <Progress value={pct} className="h-2.5" />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>🪙 {dream.currentAmount} / {dream.targetAmount}</span>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-7 rounded-lg text-xs font-display gap-1">
                          <MessageCircle className="h-3 w-3" /> Comentar
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle className="font-display">Deixar mensagem para {child?.name}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <p className="text-sm text-muted-foreground">
                            Envia uma mensagem de encorajamento sobre o sonho "{dream.title}"
                          </p>
                          <Textarea placeholder="Estamos orgulhosos de ti! Continua a poupar..." />
                          <Button className="w-full rounded-xl font-display"
                            onClick={() => toast({ title: 'Mensagem enviada! 💬', description: `Comentário enviado para ${child?.name}.` })}
                          >
                            💬 Enviar Mensagem
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}