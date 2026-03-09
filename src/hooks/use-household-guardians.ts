import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useHouseholdGuardians() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['household-guardians', user?.householdId],
    enabled: !!user?.householdId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('household_guardians')
        .select('id, profile_id, role, created_at, profiles(display_name, avatar)')
        .eq('household_id', user!.householdId!);

      if (error) throw error;
      return (data ?? []).map((g: any) => ({
        id: g.id,
        profileId: g.profile_id,
        role: g.role as 'primary' | 'secondary',
        displayName: g.profiles?.display_name ?? '',
        avatar: g.profiles?.avatar ?? '👤',
        createdAt: g.created_at,
      }));
    },
  });
}

export function useInviteGuardian() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (email: string) => {
      const { data, error } = await supabase.functions.invoke('invite-guardian', {
        body: { email },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['household-guardians'] });
    },
  });
}

export function useRemoveGuardian() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (guardianId: string) => {
      const { error } = await supabase
        .from('household_guardians')
        .delete()
        .eq('id', guardianId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['household-guardians'] });
    },
  });
}
