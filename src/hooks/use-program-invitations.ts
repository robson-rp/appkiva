import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useProgramInvitations(programId?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['program-invitations', programId],
    queryFn: async () => {
      let query = supabase
        .from('program_invitations')
        .select('*')
        .order('created_at', { ascending: false });

      if (programId) {
        query = query.eq('program_id', programId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function useCreateProgramInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      program_id: string;
      partner_tenant_id: string;
      target_type: 'family' | 'school';
    }) => {
      const code = generateCode();
      const { data, error } = await supabase
        .from('program_invitations')
        .insert({
          program_id: params.program_id,
          partner_tenant_id: params.partner_tenant_id,
          target_type: params.target_type,
          code,
        })
        .select()
        .single();
      if (error) throw error;
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
      const { data, error } = await supabase.rpc('accept_program_invitation', {
        _code: params.code,
        _profile_id: params.profileId,
      } as any);
      if (error) throw error;
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
      const { data, error } = await supabase.rpc('validate_program_invite', {
        _code: code!,
      } as any);
      if (error) throw error;
      return data as any;
    },
    enabled: !!code && code.length >= 6,
  });
}
