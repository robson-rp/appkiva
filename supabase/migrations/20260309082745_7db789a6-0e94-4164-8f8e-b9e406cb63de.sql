
-- Wallet freeze support
ALTER TABLE wallets ADD COLUMN is_frozen boolean NOT NULL DEFAULT false;
ALTER TABLE wallets ADD COLUMN frozen_at timestamptz;
ALTER TABLE wallets ADD COLUMN frozen_by uuid REFERENCES profiles(id);
ALTER TABLE wallets ADD COLUMN freeze_reason text;

-- Idempotency protection
ALTER TABLE ledger_entries ADD COLUMN idempotency_key text;
CREATE UNIQUE INDEX idx_ledger_idempotency ON ledger_entries (idempotency_key) WHERE idempotency_key IS NOT NULL;

-- Vault withdrawal approval
ALTER TABLE savings_vaults ADD COLUMN requires_parent_approval boolean NOT NULL DEFAULT false;
