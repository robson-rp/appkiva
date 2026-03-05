import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { mockClassrooms, mockLeaderboard } from '@/data/mock-data';
import { Plus, Users, GraduationCap, TrendingUp, UserPlus, Trash2, Search, Pencil, Trash, Copy } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const CLASS_ICONS = ['🎓', '📚', '🌟', '🚀', '🧠', '💡', '🎨', '🔬', '📐', '🌍', '💰', '🎵'];
const SUBJECTS = ['Educação Financeira', 'Matemática', 'Português', 'Ciências', 'História', 'Geografia', 'Inglês', 'Artes'];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

export default function TeacherClasses() {
  const navigate = useNavigate();
  const [classrooms, setClassrooms] = useState(() => mockClassrooms.map(c => ({ ...c })));
  const [newClassName, setNewClassName] = useState('');
  const [newClassGrade, setNewClassGrade] = useState('');
  const [newClassDesc, setNewClassDesc] = useState('');
  const [newClassSubject, setNewClassSubject] = useState('');
  const [newClassSchedule, setNewClassSchedule] = useState('');
  const [newClassIcon, setNewClassIcon] = useState('🎓');
  const [newClassStudents, setNewClassStudents] = useState<string[]>([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [addStudents, setAddStudents] = useState<string[]>([]);
  const [editingClass, setEditingClass] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editGrade, setEditGrade] = useState('');
  const [editSubject, setEditSubject] = useState('');
  const [editSchedule, setEditSchedule] = useState('');
  const [editIcon, setEditIcon] = useState('🎓');

  const openEditDialog = (c: typeof classrooms[0]) => {
    setEditingClass(c.id);
    setEditName(c.name);
    setEditGrade(c.grade);
    setEditSubject((c as any).subject ?? '');
    setEditSchedule((c as any).schedule ?? '');
    setEditIcon(c.icon);
  };

  const saveEdit = () => {
    if (!editingClass || !editName.trim()) return;
    setClassrooms(prev => prev.map(c =>
      c.id === editingClass
        ? { ...c, name: editName.trim(), grade: editGrade.trim() || c.grade, icon: editIcon, subject: editSubject, schedule: editSchedule } as any
        : c
    ));
    toast.success('Turma atualizada');
    setEditingClass(null);
  };

  const toggleNewStudent = (id: string) => {
    setNewClassStudents(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const toggleAddStudent = (id: string) => {
    setAddStudents(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const resetNewClassForm = () => {
    setNewClassName('');
    setNewClassGrade('');
    setNewClassDesc('');
    setNewClassSubject('');
    setNewClassSchedule('');
    setNewClassIcon('🎓');
    setNewClassStudents([]);
    setStudentSearch('');
  };

  const createClass = () => {
    if (!newClassName.trim()) return;
    setClassrooms(prev => [...prev, {
      id: `class-${Date.now()}`,
      teacherId: 'teacher-1',
      name: newClassName.trim(),
      grade: newClassGrade.trim() || 'N/A',
      icon: newClassIcon,
      studentIds: newClassStudents,
      createdAt: new Date().toLocaleDateString('pt-PT'),
    }]);
    toast.success(`Turma "${newClassName.trim()}" criada com ${newClassStudents.length} aluno(s)`);
    resetNewClassForm();
  };

  const filteredStudents = mockLeaderboard.filter(s =>
    s.name.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const addStudentsToClass = (classId: string) => {
    if (addStudents.length === 0) return;
    setClassrooms(prev => prev.map(c =>
      c.id === classId ? { ...c, studentIds: [...c.studentIds, ...addStudents] } : c
    ));
    toast.success(`${addStudents.length} aluno(s) adicionado(s)`);
    setAddStudents([]);
  };

  const removeStudent = (classId: string, studentId: string) => {
    const student = mockLeaderboard.find(s => s.childId === studentId);
    setClassrooms(prev => prev.map(c =>
      c.id === classId ? { ...c, studentIds: c.studentIds.filter(id => id !== studentId) } : c
    ));
    toast.success(`${student?.name ?? 'Aluno'} removido da turma`);
  };

  const deleteClass = (classId: string) => {
    const cls = classrooms.find(c => c.id === classId);
    setClassrooms(prev => prev.filter(c => c.id !== classId));
    toast.success(`Turma "${cls?.name ?? ''}" eliminada`);
  };

  const duplicateClass = (classId: string) => {
    const cls = classrooms.find(c => c.id === classId);
    if (!cls) return;
    setClassrooms(prev => [...prev, {
      ...cls,
      id: `class-${Date.now()}`,
      name: `${cls.name} (cópia)`,
      studentIds: [...cls.studentIds],
      createdAt: new Date().toLocaleDateString('pt-PT'),
    }]);
    toast.success(`Turma "${cls.name}" duplicada`);
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4 sm:space-y-6 max-w-5xl mx-auto">
      {/* Hero */}
      <motion.div variants={item}>
        <Card className="border-0 overflow-hidden relative shadow-kivara">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-secondary" />
          <div className="absolute top-[-30%] right-[-10%] w-[45%] h-[80%] rounded-full bg-white/5 blur-3xl" />
          <CardContent className="relative z-10 p-4 sm:p-6 md:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-2">
                <p className="text-primary-foreground/60 text-xs font-medium uppercase tracking-wider">Gestão</p>
                <h1 className="font-display text-xl sm:text-2xl md:text-3xl font-bold text-primary-foreground">As Minhas Turmas</h1>
                <p className="text-primary-foreground/60 text-sm">Gere turmas e acompanha o progresso dos alunos</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-2 text-center">
                  <p className="text-[10px] text-primary-foreground/60 uppercase tracking-wider">Turmas</p>
                  <p className="font-display text-xl font-bold text-primary-foreground">{classrooms.length}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-2 text-center">
                  <p className="text-[10px] text-primary-foreground/60 uppercase tracking-wider">Alunos</p>
                  <p className="font-display text-xl font-bold text-primary-foreground">
                    {new Set(classrooms.flatMap(c => c.studentIds)).size}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Add Class */}
      <motion.div variants={item} className="flex justify-between items-center">
        <div>
          <h2 className="font-display text-lg font-bold flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" /> Turmas
          </h2>
        </div>
        <Dialog onOpenChange={(open) => { if (!open) resetNewClassForm(); }}>
          <DialogTrigger asChild>
            <Button size="sm" className="rounded-xl font-display gap-1">
              <Plus className="h-4 w-4" /> Nova Turma
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-display">Criar Nova Turma</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              {/* Name */}
              <div className="space-y-2">
                <Label>Nome da turma *</Label>
                <Input placeholder="Ex: Turma dos Exploradores" value={newClassName} onChange={e => setNewClassName(e.target.value)} />
              </div>

              {/* Icon picker */}
              <div className="space-y-2">
                <Label>Ícone</Label>
                <div className="flex flex-wrap gap-2">
                  {CLASS_ICONS.map(icon => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setNewClassIcon(icon)}
                      className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${newClassIcon === icon ? 'bg-primary/20 ring-2 ring-primary scale-110' : 'bg-muted/30 hover:bg-muted/60'}`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grade + Subject */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Ano escolar</Label>
                  <Input placeholder="Ex: 4.º Ano" value={newClassGrade} onChange={e => setNewClassGrade(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Disciplina</Label>
                  <Select value={newClassSubject} onValueChange={setNewClassSubject}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Selecionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      {SUBJECTS.map(s => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Schedule */}
              <div className="space-y-2">
                <Label>Horário</Label>
                <Input placeholder="Ex: Seg/Qua 10h-11h" value={newClassSchedule} onChange={e => setNewClassSchedule(e.target.value)} />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label>Descrição / Notas</Label>
                <Textarea placeholder="Observações sobre a turma..." value={newClassDesc} onChange={e => setNewClassDesc(e.target.value)} className="rounded-xl resize-none" rows={3} />
              </div>

              {/* Student picker */}
              <div className="space-y-2">
                <Label>Selecionar Alunos ({newClassStudents.length})</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Procurar aluno..." value={studentSearch} onChange={e => setStudentSearch(e.target.value)} className="pl-9 rounded-xl" />
                </div>
                <ScrollArea className="h-48 rounded-xl border border-border p-2">
                  {filteredStudents.map(student => (
                    <label key={student.childId} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                      <Checkbox checked={newClassStudents.includes(student.childId)} onCheckedChange={() => toggleNewStudent(student.childId)} />
                      <span className="text-lg">{student.avatar}</span>
                      <div>
                        <p className="text-sm font-display font-medium">{student.name}</p>
                        <p className="text-[10px] text-muted-foreground">⭐ {student.kivaPoints} pts</p>
                      </div>
                    </label>
                  ))}
                  {filteredStudents.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-4">Nenhum aluno encontrado</p>
                  )}
                </ScrollArea>
              </div>

              <DialogClose asChild>
                <Button className="w-full rounded-xl font-display" onClick={createClass} disabled={!newClassName.trim()}>
                  🎓 Criar Turma
                </Button>
              </DialogClose>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Classes */}
      <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
        {classrooms.map((classroom) => {
          const students = mockLeaderboard.filter(s => classroom.studentIds.includes(s.childId));
          const availableStudents = mockLeaderboard.filter(s => !classroom.studentIds.includes(s.childId));
          const avgSavings = students.length > 0
            ? Math.round(students.reduce((s, st) => s + st.savingsRate, 0) / students.length)
            : 0;
          const totalPoints = students.reduce((s, st) => s + st.kivaPoints, 0);

          return (
            <motion.div key={classroom.id} variants={item}>
              <Card className="border-border/50 overflow-hidden hover:shadow-lg transition-all duration-300">
                <div className="h-0.5 bg-gradient-to-r from-primary to-secondary" />
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-display flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl">
                      {classroom.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="block">{classroom.name}</span>
                      <span className="text-xs text-muted-foreground font-normal">
                        {classroom.grade}
                        {(classroom as any).subject ? ` · ${(classroom as any).subject}` : ''}
                        {(classroom as any).schedule ? ` · ${(classroom as any).schedule}` : ''}
                        {' · Criada em '}{classroom.createdAt}
                      </span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl shrink-0" onClick={() => openEditDialog(classroom)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl shrink-0" onClick={() => duplicateClass(classroom.id)}>
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl shrink-0">
                          <Trash className="h-3.5 w-3.5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="font-display">Eliminar turma?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tens a certeza que queres eliminar a turma <strong>{classroom.name}</strong> com {classroom.studentIds.length} aluno(s)? Esta ação não pode ser revertida.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
                          <AlertDialogAction className="rounded-xl bg-destructive hover:bg-destructive/90" onClick={() => deleteClass(classroom.id)}>
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-muted/30 rounded-xl p-3 text-center">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Alunos</p>
                      <p className="font-display font-bold text-lg">{classroom.studentIds.length}</p>
                    </div>
                    <div className="bg-muted/30 rounded-xl p-3 text-center">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Poupança</p>
                      <p className="font-display font-bold text-lg text-secondary">{avgSavings}%</p>
                    </div>
                    <div className="bg-muted/30 rounded-xl p-3 text-center">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">KivaPoints</p>
                      <p className="font-display font-bold text-lg text-primary">{totalPoints}</p>
                    </div>
                  </div>

                  {/* Students */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-display font-semibold text-muted-foreground flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" /> Alunos
                      </p>
                      {availableStudents.length > 0 && (
                        <Dialog onOpenChange={(open) => { if (!open) setAddStudents([]); }}>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-primary hover:bg-primary/10 rounded-lg">
                              <UserPlus className="h-3.5 w-3.5" /> Adicionar
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle className="font-display">Adicionar Alunos a {classroom.name}</DialogTitle>
                            </DialogHeader>
                            <ScrollArea className="h-56 rounded-xl border border-border p-2">
                              {availableStudents.map(student => (
                                <label key={student.childId} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                                  <Checkbox checked={addStudents.includes(student.childId)} onCheckedChange={() => toggleAddStudent(student.childId)} />
                                  <span className="text-lg">{student.avatar}</span>
                                  <div>
                                    <p className="text-sm font-display font-medium">{student.name}</p>
                                    <p className="text-[10px] text-muted-foreground">⭐ {student.kivaPoints} pts</p>
                                  </div>
                                </label>
                              ))}
                              {availableStudents.length === 0 && (
                                <p className="text-xs text-muted-foreground text-center py-4">Todos os alunos já estão nesta turma</p>
                              )}
                            </ScrollArea>
                            <DialogClose asChild>
                              <Button className="w-full rounded-xl font-display" onClick={() => addStudentsToClass(classroom.id)} disabled={addStudents.length === 0}>
                                Adicionar {addStudents.length} aluno(s)
                              </Button>
                            </DialogClose>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                    <AnimatePresence mode="popLayout">
                      {students.map((student) => (
                        <motion.div
                          key={student.childId}
                          layout
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20, transition: { duration: 0.2 } }}
                          className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/20 hover:bg-muted/50 transition-all cursor-pointer"
                          onClick={() => navigate(`/teacher/student/${student.childId}`)}
                        >
                          <span className="text-lg">{student.avatar}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-display font-bold">{student.name}</p>
                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                              <span>⭐ {student.kivaPoints} pts</span>
                              <span>📊 {student.savingsRate}% poupança</span>
                            </div>
                          </div>
                          <div className="text-right mr-1">
                            <p className="text-xs font-display font-bold">{student.tasksCompleted}</p>
                            <p className="text-[9px] text-muted-foreground">tarefas</p>
                          </div>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg shrink-0" onClick={e => e.stopPropagation()}>
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle className="font-display">Remover aluno?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tens a certeza que queres remover <strong>{student.name}</strong> da turma <strong>{classroom.name}</strong>?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
                                <AlertDialogAction className="rounded-xl bg-destructive hover:bg-destructive/90" onClick={() => removeStudent(classroom.id, student.childId)}>
                                  Remover
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {students.length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-3">Sem dados de alunos</p>
                    )}
                  </div>

                  {/* Average Savings Progress */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground font-display font-semibold flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" /> Taxa de Poupança Média
                      </span>
                      <span className="font-display font-bold text-secondary">{avgSavings}%</span>
                    </div>
                    <Progress value={avgSavings} className="h-2.5" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingClass} onOpenChange={(open) => { if (!open) setEditingClass(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Editar Turma</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome da turma *</Label>
              <Input value={editName} onChange={e => setEditName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Ícone</Label>
              <div className="flex flex-wrap gap-2">
                {CLASS_ICONS.map(icon => (
                  <button key={icon} type="button" onClick={() => setEditIcon(icon)} className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${editIcon === icon ? 'bg-primary/20 ring-2 ring-primary scale-110' : 'bg-muted/30 hover:bg-muted/60'}`}>
                    {icon}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Ano escolar</Label>
                <Input value={editGrade} onChange={e => setEditGrade(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Disciplina</Label>
                <Select value={editSubject} onValueChange={setEditSubject}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Selecionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    {SUBJECTS.map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Horário</Label>
              <Input placeholder="Ex: Seg/Qua 10h-11h" value={editSchedule} onChange={e => setEditSchedule(e.target.value)} />
            </div>
            <Button className="w-full rounded-xl font-display" onClick={saveEdit} disabled={!editName.trim()}>
              ✅ Guardar Alterações
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
