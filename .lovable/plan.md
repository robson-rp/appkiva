

## Audit: Remaining mock-data dependencies

There are **7 files** still importing from `@/data/mock-data`. Here is the full inventory:

### Portal Crianca (Child)

| File | Mocks used | What they do |
|---|---|---|
| `ChildVaults.tsx` | `mockVaults`, `mockChildren` | Fallback when DB vaults are empty |
| `ChildDiary.tsx` | `mockChildren`, `mockDiaryEntries` | Fallback when DB diary entries are empty |
| `ChildDreams.tsx` | `mockDreamVaults`, `mockChildren` | Fallback when DB dream vaults are empty |
| `ChildWallet.tsx` | `mockChildren` | Avatar/name fallback for child profile |

### Portal Teen

| File | Mocks used | What they do |
|---|---|---|
| `TeenWallet.tsx` | `mockTeens`, `mockTeenTransactions` | Balance, transactions, categories - all from mock |
| `TeenAnalytics.tsx` | `mockTeens`, `mockTeenTransactions` | Spending breakdown, savings rate, budget - all from mock |

### Shared Component

| File | Mocks used | What they do |
|---|---|---|
| `Kivo.tsx` | `KIVO_TIPS` | Static tips dictionary (not real "data", just UI strings) |

---

### Summary

- **6 pages** still depend on mock data for actual logic/display
- **1 component** (`Kivo.tsx`) uses `KIVO_TIPS` which is static content (strings/tips), not user data -- this could stay in mock-data or be moved to a dedicated `kivo-tips.ts` file
- The child portal pages (`ChildVaults`, `ChildDiary`, `ChildDreams`, `ChildWallet`) already use real hooks but fall back to mock when empty
- The teen portal pages (`TeenWallet`, `TeenAnalytics`) are **fully mock-driven** and need the most work

### Recommended migration plan

1. **TeenWallet + TeenAnalytics** -- Replace `mockTeens`/`mockTeenTransactions` with `useWalletBalance`, `useWalletTransactions`, `useMonthlySpending`, `useTeenBudget` (same hooks already used in `TeenDashboard`)
2. **ChildVaults, ChildDiary, ChildDreams, ChildWallet** -- Remove mock fallbacks; show empty states when DB has no data (the real hooks are already wired)
3. **Kivo.tsx** -- Move `KIVO_TIPS` to `src/data/kivo-tips.ts` so `mock-data.ts` can be deleted entirely
4. **Delete `src/data/mock-data.ts`**

Shall I proceed with this migration?

