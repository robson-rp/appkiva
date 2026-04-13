import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';
import { StreakData, STREAK_MILESTONES } from '@/types/kivara';
import { mockStreakData } from '@/data/streaks-data';

interface StreakResponse {
  data: {
    current_streak: number;
    longest_streak: number;
    total_active_days: number;
    last_active_date: string;
    active_dates: string[];
    claimed_milestones: number[];
  };
}

interface ActivityResponse {
  data: {
    recorded: boolean;
    current_streak: number;
    longest_streak: number;
    total_active_days: number;
  };
}

export function useStreakData() {
  const { user } = useAuth();

  return useQuery<StreakData>({
    queryKey: ['streak-data', user?.profileId],
    queryFn: async () => {
      if (!user?.profileId) return mockStreakData;

      const response = await api.get<StreakResponse>(`/streaks?profile_id=${user.profileId}`);
      const { current_streak, longest_streak, total_active_days, last_active_date, active_dates, claimed_milestones } = response.data;

      const claimedSet = new Set(claimed_milestones ?? []);

      return {
        currentStreak: current_streak ?? 0,
        longestStreak: longest_streak ?? 0,
        totalActiveDays: total_active_days ?? 0,
        lastActiveDate: last_active_date ?? '',
        activeDates: active_dates ?? [],
        streakRewards: STREAK_MILESTONES.map(m => ({
          ...m,
          claimed: claimedSet.has(m.days),
        })),
      };
    },
    enabled: !!user?.profileId,
    refetchInterval: 60000,
  });
}

export function useRecordActivity() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!user?.profileId) throw new Error('Not authenticated');

      const response = await api.post<ActivityResponse>('/streaks/activity', {
        profile_id: user.profileId,
      });
      return response.data;
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
      if (!user?.profileId) throw new Error('Not authenticated');

      await api.post(`/streaks/claim-reward`, {
        profile_id: user.profileId,
        milestone_days: milestoneDays,
        kiva_points: kivaPoints,
      });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['streak-data'] });
      if (user?.profileId) {
        import('@/lib/notify').then(({ notifyStreakMilestone }) => {
          notifyStreakMilestone(user.profileId!, variables.milestoneDays, variables.kivaPoints);
        });
      }
    },
  });
}
