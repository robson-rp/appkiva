import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
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

interface ApiSubscriptionTier {
  id: string;
  name: string;
  tier_type: string;
  price_monthly: number;
  price_yearly: number;
  features: string[];
  max_children: number;
  extra_child_price: number;
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
      const data = await api.get<any>('/subscription/tiers');
      const items = Array.isArray(data) ? data : (data?.data ?? []);

      return items.map((t: any) => ({
        id: t.id,
        name: t.name,
        tierType: t.tier_type,
        priceMonthly: Number(t.price_monthly),
        priceYearly: Number(t.price_yearly),
        features: Array.isArray(t.features) ? t.features : [],
        maxChildren: t.max_children,
        extraChildPrice: Number(t.extra_child_price ?? 0),
      })) as SubscriptionTier[];
    },
  });
}

export function useCurrentSubscription() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['current-subscription', user?.id],
    enabled: !!user,
    staleTime: 60 * 1000,
    queryFn: async () => {
      return await api.get<{
        tier: ApiSubscriptionTier & { features: string[] };
        status: string;
      }>('/subscription');
    },
  });
}

export function useUpgradeSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tierId: string) => {
      const data = await api.post<{ tier: { name: string } }>('/subscription/subscribe', {
        tier_id: tierId,
      });
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['feature-gate'] });
      queryClient.invalidateQueries({ queryKey: ['current-subscription'] });
      queryClient.invalidateQueries({ queryKey: ['tenant-currency'] });
      queryClient.invalidateQueries({ queryKey: ['subscription-tiers'] });
      queryClient.invalidateQueries({ queryKey: ['partner-limits'] });

      toast({
        title: 'Upgrade concluído! 🎉',
        description: `O teu plano foi atualizado para ${data.tier?.name}.`,
      });
    },
    onError: (err) => {
      toast({
        title: 'Erro no upgrade',
        description: err instanceof Error ? err.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    },
  });
}

export function useCancelSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await api.post('/subscription/cancel');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feature-gate'] });
      queryClient.invalidateQueries({ queryKey: ['current-subscription'] });
      queryClient.invalidateQueries({ queryKey: ['subscription-invoices'] });

      toast({
        title: 'Subscrição cancelada',
        description: 'A tua subscrição foi cancelada com sucesso.',
      });
    },
    onError: (err) => {
      toast({
        title: 'Erro ao cancelar',
        description: err instanceof Error ? err.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    },
  });
}

export function useInvoices() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['subscription-invoices', user?.id],
    enabled: !!user,
    staleTime: 60 * 1000,
    queryFn: async () => {
      const data = await api.get<{ data: SubscriptionInvoice[] }>('/subscription/invoices');
      return data.data ?? [];
    },
  });
}

export function useAdminInvoices() {
  return useQuery({
    queryKey: ['admin-invoices'],
    staleTime: 30 * 1000,
    queryFn: async () => {
      const data = await api.get<{ data: SubscriptionInvoice[] }>('/admin/invoices');
      return data.data ?? [];
    },
  });
}

export function useAddExtraChild() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const data = await api.post<{ message: string }>('/subscription/add-extra-child');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['children'] });
      queryClient.invalidateQueries({ queryKey: ['subscription-invoices'] });
      queryClient.invalidateQueries({ queryKey: ['feature-gate'] });
      queryClient.invalidateQueries({ queryKey: ['current-subscription'] });

      toast({
        title: 'Criança extra adicionada! 🎉',
        description: 'Podes agora adicionar mais uma criança à tua família.',
      });
    },
    onError: (err) => {
      toast({
        title: 'Erro',
        description: err instanceof Error ? err.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    },
  });
}
