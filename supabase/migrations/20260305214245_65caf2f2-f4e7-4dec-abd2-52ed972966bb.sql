
-- Update handle_new_user to also assign role from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _role text;
BEGIN
  -- Create profile
  INSERT INTO public.profiles (user_id, display_name, avatar)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email, 'Utilizador'),
    COALESCE(NEW.raw_user_meta_data->>'avatar', '👤')
  );

  -- Assign role from metadata
  _role := NEW.raw_user_meta_data->>'role';
  IF _role IS NOT NULL AND _role IN ('parent', 'child', 'teen', 'teacher') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, _role::app_role);
  END IF;

  RETURN NEW;
END;
$$;
