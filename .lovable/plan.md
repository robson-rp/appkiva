

## Production Readiness Testing Plan — Plataforma KIVARA

This is a comprehensive testing plan covering all 13 areas requested. Given that Lovable is a frontend-only environment (no load testing tools, no penetration testing frameworks), the plan focuses on what can be **implemented and executed** here: automated unit/integration tests, database integrity queries, security audits via code review, and manual E2E testing via the browser tool.

---

### Deliverables

| # | Area | Approach |
|---|---|---|
| 1 | User Role Testing | Automated tests + browser E2E for all 6 roles |
| 2 | Onboarding & Walkthrough | Browser E2E for splash + onboarding per role |
| 3 | Wallet & Ledger | SQL integrity queries + edge function tests |
| 4 | Virtual Coins Economy | Edge function invocation tests for limits/anti-cheat |
| 5 | League System | Code review + test for XP/ranking logic |
| 6 | Notification System | SQL queries + template validation |
| 7 | Multi-Tenant Isolation | RLS policy audit + cross-tenant SQL probes |
| 8 | Mobile UX | Browser viewport testing (375px, 768px, 1024px) |
| 9 | Performance | Lighthouse audit + bundle analysis |
| 10 | Security | RLS audit, edge function auth review, code scan |
| 11 | Fraud Detection | `check_anomalies()` invocation + risk_flags validation |
| 12 | Observability | Audit log trigger verification + log queries |
| 13 | Analytics | Dashboard metric validation queries |

---

### Implementation Plan

#### Phase 1: Security & RLS Audit (automated)

**File**: `src/test/security-audit.test.ts`

- Verify all tables have RLS enabled
- Verify `verify_jwt = false` edge functions have internal auth checks (review each)
- Flag: `supabase/config.toml` has `verify_jwt = false` on ALL edge functions — document which ones validate auth internally vs which are truly public
- Check for client-side admin checks (none found — uses `has_role()` SQL function)

**Findings from code review** (to include in report):
- `create-transaction`: validates auth via `getClaims()` internally
- `claim-reward`: validates auth via `getClaims()` internally
- `risk-scan`: NO auth check — uses service role only, should be cron-only
- `seed-test-accounts`: NO auth check — **critical security issue** for production

#### Phase 2: Ledger Integrity Queries

**File**: `src/test/ledger-integrity.test.ts`

Run via `supabase--read_query`:
1. Double-entry check: every `ledger_entry` has both `debit_wallet_id` and `credit_wallet_id`
2. Balance reconciliation: `SUM(credits) - SUM(debits)` per wallet matches `wallet_balances.balance`
3. System wallet conservation: `total_emitted - total_burned = total_in_circulation`
4. No orphan wallets (wallets without profiles)
5. No negative balances in `wallet_balances`

#### Phase 3: Multi-Tenant Isolation Verification

Run SQL probes:
1. Verify households cannot see other households' data
2. Verify partner programs are isolated by `partner_tenant_id`
3. Verify school classrooms are isolated by `teacher_profile_id`
4. Cross-reference `profiles.tenant_id` with `tenants` table integrity

#### Phase 4: E2E Role Testing (browser)

For each of the 6 test accounts (`*@kivara.com` / `Test1234!`):
1. Login
2. Verify redirect to correct dashboard (`/parent`, `/child`, `/teen`, `/teacher`, `/partner`, `/admin`)
3. Verify navigation items match role
4. Attempt to navigate to unauthorized routes (should redirect)
5. Verify splash screen appears on fresh session

#### Phase 5: Mobile UX Testing (browser)

Test at 3 viewports (375x667, 768x1024, 1440x900):
- Login page readability
- Dashboard layout
- Navigation (sidebar/bottom bar)
- Button tap targets (minimum 44px)

#### Phase 6: Production Readiness Report

**File**: `src/test/PRODUCTION_READINESS_REPORT.md`

Generate a comprehensive markdown report with:

```text
KIVARA Production Readiness Report
===================================

1. CRITICAL ISSUES (must fix before deploy)
   - seed-test-accounts endpoint has no auth guard
   - risk-scan endpoint has no auth guard  
   - All edge functions have verify_jwt=false
   - Test account credentials hardcoded and accessible

2. HIGH PRIORITY
   - Console warning: SheetHeader ref forwarding in ParentLayout
   - Console warning: Missing DialogContent aria-describedby
   - No rate limiting on public-facing endpoints

3. SECURITY VALIDATION
   - RLS policies: [per-table status]
   - Auth flow: [validation results]
   - Role escalation: [test results]
   - Token validation: [edge function audit]

4. FINANCIAL INTEGRITY
   - Ledger double-entry: [query results]
   - Balance reconciliation: [query results]
   - Emission limits: [validation results]
   - Spending limits: [validation results]

5. PERFORMANCE METRICS
   - Bundle size analysis
   - Lazy loading coverage
   - API caching strategy review

6. RECOMMENDATIONS
   - Remove or protect seed-test-accounts
   - Add verify_jwt=true where possible
   - Add rate limiting middleware
   - Fix React ref/aria warnings
   - Add E2E test suite for CI/CD
```

---

### Files to Create/Edit

| File | Action |
|---|---|
| `src/test/security-audit.test.ts` | Create — RLS and auth validation tests |
| `src/test/ledger-integrity.test.ts` | Create — Financial ledger integrity tests |
| `src/test/role-access.test.ts` | Create — Role-based routing tests |
| `src/test/PRODUCTION_READINESS_REPORT.md` | Create — Full report document |

### Database Queries to Execute

- Ledger balance reconciliation
- Orphan wallet detection
- Tenant isolation verification
- Audit log coverage check
- Risk flags status review

### Critical Issues Already Identified

1. **`seed-test-accounts`** — No auth guard, exposes account creation to anyone. Must be removed or protected before production.
2. **`risk-scan`** — No auth guard, allows anyone to trigger anomaly detection.
3. **`verify_jwt = false`** on all edge functions — each one must individually validate the JWT token internally, which most do, but this pattern is fragile.
4. **React warnings** in ParentLayout (ref forwarding) and DialogContent (missing aria-describedby) — non-critical but affects accessibility compliance.

