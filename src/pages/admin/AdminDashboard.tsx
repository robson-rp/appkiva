import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users, Wallet, TrendingUp } from 'lucide-react';
import { useAdminStats } from '@/hooks/use-tenants';
import { motion } from 'framer-motion';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function AdminDashboard() {
  const { data: stats, isLoading } = useAdminStats();

  const cards = [
    { title: 'Total Tenants', value: stats?.totalTenants ?? 0, icon: Building2, color: 'text-primary' },
    { title: 'Tenants Activos', value: stats?.activeTenants ?? 0, icon: TrendingUp, color: 'text-secondary' },
    { title: 'Total Utilizadores', value: stats?.totalUsers ?? 0, icon: Users, color: 'text-accent' },
    { title: 'Total Wallets', value: stats?.totalWallets ?? 0, icon: Wallet, color: 'text-primary' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Painel de Administração</h1>
        <p className="text-sm text-muted-foreground">Visão global da plataforma KIVARA</p>
      </div>

      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" data-onboarding="tenants">
        {cards.map((c) => (
          <motion.div key={c.title} variants={item}>
            <Card className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{c.title}</CardTitle>
                <c.icon className={`h-4 w-4 ${c.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-display font-bold">{isLoading ? '—' : c.value}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {stats && (
        <motion.div variants={item} initial="hidden" animate="show">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base font-display">Distribuição por Tipo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Famílias', value: stats.tenantsByType.family, emoji: '👨‍👩‍👧‍👦' },
                  { label: 'Escolas', value: stats.tenantsByType.school, emoji: '🏫' },
                  { label: 'Parceiros', value: stats.tenantsByType.institutional_partner, emoji: '🏢' },
                ].map((t) => (
                  <div key={t.label} className="text-center p-4 rounded-xl bg-muted/50">
                    <div className="text-2xl mb-1">{t.emoji}</div>
                    <div className="text-xl font-display font-bold">{t.value}</div>
                    <div className="text-xs text-muted-foreground">{t.label}</div>
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
