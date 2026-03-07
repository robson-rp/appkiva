
CREATE TABLE public.tier_regional_prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tier_id uuid NOT NULL REFERENCES public.subscription_tiers(id) ON DELETE CASCADE,
  currency_code text NOT NULL,
  price_monthly numeric NOT NULL DEFAULT 0,
  price_yearly numeric NOT NULL DEFAULT 0,
  extra_child_price numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tier_id, currency_code)
);

ALTER TABLE public.tier_regional_prices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage regional prices" ON public.tier_regional_prices
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view regional prices" ON public.tier_regional_prices
  FOR SELECT TO authenticated USING (true);

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.tier_regional_prices
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
