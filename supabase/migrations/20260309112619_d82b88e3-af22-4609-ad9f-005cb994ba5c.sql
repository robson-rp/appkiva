
-- Auth events logging table
CREATE TABLE public.auth_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  email text,
  user_id uuid,
  ip_address text,
  user_agent text,
  metadata jsonb DEFAULT '{}'::jsonb,
  risk_level text NOT NULL DEFAULT 'low',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_auth_events_email_type ON public.auth_events (email, event_type, created_at);
CREATE INDEX idx_auth_events_created ON public.auth_events (created_at DESC);

ALTER TABLE public.auth_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view auth events"
  ON public.auth_events FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Login lockouts table for brute-force protection
CREATE TABLE public.login_lockouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  failed_attempts int NOT NULL DEFAULT 0,
  lockout_count int NOT NULL DEFAULT 0,
  locked_until timestamptz,
  last_attempt_at timestamptz DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(email)
);

ALTER TABLE public.login_lockouts ENABLE ROW LEVEL SECURITY;
-- No client access policies — only service-role edge functions
