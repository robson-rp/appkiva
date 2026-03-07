
-- Add new columns to profiles
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS gender text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS institution_name text,
  ADD COLUMN IF NOT EXISTS sector text,
  ADD COLUMN IF NOT EXISTS school_tenant_id uuid REFERENCES public.tenants(id);

-- Create family_invite_codes table
CREATE TABLE IF NOT EXISTS public.family_invite_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  household_id uuid NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  parent_profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '48 hours'),
  used_by uuid REFERENCES public.profiles(id),
  used_at timestamp with time zone
);

ALTER TABLE public.family_invite_codes ENABLE ROW LEVEL SECURITY;

-- Parents can create invite codes
CREATE POLICY "Parents can create invite codes"
  ON public.family_invite_codes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    parent_profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    AND has_role(auth.uid(), 'parent'::app_role)
  );

-- Parents can view their own invite codes
CREATE POLICY "Parents can view own invite codes"
  ON public.family_invite_codes
  FOR SELECT
  TO authenticated
  USING (
    parent_profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

-- Anyone authenticated can read codes (for validation during signup)
CREATE POLICY "Authenticated can read codes for validation"
  ON public.family_invite_codes
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow updating used_by/used_at when claiming a code  
CREATE POLICY "System can mark codes as used"
  ON public.family_invite_codes
  FOR UPDATE
  TO authenticated
  WITH CHECK (true);

-- Update handle_new_user trigger to store new fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  _role text;
  _country text;
  _gender text;
  _phone text;
  _institution_name text;
  _sector text;
  _school_tenant_id uuid;
BEGIN
  _country := COALESCE(NEW.raw_user_meta_data->>'country', 'AO');
  _gender := NEW.raw_user_meta_data->>'gender';
  _phone := COALESCE(NEW.phone, NEW.raw_user_meta_data->>'phone');
  _institution_name := NEW.raw_user_meta_data->>'institution_name';
  _sector := NEW.raw_user_meta_data->>'sector';
  
  IF NEW.raw_user_meta_data->>'school_tenant_id' IS NOT NULL THEN
    _school_tenant_id := (NEW.raw_user_meta_data->>'school_tenant_id')::uuid;
  END IF;

  INSERT INTO public.profiles (user_id, display_name, avatar, country, gender, phone, institution_name, sector, school_tenant_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email, NEW.phone, 'Utilizador'),
    COALESCE(NEW.raw_user_meta_data->>'avatar', '👤'),
    _country,
    _gender,
    _phone,
    _institution_name,
    _sector,
    _school_tenant_id
  );

  _role := NEW.raw_user_meta_data->>'role';
  IF _role IS NOT NULL AND _role IN ('parent', 'child', 'teen', 'teacher', 'admin', 'partner') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, _role::app_role);
  END IF;

  RETURN NEW;
END;
$function$;

-- Create a function to validate and claim an invite code
CREATE OR REPLACE FUNCTION public.validate_invite_code(_code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  _invite record;
BEGIN
  SELECT * INTO _invite
  FROM family_invite_codes
  WHERE code = upper(_code)
    AND used_by IS NULL
    AND expires_at > now();

  IF NOT FOUND THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Código inválido ou expirado');
  END IF;

  RETURN jsonb_build_object(
    'valid', true,
    'household_id', _invite.household_id,
    'parent_profile_id', _invite.parent_profile_id,
    'code_id', _invite.id
  );
END;
$function$;

-- Create a function to claim an invite code after signup
CREATE OR REPLACE FUNCTION public.claim_invite_code(_code text, _profile_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  _invite record;
BEGIN
  SELECT * INTO _invite
  FROM family_invite_codes
  WHERE code = upper(_code)
    AND used_by IS NULL
    AND expires_at > now();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid or expired invite code';
  END IF;

  -- Mark code as used
  UPDATE family_invite_codes
  SET used_by = _profile_id, used_at = now()
  WHERE id = _invite.id;

  -- Get parent's tenant_id
  DECLARE
    _parent_tenant_id uuid;
  BEGIN
    SELECT tenant_id INTO _parent_tenant_id
    FROM profiles WHERE id = _invite.parent_profile_id;

    -- Update the child's profile with household and tenant
    UPDATE profiles
    SET household_id = _invite.household_id,
        tenant_id = _parent_tenant_id
    WHERE id = _profile_id;
  END;
END;
$function$;
