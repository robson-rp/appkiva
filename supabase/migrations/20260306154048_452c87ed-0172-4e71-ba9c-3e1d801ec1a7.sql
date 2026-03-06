
-- Partner Programs: links a partner tenant to sponsored families/schools
CREATE TABLE public.partner_programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  target_tenant_id uuid REFERENCES public.tenants(id) ON DELETE SET NULL,
  target_household_id uuid REFERENCES public.households(id) ON DELETE SET NULL,
  program_name text NOT NULL,
  program_type text NOT NULL DEFAULT 'family', -- 'family' or 'school'
  status text NOT NULL DEFAULT 'active', -- 'active', 'pending', 'inactive'
  children_count integer NOT NULL DEFAULT 0,
  investment_amount numeric NOT NULL DEFAULT 0,
  started_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Sponsored Challenges: challenges created by partner for their programs
CREATE TABLE public.sponsored_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'draft', -- 'draft', 'active', 'completed'
  participants_count integer NOT NULL DEFAULT 0,
  completion_rate numeric NOT NULL DEFAULT 0,
  start_date date NOT NULL,
  end_date date NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.partner_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsored_challenges ENABLE ROW LEVEL SECURITY;

-- RLS: Partners can view their own programs
CREATE POLICY "Partners can view own programs"
  ON public.partner_programs FOR SELECT
  USING (partner_tenant_id IN (
    SELECT p.tenant_id FROM profiles p WHERE p.user_id = auth.uid()
  ));

-- RLS: Partners can insert programs
CREATE POLICY "Partners can insert programs"
  ON public.partner_programs FOR INSERT
  WITH CHECK (
    partner_tenant_id IN (
      SELECT p.tenant_id FROM profiles p WHERE p.user_id = auth.uid()
    )
    AND has_role(auth.uid(), 'partner'::app_role)
  );

-- RLS: Partners can update own programs
CREATE POLICY "Partners can update own programs"
  ON public.partner_programs FOR UPDATE
  USING (
    partner_tenant_id IN (
      SELECT p.tenant_id FROM profiles p WHERE p.user_id = auth.uid()
    )
    AND has_role(auth.uid(), 'partner'::app_role)
  );

-- RLS: Partners can delete own programs
CREATE POLICY "Partners can delete own programs"
  ON public.partner_programs FOR DELETE
  USING (
    partner_tenant_id IN (
      SELECT p.tenant_id FROM profiles p WHERE p.user_id = auth.uid()
    )
    AND has_role(auth.uid(), 'partner'::app_role)
  );

-- RLS: Admins can view all programs
CREATE POLICY "Admins can view all programs"
  ON public.partner_programs FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Sponsored Challenges RLS
CREATE POLICY "Partners can view own challenges"
  ON public.sponsored_challenges FOR SELECT
  USING (partner_tenant_id IN (
    SELECT p.tenant_id FROM profiles p WHERE p.user_id = auth.uid()
  ));

CREATE POLICY "Partners can insert challenges"
  ON public.sponsored_challenges FOR INSERT
  WITH CHECK (
    partner_tenant_id IN (
      SELECT p.tenant_id FROM profiles p WHERE p.user_id = auth.uid()
    )
    AND has_role(auth.uid(), 'partner'::app_role)
  );

CREATE POLICY "Partners can update own challenges"
  ON public.sponsored_challenges FOR UPDATE
  USING (
    partner_tenant_id IN (
      SELECT p.tenant_id FROM profiles p WHERE p.user_id = auth.uid()
    )
    AND has_role(auth.uid(), 'partner'::app_role)
  );

CREATE POLICY "Partners can delete own challenges"
  ON public.sponsored_challenges FOR DELETE
  USING (
    partner_tenant_id IN (
      SELECT p.tenant_id FROM profiles p WHERE p.user_id = auth.uid()
    )
    AND has_role(auth.uid(), 'partner'::app_role)
  );

CREATE POLICY "Admins can view all challenges"
  ON public.sponsored_challenges FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Updated_at triggers
CREATE TRIGGER update_partner_programs_updated_at
  BEFORE UPDATE ON public.partner_programs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sponsored_challenges_updated_at
  BEFORE UPDATE ON public.sponsored_challenges
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
