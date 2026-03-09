

# Fix: Invite Code Link Not Working for Child Signup

## Root Cause

When a parent generates an invite link (`/join/ABC123`), the `JoinFamily` page validates the code and navigates to `/login?invite=ABC123`. However, the `Login.tsx` page **never reads the `invite` query parameter** from the URL. The invite code field stays empty, no role is pre-selected, and the user lands on the generic login screen with no context.

## Fix

Add a `useEffect` in `Login.tsx` that reads `?invite=` from the URL search params and:

1. Pre-fills `inviteCode` with the value
2. Sets `authMode` to `'signup'`
3. Sets `selectedRole` to `'child'` (user can switch to `'teen'` if needed)

This is a single-file, ~10-line fix.

## Changes

**`src/pages/Login.tsx`** — Add after existing state declarations (~line 88):

```typescript
// Auto-fill invite code from URL query param (?invite=ABC123)
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const invite = params.get('invite');
  if (invite) {
    setInviteCode(invite.toUpperCase().slice(0, 6));
    setAuthMode('signup');
    if (!selectedRole) setSelectedRole('child');
  }
}, []);
```

The existing `useEffect` at line 150 already validates the code when `inviteCode.length === 6` and `selectedRole` is child/teen, so validation will trigger automatically.

## Files

| File | Action |
|------|--------|
| `src/pages/Login.tsx` | Add `useEffect` to read `?invite=` query param |

