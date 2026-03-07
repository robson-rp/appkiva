
CREATE OR REPLACE FUNCTION public.update_child_profile(
  _child_id uuid,
  _nickname text DEFAULT NULL,
  _avatar text DEFAULT NULL,
  _date_of_birth date DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _parent_profile_id uuid;
  _child_profile_id uuid;
BEGIN
  -- Get the caller's profile id
  SELECT id INTO _parent_profile_id
  FROM profiles WHERE user_id = auth.uid();

  -- Verify this parent owns the child
  SELECT profile_id INTO _child_profile_id
  FROM children
  WHERE id = _child_id AND parent_profile_id = _parent_profile_id;

  IF _child_profile_id IS NULL THEN
    RAISE EXCEPTION 'Child not found or not authorized';
  END IF;

  -- Update children table
  UPDATE children
  SET nickname = COALESCE(_nickname, nickname),
      date_of_birth = _date_of_birth,
      updated_at = now()
  WHERE id = _child_id;

  -- Update profile avatar
  IF _avatar IS NOT NULL THEN
    UPDATE profiles
    SET avatar = _avatar, updated_at = now()
    WHERE id = _child_profile_id;
  END IF;
END;
$$;
