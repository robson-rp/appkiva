import { useQuery } from '@tanstack/react-query';
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
 * Hook to check if a specific feature is enabled for the current user's tenant subscription.
 *
 * Usage:
 * ```tsx
 * const { allowed, tierName } = useFeatureGate('advanced_analytics');
 * if (!allowed) return <UpgradePrompt tier={tierName} />;
 * ```
 */
export function useFeatureGate(feature: FeatureKey): FeatureGateResult {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['feature-gate', user?.id],
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // cache for 5 min
    queryFn: async () => {
      // 1. Get the user's profile to find tenant_id
      const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('user_id', user!.id)
        .single();

      if (!profile?.tenant_id) {
        // No tenant — default to free tier (basic features only)
        return { features: [] as string[], tierName: 'Free' };
      }

      // 2. Get tenant with its subscription tier
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
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['feature-gate', user?.id],
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('user_id', user!.id)
        .single();

      if (!profile?.tenant_id) {
        return { features: [] as string[], tierName: 'Free' };
      }

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

  const hasFeature = (feature: FeatureKey) => data?.features.includes(feature) ?? false;

  return {
    hasFeature,
    enabledFeatures: data?.features ?? [],
    tierName: data?.tierName ?? null,
    loading: isLoading,
  };
}
