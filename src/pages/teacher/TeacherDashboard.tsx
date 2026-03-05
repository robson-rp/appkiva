import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { mockClassrooms, mockChallenges, mockLeaderboard, mockChildren } from '@/data/mock-data';
import { Users, Trophy, TrendingUp, Target, ChevronRight, GraduationCap, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const activeChallenges = mockChallenges.filter(c => c.status === 'active');
  const completedChallenges = mockChallenges.filter(c => c.status === 'completed');
  const totalStudents = new Set(mockClassrooms.flatMap(c => c.studentIds)).size;
  const topStudents = [...mockLeaderboard].sort((a, b) => b.kivaPoints - a.kivaPoints).slice(0, 5);

  const stats = [
    { label: 'Turmas', value: mockClassrooms.length, icon: Users, bg: 'bg-[hsl(var(--kivara-light-blue))]', iconColor: 'text-primary', to: '/teacher/classes' },
    { label: 'Alunos', value: totalStudents, icon: GraduationCap, bg: 'bg-[hsl(var(--kivara-light-green))]', iconColor: 'text-secondary' },
    { label: 'Desafios Activos', value: activeChallenges.length, icon: Target, bg: 'bg-[hsl(var(--kivara-light-gold))]', iconColor: 'text-accent-foreground', to: '/teacher/challenges' },
    { label: 'Concluídos', value: completedChallenges.length, icon: Trophy, bg: 'bg-[hsl(var(--kivara-pink))]', iconColor: 'text-destructive' },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-5xl mx-auto">
      {/* Hero */}
      <motion.div variants={item}>
        <Card className="border-0 overflow-hidden relative shadow-kivara">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-secondary" />
          <div className="absolute top-[-30%] right-[-10%] w-[45%] h-[80%] rounded-full bg-white/5 blur-3xl" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[35%] h-[60%] rounded-full bg-white/5 blur-3xl" />
          <CardContent className="relative z-10 p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <p className="text-primary-foreground/60 text-xs font-medium uppercase tracking-wider">Modo Escolar</p>
                  <span className="text-[10px] bg-white/20 text-primary-foreground px-2 py-0.5 rounded-lg font-display font-semibold">BETA</span>
                </div>
                <h1 className="font-display text-2xl md:text-3xl font-bold text-primary-foreground">
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
      <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((stat) => (
          <motion.div key={stat.label} whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}>
            <Card
              className={`${stat.to ? 'cursor-pointer' : ''} border-border/50 hover:shadow-kivara transition-all duration-300 overflow-hidden`}
              onClick={() => stat.to && navigate(stat.to)}
            >
              <div className="h-0.5 bg-gradient-to-r from-primary to-secondary" />
              <CardContent className="p-4">
                <div className={`w-10 h-10 rounded-2xl ${stat.bg} flex items-center justify-center mb-3`}>
                  <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                </div>
                <p className="font-display text-2xl font-bold">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground font-semibold tracking-wider uppercase">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
    </motion.div>
  );
}