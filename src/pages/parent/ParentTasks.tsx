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
  pending: { label: 'Pendente', icon: Clock, variant: 'outline' as const, className: 'border-muted-foreground/30 text-muted-foreground' },
  in_progress: { label: 'Em Progresso', icon: Loader2, variant: 'secondary' as const, className: 'bg-[hsl(var(--kivara-light-blue))] text-primary border-0' },
  completed: { label: 'A Aprovar', icon: CheckCircle, variant: 'default' as const, className: 'bg-[hsl(var(--kivara-light-gold))] text-accent-foreground border-0' },
  approved: { label: 'Aprovada', icon: Award, variant: 'secondary' as const, className: 'bg-[hsl(var(--kivara-light-green))] text-secondary border-0' },
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
        <div className="relative flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold">Gestão de Tarefas</h1>
            <p className="text-sm text-primary-foreground/70 mt-1">Cria e aprova tarefas para as crianças</p>
          </div>
          <Button className="rounded-2xl font-display gap-2 bg-white/20 hover:bg-white/30 text-primary-foreground border-0 backdrop-blur-sm">
            <Plus className="h-4 w-4" /> Nova Tarefa
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: stats.total, icon: ListTodo, bg: 'bg-[hsl(var(--kivara-light-blue))]' },
          { label: 'Pendentes', value: stats.pending, icon: Clock, bg: 'bg-muted' },
          { label: 'A Aprovar', value: stats.toApprove, icon: CheckCircle, bg: 'bg-[hsl(var(--kivara-light-gold))]' },
          { label: 'Aprovadas', value: stats.approved, icon: Award, bg: 'bg-[hsl(var(--kivara-light-green))]' },
        ].map((s) => (
          <Card key={s.label} className="border-border/50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`${s.bg} rounded-xl p-2.5`}>
                <s.icon className="h-4 w-4 text-foreground/70" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{s.label}</p>
                <p className="font-display font-bold text-xl">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Task List */}
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
        {mockTasks.map((task) => {
          const child = mockChildren.find((c) => c.id === task.childId);
          const config = statusConfig[task.status];
          const StatusIcon = config.icon;
          return (
            <motion.div key={task.id} variants={item}>
              <Card className="group hover:shadow-md transition-all duration-200 border-border/50 overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex items-center gap-4 p-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[hsl(var(--kivara-light-blue))] to-[hsl(var(--kivara-light-green))] flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition-transform duration-300">
                      {child?.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="font-display font-bold text-sm">{task.title}</h3>
                        <span className="text-xs text-muted-foreground">{categoryLabels[task.category]}</span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{task.description}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-xs font-display font-bold bg-[hsl(var(--kivara-light-gold))] px-2 py-0.5 rounded-lg">🪙 {task.reward}</span>
                        <span className="text-xs text-muted-foreground">· {child?.name}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant={config.variant} className={`text-[10px] font-display gap-1 rounded-lg px-2.5 py-1 ${config.className}`}>
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
