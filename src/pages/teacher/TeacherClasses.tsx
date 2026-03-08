import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Users, GraduationCap, TrendingUp, UserPlus, Trash2, Search, Pencil, Trash, Copy, Target, Check, History } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useT } from '@/contexts/LanguageContext';
import {
  useClassrooms, useAllClassroomStudents, useSchoolStudents,
  useCreateClassroom, useUpdateClassroom, useDeleteClassroom,
  useAddClassroomStudents, useRemoveClassroomStudent,
} from '@/hooks/use-classrooms';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const CLASS_ICONS = ['🎓', '📚', '🌟', '🚀', '🧠', '💡', '🎨', '🔬', '📐', '🌍', '💰', '🎵'];

type ClassGoal = {
  id: string;
  classId: string;
  title: string;
  category: string;
  target: number;
  current: number;
  completed: boolean;
  completedAt?: string;
};

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

function useTeacherSchoolTenantId() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['teacher_school_tenant_id', user?.profileId],
    enabled: !!user?.profileId,
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('school_tenant_id')
        .eq('id', user!.profileId)
        .single();
      return data?.school_tenant_id ?? null;
    },
  });
}

export default function TeacherClasses() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const t = useT();

  const SUBJECTS = [
    t('teacher.classes.subject_fin_ed'),
    t('teacher.classes.subject_math'),
    t('teacher.classes.subject_portuguese'),
    t('teacher.classes.subject_science'),
    t('teacher.classes.subject_history'),
    t('teacher.classes.subject_geography'),
    t('teacher.classes.subject_english'),
    t('teacher.classes.subject_arts'),
  ];

  const GOAL_CATEGORIES = [
    { value: 'savings', label: t('teacher.classes.goal_savings'), icon: '💰', unit: '%' },
    { value: 'tasks', label: t('teacher.classes.goal_tasks'), icon: '✅', unit: '' },
    { value: 'points', label: t('teacher.classes.goal_points'), icon: '⭐', unit: 'pts' },
    { value: 'custom', label: t('teacher.classes.goal_custom'), icon: '🎯', unit: '' },
  ];

  // Real data hooks
  const { data: classrooms = [], isLoading: loadingClasses } = useClassrooms();
  const classroomIds = classrooms.map(c => c.id);
  const { data: allStudents = [] } = useAllClassroomStudents(classroomIds);
  const { data: schoolTenantId } = useTeacherSchoolTenantId();
  const { data: schoolStudents = [] } = useSchoolStudents(schoolTenantId ?? null);

  const createClassroom = useCreateClassroom();
  const updateClassroom = useUpdateClassroom();
  const deleteClassroom = useDeleteClassroom();
  const addClassroomStudents = useAddClassroomStudents();
  const removeClassroomStudent = useRemoveClassroomStudent();

  // Form state
  const [newClassName, setNewClassName] = useState('');
  const [newClassGrade, setNewClassGrade] = useState('');
  const [newClassDesc, setNewClassDesc] = useState('');
  const [newClassSubject, setNewClassSubject] = useState('');
  const [newClassSchedule, setNewClassSchedule] = useState('');
  const [newClassIcon, setNewClassIcon] = useState('🎓');
  const [newClassStudents, setNewClassStudents] = useState<string[]>([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [addStudentsSelection, setAddStudentsSelection] = useState<string[]>([]);
  const [editingClass, setEditingClass] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editGrade, setEditGrade] = useState('');
  const [editSubject, setEditSubject] = useState('');
  const [editSchedule, setEditSchedule] = useState('');
  const [editIcon, setEditIcon] = useState('🎓');

  // Goals state (local for now)
  const [goals, setGoals] = useState<ClassGoal[]>([]);
  const [goalDialogClass, setGoalDialogClass] = useState<string | null>(null);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalCategory, setNewGoalCategory] = useState('savings');
  const [newGoalTarget, setNewGoalTarget] = useState('');

  const addGoal = () => {
    if (!goalDialogClass || !newGoalTitle.trim() || !newGoalTarget) return;
    setGoals(prev => [...prev, {
      id: `goal-${Date.now()}`,
      classId: goalDialogClass,
      title: newGoalTitle.trim(),
      category: newGoalCategory,
      target: Number(newGoalTarget),
      current: 0,
      completed: false,
    }]);
    toast.success(t('teacher.classes.goal_added'));
    setNewGoalTitle('');
    setNewGoalCategory('savings');
    setNewGoalTarget('');
    setGoalDialogClass(null);
  };

  const toggleGoalComplete = (goalId: string) => {
    setGoals(prev => prev.map(g => g.id === goalId ? { ...g, completed: !g.completed, completedAt: !g.completed ? new Date().toISOString() : undefined } : g));
  };

  const deleteGoal = (goalId: string) => {
    setGoals(prev => prev.filter(g => g.id !== goalId));
    toast.success(t('teacher.classes.goal_removed'));
  };

  const updateGoalCurrent = (goalId: string, value: number) => {
    const clamped = Math.max(0, value);
    setGoals(prev => {
      const updated = prev.map(g => g.id === goalId ? { ...g, current: clamped } : g);
      const goal = updated.find(g => g.id === goalId);
      const old = prev.find(g => g.id === goalId);
      if (goal && old && !old.completed && old.current < old.target && goal.current >= goal.target) {
        const cls = classrooms.find(c => c.id === goal.classId);
        toast.success(t('teacher.classes.goal_reached').replace('{title}', goal.title).replace('{class}', cls?.name ?? ''), { duration: 5000 });
        return updated.map(g => g.id === goalId ? { ...g, completed: true, completedAt: new Date().toISOString() } : g);
      }
      return updated;
    });
  };

  const openEditDialog = (c: typeof classrooms[0]) => {
    setEditingClass(c.id);
    setEditName(c.name);
    setEditGrade(c.grade);
    setEditSubject(c.subject ?? '');
    setEditSchedule(c.schedule ?? '');
    setEditIcon(c.icon);
  };

  const saveEdit = async () => {
    if (!editingClass || !editName.trim()) return;
    try {
      await updateClassroom.mutateAsync({
        id: editingClass,
        name: editName.trim(),
        grade: editGrade.trim(),
        icon: editIcon,
        subject: editSubject,
        schedule: editSchedule,
      });
      toast.success(t('teacher.classes.class_updated'));
      setEditingClass(null);
    } catch {
      toast.error(t('common.error'));
    }
  };

  const toggleNewStudent = (id: string) => {
    setNewClassStudents(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const toggleAddStudent = (id: string) => {
    setAddStudentsSelection(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
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

  const createClass = async () => {
    if (!newClassName.trim() || !user?.profileId) return;
    try {
      const result = await createClassroom.mutateAsync({
        name: newClassName.trim(),
        grade: newClassGrade.trim() || 'N/A',
        icon: newClassIcon,
        subject: newClassSubject || undefined,
        schedule: newClassSchedule || undefined,
        description: newClassDesc || undefined,
        teacher_profile_id: user.profileId,
        school_tenant_id: schoolTenantId ?? undefined,
      });
      if (newClassStudents.length > 0 && result?.id) {
        await addClassroomStudents.mutateAsync({
          classroomId: result.id,
          studentProfileIds: newClassStudents,
        });
      }
      toast.success(t('teacher.classes.class_created').replace('{name}', newClassName.trim()).replace('{count}', String(newClassStudents.length)));
      resetNewClassForm();
    } catch {
      toast.error(t('common.error'));
    }
  };

  const filteredSchoolStudents = schoolStudents.filter(s =>
    s.display_name.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const handleAddStudentsToClass = async (classroomId: string) => {
    if (addStudentsSelection.length === 0) return;
    try {
      await addClassroomStudents.mutateAsync({
        classroomId,
        studentProfileIds: addStudentsSelection,
      });
      toast.success(t('teacher.classes.students_added').replace('{count}', String(addStudentsSelection.length)));
      setAddStudentsSelection([]);
    } catch {
      toast.error(t('common.error'));
    }
  };

  const handleRemoveStudent = async (classroomId: string, studentProfileId: string, studentName: string) => {
    try {
      await removeClassroomStudent.mutateAsync({ classroomId, studentProfileId });
      toast.success(t('teacher.classes.student_removed').replace('{name}', studentName));
    } catch {
      toast.error(t('common.error'));
    }
  };

  const handleDeleteClass = async (classroomId: string, className: string) => {
    try {
      await deleteClassroom.mutateAsync(classroomId);
      toast.success(t('teacher.classes.class_deleted').replace('{name}', className));
    } catch {
      toast.error(t('common.error'));
    }
  };

  const handleDuplicateClass = async (classroom: typeof classrooms[0]) => {
    if (!user?.profileId) return;
    try {
      await createClassroom.mutateAsync({
        name: `${classroom.name} (cópia)`,
        grade: classroom.grade,
        icon: classroom.icon,
        subject: classroom.subject ?? undefined,
        schedule: classroom.schedule ?? undefined,
        description: classroom.description ?? undefined,
        teacher_profile_id: user.profileId,
        school_tenant_id: schoolTenantId ?? undefined,
      });
      toast.success(t('teacher.classes.class_duplicated').replace('{name}', classroom.name));
    } catch {
      toast.error(t('common.error'));
    }
  };

  const uniqueStudentCount = new Set(allStudents.map(s => s.student_profile_id)).size;

  if (loadingClasses) {
    return (
      <div className="space-y-4 max-w-5xl mx-auto">
        <Skeleton className="h-40 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    );
  }

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
                <p className="text-primary-foreground/60 text-xs font-medium uppercase tracking-wider">{t('teacher.classes.management')}</p>
                <h1 className="font-display text-xl sm:text-2xl md:text-3xl font-bold text-primary-foreground">{t('teacher.classes.title')}</h1>
                <p className="text-primary-foreground/60 text-sm">{t('teacher.classes.subtitle')}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-2 text-center">
                  <p className="text-[10px] text-primary-foreground/60 uppercase tracking-wider">{t('teacher.dashboard.classes')}</p>
                  <p className="font-display text-xl font-bold text-primary-foreground">{classrooms.length}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-2 text-center">
                  <p className="text-[10px] text-primary-foreground/60 uppercase tracking-wider">{t('teacher.dashboard.students')}</p>
                  <p className="font-display text-xl font-bold text-primary-foreground">{uniqueStudentCount}</p>
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
            <GraduationCap className="h-5 w-5 text-primary" /> {t('teacher.dashboard.classes')}
          </h2>
        </div>
        <Dialog onOpenChange={(open) => { if (!open) resetNewClassForm(); }}>
          <DialogTrigger asChild>
            <Button size="sm" className="rounded-xl font-display gap-1">
              <Plus className="h-4 w-4" /> {t('teacher.classes.new_class')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-display">{t('teacher.classes.create_title')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              <div className="space-y-2">
                <Label>{t('teacher.classes.name')} *</Label>
                <Input placeholder={t('teacher.classes.name_placeholder')} value={newClassName} onChange={e => setNewClassName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>{t('teacher.classes.icon')}</Label>
                <div className="flex flex-wrap gap-2">
                  {CLASS_ICONS.map(icon => (
                    <button key={icon} type="button" onClick={() => setNewClassIcon(icon)} className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${newClassIcon === icon ? 'bg-primary/20 ring-2 ring-primary scale-110' : 'bg-muted/30 hover:bg-muted/60'}`}>
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>{t('teacher.classes.grade')}</Label>
                  <Input placeholder={t('teacher.classes.grade_placeholder')} value={newClassGrade} onChange={e => setNewClassGrade(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>{t('teacher.classes.subject')}</Label>
                  <Select value={newClassSubject} onValueChange={setNewClassSubject}>
                    <SelectTrigger className="rounded-xl"><SelectValue placeholder={t('teacher.classes.select')} /></SelectTrigger>
                    <SelectContent>
                      {SUBJECTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t('teacher.classes.schedule')}</Label>
                <Input placeholder={t('teacher.classes.schedule_placeholder')} value={newClassSchedule} onChange={e => setNewClassSchedule(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>{t('teacher.classes.description')}</Label>
                <Textarea placeholder={t('teacher.classes.desc_placeholder')} value={newClassDesc} onChange={e => setNewClassDesc(e.target.value)} className="rounded-xl resize-none" rows={3} />
              </div>
              <div className="space-y-2">
                <Label>{t('teacher.classes.select_students')} ({newClassStudents.length})</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder={t('teacher.classes.search_student')} value={studentSearch} onChange={e => setStudentSearch(e.target.value)} className="pl-9 rounded-xl" />
                </div>
                <ScrollArea className="h-48 rounded-xl border border-border p-2">
                  {filteredSchoolStudents.map(student => (
                    <label key={student.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                      <Checkbox checked={newClassStudents.includes(student.id)} onCheckedChange={() => toggleNewStudent(student.id)} />
                      <span className="text-lg">{student.avatar ?? '👤'}</span>
                      <div>
                        <p className="text-sm font-display font-medium">{student.display_name}</p>
                      </div>
                    </label>
                  ))}
                  {filteredSchoolStudents.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-4">{t('teacher.classes.no_students_school')}</p>
                  )}
                </ScrollArea>
              </div>
              <DialogClose asChild>
                <Button className="w-full rounded-xl font-display" onClick={createClass} disabled={!newClassName.trim() || createClassroom.isPending}>
                  {t('teacher.classes.create_btn')}
                </Button>
              </DialogClose>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Classes */}
      {classrooms.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="p-12 text-center">
            <div className="text-5xl mb-4">🎓</div>
            <h3 className="font-display font-bold text-lg mb-2">{t('teacher.classes.no_classes')}</h3>
            <p className="text-sm text-muted-foreground">{t('teacher.classes.no_classes_hint')}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
          {classrooms.map((classroom) => {
            const students = allStudents.filter(s => s.classroom_id === classroom.id);
            const studentProfileIds = students.map(s => s.student_profile_id);
            const availableStudents = schoolStudents.filter(s => !studentProfileIds.includes(s.id));

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
                          {classroom.subject ? ` · ${classroom.subject}` : ''}
                          {classroom.schedule ? ` · ${classroom.schedule}` : ''}
                          {` · ${t('teacher.classes.created_at')} `}{format(new Date(classroom.created_at), 'dd/MM/yyyy')}
                        </span>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl shrink-0" onClick={() => openEditDialog(classroom)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl shrink-0" onClick={() => handleDuplicateClass(classroom)}>
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
                            <AlertDialogTitle className="font-display">{t('teacher.classes.delete_title')}</AlertDialogTitle>
                            <AlertDialogDescription>
                              {t('teacher.classes.delete_desc').replace('{name}', classroom.name).replace('{count}', String(students.length))}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="rounded-xl">{t('common.cancel')}</AlertDialogCancel>
                            <AlertDialogAction className="rounded-xl bg-destructive hover:bg-destructive/90" onClick={() => handleDeleteClass(classroom.id, classroom.name)}>
                              {t('common.delete')}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-muted/30 rounded-xl p-3 text-center">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t('teacher.dashboard.students')}</p>
                        <p className="font-display font-bold text-lg">{students.length}</p>
                      </div>
                      <div className="bg-muted/30 rounded-xl p-3 text-center">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t('teacher.classes.goals')}</p>
                        <p className="font-display font-bold text-lg">{goals.filter(g => g.classId === classroom.id).length}</p>
                      </div>
                    </div>

                    {/* Students */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-display font-semibold text-muted-foreground flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" /> {t('teacher.dashboard.students')}
                        </p>
                        <Dialog onOpenChange={(open) => { if (!open) setAddStudentsSelection([]); }}>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-primary hover:bg-primary/10 rounded-lg">
                              <UserPlus className="h-3.5 w-3.5" /> {t('teacher.classes.add_students')}
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle className="font-display">{t('teacher.classes.add_students_title')} {classroom.name}</DialogTitle>
                            </DialogHeader>
                            <ScrollArea className="h-56 rounded-xl border border-border p-2">
                              {availableStudents.map(student => (
                                <label key={student.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                                  <Checkbox checked={addStudentsSelection.includes(student.id)} onCheckedChange={() => toggleAddStudent(student.id)} />
                                  <span className="text-lg">{student.avatar ?? '👤'}</span>
                                  <div>
                                    <p className="text-sm font-display font-medium">{student.display_name}</p>
                                  </div>
                                </label>
                              ))}
                              {availableStudents.length === 0 && (
                                <p className="text-xs text-muted-foreground text-center py-4">{t('teacher.classes.all_added')}</p>
                              )}
                            </ScrollArea>
                            <DialogClose asChild>
                              <Button className="w-full rounded-xl font-display" onClick={() => handleAddStudentsToClass(classroom.id)} disabled={addStudentsSelection.length === 0}>
                                {t('teacher.classes.add_count').replace('{count}', String(addStudentsSelection.length))}
                              </Button>
                            </DialogClose>
                          </DialogContent>
                        </Dialog>
                      </div>
                      <AnimatePresence mode="popLayout">
                        {students.map((student) => (
                          <motion.div
                            key={student.id}
                            layout
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20, transition: { duration: 0.2 } }}
                            className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/20 hover:bg-muted/50 transition-all cursor-pointer"
                            onClick={() => navigate(`/teacher/student/${student.student_profile_id}`)}
                          >
                            <span className="text-lg">{student.profile?.avatar ?? '👤'}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-display font-bold">{student.profile?.display_name ?? t('teacher.dashboard.students')}</p>
                            </div>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg shrink-0" onClick={e => e.stopPropagation()}>
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="font-display">{t('teacher.classes.remove_student')}</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    {t('teacher.classes.remove_desc').replace('{name}', student.profile?.display_name ?? '').replace('{class}', classroom.name)}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="rounded-xl">{t('common.cancel')}</AlertDialogCancel>
                                  <AlertDialogAction className="rounded-xl bg-destructive hover:bg-destructive/90" onClick={() => handleRemoveStudent(classroom.id, student.student_profile_id, student.profile?.display_name ?? '')}>
                                    {t('common.remove')}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                      {students.length === 0 && (
                        <p className="text-xs text-muted-foreground text-center py-3">{t('teacher.classes.no_students')}</p>
                      )}
                    </div>

                    {/* Goals Section */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-display font-semibold text-muted-foreground flex items-center gap-1">
                          <Target className="h-3.5 w-3.5" /> {t('teacher.classes.goals')}
                        </p>
                        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-primary hover:bg-primary/10 rounded-lg" onClick={() => setGoalDialogClass(classroom.id)}>
                          <Plus className="h-3.5 w-3.5" /> {t('common.add')}
                        </Button>
                      </div>
                      {goals.filter(g => g.classId === classroom.id && !g.completed).length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-2">{t('teacher.classes.no_active_goals')}</p>
                      ) : goals.filter(g => g.classId === classroom.id && !g.completed).map(goal => {
                        const cat = GOAL_CATEGORIES.find(c => c.value === goal.category);
                        const pct = Math.min(100, Math.round((goal.current / goal.target) * 100));
                        return (
                          <div key={goal.id} className="p-3 rounded-xl space-y-1.5 border bg-muted/20 border-transparent">
                            <div className="flex items-center gap-2">
                              <button onClick={() => toggleGoalComplete(goal.id)} className="w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors border-muted-foreground/30 hover:border-primary">
                                {goal.completed && <Check className="h-3 w-3" />}
                              </button>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-display font-semibold">{cat?.icon} {goal.title}</p>
                              </div>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <button className={`text-[9px] font-semibold px-2 py-0.5 rounded-md shrink-0 cursor-pointer hover:ring-2 hover:ring-primary/30 transition-all ${pct >= 100 ? 'bg-secondary/10 text-secondary' : pct >= 50 ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                    {goal.current}/{goal.target}{cat?.unit}
                                  </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-48 p-3 space-y-2" side="top">
                                  <p className="text-[10px] font-display font-semibold text-muted-foreground">{t('teacher.classes.update_progress')}</p>
                                  <Input
                                    type="number"
                                    defaultValue={goal.current}
                                    min={0}
                                    className="h-8 text-xs rounded-lg"
                                    onBlur={e => updateGoalCurrent(goal.id, Number(e.target.value))}
                                    onKeyDown={e => { if (e.key === 'Enter') { updateGoalCurrent(goal.id, Number((e.target as HTMLInputElement).value)); (e.target as HTMLInputElement).blur(); } }}
                                  />
                                </PopoverContent>
                              </Popover>
                              <button onClick={() => deleteGoal(goal.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                            <Progress value={pct} className="h-1.5" />
                          </div>
                        );
                      })}
                    </div>

                    {/* Completed Goals History */}
                    {goals.filter(g => g.classId === classroom.id && g.completed).length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-display font-semibold text-muted-foreground flex items-center gap-1">
                          <History className="h-3.5 w-3.5" /> 📜 {t('teacher.classes.history')}
                        </p>
                        {goals.filter(g => g.classId === classroom.id && g.completed).map(goal => {
                          const cat = GOAL_CATEGORIES.find(c => c.value === goal.category);
                          return (
                            <div key={goal.id} className="flex items-center gap-2 p-2.5 rounded-xl bg-secondary/5 border border-secondary/20">
                              <span className="text-sm">{cat?.icon}</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-display font-semibold text-muted-foreground line-through">{goal.title}</p>
                                <p className="text-[9px] text-muted-foreground">
                                  {goal.completedAt ? `${t('teacher.classes.completed_at')} ${format(new Date(goal.completedAt), 'dd/MM/yyyy')}` : t('teacher.classes.completed_label')}
                                </p>
                              </div>
                              <Badge variant="secondary" className="bg-secondary/15 text-secondary text-[9px] shrink-0">{t('teacher.classes.completed_label')}</Badge>
                              <button onClick={() => deleteGoal(goal.id)} className="text-muted-foreground hover:text-destructive transition-colors shrink-0">
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingClass} onOpenChange={(open) => { if (!open) setEditingClass(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">{t('teacher.classes.edit_title')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t('teacher.classes.name')} *</Label>
              <Input value={editName} onChange={e => setEditName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{t('teacher.classes.icon')}</Label>
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
                <Label>{t('teacher.classes.grade')}</Label>
                <Input value={editGrade} onChange={e => setEditGrade(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>{t('teacher.classes.subject')}</Label>
                <Select value={editSubject} onValueChange={setEditSubject}>
                  <SelectTrigger className="rounded-xl"><SelectValue placeholder={t('teacher.classes.select')} /></SelectTrigger>
                  <SelectContent>
                    {SUBJECTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t('teacher.classes.schedule')}</Label>
              <Input value={editSchedule} onChange={e => setEditSchedule(e.target.value)} />
            </div>
            <DialogClose asChild>
              <Button className="w-full rounded-xl font-display" onClick={saveEdit} disabled={!editName.trim() || updateClassroom.isPending}>
                {t('teacher.classes.save')}
              </Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>

      {/* Goal Dialog */}
      <Dialog open={!!goalDialogClass} onOpenChange={open => { if (!open) setGoalDialogClass(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display">{t('teacher.classes.goal_new')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t('teacher.classes.goal_title')}</Label>
              <Input placeholder={t('teacher.classes.goal_title_placeholder')} value={newGoalTitle} onChange={e => setNewGoalTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{t('teacher.classes.goal_category')}</Label>
              <Select value={newGoalCategory} onValueChange={setNewGoalCategory}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {GOAL_CATEGORIES.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.icon} {cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('teacher.classes.goal_target')}</Label>
              <Input type="number" placeholder="Ex: 50" value={newGoalTarget} onChange={e => setNewGoalTarget(e.target.value)} min={1} />
            </div>
            <DialogClose asChild>
              <Button className="w-full rounded-xl font-display" onClick={addGoal} disabled={!newGoalTitle.trim() || !newGoalTarget}>
                {t('teacher.classes.goal_create')}
              </Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
