

# Login Security Hardening — KIVARA

## Current State

**Already implemented:**
- 2FA for parent/admin (email OTP via reauthenticate + trusted devices)
- Strong password policy (12 chars, complexity, blocklist)
- Password strength meter
- Forgot/reset password flow
- Role-based access via RLS + edge function guards
- Wallet freeze, idempotency, velocity limits
- Risk flags + anomaly detection (`check_anomalies()`, `risk-scan`)
- Audit triggers on critical tables
- Immutable ledger (no UPDATE/DELETE RLS)

**Missing:**
- No brute-force / lockout tracking (client or server)
- Login error messages reveal specifics (Supabase raw errors shown)
- No auth event logging table
- No honeypot / anti-bot fields
- No admin security monitoring dashboard for auth events
- No generic error messages for account enumeration protection
- No password reset rate limiting
- No session idle timeout

## Plan

### 1. Database Migration — Auth Security Tables

Create `auth_events` table for comprehensive auth logging:

```sql
CREATE TABLE auth_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL, -- login_success, login_failure, lockout, otp_sent, otp_verified, password_reset_requested, password_changed, session_revoked, device_trusted, suspicious_login
  email text,
  user_id uuid,
  ip_address text,
  user_agent text,
  metadata jsonb DEFAULT '{}',
  risk_level text DEFAULT 'low', -- low, medium, high, critical
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for lookups
CREATE INDEX idx_auth_events_email_type ON auth_events (email, event_type, created_at);
CREATE INDEX idx_auth_events_created ON auth_events (created_at DESC);

-- RLS: admin read-only
ALTER TABLE auth_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view auth events" ON auth_events FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'));
```

Create `login_lockouts` table for brute-force tracking:

```sql
CREATE TABLE login_lockouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  failed_attempts int NOT NULL DEFAULT 0,
  lockout_count int NOT NULL DEFAULT 0,
  locked_until timestamptz,
  last_attempt_at timestamptz DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(email)
);

ALTER TABLE login_lockouts ENABLE ROW LEVEL SECURITY;
-- No client access — only edge functions with service role
```

### 2. Edge Function: `auth-guard`

New edge function handling login protection logic. Called from client before/after login attempts.

**Actions:**
- `check-lockout`: Given an email, check if account is locked. Returns `{ locked, locked_until, retry_after_seconds }`.
- `record-failure`: Record a failed login. After 5 failures in 15 min → lock. Progressive lockout (15m → 30m → 60m based on `lockout_count`).
- `record-success`: Clear failed attempts, log success event.
- `log-event`: Generic auth event logger (for OTP events, password resets, etc.)

**Rate limiting for password resets:** Track via `auth_events` — max 3 reset requests per email/hour, max 10 per IP/hour.

### 3. Update Login Flow (AuthContext + Login.tsx)

**AuthContext changes:**
- Before calling `signInWithPassword`, invoke `auth-guard` with `check-lockout` action
- If locked, return generic error without attempting login
- On login failure, invoke `record-failure`
- On login success, invoke `record-success`

**Generic error messages (enumeration protection):**
- Replace all specific Supabase error messages with: `"Não foi possível iniciar sessão. Verifique os dados e tente novamente."`
- Password reset always shows: `"Se este email estiver registado, receberá instruções."`

**Honeypot field:**
- Add hidden `website` input field to login/signup forms
- If filled (bot), silently reject submission

### 4. Update ForgotPassword.tsx

- Call `auth-guard` to check reset rate limit before sending
- Always show generic success message regardless of whether email exists

### 5. Admin Auth Security Dashboard

New page or tab in AdminRisk showing:
- Recent auth events (login failures, lockouts, OTP abuse)
- Failed login spikes (chart)
- Locked accounts list with unlock action
- Filter by date, email, event type, risk level
- Admin actions: unlock account, force password reset

### 6. Session Idle Timeout

Add idle timeout logic in AuthContext:
- Track last activity timestamp
- Parent/guardian: 30 min idle → auto logout
- Admin: 15 min idle → auto logout
- Child/teen/teacher: no forced timeout (managed by Supabase token refresh)

### 7. i18n Keys (~15 keys)

Generic auth error messages, lockout messages, admin dashboard labels.

### 8. Security Test Suite Update

Update `src/test/security-audit.test.ts` to document:
- Brute force protection
- Account enumeration protection
- Honeypot anti-bot
- Auth event logging
- Session timeout

## Files Summary

| File | Action |
|------|--------|
| DB Migration | Create `auth_events`, `login_lockouts` tables |
| `supabase/functions/auth-guard/index.ts` | **New** — lockout check, failure recording, event logging |
| `src/contexts/AuthContext.tsx` | **Edit** — pre-login lockout check, generic errors, idle timeout |
| `src/pages/Login.tsx` | **Edit** — honeypot field, generic errors, lockout UI |
| `src/pages/ForgotPassword.tsx` | **Edit** — rate limit check, generic messaging |
| `src/pages/admin/AdminRisk.tsx` | **Edit** — add auth security tab |
| `src/i18n/pt.ts` + `src/i18n/en.ts` | **Edit** — ~15 keys |
| `src/test/security-audit.test.ts` | **Edit** — document new controls |
| `supabase/config.toml` | **Edit** — add auth-guard function |

## Out of Scope
- IP geolocation / impossible travel detection (requires third-party service)
- CAPTCHA integration (would require external provider like hCaptcha)
- HTTP-level rate limiting (managed by Lovable Cloud infrastructure)
- CSRF protection (handled by SPA architecture + JWT)

