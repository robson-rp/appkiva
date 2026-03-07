import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Kivo } from '@/components/Kivo';
import { mockMissions } from '@/data/mock-data';
import { Target, CheckCircle2, Clock, Sparkles, Zap, Trophy, Swords, ListTodo, Loader2, Award } from 'lucide-react';
import { toast } from 'sonner';
import { WeeklyChallenges } from '@/components/WeeklyChallenges';
import { DailyMissionCard } from '@/components/DailyMissionCard';
import { useChildTasks, useCompleteTask } from '@/hooks/use-child-tasks';
import { Skeleton } from '@/components/ui/skeleton';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

const statusConfig = {
  available: { label: 'Disponível', icon: Sparkles, bg: 'bg-[hsl(var(--kivara-light-green))]', badgeBg: 'bg-secondary text-secondary-foreground', color: 'text-secondary' },
  in_progress: { label: 'Em Progresso', icon: Clock, bg: 'bg-[hsl(var(--kivara-light-gold))]', badgeBg: 'bg-accent text-accent-foreground', color: 'text-accent-foreground' },
  completed: { label: 'Concluída', icon: CheckCircle2, bg: 'bg-[hsl(var(--kivara-light-blue))]', badgeBg: 'bg-primary text-primary-foreground', color: 'text-primary' },
};

const taskStatusConfig = {
  pending: { label: 'Pendente', icon: Clock, bg: 'bg-muted', badgeCls: 'bg-muted text-muted-foreground border-0' },
  in_progress: { label: 'Em Curso', icon: Zap, bg: 'bg-[hsl(var(--kivara-light-blue))]', badgeCls: 'bg-[hsl(var(--kivara-light-blue))] text-primary border-0' },
  completed: { label: 'A Aprovar', icon: CheckCircle2, bg: 'bg-[hsl(var(--kivara-light-gold))]', badgeCls: 'bg-[hsl(var(--kivara-light-gold))] text-accent-foreground border-0' },
  approved: { label: 'Aprovada ✅', icon: Award, bg: 'bg-[hsl(var(--kivara-light-green))]', badgeCls: 'bg-[hsl(var(--kivara-light-green))] text-secondary border-0' },
};

const categoryEmoji: Record<string, string> = { cleaning: '🧹', studying: '📚', helping: '🤝', other: '📌' };

const typeEmoji: Record<string, string> = { saving: '🏦', budgeting: '📊', planning: '📋' };

type Tab = 'tasks' | 'missions' | 'challenges';

