

## Plan: Admin Splash Screen Management

### Problem
Onboarding steps are hardcoded in `src/data/onboarding-steps.ts`. Admins cannot edit titles, descriptions, reorder steps, or add/remove steps without code changes.

### Approach
Move onboarding step content to the database and add a management UI in the existing AdminOnboarding page using tabs (Analytics + Gestao).

### Database Changes

**New table: `onboarding_steps`**

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| role | text | parent, child, teen, teacher, admin, partner |
| step_index | integer | order within role |
| title | text | |
| description | text | |
| illustration_key | text | maps to SplashIllustration |
| cta | text | nullable, button label for first step |
| is_active | boolean | default true |
| created_at / updated_at | timestamptz | |

**RLS**: Admin-only for all operations. Authenticated users can SELECT active steps.

**Seed migration**: Insert all current hardcoded steps from `onboarding-steps.ts` into the new table.

### File Changes

| File | Action |
|---|---|
| Migration SQL | Create `onboarding_steps` table + seed data + RLS |
| `src/hooks/use-onboarding.ts` | Fetch steps from DB instead of hardcoded import; fallback to hardcoded if empty |
| `src/pages/admin/AdminOnboarding.tsx` | Add Tabs: "Analytics" (existing) + "Gestao" with per-role step editor |
| `src/data/onboarding-steps.ts` | Keep as fallback only |

### Admin UI (Gestao Tab)

- Role selector (tabs or dropdown) to filter steps
- Card list showing each step with: title, description, illustration key, CTA, sort order
- Inline edit dialog (Dialog with form) to update title, description, CTA
- Add new step button per role
- Delete step with confirmation
- Drag-free reorder via up/down arrow buttons (swap `step_index`)
- Live preview thumbnail showing the SplashIllustration for the selected `illustration_key`
- Dropdown of available illustration keys from SplashIllustration component

### Hook Changes

- `use-onboarding.ts`: Query `onboarding_steps` table filtered by role, ordered by `step_index`, where `is_active = true`
- Map DB rows to the existing `OnboardingStep` interface
- Keep hardcoded data as fallback if DB query returns empty (graceful degradation)

