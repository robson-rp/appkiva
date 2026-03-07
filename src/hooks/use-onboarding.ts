import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ONBOARDING_STEPS } from '@/data/onboarding-steps';

export function useOnboarding() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const profileId = user?.profileId;
  const role = user?.role;
  const steps = role ? ONBOARDING_STEPS[role] : [];

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

  const nextStep = () => {
    const next = currentStep + 1;
    if (next >= steps.length) {
      upsertProgress.mutate({ completed: true, completed_at: new Date().toISOString(), current_step: next });
    } else {
      upsertProgress.mutate({ current_step: next });
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      upsertProgress.mutate({ current_step: currentStep - 1 });
    }
  };

  const skipWalkthrough = () => {
    upsertProgress.mutate({ skipped: true, current_step: currentStep });
  };

  const resetWalkthrough = () => {
    upsertProgress.mutate({ completed: false, skipped: false, current_step: 0, completed_at: null });
  };

  return {
    showOnboarding,
    currentStep,
    totalSteps: steps.length,
    steps,
    isLoading,
    nextStep,
    skipWalkthrough,
    resetWalkthrough,
  };
}
