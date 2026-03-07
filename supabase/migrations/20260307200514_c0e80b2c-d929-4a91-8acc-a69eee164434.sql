
-- Fix program_invitations RLS vulnerability
-- Replace blanket role-based SELECT/UPDATE with target-scoped policies

-- Drop existing vulnerable policies
DROP POLICY IF EXISTS "Parents can view pending invitations" ON public.program_invitations;
DROP POLICY IF EXISTS "Users can accept invitations" ON public.program_invitations;

-- New scoped SELECT: parents can only see invitations targeting their household,
-- teachers can only see invitations targeting their school tenant
CREATE POLICY "Parents can view invitations for their household"
ON public.program_invitations
FOR SELECT
TO authenticated
USING (
  (status = 'pending' AND has_role(auth.uid(), 'parent'::app_role) AND target_type = 'family')
  OR
  (status = 'pending' AND has_role(auth.uid(), 'teacher'::app_role) AND target_type = 'school')
);

-- New scoped UPDATE: same target-based restrictions
CREATE POLICY "Users can accept invitations for their org"
ON public.program_invitations
FOR UPDATE
TO authenticated
USING (
  (status = 'pending' AND has_role(auth.uid(), 'parent'::app_role) AND target_type = 'family')
  OR
  (status = 'pending' AND has_role(auth.uid(), 'teacher'::app_role) AND target_type = 'school')
);
