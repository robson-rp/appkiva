import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { mockChildren, mockTasks, mockTransactions } from '@/data/mock-data';
import { CoinDisplay } from '@/components/CoinDisplay';
import { Users, ListTodo, CheckCircle, PiggyBank, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function ParentDashboard() {
  const navigate = useNavigate();
  const totalDistributed = mockTransactions
    .filter((t) => t.type === 'allowance')
    .reduce((s, t) => s + t.amount, 0);
  const tasksCompleted = mockTasks.filter((t) => t.status === 'completed' || t.status === 'approved').length;
  const tasksPending = mockTasks.filter((t) => t.status === 'completed').length;

  const stats = [
    { label: 'Crianças', value: mockChildren.length, icon: Users, color: 'bg-kivara-light-blue', to: '/parent/children' },
    { label: 'Moedas Distribuídas', value: totalDistributed, icon: PiggyBank, color: 'bg-kivara-light-gold', to: '/parent/allowance' },
    { label: 'Tarefas Concluídas', value: tasksCompleted, icon: CheckCircle, color: 'bg-kivara-light-green', to: '/parent/tasks' },
    { label: 'A Aprovar', value: tasksPending, icon: ListTodo, color: 'bg-kivara-pink', to: '/parent/tasks' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Painel Familiar</h1>
        <p className="text-sm text-muted-foreground">Resumo da actividade financeira da família</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(stat.to)}>
              <CardContent className="p-5">
                <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
                <p className="font-display text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Children overview */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-lg flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" /> Crianças
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockChildren.map((child) => (
              <div key={child.id} className="flex items-center gap-4 p-3 rounded-xl bg-muted/50">
                <span className="text-3xl">{child.avatar}</span>
                <div className="flex-1">
                  <p className="font-display font-semibold">{child.name}</p>
                  <p className="text-xs text-muted-foreground">@{child.username}</p>
                </div>
                <CoinDisplay amount={child.balance} size="sm" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent tasks */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-lg flex items-center gap-2">
            <ListTodo className="h-5 w-5 text-secondary" /> Tarefas Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockTasks.slice(0, 4).map((task) => {
              const child = mockChildren.find((c) => c.id === task.childId);
              const statusColors = {
                pending: 'bg-kivara-light-gold text-accent-foreground',
                in_progress: 'bg-kivara-light-blue text-primary',
                completed: 'bg-kivara-light-green text-secondary',
                approved: 'bg-secondary/10 text-secondary',
              };
              return (
                <div key={task.id} className="flex items-center gap-3">
                  <span className="text-lg">{child?.avatar}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{task.title}</p>
                    <p className="text-xs text-muted-foreground">{child?.name} · 🪙 {task.reward}</p>
                  </div>
                  <span className={`text-[10px] font-display font-semibold px-2 py-0.5 rounded-full ${statusColors[task.status]}`}>
                    {task.status === 'pending' ? 'Pendente' : task.status === 'in_progress' ? 'Em Progresso' : task.status === 'completed' ? 'A Aprovar' : 'Aprovada'}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
