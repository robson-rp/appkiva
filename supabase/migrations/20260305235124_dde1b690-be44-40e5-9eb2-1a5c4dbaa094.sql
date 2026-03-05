
-- Savings Vaults (cofres de poupança com juros)
CREATE TABLE public.savings_vaults (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  household_id uuid REFERENCES public.households(id),
  name text NOT NULL,
  icon text NOT NULL DEFAULT '🐷',
  target_amount numeric NOT NULL DEFAULT 0,
  current_amount numeric NOT NULL DEFAULT 0,
  interest_rate numeric NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.savings_vaults ENABLE ROW LEVEL SECURITY;

-- Children can view their own vaults
CREATE POLICY "Children can view own vaults" ON public.savings_vaults
  FOR SELECT TO authenticated
  USING (
    profile_id IN (SELECT p.id FROM profiles p WHERE p.user_id = auth.uid())
    OR household_id = get_user_household_id(auth.uid())
  );

-- Children can create their own vaults
CREATE POLICY "Users can create own vaults" ON public.savings_vaults
  FOR INSERT TO authenticated
  WITH CHECK (
    profile_id IN (SELECT p.id FROM profiles p WHERE p.user_id = auth.uid())
    OR has_role(auth.uid(), 'parent')
  );

-- Users can update own vaults, parents can update household vaults
CREATE POLICY "Users can update own vaults" ON public.savings_vaults
  FOR UPDATE TO authenticated
  USING (
    profile_id IN (SELECT p.id FROM profiles p WHERE p.user_id = auth.uid())
    OR (household_id = get_user_household_id(auth.uid()) AND has_role(auth.uid(), 'parent'))
  );

-- Parents can delete household vaults
CREATE POLICY "Parents can delete vaults" ON public.savings_vaults
  FOR DELETE TO authenticated
  USING (
    household_id = get_user_household_id(auth.uid()) AND has_role(auth.uid(), 'parent')
  );

-- Dream Vaults (cofre dos sonhos / vision board)
CREATE TABLE public.dream_vaults (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  household_id uuid REFERENCES public.households(id),
  title text NOT NULL,
  description text,
  icon text NOT NULL DEFAULT '✨',
  target_amount numeric NOT NULL DEFAULT 0,
  current_amount numeric NOT NULL DEFAULT 0,
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.dream_vaults ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own dream vaults" ON public.dream_vaults
  FOR SELECT TO authenticated
  USING (
    profile_id IN (SELECT p.id FROM profiles p WHERE p.user_id = auth.uid())
    OR household_id = get_user_household_id(auth.uid())
  );

CREATE POLICY "Users can create own dream vaults" ON public.dream_vaults
  FOR INSERT TO authenticated
  WITH CHECK (
    profile_id IN (SELECT p.id FROM profiles p WHERE p.user_id = auth.uid())
    OR has_role(auth.uid(), 'parent')
  );

CREATE POLICY "Users can update own dream vaults" ON public.dream_vaults
  FOR UPDATE TO authenticated
  USING (
    profile_id IN (SELECT p.id FROM profiles p WHERE p.user_id = auth.uid())
    OR (household_id = get_user_household_id(auth.uid()) AND has_role(auth.uid(), 'parent'))
  );

CREATE POLICY "Parents can delete dream vaults" ON public.dream_vaults
  FOR DELETE TO authenticated
  USING (
    household_id = get_user_household_id(auth.uid()) AND has_role(auth.uid(), 'parent')
  );

-- Dream Vault Comments (mensagens dos pais)
CREATE TABLE public.dream_vault_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dream_vault_id uuid NOT NULL REFERENCES public.dream_vaults(id) ON DELETE CASCADE,
  parent_profile_id uuid NOT NULL REFERENCES public.profiles(id),
  text text NOT NULL,
  emoji text DEFAULT '💬',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.dream_vault_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Household can view dream comments" ON public.dream_vault_comments
  FOR SELECT TO authenticated
  USING (
    dream_vault_id IN (
      SELECT dv.id FROM dream_vaults dv
      WHERE dv.household_id = get_user_household_id(auth.uid())
        OR dv.profile_id IN (SELECT p.id FROM profiles p WHERE p.user_id = auth.uid())
    )
  );

CREATE POLICY "Parents can create dream comments" ON public.dream_vault_comments
  FOR INSERT TO authenticated
  WITH CHECK (
    has_role(auth.uid(), 'parent')
    AND parent_profile_id IN (SELECT p.id FROM profiles p WHERE p.user_id = auth.uid())
  );

-- Triggers for updated_at
CREATE TRIGGER update_savings_vaults_updated_at BEFORE UPDATE ON public.savings_vaults
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dream_vaults_updated_at BEFORE UPDATE ON public.dream_vaults
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
