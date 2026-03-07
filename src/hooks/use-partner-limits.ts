import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface PartnerLimits {
  tierName: string;
  tierId: string | null;
  maxPrograms: number;
  maxChildren: number;
  usedPrograms: number;
  usedChildren: number;
  canCreateProgram: boolean;
  canAddChildren: (count: number) => boolean;
  loading: boolean;
  priceMonthly: number;
}

export function usePartnerLimits(): PartnerLimits {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['partner-limits', user?.id],
    queryFn: async () => {
      // Get profile -> tenant -> subscription_tier
      const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('user_id', user!.id)
        .single();

      if (!profile?.tenant_id) return null;

      const { data: tenant } = await supabase
        .from('tenants')
        .select('subscription_tier_id')
        .eq('id', profile.tenant_id)
        .single();

      let tier: any = null;
      if (tenant?.subscription_tier_id) {
        const { data: t } = await supabase
          .from('subscription_tiers')
          .select('*')
          .eq('id', tenant.subscription_tier_id)
          .single();
        tier = t;
      }

      // Get usage
      const { data: programs } = await supabase
        .from('partner_programs')
        .select('children_count, status')
        .eq('partner_tenant_id', profile.tenant_id);

      const activePrograms = (programs ?? []).filter(p => p.status === 'active');
      const totalChildren = (programs ?? []).reduce((sum, p) => sum + p.children_count, 0);

      return {
        tier,
        usedPrograms: activePrograms.length,
        usedChildren: totalChildren,
      };
    },
    enabled: !!user && user.role === 'partner',
  });

  const tier = data?.tier;
  const maxPrograms = tier?.max_programs ?? 2;
  const maxChildren = tier?.max_children ?? 50;
  const usedPrograms = data?.usedPrograms ?? 0;
  const usedChildren = data?.usedChildren ?? 0;

  return {
    tierName: tier?.name ?? 'Parceiro Starter',
    tierId: tier?.id ?? null,
    maxPrograms,
    maxChildren,
    usedPrograms,
    usedChildren,
    canCreateProgram: usedPrograms < maxPrograms,
    canAddChildren: (count: number) => usedChildren + count <= maxChildren,
    loading: isLoading,
    priceMonthly: tier?.price_monthly ? Number(tier.price_monthly) : 0,
  };
}
