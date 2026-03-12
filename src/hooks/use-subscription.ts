import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface SubscriptionInvoice {
  id: string;
  tenant_id: string;
  tier_id: string;
  amount: number;
  currency: string;
  billing_period: string;
  status: string;
  due_date: string;
  paid_at: string | null;
  payment_method: string | null;
  payment_reference: string | null;
  created_at: string;
  tier_name: string | null;
  tier_type: string | null;
}

interface SubscriptionTier {
  id: string;
  name: string;
  tierType: string;
  priceMonthly: number;
  priceYearly: number;
  features: string[];
  maxChildren: number;
  extraChildPrice: number;
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
        extraChildPrice: Number(t.extra_child_price ?? 0),
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

      queryClient.invalidateQueries({ queryKey: ['feature-gate'] });
      queryClient.invalidateQueries({ queryKey: ['tenant-currency'] });
      queryClient.invalidateQueries({ queryKey: ['subscription-tiers'] });
      queryClient.invalidateQueries({ queryKey: ['partner-limits'] });

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

export function useInvoices() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['subscription-invoices', user?.id],
    enabled: !!user,
    staleTime: 60 * 1000,
    queryFn: async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('user_id', user!.id)
        .single();

      if (!profile?.tenant_id) return [] as SubscriptionInvoice[];

      const { data, error } = await supabase
        .from('subscription_invoices')
        .select('*, subscription_tiers(name, tier_type)')
        .eq('tenant_id', profile.tenant_id)
        .order('created_at', { ascending: false })
        .limit(12);

      if (error) throw error;
      return (data ?? []).map((inv: any) => ({
        ...inv,
        tier_name: inv.subscription_tiers?.name ?? null,
        tier_type: inv.subscription_tiers?.tier_type ?? null,
      })) as SubscriptionInvoice[];
    },
  });
}

export function useAdminInvoices() {
  return useQuery({
    queryKey: ['admin-invoices'],
    staleTime: 30 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscription_invoices')
        .select('*, subscription_tiers(name, tier_type), tenants(name)')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return (data ?? []).map((inv: any) => ({
        ...inv,
        tier_name: inv.subscription_tiers?.name ?? null,
        tier_type: inv.subscription_tiers?.tier_type ?? null,
        tenant_name: inv.tenants?.name ?? null,
      }));
    },
  });
}

export function useAddExtraChild() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const addExtraChild = async () => {
    if (!user) throw new Error('Not authenticated');
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('add-extra-child-slot', {});
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      queryClient.invalidateQueries({ queryKey: ['children'] });
      queryClient.invalidateQueries({ queryKey: ['subscription-invoices'] });
      queryClient.invalidateQueries({ queryKey: ['feature-gate'] });

      toast({
        title: 'Criança extra adicionada! 🎉',
        description: 'Podes agora adicionar mais uma criança à tua família.',
      });
      return data;
    } catch (err) {
      toast({
        title: 'Erro',
        description: err instanceof Error ? err.message : 'Erro desconhecido',
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { addExtraChild, loading };
}
