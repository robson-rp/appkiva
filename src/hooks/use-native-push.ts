import { useEffect, useCallback, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useNativePush() {
  const { user } = useAuth();
  const [permissionGranted, setPermissionGranted] = useState(false);
  const isNative = Capacitor.isNativePlatform();

  const register = useCallback(async () => {
    if (!isNative || !user?.profileId) return false;

    try {
      const permResult = await PushNotifications.requestPermissions();
      if (permResult.receive !== 'granted') return false;

      await PushNotifications.register();
      setPermissionGranted(true);
      return true;
    } catch (e) {
      console.error('[native-push] Registration failed:', e);
      return false;
    }
  }, [isNative, user?.profileId]);

  useEffect(() => {
    if (!isNative || !user?.profileId) return;

    // Listen for token received
    const tokenListener = PushNotifications.addListener('registration', async (token) => {
      const platform = Capacitor.getPlatform() as 'ios' | 'android';
      
      // Upsert the device token
      await supabase.from('push_device_tokens' as any).upsert(
        {
          profile_id: user.profileId,
          platform,
          token: token.value,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'profile_id,token' }
      );
    });

    // Handle registration errors
    const errorListener = PushNotifications.addListener('registrationError', (err) => {
      console.error('[native-push] Registration error:', err);
    });

    // Handle incoming notifications when app is open
    const foregroundListener = PushNotifications.addListener(
      'pushNotificationReceived',
      (notification) => {
        console.log('[native-push] Foreground notification:', notification);
        // Could show an in-app toast here
      }
    );

    // Handle notification taps
    const actionListener = PushNotifications.addListener(
      'pushNotificationActionPerformed',
      (action) => {
        console.log('[native-push] Action performed:', action);
        // Could navigate to relevant page based on action.notification.data
      }
    );

    return () => {
      tokenListener.then(l => l.remove());
      errorListener.then(l => l.remove());
      foregroundListener.then(l => l.remove());
      actionListener.then(l => l.remove());
    };
  }, [isNative, user?.profileId]);

  return { isNative, permissionGranted, register };
}
