import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Kivo } from '@/components/Kivo';
import { useChildMissions, useStartMission, useCompleteMission } from '@/hooks/use-missions';
import { useWalletBalance } from '@/hooks/use-wallet';
import { Target, CheckCircle2, Clock, Sparkles, Zap, Trophy, Swords, ListTodo, Loader2, Award } from 'lucide-react';
import { WeeklyChallenges } from '@/components/WeeklyChallenges';
import { useChildTasks, useCompleteTask } from '@/hooks/use-child-tasks';
import { Skeleton } from '@/components/ui/skeleton';
import { useT } from '@/contexts/LanguageContext';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

const categoryEmoji: Record<string, string> = { cleaning: '🧹', studying: '📚', helping: '🤝', other: '📌' };
const typeEmoji: Record<string, string> = { saving: '🏦', budgeting: '📊', planning: '📋' };

type Tab = 'tasks' | 'missions' | 'challenges';

export default function ChildMissions() {
  const t = useT();
  const [tab, setTab] = useState<Tab>('tasks');
  const { data: tasks = [], isLoading: loadingTasks } = useChildTasks();
  const completeTask = useCompleteTask();

  const { data: missions = [], isLoading: loadingMissions } = useChildMissions();
  const walletQuery = useWalletBalance();
  const bal = walletQuery.data?.balance ?? 0;
  const startMission = useStartMission();
  const completeMissionMut = useCompleteMission();

  const available = missions.filter(m => m.status === 'available');
  const inProgress = missions.filter(m => m.status === 'in_progress');
  const completed = missions.filter(m => m.status === 'completed');

  const pendingTasks = tasks.filter(t => t.status === 'pending' || t.status === 'in_progress');
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const approvedTasks = tasks.filter(t => t.status === 'approved');

  const statusConfig = {
    available: { label: t('child.missions.status.available'), icon: Sparkles, bg: 'bg-[hsl(var(--kivara-light-green))]', badgeBg: 'bg-secondary text-secondary-foreground', color: 'text-secondary' },
    in_progress: { label: t('child.missions.status.in_progress'), icon: Clock, bg: 'bg-[hsl(var(--kivara-light-gold))]', badgeBg: 'bg-accent text-accent-foreground', color: 'text-accent-foreground' },
    completed: { label: t('child.missions.status.completed'), icon: CheckCircle2, bg: 'bg-[hsl(var(--kivara-light-blue))]', badgeBg: 'bg-primary text-primary-foreground', color: 'text-primary' },
  };

  const taskStatusConfig = {
    pending: { label: t('child.tasks.pending'), icon: Clock, bg: 'bg-muted', badgeCls: 'bg-muted text-muted-foreground border-0' },
    in_progress: { label: t('child.tasks.in_progress'), icon: Zap, bg: 'bg-[hsl(var(--kivara-light-blue))]', badgeCls: 'bg-[hsl(var(--kivara-light-blue))] text-primary border-0' },
    completed: { label: t('child.tasks.to_approve'), icon: CheckCircle2, bg: 'bg-[hsl(var(--kivara-light-gold))]', badgeCls: 'bg-[hsl(var(--kivara-light-gold))] text-accent-foreground border-0' },
    approved: { label: t('child.tasks.approved_label'), icon: Award, bg: 'bg-[hsl(var(--kivara-light-green))]', badgeCls: 'bg-[hsl(var(--kivara-light-green))] text-secondary border-0' },
  };

  return (
    <div className="space-y-5 max-w-2xl mx-auto pb-4">
      {/* Tab Switcher */}
      <div className="flex gap-1 bg-muted/50 rounded-2xl p-1">
        {[
          { id: 'tasks' as Tab, label: t('child.missions.tab.tasks'), icon: ListTodo },
          { id: 'missions' as Tab, label: t('child.missions.tab.missions'), icon: Target },
          { id: 'challenges' as Tab, label: t('child.missions.tab.challenges'), icon: Swords },
        ].map((tb) => (
          <button
            key={tb.id}
            onClick={() => setTab(tb.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-display font-bold transition-all duration-200 ${
              tab === tb.id ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground/70'
            }`}
          >
            <tb.icon className="h-3.5 w-3.5" />
            {tb.label}
          </button>
        ))}
      </div>

      {tab === 'challenges' ? (
        <WeeklyChallenges />
      ) : tab === 'tasks' ? (
        <TasksTab
          t={t}
          tasks={tasks}
          pendingTasks={pendingTasks}
          completedTasks={completedTasks}
          approvedTasks={approvedTasks}
          loading={loadingTasks}
          completeTask={completeTask}
          taskStatusConfig={taskStatusConfig}
        />
      ) : (
        <MissionsTab
          t={t}
          available={available}
          inProgress={inProgress}
          completed={completed}
          statusConfig={statusConfig}
          loading={loadingMissions}
          startMission={startMission}
          completeMission={completeMissionMut}
        />
      )}
    </div>
  );
}

/* ─── Tasks Tab ─── */
function TasksTab({
  t,
  tasks,
  pendingTasks,
  completedTasks,
  approvedTasks,
  loading,
  completeTask,
  taskStatusConfig,
}: {
  t: (key: string) => string;
  tasks: any[];
  pendingTasks: any[];
  completedTasks: any[];
  approvedTasks: any[];
  loading: boolean;
  completeTask: ReturnType<typeof useCompleteTask>;
  taskStatusConfig: any;
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
                <h1 className="font-display text-xl font-bold text-white">{t('child.tasks.title')}</h1>
                <p className="text-sm text-white/60">{t('child.tasks.subtitle')}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: t('child.tasks.todo'), value: pendingTasks.length, icon: Clock },
                { label: t('child.tasks.to_approve'), value: completedTasks.length, icon: CheckCircle2 },
                { label: t('child.tasks.approved'), value: approvedTasks.length, icon: Trophy },
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
            <p className="font-display font-bold text-sm">{t('child.tasks.no_tasks')}</p>
            <p className="text-xs text-muted-foreground mt-1">{t('child.tasks.no_tasks_hint')}</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Pending / In Progress */}
          {pendingTasks.length > 0 && (
            <motion.div variants={item}>
              <h2 className="font-display font-bold text-sm mb-3 flex items-center gap-2">
                <Zap className="h-4 w-4 text-accent-foreground" /> {t('child.tasks.todo')}
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
                            {t('child.tasks.mark_done')}
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
                <Clock className="h-4 w-4 text-accent-foreground" /> {t('child.tasks.waiting_approval')}
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
                        <p className="text-[11px] text-muted-foreground">{t('child.tasks.waiting_parent')}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-display font-bold text-xs">🪙 {task.reward}</p>
                        <Badge className="text-[9px] bg-[hsl(var(--kivara-light-gold))] text-accent-foreground border-0 rounded-lg mt-0.5">
                          <Clock className="h-3 w-3 mr-0.5" /> {t('child.tasks.to_approve')}
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
                <Trophy className="h-4 w-4 text-secondary" /> {t('child.tasks.approved')}
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
  t,
  available,
  inProgress,
  completed,
  statusConfig,
  loading,
  startMission,
  completeMission,
}: {
  t: (key: string) => string;
  available: any[];
  inProgress: any[];
  completed: any[];
  statusConfig: any;
  loading: boolean;
  startMission: ReturnType<typeof useStartMission>;
  completeMission: ReturnType<typeof useCompleteMission>;
}) {
  const allActive = [...available, ...inProgress];

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
      </div>
    );
  }

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
                <h1 className="font-display text-xl font-bold text-white">{t('child.missions.title')}</h1>
                <p className="text-sm text-white/60">{t('child.missions.complete_tasks')}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: t('child.missions.available'), value: available.length, icon: Sparkles },
                { label: t('child.missions.in_progress'), value: inProgress.length, icon: Zap },
                { label: t('child.missions.completed'), value: completed.length, icon: Trophy },
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

      {allActive.length === 0 && completed.length === 0 && (
        <Card className="border-border/50">
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center text-3xl mx-auto mb-4">🎯</div>
            <p className="font-display font-bold text-sm">{t('child.tasks.no_tasks')}</p>
            <p className="text-xs text-muted-foreground mt-1">O teu encarregado ainda não criou missões.</p>
          </CardContent>
        </Card>
      )}

      {inProgress.length > 0 && (
        <motion.div variants={item}>
          <h2 className="font-display font-bold text-sm mb-3 flex items-center gap-2">
            <Zap className="h-4 w-4 text-accent-foreground" /> {t('child.missions.in_progress')}
          </h2>
          <div className="space-y-3">
            {inProgress.map((mission) => {
              const cfg = statusConfig[mission.status];
              const progress = mission.target_amount ? Math.min(Math.round((walletBalance / mission.target_amount) * 100), 100) : null;
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
                        <p className="text-[10px] text-muted-foreground">+{mission.kiva_points_reward} pts</p>
                      </div>
                    </div>
                    {progress !== null ? (
                       <div className="space-y-1.5">
                         <div className="flex justify-between">
                           <span className="text-[10px] text-muted-foreground font-medium">{t('child.missions.progress')}</span>
                           <span className="text-[10px] font-display font-bold text-accent-foreground">{walletBalance}/{mission.target_amount} 🪙 ({progress}%)</span>
                         </div>
                         <Progress value={progress} className="h-2 rounded-full" />
                       </div>
                     ) : (
                       <div className="flex justify-between">
                         <span className="text-[10px] text-muted-foreground font-medium">{t('child.missions.progress')}</span>
                         <span className="text-[10px] font-display font-bold text-accent-foreground">—</span>
                       </div>
                     )}
                      <Button size="sm" className="w-full mt-3 rounded-xl font-display bg-accent hover:bg-accent/90 text-accent-foreground gap-1.5" disabled={completeMission.isPending} onClick={() => completeMission.mutate(mission.id)}>
                        {completeMission.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />} {t('child.missions.continue')}
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
            <Sparkles className="h-4 w-4 text-secondary" /> {t('child.missions.available')}
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
                          <p className="text-[10px] text-muted-foreground">+{mission.kiva_points_reward} pts</p>
                        </div>
                      </div>
                      {mission.target_amount && (() => {
                         const avProgress = Math.min(Math.round((walletBalance / mission.target_amount) * 100), 100);
                         return (
                           <div className="bg-muted/40 rounded-xl px-3 py-2 mb-3 space-y-1.5">
                             <div className="flex items-center gap-2">
                               <Target className="h-3.5 w-3.5 text-muted-foreground" />
                               <span className="text-xs text-muted-foreground">{t('child.dreams.target')}: <strong className="text-foreground">🪙 {mission.target_amount}</strong></span>
                               <span className="text-[10px] font-display font-bold text-accent-foreground ml-auto">{walletBalance}/{mission.target_amount} ({avProgress}%)</span>
                             </div>
                             <Progress value={avProgress} className="h-1.5 rounded-full" />
                           </div>
                         );
                       })()}
                      <Button size="sm" className="w-full rounded-xl font-display gap-1.5 shadow-sm" disabled={startMission.isPending} onClick={() => startMission.mutate(mission.id)}>
                        <Target className="h-3.5 w-3.5" /> {t('child.missions.start')}
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
            <Trophy className="h-4 w-4 text-primary" /> {t('child.missions.completed')}
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
                       {mission.target_amount && (
                         <Progress value={100} className="h-1.5 rounded-full mt-1.5" />
                       )}
                     </div>
                    <div className="text-right shrink-0">
                      <p className="font-display font-bold text-xs text-secondary">+{mission.reward} 🪙</p>
                      <p className="text-[10px] text-muted-foreground">+{mission.kiva_points_reward} pts</p>
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
