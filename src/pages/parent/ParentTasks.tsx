import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, CheckCircle, ListTodo, Clock, Loader2, Award, Trash2, Pencil, Sparkles, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useHouseholdTasks, useCreateTask, useApproveTask, useDeleteTask, useUpdateTask, type TaskCategory } from '@/hooks/use-household-tasks';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useChildren } from '@/hooks/use-children';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, x: -10 }, show: { opacity: 1, x: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

const statusConfig = {
  pending: { label: 'Pendente', icon: Clock, className: 'bg-muted text-muted-foreground border-0' },
  in_progress: { label: 'Em Progresso', icon: Loader2, className: 'bg-[hsl(var(--kivara-light-blue))] text-primary border-0' },
  completed: { label: 'A Aprovar', icon: CheckCircle, className: 'bg-[hsl(var(--kivara-light-gold))] text-accent-foreground border-0' },
  approved: { label: 'Aprovada', icon: Award, className: 'bg-[hsl(var(--kivara-light-green))] text-secondary border-0' },
};

const categoryLabels: Record<string, string> = { cleaning: '🧹 Limpeza', studying: '📚 Estudo', helping: '🤝 Ajuda', other: '📌 Outro' };
const recurrenceLabels: Record<string, string> = { daily: '🔄 Diária', weekly: '📅 Semanal', monthly: '🗓️ Mensal' };

export default function ParentTasks() {
  const { data: tasks = [], isLoading } = useHouseholdTasks();
  const { data: children = [] } = useChildren();
  const createTask = useCreateTask();
  const approveTask = useApproveTask();
  const deleteTask = useDeleteTask();
  const updateTask = useUpdateTask();
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [reward, setReward] = useState('20');
  const [category, setCategory] = useState<TaskCategory>('other');
  const [selectedChild, setSelectedChild] = useState('');
  const [recurrence, setRecurrence] = useState('none');

  // Edit state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editTaskId, setEditTaskId] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editReward, setEditReward] = useState('');
  const [editCategory, setEditCategory] = useState<TaskCategory>('other');

  // AI suggest state
  const [aiSuggestOpen, setAiSuggestOpen] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [aiLoading, setAiLoading] = useState(false);

  const openEditDialog = (task: { id: string; title: string; reward: number; category: TaskCategory }) => {
    setEditTaskId(task.id);
    setEditTitle(task.title);
    setEditReward(String(task.reward));
    setEditCategory(task.category);
    setEditDialogOpen(true);
  };

  const handleEdit = () => {
    if (!editTitle || !editReward) return;
    updateTask.mutate(
      { taskId: editTaskId, title: editTitle, reward: Number(editReward), category: editCategory },
      { onSuccess: () => setEditDialogOpen(false) }
    );
  };

  const handleCreate = () => {
    if (!title || !selectedChild || !reward) return;
    createTask.mutate(
      {
        title,
        description,
        reward: Number(reward),
        category,
        childProfileId: selectedChild,
        isRecurring: recurrence !== 'none',
        recurrence: recurrence !== 'none' ? recurrence : undefined,
      },
      {
        onSuccess: () => {
          setDialogOpen(false);
          setTitle('');
          setDescription('');
          setReward('20');
          setCategory('other');
          setSelectedChild('');
          setRecurrence('none');
        },
      }
    );
  };

  const handleAiSuggest = async () => {
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('suggest-tasks', {
        body: { childAge: '8-12', category: category !== 'other' ? category : undefined },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setAiSuggestions(data.suggestions || []);
      setAiSuggestOpen(true);
    } catch (e: any) {
      toast({ title: '❌ Erro', description: e.message, variant: 'destructive' });
    } finally {
      setAiLoading(false);
    }
  };

  const applySuggestion = (s: any) => {
    setTitle(s.title);
    setDescription(s.description || '');
    setReward(String(s.reward || 20));
    setCategory(s.category || 'other');
    setAiSuggestOpen(false);
    setDialogOpen(true);
  };

  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    toApprove: tasks.filter(t => t.status === 'completed').length,
    approved: tasks.filter(t => t.status === 'approved').length,
  };

  return (
    <div className="space-y-6">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-2xl gradient-kivara p-6 text-primary-foreground">
        <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute top-0 left-1/3 w-60 h-20 rounded-full bg-white/5 blur-2xl" />
        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-primary-foreground/60 text-[10px] uppercase tracking-wider font-medium">Gestão</p>
            <h1 className="font-display text-2xl font-bold mt-1">Tarefas</h1>
            <p className="text-sm text-primary-foreground/60 mt-1">Cria e aprova tarefas para as crianças</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleAiSuggest}
              disabled={aiLoading}
              className="rounded-2xl font-display gap-2 bg-white/15 hover:bg-white/25 text-primary-foreground border-0 backdrop-blur-sm"
            >
              {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Sugerir IA
            </Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-2xl font-display gap-2 bg-white/15 hover:bg-white/25 text-primary-foreground border-0 backdrop-blur-sm shadow-lg">
                  <Plus className="h-4 w-4" /> Nova Tarefa
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="font-display">Criar Tarefa</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Título</Label>
                    <Input placeholder="Ex: Arrumar o quarto" value={title} onChange={e => setTitle(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Descrição</Label>
                    <Textarea placeholder="Descreve a tarefa..." value={description} onChange={e => setDescription(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Recompensa (KVC)</Label>
                      <Input type="number" placeholder="20" value={reward} onChange={e => setReward(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Categoria</Label>
                      <Select value={category} onValueChange={v => setCategory(v as TaskCategory)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cleaning">🧹 Limpeza</SelectItem>
                          <SelectItem value="studying">📚 Estudo</SelectItem>
                          <SelectItem value="helping">🤝 Ajuda</SelectItem>
                          <SelectItem value="other">📌 Outro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Criança</Label>
                      <Select value={selectedChild} onValueChange={setSelectedChild}>
                        <SelectTrigger><SelectValue placeholder="Selecciona..." /></SelectTrigger>
                        <SelectContent>
                          {children.map(c => (
                            <SelectItem key={c.profileId} value={c.profileId}>
                              {c.avatar} {c.displayName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Recorrência</Label>
                      <Select value={recurrence} onValueChange={setRecurrence}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Única vez</SelectItem>
                          <SelectItem value="daily">🔄 Diária</SelectItem>
                          <SelectItem value="weekly">📅 Semanal</SelectItem>
                          <SelectItem value="monthly">🗓️ Mensal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button
                    className="w-full rounded-xl font-display"
                    disabled={!title || !selectedChild || !reward || createTask.isPending}
                    onClick={handleCreate}
                  >
                    {createTask.isPending ? 'A criar...' : '✅ Criar Tarefa'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: stats.total, icon: ListTodo, bg: 'bg-[hsl(var(--kivara-light-blue))]', color: 'text-primary' },
          { label: 'Pendentes', value: stats.pending, icon: Clock, bg: 'bg-muted', color: 'text-muted-foreground' },
          { label: 'A Aprovar', value: stats.toApprove, icon: CheckCircle, bg: 'bg-[hsl(var(--kivara-light-gold))]', color: 'text-accent-foreground' },
          { label: 'Aprovadas', value: stats.approved, icon: Award, bg: 'bg-[hsl(var(--kivara-light-green))]', color: 'text-secondary' },
        ].map((s) => (
          <motion.div key={s.label} variants={item} whileHover={{ scale: 1.03, y: -2 }}>
            <Card className="border-border/50 overflow-hidden hover:shadow-md transition-all duration-300">
              <div className="h-0.5 gradient-kivara" />
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`${s.bg} rounded-2xl p-2.5`}>
                  <s.icon className={`h-4 w-4 ${s.color}`} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{s.label}</p>
                  <p className="font-display font-bold text-xl">{s.value}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Task List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="border-border/50">
              <CardContent className="p-4 flex items-center gap-4">
                <Skeleton className="w-12 h-12 rounded-2xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-6 w-20 rounded-xl" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center text-3xl mx-auto mb-4">📋</div>
            <p className="font-display font-bold text-sm">Sem tarefas ainda</p>
            <p className="text-xs text-muted-foreground mt-1">Clica em "Nova Tarefa" para começar!</p>
          </CardContent>
        </Card>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
          {tasks.map((task) => {
            const config = statusConfig[task.status];
            const StatusIcon = config.icon;
            return (
              <motion.div key={task.id} variants={item} whileHover={{ x: 4 }}>
                <Card className="group hover:shadow-kivara transition-all duration-300 border-border/50 overflow-hidden">
                  <div className="h-0.5 gradient-gold opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <CardContent className="p-0">
                    <div className="flex items-center gap-4 p-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[hsl(var(--kivara-light-blue))] to-[hsl(var(--kivara-light-green))] flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                        {task.childAvatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h3 className="font-display font-bold text-sm">{task.title}</h3>
                          <span className="text-[10px] text-muted-foreground bg-muted rounded-lg px-2 py-0.5">{categoryLabels[task.category]}</span>
                          {(task as any).is_recurring && (
                            <Badge variant="outline" className="text-[9px] gap-1 px-1.5 py-0 border-primary/30 text-primary">
                              <RefreshCw className="h-2.5 w-2.5" />
                              {recurrenceLabels[(task as any).recurrence] || 'Recorrente'}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{task.description}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-xs font-display font-bold bg-[hsl(var(--kivara-light-gold))] px-2.5 py-0.5 rounded-xl">🪙 {task.reward}</span>
                          <span className="text-xs text-muted-foreground">· {task.childDisplayName}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="secondary" className={`text-[10px] font-display gap-1 rounded-xl px-2.5 py-1 ${config.className}`}>
                          <StatusIcon className="h-3 w-3" />
                          {config.label}
                        </Badge>
                        {task.status === 'completed' && (
                          <Button
                            size="sm"
                            className="rounded-xl gap-1.5 font-display bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-sm"
                            disabled={approveTask.isPending}
                            onClick={() => approveTask.mutate(task.id)}
                          >
                            <CheckCircle className="h-3.5 w-3.5" /> Aprovar
                          </Button>
                        )}
                        {task.status !== 'approved' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-xl h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                            onClick={() => openEditDialog({
                              id: task.id,
                              title: task.title,
                              reward: task.reward,
                              category: task.category,
                            })}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        {task.status !== 'approved' && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="rounded-xl h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle className="font-display">Eliminar tarefa?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  A tarefa "{task.title}" será eliminada permanentemente. Esta acção não pode ser revertida.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  onClick={() => deleteTask.mutate(task.id)}
                                >
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">Editar Tarefa</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Título</Label>
              <Input value={editTitle} onChange={e => setEditTitle(e.target.value)} maxLength={100} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Recompensa (KVC)</Label>
                <Input type="number" value={editReward} onChange={e => setEditReward(e.target.value)} min={0} max={9999} />
              </div>
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select value={editCategory} onValueChange={v => setEditCategory(v as TaskCategory)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cleaning">🧹 Limpeza</SelectItem>
                    <SelectItem value="studying">📚 Estudo</SelectItem>
                    <SelectItem value="helping">🤝 Ajuda</SelectItem>
                    <SelectItem value="other">📌 Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              className="w-full rounded-xl font-display"
              disabled={!editTitle || !editReward || updateTask.isPending}
              onClick={handleEdit}
            >
              {updateTask.isPending ? 'A guardar...' : '✏️ Guardar Alterações'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Suggestions Dialog */}
      <Dialog open={aiSuggestOpen} onOpenChange={setAiSuggestOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" /> Sugestões da IA
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
                  <Badge variant="outline" className="text-[10px]">🪙 {s.reward}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{s.description}</p>
                <span className="text-[10px] text-muted-foreground mt-1 inline-block">{categoryLabels[s.category] || s.category}</span>
              </motion.button>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAiSuggestOpen(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
