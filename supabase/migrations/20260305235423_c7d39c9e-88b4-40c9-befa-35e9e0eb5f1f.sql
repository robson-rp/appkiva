
-- Tighten the INSERT policy to household members only
DROP POLICY "Authenticated users can insert notifications" ON public.notifications;

CREATE POLICY "Household members can insert notifications" ON public.notifications
  FOR INSERT TO authenticated
  WITH CHECK (
    profile_id IN (
      SELECT p.id FROM profiles p 
      WHERE p.household_id = get_user_household_id(auth.uid())
    )
    OR profile_id IN (
      SELECT p.id FROM profiles p WHERE p.user_id = auth.uid()
    )
  );
