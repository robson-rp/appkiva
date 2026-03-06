ALTER TABLE public.ledger_entries DROP CONSTRAINT different_wallets;
ALTER TABLE public.ledger_entries ADD CONSTRAINT different_wallets CHECK (
  debit_wallet_id <> credit_wallet_id
  OR entry_type IN ('vault_deposit', 'vault_withdraw', 'vault_interest')
);