
-- Fix security definer views by setting security_invoker = true
CREATE OR REPLACE VIEW public.wallet_balances 
WITH (security_invoker = true)
AS
SELECT 
  w.id AS wallet_id,
  w.profile_id,
  w.wallet_type,
  w.currency,
  COALESCE(credits.total, 0) - COALESCE(debits.total, 0) AS balance
FROM public.wallets w
LEFT JOIN (
  SELECT credit_wallet_id AS wallet_id, SUM(amount) AS total
  FROM public.ledger_entries
  WHERE approved_at IS NOT NULL OR requires_approval = false
  GROUP BY credit_wallet_id
) credits ON credits.wallet_id = w.id
LEFT JOIN (
  SELECT debit_wallet_id AS wallet_id, SUM(amount) AS total
  FROM public.ledger_entries
  WHERE approved_at IS NOT NULL OR requires_approval = false
  GROUP BY debit_wallet_id
) debits ON debits.wallet_id = w.id;

CREATE OR REPLACE VIEW public.wallet_transactions
WITH (security_invoker = true)
AS
SELECT 
  le.id,
  le.amount,
  le.entry_type,
  le.description,
  le.created_at,
  le.metadata,
  le.requires_approval,
  le.approved_at,
  le.debit_wallet_id,
  le.credit_wallet_id,
  CASE 
    WHEN le.credit_wallet_id = w.id THEN 'credit'
    ELSE 'debit'
  END AS direction,
  w.id AS wallet_id,
  w.profile_id
FROM public.ledger_entries le
CROSS JOIN public.wallets w
WHERE le.debit_wallet_id = w.id OR le.credit_wallet_id = w.id;
