
-- Drop the overly permissive policies
DROP POLICY IF EXISTS "System can mark codes as used" ON public.family_invite_codes;
DROP POLICY IF EXISTS "Authenticated can read codes for validation" ON public.family_invite_codes;

-- Replace with a proper UPDATE policy (only the security definer functions handle updates)
-- The validate/claim functions are SECURITY DEFINER so they bypass RLS
-- For SELECT, allow unauthenticated reads of non-used codes for signup validation via the security definer function
-- No direct UPDATE policy needed since claim_invite_code is SECURITY DEFINER
