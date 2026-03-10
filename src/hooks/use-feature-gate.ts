import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Feature keys that can be gated by subscription tier.
 * Add new features here as the platform grows.
 */
export const FEATURES = {
  REAL_MONEY_WALLET: 'real_money_wallet',
  SAVINGS_VAULTS: 'savings_vaults',
  DREAM_VAULTS: 'dream_vaults',
  ADVANCED_ANALYTICS: 'advanced_analytics',
  CUSTOM_REWARDS: 'custom_rewards',
  BUDGET_EXCEPTIONS: 'budget_exceptions',
  CLASSROOM_MODE: 'classroom_mode',
  MULTI_CHILD: 'multi_child',
  EXPORT_REPORTS: 'export_reports',
  PRIORITY_SUPPORT: 'priority_support',
} as const;

export type FeatureKey = (typeof FEATURES)[keyof typeof FEATURES];

interface FeatureGateResult {
  /** Whether the feature is allowed for the current tenant's subscription */
  allowed: boolean;
  /** All enabled features for the tenant */
  enabledFeatures: string[];
  /** The subscription tier name (e.g. "Free", "Family Premium") */
  tierName: string | null;
  /** Loading state */
  loading: boolean;
}

/**
 * Shared hook that fetches features + subscribes to realtime tenant changes.
 */
function useFeatureQuery() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [tenantId, setTenantId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['feature-gate', user?.id],
    enabled: !!user,
    staleTime: 30 * 1000, // 30 seconds
    queryFn: async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('user_id', user!.id)
        .single();

      if (!profile?.tenant_id) {
        setTenantId(null);
        return { features: [] as string[], tierName: 'Free' };
      }

      setTenantId(profile.tenant_id);

      const { data: tenant } = await supabase
        .from('tenants')
        .select('subscription_tier_id, subscription_tiers(name, features)')
        .eq('id', profile.tenant_id)
        .single();

      if (!tenant?.subscription_tiers) {
        return { features: [] as string[], tierName: 'Free' };
      }

      const tier = tenant.subscription_tiers as unknown as { name: string; features: string[] };

      return {
        features: Array.isArray(tier.features) ? tier.features : [],
        tierName: tier.name,
      };
    },
  });

  // Realtime: invalidate cache when tenant's subscription changes
  useEffect(() => {
    if (!tenantId) return;
    const channel = supabase
      .channel(`tenant-sub-${tenantId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'tenants',
        filter: `id=eq.${tenantId}`,
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['feature-gate'] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [tenantId, queryClient]);

  return { data, isLoading };
}

/**
 * Hook to check if a specific feature is enabled for the current user's tenant subscription.
 */
export function useFeatureGate(feature: FeatureKey): FeatureGateResult {
  const { data, isLoading } = useFeatureQuery();

  return {
    allowed: data?.features.includes(feature) ?? false,
    enabledFeatures: data?.features ?? [],
    tierName: data?.tierName ?? null,
    loading: isLoading,
  };
}

/**
 * Hook to get all enabled features at once (avoids multiple queries).
 */
export function useAllFeatures() {
  const { data, isLoading } = useFeatureQuery();

  const hasFeature = (feature: FeatureKey) => data?.features.includes(feature) ?? false;

  return {
    hasFeature,
    enabledFeatures: data?.features ?? [],
    tierName: data?.tierName ?? null,
    loading: isLoading,
  };
}
