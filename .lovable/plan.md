

## Plan: Persistent Lesson Progress

### Overview
Replace the in-memory `completedIds` and `earnedPoints` state in `LearnPage` with database-backed progress tracking per user.

### 1. Database Migration

Create table **`lesson_progress`**:

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | default gen_random_uuid() |
| profile_id | uuid NOT NULL | references user's profile |
| lesson_id | uuid NOT NULL | references lessons table |
| score | integer NOT NULL | quiz score percentage |
| kiva_points_earned | integer NOT NULL | points awarded |
| completed_at | timestamptz | default now() |

Unique constraint on `(profile_id, lesson_id)` to prevent duplicates.

**RLS policies**:
- Users can SELECT their own progress (`profile_id` matches auth user's profile)
- Users can INSERT their own progress
- No UPDATE/DELETE needed (completed = permanent)

### 2. New Hook: `use-lesson-progress.ts`

- `useLessonProgress()` — fetches all `lesson_progress` rows for the current user's profile, returns `{ completedIds: Set<string>, totalPoints: number }`
- `useCompleteLessonMutation()` — inserts a row into `lesson_progress` with upsert on `(profile_id, lesson_id)`, invalidates the query cache on success

### 3. Update `LearnPage.tsx`

- Remove local `completedIds` and `earnedPoints` state
- Use `useLessonProgress()` for reading completed lessons and total points
- In `handleComplete`, call the mutation to persist completion, then show toast on success
- Progress summary card reads from the hook instead of local state

### Files to Create/Modify

| File | Action |
|---|---|
| DB migration | Create `lesson_progress` table with RLS |
| `src/hooks/use-lesson-progress.ts` | New hook for reading/writing progress |
| `src/pages/shared/LearnPage.tsx` | Replace local state with persistent hook |

