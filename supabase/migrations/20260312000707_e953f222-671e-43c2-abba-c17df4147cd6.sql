
-- Remove duplicate triggers that cause double-firing
DROP TRIGGER IF EXISTS trg_enforce_max_children ON public.children;
DROP TRIGGER IF EXISTS trg_auto_referral_code ON public.profiles;
