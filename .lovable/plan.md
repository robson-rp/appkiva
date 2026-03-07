

## Plan: Edit Child Profile with Date of Birth

### Problem
The "Editar" button on each child card has no `onClick` handler -- it does nothing. Parents cannot edit child details (nickname, avatar, date of birth). The `date_of_birth` column already exists on the `profiles` table but is not fetched or displayed.

### Changes

**1. Database Migration** -- Add `date_of_birth` column to `children` table
The `profiles` table already has `date_of_birth`, but since parents update children via the `children` table and the child's profile belongs to a different `user_id`, it's cleaner to store `date_of_birth` on the `children` table directly (parents have UPDATE RLS on `children` but not on the child's profile).

```sql
ALTER TABLE public.children ADD COLUMN date_of_birth date;
```

**2. `use-children.ts`** -- Extend hook
- Add `dateOfBirth` to `ChildWithBalance` interface
- Fetch `date_of_birth` in the query
- Add `useUpdateChild` mutation that updates nickname, avatar, and date_of_birth on the `children` table

**3. `ParentChildren.tsx`** -- Wire up Edit dialog
- Add edit dialog state (`editDialogOpen`, `editChild`)
- Fields: Nickname (text), Avatar (emoji picker with preset options), Date of Birth (date picker using Popover + Calendar)
- Show calculated age next to each child's name in the card
- Connect the "Editar" button's `onClick` to open the dialog
- Save calls `useUpdateChild` mutation

**4. Calendar fix** -- Ensure `pointer-events-auto` class on Calendar inside the dialog (per shadcn datepicker guidelines).

### UI Details
- Age displayed as badge: e.g. "8 anos"
- Date picker with `captionLayout="dropdown-buttons"` and `fromYear/toYear` for easy year navigation
- Emoji avatar selector: row of common avatars (👧👦🧒🦊🐱🐶🦁🐸🐼🦄)

