import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { mockClassrooms, mockChallenges, mockLeaderboard, mockChildren } from '@/data/mock-data';
import { Users, Trophy, TrendingUp, Target, ChevronRight, GraduationCap, Sparkles, BarChart3, Lightbulb, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Tooltip as UITooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

function getPedagogicalTips(cls: { name: string; icon: string; poupança: number; pontos: number; tarefas: number; alunos: number }) {
  const tips: { type: 'positive' | 'warning' | 'suggestion'; text: string }[] = [];

  if (cls.poupança >= 40) tips.push({ type: 'positive', text: '🌟 Excelente taxa de poupança! Reforce este hábito com um desafio de manutenção.' });
  else if (cls.poupança >= 25) tips.push({ type: 'suggestion', text: '💡 Poupança razoável. Experimente um desafio coletivo de poupança para elevar a média.' });
  else tips.push({ type: 'warning', text: '⚠️ Poupança baixa. Considere atividades práticas sobre a importância de poupar.' });

  if (cls.pontos >= 150) tips.push({ type: 'positive', text: '🏆 Alto engajamento em pontos! Os alunos estão motivados — mantenha a cadência.' });
  else if (cls.pontos < 80) tips.push({ type: 'suggestion', text: '💡 Pontuação baixa. Introduza missões curtas e recompensas rápidas para aumentar a participação.' });

  if (cls.tarefas >= 10) tips.push({ type: 'positive', text: '✅ Boa conclusão de tarefas! Aumente a complexidade gradualmente.' });
  else if (cls.tarefas < 5) tips.push({ type: 'warning', text: '⚠️ Poucas tarefas concluídas. Simplifique as tarefas iniciais para criar momentum.' });

  if (cls.alunos <= 2) tips.push({ type: 'suggestion', text: '💡 Turma pequena — ideal para atividades personalizadas e mentorias individuais.' });
  else if (cls.alunos >= 5) tips.push({ type: 'suggestion', text: '💡 Turma grande — experimente dinâmicas de grupo e desafios por equipas.' });

  return tips;
}

const tipColors = { positive: 'bg-secondary/10 border-secondary/30', warning: 'bg-destructive/10 border-destructive/30', suggestion: 'bg-primary/10 border-primary/30' };

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const activeChallenges = mockChallenges.filter(c => c.status === 'active');
  const completedChallenges = mockChallenges.filter(c => c.status === 'completed');
  const totalStudents = new Set(mockClassrooms.flatMap(c => c.studentIds)).size;
  const topStudents = [...mockLeaderboard].sort((a, b) => b.kivaPoints - a.kivaPoints).slice(0, 5);

  // Comparative data per classroom
  const classComparison = mockClassrooms.map(cls => {
    const students = mockLeaderboard.filter(s => cls.studentIds.includes(s.childId));
    const avgSavings = students.length > 0 ? Math.round(students.reduce((a, s) => a + s.savingsRate, 0) / students.length) : 0;
    const avgPoints = students.length > 0 ? Math.round(students.reduce((a, s) => a + s.kivaPoints, 0) / students.length) : 0;
    const avgTasks = students.length > 0 ? Math.round(students.reduce((a, s) => a + s.tasksCompleted, 0) / students.length) : 0;
    return { name: cls.name, icon: cls.icon, poupança: avgSavings, pontos: avgPoints, tarefas: avgTasks, alunos: cls.studentIds.length };
  });

  const radarData = [
    { metric: 'Poupança', ...Object.fromEntries(classComparison.map(c => [c.name, c.poupança])) },
    { metric: 'Pontos', ...Object.fromEntries(classComparison.map(c => [c.name, c.pontos])) },
    { metric: 'Tarefas', ...Object.fromEntries(classComparison.map(c => [c.name, c.tarefas])) },
    { metric: 'Alunos', ...Object.fromEntries(classComparison.map(c => [c.name, c.alunos * 10])) },
  ];

  const radarColors = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))'];

  const stats = [
    { label: 'Turmas', value: mockClassrooms.length, icon: Users, bg: 'bg-[hsl(var(--kivara-light-blue))]', iconColor: 'text-primary', to: '/teacher/classes' },
    { label: 'Alunos', value: totalStudents, icon: GraduationCap, bg: 'bg-[hsl(var(--kivara-light-green))]', iconColor: 'text-secondary' },
    { label: 'Desafios Activos', value: activeChallenges.length, icon: Target, bg: 'bg-[hsl(var(--kivara-light-gold))]', iconColor: 'text-accent-foreground', to: '/teacher/challenges' },
    { label: 'Concluídos', value: completedChallenges.length, icon: Trophy, bg: 'bg-[hsl(var(--kivara-pink))]', iconColor: 'text-destructive' },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4 sm:space-y-6 max-w-5xl mx-auto">
      {/* Hero */}
      <motion.div variants={item}>
        <Card className="border-0 overflow-hidden relative shadow-kivara">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-secondary" />
          <div className="absolute top-[-30%] right-[-10%] w-[45%] h-[80%] rounded-full bg-white/5 blur-3xl" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[35%] h-[60%] rounded-full bg-white/5 blur-3xl" />
          <CardContent className="relative z-10 p-4 sm:p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <p className="text-primary-foreground/60 text-xs font-medium uppercase tracking-wider">Modo Escolar</p>
                  <span className="text-[10px] bg-white/20 text-primary-foreground px-2 py-0.5 rounded-lg font-display font-semibold">BETA</span>
                </div>
                <h1 className="font-display text-xl sm:text-2xl md:text-3xl font-bold text-primary-foreground">
                  Olá, {user?.name}! 📚
                </h1>
                <p className="text-primary-foreground/60 text-sm max-w-md">
                  Acompanha o progresso financeiro das tuas turmas e lança desafios educativos.
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 text-center">
                <p className="text-primary-foreground/60 text-[10px] uppercase tracking-wider font-medium">Escola</p>
                <p className="font-display text-sm font-bold text-primary-foreground mt-1">Sol Nascente</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4">
        {stats.map((stat) => (
          <motion.div key={stat.label} whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}>
            <Card
              className={`${stat.to ? 'cursor-pointer' : ''} border-border/50 hover:shadow-kivara transition-all duration-300 overflow-hidden`}
              onClick={() => stat.to && navigate(stat.to)}
            >
              <div className="h-0.5 bg-gradient-to-r from-primary to-secondary" />
              <CardContent className="p-3 sm:p-4">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-2xl ${stat.bg} flex items-center justify-center mb-2 sm:mb-3`}>
                  <stat.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.iconColor}`} />
                </div>
                <p className="font-display text-xl sm:text-2xl font-bold">{stat.value}</p>
                <p className="text-[9px] sm:text-[10px] text-muted-foreground font-semibold tracking-wider uppercase">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
        {/* Active Challenges */}
        <motion.div variants={item}>
          <Card className="border-border/50 h-full overflow-hidden">
            <div className="h-0.5 bg-gradient-to-r from-accent to-primary" />
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-display flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[hsl(var(--kivara-light-gold))] flex items-center justify-center">
                  <Target className="h-4 w-4 text-accent-foreground" />
                </div>
                Desafios em Curso
              </CardTitle>
              <button onClick={() => navigate('/teacher/challenges')} className="text-xs text-primary font-semibold flex items-center gap-0.5 hover:underline">
                Ver todos <ChevronRight className="h-3 w-3" />
              </button>
            </CardHeader>
            <CardContent className="space-y-3">
              {activeChallenges.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">Nenhum desafio activo</p>
              )}
              {activeChallenges.map((challenge) => {
                const classroom = mockClassrooms.find(c => c.id === challenge.classroomId);
                const pct = Math.round((challenge.currentAmount / challenge.targetAmount) * 100);
                return (
                  <div key={challenge.id} className="bg-muted/30 rounded-2xl p-4 space-y-2 border border-border/30">
                    <div className="flex items-center justify-between">
                      <span className="font-display font-bold text-sm flex items-center gap-2">
                        <span className="text-lg">{challenge.icon}</span> {challenge.title}
                      </span>
                      <span className="font-display font-bold text-xs text-primary">{pct}%</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">{classroom?.name} · {challenge.participants.length} participantes</p>
                    <Progress value={pct} className="h-2.5" />
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>🪙 {challenge.currentAmount} / {challenge.targetAmount}</span>
                      <span>Até {challenge.endDate}</span>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>

        {/* Leaderboard */}
        <motion.div variants={item}>
          <Card className="border-border/50 h-full overflow-hidden">
            <div className="h-0.5 bg-gradient-to-r from-secondary to-primary" />
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-display flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[hsl(var(--kivara-light-green))] flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-secondary" />
                </div>
                Ranking dos Alunos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {topStudents.map((student, i) => {
                const medals = ['🥇', '🥈', '🥉'];
                return (
                  <motion.div
                    key={student.childId}
                    whileHover={{ x: 4 }}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-muted/40 hover:bg-muted/70 transition-all duration-200 border border-transparent hover:border-border/50"
                  >
                    <span className="text-lg w-6 text-center font-display font-bold">
                      {i < 3 ? medals[i] : `${i + 1}.`}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(var(--kivara-light-blue))] to-[hsl(var(--kivara-light-green))] flex items-center justify-center text-xl">
                      {student.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-display font-bold text-sm">{student.name}</p>
                      <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                        <span>⭐ {student.kivaPoints} pts</span>
                        <span>💾 {student.savingsRate}%</span>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground font-display">{student.tasksCompleted} tarefas</span>
                  </motion.div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Class Comparison Panel */}
      <motion.div variants={item}>
        <Card className="border-border/50 overflow-hidden">
          <div className="h-0.5 bg-gradient-to-r from-primary via-secondary to-primary" />
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-display flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-primary" />
              </div>
              Comparativo entre Turmas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Bar Chart */}
            <div>
              <p className="text-xs font-display font-semibold text-muted-foreground mb-3">Médias por turma</p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={classComparison} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '0.75rem',
                        fontSize: '11px',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Bar dataKey="poupança" name="Poupança (%)" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="pontos" name="KivaPoints (média)" fill="hsl(var(--secondary))" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="tarefas" name="Tarefas (média)" fill="hsl(var(--accent))" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Radar Chart */}
            <div>
              <p className="text-xs font-display font-semibold text-muted-foreground mb-3">Perfil comparativo</p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                    <PolarRadiusAxis tick={{ fontSize: 9 }} stroke="hsl(var(--border))" />
                    {classComparison.map((cls, i) => (
                      <Radar
                        key={cls.name}
                        name={`${cls.icon} ${cls.name}`}
                        dataKey={cls.name}
                        stroke={radarColors[i % radarColors.length]}
                        fill={radarColors[i % radarColors.length]}
                        fillOpacity={0.15}
                        strokeWidth={2}
                      />
                    ))}
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '0.75rem',
                        fontSize: '11px',
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Summary Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left py-2 font-display font-semibold text-muted-foreground">Turma</th>
                    <th className="text-center py-2 font-display font-semibold text-muted-foreground">Alunos</th>
                    <th className="text-center py-2 font-display font-semibold text-muted-foreground">
                      <UITooltip>
                        <TooltipTrigger className="inline-flex items-center gap-1">Poupança <Info className="h-3 w-3" /></TooltipTrigger>
                        <TooltipContent><p className="text-xs max-w-48">Taxa média de poupança dos alunos. Acima de 30% é considerado saudável.</p></TooltipContent>
                      </UITooltip>
                    </th>
                    <th className="text-center py-2 font-display font-semibold text-muted-foreground">
                      <UITooltip>
                        <TooltipTrigger className="inline-flex items-center gap-1">Pontos <Info className="h-3 w-3" /></TooltipTrigger>
                        <TooltipContent><p className="text-xs max-w-48">Média de KivaPoints acumulados. Reflete o engajamento com tarefas e missões.</p></TooltipContent>
                      </UITooltip>
                    </th>
                    <th className="text-center py-2 font-display font-semibold text-muted-foreground">
                      <UITooltip>
                        <TooltipTrigger className="inline-flex items-center gap-1">Tarefas <Info className="h-3 w-3" /></TooltipTrigger>
                        <TooltipContent><p className="text-xs max-w-48">Média de tarefas concluídas por aluno. Indicador de consistência e participação.</p></TooltipContent>
                      </UITooltip>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {classComparison.map(cls => (
                    <tr key={cls.name} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                      <td className="py-2.5 font-display font-semibold">{cls.icon} {cls.name}</td>
                      <td className="text-center py-2.5">{cls.alunos}</td>
                      <td className="text-center py-2.5 font-bold text-secondary">{cls.poupança}%</td>
                      <td className="text-center py-2.5 font-bold text-primary">{cls.pontos}</td>
                      <td className="text-center py-2.5">{cls.tarefas}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pedagogical Tips per Class */}
            <div className="space-y-3">
              <p className="text-xs font-display font-semibold text-muted-foreground flex items-center gap-1.5">
                <Lightbulb className="h-3.5 w-3.5 text-primary" /> Dicas Pedagógicas
              </p>
              {classComparison.map(cls => {
                const tips = getPedagogicalTips(cls);
                return (
                  <div key={cls.name} className="space-y-1.5">
                    <p className="text-xs font-display font-bold">{cls.icon} {cls.name}</p>
                    {tips.map((tip, i) => (
                      <div key={i} className={`text-[11px] px-3 py-2 rounded-xl border ${tipColors[tip.type]}`}>
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
    </motion.div>
  );
}