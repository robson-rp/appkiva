import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface DreamComment {
  id: string;
  text: string;
  emoji: string;
  createdAt: string;
}

export interface DreamVault {
  id: string;
  profileId: string;
  householdId: string | null;
  title: string;
  description: string | null;
  icon: string;
  targetAmount: number;
  currentAmount: number;
  priority: 'high' | 'medium' | 'low';
  createdAt: string;
  parentComments: DreamComment[];
}

function mapRow(row: any): DreamVault {
  return {
    id: row.id,
    profileId: row.profile_id,
    householdId: row.household_id,
    title: row.title,
    description: row.description,
    icon: row.icon,
    targetAmount: Number(row.target_amount),
    currentAmount: Number(row.current_amount),
    priority: row.priority as DreamVault['priority'],
    createdAt: row.created_at,
    parentComments: (row.dream_vault_comments ?? []).map((c: any) => ({
      id: c.id,
      text: c.text,
      emoji: c.emoji ?? '💬',
      createdAt: c.created_at,
    })),
  };
}

export function useDreamVaults(profileId?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['dream-vaults', profileId ?? user?.profileId],
    queryFn: async () => {
      let query = supabase
        .from('dream_vaults')
        .select('*, dream_vault_comments(*)')
        .order('created_at', { ascending: false });

      if (profileId) {
        query = query.eq('profile_id', profileId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []).map(mapRow);
    },
    enabled: !!user,
  });
}

export function useCreateDreamVault() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: { title: string; description?: string; icon?: string; targetAmount: number; priority?: string }) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase.from('dream_vaults').insert({
        profile_id: user.profileId,
        household_id: user.householdId,
        title: input.title,
        description: input.description ?? null,
        icon: input.icon ?? '✨',
        target_amount: input.targetAmount,
        priority: input.priority ?? 'medium',
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['dream-vaults'] }),
  });
}

export function useAddDreamComment() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ dreamVaultId, text, emoji }: { dreamVaultId: string; text: string; emoji?: string }) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase.from('dream_vault_comments').insert({
        dream_vault_id: dreamVaultId,
        parent_profile_id: user.profileId,
        text,
        emoji: emoji ?? '💬',
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['dream-vaults'] }),
  });
}

export function useDepositToDream() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ dreamId, amount }: { dreamId: string; amount: number }) => {
      const { data: dream, error: fetchErr } = await supabase
        .from('dream_vaults')
        .select('current_amount')
        .eq('id', dreamId)
        .single();
      if (fetchErr) throw fetchErr;

      const { error } = await supabase
        .from('dream_vaults')
        .update({ current_amount: Number(dream.current_amount) + amount })
        .eq('id', dreamId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['dream-vaults'] }),
  });
}
