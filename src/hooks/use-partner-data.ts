import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
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
      const data = await api.get<PartnerProgram[]>('/partner-programs');
      return data;
    },
    enabled: !!user && user.role === 'partner',
  });
}

export function useSponsoredChallenges() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['sponsored-challenges', user?.id],
    queryFn: async () => {
      const data = await api.get<SponsoredChallenge[]>('/sponsored-challenges');
      return data;
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
      const data = await api.post<SponsoredChallenge>('/sponsored-challenges', challenge);
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
      const data = await api.patch<SponsoredChallenge>(`/sponsored-challenges/${id}`, updates);
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
      await api.delete(`/sponsored-challenges/${id}`);
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
      const data = await api.post<PartnerProgram>('/partner-programs', program);
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
      const data = await api.patch<PartnerProgram>(`/partner-programs/${id}`, updates);
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
      await api.delete(`/partner-programs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partner-programs'] });
    },
  });
}
