import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';

interface KivaPointsResponse {
  data: {
    total_points: number;
    lesson_points: number;
    mission_points: number;
    streak_points: number;
  };
}

export function useKivaPoints(profileId?: string) {
  const { user } = useAuth();
  const id = profileId || user?.profileId;

  return useQuery({
    queryKey: ['kiva-points', id],
    enabled: !!id,
    queryFn: async () => {
      if (!id) return 0;
      const response = await api.get<KivaPointsResponse>(`/kiva-points?profile_id=${id}`);
      return response.data.total_points ?? 0;
    },
    refetchInterval: 60000,
  });
}
