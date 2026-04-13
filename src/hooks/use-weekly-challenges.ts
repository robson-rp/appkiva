import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';
import { WeeklyChallenge, ClassLeaderboardEntry } from '@/types/kivara';

interface WeeklyChallengesResponse {
  data: Array<{
    id: string;
    title: string;
    description: string;
    type: string;
    icon: string;
    target_value: number;
    current_value: number;
    reward: number;
    kiva_points_reward: number;
    status: string;
    week_start: string;
    week_end: string;
    participant_count: number;
  }>;
}

interface LeaderboardResponse {
  data: Array<{
    rank: number;
    name: string;
    avatar: string;
    score: number;
    challenges_completed: number;
    is_current_user: boolean;
  }>;
}

export function useWeeklyChallenges() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['weekly-challenges', user?.profileId],
    queryFn: async () => {
      if (!user?.profileId) return [];
      const response = await api.get<WeeklyChallengesResponse>(`/challenges/weekly?profile_id=${user.profileId}`);
      return (response.data ?? []).map(mapRow);
    },
    enabled: !!user?.profileId,
    refetchInterval: 60000,
  });
}

export function useCompleteWeeklyChallenge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (challengeId: string) => {
      await api.post(`/challenges/${challengeId}/complete`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weekly-challenges'] });
      queryClient.invalidateQueries({ queryKey: ['classroom-leaderboard'] });
      queryClient.invalidateQueries({ queryKey: ['household-leaderboard'] });
      queryClient.invalidateQueries({ queryKey: ['kiva-points'] });
    },
  });
}

export function useClassroomLeaderboard() {
  const { user } = useAuth();

  return useQuery<ClassLeaderboardEntry[]>({
    queryKey: ['classroom-leaderboard', user?.profileId],
    queryFn: async () => {
      if (!user?.profileId) return [];
      const response = await api.get<LeaderboardResponse>(`/leaderboard/classroom?profile_id=${user.profileId}`);
      return (response.data ?? []).map(entry => ({
        rank: entry.rank,
        name: entry.name,
        avatar: entry.avatar,
        score: entry.score,
        challengesCompleted: entry.challenges_completed,
        isCurrentUser: entry.is_current_user,
      }));
    },
    enabled: !!user?.profileId,
    refetchInterval: 60000,
  });
}

export function useHouseholdLeaderboard() {
  const { user } = useAuth();

  return useQuery<ClassLeaderboardEntry[]>({
    queryKey: ['household-leaderboard', user?.householdId],
    queryFn: async () => {
      if (!user?.householdId) return [];
      const response = await api.get<LeaderboardResponse>(`/leaderboard/household?household_id=${user.householdId}`);
      return (response.data ?? []).map(entry => ({
        rank: entry.rank,
        name: entry.name,
        avatar: entry.avatar,
        score: entry.score,
        challengesCompleted: entry.challenges_completed,
        isCurrentUser: entry.is_current_user,
      }));
    },
    enabled: !!user?.householdId,
    refetchInterval: 60000,
  });
}

function mapRow(row: any): WeeklyChallenge {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    type: row.type,
    icon: row.icon,
    targetValue: Number(row.target_value),
    currentValue: Number(row.current_value),
    reward: Number(row.reward),
    kivaPointsReward: Number(row.kiva_points_reward),
    status: row.status,
    weekStart: row.week_start,
    weekEnd: row.week_end,
    participantCount: row.participant_count,
  };
}