export default function ChildMissions() {
  const [tab, setTab] = useState<Tab>('tasks');
  const { data: tasks = [], isLoading: loadingTasks } = useChildTasks();
  const completeTask = useCompleteTask();

  const available = mockMissions.filter(m => m.status === 'available');
  const inProgress = mockMissions.filter(m => m.status === 'in_progress');
  const completed = mockMissions.filter(m => m.status === 'completed');

  const pendingTasks = tasks.filter(t => t.status === 'pending' || t.status === 'in_progress');
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const approvedTasks = tasks.filter(t => t.status === 'approved');

  return (
    <div className="space-y-5 max-w-2xl mx-auto pb-4">
      {/* Tab Switcher */}
      <div className="flex gap-1 bg-muted/50 rounded-2xl p-1">
        {[
          { id: 'tasks' as Tab, label: 'Tarefas', icon: ListTodo },
          { id: 'missions' as Tab, label: 'Missões', icon: Target },
          { id: 'challenges' as Tab, label: 'Desafios', icon: Swords },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-display font-bold transition-all duration-200 ${
              tab === t.id ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground/70'
            }`}
          >
            <t.icon className="h-3.5 w-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'challenges' ? (
        <WeeklyChallenges />
      ) : tab === 'tasks' ? (
        <TasksTab
          tasks={tasks}
          pendingTasks={pendingTasks}
          completedTasks={completedTasks}
          approvedTasks={approvedTasks}
          loading={loadingTasks}
          completeTask={completeTask}
        />
      ) : (
        <MissionsTab
          available={available}
          inProgress={inProgress}
          completed={completed}
        />
      )}
    </div>
  );
}

/* ─── Tasks Tab ─── */
function TasksTab({
  tasks,
  pendingTasks,
  completedTasks,
  approvedTasks,
  loading,
  completeTask,
}: {
  tasks: ReturnType<typeof useChildTasks>['data'] & any[];
  pendingTasks: any[];
  completedTasks: any[];
  approvedTasks: any[];
  loading: boolean;
  completeTask: ReturnType<typeof useCompleteTask>;
}) {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-5">
      {/* Hero */}
      <motion.div variants={item}>
        <Card className="border-0 overflow-hidden relative shadow-kivara">
          <div className="absolute inset-0 gradient-kivara" />
          <div className="absolute top-[-30%] right-[-15%] w-[55%] h-[80%] rounded-full bg-white/5 blur-3xl" />
          <CardContent className="relative z-10 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-white/15 backdrop-blur-sm rounded-xl p-2.5">
                <ListTodo className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="font-display text-xl font-bold text-white">As Minhas Tarefas</h1>
                <p className="text-sm text-white/60">Completa tarefas e ganha moedas!</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Por Fazer', value: pendingTasks.length, icon: Clock },
                { label: 'A Aprovar', value: completedTasks.length, icon: CheckCircle2 },
                { label: 'Aprovadas', value: approvedTasks.length, icon: Trophy },
              ].map((s) => (
                <div key={s.label} className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 text-center">
                  <s.icon className="h-3.5 w-3.5 text-white/60 mx-auto mb-1" />
                  <p className="font-display font-bold text-white text-xl">{s.value}</p>
                  <p className="text-[9px] text-white/50 uppercase tracking-wider font-medium">{s.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center text-3xl mx-auto mb-4">🎯</div>
            <p className="font-display font-bold text-sm">Sem tarefas por agora</p>
            <p className="text-xs text-muted-foreground mt-1">O teu encarregado pode criar novas tarefas para ti!</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Pending / In Progress */}
          {pendingTasks.length > 0 && (
            <motion.div variants={item}>
              <h2 className="font-display font-bold text-sm mb-3 flex items-center gap-2">
                <Zap className="h-4 w-4 text-accent-foreground" /> Por Fazer
              </h2>
              <div className="space-y-3">
                {pendingTasks.map((task) => {
                  const cfg = taskStatusConfig[task.status as keyof typeof taskStatusConfig];
                  const StatusIcon = cfg.icon;
                  return (
                    <motion.div key={task.id} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                      <Card className="border-border/50 overflow-hidden hover:shadow-md transition-all duration-200 group">
                        <div className="h-1 gradient-gold" />
                        <CardContent className="p-5">
                          <div className="flex items-start gap-3 mb-3">
                            <div className={`w-12 h-12 rounded-2xl ${cfg.bg} flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition-transform duration-300`}>
                              {categoryEmoji[task.category] ?? '📌'}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-0.5">
                                <h3 className="font-display font-bold text-sm">{task.title}</h3>
                                <Badge className={`text-[9px] ${cfg.badgeCls} rounded-lg`}>
                                  <StatusIcon className="h-3 w-3 mr-0.5" />
                                  {cfg.label}
                                </Badge>
                              </div>
                              {task.description && (
                                <p className="text-xs text-muted-foreground">{task.description}</p>
                              )}
                            </div>
                            <div className="text-right shrink-0">
                              <p className="font-display font-bold text-sm">🪙 {task.reward}</p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            className="w-full rounded-xl font-display gap-1.5 bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-sm"
                            disabled={completeTask.isPending}
                            onClick={() => completeTask.mutate(task.id)}
                          >
                            {completeTask.isPending ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            )}
                            Marcar como Concluída
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Waiting Approval */}
          {completedTasks.length > 0 && (
            <motion.div variants={item}>
              <h2 className="font-display font-bold text-sm mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4 text-accent-foreground" /> A Aguardar Aprovação
              </h2>
              <div className="space-y-3">
                {completedTasks.map((task) => (
                  <Card key={task.id} className="border-border/50 overflow-hidden">
                    <div className="h-1 bg-[hsl(var(--kivara-light-gold))]" />
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-[hsl(var(--kivara-light-gold))] flex items-center justify-center text-xl shrink-0">
                        {categoryEmoji[task.category] ?? '📌'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display font-semibold text-sm">{task.title}</h3>
                        <p className="text-[11px] text-muted-foreground">À espera que o encarregado aprove</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-display font-bold text-xs">🪙 {task.reward}</p>
                        <Badge className="text-[9px] bg-[hsl(var(--kivara-light-gold))] text-accent-foreground border-0 rounded-lg mt-0.5">
                          <Clock className="h-3 w-3 mr-0.5" /> A Aprovar
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

          {/* Approved */}
          {approvedTasks.length > 0 && (
            <motion.div variants={item}>
              <h2 className="font-display font-bold text-sm mb-3 flex items-center gap-2">
                <Trophy className="h-4 w-4 text-secondary" /> Aprovadas
              </h2>
              <div className="space-y-3">
                {approvedTasks.map((task) => (
                  <Card key={task.id} className="border-border/50 opacity-80">
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-[hsl(var(--kivara-light-green))] flex items-center justify-center text-xl shrink-0">
                        {categoryEmoji[task.category] ?? '📌'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-display font-semibold text-sm">{task.title}</h3>
                          <CheckCircle2 className="h-3.5 w-3.5 text-secondary shrink-0" />
                        </div>
                        {task.description && (
                          <p className="text-[11px] text-muted-foreground truncate">{task.description}</p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-display font-bold text-xs text-secondary">+{task.reward} 🪙</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}
        </>
      )}

      <Kivo page="missions" />
    </motion.div>
  );
}

/* ─── Missions Tab (existing mock data) ─── */
function MissionsTab({
  available,
  inProgress,
  completed,
}: {
  available: any[];
  inProgress: any[];
  completed: any[];
}) {
  // Classify missions as daily or weekly based on index (demo heuristic)
  const dailyMissions = [...available, ...inProgress].filter((_, i) => i % 2 === 0);
  const weeklyMissions = [...available, ...inProgress].filter((_, i) => i % 2 !== 0);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-5">
      {/* Hero */}
      <motion.div variants={item}>
        <Card className="border-0 overflow-hidden relative shadow-kivara">
          <div className="absolute inset-0 gradient-kivara" />
          <div className="absolute top-[-30%] right-[-15%] w-[55%] h-[80%] rounded-full bg-white/5 blur-3xl" />
          <CardContent className="relative z-10 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-white/15 backdrop-blur-sm rounded-xl p-2.5">
                <Target className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="font-display text-xl font-bold text-white">Missões</h1>
                <p className="text-sm text-white/60">Completa missões diárias e semanais!</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Diárias', value: dailyMissions.length, icon: Sparkles },
                { label: 'Semanais', value: weeklyMissions.length, icon: Zap },
                { label: 'Concluídas', value: completed.length, icon: Trophy },
              ].map((s) => (
                <div key={s.label} className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 text-center">
                  <s.icon className="h-3.5 w-3.5 text-white/60 mx-auto mb-1" />
                  <p className="font-display font-bold text-white text-xl">{s.value}</p>
                  <p className="text-[9px] text-white/50 uppercase tracking-wider font-medium">{s.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Daily Missions */}
      {dailyMissions.length > 0 && (
        <motion.div variants={item}>
          <h2 className="font-display font-bold text-sm mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-accent" /> Missões Diárias
            <span className="text-[10px] text-muted-foreground font-normal ml-auto">Renovam a cada 24h</span>
          </h2>
          <div className="space-y-3">
            {dailyMissions.map((mission) => (
              <DailyMissionCard key={mission.id} mission={mission} type="daily" />
            ))}
          </div>
        </motion.div>
      )}

      {/* Weekly Quests */}
      {weeklyMissions.length > 0 && (
        <motion.div variants={item}>
          <h2 className="font-display font-bold text-sm mb-3 flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" /> Quests Semanais
          </h2>
          <div className="space-y-3">
            {weeklyMissions.map((mission) => (
              <DailyMissionCard key={mission.id} mission={mission} type="weekly" />
            ))}
          </div>
        </motion.div>
      )}

      {/* In Progress */}
      {inProgress.length > 0 && (
        <motion.div variants={item}>
          <h2 className="font-display font-bold text-sm mb-3 flex items-center gap-2">
            <Zap className="h-4 w-4 text-accent-foreground" /> Em Curso
          </h2>
          <div className="space-y-3">
            {inProgress.map((mission) => {
              const cfg = statusConfig[mission.status];
              const progress = mission.targetAmount ? Math.min(Math.round(Math.random() * 80 + 10), 100) : 50;
              return (
                <Card key={mission.id} className="border-border/50 overflow-hidden hover:shadow-md transition-all duration-200">
                  <div className="h-1 gradient-gold" />
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`w-12 h-12 rounded-2xl ${cfg.bg} flex items-center justify-center text-2xl shrink-0`}>
                        {typeEmoji[mission.type]}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h3 className="font-display font-bold text-sm">{mission.title}</h3>
                          <Badge className={`text-[9px] ${cfg.badgeBg} border-0 rounded-lg`}>{cfg.label}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{mission.description}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-display font-bold text-sm">🪙 {mission.reward}</p>
                        <p className="text-[10px] text-muted-foreground">+{mission.kivaPointsReward} pts</p>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-[10px] text-muted-foreground font-medium">Progresso</span>
                        <span className="text-[10px] font-display font-bold text-accent-foreground">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2 rounded-full" />
                    </div>
                      <Button size="sm" className="w-full mt-3 rounded-xl font-display bg-accent hover:bg-accent/90 text-accent-foreground gap-1.5" onClick={() => toast('🚀 O sistema de missões interactivas estará disponível em breve!')}>
                        <Zap className="h-3.5 w-3.5" /> Continuar
                      </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Available */}
      {available.length > 0 && (
        <motion.div variants={item}>
          <h2 className="font-display font-bold text-sm mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-secondary" /> Disponíveis
          </h2>
          <div className="space-y-3">
            {available.map((mission) => {
              const cfg = statusConfig[mission.status];
              return (
                <motion.div key={mission.id} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                  <Card className="border-border/50 overflow-hidden hover:shadow-md transition-all duration-200 group">
                    <div className="h-1 gradient-kivara" />
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3 mb-3">
                        <div className={`w-12 h-12 rounded-2xl ${cfg.bg} flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition-transform duration-300`}>
                          {typeEmoji[mission.type]}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h3 className="font-display font-bold text-sm">{mission.title}</h3>
                            <Badge className={`text-[9px] ${cfg.badgeBg} border-0 rounded-lg`}>{cfg.label}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{mission.description}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-display font-bold text-sm">🪙 {mission.reward}</p>
                          <p className="text-[10px] text-muted-foreground">+{mission.kivaPointsReward} pts</p>
                        </div>
                      </div>
                      {mission.targetAmount && (
                        <div className="bg-muted/40 rounded-xl px-3 py-2 mb-3 flex items-center gap-2">
                          <Target className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">Meta: <strong className="text-foreground">🪙 {mission.targetAmount}</strong></span>
                        </div>
                      )}
                      <Button size="sm" className="w-full rounded-xl font-display gap-1.5 shadow-sm" onClick={() => toast({ title: '🚀 Em breve!', description: 'O sistema de missões interactivas estará disponível em breve.' })}>
                        <Target className="h-3.5 w-3.5" /> Começar Missão
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Completed */}
      {completed.length > 0 && (
        <motion.div variants={item}>
          <h2 className="font-display font-bold text-sm mb-3 flex items-center gap-2">
            <Trophy className="h-4 w-4 text-primary" /> Concluídas
          </h2>
          <div className="space-y-3">
            {completed.map((mission) => {
              const cfg = statusConfig[mission.status];
              return (
                <Card key={mission.id} className="border-border/50 opacity-80">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl ${cfg.bg} flex items-center justify-center text-xl shrink-0`}>
                      {typeEmoji[mission.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-display font-semibold text-sm">{mission.title}</h3>
                        <CheckCircle2 className="h-3.5 w-3.5 text-secondary shrink-0" />
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate">{mission.description}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-display font-bold text-xs text-secondary">+{mission.reward} 🪙</p>
                      <p className="text-[10px] text-muted-foreground">+{mission.kivaPointsReward} pts</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </motion.div>
      )}

      <Kivo page="missions" />
    </motion.div>
  );
}
