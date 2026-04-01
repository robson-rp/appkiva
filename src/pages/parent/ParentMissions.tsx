import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Target, CheckCircle, Clock, Trash2, Pencil, Loader2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useHouseholdMissions, useCreateMission, useUpdateMission, useDeleteMission, type MissionType } from '@/hooks/use-missions';
import { useChildren } from '@/hooks/use-children';
import { useT } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, x: -10 }, show: { opacity: 1, x: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

const typeEmoji: Record<string, string> = { saving: '🏦', budgeting: '📊', planning: '📋', custom: '🎯' };

export default function ParentMissions() {
  const t = useT();
  const { toast } = useToast();
  const { data: missions = [], isLoading } = useHouseholdMissions();
  const { data: children = [] } = useChildren();
  const createMission = useCreateMission();
  const updateMission = useUpdateMission();
  const deleteMission = useDeleteMission();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<MissionType>('custom');
  const [reward, setReward] = useState('20');
  const [kivaPoints, setKivaPoints] = useState('15');
  const [targetAmount, setTargetAmount] = useState('');
  const [selectedChild, setSelectedChild] = useState('');

  // AI suggestions state
  const [aiSuggestOpen, setAiSuggestOpen] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [aiLoading, setAiLoading] = useState(false);

  const statusConfig: Record<string, { label: string; icon: any; className: string }> = {
    available: { label: t('parent.missions.status.available'), icon: Sparkles, className: 'bg-secondary/15 text-secondary border-0' },
    in_progress: { label: t('parent.missions.status.in_progress'), icon: Clock, className: 'bg-accent/15 text-accent-foreground border-0' },
    completed: { label: t('parent.missions.status.completed'), icon: CheckCircle, className: 'bg-primary/15 text-primary border-0' },
  };

  const typeLabels: Record<string, string> = {
    saving: t('parent.missions.type.saving'),
    budgeting: t('parent.missions.type.budgeting'),
    planning: t('parent.missions.type.planning'),
    custom: t('parent.missions.type.custom'),
  };

  function openCreate() {
    setEditId(null);
    setTitle('');
    setDescription('');
    setType('custom');
    setReward('20');
    setKivaPoints('15');
    setTargetAmount('');
    setSelectedChild(children[0]?.profileId ?? '');
    setDialogOpen(true);
  }

  function openEdit(m: any) {
    setEditId(m.id);
    setTitle(m.title);
    setDescription(m.description ?? '');
    setType(m.type);
    setReward(String(m.reward));
    setKivaPoints(String(m.kiva_points_reward));
    setTargetAmount(m.target_amount ? String(m.target_amount) : '');
    setSelectedChild(m.child_profile_id);
    setDialogOpen(true);
  }

  function handleSubmit() {
    if (!title.trim() || !selectedChild) return;
    const payload = {
      title: title.trim(),
      description: description.trim(),
      type,
      reward: Number(reward) || 10,
      kiva_points_reward: Number(kivaPoints) || 10,
      target_amount: targetAmount ? Number(targetAmount) : undefined,
      child_profile_id: selectedChild,
    };

    if (editId) {
      updateMission.mutate({ id: editId, ...payload }, { onSuccess: () => setDialogOpen(false) });
    } else {
      createMission.mutate(payload, { onSuccess: () => setDialogOpen(false) });
    }
  }

  const handleAiSuggest = async () => {
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('suggest-missions', {
        body: { childAge: '8-12', missionType: type !== 'custom' ? type : undefined },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setAiSuggestions(data.suggestions || []);
      setAiSuggestOpen(true);
    } catch (e: any) {
      toast({ title: '❌ ' + t('common.error'), description: e.message, variant: 'destructive' });
    } finally {
      setAiLoading(false);
    }
  };

  const applySuggestion = (s: any) => {
    setTitle(s.title);
    setDescription(s.description || '');
    setType(s.type || 'custom');
    setReward(String(s.reward || 20));
    setKivaPoints(String(s.kiva_points_reward || 15));
    setTargetAmount(s.target_amount ? String(s.target_amount) : '');
    setSelectedChild(children[0]?.profileId ?? '');
    setAiSuggestOpen(false);
    setDialogOpen(true);
  };

  const saving = createMission.isPending || updateMission.isPending;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">{t('parent.missions.title')}</h1>
          <p className="text-muted-foreground text-sm">{t('parent.missions.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleAiSuggest}
            disabled={aiLoading || children.length === 0}
            variant="outline"
            className="rounded-xl gap-1.5 font-display"
          >
            {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {t('parent.missions.suggest_ai')} IA
          </Button>
          <Button onClick={openCreate} className="rounded-xl gap-1.5 font-display" disabled={children.length === 0}>
            <Plus className="h-4 w-4" /> {t('parent.missions.btn.new')}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
      ) : missions.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center text-3xl mx-auto mb-4">🎯</div>
            <p className="font-display font-bold text-sm">{t('parent.missions.empty.title')}</p>
            <p className="text-xs text-muted-foreground mt-1">{t('parent.missions.empty.subtitle')}</p>
          </CardContent>
        </Card>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
          {missions.map((m: any) => {
            const cfg = statusConfig[m.status] ?? statusConfig.available;
            const StatusIcon = cfg.icon;
            return (
              <motion.div key={m.id} variants={item}>
                <Card className="border-border/50 overflow-hidden hover:shadow-md transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-muted/50 flex items-center justify-center text-xl shrink-0">
                        {typeEmoji[m.type] ?? '🎯'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <h3 className="font-display font-bold text-sm">{m.title}</h3>
                          <Badge className={`text-xs rounded-lg ${cfg.className}`}>
                            <StatusIcon className="h-3 w-3 mr-0.5" /> {cfg.label}
                          </Badge>
                          <Badge variant="outline" className="text-xs rounded-lg">
                            {m.child_avatar} {m.child_display_name}
                          </Badge>
                        </div>
                        {m.description && <p className="text-xs text-muted-foreground truncate">{m.description}</p>}
                        <div className="flex gap-3 mt-1.5 text-xs text-muted-foreground">
                          <span>🪙 {m.reward}</span>
                          <span>⭐ {m.kiva_points_reward} pts</span>
                          {m.target_amount && <span>🎯 {t('parent.missions.target').replace('{value}', m.target_amount)}</span>}
                          <span className="ml-auto text-xs">{typeLabels[m.type] ?? m.type}</span>
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl" onClick={() => openEdit(m)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl text-destructive hover:bg-destructive/10">
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="rounded-2xl">
                            <AlertDialogHeader>
                              <AlertDialogTitle>{t('parent.missions.delete.title')}</AlertDialogTitle>
                              <AlertDialogDescription>{t('parent.missions.delete.description')}</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{t('parent.missions.delete.cancel')}</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteMission.mutate(m.id)} className="bg-destructive text-destructive-foreground">{t('parent.missions.delete.confirm')}</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display">{editId ? t('parent.missions.dialog.title.edit') : t('parent.missions.dialog.title.create')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{t('parent.missions.dialog.label.title')}</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t('parent.missions.dialog.placeholder.title')} className="rounded-xl" />
            </div>
            <div>
              <Label>{t('parent.missions.dialog.label.description')}</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t('parent.missions.dialog.placeholder.description')} rows={2} className="rounded-xl" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>{t('parent.missions.dialog.label.type')}</Label>
                <Select value={type} onValueChange={(v) => setType(v as MissionType)}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="saving">🏦 {t('parent.missions.type.saving')}</SelectItem>
                    <SelectItem value="budgeting">📊 {t('parent.missions.type.budgeting')}</SelectItem>
                    <SelectItem value="planning">📋 {t('parent.missions.type.planning')}</SelectItem>
                    <SelectItem value="custom">🎯 {t('parent.missions.type.custom')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {!editId && (
                <div>
                  <Label>{t('parent.missions.dialog.label.child')}</Label>
                  <Select value={selectedChild} onValueChange={setSelectedChild}>
                    <SelectTrigger className="rounded-xl"><SelectValue placeholder={t('parent.missions.dialog.placeholder.child')} /></SelectTrigger>
                    <SelectContent>
                      {children.map((c) => (
                        <SelectItem key={c.profileId} value={c.profileId}>
                          {c.avatar} {c.displayName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>{t('parent.missions.dialog.label.coins')}</Label>
                <Input type="number" min="0" value={reward} onChange={(e) => setReward(e.target.value)} className="rounded-xl" />
              </div>
              <div>
                <Label>{t('parent.missions.dialog.label.points')}</Label>
                <Input type="number" min="0" value={kivaPoints} onChange={(e) => setKivaPoints(e.target.value)} className="rounded-xl" />
              </div>
              <div>
                <Label>{t('parent.missions.dialog.label.target')}</Label>
                <Input type="number" min="0" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} placeholder={t('parent.missions.dialog.placeholder.target')} className="rounded-xl" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>{t('parent.missions.dialog.btn.cancel')}</Button>
            <Button onClick={handleSubmit} disabled={saving || !title.trim()}>
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {editId ? t('parent.missions.dialog.btn.save') : t('parent.missions.dialog.btn.create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Suggestions Dialog */}
      <Dialog open={aiSuggestOpen} onOpenChange={setAiSuggestOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" /> {t('parent.missions.ai_suggestions')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {aiSuggestions.map((s, i) => (
              <motion.button
                key={i}
                whileTap={{ scale: 0.98 }}
                onClick={() => applySuggestion(s)}
                className="w-full p-3 rounded-xl border border-border/50 text-left hover:border-primary/50 hover:bg-primary/5 transition-all"
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="font-display font-bold text-sm">{s.title}</p>
                  <div className="flex gap-1.5">
                    <Badge variant="outline" className="text-xs">🪙 {s.reward}</Badge>
                    <Badge variant="outline" className="text-xs">⭐ {s.kiva_points_reward}</Badge>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{s.description}</p>
                <span className="text-xs text-muted-foreground mt-1 inline-block">
                  {typeEmoji[s.type] || '🎯'} {typeLabels[s.type] || s.type}
                  {s.target_amount && ` · 🎯 ${s.target_amount}`}
                </span>
              </motion.button>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAiSuggestOpen(false)}>{t('parent.missions.dialog.btn.cancel')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
