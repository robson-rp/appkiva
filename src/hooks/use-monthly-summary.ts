import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface MonthlySummary {
  month: string; // "2026-03"
  label: string; // "Mar"
  income: number;
  expenses: number;
  net: number;
}

const INCOME_TYPES = ['allowance', 'task_reward', 'mission_reward', 'vault_interest', 'refund'];
const EXPENSE_TYPES = ['purchase', 'donation'];

const MONTH_LABELS: Record<string, string> = {
  '01': 'Jan', '02': 'Fev', '03': 'Mar', '04': 'Abr',
  '05': 'Mai', '06': 'Jun', '07': 'Jul', '08': 'Ago',
  '09': 'Set', '10': 'Out', '11': 'Nov', '12': 'Dez',
};

export function useMonthlySummary(months = 6) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['monthly-summary', user?.profileId, months],
    queryFn: async () => {
      if (!user?.profileId) return [];

      // Get wallet
      const { data: wallet } = await supabase
        .from('wallets')
        .select('id')
        .eq('profile_id', user.profileId)
        .eq('wallet_type', 'virtual')
        .eq('currency', 'KVC')
        .maybeSingle();

      if (!wallet) return [];

      // Get transactions for last N months
      const since = new Date();
      since.setMonth(since.getMonth() - months + 1);
      since.setDate(1);
      since.setHours(0, 0, 0, 0);

      const { data: txns, error } = await supabase
        .from('wallet_transactions')
        .select('amount, entry_type, direction, created_at')
        .eq('wallet_id', wallet.id)
        .gte('created_at', since.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Group by month
      const map = new Map<string, { income: number; expenses: number }>();

      // Pre-fill months
      for (let i = 0; i < months; i++) {
        const d = new Date();
        d.setMonth(d.getMonth() - (months - 1 - i));
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        map.set(key, { income: 0, expenses: 0 });
      }

      for (const tx of txns ?? []) {
        const date = new Date(tx.created_at!);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const bucket = map.get(key);
        if (!bucket) continue;

        const amount = Math.abs(Number(tx.amount ?? 0));
        const type = tx.entry_type as string;

        if (tx.direction === 'credit' && INCOME_TYPES.includes(type)) {
          bucket.income += amount;
        } else if (tx.direction === 'debit' && EXPENSE_TYPES.includes(type)) {
          bucket.expenses += amount;
        }
      }

      const result: MonthlySummary[] = [];
      for (const [month, data] of map) {
        const mm = month.split('-')[1];
        result.push({
          month,
          label: MONTH_LABELS[mm] || mm,
          income: data.income,
          expenses: data.expenses,
          net: data.income - data.expenses,
        });
      }

      return result;
    },
    enabled: !!user?.profileId,
  });
}
