import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';
import { ONBOARDING_STEPS, type OnboardingStep } from '@/data/onboarding-steps';
import { useCallback, useRef } from 'react';

interface OnboardingStepDB {
  title: string;
  description: string;
  illustration_key: string;
  cta?: string;
}

interface OnboardingProgress {
  profile_id: string;
  current_step: number;
  completed: boolean;
  skipped: boolean;
  completed_at: string | null;
}

export function useOnboarding() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const profileId = user?.profileId;
  const role = user?.role;
  const trackedSteps = useRef<Set<number>>(new Set());

  const { data: steps = [] } = useQuery({
    queryKey: ['onboarding-steps', role],
    queryFn: async () => {
      if (!role) return [];
      try {
        const res = await api.get<any>(`/admin/onboarding-steps?role=${role}`);
        const data = Array.isArray(res) ? res : (res?.data ?? []);
        
        if (!data || data.length === 0) {
          return ONBOARDING_STEPS[role] ?? [];
        }

        return data.map((row): OnboardingStep => ({
          title: row.title,
          description: row.description,
          illustrationKey: row.illustration_key,
          cta: row.cta ?? undefined,
        }));
      } catch (error) {
        return ONBOARDING_STEPS[role] ?? [];
      }
    },
    enabled: !!role,
  });

  const { data: progress, isLoading } = useQuery({
    queryKey: ['onboarding', profileId],
    queryFn: async () => {
      if (!profileId) return null;
      try {
        const res = await api.get<any>(`/onboarding/progress`);
        const data = res?.data ?? res;
        return data;
      } catch (error) {
        return null;
      }
    },
    enabled: !!profileId,
  });

  const upsertProgress = useMutation({
    mutationFn: async (values: Record<string, unknown>) => {
      if (!profileId) return;
      await api.put('/onboarding/progress', values);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['onboarding', profileId] }),
  });

  const showOnboarding = !isLoading && !!profileId && !progress?.completed && !progress?.skipped;
  const currentStep = progress?.current_step ?? 0;

  const trackView = useCallback((step: number) => {
    if (!profileId || !role || trackedSteps.current.has(step)) return;
    trackedSteps.current.add(step);
    api.post('/onboarding/analytics', {
      event_type: 'view',
      step_index: step,
      role,
      metadata: {},
    }).catch(() => {});
  }, [profileId, role]);

  const nextStep = useCallback(() => {
    const next = currentStep + 1;
    if (next >= steps.length) {
      if (profileId && role) {
        api.post('/onboarding/analytics', {
          event_type: 'complete',
          step_index: currentStep,
          role,
          metadata: { total_steps: steps.length },
        }).catch(() => {});
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
      api.post('/onboarding/analytics', {
        event_type: 'skip',
        step_index: currentStep,
        role,
        metadata: { total_steps: steps.length },
      }).catch(() => {});
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
