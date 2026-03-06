import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface DailyPoint {
  day: string; // "Seg", "Ter", etc.
  earned: number;
  spent: number;
}

const DAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export function useWeeklySparkline() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['weekly-sparkline', user?.profileId],
    queryFn: async (): Promise<{ points: DailyPoint[]; totalEarned: number; totalSpent: number }> => {
      if (!user?.profileId) return { points: [], totalEarned: 0, totalSpent: 0 };

      const { data: wallet } = await supabase
        .from('wallets')
        .select('id')
        .eq('profile_id', user.profileId)
        .eq('wallet_type', 'virtual')
        .eq('currency', 'KVC')
        .maybeSingle();

      if (!wallet) return { points: [], totalEarned: 0, totalSpent: 0 };

      const now = new Date();
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 6);
      weekAgo.setHours(0, 0, 0, 0);

      const { data: txns } = await supabase
        .from('wallet_transactions')
        .select('amount, direction, created_at')
        .eq('wallet_id', wallet.id)
        .gte('created_at', weekAgo.toISOString())
        .order('created_at', { ascending: true });

      // Pre-fill 7 days
      const map = new Map<string, { earned: number; spent: number }>();
      for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const key = d.toISOString().split('T')[0];
        map.set(key, { earned: 0, spent: 0 });
      }

      for (const tx of txns ?? []) {
        const key = new Date(tx.created_at!).toISOString().split('T')[0];
        const bucket = map.get(key);
        if (!bucket) continue;
        const amount = Math.abs(Number(tx.amount ?? 0));
        if (tx.direction === 'credit') bucket.earned += amount;
        else bucket.spent += amount;
      }

      let totalEarned = 0;
      let totalSpent = 0;
      const points: DailyPoint[] = [];
      for (const [dateStr, data] of map) {
        const d = new Date(dateStr);
        points.push({ day: DAY_LABELS[d.getDay()], earned: data.earned, spent: data.spent });
        totalEarned += data.earned;
        totalSpent += data.spent;
      }

      return { points, totalEarned, totalSpent };
    },
    enabled: !!user?.profileId,
  });
}
