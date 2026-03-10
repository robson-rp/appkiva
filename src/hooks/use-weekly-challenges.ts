import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { WeeklyChallenge, ClassLeaderboardEntry } from '@/types/kivara';

export function useWeeklyChallenges() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['weekly-challenges', user?.profileId],
    queryFn: async () => {
      if (!user?.profileId) return [];
      const { data, error } = await supabase
        .from('weekly_challenges')
        .select('*')
        .eq('profile_id', user.profileId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map(mapRow);
    },
    enabled: !!user?.profileId,
  });
}

export function useClassroomLeaderboard() {
  const { user } = useAuth();

  return useQuery<ClassLeaderboardEntry[]>({
    queryKey: ['classroom-leaderboard', user?.profileId],
    queryFn: async () => {
      if (!user?.profileId) return [];

      // Find classrooms this user belongs to
      const { data: enrollments } = await supabase
        .from('classroom_students')
        .select('classroom_id')
        .eq('student_profile_id', user.profileId);

      if (!enrollments || enrollments.length === 0) return [];

      const classroomIds = enrollments.map(e => e.classroom_id);

      // Get all students in those classrooms
      const { data: peers } = await supabase
        .from('classroom_students')
        .select('student_profile_id')
        .in('classroom_id', classroomIds);

      if (!peers || peers.length === 0) return [];

      const peerIds = [...new Set(peers.map(p => p.student_profile_id))];

      // Get profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, display_name, avatar')
        .in('id', peerIds);

      // Get completed challenges count + total score per peer
      const { data: challenges } = await supabase
        .from('weekly_challenges')
        .select('profile_id, status, kiva_points_reward')
        .in('profile_id', peerIds);

      const scoreMap = new Map<string, { score: number; completed: number }>();
      for (const ch of challenges ?? []) {
        const entry = scoreMap.get(ch.profile_id) ?? { score: 0, completed: 0 };
        entry.score += ch.kiva_points_reward ?? 0;
        if (ch.status === 'completed') entry.completed += 1;
        scoreMap.set(ch.profile_id, entry);
      }

      const entries: ClassLeaderboardEntry[] = (profiles ?? [])
        .map(p => ({
          rank: 0,
          name: p.display_name,
          avatar: p.avatar ?? '👤',
          score: scoreMap.get(p.id)?.score ?? 0,
          challengesCompleted: scoreMap.get(p.id)?.completed ?? 0,
          isCurrentUser: p.id === user.profileId,
        }))
        .sort((a, b) => b.score - a.score)
        .map((e, i) => ({ ...e, rank: i + 1 }));

      return entries;
    },
    enabled: !!user?.profileId,
  });
}

export function useHouseholdLeaderboard() {
  const { user } = useAuth();

  return useQuery<ClassLeaderboardEntry[]>({
    queryKey: ['household-leaderboard', user?.householdId],
    queryFn: async () => {
      if (!user?.householdId) return [];

      const { data: allProfiles } = await supabase
        .from('profiles')
        .select('id, display_name, avatar, user_id')
        .eq('household_id', user.householdId);

      if (!allProfiles || allProfiles.length === 0) return [];

      // Filter out parents
      const userIds = allProfiles.map(p => p.user_id);
      const { data: roles } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', userIds);
      const childUserIds = new Set(
        (roles ?? []).filter(r => r.role === 'child' || r.role === 'teen').map(r => r.user_id)
      );
      const profiles = allProfiles.filter(p => childUserIds.has(p.user_id));
      if (profiles.length === 0) return [];

      const profileIds = profiles.map(p => p.id);

      const { data: challenges } = await supabase
        .from('weekly_challenges')
        .select('profile_id, status, kiva_points_reward')
        .in('profile_id', profileIds);

      const scoreMap = new Map<string, { score: number; completed: number }>();
      for (const ch of challenges ?? []) {
        const entry = scoreMap.get(ch.profile_id) ?? { score: 0, completed: 0 };
        entry.score += ch.kiva_points_reward ?? 0;
        if (ch.status === 'completed') entry.completed += 1;
        scoreMap.set(ch.profile_id, entry);
      }

      const entries: ClassLeaderboardEntry[] = profiles
        .map(p => ({
          rank: 0,
          name: p.display_name,
          avatar: p.avatar ?? '👤',
          score: scoreMap.get(p.id)?.score ?? 0,
          challengesCompleted: scoreMap.get(p.id)?.completed ?? 0,
          isCurrentUser: p.id === user.profileId,
        }))
        .sort((a, b) => b.score - a.score)
        .map((e, i) => ({ ...e, rank: i + 1 }));

      return entries;
    },
    enabled: !!user?.householdId,
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
