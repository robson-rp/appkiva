

# Password Security & Authentication Hardening — KIVARA

## Current State

- Password field has `minLength={6}` — far below the requested 12-character minimum
- No password strength meter exists
- No "Forgot Password" flow or `/reset-password` page exists
- No password change functionality in profile pages
- Supabase handles hashing (bcrypt) server-side — no action needed there
- Session management is handled by Supabase Auth (auto-refresh, persistent sessions)
- Rate limiting and account lockout are Supabase-managed (not configurable from client)
- No 2FA implementation exists

## Scope & Constraints

Several items in the request are handled at the infrastructure level by Lovable Cloud and cannot be customized from client code:
- **Password hashing** (bcrypt) — already handled server-side
- **Rate limiting / account lockout** — managed by the auth infrastructure
- **Reset token expiry** — managed server-side (default 24h, not configurable via client)
- **IP logging** — not available from client-side code
- **2FA / TOTP** — Supabase MFA API exists but requires careful implementation
- **Password history** — not natively supported; would require a custom table

What we **can and should** implement:

## Plan

### 1. Password Validation Utility (`src/lib/password-validation.ts`)
Create a shared password validation module:
- Minimum 12 characters
- Must contain: uppercase, lowercase, number, special character
- Returns strength level: `weak | moderate | strong | very_strong`
- Returns per-rule check results for UI feedback
- Common password blocklist (password, 12345678, kivara123, etc.)

### 2. Password Strength Meter Component (`src/components/PasswordStrengthMeter.tsx`)
- Real-time colored progress bar (red → orange → green → emerald)
- Shows which rules pass/fail with checkmarks
- Labels: Fraca / Moderada / Forte / Muito Forte
- Used in signup form and password reset form

### 3. Update Login Page (`src/pages/Login.tsx`)
- Replace `minLength={6}` with validation from the new utility
- Add `PasswordStrengthMeter` below the password field during signup
- Block form submission if password doesn't meet minimum "moderate" level
- Add "Forgot Password?" link below the password field on login mode

### 4. Forgot Password Flow (`src/pages/ForgotPassword.tsx`)
- Simple email input form
- Calls `supabase.auth.resetPasswordForEmail(email, { redirectTo: origin + '/reset-password' })`
- Shows confirmation message after submission

### 5. Reset Password Page (`src/pages/ResetPassword.tsx`)
- Checks for `type=recovery` in URL hash
- Shows new password form with `PasswordStrengthMeter`
- Calls `supabase.auth.updateUser({ password })`
- Enforces same strong password policy
- Redirects to login on success

### 6. Update App Router (`src/App.tsx`)
- Add routes: `/forgot-password` and `/reset-password` (public)

### 7. i18n Keys (pt.ts + en.ts)
Add ~20 keys for password validation rules, strength labels, forgot/reset flow messages.

### 8. Security Audit Test Update (`src/test/security-audit.test.ts`)
- Add test documenting strong password policy enforcement
- Document forgot/reset password flow existence

## Files Summary

| File | Action |
|------|--------|
| `src/lib/password-validation.ts` | **New** — validation logic + strength calculator |
| `src/components/PasswordStrengthMeter.tsx` | **New** — visual strength indicator |
| `src/pages/Login.tsx` | **Edit** — add strength meter, forgot password link, enforce policy |
| `src/pages/ForgotPassword.tsx` | **New** — email-based password reset request |
| `src/pages/ResetPassword.tsx` | **New** — set new password after email link |
| `src/App.tsx` | **Edit** — add 2 new routes |
| `src/i18n/pt.ts` | **Edit** — add ~20 keys |
| `src/i18n/en.ts` | **Edit** — add ~20 keys |
| `src/test/security-audit.test.ts` | **Edit** — document new security controls |

## Out of Scope (Infrastructure-Level)
These are noted in the report but not implementable from client code:
- Brute-force rate limiting (Supabase-managed)
- Password history tracking (would need custom DB table — can be added later)
- Admin 2FA (Supabase MFA API — separate future task)
- IP-based anomaly detection (server-side only)
- Session timeout after inactivity (Supabase manages token refresh)

