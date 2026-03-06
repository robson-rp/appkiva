
-- Phase 4: Risk Monitoring - Full creation
DO $$ BEGIN
  CREATE TYPE public.risk_flag_type AS ENUM (
    'excessive_rewards', 'unusual_transactions', 'rate_limit_hit', 'task_exploitation'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.risk_severity AS ENUM ('low', 'medium', 'high', 'critical');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.risk_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id),
  profile_id uuid REFERENCES public.profiles(id),
  flag_type public.risk_flag_type NOT NULL,
  severity public.risk_severity NOT NULL DEFAULT 'low',
  description text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  resolved_at timestamptz,
  resolved_by uuid REFERENCES public.profiles(id),
  resolution_notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.risk_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view risk flags"
  ON public.risk_flags FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage risk flags"
  ON public.risk_flags FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.check_anomalies()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _count1 integer := 0;
  _count2 integer := 0;
BEGIN
  INSERT INTO public.risk_flags (profile_id, flag_type, severity, description, metadata)
  SELECT
    le.created_by,
    'excessive_rewards'::public.risk_flag_type,
    'high'::public.risk_severity,
    'More than 10 rewards claimed in 24 hours',
    jsonb_build_object('count', count(*), 'period', '24h')
  FROM public.ledger_entries le
  WHERE le.entry_type IN ('task_reward', 'mission_reward')
    AND le.created_at > now() - interval '24 hours'
  GROUP BY le.created_by
  HAVING count(*) > 10;
  GET DIAGNOSTICS _count1 = ROW_COUNT;

  INSERT INTO public.risk_flags (profile_id, flag_type, severity, description, metadata)
  SELECT
    recent.created_by,
    'unusual_transactions'::public.risk_flag_type,
    'medium'::public.risk_severity,
    'Transaction amount exceeds 3x historical average',
    jsonb_build_object('amount', recent.amount, 'avg', avg_amounts.avg_amount)
  FROM public.ledger_entries recent
  JOIN (
    SELECT created_by, avg(amount) as avg_amount
    FROM public.ledger_entries
    WHERE created_at > now() - interval '30 days'
    GROUP BY created_by
    HAVING avg(amount) > 0
  ) avg_amounts ON recent.created_by = avg_amounts.created_by
  WHERE recent.created_at > now() - interval '1 hour'
    AND recent.amount > avg_amounts.avg_amount * 3;
  GET DIAGNOSTICS _count2 = ROW_COUNT;

  RETURN _count1 + _count2;
END;
$$;

CREATE INDEX idx_risk_flags_created_at ON public.risk_flags(created_at DESC);
CREATE INDEX idx_risk_flags_severity ON public.risk_flags(severity);
CREATE INDEX idx_risk_flags_resolved ON public.risk_flags(resolved_at) WHERE resolved_at IS NULL;
