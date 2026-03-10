

# Plan: KIVARA Core Platform Architecture Evolution

## Current State Assessment

The project already has significant foundations built:
- **Real authentication** with RBAC (parent, child, teen, teacher roles)
- **Ledger-first architecture** with double-entry accounting, immutable entries, and derived balances
- **Household-based data isolation** via RLS policies
- **Virtual coin economy** (KVC) fully operational
- **Edge functions** for server-side transaction validation

What's missing from the request: multi-tenant architecture, admin super-role, subscription management, currency localization, real money separation, audit logging, fraud detection, and risk dashboards.

## What Lovable Can and Cannot Build

**Can build (within Lovable Cloud):**
- Tenant/organization layer in the database
- Admin super-role with management dashboard
- Subscription tier definitions and feature gating
- Currency configuration per tenant
- Audit log table with triggers
- Basic anomaly detection queries
- Risk/admin dashboard UI

**Cannot build (requires external infrastructure):**
- Real payment processing (Stripe, mobile money, bank integrations)
- KYC/AML verification services
- IP address logging in edge functions (Deno limitation)
- True microservice separation (everything runs as Supabase + edge functions)
- Real-time fraud ML models

## Implementation Plan (4 Phases)

### Phase 1 — Multi-Tenant Foundation

**Database migrations:**

1. Create `tenants` table:
   - `id`, `name`, `type` (enum: family, school, institutional_partner), `settings` (jsonb), `currency`, `subscription_tier`, `is_active`, `created_at`

2. Create `subscription_tiers` table:
   - `id`, `name`, `type` (enum: free, family_premium, school_institutional, partner_program), `max_children`, `max_classrooms`, `features` (jsonb array of enabled feature keys), `price_monthly`, `price_yearly`, `currency`, `is_active`

3. Add `tenant_id` column to `households` and `profiles` tables (nullable initially for migration)

4. Expand `app_role` enum to include `admin`

5. RLS policies on new tables: admin-only write, tenant-scoped reads

**Frontend:**
- Create `/admin` layout and dashboard route
- Admin dashboard with tenant list, subscription management, and global stats
- Feature gate helper: `useFeatureGate(featureKey)` hook that checks tenant subscription

### Phase 2 — Currency Localization & Real Money Domain Separation

**Database:**

1. Create `supported_currencies` table:
   - `code` (PKR, KES, NGN, USD, AOA), `name`, `symbol`, `decimal_places`, `is_active`

2. Add `real_money_enabled` flag to tenants

3. Create separate `wallet_type` for real money (`real` already exists in enum) — the existing wallet infrastructure supports this

**Frontend:**
- Currency display component that formats based on tenant currency
- Settings page for admin to configure tenant currency
- Clear UI separation: virtual coins use the coin icon, real money uses currency symbol

### Phase 3 — Audit Logging & Compliance

**Database:**

1. Create `audit_log` table (append-only):
   - `id`, `tenant_id`, `user_id`, `profile_id`, `action` (enum), `resource_type`, `resource_id`, `old_values` (jsonb), `new_values` (jsonb), `metadata` (jsonb), `created_at`
   - RLS: admin-only SELECT, no UPDATE/DELETE

2. Create database triggers on critical tables (`ledger_entries`, `wallets`, `profiles`, `consent_records`, `user_roles`) that auto-insert into `audit_log`

3. Enhance `consent_records` table with `ip_metadata` and `revocation_reason` columns

**Frontend:**
- Audit log viewer in admin dashboard with filters (user, action type, date range)
- Consent management panel for parents (view/revoke)
- Data export/deletion request workflow

### Phase 4 — Risk Monitoring & Anti-Fraud

**Database:**

1. Create `risk_flags` table:
   - `id`, `tenant_id`, `profile_id`, `flag_type` (enum: excessive_rewards, unusual_transactions, rate_limit_hit, task_exploitation), `severity` (low/medium/high/critical), `description`, `metadata` (jsonb), `resolved_at`, `resolved_by`, `created_at`

2. Create database function `check_anomalies()` that can be called periodically to flag:
   - More than N rewards claimed in 24h
   - Transaction amounts exceeding historical average by 3x
   - Repeated identical transactions

**Edge function:**
- `risk-scan` edge function that runs anomaly checks and inserts into `risk_flags`

**Frontend:**
- Risk dashboard at `/admin/risk` showing:
  - Flagged accounts with severity badges
  - Suspicious transaction list
  - Resolution workflow (mark as resolved with notes)
- Key metrics cards: daily active users, transaction volume, flag count

## Technical Approach

- All new tables get RLS policies scoped to tenant + role
- The `admin` role bypasses household scoping via `has_role(auth.uid(), 'admin')`
- Audit triggers use `SECURITY DEFINER` to write regardless of caller permissions
- Subscription feature gating is client-side initially (enforced server-side in edge functions for financial operations)
- No changes to existing `ledger_entries`, `wallets`, or `wallet_balances` structures — they already support the architecture

## Estimated Scope

| Phase | New Tables | Edge Functions | UI Pages |
|-------|-----------|---------------|----------|
| 1. Multi-tenant | 2 | 0 | 3 (admin layout, dashboard, tenant mgmt) |
| 2. Currency | 1 | 0 | 2 (currency settings, display components) |
| 3. Audit | 1 + triggers | 0 | 2 (audit viewer, consent panel) |
| 4. Risk | 1 | 1 | 1 (risk dashboard) |

