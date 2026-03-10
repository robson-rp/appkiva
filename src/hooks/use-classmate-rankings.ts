import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ClassmateRanking {
  profileId: string;
  name: string;
  avatar: string;
  balance: number;
  totalSaved: number;
  totalDonated: number;
}

export function useClassmateRankings() {
  const { user } = useAuth();
  const profileId = user?.profileId;

  return useQuery({
    queryKey: ['classmate-rankings', profileId],
    enabled: !!profileId,
    queryFn: async (): Promise<ClassmateRanking[]> => {
      // 1. Get classrooms the child is enrolled in
      const { data: enrollments } = await supabase
        .from('classroom_students')
        .select('classroom_id')
        .eq('student_profile_id', profileId!);

      if (!enrollments?.length) return [];

      const classroomIds = enrollments.map(e => e.classroom_id);

      // 2. Get all students in those classrooms
      const { data: classmates } = await supabase
        .from('classroom_students')
        .select('student_profile_id')
        .in('classroom_id', classroomIds);

      if (!classmates?.length) return [];

      const uniqueIds = [...new Set(classmates.map(c => c.student_profile_id))];

      // 3. Get profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, display_name, avatar')
        .in('id', uniqueIds);

      if (!profiles?.length) return [];

      // 4. Get balances
      const { data: balances } = await supabase
        .from('wallet_balances')
        .select('profile_id, balance')
        .in('profile_id', uniqueIds)
        .eq('wallet_type', 'virtual')
        .eq('currency', 'KVC');

      const balanceMap = new Map((balances ?? []).map(b => [b.profile_id, Number(b.balance) || 0]));

      // 5. Get savings (dream vaults)
      const { data: vaults } = await supabase
        .from('dream_vaults')
        .select('profile_id, current_amount')
        .in('profile_id', uniqueIds);

      const savingsMap = new Map<string, number>();
      (vaults ?? []).forEach(v => {
        savingsMap.set(v.profile_id, (savingsMap.get(v.profile_id) ?? 0) + Number(v.current_amount));
      });

      // 6. Get donations
      const { data: donations } = await supabase
        .from('donations')
        .select('profile_id, amount')
        .in('profile_id', uniqueIds);

      const donationMap = new Map<string, number>();
      (donations ?? []).forEach(d => {
        donationMap.set(d.profile_id, (donationMap.get(d.profile_id) ?? 0) + Number(d.amount));
      });

      return profiles.map(p => ({
        profileId: p.id,
        name: p.display_name ?? 'Aluno',
        avatar: p.avatar ?? '🧒',
        balance: balanceMap.get(p.id) ?? 0,
        totalSaved: savingsMap.get(p.id) ?? 0,
        totalDonated: donationMap.get(p.id) ?? 0,
      }));
    },
  });
}
