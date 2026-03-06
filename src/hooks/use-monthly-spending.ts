import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Returns total purchase spending for the current month.
 */
export function useMonthlySpending() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['monthly-spending', user?.profileId],
    queryFn: async (): Promise<number> => {
      if (!user?.profileId) return 0;

      // Get wallet
      const { data: wallet } = await supabase
        .from('wallets')
        .select('id')
        .eq('profile_id', user.profileId)
        .eq('wallet_type', 'virtual')
        .eq('currency', 'KVC')
        .maybeSingle();

      if (!wallet) return 0;

      // First day of current month
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      const { data, error } = await supabase
        .from('wallet_transactions')
        .select('amount')
        .eq('wallet_id', wallet.id)
        .eq('direction', 'debit')
        .eq('entry_type', 'purchase')
        .gte('created_at', monthStart);

      if (error) throw error;

      return (data ?? []).reduce((sum, t) => sum + Number(t.amount), 0);
    },
    enabled: !!user?.profileId && (user?.role === 'child' || user?.role === 'teen'),
  });
}
