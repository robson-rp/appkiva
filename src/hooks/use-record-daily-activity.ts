import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Records daily activity for streak tracking.
 * Calls the DB function once per session when profileId is available.
 */
export function useRecordDailyActivity(profileId: string | null | undefined) {
  const recorded = useRef(false);

  useEffect(() => {
    if (!profileId || recorded.current) return;
    recorded.current = true;

    supabase
      .rpc('record_daily_activity', { _profile_id: profileId })
      .then(({ error }) => {
        if (error) {
          console.warn('[streak] Failed to record daily activity:', error.message);
        }
      });
  }, [profileId]);
}
