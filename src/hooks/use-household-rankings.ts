import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface HouseholdMemberRanking {
  profileId: string;
  name: string;
  avatar: string;
  balance: number;
  totalSaved: number;
  totalDonated: number;
}

export function useHouseholdRankings() {
  const { user } = useAuth();
  const householdId = user?.householdId;

  return useQuery({
    queryKey: ['household-rankings', householdId],
    queryFn: async () => {
      if (!householdId) return [];

      // Get all profiles in household
      const { data: profiles, error: pErr } = await supabase
        .from('profiles')
        .select('id, display_name, avatar, user_id')
        .eq('household_id', householdId);
      if (pErr) throw pErr;
      if (!profiles || profiles.length === 0) return [];

      // Filter out parents — keep only child/teen roles
      const userIds = profiles.map(p => p.user_id);
      const { data: roles } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', userIds);

      const childUserIds = new Set(
        (roles ?? []).filter(r => r.role === 'child' || r.role === 'teen').map(r => r.user_id)
      );
      const childProfiles = profiles.filter(p => childUserIds.has(p.user_id));
      if (childProfiles.length === 0) return [];

      const profileIds = childProfiles.map(p => p.id);

      // Get wallet balances
      const { data: wallets } = await supabase
        .from('wallet_balances')
        .select('profile_id, balance')
        .in('profile_id', profileIds)
        .eq('wallet_type', 'virtual')
        .eq('currency', 'KVC');

      // Get dream vault savings
      const { data: vaults } = await supabase
        .from('dream_vaults')
        .select('profile_id, current_amount')
        .in('profile_id', profileIds);

      // Get donations
      const { data: donations } = await supabase
        .from('donations')
        .select('profile_id, amount')
        .in('profile_id', profileIds);

      const rankings: HouseholdMemberRanking[] = childProfiles.map(p => ({
        profileId: p.id,
        name: p.display_name,
        avatar: p.avatar ?? '👤',
        balance: Number(wallets?.find(w => w.profile_id === p.id)?.balance ?? 0),
        totalSaved: (vaults ?? []).filter(v => v.profile_id === p.id).reduce((s, v) => s + Number(v.current_amount), 0),
        totalDonated: (donations ?? []).filter(d => d.profile_id === p.id).reduce((s, d) => s + Number(d.amount), 0),
      }));

      return rankings;
    },
    enabled: !!householdId,
  });
}
