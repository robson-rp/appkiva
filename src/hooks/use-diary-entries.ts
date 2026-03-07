import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface DiaryEntry {
  id: string;
  profileId: string;
  text: string;
  mood: string;
  tags: string[];
  createdAt: string;
}

export function useDiaryEntries() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['diary-entries', user?.profileId],
    queryFn: async (): Promise<DiaryEntry[]> => {
      if (!user?.profileId) return [];
      const { data, error } = await (supabase as any)
        .from('diary_entries')
        .select('*')
        .eq('profile_id', user.profileId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map((r: any) => ({
        id: r.id,
        profileId: r.profile_id,
        text: r.text,
        mood: r.mood,
        tags: r.tags ?? [],
        createdAt: r.created_at,
      }));
    },
    enabled: !!user?.profileId,
  });
}

export function useCreateDiaryEntry() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ text, mood, tags }: { text: string; mood: string; tags?: string[] }) => {
      if (!user?.profileId) throw new Error('Not authenticated');
      const { error } = await (supabase as any).from('diary_entries').insert({
        profile_id: user.profileId,
        text,
        mood,
        tags: tags ?? [],
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['diary-entries'] }),
  });
}
