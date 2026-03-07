
-- Trigger to enforce max_children based on subscription tier
CREATE OR REPLACE FUNCTION public.enforce_max_children()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _tenant_id uuid;
  _max_children int;
  _current_count int;
BEGIN
  -- Get parent's tenant
  SELECT p.tenant_id INTO _tenant_id
  FROM profiles p
  WHERE p.id = NEW.parent_profile_id;

  IF _tenant_id IS NULL THEN
    -- No tenant, allow default of 2
    SELECT COUNT(*) INTO _current_count
    FROM children
    WHERE parent_profile_id = NEW.parent_profile_id;

    IF _current_count >= 2 THEN
      RAISE EXCEPTION 'Limite de crianças atingido. Faça upgrade do plano para adicionar mais crianças.';
    END IF;
    RETURN NEW;
  END IF;

  -- Get max_children from subscription tier
  SELECT COALESCE(st.max_children, 2) INTO _max_children
  FROM tenants t
  LEFT JOIN subscription_tiers st ON t.subscription_tier_id = st.id
  WHERE t.id = _tenant_id;

  -- Count existing children for this parent
  SELECT COUNT(*) INTO _current_count
  FROM children
  WHERE parent_profile_id = NEW.parent_profile_id;

  IF _current_count >= _max_children THEN
    RAISE EXCEPTION 'Limite de crianças atingido (% de %). Faça upgrade do plano para adicionar mais crianças.', _current_count, _max_children;
  END IF;

  RETURN NEW;
END;
$$;

-- Attach trigger to children table
DROP TRIGGER IF EXISTS trg_enforce_max_children ON public.children;
CREATE TRIGGER trg_enforce_max_children
  BEFORE INSERT ON public.children
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_max_children();
