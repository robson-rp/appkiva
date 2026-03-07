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
        .select('*, tenants(id)')
        .order('price_monthly', { ascending: true });
      if (!showInactive) {
        query = query.eq('is_active', true);
      }
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []).map((t: any) => ({
        ...t,
        tenant_count: Array.isArray(t.tenants) ? t.tenants.length : 0,
        tenants: undefined,
      }));
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

export function useDeleteSubscriptionTier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('subscription_tiers').delete().eq('id', id);
      if (error) throw error;
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
      const today = new Date().toISOString().slice(0, 10);
      const todayStart = `${today}T00:00:00.000Z`;
      const todayEnd = `${today}T23:59:59.999Z`;

      const [tenantsRes, profilesRes, walletsRes, dauRes, tasksAllRes, tasksCompletedRes, txTodayRes, txWeekRes] = await Promise.all([
        supabase.from('tenants').select('id, tenant_type, is_active'),
        supabase.from('profiles').select('id, created_at'),
        supabase.from('wallets').select('id'),
        // DAU: unique profiles active today
        supabase.from('streak_activities').select('profile_id', { count: 'exact', head: false }).eq('active_date', today),
        // All tasks
        supabase.from('tasks').select('id', { count: 'exact', head: true }),
        // Completed/approved tasks
        supabase.from('tasks').select('id', { count: 'exact', head: true }).in('status', ['completed', 'approved']),
        // Today's transactions
        supabase.from('ledger_entries').select('id, amount', { count: 'exact', head: false }).gte('created_at', todayStart).lte('created_at', todayEnd),
        // Last 7 days transactions for sparkline
        supabase.from('ledger_entries').select('created_at, amount').gte('created_at', new Date(Date.now() - 7 * 86400000).toISOString()).order('created_at', { ascending: true }),
      ]);
      
      const tenants = tenantsRes.data ?? [];
      const profiles = profilesRes.data ?? [];
      const dauProfiles = dauRes.data ?? [];
      const uniqueDau = new Set(dauProfiles.map((d: any) => d.profile_id)).size;
      const totalTasks = tasksAllRes.count ?? 0;
      const completedTasks = tasksCompletedRes.count ?? 0;
      const missionCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      const txToday = txTodayRes.data ?? [];
      const dailyTxVolume = txToday.reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0);
      const dailyTxCount = txToday.length;

      // Build 7-day sparkline data
      const weekData = txWeekRes.data ?? [];
      const sparkline: { day: string; volume: number; count: number }[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(Date.now() - i * 86400000);
        const dateStr = d.toISOString().slice(0, 10);
        const dayTx = weekData.filter((t: any) => t.created_at?.startsWith(dateStr));
        sparkline.push({
          day: d.toLocaleDateString('pt', { weekday: 'short' }),
          volume: dayTx.reduce((s: number, t: any) => s + Number(t.amount || 0), 0),
          count: dayTx.length,
        });
      }
      
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
        dau: uniqueDau,
        missionCompletionRate,
        totalTasks,
        completedTasks,
        dailyTxVolume,
        dailyTxCount,
        weeklySparkline: sparkline,
      };
    },
  });
}
