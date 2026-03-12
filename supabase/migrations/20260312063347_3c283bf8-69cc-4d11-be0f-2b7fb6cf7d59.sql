
CREATE OR REPLACE FUNCTION public.enforce_max_children()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _tenant_id uuid;
  _max_children int;
  _extra_purchased int;
  _current_count int;
BEGIN
  SELECT p.tenant_id INTO _tenant_id
  FROM profiles p
  WHERE p.id = NEW.parent_profile_id;

  IF _tenant_id IS NULL THEN
    SELECT COUNT(*) INTO _current_count
    FROM children
    WHERE parent_profile_id = NEW.parent_profile_id;

    IF _current_count >= 2 THEN
      RAISE EXCEPTION 'Limite de crianças atingido. Faça upgrade do plano para adicionar mais crianças.';
    END IF;
    RETURN NEW;
  END IF;

  SELECT COALESCE(st.max_children, 2), COALESCE(t.extra_children_purchased, 0)
  INTO _max_children, _extra_purchased
  FROM tenants t
  LEFT JOIN subscription_tiers st ON t.subscription_tier_id = st.id
  WHERE t.id = _tenant_id;

  _max_children := _max_children + _extra_purchased;

  SELECT COUNT(*) INTO _current_count
  FROM children
  WHERE parent_profile_id = NEW.parent_profile_id;

  IF _current_count >= _max_children THEN
    RAISE EXCEPTION 'Limite de crianças atingido (% de %). Faça upgrade do plano para adicionar mais crianças.', _current_count, _max_children;
  END IF;

  RETURN NEW;
END;
$function$;
