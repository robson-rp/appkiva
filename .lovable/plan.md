

# Plan: Fix Invite Code + Add Change Password to Profiles

## Two Issues

### 1. Invite Code "Invalid"

**Root cause:** The `generateAndPersistCode` function in `ParentChildren.tsx` silently catches errors. The database table `family_invite_codes` is completely empty, meaning inserts are failing. The most likely cause is that some parent accounts lack a `tenant_id`, and the `ensure_parent_household` RPC may succeed but the actual insert could fail due to an edge case in the RLS policy or a constraint violation we can't easily reproduce.

**Fix:**
- Add visible error logging in the `catch` block of `generateAndPersistCode` so the actual error message is shown in the toast (currently it shows a generic message)
- More importantly, add a fallback: when the invite dialog opens, if there's no existing valid code, auto-generate one immediately
- Also ensure the `claim_invite_code` function properly handles the `tenant_id` assignment for the child

### 2. No "Change Password" on Profile Pages

**Missing feature:** Parent, Teacher, and Partner profile pages have no option to change password. Teachers don't even have a personal profile page (only school profile).

**Fix:**
- Create a reusable `ChangePasswordSection` component that uses `supabase.auth.updateUser({ password })` with the existing `PasswordStrengthMeter` and validation
- Add it to: `ParentProfile`, `PartnerProfile`, `ChildProfile`, `TeenProfile`
- Create a `TeacherProfile` page with avatar, language, and change password sections
- Add the teacher profile route to `App.tsx` and nav link to `TeacherLayout`

## Technical Details

### ChangePasswordSection Component
```text
src/components/ChangePasswordSection.tsx
- Current password field (for verification)
- New password field with PasswordStrengthMeter
- Confirm password field
- Uses supabase.auth.updateUser({ password: newPassword })
- Validates with isPasswordValid() from password-validation.ts
- Wrapped in a Card with Lock icon header
```

### Files to Modify/Create

| File | Action |
|------|--------|
| `src/components/ChangePasswordSection.tsx` | Create reusable change-password card |
| `src/pages/parent/ParentProfile.tsx` | Add ChangePasswordSection |
| `src/pages/parent/ParentChildren.tsx` | Improve error handling in generateAndPersistCode |
| `src/pages/partner/PartnerProfile.tsx` | Add ChangePasswordSection |
| `src/pages/child/ChildProfile.tsx` | Add ChangePasswordSection |
| `src/pages/teen/TeenProfile.tsx` | Add ChangePasswordSection |
| `src/pages/teacher/TeacherProfile.tsx` | Create new personal profile page |
| `src/components/layouts/TeacherLayout.tsx` | Add profile nav link |
| `src/App.tsx` | Add `/teacher/profile` route |

