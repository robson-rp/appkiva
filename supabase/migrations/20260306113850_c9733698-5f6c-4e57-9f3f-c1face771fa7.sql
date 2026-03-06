
-- Phase 3: Audit Logging & Compliance

-- 1. Audit action enum
CREATE TYPE public.audit_action AS ENUM (
  'insert', 'update', 'delete',
  'login', 'logout',
  'consent_granted', 'consent_revoked',
  'role_changed', 'wallet_transfer',
  'admin_action'
);

-- 2. Audit log table (append-only)
CREATE TABLE public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id),
  user_id uuid,
  profile_id uuid,
  action audit_action NOT NULL,
  resource_type text NOT NULL,
  resource_id text,
  old_values jsonb,
  new_values jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Admin-only read, no update/delete
CREATE POLICY "Admins can view audit logs"
  ON public.audit_log FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 3. Audit trigger function (SECURITY DEFINER to bypass RLS)
CREATE OR REPLACE FUNCTION public.audit_trigger_fn()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _action audit_action;
  _old jsonb;
  _new jsonb;
  _resource_id text;
BEGIN
  IF TG_OP = 'INSERT' THEN
    _action := 'insert';
    _old := NULL;
    _new := to_jsonb(NEW);
    _resource_id := NEW.id::text;
  ELSIF TG_OP = 'UPDATE' THEN
    _action := 'update';
    _old := to_jsonb(OLD);
    _new := to_jsonb(NEW);
    _resource_id := NEW.id::text;
  ELSIF TG_OP = 'DELETE' THEN
    _action := 'delete';
    _old := to_jsonb(OLD);
    _new := NULL;
    _resource_id := OLD.id::text;
  END IF;

  INSERT INTO public.audit_log (action, resource_type, resource_id, old_values, new_values)
  VALUES (_action, TG_TABLE_NAME, _resource_id, _old, _new);

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

-- 4. Attach triggers to critical tables
CREATE TRIGGER audit_ledger_entries
  AFTER INSERT ON public.ledger_entries
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_fn();

CREATE TRIGGER audit_wallets
  AFTER INSERT OR UPDATE ON public.wallets
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_fn();

CREATE TRIGGER audit_profiles
  AFTER UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_fn();

CREATE TRIGGER audit_consent_records
  AFTER INSERT ON public.consent_records
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_fn();

CREATE TRIGGER audit_user_roles
  AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_fn();

-- 5. Enhance consent_records
ALTER TABLE public.consent_records
  ADD COLUMN ip_metadata jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN revocation_reason text;

-- 6. Index for efficient querying
CREATE INDEX idx_audit_log_created_at ON public.audit_log(created_at DESC);
CREATE INDEX idx_audit_log_resource_type ON public.audit_log(resource_type);
CREATE INDEX idx_audit_log_action ON public.audit_log(action);
