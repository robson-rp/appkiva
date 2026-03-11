import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Trophy, TrendingUp, Target, ChevronRight, GraduationCap, Sparkles, BarChart3, Lightbulb, Info, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Tooltip as UITooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { useT } from '@/contexts/LanguageContext';
import { useClassrooms, useAllClassroomStudents } from '@/hooks/use-classrooms';
import { useCollectiveChallenges } from '@/hooks/use-collective-challenges';
import { Skeleton } from '@/components/ui/skeleton';
import { usePrefetchRoutes } from '@/hooks/use-prefetch-routes';

interface ClassComparison {
  name: string;
  icon: string;
  poupança: number;
  pontos: number;
  tarefas: number;
  alunos: number;
}

function getPedagogicalTips(cls: ClassComparison, t: (k: string) => string) {
  const tips: { type: 'positive' | 'warning' | 'suggestion'; text: string }[] = [];
  if (cls.poupança >= 40) tips.push({ type: 'positive', text: t('teacher.dashboard.tip_savings_high') });
  else if (cls.poupança >= 25) tips.push({ type: 'suggestion', text: t('teacher.dashboard.tip_savings_mid') });
  else tips.push({ type: 'warning', text: t('teacher.dashboard.tip_savings_low') });
  if (cls.pontos >= 150) tips.push({ type: 'positive', text: t('teacher.dashboard.tip_points_high') });
  else if (cls.pontos < 80) tips.push({ type: 'suggestion', text: t('teacher.dashboard.tip_points_low') });
  if (cls.tarefas >= 10) tips.push({ type: 'positive', text: t('teacher.dashboard.tip_tasks_high') });
  else if (cls.tarefas < 5) tips.push({ type: 'warning', text: t('teacher.dashboard.tip_tasks_low') });
  if (cls.alunos <= 2) tips.push({ type: 'suggestion', text: t('teacher.dashboard.tip_class_small') });
  else if (cls.alunos >= 5) tips.push({ type: 'suggestion', text: t('teacher.dashboard.tip_class_big') });
  return tips;
}

const tipColors = { positive: 'bg-secondary/10 border-secondary/30', warning: 'bg-destructive/10 border-destructive/30', suggestion: 'bg-primary/10 border-primary/30' };

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

