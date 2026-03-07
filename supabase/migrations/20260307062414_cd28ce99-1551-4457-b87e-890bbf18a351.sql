-- Allow parents to update their own tenant's currency via a security definer function
CREATE OR REPLACE FUNCTION public.update_tenant_currency(_tenant_id uuid, _currency text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify the caller owns this tenant (their profile has this tenant_id)
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid() AND tenant_id = _tenant_id
  ) THEN
    RAISE EXCEPTION 'Not authorized to update this tenant';
  END IF;

  UPDATE tenants SET currency = _currency WHERE id = _tenant_id;
END;
$$;