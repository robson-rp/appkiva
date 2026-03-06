
-- Phase 1: Multi-Tenant Foundation

-- 1. Enums
CREATE TYPE public.tenant_type AS ENUM ('family', 'school', 'institutional_partner');
CREATE TYPE public.subscription_tier_type AS ENUM ('free', 'family_premium', 'school_institutional', 'partner_program');

-- 2. Subscription tiers table
CREATE TABLE public.subscription_tiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  tier_type subscription_tier_type NOT NULL DEFAULT 'free',
  max_children integer NOT NULL DEFAULT 5,
  max_classrooms integer NOT NULL DEFAULT 0,
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  price_monthly numeric NOT NULL DEFAULT 0,
  price_yearly numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Tenants table
CREATE TABLE public.tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  tenant_type tenant_type NOT NULL DEFAULT 'family',
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  currency text NOT NULL DEFAULT 'USD',
  subscription_tier_id uuid REFERENCES public.subscription_tiers(id),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 4. Add tenant_id to households and profiles (nullable for migration)
ALTER TABLE public.households ADD COLUMN tenant_id uuid REFERENCES public.tenants(id);
ALTER TABLE public.profiles ADD COLUMN tenant_id uuid REFERENCES public.tenants(id);

-- 5. Updated_at triggers
CREATE TRIGGER update_subscription_tiers_updated_at
  BEFORE UPDATE ON public.subscription_tiers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tenants_updated_at
  BEFORE UPDATE ON public.tenants
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6. RLS on subscription_tiers
ALTER TABLE public.subscription_tiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active tiers"
  ON public.subscription_tiers FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage tiers"
  ON public.subscription_tiers FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 7. RLS on tenants
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all tenants"
  ON public.tenants FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own tenant"
  ON public.tenants FOR SELECT
  TO authenticated
  USING (id IN (
    SELECT p.tenant_id FROM public.profiles p WHERE p.user_id = auth.uid()
  ));

-- 8. Seed default subscription tiers
INSERT INTO public.subscription_tiers (name, tier_type, max_children, max_classrooms, features, price_monthly, price_yearly, currency) VALUES
  ('Free', 'free', 3, 0, '["basic_wallet", "basic_tasks", "basic_rewards"]'::jsonb, 0, 0, 'USD'),
  ('Family Premium', 'family_premium', 10, 0, '["basic_wallet", "basic_tasks", "basic_rewards", "savings_vaults", "dream_vaults", "analytics", "custom_rewards"]'::jsonb, 4.99, 49.99, 'USD'),
  ('School Institutional', 'school_institutional', 200, 20, '["basic_wallet", "basic_tasks", "basic_rewards", "classroom_mode", "teacher_dashboard", "bulk_management", "analytics"]'::jsonb, 29.99, 299.99, 'USD'),
  ('Partner Program', 'partner_program', 1000, 100, '["basic_wallet", "basic_tasks", "basic_rewards", "savings_vaults", "dream_vaults", "classroom_mode", "teacher_dashboard", "bulk_management", "analytics", "custom_rewards", "api_access", "white_label"]'::jsonb, 99.99, 999.99, 'USD');

-- 9. Add admin-only policy for profiles to allow admins to view all profiles
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
