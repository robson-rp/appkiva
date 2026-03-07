
-- 1. Add monthly emission limit per subscription tier (default limits by plan)
ALTER TABLE public.subscription_tiers 
ADD COLUMN IF NOT EXISTS monthly_emission_limit numeric NOT NULL DEFAULT 500;

-- 2. Add per-household override (optional, admin can set custom limits)
ALTER TABLE public.households
ADD COLUMN IF NOT EXISTS monthly_emission_limit_override numeric DEFAULT NULL;

-- 3. Function to get a parent's monthly emission stats
CREATE OR REPLACE FUNCTION public.get_parent_emission_stats(_parent_profile_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _system_wallet_id uuid;
  _month_start timestamptz;
  _emitted_this_month numeric;
  _emission_limit numeric;
  _household_override numeric;
  _tier_limit numeric;
  _household_id uuid;
  _tenant_id uuid;
BEGIN
  SELECT get_system_wallet_id() INTO _system_wallet_id;
  
  _month_start := date_trunc('month', now());

  -- Sum all emissions created by this parent this month
  SELECT COALESCE(SUM(le.amount), 0) INTO _emitted_this_month
  FROM ledger_entries le
  WHERE le.created_by = _parent_profile_id
    AND le.debit_wallet_id = _system_wallet_id
    AND le.created_at >= _month_start
    AND le.entry_type IN ('allowance', 'task_reward', 'mission_reward', 'adjustment', 'refund');

  -- Get household and tenant
  SELECT p.household_id, p.tenant_id INTO _household_id, _tenant_id
  FROM profiles p WHERE p.id = _parent_profile_id;

  -- Get household override
  SELECT h.monthly_emission_limit_override INTO _household_override
  FROM households h WHERE h.id = _household_id;

  -- Get tier limit
  SELECT st.monthly_emission_limit INTO _tier_limit
  FROM tenants t
  JOIN subscription_tiers st ON st.id = t.subscription_tier_id
  WHERE t.id = _tenant_id;

  -- Use override if set, otherwise tier limit, otherwise default 500
  _emission_limit := COALESCE(_household_override, _tier_limit, 500);

  RETURN jsonb_build_object(
    'emitted_this_month', _emitted_this_month,
    'emission_limit', _emission_limit,
    'remaining', GREATEST(_emission_limit - _emitted_this_month, 0),
    'percentage_used', CASE WHEN _emission_limit > 0 
      THEN ROUND((_emitted_this_month / _emission_limit) * 100, 1) 
      ELSE 0 END,
    'month_start', _month_start,
    'has_override', _household_override IS NOT NULL
  );
END;
$$;
