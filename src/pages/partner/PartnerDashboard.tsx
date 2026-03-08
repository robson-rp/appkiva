import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, School, TrendingUp, Trophy, ArrowUpRight, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePartnerPrograms, useSponsoredChallenges } from '@/hooks/use-partner-data';
import { motion } from 'framer-motion';
import { useT } from '@/contexts/LanguageContext';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

export default function PartnerDashboard() {
  const { user } = useAuth();
  const t = useT();
  const { data: programs, isLoading: loadingPrograms } = usePartnerPrograms();
  const { data: challenges, isLoading: loadingChallenges } = useSponsoredChallenges();

  const isLoading = loadingPrograms || loadingChallenges;

  const totalFamilies = programs?.filter(p => p.program_type === 'family' && p.status === 'active').length ?? 0;
  const totalSchools = programs?.filter(p => p.program_type === 'school' && p.status === 'active').length ?? 0;
  const totalChildren = programs?.reduce((sum, p) => sum + p.children_count, 0) ?? 0;
  const activeChallenges = challenges?.filter(c => c.status === 'active').length ?? 0;
  const totalInvestment = programs?.reduce((sum, p) => sum + Number(p.investment_amount), 0) ?? 0;
  const avgCompletion = challenges?.length
    ? Math.round(challenges.filter(c => c.status !== 'draft').reduce((sum, c) => sum + Number(c.completion_rate), 0) / challenges.filter(c => c.status !== 'draft').length)
    : 0;

  const kpis = [
    { label: t('partner.dashboard.families'), value: totalFamilies, icon: Users, color: 'text-primary', bg: 'bg-[hsl(var(--kivara-light-blue))]' },
    { label: t('partner.dashboard.schools'), value: totalSchools, icon: School, color: 'text-chart-3', bg: 'bg-[hsl(var(--kivara-light-green))]' },
    { label: t('partner.dashboard.children'), value: totalChildren, icon: Users, color: 'text-secondary', bg: 'bg-[hsl(var(--kivara-light-gold))]' },
    { label: t('partner.dashboard.active_challenges'), value: activeChallenges, icon: Trophy, color: 'text-accent-foreground', bg: 'bg-[hsl(var(--kivara-pink))]' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-5xl mx-auto">
      <motion.div variants={item}>
        <Card className="border-0 overflow-hidden relative shadow-kivara">
          <div className="absolute inset-0 gradient-kivara" />
          <div className="absolute top-[-30%] right-[-10%] w-[45%] h-[80%] rounded-full bg-white/5 blur-3xl" />
          <CardContent className="relative z-10 p-6 md:p-8">
            <div className="space-y-2">
              <p className="text-primary-foreground/60 text-small font-medium uppercase tracking-wider">{t('partner.dashboard.institutional')}</p>
              <h1 className="font-display text-heading md:text-heading-lg font-bold text-primary-foreground">
                {t('partner.dashboard.hello')} {user?.name ?? t('nav.partner.role')} 🏢
              </h1>
              <p className="text-primary-foreground/60 text-base max-w-md">{t('partner.dashboard.subtitle')}</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4" data-onboarding="programs">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="border-border/50 overflow-hidden">
            <div className="h-0.5 gradient-kivara" />
            <CardContent className="p-5">
              <div className={`w-11 h-11 rounded-2xl ${kpi.bg} flex items-center justify-center mb-3`}>
                <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
              </div>
              <p className="font-display text-2xl font-bold text-foreground">{kpi.value}</p>
              <p className="text-small text-muted-foreground mt-1">{kpi.label}</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" data-onboarding="challenges">
        <motion.div variants={item}>
          <Card className="border-border/50 overflow-hidden h-full">
            <div className="h-0.5 bg-gradient-to-r from-primary to-secondary" />
            <CardHeader>
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                {t('partner.dashboard.total_budget')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="font-display text-4xl font-bold text-foreground">{totalInvestment.toLocaleString()} KVC</p>
                <p className="text-base text-muted-foreground mt-2">{t('partner.dashboard.budget_accumulated')}</p>
                <div className="flex justify-center gap-8 mt-6">
                  <div>
                    <p className="font-bold text-xl text-foreground">{programs?.length ?? 0}</p>
                    <p className="text-small text-muted-foreground">{t('partner.dashboard.programs')}</p>
                  </div>
                  <div>
                    <p className="font-bold text-xl text-foreground">{avgCompletion}%</p>
                    <p className="text-small text-muted-foreground">{t('partner.dashboard.completion_rate')}</p>
                  </div>
                  <div>
                    <p className="font-bold text-xl text-foreground">{challenges?.length ?? 0}</p>
                    <p className="text-small text-muted-foreground">{t('partner.dashboard.total_challenges')}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-border/50 overflow-hidden h-full">
            <div className="h-0.5 bg-gradient-to-r from-secondary to-accent" />
            <CardHeader>
              <CardTitle className="font-display text-lg">{t('partner.dashboard.recent_programs')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {programs?.slice(0, 4).map((prog) => (
                  <div key={prog.id} className="flex items-start gap-3 p-3 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-colors min-h-[56px]">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary mt-2 shrink-0" />
                    <div>
                      <p className="text-base font-display font-semibold text-foreground">{prog.program_name}</p>
                      <p className="text-small text-muted-foreground">
                        {prog.children_count} {t('partner.programs.children')} • {prog.program_type === 'school' ? t('partner.programs.schools') : t('partner.programs.families')}
                      </p>
                    </div>
                  </div>
                ))}
                {(!programs || programs.length === 0) && (
                  <p className="text-base text-muted-foreground text-center py-4">{t('partner.dashboard.no_programs')}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
