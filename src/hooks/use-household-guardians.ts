import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';

interface Guardian {
  id: string;
  profile_id: string;
  role: 'primary' | 'secondary';
  display_name: string;
  avatar: string;
  created_at: string;
}

interface GuardiansResponse {
  data: Guardian[];
}

export function useHouseholdGuardians() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['household-guardians', user?.householdId],
    enabled: !!user?.householdId,
    queryFn: async () => {
      const response = await api.get<GuardiansResponse>(
        `/households/${user!.householdId}/guardians`
      );

      return (response.data ?? []).map((g) => ({
        id: g.id,
        profileId: g.profile_id,
        role: g.role,
        displayName: g.display_name ?? '',
        avatar: g.avatar ?? '👤',
        createdAt: g.created_at,
      }));
    },
  });
}

export function useInviteGuardian() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (email: string) => {
      if (!user?.householdId) throw new Error('No household ID');
      return await api.post(`/households/${user.householdId}/invite`, { email });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['household-guardians'] });
    },
  });
}

export function useRemoveGuardian() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (guardianId: string) => {
      if (!user?.householdId) throw new Error('No household ID');
      return await api.delete(`/households/${user.householdId}/guardians/${guardianId}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['household-guardians'] });
    },
  });
}
