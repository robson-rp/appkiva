import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CoinDisplay } from '@/components/CoinDisplay';
import { LevelBadge } from '@/components/LevelBadge';
import { Kivo } from '@/components/Kivo';
import { mockChildren, mockTasks, mockMissions, mockVaults } from '@/data/mock-data';
import { Progress } from '@/components/ui/progress';
import { ListTodo, Target, PiggyBank, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1 } }),
};

export default function ChildDashboard() {
  const child = mockChildren[0];
  const pendingTasks = mockTasks.filter((t) => t.childId === child.id && t.status === 'pending').length;
  const activeMissions = mockMissions.filter((m) => m.status === 'available' || (m.status === 'in_progress' && m.childId === child.id)).length;
  const vaults = mockVaults.filter((v) => v.childId === child.id);
  const navigate = useNavigate();

  const stats = [
    { label: 'Tarefas Pendentes', value: pendingTasks, icon: ListTodo, color: 'bg-kivara-light-blue', to: '/child/wallet' },
    { label: 'Missões Activas', value: activeMissions, icon: Target, color: 'bg-kivara-light-green', to: '/child/missions' },
    { label: 'Cofres', value: vaults.length, icon: PiggyBank, color: 'bg-kivara-light-gold', to: '/child/vaults' },
  ];

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Welcome & Balance */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="gradient-kivara text-white border-0 overflow-hidden relative">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-white/80 text-sm mb-1 font-body">A tua carteira</p>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-3xl">🪙</span>
                  <span className="font-display text-4xl font-bold">{child.balance}</span>
                </div>
                <LevelBadge level={child.level} points={child.kivaPoints} showProgress />
              </div>
              <motion.span
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-5xl"
              >
                {child.avatar}
              </motion.span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} custom={i} variants={cardVariants} initial="hidden" animate="visible">
            <Card
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(stat.to)}
            >
              <CardContent className="p-4 text-center">
                <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mx-auto mb-2`}>
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
                <p className="font-display text-2xl font-bold">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground leading-tight">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Savings Progress */}
      {vaults.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-display flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-secondary" />
              Progresso das Poupanças
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {vaults.map((vault) => {
              const pct = Math.round((vault.currentAmount / vault.targetAmount) * 100);
              return (
                <div key={vault.id} className="space-y-1.5">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-semibold">{vault.icon} {vault.name}</span>
                    <span className="text-muted-foreground">{vault.currentAmount}/{vault.targetAmount} 🪙</span>
                  </div>
                  <Progress value={pct} className="h-2.5" />
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      <Kivo page="dashboard" />
    </div>
  );
}
