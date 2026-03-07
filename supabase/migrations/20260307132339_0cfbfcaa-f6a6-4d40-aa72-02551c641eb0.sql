ALTER TABLE public.onboarding_steps
  ADD COLUMN visible_from timestamptz DEFAULT NULL,
  ADD COLUMN visible_until timestamptz DEFAULT NULL;