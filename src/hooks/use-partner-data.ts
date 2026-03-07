import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface PartnerProgram {
  id: string;
  partner_tenant_id: string;
  program_name: string;
  program_type: string;
  status: string;
  children_count: number;
  investment_amount: number;
  budget_spent: number;
  started_at: string;
  created_at: string;
}

export interface SponsoredChallenge {
  id: string;
  partner_tenant_id: string;
  title: string;
  description: string | null;
  status: string;
  participants_count: number;
  completion_rate: number;
  reward_amount: number;
  program_id: string | null;
  start_date: string;
  end_date: string;
  created_at: string;
}

export function usePartnerPrograms() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['partner-programs', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('partner_programs')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as PartnerProgram[];
    },
    enabled: !!user && user.role === 'partner',
  });
}

export function useSponsoredChallenges() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['sponsored-challenges', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sponsored_challenges')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as SponsoredChallenge[];
    },
    enabled: !!user && user.role === 'partner',
  });
}

export function useCreateSponsoredChallenge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (challenge: {
      partner_tenant_id: string;
      title: string;
      description?: string | null;
      reward_amount?: number;
      start_date: string;
      end_date: string;
      status?: string;
    }) => {
      const { data, error } = await supabase
        .from('sponsored_challenges')
        .insert(challenge)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sponsored-challenges'] });
    },
  });
}

export function useUpdateSponsoredChallenge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: {
      id: string;
      title?: string;
      description?: string | null;
      reward_amount?: number;
      start_date?: string;
      end_date?: string;
      status?: string;
    }) => {
      const { data, error } = await supabase
        .from('sponsored_challenges')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sponsored-challenges'] });
    },
  });
}

export function useDeleteSponsoredChallenge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('sponsored_challenges')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sponsored-challenges'] });
    },
  });
}

export function useCreatePartnerProgram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (program: {
      partner_tenant_id: string;
      program_name: string;
      program_type: string;
      children_count?: number;
      investment_amount?: number;
    }) => {
      const { data, error } = await supabase
        .from('partner_programs')
        .insert(program)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partner-programs'] });
    },
  });
}

export function useUpdatePartnerProgram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: {
      id: string;
      program_name?: string;
      program_type?: string;
      children_count?: number;
      investment_amount?: number;
      status?: string;
    }) => {
      const { data, error } = await supabase
        .from('partner_programs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partner-programs'] });
    },
  });
}

export function useDeletePartnerProgram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('partner_programs')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partner-programs'] });
    },
  });
}
