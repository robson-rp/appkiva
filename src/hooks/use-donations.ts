import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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

export function useDonationCauses() {
  return useQuery({
    queryKey: ['donation-causes'],
    queryFn: async (): Promise<DonationCause[]> => {
      const { data, error } = await supabase
        .from('donation_causes')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return (data ?? []).map((c: any) => ({
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
      const { data, error } = await supabase
        .from('donations')
        .select('*')
        .eq('profile_id', user!.profileId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data ?? []).map((d: any) => ({
        id: d.id,
        profileId: d.profile_id,
        causeId: d.cause_id,
        amount: Number(d.amount),
        createdAt: d.created_at,
      }));
    },
  });
}

export function useDonate() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ causeId, amount }: { causeId: string; amount: number }) => {
      if (!user?.profileId) throw new Error('Não autenticado');

      // 1. Create the transaction via edge function (debit from child wallet)
      const { error: txError } = await supabase.functions.invoke('create-transaction', {
        body: {
          target_profile_id: user.profileId,
          amount,
          description: 'Doação solidária',
          entry_type: 'donation',
        },
      });
      if (txError) throw txError;

      // 2. Record the donation
      const { error: donErr } = await supabase.from('donations').insert({
        profile_id: user.profileId,
        cause_id: causeId,
        amount,
      });
      if (donErr) throw donErr;

      // 3. Increment total_received on cause (using rpc would be better but direct update works for now)
      // We use a raw update - admin RLS allows this via service role in edge function
      // For client-side, we just record the donation; a trigger or function could update totals
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['donation-causes'] });
      qc.invalidateQueries({ queryKey: ['my-donations'] });
      qc.invalidateQueries({ queryKey: ['wallet-balance'] });
      qc.invalidateQueries({ queryKey: ['wallet-transactions'] });
      toast({ title: 'Doação realizada! 💜', description: 'Obrigado pela tua generosidade!' });
    },
    onError: (e: any) => {
      toast({ title: 'Erro na doação', description: e?.message || 'Tenta novamente.', variant: 'destructive' });
    },
  });
}
