-- Restore referral code trigger (was dropped in previous migration)
CREATE TRIGGER on_profile_referral_code
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_create_referral_code();