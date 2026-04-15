import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

interface Tenant {
  id: string;
  name: string;
  tenant_type: string;
  currency: string;
  subscription_tier_id?: string;
  is_active: boolean;
  created_at: string;
  subscription_tier?: {
    name: string;
    tier_type: string;
  };
}

interface SubscriptionTier {
  id: string;
  name: string;
  tier_type: string;
  price_monthly: number;
  price_yearly: number;
  max_children: number;
  max_classrooms: number;
  max_programs?: number;
  extra_child_price?: number;
  currency: string;
  is_active: boolean;
  features: string[];
  tenant_count?: number;
}

export function useTenants() {
  return useQuery({
    queryKey: ['tenants'],
    queryFn: async () => {
      const res = await api.get<{ data: Tenant[] } | Tenant[]>('/admin/tenants');
      return Array.isArray(res) ? res : (res as any).data ?? [];
    },
  });
}

export function useSubscriptionTiers(showInactive = false) {
  return useQuery({
    queryKey: ['subscription_tiers', showInactive],
    queryFn: async () => {
      const data = await api.get<SubscriptionTier[]>(`/admin/subscription-tiers?show_inactive=${showInactive}`);
      return Array.isArray(data) ? data : (data as any).data ?? [];
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
      extra_child_price?: number;
      currency: string;
      is_active: boolean;
      features: string[];
    }) => {
      const data = await api.post<SubscriptionTier>('/admin/subscription-tiers', tier);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['subscription_tiers'] }),
  });
}

export function useUpdateSubscriptionTier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; [key: string]: any }) => {
      const data = await api.patch<SubscriptionTier>(`/admin/subscription-tiers/${id}`, updates);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['subscription_tiers'] }),
  });
}

export function useDeleteSubscriptionTier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/subscription-tiers/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['subscription_tiers'] }),
  });
}

export function useCreateTenant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (tenant: { name: string; tenant_type: string; currency: string; subscription_tier_id?: string }) => {
      const data = await api.post<Tenant>('/admin/tenants', tenant);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tenants'] }),
  });
}

export function useUpdateTenant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; [key: string]: any }) => {
      const data = await api.patch<Tenant>(`/admin/tenants/${id}`, updates);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tenants'] }),
  });
}

export function useActivateTenant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.post(`/admin/tenants/${id}/activate`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tenants'] }),
  });
}

export function useDeactivateTenant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.post(`/admin/tenants/${id}/deactivate`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tenants'] }),
  });
}

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const response = await api.get<{ data: {
        totalTenants: number;
        activeTenants: number;
        tenantsByType: {
          family: number;
          school: number;
          institutional_partner: number;
        };
        totalUsers: number;
        totalChildren: number;
        totalWallets: number;
        dau: number;
        missionCompletionRate: number;
        totalTasks: number;
        completedTasks: number;
        dailyTxVolume: number;
        dailyTxCount: number;
        weeklySparkline: Array<{ day: string; volume: number; count: number }>;
      }}>('/admin/stats');
      return response.data;
    },
  });
}
