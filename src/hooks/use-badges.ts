import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';

export interface BadgeRow {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  tier: string;
  requirement: string;
  sort_order: number;
}

export interface BadgeProgressRow {
  id: string;
  badge_id: string;
  profile_id: string;
  unlocked_at: string;
}

export interface BadgeWithProgress extends BadgeRow {
  unlockedAt: string | null;
}

interface BadgesResponse {
  data: BadgeRow[];
}

interface BadgeProgressResponse {
  data: BadgeProgressRow[];
}

export function useBadges() {
  return useQuery({
    queryKey: ['badges'],
    queryFn: async () => {
      const response = await api.get<BadgesResponse>('/badges');
      return response.data ?? [];
    },
    refetchInterval: 60000,
  });
}

export function useBadgeProgress(profileId?: string) {
  const { user } = useAuth();
  const id = profileId || user?.profileId;

  return useQuery({
    queryKey: ['badge-progress', id],
    queryFn: async () => {
      if (!id) return [];
      const response = await api.get<BadgeProgressResponse>(`/badges/progress?profile_id=${id}`);
      return response.data ?? [];
    },
    enabled: !!id,
    refetchInterval: 60000,
  });
}

export function useBadgesWithProgress(profileId?: string) {
  const { data: badges = [] } = useBadges();
  const { data: progress = [] } = useBadgeProgress(profileId);

  const merged: BadgeWithProgress[] = badges.map(b => {
    const p = progress.find(pr => pr.badge_id === b.id);
    return { ...b, unlockedAt: p?.unlocked_at ?? null };
  });

  return merged;
}
