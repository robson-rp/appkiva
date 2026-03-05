import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockTasks, mockChildren } from '@/data/mock-data';
import { Plus, CheckCircle, ListTodo, Clock, Loader2, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from '@/hooks/use-toast';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, x: -10 }, show: { opacity: 1, x: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

const statusConfig = {
  pending: { label: 'Pendente', icon: Clock, className: 'bg-muted text-muted-foreground border-0' },
  in_progress: { label: 'Em Progresso', icon: Loader2, className: 'bg-[hsl(var(--kivara-light-blue))] text-primary border-0' },
  completed: { label: 'A Aprovar', icon: CheckCircle, className: 'bg-[hsl(var(--kivara-light-gold))] text-accent-foreground border-0' },
  approved: { label: 'Aprovada', icon: Award, className: 'bg-[hsl(var(--kivara-light-green))] text-secondary border-0' },
};

const categoryLabels: Record<string, string> = { cleaning: '🧹 Limpeza', studying: '📚 Estudo', helping: '🤝 Ajuda', other: '📌 Outro' };

export default function ParentTasks() {
  const handleApprove = (taskId: string) => {
    toast({ title: 'Tarefa aprovada! ✅', description: 'As moedas foram creditadas à criança.' });
  };

  const stats = {
    total: mockTasks.length,
    pending: mockTasks.filter(t => t.status === 'pending').length,
    toApprove: mockTasks.filter(t => t.status === 'completed').length,
    approved: mockTasks.filter(t => t.status === 'approved').length,
  };

  return (
    <div className="space-y-6">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-2xl gradient-kivara p-6 text-primary-foreground">
        <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute top-0 left-1/3 w-60 h-20 rounded-full bg-white/5 blur-2xl" />
        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-primary-foreground/60 text-[10px] uppercase tracking-wider font-medium">Gestão</p>
            <h1 className="font-display text-2xl font-bold mt-1">Tarefas</h1>
            <p className="text-sm text-primary-foreground/60 mt-1">Cria e aprova tarefas para as crianças</p>
          </div>
          <Button className="rounded-2xl font-display gap-2 bg-white/15 hover:bg-white/25 text-primary-foreground border-0 backdrop-blur-sm shadow-lg">
            <Plus className="h-4 w-4" /> Nova Tarefa
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: stats.total, icon: ListTodo, bg: 'bg-[hsl(var(--kivara-light-blue))]', color: 'text-primary' },
          { label: 'Pendentes', value: stats.pending, icon: Clock, bg: 'bg-muted', color: 'text-muted-foreground' },
          { label: 'A Aprovar', value: stats.toApprove, icon: CheckCircle, bg: 'bg-[hsl(var(--kivara-light-gold))]', color: 'text-accent-foreground' },
          { label: 'Aprovadas', value: stats.approved, icon: Award, bg: 'bg-[hsl(var(--kivara-light-green))]', color: 'text-secondary' },
        ].map((s) => (
          <motion.div key={s.label} variants={item} whileHover={{ scale: 1.03, y: -2 }}>
            <Card className="border-border/50 overflow-hidden hover:shadow-md transition-all duration-300">
              <div className="h-0.5 gradient-kivara" />
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`${s.bg} rounded-2xl p-2.5`}>
                  <s.icon className={`h-4 w-4 ${s.color}`} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{s.label}</p>
                  <p className="font-display font-bold text-xl">{s.value}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Task List */}
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
        {mockTasks.map((task) => {
          const child = mockChildren.find((c) => c.id === task.childId);
          const config = statusConfig[task.status];
          const StatusIcon = config.icon;
          return (
            <motion.div key={task.id} variants={item} whileHover={{ x: 4 }}>
              <Card className="group hover:shadow-kivara transition-all duration-300 border-border/50 overflow-hidden">
                <div className="h-0.5 gradient-gold opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CardContent className="p-0">
                  <div className="flex items-center gap-4 p-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[hsl(var(--kivara-light-blue))] to-[hsl(var(--kivara-light-green))] flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                      {child?.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="font-display font-bold text-sm">{task.title}</h3>
                        <span className="text-[10px] text-muted-foreground bg-muted rounded-lg px-2 py-0.5">{categoryLabels[task.category]}</span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{task.description}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-xs font-display font-bold bg-[hsl(var(--kivara-light-gold))] px-2.5 py-0.5 rounded-xl">🪙 {task.reward}</span>
                        <span className="text-xs text-muted-foreground">· {child?.name}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="secondary" className={`text-[10px] font-display gap-1 rounded-xl px-2.5 py-1 ${config.className}`}>
                        <StatusIcon className="h-3 w-3" />
                        {config.label}
                      </Badge>
                      {task.status === 'completed' && (
                        <Button size="sm" className="rounded-xl gap-1.5 font-display bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-sm" onClick={() => handleApprove(task.id)}>
                          <CheckCircle className="h-3.5 w-3.5" /> Aprovar
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
