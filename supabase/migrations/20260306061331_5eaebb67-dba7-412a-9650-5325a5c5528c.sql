-- Add a system vault wallet that doesn't affect real balances
-- We'll make profile_id nullable for system wallets
-- Actually, let's create a simpler approach: a dedicated "vault_hold" wallet per user
-- Instead, let's fix the view to handle vault deposits correctly

-- Drop and recreate the view to exclude vault_deposit/vault_withdraw self-transfers from balance
CREATE OR REPLACE VIEW public.wallet_balances AS
SELECT w.id AS wallet_id,
    w.profile_id,
    w.wallet_type,
    w.currency,
    COALESCE(credits.total, 0::numeric) - COALESCE(debits.total, 0::numeric) AS balance
   FROM wallets w
     LEFT JOIN ( SELECT ledger_entries.credit_wallet_id AS wallet_id,
            sum(ledger_entries.amount) AS total
           FROM ledger_entries
          WHERE (ledger_entries.approved_at IS NOT NULL OR ledger_entries.requires_approval = false)
            AND NOT (ledger_entries.entry_type IN ('vault_deposit', 'vault_withdraw') 
                     AND ledger_entries.credit_wallet_id = ledger_entries.debit_wallet_id)
          GROUP BY ledger_entries.credit_wallet_id) credits ON credits.wallet_id = w.id
     LEFT JOIN ( SELECT ledger_entries.debit_wallet_id AS wallet_id,
            sum(ledger_entries.amount) AS total
           FROM ledger_entries
          WHERE (ledger_entries.approved_at IS NOT NULL OR ledger_entries.requires_approval = false)
            AND NOT (ledger_entries.entry_type IN ('vault_deposit') 
                     AND ledger_entries.credit_wallet_id = ledger_entries.debit_wallet_id)
          GROUP BY ledger_entries.debit_wallet_id) debits ON debits.wallet_id = w.id;