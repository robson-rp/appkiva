import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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

export function useBadges() {
  return useQuery({
    queryKey: ['badges'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('badges')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      if (error) throw error;
      return (data as BadgeRow[]) ?? [];
    },
  });
}

export function useBadgeProgress(profileId?: string) {
  const { user } = useAuth();
  const id = profileId || user?.profileId;

  return useQuery({
    queryKey: ['badge-progress', id],
    queryFn: async () => {
      if (!id) return [];
      const { data, error } = await supabase
        .from('badge_progress')
        .select('*')
        .eq('profile_id', id);
      if (error) throw error;
      return (data as BadgeProgressRow[]) ?? [];
    },
    enabled: !!id,
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
