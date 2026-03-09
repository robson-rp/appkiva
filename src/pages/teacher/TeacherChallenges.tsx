import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCollectiveChallenges, useCreateCollectiveChallenge, useUpdateCollectiveChallenge, useDeleteCollectiveChallenge } from '@/hooks/use-collective-challenges';
import { useClassrooms } from '@/hooks/use-classrooms';
import { Plus, Target, Trophy, Clock, Sparkles, Users, Pencil, Trash2, Calendar, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { ChallengeStatus } from '@/types/kivara';
import { useT } from '@/contexts/LanguageContext';
import { Skeleton } from '@/components/ui/skeleton';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

interface ChallengeFormData {
  title: string;
  description: string;
  classroomId: string;
  type: 'saving' | 'budgeting' | 'teamwork';
  targetAmount: string;
  reward: string;
  kivaPointsReward: string;
  icon: string;
  startDate: string;
  endDate: string;
  status: ChallengeStatus;
}

const emptyForm: ChallengeFormData = {
  title: '',
  description: '',
  classroomId: '',
  type: 'saving',
  targetAmount: '',
  reward: '',
  kivaPointsReward: '',
  icon: '🐷',
  startDate: new Date().toISOString().split('T')[0],
  endDate: '',
  status: 'upcoming',
};

const typeIcons: Record<string, string> = { saving: '🐷', budgeting: '📊', teamwork: '🤝' };

export default function TeacherChallenges() {
  const t = useT();
  const { data: dbChallenges = [], isLoading } = useCollectiveChallenges();
  const { data: classrooms = [] } = useClassrooms();
  const createMutation = useCreateCollectiveChallenge();
  const updateMutation = useUpdateCollectiveChallenge();
  const deleteMutation = useDeleteCollectiveChallenge();

  const statusConfig = {
    active: { label: t('teacher.challenges.status_active'), icon: Target, className: 'bg-primary/10 text-primary border-primary/20' },
    upcoming: { label: t('teacher.challenges.status_upcoming'), icon: Clock, className: 'bg-accent/10 text-accent-foreground border-accent/20' },
    completed: { label: t('teacher.challenges.status_completed'), icon: Trophy, className: 'bg-secondary/10 text-secondary border-secondary/20' },
  };

  const typeLabels: Record<string, string> = {
    saving: t('teacher.challenges.type_saving'),
    budgeting: t('teacher.challenges.type_budgeting'),
    teamwork: t('teacher.challenges.type_teamwork'),
  };

  const [form, setForm] = useState<ChallengeFormData>({ ...emptyForm });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogId, setDeleteDialogId] = useState<string | null>(null);
  const [showUrgentOnly, setShowUrgentOnly] = useState(false);

  // Map DB rows to view model
  const challenges = useMemo(() => dbChallenges.map(c => ({
    id: c.id,
    title: c.title,
    description: c.description,
    classroomId: c.classroom_id,
    type: c.type as 'saving' | 'budgeting' | 'teamwork',
    icon: c.icon,
    targetAmount: Number(c.target_amount),
    currentAmount: Number(c.current_amount),
    reward: Number(c.reward),
    kivaPointsReward: Number(c.kiva_points_reward),
    status: c.status as ChallengeStatus,
    startDate: c.start_date,
    endDate: c.end_date,
  })), [dbChallenges]);

  const activeChallenges = challenges.filter(c => c.status === 'active');
  const urgentActive = activeChallenges.filter(c => c.targetAmount > 0 && (c.currentAmount / c.targetAmount) >= 0.5);
  const displayedActive = showUrgentOnly ? urgentActive : activeChallenges;
  const upcomingChallenges = challenges.filter(c => c.status === 'upcoming');
  const completedChallenges = challenges.filter(c => c.status === 'completed');

  const updateForm = (field: keyof ChallengeFormData, value: string) => {
    setForm(prev => ({
      ...prev,
      [field]: value,
      ...(field === 'type' ? { icon: typeIcons[value] || '🐷' } : {}),
    }));
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setDialogOpen(true);
  };

  const openEdit = (challenge: typeof challenges[0]) => {
    setEditingId(challenge.id);
    setForm({
      title: challenge.title,
      description: challenge.description,
      classroomId: challenge.classroomId,
      type: challenge.type,
      targetAmount: String(challenge.targetAmount),
      reward: String(challenge.reward),
      kivaPointsReward: String(challenge.kivaPointsReward),
      icon: challenge.icon,
      startDate: challenge.startDate,
      endDate: challenge.endDate,
      status: challenge.status,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.classroomId || !form.targetAmount) {
      toast({ title: t('teacher.challenges.required_fields'), description: t('teacher.challenges.required_hint'), variant: 'destructive' });
      return;
    }

    const payload = {
      title: form.title,
      description: form.description,
      classroom_id: form.classroomId,
      type: form.type,
      icon: form.icon,
      target_amount: Number(form.targetAmount),
      reward: Number(form.reward) || 0,
      kiva_points_reward: Number(form.kivaPointsReward) || 0,
      start_date: form.startDate,
      end_date: form.endDate || form.startDate,
      status: form.status,
    };

    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, ...payload });
        toast({ title: t('teacher.challenges.updated'), description: `"${form.title}"` });
      } else {
        await createMutation.mutateAsync(payload);
        toast({ title: t('teacher.challenges.created'), description: `"${form.title}"` });
      }
      setDialogOpen(false);
      setForm({ ...emptyForm });
      setEditingId(null);
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    const challenge = challenges.find(c => c.id === id);
    try {
      await deleteMutation.mutateAsync(id);
      toast({ title: t('teacher.challenges.deleted'), description: `"${challenge?.title}"` });
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    }
    setDeleteDialogId(null);
  };

  const renderChallenge = (challenge: typeof challenges[0]) => {
    const classroom = classrooms.find(c => c.id === challenge.classroomId);
    const pct = challenge.targetAmount > 0 ? Math.round((challenge.currentAmount / challenge.targetAmount) * 100) : 0;
    const status = statusConfig[challenge.status] ?? statusConfig.upcoming;
    const StatusIcon = status.icon;
    const canEdit = challenge.status !== 'completed';
    const isCritical = challenge.status === 'active' && pct >= 80;

    return (
      <motion.div key={challenge.id} variants={item}>
        <Card className={`border-border/50 overflow-hidden hover:shadow-lg transition-all duration-300 ${isCritical ? 'ring-2 ring-destructive/40 border-destructive/30' : ''}`}>
          <div className={`h-0.5 ${isCritical ? 'bg-gradient-to-r from-destructive to-destructive/60' : 'bg-gradient-to-r from-primary to-secondary'}`} />
          <CardContent className="p-5 space-y-4">
            <div className="flex items-start justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <motion.div
                  className="w-10 h-10 sm:w-14 sm:h-14 rounded-2xl bg-muted/50 flex items-center justify-center text-2xl sm:text-3xl shrink-0"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: 'spring' as const, stiffness: 400 }}
                >
                  {challenge.icon}
                </motion.div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-display font-bold text-base">{challenge.title}</h3>
                    {isCritical && <AlertTriangle className="h-4 w-4 text-destructive animate-pulse" />}
                  </div>
                  <p className="text-[11px] text-muted-foreground">{classroom?.name} · {typeLabels[challenge.type]}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={`text-[10px] font-display font-semibold ${status.className}`}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {status.label}
                </Badge>
                {canEdit && (
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-9 w-9 sm:h-7 sm:w-7" onClick={() => openEdit(challenge)}>
                      <Pencil className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9 sm:h-7 sm:w-7 text-destructive hover:text-destructive" onClick={() => setDeleteDialogId(challenge.id)}>
                      <Trash2 className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <p className="text-sm text-muted-foreground">{challenge.description}</p>

            {challenge.status !== 'upcoming' && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{t('teacher.challenges.progress')}</span>
                  <span className="font-display font-bold text-primary">{pct}%</span>
                </div>
                <Progress value={pct} className="h-3" />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>🪙 {challenge.currentAmount} / {challenge.targetAmount}</span>
                </div>
              </div>
            )}

            <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between pt-2 border-t border-border/30 text-xs text-muted-foreground gap-1">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-accent-foreground" /> +{challenge.reward} 🪙
                </span>
                <span>+{challenge.kivaPointsReward} pts</span>
              </div>
              <span className="text-[10px] sm:text-xs flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {challenge.startDate} → {challenge.endDate}
              </span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-5xl mx-auto">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4 sm:space-y-6 max-w-5xl mx-auto w-full min-w-0">
      {/* Form Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editingId ? t('teacher.challenges.edit_title') : t('teacher.challenges.create_title')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            <div className="space-y-2">
              <Label>{t('teacher.challenges.form_title')} *</Label>
              <Input placeholder={t('teacher.challenges.form_title_placeholder')} value={form.title} onChange={e => updateForm('title', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{t('teacher.challenges.form_desc')}</Label>
              <Textarea placeholder={t('teacher.challenges.form_desc_placeholder')} value={form.description} onChange={e => updateForm('description', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>{t('teacher.challenges.form_class')} *</Label>
                <Select value={form.classroomId} onValueChange={v => updateForm('classroomId', v)}>
                  <SelectTrigger><SelectValue placeholder={t('teacher.classes.select')} /></SelectTrigger>
                  <SelectContent>
                    {classrooms.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('teacher.challenges.form_type')}</Label>
                <Select value={form.type} onValueChange={v => updateForm('type', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="saving">🐷 {t('teacher.challenges.type_saving')}</SelectItem>
                    <SelectItem value="budgeting">📊 {t('teacher.challenges.type_budgeting')}</SelectItem>
                    <SelectItem value="teamwork">🤝 {t('teacher.challenges.type_teamwork')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>{t('teacher.challenges.form_target')} *</Label>
                <Input type="number" placeholder="1000" value={form.targetAmount} onChange={e => updateForm('targetAmount', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>{t('teacher.challenges.form_reward')}</Label>
                <Input type="number" placeholder="50" value={form.reward} onChange={e => updateForm('reward', e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>{t('teacher.challenges.form_points')}</Label>
                <Input type="number" placeholder="20" value={form.kivaPointsReward} onChange={e => updateForm('kivaPointsReward', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>{t('teacher.challenges.form_status')}</Label>
                <Select value={form.status} onValueChange={v => updateForm('status', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upcoming">🕐 {t('teacher.challenges.status_upcoming')}</SelectItem>
                    <SelectItem value="active">🎯 {t('teacher.challenges.status_active')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>{t('teacher.challenges.form_start')}</Label>
                <Input type="date" value={form.startDate} onChange={e => updateForm('startDate', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>{t('teacher.challenges.form_end')}</Label>
                <Input type="date" value={form.endDate} onChange={e => updateForm('endDate', e.target.value)} />
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
              <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center text-2xl">{form.icon}</div>
              <div>
                <p className="text-sm font-display font-bold">{form.title || t('teacher.challenges.new')}</p>
                <p className="text-[11px] text-muted-foreground">{typeLabels[form.type]} · {form.targetAmount ? `${t('teacher.challenges.form_target').split(' ')[0]}: ${form.targetAmount} 🪙` : ''}</p>
              </div>
            </div>
            <Button className="w-full rounded-xl font-display" onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}>
              {editingId ? t('teacher.challenges.save') : t('teacher.challenges.create')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteDialogId} onOpenChange={open => !open && setDeleteDialogId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display">{t('teacher.challenges.delete_title')}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">{t('teacher.challenges.delete_desc')}</p>
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" className="rounded-xl" onClick={() => setDeleteDialogId(null)}>{t('common.cancel')}</Button>
            <Button variant="destructive" className="rounded-xl" disabled={deleteMutation.isPending} onClick={() => deleteDialogId && handleDelete(deleteDialogId)}>
              <Trash2 className="h-4 w-4 mr-1" /> {t('common.delete')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Hero */}
      <motion.div variants={item}>
        <Card className="border-0 overflow-hidden relative shadow-kivara">
          <div className="absolute inset-0 bg-gradient-to-br from-accent via-primary to-secondary" />
          <div className="absolute top-[-30%] right-[-10%] w-[45%] h-[80%] rounded-full bg-white/5 blur-3xl" />
          <CardContent className="relative z-10 p-4 sm:p-6 md:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-2">
                <p className="text-primary-foreground/60 text-xs font-medium uppercase tracking-wider">{t('teacher.challenges.fin_ed')}</p>
                <h1 className="font-display text-xl sm:text-2xl md:text-3xl font-bold text-primary-foreground">{t('teacher.challenges.title')}</h1>
                <p className="text-primary-foreground/60 text-sm">{t('teacher.challenges.subtitle')}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-2 text-center">
                  <p className="text-[10px] text-primary-foreground/60 uppercase tracking-wider">{t('teacher.challenges.active')}</p>
                  <p className="font-display text-xl font-bold text-primary-foreground">{activeChallenges.length}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-2 text-center">
                  <p className="text-[10px] text-primary-foreground/60 uppercase tracking-wider">{t('teacher.challenges.completed')}</p>
                  <p className="font-display text-xl font-bold text-primary-foreground">{completedChallenges.length}</p>
                </div>
                {urgentActive.length > 0 && (
                  <div className="bg-destructive/20 backdrop-blur-sm rounded-2xl px-4 py-2 text-center ring-1 ring-destructive/30">
                    <p className="text-[10px] text-primary-foreground/60 uppercase tracking-wider flex items-center gap-1 justify-center">
                      <AlertTriangle className="h-3 w-3" /> {t('teacher.challenges.urgent')}
                    </p>
                    <p className="font-display text-xl font-bold text-primary-foreground">{urgentActive.length}</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Add Challenge */}
      <motion.div variants={item} className="flex justify-between items-center">
        <h2 className="font-display text-lg font-bold flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" /> {t('teacher.challenges.title')}
        </h2>
        <Button size="sm" className="rounded-xl font-display gap-1" onClick={openCreate}>
          <Plus className="h-4 w-4" /> {t('teacher.challenges.new')}
        </Button>
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="w-full grid grid-cols-3 rounded-xl h-10 sm:h-11">
          <TabsTrigger value="active" className="rounded-lg font-display text-[10px] sm:text-xs gap-1 sm:gap-1.5">
            <Target className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> <span className="hidden xs:inline">{t('teacher.challenges.tab_active')}</span> ({activeChallenges.length})
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="rounded-lg font-display text-[10px] sm:text-xs gap-1 sm:gap-1.5">
            <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> <span className="hidden xs:inline">{t('teacher.challenges.tab_upcoming')}</span> ({upcomingChallenges.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="rounded-lg font-display text-[10px] sm:text-xs gap-1 sm:gap-1.5">
            <Trophy className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> <span className="hidden xs:inline">{t('teacher.challenges.tab_completed')}</span> ({completedChallenges.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-4 space-y-4">
          {urgentActive.length > 0 && (
            <div className="flex items-center gap-2">
              <Button
                variant={showUrgentOnly ? 'default' : 'outline'}
                size="sm"
                className="rounded-xl font-display text-xs gap-1.5"
                onClick={() => setShowUrgentOnly(prev => !prev)}
              >
                <AlertTriangle className="h-3.5 w-3.5" />
                {t('teacher.challenges.near_end')} ({urgentActive.length})
              </Button>
            </div>
          )}
          {displayedActive.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              {showUrgentOnly ? t('teacher.challenges.no_near_end') : t('teacher.challenges.no_active')}
            </p>
          )}
          {displayedActive.map(renderChallenge)}
        </TabsContent>

        <TabsContent value="upcoming" className="mt-4 space-y-4">
          {upcomingChallenges.length === 0 && <p className="text-center text-muted-foreground py-8">{t('teacher.challenges.no_upcoming')}</p>}
          {upcomingChallenges.map(renderChallenge)}
        </TabsContent>

        <TabsContent value="completed" className="mt-4 space-y-4">
          {completedChallenges.length === 0 && <p className="text-center text-muted-foreground py-8">{t('teacher.challenges.no_completed')}</p>}
          {completedChallenges.map(renderChallenge)}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
