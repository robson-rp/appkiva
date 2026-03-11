-- Restore auth trigger for auto-creating profiles on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Restore referral code trigger (if missing)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_profile_referral_code') THEN
    CREATE TRIGGER on_profile_referral_code
      AFTER INSERT ON public.profiles
      FOR EACH ROW
      EXECUTE FUNCTION public.auto_create_referral_code();
  END IF;
END $$;

-- Restore enforce_max_children trigger (if missing)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'enforce_max_children_trigger') THEN
    CREATE TRIGGER enforce_max_children_trigger
      BEFORE INSERT ON public.children
      FOR EACH ROW
      EXECUTE FUNCTION public.enforce_max_children();
  END IF;
END $$;