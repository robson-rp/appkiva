

## Plan: AI Lesson Generator, Recurring Tasks, and Donations System

This is a large scope covering three distinct features. Here is the breakdown.

---

### Feature 1: AI-Powered Lesson Generator (Admin Panel)

Add a "Generate with AI" button to the admin lessons page that creates a complete lesson (blocks + quiz + metadata) based on category and difficulty selection.

**Database**: No schema changes needed -- lessons table already supports all fields.

**Backend (Edge Function)**: `supabase/functions/generate-lesson/index.ts`
- Accepts `{ category, difficulty, topic?: string }` 
- Uses Lovable AI (`google/gemini-3-flash-preview`) with a structured prompt to generate lesson content in Portuguese
- Returns complete lesson JSON (title, description, icon, blocks with text/tip/example/highlight types, 3-question quiz with options and explanations, estimated_minutes, kiva_points_reward)
- Uses tool calling to extract structured output reliably
- Config: `verify_jwt = false` in config.toml

**Frontend (`AdminLessons.tsx`)**:
- Add "Gerar com IA" button next to "Nova Lição"
- Small dialog: pick category + difficulty + optional topic hint
- On submit, call edge function, receive generated lesson, populate the edit form so admin can review/adjust before saving
- Blocks and quiz fields pre-filled with generated JSON

**Media (images/videos)**: For now, add support for `image` and `video` block types in the lesson viewer and data model. The AI prompt will include URLs for instructional videos (YouTube embeds) where relevant. Image generation can use the Nano banana model for lesson illustrations.

**Changes to `LessonViewer.tsx`**: Add rendering for `image` and `video` block types (img tag and iframe for YouTube).

| File | Action |
|---|---|
| `supabase/functions/generate-lesson/index.ts` | New edge function |
| `supabase/config.toml` | Add function config |
| `src/pages/admin/AdminLessons.tsx` | Add AI generate button + dialog |
| `src/components/LessonViewer.tsx` | Support image/video blocks |

---

### Feature 2: Auto-Generated and Recurring Tasks

Allow parents (and later teachers/partners) to create recurring tasks that automatically repeat daily, weekly, or monthly.

**Database Migration**:
- Add columns to `tasks` table: `is_recurring boolean DEFAULT false`, `recurrence text` ('daily'|'weekly'|'monthly'), `recurrence_source_id uuid` (links copies to original)
- Create edge function `generate-recurring-tasks` that clones pending tasks based on recurrence schedule

**Backend**: 
- Edge function `generate-recurring-tasks/index.ts` -- queries recurring task templates, creates new task instances if the previous period's task was completed/approved
- Optional: AI task suggestion via a `suggest-tasks` edge function using Lovable AI that proposes age-appropriate tasks based on child profile

**Frontend (`ParentTasks.tsx`)**:
- Add recurrence selector (None/Daily/Weekly/Monthly) to create task dialog
- Add "Sugerir com IA" button that generates task ideas based on category and child age
- Visual badge on recurring tasks

| File | Action |
|---|---|
| DB migration | Add recurring columns to tasks |
| `supabase/functions/generate-recurring-tasks/index.ts` | New edge function |
| `supabase/functions/suggest-tasks/index.ts` | New AI suggestion function |
| `supabase/config.toml` | Add function configs |
| `src/hooks/use-household-tasks.ts` | Update create mutation for recurrence fields |
| `src/pages/parent/ParentTasks.tsx` | Add recurrence UI + AI suggest button |

---

### Feature 3: Donations System (Database-Backed)

Replace mock donation data with a real database model. Allow children to donate KivaCoins to causes, with parents/admins managing causes.

**Database Migration**:
- `donation_causes` table: id, name, description, icon, category (education/solidarity/environment), total_received, is_active, created_by, tenant_id
- `donations` table: id, profile_id, cause_id, amount, created_at -- linked to ledger via the existing `create-transaction` edge function with `entry_type = 'donation'`
- RLS: anyone can view active causes; authenticated users can donate (insert); admins can manage causes

**Backend**: 
- Donations flow through the existing `create-transaction` edge function (already supports `donation` entry type)
- After successful transaction, insert into `donations` table and increment `total_received` on the cause

**Frontend**:
- New hook `use-donations.ts`: fetch causes, make donation (calls create-transaction + inserts donation record), fetch user donation history
- Update `ChildWallet.tsx`: replace `mockDonationCauses` with real data
- Optional: Admin page for managing donation causes

| File | Action |
|---|---|
| DB migration | Create donation_causes + donations tables with RLS |
| `src/hooks/use-donations.ts` | New hook |
| `src/pages/child/ChildWallet.tsx` | Replace mock data with real queries |
| `src/pages/admin/AdminDashboard.tsx` | Optional: link to causes management |

---

### Implementation Order

1. **Feature 1** (AI Lessons) -- highest impact, admin-facing, no breaking changes
2. **Feature 3** (Donations) -- replaces mock data, child-facing
3. **Feature 2** (Recurring Tasks) -- schema extension, needs cron setup

Total: ~8 files to create, ~5 files to modify, 2 DB migrations, 2-3 new edge functions.

