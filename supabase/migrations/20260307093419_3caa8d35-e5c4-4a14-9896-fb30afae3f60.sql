
-- Table for program invitations (shareable link codes)
CREATE TABLE public.program_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid NOT NULL REFERENCES public.partner_programs(id) ON DELETE CASCADE,
  partner_tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  code text NOT NULL UNIQUE,
  target_type text NOT NULL DEFAULT 'family' CHECK (target_type IN ('family', 'school')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
  accepted_by uuid REFERENCES public.profiles(id),
  accepted_at timestamptz,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.program_invitations ENABLE ROW LEVEL SECURITY;

-- Partners can create invitations for their programs
CREATE POLICY "Partners can insert invitations"
ON public.program_invitations FOR INSERT TO authenticated
WITH CHECK (
  partner_tenant_id IN (SELECT p.tenant_id FROM profiles p WHERE p.user_id = auth.uid())
  AND has_role(auth.uid(), 'partner'::app_role)
);

-- Partners can view their invitations
CREATE POLICY "Partners can view own invitations"
ON public.program_invitations FOR SELECT TO authenticated
USING (
  partner_tenant_id IN (SELECT p.tenant_id FROM profiles p WHERE p.user_id = auth.uid())
);

-- Partners can delete their invitations
CREATE POLICY "Partners can delete own invitations"
ON public.program_invitations FOR DELETE TO authenticated
USING (
  partner_tenant_id IN (SELECT p.tenant_id FROM profiles p WHERE p.user_id = auth.uid())
  AND has_role(auth.uid(), 'partner'::app_role)
);

-- Parents and teachers can view invitations (to accept them)
CREATE POLICY "Parents can view pending invitations"
ON public.program_invitations FOR SELECT TO authenticated
USING (
  status = 'pending'
  AND (has_role(auth.uid(), 'parent'::app_role) OR has_role(auth.uid(), 'teacher'::app_role))
);

-- Parents and teachers can update invitations (to accept/reject)
CREATE POLICY "Users can accept invitations"
ON public.program_invitations FOR UPDATE TO authenticated
USING (
  status = 'pending'
  AND (has_role(auth.uid(), 'parent'::app_role) OR has_role(auth.uid(), 'teacher'::app_role))
);

-- Function to validate a program invitation code
CREATE OR REPLACE FUNCTION public.validate_program_invite(_code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _invite record;
  _program record;
  _partner_name text;
BEGIN
  SELECT * INTO _invite
  FROM program_invitations
  WHERE code = upper(_code)
    AND status = 'pending'
    AND expires_at > now();

  IF NOT FOUND THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Convite inválido ou expirado');
  END IF;

  SELECT * INTO _program FROM partner_programs WHERE id = _invite.program_id;
  SELECT name INTO _partner_name FROM tenants WHERE id = _invite.partner_tenant_id;

  RETURN jsonb_build_object(
    'valid', true,
    'invitation_id', _invite.id,
    'program_name', _program.program_name,
    'partner_name', _partner_name,
    'target_type', _invite.target_type,
    'program_type', _program.program_type
  );
END;
$$;

-- Function to accept a program invitation
CREATE OR REPLACE FUNCTION public.accept_program_invitation(_code text, _profile_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _invite record;
  _profile record;
  _target_id uuid;
BEGIN
  SELECT * INTO _invite
  FROM program_invitations
  WHERE code = upper(_code)
    AND status = 'pending'
    AND expires_at > now();

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Convite inválido ou expirado');
  END IF;

  SELECT * INTO _profile FROM profiles WHERE id = _profile_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Perfil não encontrado');
  END IF;

  -- Mark invitation as accepted
  UPDATE program_invitations
  SET status = 'accepted', accepted_by = _profile_id, accepted_at = now()
  WHERE id = _invite.id;

  -- Link program to the household or school tenant
  IF _invite.target_type = 'family' THEN
    UPDATE partner_programs
    SET target_household_id = _profile.household_id
    WHERE id = _invite.program_id AND target_household_id IS NULL;
  ELSE
    UPDATE partner_programs
    SET target_tenant_id = _profile.school_tenant_id
    WHERE id = _invite.program_id AND target_tenant_id IS NULL;
  END IF;

  RETURN jsonb_build_object('success', true);
END;
$$;

-- Updated_at trigger
CREATE TRIGGER update_program_invitations_updated_at
  BEFORE UPDATE ON public.program_invitations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
