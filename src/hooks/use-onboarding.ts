import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ONBOARDING_STEPS } from '@/data/onboarding-steps';
import { useCallback, useRef } from 'react';

function trackEvent(profileId: string, role: string, eventType: string, stepIndex: number, metadata?: Record<string, unknown>) {
  supabase
    .from('onboarding_analytics' as any)
    .insert({ profile_id: profileId, event_type: eventType, step_index: stepIndex, role, metadata: metadata ?? {} })
    .then(); // fire-and-forget
}

export function useOnboarding() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const profileId = user?.profileId;
  const role = user?.role;
  const steps = role ? ONBOARDING_STEPS[role] : [];
  const trackedSteps = useRef<Set<number>>(new Set());

  const { data: progress, isLoading } = useQuery({
    queryKey: ['onboarding', profileId],
    queryFn: async () => {
      if (!profileId) return null;
      const { data, error } = await supabase
        .from('onboarding_progress')
        .select('*')
        .eq('profile_id', profileId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!profileId,
  });

  const upsertProgress = useMutation({
    mutationFn: async (values: Record<string, unknown>) => {
      if (!profileId) return;
      const { error } = await supabase
        .from('onboarding_progress')
        .upsert({ profile_id: profileId, ...values }, { onConflict: 'profile_id' });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['onboarding', profileId] }),
  });

  const showOnboarding = !isLoading && !!profileId && !progress?.completed && !progress?.skipped;
  const currentStep = progress?.current_step ?? 0;

  // Track step view (once per step per session)
  const trackView = useCallback((step: number) => {
    if (!profileId || !role || trackedSteps.current.has(step)) return;
    trackedSteps.current.add(step);
    trackEvent(profileId, role, 'view', step);
  }, [profileId, role]);

  const nextStep = useCallback(() => {
    const next = currentStep + 1;
    if (next >= steps.length) {
      if (profileId && role) {
        trackEvent(profileId, role, 'complete', currentStep, { total_steps: steps.length });
      }
      upsertProgress.mutate({ completed: true, completed_at: new Date().toISOString(), current_step: next });
    } else {
      upsertProgress.mutate({ current_step: next });
    }
  }, [currentStep, steps.length, profileId, role, upsertProgress]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      upsertProgress.mutate({ current_step: currentStep - 1 });
    }
  }, [currentStep, upsertProgress]);

  const skipWalkthrough = useCallback(() => {
    if (profileId && role) {
      trackEvent(profileId, role, 'skip', currentStep, { total_steps: steps.length });
    }
    upsertProgress.mutate({ skipped: true, current_step: currentStep });
  }, [currentStep, steps.length, profileId, role, upsertProgress]);

  const resetWalkthrough = useCallback(() => {
    trackedSteps.current.clear();
    upsertProgress.mutate({ completed: false, skipped: false, current_step: 0, completed_at: null });
  }, [upsertProgress]);

  return {
    showOnboarding,
    currentStep,
    totalSteps: steps.length,
    steps,
    isLoading,
    nextStep,
    prevStep,
    skipWalkthrough,
    resetWalkthrough,
    trackView,
  };
}
