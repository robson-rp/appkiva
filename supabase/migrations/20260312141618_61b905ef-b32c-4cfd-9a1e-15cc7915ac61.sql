
CREATE OR REPLACE FUNCTION public.get_wallet_transactions(_profile_id uuid, _limit integer DEFAULT 20)
RETURNS TABLE(
  id uuid,
  amount numeric,
  entry_type text,
  description text,
  created_at timestamptz,
  direction text,
  metadata jsonb
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _wallet_id uuid;
BEGIN
  SELECT w.id INTO _wallet_id
  FROM wallets w
  WHERE w.profile_id = _profile_id
    AND w.wallet_type = 'virtual'
    AND w.currency = 'KVC'
  LIMIT 1;

  IF _wallet_id IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    le.id,
    le.amount,
    le.entry_type::text,
    le.description,
    le.created_at,
    CASE WHEN le.credit_wallet_id = _wallet_id THEN 'credit' ELSE 'debit' END AS direction,
    COALESCE(le.metadata, '{}'::jsonb) AS metadata
  FROM ledger_entries le
  WHERE (le.credit_wallet_id = _wallet_id OR le.debit_wallet_id = _wallet_id)
    AND (le.approved_at IS NOT NULL OR le.requires_approval = false)
  ORDER BY le.created_at DESC
  LIMIT _limit;
END;
$$;
