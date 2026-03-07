CREATE TABLE public.onboarding_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_type text NOT NULL, -- 'view', 'skip', 'complete'
  step_index integer NOT NULL DEFAULT 0,
  role text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.onboarding_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own analytics"
  ON public.onboarding_analytics FOR INSERT
  WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins can view all analytics"
  ON public.onboarding_analytics FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_onboarding_analytics_profile ON public.onboarding_analytics(profile_id);
CREATE INDEX idx_onboarding_analytics_event ON public.onboarding_analytics(event_type);