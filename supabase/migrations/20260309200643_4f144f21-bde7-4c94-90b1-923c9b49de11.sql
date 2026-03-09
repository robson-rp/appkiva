
-- 1. household_guardians table
CREATE TABLE public.household_guardians (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'primary' CHECK (role IN ('primary', 'secondary')),
  invited_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (household_id, profile_id)
);

ALTER TABLE public.household_guardians ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Household members can view guardians"
  ON public.household_guardians FOR SELECT TO authenticated
  USING (household_id = get_user_household_id(auth.uid()));

CREATE POLICY "Primary guardians can insert"
  ON public.household_guardians FOR INSERT TO authenticated
  WITH CHECK (
    household_id = get_user_household_id(auth.uid())
    AND has_role(auth.uid(), 'parent'::app_role)
  );

CREATE POLICY "Primary guardians can delete"
  ON public.household_guardians FOR DELETE TO authenticated
  USING (
    household_id = get_user_household_id(auth.uid())
    AND has_role(auth.uid(), 'parent'::app_role)
  );

-- 2. referral_codes table
CREATE TABLE public.referral_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  code text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own referral code"
  ON public.referral_codes FOR SELECT TO authenticated
  USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own referral code"
  ON public.referral_codes FOR INSERT TO authenticated
  WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- 3. referral_claims table
CREATE TABLE public.referral_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_code_id uuid NOT NULL REFERENCES public.referral_codes(id) ON DELETE CASCADE,
  referred_profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  bonus_awarded boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.referral_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own referral claims"
  ON public.referral_claims FOR SELECT TO authenticated
  USING (
    referral_code_id IN (
      SELECT id FROM referral_codes WHERE profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    )
    OR referred_profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

-- 4. Generate referral code function
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result text := '';
  i integer;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$;

-- 5. Auto-generate referral code on new profile (update handle_new_user)
CREATE OR REPLACE FUNCTION public.auto_create_referral_code()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _code text;
  _attempts int := 0;
BEGIN
  LOOP
    _code := generate_referral_code();
    BEGIN
      INSERT INTO referral_codes (profile_id, code) VALUES (NEW.id, _code);
      EXIT;
    EXCEPTION WHEN unique_violation THEN
      _attempts := _attempts + 1;
      IF _attempts > 10 THEN
        RAISE EXCEPTION 'Could not generate unique referral code';
      END IF;
    END;
  END LOOP;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_auto_referral_code
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_create_referral_code();

-- 6. Add max_guardians to subscription_tiers
ALTER TABLE public.subscription_tiers ADD COLUMN IF NOT EXISTS max_guardians integer NOT NULL DEFAULT 1;
