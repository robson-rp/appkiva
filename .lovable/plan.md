

# Smart Notification Engine — KIVARA

## What Already Exists
- `notifications` table with in-app delivery, realtime subscriptions, and `NotificationDropdown` UI
- `notification_templates` table with event-based templates, cooldown, recipient_role config
- `notify.ts` helpers firing on task completion, task approval, new task, savings milestones
- Push notification infrastructure (`push_subscriptions` table + edge function skeleton)
- Admin dashboard with templates, broadcast, history, and stats

## What Needs to Be Built

### 1. Notification Throttle Engine (Database)
- Create a `notification_log` table to track sent notifications per profile per day
- Create a `check_notification_throttle` RPC function that enforces:
  - Children: max 2 notifications/day
  - Parents: max 1 notification/day  
  - Admins: event-based only (no limit)
- Update `notify.ts` `send()` to call throttle check before inserting

### 2. Scheduled Behaviour Triggers (Edge Function)
Create `supabase/functions/notification-engine/index.ts` — a single scheduled function that runs daily and:

- **Daily Learning Reminder**: finds children/teens with no `streak_activities` entry today → sends "Kivo diz: Pronto para o desafio de hoje?"
- **Streak At-Risk Reminder**: finds users with active streak + no activity today (after 16:00) → sends streak warning
- **Savings Milestone Check**: finds dream_vaults/savings_vaults that crossed 25/50/75/100% since last check → sends milestone notification
- **Weekly Parent Report** (runs on Mondays): aggregates child's weekly coins earned, missions completed, savings progress → sends summary notification to parent

Each trigger respects the throttle engine and template system.

### 3. Enhanced notify.ts
- Add throttle check wrapper around `send()`
- Add new helpers: `notifyDailyReminder()`, `notifyStreakAtRisk()`, `notifyWeeklyReport()`
- Add `notifyMissionAvailable()`, `notifySchoolChallenge()`

### 4. Trigger Integration in Existing Code
Wire missing notification triggers into existing mutations:
- `use-rewards.ts` → `notifyRewardClaimed()` when child claims reward
- `use-child-rewards.ts` → call `notifyAchievement()` on badge unlock
- `use-streaks.ts` → call `notifyStreakMilestone()` on milestone days (7, 14, 30)
- `use-donations.ts` → call `notifyDonationMade()` + `notifyChildDonation()`
- `use-lesson-progress.ts` → call `notifyLessonCompleted()`
- Dream vault deposit → call `notifySavingsMilestone()` with percentage check

### 5. Admin Notification Analytics
Enhance `AdminNotifications` page with a new "📊 Métricas" tab:
- Read rate (read/total)
- Notifications per type (bar chart)
- Daily send volume (line chart over 30 days)
- Top templates by engagement

### 6. Cron Schedule
Set up `pg_cron` job to invoke `notification-engine` edge function daily at 10:00 and 16:00.

## Database Changes (Migration)

```sql
-- Notification log for throttle tracking
CREATE TABLE notification_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL,
  notification_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  date date NOT NULL DEFAULT current_date
);
CREATE INDEX idx_notif_log_profile_date ON notification_log(profile_id, date);

ALTER TABLE notification_log ENABLE ROW LEVEL SECURITY;
-- Admin-only access
CREATE POLICY "Admins can view notification log"
  ON notification_log FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- Throttle check function
CREATE OR REPLACE FUNCTION check_notification_throttle(_profile_id uuid)
RETURNS boolean
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _role text;
  _count integer;
  _max integer;
BEGIN
  SELECT ur.role INTO _role FROM user_roles ur
    JOIN profiles p ON p.user_id = ur.user_id
    WHERE p.id = _profile_id LIMIT 1;

  IF _role IN ('admin','teacher','partner') THEN RETURN true; END IF;
  IF _role = 'parent' THEN _max := 3; 
  ELSE _max := 5; END IF;

  SELECT count(*) INTO _count FROM notification_log
    WHERE profile_id = _profile_id AND date = current_date;

  RETURN _count < _max;
END; $$;
```

## Files to Create/Edit

| File | Action |
|------|--------|
| Migration SQL | Create `notification_log` table + throttle RPC |
| `src/lib/notify.ts` | Add throttle check, new helpers |
| `supabase/functions/notification-engine/index.ts` | Create scheduled trigger engine |
| `src/hooks/use-child-rewards.ts` | Wire badge/reward notifications |
| `src/hooks/use-donations.ts` | Wire donation notifications |
| `src/hooks/use-lesson-progress.ts` | Wire lesson completion notifications |
| `src/hooks/use-streaks.ts` | Wire streak milestone notifications |
| `src/hooks/use-dream-vaults.ts` | Wire savings milestone on deposit |
| `src/components/admin/NotificationAnalytics.tsx` | Create metrics tab |
| `src/pages/admin/AdminNotifications.tsx` | Add analytics tab |
| `supabase/config.toml` | N/A (auto-managed) |

## Implementation Order
1. Database migration (notification_log + throttle function)
2. Update `notify.ts` with throttle + new helpers
3. Wire triggers into existing hooks
4. Create notification-engine edge function
5. Build admin analytics tab
6. Set up cron schedule

