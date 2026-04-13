import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
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

interface ApiSubscriptionResponse {
  tier: {
    name: string;
    features: string[];
  };
  status: string;
}

/**
 * Shared hook that fetches features from the current subscription.
 */
function useFeatureQuery() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['feature-gate', user?.id],
    enabled: !!user,
    staleTime: 30000,
    refetchInterval: 60000,
    queryFn: async () => {
      const response = await api.get<ApiSubscriptionResponse>('/subscription');

      if (!response?.tier) {
        return { features: [] as string[], tierName: 'Free' };
      }

      return {
        features: Array.isArray(response.tier.features) ? response.tier.features : [],
        tierName: response.tier.name,
      };
    },
  });

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
