import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';

interface ProgramInvitation {
  id: string;
  program_id: string;
  partner_tenant_id: string;
  target_type: 'family' | 'school';
  code: string;
  status: string;
  created_at: string;
}

export function useProgramInvitations(programId?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['program-invitations', programId],
    queryFn: async () => {
      const url = programId ? `/partner-programs/${programId}/invitations` : '/program-invitations';
      const res = await api.get<any>(url);
      return Array.isArray(res) ? res : (res?.data ?? []);
    },
    enabled: !!user,
  });
}

export function useCreateProgramInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      program_id: string;
      partner_tenant_id: string;
      target_type: 'family' | 'school';
    }) => {
      const data = await api.post<ProgramInvitation>(
        `/partner-programs/${params.program_id}/invite`,
        {
          target_type: params.target_type,
        }
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['program-invitations'] });
    },
  });
}

export function useAcceptProgramInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { code: string; profileId: string }) => {
      const data = await api.post(`/invite/program/${params.code}`, {
        profile_id: params.profileId,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['program-invitations'] });
    },
  });
}

export function useValidateProgramInvite(code: string | null) {
  return useQuery({
    queryKey: ['validate-program-invite', code],
    queryFn: async () => {
      const data = await api.get<{ valid: boolean; program?: any }>(`/invite/program/${code}/validate`);
      return data;
    },
    enabled: !!code && code.length >= 6,
  });
}
