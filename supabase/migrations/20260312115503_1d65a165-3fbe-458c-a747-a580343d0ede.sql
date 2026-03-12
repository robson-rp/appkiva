
CREATE OR REPLACE FUNCTION public.delete_child_safe(_child_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _parent_profile_id uuid;
  _child_profile_id uuid;
  _child_user_id uuid;
BEGIN
  -- Get caller's profile
  SELECT id INTO _parent_profile_id
  FROM profiles WHERE user_id = auth.uid();

  -- Verify ownership and get child's profile_id
  SELECT profile_id INTO _child_profile_id
  FROM children
  WHERE id = _child_id AND parent_profile_id = _parent_profile_id;

  IF _child_profile_id IS NULL THEN
    RAISE EXCEPTION 'Criança não encontrada ou não autorizado';
  END IF;

  -- Get the child's auth user_id before deleting
  SELECT user_id INTO _child_user_id
  FROM profiles WHERE id = _child_profile_id;

  -- Delete child record (cascade will handle related data)
  DELETE FROM children WHERE id = _child_id;

  -- Delete the child's profile
  DELETE FROM profiles WHERE id = _child_profile_id;

  -- Delete user_roles
  IF _child_user_id IS NOT NULL THEN
    DELETE FROM user_roles WHERE user_id = _child_user_id;
  END IF;

  -- Delete the auth user (requires service role, done via trigger or edge function)
  -- We store the user_id to be cleaned up
  IF _child_user_id IS NOT NULL THEN
    DELETE FROM auth.users WHERE id = _child_user_id;
  END IF;
END;
$function$;
