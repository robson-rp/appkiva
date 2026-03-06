import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

export interface AppNotification {
  id: string;
  profileId: string;
  title: string;
  message: string;
  type: 'task' | 'mission' | 'achievement' | 'savings' | 'streak' | 'class' | 'reward' | 'vault';
  read: boolean;
  urgent: boolean;
  metadata: Record<string, any>;
  createdAt: string;
}

function mapRow(row: any): AppNotification {
  return {
    id: row.id,
    profileId: row.profile_id,
    title: row.title,
    message: row.message,
    type: row.type,
    read: row.read,
    urgent: row.urgent ?? false,
    metadata: row.metadata ?? {},
    createdAt: row.created_at,
  };
}

export function useNotifications() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ['notifications', user?.profileId],
    queryFn: async () => {
      if (!user?.profileId) return [];
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('profile_id', user.profileId)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []).map(mapRow);
    },
    enabled: !!user?.profileId,
  });

  // Realtime subscription
  useEffect(() => {
    if (!user?.profileId) return;

    const channel = supabase
      .channel(`notifications-${user.profileId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `profile_id=eq.${user.profileId}`,
        },
        () => {
          qc.invalidateQueries({ queryKey: ['notifications', user.profileId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.profileId, qc]);

  return query;
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (notifId: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notifId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async () => {
      if (!user?.profileId) return;
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('profile_id', user.profileId)
        .eq('read', false);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
}

export function useDeleteNotification() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (notifId: string) => {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notifId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
}

/** Helper to create a notification (call from parent-side mutations) */
export async function createNotification(input: {
  profileId: string;
  title: string;
  message: string;
  type: string;
  urgent?: boolean;
  metadata?: Record<string, any>;
}) {
  const { error } = await supabase.from('notifications').insert({
    profile_id: input.profileId,
    title: input.title,
    message: input.message,
    type: input.type,
    urgent: input.urgent ?? false,
    metadata: input.metadata ?? {},
  });
  if (error) console.error('Failed to create notification:', error);
}
