

## Problem
The wallet balance for Yanna (415 KVC) exists correctly in the database, but the UI doesn't update automatically. This happens because:
1. React Query's `refetchOnWindowFocus` is globally disabled in `App.tsx`
2. The wallet queries have no `refetchInterval` or real-time subscription
3. After a parent sends allowance/rewards, the child's cached data stays stale

## Solution
Implement two complementary strategies:

### 1. Real-time subscription on `ledger_entries`
Add Supabase Realtime to the `ledger_entries` table so that when new entries are created, wallet balance and transaction queries automatically invalidate and refetch.

**Database migration**: Enable realtime publication for `ledger_entries`:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.ledger_entries;
```

### 2. Update `use-wallet.ts` hook
- Add a Realtime listener inside `useWalletBalance` that listens for `INSERT` events on `ledger_entries` and invalidates `wallet-balance` and `wallet-transactions` query keys.
- Add `refetchInterval: 30000` (30s polling) as a fallback safety net.
- Also invalidate `children` query key (so the parent portal sees updated balances too).

### 3. Add manual refresh button (optional UX enhancement)
Add a small refresh button on `ChildWallet.tsx` and `ChildDashboard.tsx` balance display so users can manually trigger a refetch if needed.

### Files to modify
- **`supabase/migrations/` (new)** — enable realtime on `ledger_entries`
- **`src/hooks/use-wallet.ts`** — add realtime subscription + refetchInterval
- **`src/pages/child/ChildWallet.tsx`** — add refresh button on balance card
- **`src/pages/child/ChildDashboard.tsx`** — minor: balance will auto-update via hook changes

