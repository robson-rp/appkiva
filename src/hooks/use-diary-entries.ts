import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';

export interface DiaryEntry {
  id: string;
  profileId: string;
  text: string;
  mood: string;
  tags: string[];
  createdAt: string;
}

interface DiaryEntryResponse {
  id: string;
  profile_id: string;
  text: string;
  mood: string;
  tags: string[];
  created_at: string;
}

interface DiaryApiResponse {
  data: DiaryEntryResponse[];
}

export function useDiaryEntries() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['diary-entries', user?.profileId],
    queryFn: async (): Promise<DiaryEntry[]> => {
      if (!user?.profileId) return [];
      
      const response = await api.get<DiaryApiResponse>('/diary');
      
      return (response.data ?? []).map((r) => ({
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
      
      await api.post('/diary', {
        text,
        mood,
        tags: tags ?? [],
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['diary-entries'] }),
  });
}

export function useUpdateDiaryEntry() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      text, 
      mood, 
      tags 
    }: { 
      id: string; 
      text?: string; 
      mood?: string; 
      tags?: string[] 
    }) => {
      await api.patch(`/diary/${id}`, { text, mood, tags });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['diary-entries'] }),
  });
}

export function useDeleteDiaryEntry() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/diary/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['diary-entries'] }),
  });
}
