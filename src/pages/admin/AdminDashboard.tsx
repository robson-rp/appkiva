import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users, Wallet, TrendingUp, Activity, Target, ArrowRightLeft, Flame } from 'lucide-react';
import { useAdminStats } from '@/hooks/use-tenants';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export default function AdminDashboard() {
  const { data: stats, isLoading } = useAdminStats();

  const platformCards = [
    { title: 'Total Tenants', value: stats?.totalTenants ?? 0, icon: Building2, color: 'text-primary', bg: 'bg-[hsl(var(--kivara-light-blue))]' },
    { title: 'Tenants Activos', value: stats?.activeTenants ?? 0, icon: TrendingUp, color: 'text-secondary', bg: 'bg-[hsl(var(--kivara-light-green))]' },
    { title: 'Total Utilizadores', value: stats?.totalUsers ?? 0, icon: Users, color: 'text-accent-foreground', bg: 'bg-[hsl(var(--kivara-light-gold))]' },
    { title: 'Total Wallets', value: stats?.totalWallets ?? 0, icon: Wallet, color: 'text-primary', bg: 'bg-[hsl(var(--kivara-purple))]' },
  ];

  const observabilityCards = [
    { title: 'DAU (Hoje)', value: stats?.dau ?? 0, icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/10', subtitle: 'Utilizadores activos hoje' },
    { title: 'Conclusão de Tarefas', value: `${stats?.missionCompletionRate ?? 0}%`, icon: Target, color: 'text-secondary', bg: 'bg-[hsl(var(--kivara-light-green))]', subtitle: `${stats?.completedTasks ?? 0} de ${stats?.totalTasks ?? 0}` },
    { title: 'Transacções Hoje', value: stats?.dailyTxCount ?? 0, icon: ArrowRightLeft, color: 'text-primary', bg: 'bg-[hsl(var(--kivara-light-blue))]', subtitle: `${(stats?.dailyTxVolume ?? 0).toLocaleString()} KVC` },
    { title: 'Actividade', value: stats?.weeklySparkline?.reduce((s, d) => s + d.count, 0) ?? 0, icon: Activity, color: 'text-accent-foreground', bg: 'bg-[hsl(var(--kivara-light-gold))]', subtitle: 'Transacções (7 dias)' },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-heading md:text-heading-lg font-display font-bold text-foreground">Painel de Administração</h1>
        <p className="text-base text-muted-foreground mt-1">Visão global da plataforma KIVARA</p>
      </div>

      {/* Platform stats */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4" data-onboarding="tenants">
        {platformCards.map((c) => (
          <motion.div key={c.title} variants={item}>
            <Card className="border-border/50 overflow-hidden">
              <div className="h-0.5 gradient-kivara" />
              <CardContent className="p-5">
                <div className={`w-11 h-11 rounded-2xl ${c.bg} flex items-center justify-center mb-3`}>
                  <c.icon className={`h-5 w-5 ${c.color}`} />
                </div>
                <div className="text-2xl font-display font-bold">{isLoading ? '—' : c.value}</div>
                <p className="text-small text-muted-foreground mt-1">{c.title}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Observability metrics */}
      <div>
        <h2 className="text-section md:text-section-lg font-display font-bold text-foreground mb-4">Observabilidade</h2>
        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {observabilityCards.map((c) => (
            <motion.div key={c.title} variants={item}>
              <Card className="border-border/50 overflow-hidden">
                <div className="h-0.5 bg-gradient-to-r from-primary to-secondary" />
                <CardContent className="p-5">
                  <div className={`w-11 h-11 rounded-2xl ${c.bg} flex items-center justify-center mb-3`}>
                    <c.icon className={`h-5 w-5 ${c.color}`} />
                  </div>
                  <div className="text-2xl font-display font-bold">{isLoading ? '—' : c.value}</div>
                  <p className="text-small text-muted-foreground mt-1">{c.subtitle}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Weekly transaction chart */}
      {stats?.weeklySparkline && (
        <motion.div variants={item} initial="hidden" animate="show">
          <Card className="border-border/50 overflow-hidden">
            <div className="h-0.5 gradient-kivara" />
            <CardHeader>
              <CardTitle className="text-section font-display">Volume de Transacções — Últimos 7 Dias</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.weeklySparkline} barSize={32}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                    <XAxis dataKey="day" tick={{ fontSize: 13 }} className="text-muted-foreground" />
                    <YAxis tick={{ fontSize: 13 }} className="text-muted-foreground" />
                    <Tooltip
                      contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))', fontSize: '14px' }}
                      formatter={(value: number, name: string) => [
                        name === 'volume' ? `${value.toLocaleString()} KVC` : value,
                        name === 'volume' ? 'Volume' : 'Transacções',
                      ]}
                    />
                    <Bar dataKey="volume" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} name="volume" />
                    <Bar dataKey="count" fill="hsl(var(--secondary))" radius={[6, 6, 0, 0]} name="count" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Tenant distribution */}
      {stats && (
        <motion.div variants={item} initial="hidden" animate="show" data-onboarding="subscriptions">
          <Card className="border-border/50 overflow-hidden">
            <div className="h-0.5 bg-gradient-to-r from-secondary to-accent" />
            <CardHeader>
              <CardTitle className="text-section font-display">Distribuição por Tipo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Famílias', value: stats.tenantsByType.family, emoji: '👨‍👩‍👧‍👦' },
                  { label: 'Escolas', value: stats.tenantsByType.school, emoji: '🏫' },
                  { label: 'Parceiros', value: stats.tenantsByType.institutional_partner, emoji: '🏢' },
                ].map((t) => (
                  <div key={t.label} className="text-center p-5 rounded-2xl bg-muted/50">
                    <div className="text-3xl mb-2">{t.emoji}</div>
                    <div className="text-2xl font-display font-bold">{t.value}</div>
                    <div className="text-small text-muted-foreground mt-1">{t.label}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
