import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface TeacherLimits {
  tierName: string;
  tierId: string | null;
  maxStudents: number;
  maxClassrooms: number;
  usedStudents: number;
  usedClassrooms: number;
  canCreateClassroom: boolean;
  canAddStudents: (count: number) => boolean;
  loading: boolean;
  priceMonthly: number;
}

export function useTeacherLimits(): TeacherLimits {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['teacher-limits', user?.id],
    queryFn: async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, tenant_id')
        .eq('user_id', user!.id)
        .single();

      if (!profile?.tenant_id) return null;

      const { data: tenant } = await supabase
        .from('tenants')
        .select('subscription_tier_id')
        .eq('id', profile.tenant_id)
        .single();

      let tier: any = null;
      if (tenant?.subscription_tier_id) {
        const { data: t } = await supabase
          .from('subscription_tiers')
          .select('*')
          .eq('id', tenant.subscription_tier_id)
          .single();
        tier = t;
      }

      // Get usage
      const { data: classrooms } = await supabase
        .from('classrooms')
        .select('id')
        .eq('teacher_profile_id', profile.id);

      const classroomIds = (classrooms ?? []).map(c => c.id);
      let studentCount = 0;
      if (classroomIds.length > 0) {
        const { count } = await supabase
          .from('classroom_students')
          .select('id', { count: 'exact', head: true })
          .in('classroom_id', classroomIds);
        studentCount = count ?? 0;
      }

      return {
        tier,
        usedClassrooms: classroomIds.length,
        usedStudents: studentCount,
      };
    },
    enabled: !!user && user.role === 'teacher',
  });

  const tier = data?.tier;
  const maxStudents = tier?.max_children ?? 30;
  const maxClassrooms = tier?.max_classrooms ?? 3;
  const usedStudents = data?.usedStudents ?? 0;
  const usedClassrooms = data?.usedClassrooms ?? 0;

  return {
    tierName: tier?.name ?? 'Professor Gratuito',
    tierId: tier?.id ?? null,
    maxStudents,
    maxClassrooms,
    usedStudents,
    usedClassrooms,
    canCreateClassroom: usedClassrooms < maxClassrooms,
    canAddStudents: (count: number) => usedStudents + count <= maxStudents,
    loading: isLoading,
    priceMonthly: tier?.price_monthly ? Number(tier.price_monthly) : 0,
  };
}
