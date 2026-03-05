import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { mockChildren, mockTasks, mockTransactions } from '@/data/mock-data';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function ParentReports() {
  const taskData = mockChildren.map((child) => ({
    name: child.name,
    completas: mockTasks.filter((t) => t.childId === child.id && (t.status === 'completed' || t.status === 'approved')).length,
    pendentes: mockTasks.filter((t) => t.childId === child.id && t.status === 'pending').length,
  }));

  const child1Tx = mockTransactions.filter((t) => t.childId === 'child-1');
  const pieData = [
    { name: 'Ganho', value: child1Tx.filter((t) => t.type === 'earned' || t.type === 'allowance').reduce((s, t) => s + t.amount, 0) },
    { name: 'Gasto', value: child1Tx.filter((t) => t.type === 'spent').reduce((s, t) => s + t.amount, 0) },
    { name: 'Poupado', value: child1Tx.filter((t) => t.type === 'saved').reduce((s, t) => s + t.amount, 0) },
  ];
  const COLORS = ['hsl(163, 40%, 45%)', 'hsl(0, 72%, 55%)', 'hsl(210, 52%, 37%)'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Relatórios</h1>
        <p className="text-sm text-muted-foreground">Acompanha o progresso financeiro da família</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-base">Tarefas por Criança</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={taskData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="completas" fill="hsl(163, 40%, 45%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pendentes" fill="hsl(40, 96%, 63%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display text-base">Ana — Distribuição Financeira</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-2">
              {pieData.map((entry, i) => (
                <div key={entry.name} className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                  <span className="text-xs">{entry.name}: {entry.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insight */}
      <Card className="gradient-kivara text-white border-0">
        <CardContent className="p-6">
          <p className="font-display font-bold text-lg mb-1">💡 Insight da Semana</p>
          <p className="text-white/80">A Ana poupou 40% das moedas ganhas este mês. O Pedro precisa de mais incentivos para poupar — considere criar uma meta de poupança para ele!</p>
        </CardContent>
      </Card>
    </div>
  );
}
