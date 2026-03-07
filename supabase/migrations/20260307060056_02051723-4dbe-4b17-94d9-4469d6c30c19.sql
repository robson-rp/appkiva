CREATE TABLE public.currency_exchange_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  base_currency text NOT NULL DEFAULT 'EUR',
  target_currency text NOT NULL,
  rate numeric NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(base_currency, target_currency)
);

ALTER TABLE public.currency_exchange_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view exchange rates"
  ON public.currency_exchange_rates FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Admins can manage exchange rates"
  ON public.currency_exchange_rates FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));