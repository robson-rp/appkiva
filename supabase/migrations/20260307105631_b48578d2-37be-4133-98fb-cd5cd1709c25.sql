
-- 1. Add is_system flag to wallets
ALTER TABLE public.wallets ADD COLUMN IF NOT EXISTS is_system boolean NOT NULL DEFAULT false;

-- 2. Create the system wallet (no profile needed)
-- We need to allow nullable profile_id for system wallet
-- Instead, create a dedicated system_wallet config table
CREATE TABLE IF NOT EXISTS public.system_config (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage system config"
  ON public.system_config FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 3. Create helper function to get system wallet id
-- System wallet will be identified by is_system = true
CREATE OR REPLACE FUNCTION public.get_system_wallet_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT id FROM wallets
  WHERE is_system = true
    AND wallet_type = 'virtual'
    AND currency = 'KVC'
  LIMIT 1
$$;

-- 4. Create money supply audit function
CREATE OR REPLACE FUNCTION public.get_money_supply_stats()
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _system_wallet_id uuid;
  _total_emitted numeric;
  _total_burned numeric;
  _total_in_circulation numeric;
  _total_in_wallets numeric;
  _total_in_vaults numeric;
  _wallet_count integer;
BEGIN
  SELECT get_system_wallet_id() INTO _system_wallet_id;

  IF _system_wallet_id IS NULL THEN
    RETURN jsonb_build_object('error', 'System wallet not found');
  END IF;

  SELECT COALESCE(SUM(amount), 0) INTO _total_emitted
  FROM ledger_entries
  WHERE debit_wallet_id = _system_wallet_id
    AND (approved_at IS NOT NULL OR requires_approval = false);

  SELECT COALESCE(SUM(amount), 0) INTO _total_burned
  FROM ledger_entries
  WHERE credit_wallet_id = _system_wallet_id
    AND (approved_at IS NOT NULL OR requires_approval = false);

  _total_in_circulation := _total_emitted - _total_burned;

  SELECT COALESCE(SUM(balance), 0), COUNT(*)
  INTO _total_in_wallets, _wallet_count
  FROM wallet_balances
  WHERE wallet_id != _system_wallet_id;

  SELECT COALESCE(SUM(current_amount), 0) INTO _total_in_vaults
  FROM savings_vaults;

  RETURN jsonb_build_object(
    'total_emitted', _total_emitted,
    'total_burned', _total_burned,
    'total_in_circulation', _total_in_circulation,
    'total_in_wallets', _total_in_wallets,
    'total_in_vaults', _total_in_vaults,
    'wallet_count', _wallet_count,
    'system_wallet_id', _system_wallet_id,
    'audit_timestamp', now()
  );
END;
$$;
