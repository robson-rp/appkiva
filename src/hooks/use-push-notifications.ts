import { useState, useCallback } from 'react';
import { api } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';

const VAPID_PUBLIC_KEY_STORAGE = 'kivara-vapid-public';

export function usePushNotifications() {
  const { user } = useAuth();
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );
  const [loading, setLoading] = useState(false);

  const isSupported = typeof window !== 'undefined' && 'PushManager' in window && 'serviceWorker' in navigator;

  const subscribe = useCallback(async () => {
    if (!isSupported || !user?.profileId) return false;
    setLoading(true);

    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== 'granted') return false;

      // Fetch VAPID public key from backend
      const { data: keyData } = await api.get('/push/vapid-key');

      if (!keyData?.vapid_public_key) {
        console.error('VAPID public key not available');
        return false;
      }

      const reg = await navigator.serviceWorker.ready;
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(keyData.vapid_public_key),
      });

      const subJson = subscription.toJSON();

      await api.post('/push/subscriptions', {
        endpoint: subJson.endpoint!,
        p256dh: subJson.keys!.p256dh,
        auth: subJson.keys!.auth,
      });
      return true;
    } catch (e) {
      console.error('Push subscription failed:', e);
      return false;
    } finally {
      setLoading(false);
    }
  }, [isSupported, user?.profileId]);

  return { isSupported, permission, subscribe, loading };
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; ++i) output[i] = raw.charCodeAt(i);
  return output;
}
