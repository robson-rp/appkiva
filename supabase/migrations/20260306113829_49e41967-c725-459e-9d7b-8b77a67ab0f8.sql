
-- Phase 2: Currency Localization

-- 1. Supported currencies table
CREATE TABLE public.supported_currencies (
  code text PRIMARY KEY,
  name text NOT NULL,
  symbol text NOT NULL,
  decimal_places integer NOT NULL DEFAULT 2,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.supported_currencies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active currencies"
  ON public.supported_currencies FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage currencies"
  ON public.supported_currencies FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 2. Seed currencies
INSERT INTO public.supported_currencies (code, name, symbol, decimal_places) VALUES
  ('USD', 'US Dollar', '$', 2),
  ('AOA', 'Kwanza Angolano', 'Kz', 2),
  ('NGN', 'Naira Nigeriana', '₦', 2),
  ('KES', 'Xelim Queniano', 'KSh', 2),
  ('PKR', 'Rupia Paquistanesa', '₨', 2);

-- 3. Add real_money_enabled to tenants
ALTER TABLE public.tenants ADD COLUMN real_money_enabled boolean NOT NULL DEFAULT false;
