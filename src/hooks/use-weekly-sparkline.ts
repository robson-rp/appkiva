import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';

export interface DailyPoint {
  day: string;
  earned: number;
  spent: number;
}

export function useWeeklySparkline() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['weekly-sparkline', user?.profileId],
    queryFn: async (): Promise<{ points: DailyPoint[]; totalEarned: number; totalSpent: number }> => {
      if (!user?.profileId) return { points: [], totalEarned: 0, totalSpent: 0 };
      const data = await api.get<{ weekly_sparkline: { points: DailyPoint[]; totalEarned: number; totalSpent: number } }>('/admin/stats');
      return data.weekly_sparkline;
    },
    enabled: !!user?.profileId,
  });
}
