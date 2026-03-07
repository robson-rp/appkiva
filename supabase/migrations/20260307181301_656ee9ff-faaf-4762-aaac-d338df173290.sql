
-- Fix overly permissive INSERT policy - scope to household members inserting for each other
DROP POLICY "Service role can insert notification log" ON notification_log;

CREATE POLICY "Users can insert own notification log"
  ON notification_log FOR INSERT
  TO authenticated
  WITH CHECK (
    profile_id IN (
      SELECT p.id FROM profiles p
      WHERE p.household_id = get_user_household_id(auth.uid())
    )
    OR profile_id IN (
      SELECT p.id FROM profiles p WHERE p.user_id = auth.uid()
    )
  );
