import { useState } from 'react';
import { motion } from 'framer-motion';
import { useFeatureGate, FEATURES } from '@/hooks/use-feature-gate';
import { FeatureGateWrapper } from '@/components/UpgradePrompt';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Gift } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useRewards, useCreateReward, useDeleteReward, type RewardCategory } from '@/hooks/use-rewards';

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

const iconOptions = ['🎬', '🌙', '🍕', '🎢', '📖', '📱', '🎮', '⚽', '🎨', '🎁', '🏖️', '🍦'];

export default function ParentRewards() {
  const { allowed: rewardsAllowed, loading: gateLoading } = useFeatureGate(FEATURES.CUSTOM_REWARDS);
  const { data: rewards = [], isLoading } = useRewards();
  const createReward = useCreateReward();
  const deleteReward = useDeleteReward();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('50');
  const [category, setCategory] = useState<RewardCategory>('experience');
  const [icon, setIcon] = useState('🎁');

  const handleCreate = () => {
    if (!name || !price) return;
    createReward.mutate(
      { name, description, price: Number(price), icon, category },
      {
        onSuccess: () => {
          setDialogOpen(false);
          setName('');
          setDescription('');
          setPrice('');
          setCategory('experience');
          setIcon('🎁');
        },
      }
    );
  };

  return (
    <FeatureGateWrapper
      allowed={rewardsAllowed || gateLoading}
      featureName="Recompensas Personalizadas"
    >
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
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
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
                <Label>Ícone</Label>
                <div className="flex flex-wrap gap-2">
                  {iconOptions.map(ic => (
                    <button
                      key={ic}
                      type="button"
                      onClick={() => setIcon(ic)}
                      className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center border-2 transition-all ${icon === ic ? 'border-primary bg-primary/10 scale-110' : 'border-border/50 hover:border-border'}`}
                    >
                      {ic}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input placeholder="Ex: Noite de cinema" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea placeholder="Descreve a recompensa..." value={description} onChange={e => setDescription(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Preço (KVC)</Label>
                  <Input type="number" placeholder="50" value={price} onChange={e => setPrice(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select value={category} onValueChange={v => setCategory(v as RewardCategory)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="experience">Experiência</SelectItem>
                      <SelectItem value="privilege">Privilégio</SelectItem>
                      <SelectItem value="physical">Físico</SelectItem>
                      <SelectItem value="digital">Digital</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                className="w-full rounded-xl font-display"
                disabled={!name || !price || createReward.isPending}
                onClick={handleCreate}
              >
                {createReward.isPending ? 'A criar...' : '🎁 Criar Recompensa'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Rewards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="border-border/50">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <Skeleton className="w-12 h-12 rounded-2xl" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-4 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : rewards.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center text-3xl mx-auto mb-4">🎁</div>
            <p className="font-display font-bold text-sm">Sem recompensas ainda</p>
            <p className="text-xs text-muted-foreground mt-1">Clica em "Nova Recompensa" para começar!</p>
          </CardContent>
        </Card>
      ) : (
        <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rewards.map((reward) => (
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
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 rounded-lg text-xs font-display text-destructive hover:text-destructive"
                      disabled={deleteReward.isPending}
                      onClick={() => deleteReward.mutate(reward.id)}
                    >
                      Remover
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
    </FeatureGateWrapper>
  );
}
