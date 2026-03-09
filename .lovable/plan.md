

# Fix: Published Site Blank Page

## Root Cause

In `App.tsx` (line 284-286), `SplashScreen` renders **before** the `ThemeProvider`/`LanguageProvider` wrapper. But `SplashScreen` calls `useT()` which requires `LanguageContext`. This throws an unhandled error, resulting in a blank white page.

In development preview this may work if the splash was already dismissed (cached in `sessionStorage`), but on a fresh visit to the published URL it crashes immediately.

## Fix

**Option A (recommended):** Move the splash screen **inside** the provider tree, so it has access to `LanguageProvider`.

Restructure `App.tsx`:
- Move `SplashScreen` logic inside the provider wrappers (after `LanguageProvider`)
- The `splashDone` state and `SplashScreen` rendering moves into a new inner component (e.g., `AppShell`) that sits inside all providers

```text
ThemeProvider
  QueryClientProvider
    LanguageProvider        ← useT() available from here down
      TooltipProvider
        BrowserRouter
          AuthProvider
            AppShell         ← splash check + AppRoutes here
```

**Changes to `src/App.tsx`:**
- Create `AppShell` component that handles splash state and renders either `SplashScreen` or the main app content
- The outer `App` component just wraps providers without any splash logic

This is a single-file fix.

## Files

| File | Action |
|------|--------|
| `src/App.tsx` | Restructure to move splash inside provider tree |

