

# 2FA for Parent/Admin Accounts — KIVARA

## Approach

Since Supabase's built-in MFA (TOTP-based) uses authenticator apps rather than email OTP, and the requirement is specifically for **email-based OTP codes**, I'll implement a custom 2FA system using a database table for OTP storage and an edge function for generation/verification/email delivery.

## Architecture

```text
Login (password OK) → Edge Function generates OTP → Stores hashed OTP in DB → Sends email via Lovable AI
                    → Client shows 6-digit input screen → User enters code → Edge Function verifies
                    → Returns session confirmation → AuthContext completes login
```

## Database Migration

New table `otp_challenges`:
- `id` uuid PK
- `user_id` uuid (references auth.users)
- `code_hash` text (SHA-256 hashed 6-digit code)
- `created_at` timestamptz
- `expires_at` timestamptz (created_at + 10 min)
- `attempts` int default 0
- `verified` boolean default false
- `device_token` text nullable (for "trust this device")
- `trusted_until` timestamptz nullable

New table `trusted_devices`:
- `id` uuid PK
- `user_id` uuid
- `device_token` text (unique)
- `trusted_until` timestamptz
- `created_at` timestamptz

RLS: Users can only read/insert their own records. No UPDATE/DELETE from client.

## Edge Function: `verify-2fa`

Handles three actions:
1. **`send`** — Generate 6-digit code, hash with SHA-256, store in `otp_challenges`, send email via Lovable AI model. Invalidate previous codes for same user.
2. **`verify`** — Check code hash, enforce max 5 attempts, 10-min expiry. If valid + "trust device" checked, create `trusted_devices` entry (30 days). Return success signal.
3. **`check-trust`** — Check if current device token exists in `trusted_devices` and is not expired. If trusted, skip 2FA.

## Login Flow Changes

### AuthContext (`src/contexts/AuthContext.tsx`)
- Modify `login()` to return `{ error, requires2FA, userId }` instead of just `{ error }`
- After successful `signInWithPassword`, check user role — if parent/admin, sign them out immediately and return `requires2FA: true` with the user ID
- Add new method `verify2FA(userId, code, trustDevice, deviceToken)` that calls the edge function and then re-authenticates

### Login Page (`src/pages/Login.tsx`)
- After password validation succeeds for parent/admin, show 2FA verification screen
- New state: `twoFactorPending`, `twoFactorUserId`
- 2FA screen shows: title "Verificação de segurança", 6-digit input (using existing `InputOTP` component), "Confirmar" button, "Reenviar código" with 30s cooldown timer, "Confiar neste dispositivo" checkbox
- On failed verification after 5 attempts: show lockout message for 15 minutes
- Device trust token stored in localStorage

## Email Delivery

The edge function will use Lovable AI to generate and send the OTP email. The email content will follow the template specified in the requirements (Portuguese).

## Files Summary

| File | Action |
|------|--------|
| DB migration | Create `otp_challenges` + `trusted_devices` tables with RLS |
| `supabase/functions/verify-2fa/index.ts` | **New** — OTP generation, verification, trust check |
| `src/contexts/AuthContext.tsx` | **Edit** — Add 2FA flow to login, add verify2FA method |
| `src/pages/Login.tsx` | **Edit** — Add 2FA verification screen after password auth |
| `src/i18n/pt.ts` + `src/i18n/en.ts` | **Edit** — Add ~15 2FA-related keys |
| `supabase/config.toml` | **Edit** — Add verify-2fa function config |

## Key Decisions

- **Email OTP over TOTP**: As requested — no authenticator app needed
- **SHA-256 hashing**: OTP codes hashed before storage, never stored in plain text
- **Scope**: Parent + admin roles only; child/teen/teacher/partner skip 2FA
- **Device trust**: 30-day localStorage token, validated server-side
- **Lockout**: 5 failed attempts invalidates code; 15-min coolout enforced via `created_at` check on new OTP requests

