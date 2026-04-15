import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface DonationCause {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  totalReceived: number;
  isActive: boolean;
}

export interface Donation {
  id: string;
  profileId: string;
  causeId: string;
  amount: number;
  createdAt: string;
}

interface DonationCauseResponse {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  total_received: number;
  is_active: boolean;
}

interface DonationResponse {
  id: string;
  profile_id: string;
  cause_id: string;
  amount: number;
  created_at: string;
}

export function useDonationCauses() {
  return useQuery({
    queryKey: ['donation-causes'],
    queryFn: async (): Promise<DonationCause[]> => {
      const res = await api.get<any>('/donation-causes?is_active=true');
      const data = Array.isArray(res) ? res : (res?.data ?? []);
      return data.map((c: any) => ({
        id: c.id,
        name: c.name,
        description: c.description ?? '',
        icon: c.icon ?? '💜',
        category: c.category ?? 'solidarity',
        totalReceived: Number(c.total_received) || 0,
        isActive: c.is_active,
      }));
    },
  });
}

export function useMyDonations() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['my-donations', user?.profileId],
    enabled: !!user?.profileId,
    queryFn: async (): Promise<Donation[]> => {
      const res = await api.get<any>('/donations');
      const data = Array.isArray(res) ? res : (res?.data ?? []);
      return data.map((d: any) => ({
        id: d.id,
        profileId: d.profile_id,
        causeId: d.cause_id,
        amount: Number(d.amount),
        createdAt: d.created_at,
      }));
    },
  });
}

export function useCreateDonationCause() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: { name: string; description?: string; icon?: string; category?: string }) => {
      await api.post('/donation-causes', {
        name: input.name,
        description: input.description ?? '',
        icon: input.icon ?? '💜',
        category: input.category ?? 'solidarity',
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['donation-causes'] });
      toast({ title: 'Causa criada! 💜', description: 'A causa foi criada com sucesso.' });
    },
    onError: () => {
      toast({ title: 'Erro', description: 'Não foi possível criar a causa.', variant: 'destructive' });
    },
  });
}

export function useDonate() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ causeId, amount }: { causeId: string; amount: number }) => {
      if (!user?.profileId) throw new Error('Não autenticado');

      await api.post('/donations', {
        cause_id: causeId,
        amount,
      });
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['donation-causes'] });
      qc.invalidateQueries({ queryKey: ['my-donations'] });
      qc.invalidateQueries({ queryKey: ['wallet-balance'] });
      qc.invalidateQueries({ queryKey: ['wallet-transactions'] });
      toast({ title: 'Doação realizada! 💜', description: 'Obrigado pela tua generosidade!' });
      
      import('@/lib/notify').then(({ notifyDonationMade }) => {
        if (user?.profileId) {
          notifyDonationMade(user.profileId, 'causa solidária', variables.amount);
        }
      });
    },
    onError: (e: any) => {
      toast({ title: 'Erro na doação', description: e?.message || 'Tenta novamente.', variant: 'destructive' });
    },
  });
}
