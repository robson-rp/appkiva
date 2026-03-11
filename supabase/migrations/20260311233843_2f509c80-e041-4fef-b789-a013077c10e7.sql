-- Remove duplicate referral code trigger
DROP TRIGGER IF EXISTS on_profile_referral_code ON public.profiles;