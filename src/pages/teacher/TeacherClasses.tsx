import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { mockClassrooms, mockChildren, mockLeaderboard } from '@/data/mock-data';
import { Plus, Users, GraduationCap, TrendingUp, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

export default function TeacherClasses() {
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
                  <p className="font-display text-xl font-bold text-primary-foreground">{mockClassrooms.length}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-2 text-center">
                  <p className="text-[10px] text-primary-foreground/60 uppercase tracking-wider">Alunos</p>
                  <p className="font-display text-xl font-bold text-primary-foreground">
                    {new Set(mockClassrooms.flatMap(c => c.studentIds)).size}
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
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" className="rounded-xl font-display gap-1">
              <Plus className="h-4 w-4" /> Nova Turma
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display">Criar Nova Turma</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nome da turma</Label>
                <Input placeholder="Ex: Turma dos Exploradores" />
              </div>
              <div className="space-y-2">
                <Label>Ano escolar</Label>
                <Input placeholder="Ex: 4.º Ano" />
              </div>
              <Button className="w-full rounded-xl font-display">🎓 Criar Turma</Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Classes */}
      <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
        {mockClassrooms.map((classroom) => {
          const students = mockLeaderboard.filter(s =>
            classroom.studentIds.includes(s.childId)
          );
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
                    <div>
                      <span className="block">{classroom.name}</span>
                      <span className="text-xs text-muted-foreground font-normal">{classroom.grade} · Criada em {classroom.createdAt}</span>
                    </div>
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
                    <p className="text-xs font-display font-semibold text-muted-foreground flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" /> Alunos
                    </p>
                    {students.map((student, i) => (
                      <motion.div
                        key={student.childId}
                        whileHover={{ x: 4 }}
                        className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/20 hover:bg-muted/50 transition-all"
                      >
                        <span className="text-lg">{student.avatar}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-display font-bold">{student.name}</p>
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                            <span>⭐ {student.kivaPoints} pts</span>
                            <span>📊 {student.savingsRate}% poupança</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-display font-bold">{student.tasksCompleted}</p>
                          <p className="text-[9px] text-muted-foreground">tarefas</p>
                        </div>
                      </motion.div>
                    ))}
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
    </motion.div>
  );
}