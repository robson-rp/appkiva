

## Plan: Lesson Management System (Database + Admin Panel)

### Overview
Migrate micro-lessons from static code (`lessons-data.ts`) to the database and create an admin CRUD panel at `/admin/lessons` for managing them without code changes.

### 1. Database Migration

Create two tables:

**`lessons`** — stores each micro-lesson:
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| title | text | |
| description | text | |
| icon | text | default '📚' |
| category | text | saving/budgeting/investing/earning/donating |
| difficulty | text | beginner/intermediate/advanced |
| estimated_minutes | int | default 3 |
| kiva_points_reward | int | default 15 |
| blocks | jsonb | array of `{type, content, icon?}` |
| quiz | jsonb | array of `{id, question, options, correctOptionId, explanation}` |
| sort_order | int | default 0, for ordering |
| is_active | boolean | default true |
| created_at / updated_at | timestamptz | |

**RLS**: Admins can CRUD all. Authenticated users can SELECT where `is_active = true`.

Seed existing 6 lessons from `lessons-data.ts` via INSERT.

### 2. Data Hook: `use-lessons.ts`

New hook that fetches lessons from DB ordered by `sort_order`. Falls back to `mockLessons` if query returns empty (hybrid strategy). Returns data typed as `MicroLesson[]`.

### 3. Update `LearnPage.tsx`

Replace `import { mockLessons }` with `useLessons()` hook. Minimal change — the `MicroLesson` interface stays the same.

### 4. Admin Lessons Page (`/admin/lessons`)

Full CRUD page with:
- **List view**: table showing title, category, difficulty, points, active status, sort order, with edit/delete actions
- **Create/Edit dialog**: form with fields for all lesson properties, including a JSON editor for blocks and quiz (structured form with add/remove items)
- **Toggle active**: quick switch to enable/disable lessons
- **Reorder**: sort_order field for manual ordering

### 5. Routing & Navigation

- Add route `/admin/lessons` in `App.tsx`
- Add nav item "Lições" with `BookOpen` icon in `AdminLayout.tsx` sidebar

### Files to Create/Modify
| File | Action |
|---|---|
| Migration SQL | Create `lessons` table + seed data |
| `src/hooks/use-lessons.ts` | New — fetch lessons from DB |
| `src/pages/admin/AdminLessons.tsx` | New — admin CRUD page |
| `src/pages/shared/LearnPage.tsx` | Use `useLessons()` instead of static import |
| `src/App.tsx` | Add admin/lessons route |
| `src/components/layouts/AdminLayout.tsx` | Add "Lições" nav item |

