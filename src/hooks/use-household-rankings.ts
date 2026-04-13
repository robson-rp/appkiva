import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';

export interface HouseholdMemberRanking {
  profileId: string;
  name: string;
  avatar: string;
  balance: number;
  totalSaved: number;
  totalDonated: number;
}

interface HouseholdRankingsResponse {
  data: Array<{
    profile_id: string;
    name: string;
    avatar: string;
    balance: number;
    total_saved: number;
    total_donated: number;
  }>;
}

export function useHouseholdRankings() {
  const { user } = useAuth();
  const householdId = user?.householdId;

  return useQuery({
    queryKey: ['household-rankings', householdId],
    queryFn: async () => {
      if (!householdId) return [];
      const response = await api.get<HouseholdRankingsResponse>(`/leaderboard/household?household_id=${householdId}&type=financial`);
      return (response.data ?? []).map(r => ({
        profileId: r.profile_id,
        name: r.name ?? 'Membro',
        avatar: r.avatar ?? '👤',
        balance: r.balance ?? 0,
        totalSaved: r.total_saved ?? 0,
        totalDonated: r.total_donated ?? 0,
      }));
    },
    enabled: !!householdId,
    refetchInterval: 60000,
  });
}
