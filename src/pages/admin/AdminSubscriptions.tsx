import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Check } from 'lucide-react';
import { useSubscriptionTiers } from '@/hooks/use-tenants';
import { motion } from 'framer-motion';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function AdminSubscriptions() {
  const { data: tiers, isLoading } = useSubscriptionTiers();

  const tierLabels: Record<string, string> = {
    free: 'Gratuito',
    family_premium: 'Família Premium',
    school_institutional: 'Escolar',
    partner_program: 'Parceiro',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Planos de Subscrição</h1>
        <p className="text-sm text-muted-foreground">Configuração dos tiers de subscrição da plataforma</p>
      </div>

      {isLoading ? (
        <p className="text-center text-muted-foreground py-8">A carregar...</p>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {tiers?.map((tier: any) => (
            <motion.div key={tier.id} variants={item}>
              <Card className="border-border/50 h-full flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-display">{tier.name}</CardTitle>
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Badge variant="secondary" className="w-fit">{tierLabels[tier.tier_type] ?? tier.tier_type}</Badge>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  <div>
                    <span className="text-3xl font-display font-bold">${tier.price_monthly}</span>
                    <span className="text-sm text-muted-foreground">/mês</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    ou ${tier.price_yearly}/ano
                  </div>
                  <div className="space-y-1 text-sm">
                    <p className="text-muted-foreground">Até {tier.max_children} crianças</p>
                    {tier.max_classrooms > 0 && (
                      <p className="text-muted-foreground">Até {tier.max_classrooms} turmas</p>
                    )}
                  </div>
                  <div className="pt-2 space-y-1">
                    {(tier.features as string[])?.map((f: string) => (
                      <div key={f} className="flex items-center gap-2 text-xs">
                        <Check className="h-3 w-3 text-secondary" />
                        <span className="text-muted-foreground">{f.replace(/_/g, ' ')}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
