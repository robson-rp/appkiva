-- Allow parents to update (revoke) consent records they granted
CREATE POLICY "Parents can revoke own consent"
ON public.consent_records
FOR UPDATE
TO authenticated
USING (
  adult_profile_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  )
  AND has_role(auth.uid(), 'parent'::app_role)
)
WITH CHECK (
  adult_profile_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  )
  AND has_role(auth.uid(), 'parent'::app_role)
);

-- Allow admins to view all consent records
CREATE POLICY "Admins can view all consent records"
ON public.consent_records
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));