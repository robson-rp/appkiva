import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';

export interface AppNotification {
  id: string;
  profileId: string;
  title: string;
  message: string;
  type: 'task' | 'mission' | 'achievement' | 'savings' | 'streak' | 'class' | 'reward' | 'vault';
  read: boolean;
  urgent: boolean;
  metadata: Record<string, unknown>;
  createdAt: string;
}

interface ApiNotification {
  id: string;
  profile_id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  urgent: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
}

function mapNotification(row: ApiNotification): AppNotification {
  return {
    id: row.id,
    profileId: row.profile_id,
    title: row.title,
    message: row.message,
    type: row.type as AppNotification['type'],
    read: row.read,
    urgent: row.urgent ?? false,
    metadata: row.metadata ?? {},
    createdAt: row.created_at,
  };
}

export function useNotifications() {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ['notifications', user?.profileId],
    queryFn: async () => {
      if (!user?.profileId) return [];
      const data = await api.get<{ data: ApiNotification[] }>('/notifications');
      return (data.data ?? []).map(mapNotification);
    },
    enabled: !!user?.profileId,
    refetchInterval: 30000,
  });

  return query;
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (notifId: string) => {
      await api.patch(`/notifications/${notifId}/read`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await api.post('/notifications/mark-all-read');
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
}

export function useDeleteNotification() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (notifId: string) => {
      await api.delete(`/notifications/${notifId}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
}

// createNotification moved to src/lib/notify.ts — re-export for backward compat
export { createNotification } from '@/lib/notify';
