import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';

export interface ClassmateRanking {
  profileId: string;
  name: string;
  avatar: string;
  balance: number;
  totalSaved: number;
  totalDonated: number;
}

interface ClassmateRankingsResponse {
  data: Array<{
    profile_id: string;
    name: string;
    avatar: string;
    balance: number;
    total_saved: number;
    total_donated: number;
  }>;
}

export function useClassmateRankings() {
  const { user } = useAuth();
  const profileId = user?.profileId;

  return useQuery({
    queryKey: ['classmate-rankings', profileId],
    enabled: !!profileId,
    queryFn: async (): Promise<ClassmateRanking[]> => {
      if (!profileId) return [];
      const response = await api.get<ClassmateRankingsResponse>(`/leaderboard/classroom?profile_id=${profileId}&type=financial`);
      return (response.data ?? []).map(r => ({
        profileId: r.profile_id,
        name: r.name ?? 'Aluno',
        avatar: r.avatar ?? '🧒',
        balance: r.balance ?? 0,
        totalSaved: r.total_saved ?? 0,
        totalDonated: r.total_donated ?? 0,
      }));
    },
    refetchInterval: 60000,
  });
}
