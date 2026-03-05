import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockChallenges, mockClassrooms } from '@/data/mock-data';
import { Plus, Target, Trophy, Clock, Sparkles, Users, Pencil, Trash2, Calendar } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { CollectiveChallenge, ChallengeStatus } from '@/types/kivara';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

const statusConfig = {
  active: { label: 'Em Curso', icon: Target, className: 'bg-primary/10 text-primary border-primary/20' },
  upcoming: { label: 'Brevemente', icon: Clock, className: 'bg-accent/10 text-accent-foreground border-accent/20' },
  completed: { label: 'Concluído', icon: Trophy, className: 'bg-secondary/10 text-secondary border-secondary/20' },
};

const typeLabels: Record<string, string> = { saving: 'Poupança', budgeting: 'Orçamento', teamwork: 'Trabalho em Equipa' };
const typeIcons: Record<string, string> = { saving: '🐷', budgeting: '📊', teamwork: '🤝' };

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

export default function TeacherChallenges() {
  const [challenges, setChallenges] = useState<CollectiveChallenge[]>([...mockChallenges]);
  const [form, setForm] = useState<ChallengeFormData>({ ...emptyForm });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogId, setDeleteDialogId] = useState<string | null>(null);

  const activeChallenges = challenges.filter(c => c.status === 'active');
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

  const openEdit = (challenge: CollectiveChallenge) => {
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

  const handleSave = () => {
    if (!form.title || !form.classroomId || !form.targetAmount) {
      toast({ title: 'Campos obrigatórios', description: 'Preenche o título, turma e meta.', variant: 'destructive' });
      return;
    }

    if (editingId) {
      setChallenges(prev => prev.map(c =>
        c.id === editingId ? {
          ...c,
          title: form.title,
          description: form.description,
          classroomId: form.classroomId,
          type: form.type,
          icon: form.icon,
          targetAmount: Number(form.targetAmount),
          reward: Number(form.reward) || 0,
          kivaPointsReward: Number(form.kivaPointsReward) || 0,
          startDate: form.startDate,
          endDate: form.endDate,
          status: form.status,
        } : c
      ));
      toast({ title: 'Desafio atualizado! ✏️', description: `"${form.title}" foi guardado.` });
    } else {
      const newChallenge: CollectiveChallenge = {
        id: `challenge-${Date.now()}`,
        title: form.title,
        description: form.description,
        classroomId: form.classroomId,
        type: form.type,
        icon: form.icon,
        targetAmount: Number(form.targetAmount),
        currentAmount: 0,
        reward: Number(form.reward) || 0,
        kivaPointsReward: Number(form.kivaPointsReward) || 0,
        status: form.status,
        participants: [],
        startDate: form.startDate,
        endDate: form.endDate,
      };
      setChallenges(prev => [newChallenge, ...prev]);
      toast({ title: 'Desafio criado! 🎯', description: `"${form.title}" foi adicionado à turma.` });
    }

    setDialogOpen(false);
    setForm({ ...emptyForm });
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    const challenge = challenges.find(c => c.id === id);
    setChallenges(prev => prev.filter(c => c.id !== id));
    setDeleteDialogId(null);
    toast({ title: 'Desafio eliminado 🗑️', description: `"${challenge?.title}" foi removido.` });
  };

  const renderChallenge = (challenge: CollectiveChallenge) => {
    const classroom = mockClassrooms.find(c => c.id === challenge.classroomId);
    const pct = Math.round((challenge.currentAmount / challenge.targetAmount) * 100);
    const status = statusConfig[challenge.status];
    const StatusIcon = status.icon;
    const canEdit = challenge.status !== 'completed';

    return (
      <motion.div key={challenge.id} variants={item}>
        <Card className="border-border/50 overflow-hidden hover:shadow-lg transition-all duration-300">
          <div className="h-0.5 bg-gradient-to-r from-primary to-secondary" />
          <CardContent className="p-5 space-y-4">
            <div className="flex items-start justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <motion.div
                  className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center text-3xl"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: 'spring' as const, stiffness: 400 }}
                >
                  {challenge.icon}
                </motion.div>
                <div>
                  <h3 className="font-display font-bold text-base">{challenge.title}</h3>
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
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(challenge)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setDeleteDialogId(challenge.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <p className="text-sm text-muted-foreground">{challenge.description}</p>

            {challenge.status !== 'upcoming' && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Progresso da turma</span>
                  <span className="font-display font-bold text-primary">{pct}%</span>
                </div>
                <Progress value={pct} className="h-3" />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>🪙 {challenge.currentAmount} / {challenge.targetAmount}</span>
                  <span>{challenge.participants.length} participantes</span>
                </div>
              </div>
            )}

            {challenge.participants.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-display font-semibold text-muted-foreground flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" /> Contribuições
                </p>
                <div className="flex flex-wrap gap-2">
                  {challenge.participants.map((p) => (
                    <div key={p.childId} className="flex items-center gap-1.5 bg-muted/30 rounded-xl px-3 py-1.5 text-xs">
                      <span className="font-display font-bold">🪙 {p.contribution}</span>
                    </div>
                  ))}
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

  const formDialog = (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">
            {editingId ? '✏️ Editar Desafio' : '🏆 Criar Desafio Colectivo'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <div className="space-y-2">
            <Label>Título *</Label>
            <Input placeholder="Ex: Operação Mealheiro" value={form.title} onChange={e => updateForm('title', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea placeholder="Descreve o objectivo do desafio..." value={form.description} onChange={e => updateForm('description', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Turma *</Label>
              <Select value={form.classroomId} onValueChange={v => updateForm('classroomId', v)}>
                <SelectTrigger><SelectValue placeholder="Escolhe" /></SelectTrigger>
                <SelectContent>
                  {mockClassrooms.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={form.type} onValueChange={v => updateForm('type', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="saving">🐷 Poupança</SelectItem>
                  <SelectItem value="budgeting">📊 Orçamento</SelectItem>
                  <SelectItem value="teamwork">🤝 Equipa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Meta (KivaCoins) *</Label>
              <Input type="number" placeholder="1000" value={form.targetAmount} onChange={e => updateForm('targetAmount', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Recompensa 🪙</Label>
              <Input type="number" placeholder="50" value={form.reward} onChange={e => updateForm('reward', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>KivaPoints</Label>
              <Input type="number" placeholder="20" value={form.kivaPointsReward} onChange={e => updateForm('kivaPointsReward', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select value={form.status} onValueChange={v => updateForm('status', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="upcoming">🕐 Brevemente</SelectItem>
                  <SelectItem value="active">🎯 Em Curso</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Data Início</Label>
              <Input type="date" value={form.startDate} onChange={e => updateForm('startDate', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Data Fim</Label>
              <Input type="date" value={form.endDate} onChange={e => updateForm('endDate', e.target.value)} />
            </div>
          </div>

          {/* Icon preview */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
            <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center text-2xl">
              {form.icon}
            </div>
            <div>
              <p className="text-sm font-display font-bold">{form.title || 'Novo Desafio'}</p>
              <p className="text-[11px] text-muted-foreground">{typeLabels[form.type]} · {form.targetAmount ? `Meta: ${form.targetAmount} 🪙` : 'Sem meta'}</p>
            </div>
          </div>

          <Button className="w-full rounded-xl font-display" onClick={handleSave}>
            {editingId ? '✏️ Guardar Alterações' : '🏆 Criar Desafio'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  const deleteDialog = (
    <Dialog open={!!deleteDialogId} onOpenChange={open => !open && setDeleteDialogId(null)}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display">Eliminar Desafio?</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Esta ação não pode ser revertida. O desafio e todo o progresso dos alunos serão removidos.
        </p>
        <div className="flex gap-2 justify-end pt-2">
          <Button variant="outline" className="rounded-xl" onClick={() => setDeleteDialogId(null)}>Cancelar</Button>
          <Button variant="destructive" className="rounded-xl" onClick={() => deleteDialogId && handleDelete(deleteDialogId)}>
            <Trash2 className="h-4 w-4 mr-1" /> Eliminar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4 sm:space-y-6 max-w-5xl mx-auto">
      {formDialog}
      {deleteDialog}

      {/* Hero */}
      <motion.div variants={item}>
        <Card className="border-0 overflow-hidden relative shadow-kivara">
          <div className="absolute inset-0 bg-gradient-to-br from-accent via-primary to-secondary" />
          <div className="absolute top-[-30%] right-[-10%] w-[45%] h-[80%] rounded-full bg-white/5 blur-3xl" />
          <CardContent className="relative z-10 p-4 sm:p-6 md:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-2">
                <p className="text-primary-foreground/60 text-xs font-medium uppercase tracking-wider">Educação Financeira</p>
                <h1 className="font-display text-xl sm:text-2xl md:text-3xl font-bold text-primary-foreground">Desafios Colectivos</h1>
                <p className="text-primary-foreground/60 text-sm">Cria e gere desafios que envolvem toda a turma</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-2 text-center">
                  <p className="text-[10px] text-primary-foreground/60 uppercase tracking-wider">Activos</p>
                  <p className="font-display text-xl font-bold text-primary-foreground">{activeChallenges.length}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-2 text-center">
                  <p className="text-[10px] text-primary-foreground/60 uppercase tracking-wider">Concluídos</p>
                  <p className="font-display text-xl font-bold text-primary-foreground">{completedChallenges.length}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Add Challenge */}
      <motion.div variants={item} className="flex justify-between items-center">
        <div>
          <h2 className="font-display text-lg font-bold flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" /> Desafios
          </h2>
        </div>
        <Button size="sm" className="rounded-xl font-display gap-1" onClick={openCreate}>
          <Plus className="h-4 w-4" /> Novo Desafio
        </Button>
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="w-full grid grid-cols-3 rounded-xl h-10 sm:h-11">
          <TabsTrigger value="active" className="rounded-lg font-display text-[10px] sm:text-xs gap-1 sm:gap-1.5">
            <Target className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> <span className="hidden xs:inline">Em Curso</span> ({activeChallenges.length})
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="rounded-lg font-display text-[10px] sm:text-xs gap-1 sm:gap-1.5">
            <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> <span className="hidden xs:inline">Brevemente</span> ({upcomingChallenges.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="rounded-lg font-display text-[10px] sm:text-xs gap-1 sm:gap-1.5">
            <Trophy className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> <span className="hidden xs:inline">Concluídos</span> ({completedChallenges.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-4 space-y-4">
          {activeChallenges.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhum desafio em curso</p>}
          {activeChallenges.map(renderChallenge)}
        </TabsContent>

        <TabsContent value="upcoming" className="mt-4 space-y-4">
          {upcomingChallenges.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhum desafio agendado</p>}
          {upcomingChallenges.map(renderChallenge)}
        </TabsContent>

        <TabsContent value="completed" className="mt-4 space-y-4">
          {completedChallenges.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhum desafio concluído</p>}
          {completedChallenges.map(renderChallenge)}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
