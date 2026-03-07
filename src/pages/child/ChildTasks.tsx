import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Kivo } from '@/components/Kivo';
import { ListTodo, CheckCircle2, Clock, Zap, Trophy, Loader2, Award, Filter } from 'lucide-react';
import { useChildTasks, useCompleteTask } from '@/hooks/use-child-tasks';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

const taskStatusConfig = {
  pending: { label: 'Pendente', icon: Clock, bg: 'bg-muted', badgeCls: 'bg-muted text-muted-foreground border-0' },
  in_progress: { label: 'Em Curso', icon: Zap, bg: 'bg-primary/10', badgeCls: 'bg-primary/10 text-primary border-0' },
  completed: { label: 'A Aprovar', icon: CheckCircle2, bg: 'bg-accent/20', badgeCls: 'bg-accent/20 text-accent-foreground border-0' },
  approved: { label: 'Aprovada ✅', icon: Award, bg: 'bg-secondary/10', badgeCls: 'bg-secondary/10 text-secondary border-0' },
};

const categoryEmoji: Record<string, string> = { cleaning: '🧹', studying: '📚', helping: '🤝', other: '📌' };

type FilterType = 'all' | 'pending' | 'completed' | 'approved';

export default function ChildTasks() {
  const { data: tasks = [], isLoading } = useChildTasks();
  const completeTask = useCompleteTask();
  const [filter, setFilter] = useState<FilterType>('all');

  const pendingTasks = tasks.filter(t => t.status === 'pending' || t.status === 'in_progress');
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const approvedTasks = tasks.filter(t => t.status === 'approved');

  const totalReward = approvedTasks.reduce((sum, t) => sum + t.reward, 0);

  const filteredTasks = filter === 'all' ? tasks
    : filter === 'pending' ? pendingTasks
    : filter === 'completed' ? completedTasks
    : approvedTasks;

  const filters: { id: FilterType; label: string; count: number }[] = [
    { id: 'all', label: 'Todas', count: tasks.length },
    { id: 'pending', label: 'Por Fazer', count: pendingTasks.length },
    { id: 'completed', label: 'A Aprovar', count: completedTasks.length },
    { id: 'approved', label: 'Aprovadas', count: approvedTasks.length },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-5 max-w-2xl mx-auto pb-4">
      {/* Hero Card */}
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
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'Por Fazer', value: pendingTasks.length, icon: Clock },
                { label: 'A Aprovar', value: completedTasks.length, icon: CheckCircle2 },
                { label: 'Aprovadas', value: approvedTasks.length, icon: Trophy },
                { label: 'Ganhas', value: `${totalReward}🪙`, icon: Award },
              ].map((s) => (
                <div key={s.label} className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 text-center">
                  <s.icon className="h-3.5 w-3.5 text-white/60 mx-auto mb-1" />
                  <p className="font-display font-bold text-white text-lg">{s.value}</p>
                  <p className="text-[8px] text-white/50 uppercase tracking-wider font-medium">{s.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filter Pills */}
      <motion.div variants={item} className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-display font-bold whitespace-nowrap transition-all duration-200 ${
              filter === f.id
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted'
            }`}
          >
            {f.label}
            <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${
              filter === f.id ? 'bg-white/20' : 'bg-background'
            }`}>
              {f.count}
            </span>
          </button>
        ))}
      </motion.div>

      {/* Task List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      ) : filteredTasks.length === 0 ? (
        <motion.div variants={item}>
          <Card className="border-border/50">
            <CardContent className="py-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center text-3xl mx-auto mb-4">
                {filter === 'all' ? '🎯' : filter === 'pending' ? '✨' : filter === 'completed' ? '⏳' : '🏆'}
              </div>
              <p className="font-display font-bold text-sm">
                {filter === 'all' ? 'Sem tarefas por agora' : `Nenhuma tarefa ${filters.find(f => f.id === filter)?.label.toLowerCase()}`}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {filter === 'all' ? 'O teu encarregado pode criar novas tarefas para ti!' : 'Continua assim! 💪'}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task, i) => {
            const cfg = taskStatusConfig[task.status as keyof typeof taskStatusConfig];
            const StatusIcon = cfg.icon;
            const canComplete = task.status === 'pending' || task.status === 'in_progress';

            return (
              <motion.div
                key={task.id}
                variants={item}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <Card className="border-border/50 overflow-hidden hover:shadow-md transition-all duration-200 group">
                  <div className={`h-1 ${task.status === 'approved' ? 'bg-secondary' : task.status === 'completed' ? 'bg-accent' : 'gradient-gold'}`} />
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-12 h-12 rounded-2xl ${cfg.bg} flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition-transform duration-300`}>
                        {categoryEmoji[task.category] ?? '📌'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h3 className="font-display font-bold text-sm truncate">{task.title}</h3>
                          <Badge className={`text-[9px] ${cfg.badgeCls} rounded-lg shrink-0`}>
                            <StatusIcon className="h-3 w-3 mr-0.5" />
                            {cfg.label}
                          </Badge>
                        </div>
                        {task.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <span className="font-display font-bold text-sm">🪙 {task.reward}</span>
                          {task.status === 'completed' && (
                            <span className="text-[10px] text-muted-foreground">À espera de aprovação</span>
                          )}
                          {task.status === 'approved' && (
                            <span className="text-[10px] text-secondary font-semibold">Recompensa recebida!</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {canComplete && (
                      <Button
                        size="sm"
                        className="w-full mt-3 rounded-xl font-display gap-1.5 bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-sm"
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
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      <Kivo page="missions" />
    </motion.div>
  );
}
