CREATE OR REPLACE VIEW public.wallet_balances WITH (security_invoker = true) AS
SELECT w.id AS wallet_id,
    w.profile_id,
    w.wallet_type,
    w.currency,
    (COALESCE(credits.total, 0::numeric) - COALESCE(debits.total, 0::numeric)) AS balance
FROM wallets w
LEFT JOIN (
    SELECT le.credit_wallet_id AS wallet_id, sum(le.amount) AS total
    FROM ledger_entries le
    WHERE (le.approved_at IS NOT NULL OR le.requires_approval = false)
      AND NOT (le.entry_type IN ('vault_deposit', 'vault_interest') AND le.credit_wallet_id = le.debit_wallet_id)
    GROUP BY le.credit_wallet_id
) credits ON credits.wallet_id = w.id
LEFT JOIN (
    SELECT le.debit_wallet_id AS wallet_id, sum(le.amount) AS total
    FROM ledger_entries le
    WHERE (le.approved_at IS NOT NULL OR le.requires_approval = false)
      AND NOT (le.entry_type = 'vault_withdraw' AND le.credit_wallet_id = le.debit_wallet_id)
    GROUP BY le.debit_wallet_id
) debits ON debits.wallet_id = w.id;