
-- Drop existing triggers if any, then recreate
DROP TRIGGER IF EXISTS audit_ledger_entries ON public.ledger_entries;
DROP TRIGGER IF EXISTS audit_wallets ON public.wallets;
DROP TRIGGER IF EXISTS audit_profiles ON public.profiles;
DROP TRIGGER IF EXISTS audit_consent_records ON public.consent_records;
DROP TRIGGER IF EXISTS audit_user_roles ON public.user_roles;

CREATE TRIGGER audit_ledger_entries
  AFTER INSERT OR UPDATE OR DELETE ON public.ledger_entries
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_fn();

CREATE TRIGGER audit_wallets
  AFTER INSERT OR UPDATE OR DELETE ON public.wallets
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_fn();

CREATE TRIGGER audit_profiles
  AFTER INSERT OR UPDATE OR DELETE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_fn();

CREATE TRIGGER audit_consent_records
  AFTER INSERT OR UPDATE OR DELETE ON public.consent_records
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_fn();

CREATE TRIGGER audit_user_roles
  AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_fn();
