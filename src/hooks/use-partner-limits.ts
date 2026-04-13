import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
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

interface PartnerLimitsResponse {
  tier: {
    id: string;
    name: string;
    max_programs: number;
    max_children: number;
    price_monthly: number;
  } | null;
  usedPrograms: number;
  usedChildren: number;
}

export function usePartnerLimits(): PartnerLimits {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['partner-limits', user?.id],
    queryFn: async () => {
      const response = await api.get<PartnerLimitsResponse>('/partner-limits');
      return response;
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
