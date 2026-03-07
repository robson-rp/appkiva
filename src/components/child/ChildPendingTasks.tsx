import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ListTodo, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Task {
  id: string;
  title: string;
  description?: string;
  category: string;
  reward: number;
}

interface ChildPendingTasksProps {
  tasks: Task[];
}

export function ChildPendingTasks({ tasks }: ChildPendingTasksProps) {
  const navigate = useNavigate();

  if (tasks.length === 0) return null;

  return (
    <Card className="border border-border/50">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-display flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <ListTodo className="h-3.5 w-3.5 text-primary" />
          </div>
          Próximas Tarefas
        </CardTitle>
        <button onClick={() => navigate('/child/tasks')} className="text-xs text-primary font-semibold flex items-center gap-0.5 hover:underline">
          Ver todas <ChevronRight className="h-3 w-3" />
        </button>
      </CardHeader>
      <CardContent className="space-y-2">
        {tasks.slice(0, 2).map((task) => (
          <motion.div
            key={task.id}
            whileHover={{ x: 4 }}
            className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-sm">
                {task.category === 'cleaning' ? '🧹' : task.category === 'studying' ? '📚' : '🤝'}
              </div>
              <div>
                <p className="text-sm font-semibold">{task.title}</p>
                <p className="text-[11px] text-muted-foreground">{task.description?.slice(0, 35)}...</p>
              </div>
            </div>
            <span className="text-sm font-display font-bold text-secondary">+{task.reward} 🪙</span>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}
