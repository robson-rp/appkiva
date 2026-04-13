import { useEffect, useRef } from 'react';
import { api } from '@/lib/api-client';

/**
 * Records daily activity for streak tracking.
 * Calls the API once per session when profileId is available.
 */
export function useRecordDailyActivity(profileId: string | null | undefined) {
  const recorded = useRef(false);

  useEffect(() => {
    if (!profileId || recorded.current) return;
    recorded.current = true;

    api
      .post('/streaks/activity', { profile_id: profileId })
      .catch((error) => {
        console.warn('[streak] Failed to record daily activity:', error.message);
      });
  }, [profileId]);
}
