import { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Plus, Pencil, Trash2, GripVertical, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAllLessons } from '@/hooks/use-lessons';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { LESSON_CATEGORIES, DIFFICULTY_CONFIG } from '@/types/kivara';

interface LessonForm {
  title: string;
  description: string;
  icon: string;
  category: string;
  difficulty: string;
  estimated_minutes: number;
  kiva_points_reward: number;
  sort_order: number;
  is_active: boolean;
  blocks: string;
  quiz: string;
}

const emptyForm: LessonForm = {
  title: '',
  description: '',
  icon: '📚',
  category: 'saving',
  difficulty: 'beginner',
  estimated_minutes: 3,
  kiva_points_reward: 15,
  sort_order: 0,
  is_active: true,
  blocks: '[]',
  quiz: '[]',
};

export default function AdminLessons() {
  const { data: lessons, isLoading } = useAllLessons();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<LessonForm>(emptyForm);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm, sort_order: (lessons?.length || 0) + 1 });
    setDialogOpen(true);
  };

  const openEdit = (lesson: any) => {
    setEditingId(lesson.id);
    setForm({
      title: lesson.title,
      description: lesson.description,
      icon: lesson.icon,
      category: lesson.category,
      difficulty: lesson.difficulty,
      estimated_minutes: lesson.estimated_minutes,
      kiva_points_reward: lesson.kiva_points_reward,
      sort_order: lesson.sort_order,
      is_active: lesson.is_active,
      blocks: JSON.stringify(lesson.blocks, null, 2),
      quiz: JSON.stringify(lesson.quiz, null, 2),
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const blocks = JSON.parse(form.blocks);
      const quiz = JSON.parse(form.quiz);

      const payload = {
        title: form.title,
        description: form.description,
        icon: form.icon,
        category: form.category,
        difficulty: form.difficulty,
        estimated_minutes: form.estimated_minutes,
        kiva_points_reward: form.kiva_points_reward,
        sort_order: form.sort_order,
        is_active: form.is_active,
        blocks,
        quiz,
      };

      if (editingId) {
        const { error } = await supabase.from('lessons').update(payload).eq('id', editingId);
        if (error) throw error;
        toast({ title: '✅ Lição atualizada' });
      } else {
        const { error } = await supabase.from('lessons').insert(payload);
        if (error) throw error;
        toast({ title: '✅ Lição criada' });
      }

      queryClient.invalidateQueries({ queryKey: ['lessons'] });
      setDialogOpen(false);
    } catch (e: any) {
      toast({ title: '❌ Erro', description: e.message, variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('lessons').delete().eq('id', id);
    if (error) {
      toast({ title: '❌ Erro ao eliminar', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: '🗑️ Lição eliminada' });
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
    }
  };

  const toggleActive = async (id: string, current: boolean) => {
    const { error } = await supabase.from('lessons').update({ is_active: !current }).eq('id', id);
    if (!error) queryClient.invalidateQueries({ queryKey: ['lessons'] });
  };

  const catEntries = Object.entries(LESSON_CATEGORIES);
  const diffEntries = Object.entries(DIFFICULTY_CONFIG);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" /> Gestão de Lições
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Micro-lições de educação financeira</p>
        </div>
        <Button onClick={openCreate} className="gap-2 rounded-xl">
          <Plus className="h-4 w-4" /> Nova Lição
        </Button>
      </motion.div>

      <Card className="border-border/50">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Lição</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Dificuldade</TableHead>
                <TableHead className="text-center">Pts</TableHead>
                <TableHead className="text-center">Ativa</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">A carregar...</TableCell></TableRow>
              ) : !lessons?.length ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Sem lições</TableCell></TableRow>
              ) : lessons.map((lesson: any) => (
                <TableRow key={lesson.id}>
                  <TableCell className="text-muted-foreground font-mono text-xs">{lesson.sort_order}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{lesson.icon}</span>
                      <div>
                        <p className="font-display font-bold text-sm text-foreground">{lesson.title}</p>
                        <p className="text-[11px] text-muted-foreground line-clamp-1">{lesson.description}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px]">
                      {(LESSON_CATEGORIES as any)[lesson.category]?.label || lesson.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={`text-[10px] border-0 ${(DIFFICULTY_CONFIG as any)[lesson.difficulty]?.color || ''}`}>
                      {(DIFFICULTY_CONFIG as any)[lesson.difficulty]?.label || lesson.difficulty}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center font-mono text-sm">{lesson.kiva_points_reward}</TableCell>
                  <TableCell className="text-center">
                    <Switch checked={lesson.is_active} onCheckedChange={() => toggleActive(lesson.id, lesson.is_active)} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEdit(lesson)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(lesson.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">{editingId ? 'Editar Lição' : 'Nova Lição'}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-[60px_1fr] gap-4">
              <div>
                <Label>Ícone</Label>
                <Input value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })} className="text-center text-xl" />
              </div>
              <div>
                <Label>Título</Label>
                <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              </div>
            </div>

            <div>
              <Label>Descrição</Label>
              <Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Categoria</Label>
                <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {catEntries.map(([k, v]) => <SelectItem key={k} value={k}>{v.icon} {v.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Dificuldade</Label>
                <Select value={form.difficulty} onValueChange={v => setForm({ ...form, difficulty: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {diffEntries.map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Ordem</Label>
                <Input type="number" value={form.sort_order} onChange={e => setForm({ ...form, sort_order: +e.target.value })} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Minutos estimados</Label>
                <Input type="number" value={form.estimated_minutes} onChange={e => setForm({ ...form, estimated_minutes: +e.target.value })} />
              </div>
              <div>
                <Label>KivaPoints recompensa</Label>
                <Input type="number" value={form.kiva_points_reward} onChange={e => setForm({ ...form, kiva_points_reward: +e.target.value })} />
              </div>
            </div>

            <div>
              <Label>Blocos de conteúdo (JSON)</Label>
              <Textarea
                value={form.blocks}
                onChange={e => setForm({ ...form, blocks: e.target.value })}
                rows={6}
                className="font-mono text-xs"
                placeholder='[{"type":"text","content":"..."}]'
              />
            </div>

            <div>
              <Label>Quiz (JSON)</Label>
              <Textarea
                value={form.quiz}
                onChange={e => setForm({ ...form, quiz: e.target.value })}
                rows={6}
                className="font-mono text-xs"
                placeholder='[{"id":"q1","question":"...","options":[...],"correctOptionId":"a","explanation":"..."}]'
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={!form.title}>{editingId ? 'Guardar' : 'Criar'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
