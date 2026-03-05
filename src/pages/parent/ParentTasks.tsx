import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockTasks, mockChildren } from '@/data/mock-data';
import { Plus, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from '@/hooks/use-toast';

export default function ParentTasks() {
  const statusLabels = { pending: 'Pendente', in_progress: 'Em Progresso', completed: 'A Aprovar', approved: 'Aprovada' };
  const categoryLabels = { cleaning: '🧹 Limpeza', studying: '📚 Estudo', helping: '🤝 Ajuda', other: '📌 Outro' };

  const handleApprove = (taskId: string) => {
    toast({ title: 'Tarefa aprovada! ✅', description: 'As moedas foram creditadas à criança.' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display text-2xl font-bold">Gestão de Tarefas</h1>
          <p className="text-sm text-muted-foreground">Cria e aprova tarefas para as crianças</p>
        </div>
        <Button className="rounded-xl font-display gap-1">
          <Plus className="h-4 w-4" /> Nova Tarefa
        </Button>
      </div>

      <div className="space-y-3">
        {mockTasks.map((task, i) => {
          const child = mockChildren.find((c) => c.id === task.childId);
          return (
            <motion.div key={task.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  <span className="text-2xl">{child?.avatar}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-display font-semibold text-sm">{task.title}</h3>
                      <span className="text-xs text-muted-foreground">{categoryLabels[task.category]}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{task.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-display font-bold">🪙 {task.reward}</span>
                      <span className="text-xs text-muted-foreground">· {child?.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={task.status === 'completed' ? 'default' : 'secondary'} className="text-xs">
                      {statusLabels[task.status]}
                    </Badge>
                    {task.status === 'completed' && (
                      <Button size="sm" variant="outline" className="rounded-xl gap-1 text-secondary" onClick={() => handleApprove(task.id)}>
                        <CheckCircle className="h-3 w-3" /> Aprovar
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
