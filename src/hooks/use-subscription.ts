import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface SubscriptionTier {
  id: string;
  name: string;
  tierType: string;
  priceMonthly: number;
  priceYearly: number;
  features: string[];
  maxChildren: number;
}

export function useSubscriptionTiers() {
  return useQuery({
    queryKey: ['subscription-tiers'],
    staleTime: 10 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscription_tiers')
        .select('*')
        .eq('is_active', true)
        .order('price_monthly', { ascending: true });

      if (error) throw error;

      return (data ?? []).map((t) => ({
        id: t.id,
        name: t.name,
        tierType: t.tier_type,
        priceMonthly: Number(t.price_monthly),
        priceYearly: Number(t.price_yearly),
        features: Array.isArray(t.features) ? (t.features as string[]) : [],
        maxChildren: t.max_children,
      })) as SubscriptionTier[];
    },
  });
}

export function useUpgradeSubscription() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const upgrade = async (tierId: string) => {
    if (!user) throw new Error('Not authenticated');
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('upgrade-subscription', {
        body: { tier_id: tierId },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      // Invalidate feature gate and currency caches
      queryClient.invalidateQueries({ queryKey: ['feature-gate'] });
      queryClient.invalidateQueries({ queryKey: ['tenant-currency'] });
      queryClient.invalidateQueries({ queryKey: ['subscription-tiers'] });

      toast({
        title: 'Upgrade concluído! 🎉',
        description: `O teu plano foi atualizado para ${data.tier?.name}.`,
      });

      return data;
    } catch (err) {
      toast({
        title: 'Erro no upgrade',
        description: err instanceof Error ? err.message : 'Erro desconhecido',
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { upgrade, loading };
}
