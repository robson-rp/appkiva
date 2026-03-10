
CREATE TABLE public.subscription_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  tier_id uuid NOT NULL REFERENCES subscription_tiers(id),
  amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  billing_period text NOT NULL DEFAULT 'monthly',
  status text NOT NULL DEFAULT 'pending',
  due_date date NOT NULL,
  paid_at timestamptz,
  payment_method text,
  payment_reference text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.subscription_invoices ENABLE ROW LEVEL SECURITY;

-- Parents can see invoices for their tenant
CREATE POLICY "Users can view own tenant invoices"
ON public.subscription_invoices FOR SELECT
TO authenticated
USING (
  tenant_id IN (
    SELECT p.tenant_id FROM profiles p WHERE p.user_id = auth.uid()
  )
);

-- Admins can view all invoices
CREATE POLICY "Admins can view all invoices"
ON public.subscription_invoices FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Only system (service role) can insert/update invoices
CREATE POLICY "Service role manages invoices"
ON public.subscription_invoices FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.subscription_invoices;
