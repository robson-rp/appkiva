

# Digital Wallet Protection — KIVARA

## Current State Analysis

The platform already has a strong foundation:
- **Ledger-first architecture**: All transactions go through `create-transaction` edge function with double-entry accounting
- **Balance validation**: Universal check for all non-system debits
- **Role-based authorization**: Parent-only types, admin guards, household isolation
- **Spending limits**: Daily spend limit, monthly budget, emission limits
- **Fraud detection**: `check_anomalies()` SQL function + `risk-scan` edge function
- **Audit triggers**: Active on `ledger_entries`, `wallets`, `profiles`, `tasks`, `user_roles`, `consent_records`
- **Immutable ledger**: No UPDATE/DELETE RLS on `ledger_entries`

### What's Missing

| Feature | Status |
|---------|--------|
| Idempotency keys | Not implemented |
| Wallet freeze/suspend | No `is_frozen` column or checks |
| Duplicate reward prevention | Partial (reward `claimed_by` check exists, but no idempotency) |
| Transaction velocity checks | Only daily spend limit; no per-hour velocity |
| Real money wallet separation | `wallet_type` enum exists (`virtual`) but no `fiat` type yet |
| Admin wallet dashboard | `AdminFinance` shows money supply but no flagged/frozen wallet view |
| Vault withdrawal parental approval | Not enforced |
| Wallet security test suite | Doesn't exist |

## Plan

### 1. Database Migration — Wallet Freeze + Idempotency

Add `is_frozen` column to `wallets` table and `idempotency_key` to `ledger_entries`:

```sql
-- Wallet freeze support
ALTER TABLE wallets ADD COLUMN is_frozen boolean NOT NULL DEFAULT false;
ALTER TABLE wallets ADD COLUMN frozen_at timestamptz;
ALTER TABLE wallets ADD COLUMN frozen_by uuid;
ALTER TABLE wallets ADD COLUMN freeze_reason text;

-- Idempotency protection
ALTER TABLE ledger_entries ADD COLUMN idempotency_key text;
CREATE UNIQUE INDEX idx_ledger_idempotency ON ledger_entries (idempotency_key) WHERE idempotency_key IS NOT NULL;

-- Vault withdrawal approval
ALTER TABLE savings_vaults ADD COLUMN requires_parent_approval boolean NOT NULL DEFAULT false;
```

### 2. Update `create-transaction` Edge Function

Add three new validation layers:
- **Frozen wallet check**: Reject transactions if debit or credit wallet `is_frozen = true`
- **Idempotency**: Accept optional `idempotency_key` in request body; if duplicate key exists, return the original entry instead of creating a new one
- **Hourly velocity check**: For non-parent/admin users, limit to max 20 transactions per hour

### 3. Update `vault-withdraw` Edge Function

Add parental approval check: if `savings_vaults.requires_parent_approval = true` and caller is child/teen, create a pending notification to parent instead of executing immediately.

### 4. Wallet Freeze/Unfreeze Functions in `create-transaction` or New Edge Function

Add a `wallet-admin` edge function for:
- `freeze`: Sets `is_frozen = true`, logs reason, notifies wallet owner
- `unfreeze`: Resets `is_frozen = false`
- Access: Parents (own household wallets) and admins only

### 5. Admin Wallet Protection Dashboard

Enhance `AdminFinance.tsx` with a new "Wallet Security" tab showing:
- Frozen wallets list with freeze reason and timestamp
- Flagged transactions from `risk_flags`
- Transaction velocity anomalies
- Filter by tenant, user, fraud status

### 6. Client-Side Idempotency in `ledger-api.ts`

Update `createTransaction()` to auto-generate an idempotency key (UUID) and include it in the request body. Retry logic returns cached result on duplicate key.

### 7. Wallet Security Test Suite

Create `src/test/wallet-security.test.ts` documenting:
- Frozen wallet rejection
- Idempotency key duplicate prevention
- Insufficient balance rejection
- Cross-household wallet access denial
- Velocity limit enforcement
- Vault withdrawal approval enforcement
- Role-based transaction type restrictions

### 8. i18n Keys

Add ~15 keys for wallet freeze/unfreeze messages, velocity limit errors, idempotency feedback.

## Files Summary

| File | Action |
|------|--------|
| Database migration | Add `is_frozen`, `idempotency_key`, `requires_parent_approval` |
| `supabase/functions/create-transaction/index.ts` | Add frozen check, idempotency, velocity limit |
| `supabase/functions/vault-withdraw/index.ts` | Add parental approval gate |
| `supabase/functions/wallet-admin/index.ts` | **New** — freeze/unfreeze with auth |
| `src/lib/ledger-api.ts` | Add idempotency key generation |
| `src/pages/admin/AdminFinance.tsx` | Add wallet security tab |
| `src/test/wallet-security.test.ts` | **New** — security test documentation |
| `src/i18n/pt.ts` + `src/i18n/en.ts` | Add ~15 keys |

## Out of Scope (Infrastructure-Level)
- Real money wallet domain (requires PSP integration — future phase)
- IP address logging (not available client-side)
- Anti-replay at network level (handled by TLS + JWT expiry)
- Rate limiting at HTTP level (managed by Lovable Cloud)