export default function TeacherDashboard() {
  const navigate = useNavigate();
  usePrefetchRoutes('teacher');
  const { user } = useAuth();
  const t = useT();

  const { data: classrooms = [], isLoading: loadingClassrooms } = useClassrooms();
  const { data: dbChallenges = [], isLoading: loadingChallenges } = useCollectiveChallenges();

  const classroomIds = useMemo(() => classrooms.map(c => c.id), [classrooms]);
  const { data: allStudents = [] } = useAllClassroomStudents(classroomIds);

  // Map DB challenges to view model
  const challenges = useMemo(() => dbChallenges.map(c => ({
    id: c.id,
    title: c.title,
    description: c.description,
    classroomId: c.classroom_id,
    type: c.type,
    icon: c.icon,
    targetAmount: Number(c.target_amount),
    currentAmount: Number(c.current_amount),
    reward: Number(c.reward),
    status: c.status,
    startDate: c.start_date,
    endDate: c.end_date,
  })), [dbChallenges]);

  const activeChallenges = challenges.filter(c => c.status === 'active');
  const completedChallenges = challenges.filter(c => c.status === 'completed');
  const totalStudents = new Set(allStudents.map(s => s.student_profile_id)).size;

  // Top students by classroom enrollment (no mock leaderboard)
  const topStudents = useMemo(() => {
    const uniqueIds = new Set<string>();
    return allStudents
      .filter(s => {
        if (uniqueIds.has(s.student_profile_id)) return false;
        uniqueIds.add(s.student_profile_id);
        return true;
      })
      .slice(0, 5)
      .map(s => ({
        id: s.student_profile_id,
        name: s.profile?.display_name ?? 'Aluno',
        avatar: s.profile?.avatar ?? '👤',
      }));
  }, [allStudents]);

  // Class comparison using real student counts
  const classComparison: ClassComparison[] = useMemo(() => {
    return classrooms.map(cls => {
      const studentCount = allStudents.filter(s => s.classroom_id === cls.id).length;
      return {
        name: cls.name,
        icon: cls.icon,
        poupança: 0,
        pontos: 0,
        tarefas: 0,
        alunos: studentCount,
      };
    });
  }, [classrooms, allStudents]);

  const radarData = useMemo(() => [
    { metric: t('teacher.dashboard.savings'), ...Object.fromEntries(classComparison.map(c => [c.name, c.poupança])) },
    { metric: t('teacher.dashboard.points'), ...Object.fromEntries(classComparison.map(c => [c.name, c.pontos])) },
    { metric: t('teacher.dashboard.tasks'), ...Object.fromEntries(classComparison.map(c => [c.name, c.tarefas])) },
    { metric: t('teacher.dashboard.students'), ...Object.fromEntries(classComparison.map(c => [c.name, c.alunos * 10])) },
  ], [classComparison, t]);

  const radarColors = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))'];

  const exportPDF = () => {
    const doc = new jsPDF();
    const today = format(new Date(), 'dd/MM/yyyy');
    doc.setFontSize(18);
    doc.text(t('teacher.dashboard.report_title'), 14, 20);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`${today}`, 14, 28);
    doc.setTextColor(0);
    autoTable(doc, {
      startY: 35,
      head: [[t('teacher.dashboard.classes'), t('teacher.dashboard.students'), t('teacher.dashboard.savings_pct'), t('teacher.dashboard.points_avg'), t('teacher.dashboard.tasks_avg')]],
      body: classComparison.map(c => [c.name, c.alunos, `${c.poupança}%`, c.pontos, c.tarefas]),
      styles: { fontSize: 10 },
      headStyles: { fillColor: [59, 130, 246] },
    });
    const finalY = (doc as any).lastAutoTable?.finalY ?? 80;
    let y = finalY + 10;
    doc.setFontSize(13);
    doc.text(t('teacher.dashboard.pedagogical_tips'), 14, y);
    y += 8;
    doc.setFontSize(10);
    classComparison.forEach(cls => {
      const tips = getPedagogicalTips(cls, t);
      doc.setFont('helvetica', 'bold');
      doc.text(`${cls.name}`, 14, y);
      y += 6;
      doc.setFont('helvetica', 'normal');
      tips.forEach(tip => {
        const lines = doc.splitTextToSize(tip.text, 175);
        if (y + lines.length * 5 > 280) { doc.addPage(); y = 20; }
        doc.text(lines, 18, y);
        y += lines.length * 5 + 2;
      });
      y += 3;
    });
    doc.save(`relatorio-turmas-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  const stats = [
    { label: t('teacher.dashboard.classes'), value: classrooms.length, icon: Users, bg: 'bg-[hsl(var(--kivara-light-blue))]', iconColor: 'text-primary', to: '/teacher/classes' },
    { label: t('teacher.dashboard.students'), value: totalStudents, icon: GraduationCap, bg: 'bg-[hsl(var(--kivara-light-green))]', iconColor: 'text-secondary' },
    { label: t('teacher.dashboard.active_challenges'), value: activeChallenges.length, icon: Target, bg: 'bg-[hsl(var(--kivara-light-gold))]', iconColor: 'text-accent-foreground', to: '/teacher/challenges' },
    { label: t('teacher.dashboard.completed'), value: completedChallenges.length, icon: Trophy, bg: 'bg-[hsl(var(--kivara-pink))]', iconColor: 'text-destructive' },
  ];

  if (loadingClassrooms || loadingChallenges) {
    return (
      <div className="space-y-4 max-w-5xl mx-auto">
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
      </div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-5 sm:space-y-6 max-w-5xl mx-auto w-full min-w-0">
      {/* Hero */}
      <motion.div variants={item}>
        <Card className="border-0 overflow-hidden relative shadow-kivara">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-secondary" />
          <div className="absolute top-[-30%] right-[-10%] w-[45%] h-[80%] rounded-full bg-white/5 blur-3xl" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[35%] h-[60%] rounded-full bg-white/5 blur-3xl" />
          <CardContent className="relative z-10 p-4 sm:p-6 md:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <div className="space-y-1.5 sm:space-y-2">
                <div className="flex items-center gap-2">
                  <p className="text-primary-foreground/60 text-xs sm:text-small font-medium uppercase tracking-wider">{t('teacher.dashboard.school_mode')}</p>
                  <span className="text-[10px] sm:text-caption bg-white/20 text-primary-foreground px-2 sm:px-2.5 py-0.5 rounded-lg font-display font-semibold">BETA</span>
                </div>
                <h1 className="font-display text-xl sm:text-heading md:text-heading-lg font-bold text-primary-foreground">
                  {t('teacher.dashboard.hello')} {user?.name}! 📚
                </h1>
                <p className="text-primary-foreground/60 text-sm sm:text-base max-w-md">
                  {t('teacher.dashboard.subtitle')}
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-4 sm:px-6 py-3 sm:py-5 text-center">
                <p className="text-primary-foreground/60 text-[10px] sm:text-caption uppercase tracking-wider font-medium">{t('teacher.dashboard.school')}</p>
                <p className="font-display text-sm sm:text-base font-bold text-primary-foreground mt-1">Escola</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4" data-onboarding="students">
        {stats.map((stat) => (
          <motion.div key={stat.label} whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}>
            <Card
              className={`${stat.to ? 'cursor-pointer' : ''} border-border/50 hover:shadow-kivara transition-all duration-300 overflow-hidden`}
              onClick={() => stat.to && navigate(stat.to)}
            >
              <div className="h-0.5 bg-gradient-to-r from-primary to-secondary" />
              <CardContent className="p-4 sm:p-5">
                <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl ${stat.bg} flex items-center justify-center mb-3`}>
                  <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                </div>
                <p className="font-display text-2xl font-bold">{stat.value}</p>
                <p className="text-caption text-muted-foreground font-semibold tracking-wider uppercase mt-1">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* Active Challenges */}
        <motion.div variants={item} data-onboarding="challenges">
          <Card className="border-border/50 h-full overflow-hidden">
            <div className="h-0.5 bg-gradient-to-r from-accent to-primary" />
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-display flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[hsl(var(--kivara-light-gold))] flex items-center justify-center">
                  <Target className="h-5 w-5 text-accent-foreground" />
                </div>
                {t('teacher.dashboard.challenges_in_progress')}
              </CardTitle>
              <button onClick={() => navigate('/teacher/challenges')} className="text-small text-primary font-semibold flex items-center gap-0.5 hover:underline min-h-[44px]">
                {t('teacher.dashboard.view_all')} <ChevronRight className="h-4 w-4" />
              </button>
            </CardHeader>
            <CardContent className="space-y-3">
              {activeChallenges.length === 0 && (
                <p className="text-base text-muted-foreground text-center py-4">{t('teacher.dashboard.no_active_challenges')}</p>
              )}
              {activeChallenges.map((challenge) => {
                const classroom = classrooms.find(c => c.id === challenge.classroomId);
                const pct = challenge.targetAmount > 0 ? Math.round((challenge.currentAmount / challenge.targetAmount) * 100) : 0;
                return (
                  <div key={challenge.id} className="bg-muted/30 rounded-2xl p-4 space-y-2.5 border border-border/30">
                    <div className="flex items-center justify-between">
                      <span className="font-display font-bold text-base flex items-center gap-2">
                        <span className="text-xl">{challenge.icon}</span> {challenge.title}
                      </span>
                      <span className="font-display font-bold text-small text-primary">{pct}%</span>
                    </div>
                    <p className="text-small text-muted-foreground">{classroom?.name}</p>
                    <Progress value={pct} className="h-3" />
                    <div className="flex justify-between text-small text-muted-foreground">
                      <span>🪙 {challenge.currentAmount} / {challenge.targetAmount}</span>
                      <span>{t('teacher.dashboard.until')} {challenge.endDate}</span>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>

        {/* Student List */}
        <motion.div variants={item}>
          <Card className="border-border/50 h-full overflow-hidden">
            <div className="h-0.5 bg-gradient-to-r from-secondary to-primary" />
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-display flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[hsl(var(--kivara-light-green))] flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-secondary" />
                </div>
                {t('teacher.dashboard.student_ranking')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {topStudents.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">{t('teacher.dashboard.no_students')}</p>
              )}
              {topStudents.map((student, i) => {
                const medals = ['🥇', '🥈', '🥉'];
                return (
                  <motion.div
                    key={student.id}
                    whileHover={{ x: 4 }}
                    className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3.5 rounded-2xl bg-muted/40 hover:bg-muted/70 transition-all duration-200 border border-transparent hover:border-border/50 min-h-[48px] sm:min-h-[56px] cursor-pointer"
                    onClick={() => navigate(`/teacher/student/${student.id}`)}
                  >
                    <span className="text-base sm:text-lg w-6 sm:w-7 text-center font-display font-bold">
                      {i < 3 ? medals[i] : `${i + 1}.`}
                    </span>
                    <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-[hsl(var(--kivara-light-blue))] to-[hsl(var(--kivara-light-green))] flex items-center justify-center text-lg sm:text-xl shrink-0">
                      {student.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-display font-bold text-sm sm:text-base truncate">{student.name}</p>
                    </div>
                  </motion.div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Class Comparison Panel */}
      {classComparison.length > 0 && (
        <motion.div variants={item}>
          <Card className="border-border/50 overflow-hidden w-full">
            <div className="h-0.5 bg-gradient-to-r from-primary via-secondary to-primary" />
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-display flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
                {t('teacher.dashboard.class_comparison')}
              </CardTitle>
              <Button variant="outline" size="sm" className="gap-1.5 text-small" onClick={exportPDF}>
                <Download className="h-4 w-4" /> {t('teacher.dashboard.export_pdf')}
              </Button>
            </CardHeader>
            <CardContent className="space-y-6 px-2 sm:px-6">
              {/* Bar Chart */}
              <div>
                <p className="text-small font-display font-semibold text-muted-foreground mb-3">{t('teacher.dashboard.averages')}</p>
                <div className="h-52 sm:h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={classComparison} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" width={30} />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '0.75rem', fontSize: '13px' }} />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                      <Bar dataKey="alunos" name={t('teacher.dashboard.students')} fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Summary Table */}
              <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
                <table className="w-full text-xs sm:text-small min-w-[320px]">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left py-3 font-display font-semibold text-muted-foreground">{t('teacher.dashboard.classes')}</th>
                      <th className="text-center py-3 font-display font-semibold text-muted-foreground">{t('teacher.dashboard.students')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classComparison.map(cls => (
                      <tr key={cls.name} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                        <td className="py-3 font-display font-semibold">{cls.icon} {cls.name}</td>
                        <td className="text-center py-3">{cls.alunos}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pedagogical Tips per Class */}
              <div className="space-y-3">
                <p className="text-small font-display font-semibold text-muted-foreground flex items-center gap-1.5">
                  <Lightbulb className="h-4 w-4 text-primary" /> {t('teacher.dashboard.pedagogical_tips')}
                </p>
                {classComparison.map(cls => {
                  const tips = getPedagogicalTips(cls, t);
                  return (
                    <div key={cls.name} className="space-y-2">
                      <p className="text-small font-display font-bold">{cls.icon} {cls.name}</p>
                      {tips.map((tip, i) => (
                        <div key={i} className={`text-small px-4 py-2.5 rounded-xl border ${tipColors[tip.type]}`}>
                          {tip.text}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
