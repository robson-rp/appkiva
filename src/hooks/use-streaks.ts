import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { StreakData, STREAK_MILESTONES } from '@/types/kivara';
import { mockStreakData } from '@/data/streaks-data';

async function getProfileId(userId: string): Promise<string | null> {
  const { data } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();
  return data?.id ?? null;
}

export function useStreakData() {
  const { user } = useAuth();

  return useQuery<StreakData>({
    queryKey: ['streak-data', user?.id],
    queryFn: async () => {
      if (!user?.id) return mockStreakData;

      const profileId = await getProfileId(user.id);
      if (!profileId) return mockStreakData;

      // Fetch streak summary
      const { data: streak } = await supabase
        .from('streaks')
        .select('*')
        .eq('profile_id', profileId)
        .maybeSingle();

      // Fetch active dates
      const { data: activities } = await supabase
        .from('streak_activities')
        .select('active_date')
        .eq('profile_id', profileId)
        .order('active_date', { ascending: false })
        .limit(365);

      // Fetch claimed rewards
      const { data: claims } = await supabase
        .from('streak_reward_claims')
        .select('milestone_days')
        .eq('profile_id', profileId);

      const claimedSet = new Set((claims ?? []).map(c => c.milestone_days));
      const activeDates = (activities ?? []).map(a => a.active_date);

      const currentStreak = streak?.current_streak ?? 0;
      const longestStreak = streak?.longest_streak ?? 0;
      const totalActiveDays = streak?.total_active_days ?? 0;
      const lastActiveDate = streak?.last_active_date ?? '';

      return {
        currentStreak,
        longestStreak,
        totalActiveDays,
        lastActiveDate,
        activeDates,
        streakRewards: STREAK_MILESTONES.map(m => ({
          ...m,
          claimed: claimedSet.has(m.days),
        })),
      };
    },
    enabled: true,
    staleTime: 60_000,
  });
}

export function useRecordActivity() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('Not authenticated');
      const profileId = await getProfileId(user.id);
      if (!profileId) throw new Error('No profile');

      const { data, error } = await supabase.rpc('record_daily_activity', {
        _profile_id: profileId,
      });
      if (error) throw error;
      return data as { recorded: boolean; current_streak: number; longest_streak: number; total_active_days: number };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['streak-data'] });
    },
  });
}

export function useClaimStreakReward() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ milestoneDays, kivaPoints }: { milestoneDays: number; kivaPoints: number }) => {
      if (!user?.id) throw new Error('Not authenticated');
      const profileId = await getProfileId(user.id);
      if (!profileId) throw new Error('No profile');

      const { error } = await supabase
        .from('streak_reward_claims')
        .insert({
          profile_id: profileId,
          milestone_days: milestoneDays,
          kiva_points: kivaPoints,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['streak-data'] });
    },
  });
}
