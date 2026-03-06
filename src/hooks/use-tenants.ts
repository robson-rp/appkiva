import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useTenants() {
  return useQuery({
    queryKey: ['tenants'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tenants')
        .select('*, subscription_tiers(name, tier_type)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useSubscriptionTiers(showInactive = false) {
  return useQuery({
    queryKey: ['subscription_tiers', showInactive],
    queryFn: async () => {
      let query = supabase
        .from('subscription_tiers')
        .select('*')
        .order('price_monthly', { ascending: true });
      if (!showInactive) {
        query = query.eq('is_active', true);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateSubscriptionTier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (tier: {
      name: string;
      tier_type: string;
      price_monthly: number;
      price_yearly: number;
      max_children: number;
      max_classrooms: number;
      currency: string;
      is_active: boolean;
      features: string[];
    }) => {
      const { data, error } = await supabase.from('subscription_tiers').insert(tier as any).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['subscription_tiers'] }),
  });
}

export function useUpdateSubscriptionTier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; [key: string]: any }) => {
      const { data, error } = await supabase.from('subscription_tiers').update(updates as any).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['subscription_tiers'] }),
  });
}

export function useCreateTenant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (tenant: { name: string; tenant_type: string; currency: string; subscription_tier_id?: string }) => {
      const { data, error } = await supabase.from('tenants').insert(tenant as any).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tenants'] }),
  });
}

export function useUpdateTenant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; [key: string]: any }) => {
      const { data, error } = await supabase.from('tenants').update(updates as any).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tenants'] }),
  });
}

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [tenantsRes, profilesRes, walletsRes] = await Promise.all([
        supabase.from('tenants').select('id, tenant_type, is_active'),
        supabase.from('profiles').select('id, created_at'),
        supabase.from('wallets').select('id'),
      ]);
      
      const tenants = tenantsRes.data ?? [];
      const profiles = profilesRes.data ?? [];
      
      return {
        totalTenants: tenants.length,
        activeTenants: tenants.filter(t => t.is_active).length,
        tenantsByType: {
          family: tenants.filter(t => t.tenant_type === 'family').length,
          school: tenants.filter(t => t.tenant_type === 'school').length,
          institutional_partner: tenants.filter(t => t.tenant_type === 'institutional_partner').length,
        },
        totalUsers: profiles.length,
        totalWallets: walletsRes.data?.length ?? 0,
      };
    },
  });
}
