import { useState } from 'react';
import { motion } from 'framer-motion';
import { useFeatureGate, FEATURES } from '@/hooks/use-feature-gate';
import { FeatureGateWrapper } from '@/components/UpgradePrompt';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Gift, Sparkles, Loader2, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useRewards, useCreateReward, useDeleteReward, type RewardCategory } from '@/hooks/use-rewards';
import { useT } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

const categoryColors: Record<string, string> = {
  experience: 'bg-primary/10 text-primary border-primary/20',
  privilege: 'bg-accent/10 text-accent-foreground border-accent/20',
  physical: 'bg-secondary/10 text-secondary border-secondary/20',
  digital: 'bg-muted text-muted-foreground border-muted',
};

const iconOptions = ['🎬', '🌙', '🍕', '🎢', '📖', '📱', '🎮', '⚽', '🎨', '🎁', '🏖️', '🍦'];

interface AISuggestion {
  name: string;
  description: string;
  price: number;
  category: RewardCategory;
  icon: string;
}

export default function ParentRewards() {
  const t = useT();
  const { allowed: rewardsAllowed, loading: gateLoading } = useFeatureGate(FEATURES.CUSTOM_REWARDS);
  const { data: rewards = [], isLoading } = useRewards();
  const createReward = useCreateReward();
  const deleteReward = useDeleteReward();

  const categoryLabels: Record<string, string> = {
    experience: t('parent.rewards.cat.experience'),
    privilege: t('parent.rewards.cat.privilege'),
    physical: t('parent.rewards.cat.physical'),
    digital: t('parent.rewards.cat.digital'),
  };

  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('50');
  const [category, setCategory] = useState<RewardCategory>('experience');
  const [icon, setIcon] = useState('🎁');

  // AI suggestions state
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const [aiAdding, setAiAdding] = useState<number | null>(null);

  const handleCreate = () => {
    if (!name || !price) return;
    createReward.mutate(
      { name, description, price: Number(price), icon, category },
      {
        onSuccess: () => {
          setDialogOpen(false);
          setName(''); setDescription(''); setPrice(''); setCategory('experience'); setIcon('🎁');
        },
      }
    );
  };

  const handleAiSuggest = async () => {
    setAiLoading(true);
    setAiSuggestions([]);
    try {
      const { data, error } = await supabase.functions.invoke('suggest-rewards', {
        body: { childAge: '8-12' },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setAiSuggestions(data.suggestions ?? []);
    } catch (err) {
      toast({
        title: t('parent.rewards.ai_error'),
        description: err instanceof Error ? err.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    } finally {
      setAiLoading(false);
    }
  };

  const handleAddSuggestion = (suggestion: AISuggestion, index: number) => {
    setAiAdding(index);
    createReward.mutate(
      {
        name: suggestion.name,
        description: suggestion.description,
        price: suggestion.price,
        icon: suggestion.icon,
        category: suggestion.category,
      },
      {
        onSuccess: () => {
          setAiAdding(null);
          toast({ title: `${suggestion.icon} ${suggestion.name}`, description: t('parent.rewards.added') });
        },
        onError: () => setAiAdding(null),
      }
    );
  };

  return (
    <FeatureGateWrapper
      allowed={rewardsAllowed || gateLoading}
      featureName={t('parent.rewards.title')}
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
                <p className="text-primary-foreground/60 text-xs font-medium uppercase tracking-wider">{t('parent.rewards.management')}</p>
                <h1 className="font-display text-2xl md:text-3xl font-bold text-primary-foreground">{t('parent.rewards.title')}</h1>
                <p className="text-primary-foreground/60 text-sm">{t('parent.rewards.subtitle')}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-2 text-center">
                  <p className="text-xs text-primary-foreground/60 uppercase tracking-wider">{t('parent.rewards.active')}</p>
                  <p className="font-display text-xl font-bold text-primary-foreground">{rewards.filter(r => r.available).length}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-2 text-center">
                  <p className="text-xs text-primary-foreground/60 uppercase tracking-wider">{t('parent.rewards.claimed')}</p>
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
            <Gift className="h-5 w-5 text-primary" /> {t('parent.rewards.title')}
          </h2>
          <p className="text-xs text-muted-foreground">{rewards.length} {t('parent.rewards.count')}</p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="rounded-xl font-display gap-1"
            onClick={() => { setAiDialogOpen(true); handleAiSuggest(); }}
          >
            <Sparkles className="h-4 w-4" /> IA
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="rounded-xl font-display gap-1">
                <Plus className="h-4 w-4" /> {t('parent.rewards.new_reward')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-display">{t('parent.rewards.create_reward')}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>{t('parent.rewards.icon')}</Label>
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
                  <Label>{t('parent.rewards.name')}</Label>
                  <Input placeholder={t('parent.rewards.name_placeholder')} value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>{t('parent.rewards.description')}</Label>
                  <Textarea placeholder={t('parent.rewards.desc_placeholder')} value={description} onChange={e => setDescription(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>{t('parent.rewards.price')}</Label>
                    <Input type="number" placeholder="50" value={price} onChange={e => setPrice(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('parent.rewards.category')}</Label>
                    <Select value={category} onValueChange={v => setCategory(v as RewardCategory)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="experience">{t('parent.rewards.cat.experience')}</SelectItem>
                        <SelectItem value="privilege">{t('parent.rewards.cat.privilege')}</SelectItem>
                        <SelectItem value="physical">{t('parent.rewards.cat.physical')}</SelectItem>
                        <SelectItem value="digital">{t('parent.rewards.cat.digital')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button
                  className="w-full rounded-xl font-display"
                  disabled={!name || !price || createReward.isPending}
                  onClick={handleCreate}
                >
                  {createReward.isPending ? t('parent.rewards.creating') : t('parent.rewards.create_btn')}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {/* AI Suggestions Dialog */}
      <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              {t('parent.rewards.ai_title')}
            </DialogTitle>
          </DialogHeader>

          {aiLoading ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">{t('parent.rewards.ai_loading')}</p>
            </div>
          ) : aiSuggestions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">{t('parent.rewards.ai_empty')}</p>
              <Button size="sm" className="mt-3 rounded-xl font-display gap-1" onClick={handleAiSuggest}>
                <Sparkles className="h-4 w-4" /> {t('parent.rewards.ai_retry')}
              </Button>
            </div>
          ) : (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              {aiSuggestions.map((s, i) => (
                <Card key={i} className="border-border/50">
                  <CardContent className="p-3 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center text-xl shrink-0">
                      {s.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-display font-bold text-sm truncate">{s.name}</h4>
                        <Badge variant="outline" className={`text-xs shrink-0 ${categoryColors[s.category] ?? ''}`}>
                          {categoryLabels[s.category] ?? s.category}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{s.description}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-display text-sm font-bold">🪙 {s.price}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 rounded-lg text-xs font-display gap-1"
                          disabled={aiAdding === i || createReward.isPending}
                          onClick={() => handleAddSuggestion(s, i)}
                        >
                          {aiAdding === i ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                          {t('parent.rewards.add')}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button
                variant="ghost"
                size="sm"
                className="w-full rounded-xl font-display gap-1 text-xs"
                onClick={handleAiSuggest}
                disabled={aiLoading}
              >
                <Sparkles className="h-3.5 w-3.5" /> {t('parent.rewards.ai_more')}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

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
            <p className="font-display font-bold text-sm">{t('parent.rewards.no_rewards')}</p>
            <p className="text-xs text-muted-foreground mt-1">{t('parent.rewards.no_rewards_hint')}</p>
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
                    <Badge variant="outline" className={`text-xs ${categoryColors[reward.category]}`}>
                      {categoryLabels[reward.category]}
                    </Badge>
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-sm">{reward.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{reward.description}</p>
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
                      {t('parent.rewards.remove')}
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
