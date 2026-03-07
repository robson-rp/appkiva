CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _role text;
  _country text;
BEGIN
  _country := COALESCE(NEW.raw_user_meta_data->>'country', 'AO');

  INSERT INTO public.profiles (user_id, display_name, avatar, country)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email, 'Utilizador'),
    COALESCE(NEW.raw_user_meta_data->>'avatar', '👤'),
    _country
  );

  _role := NEW.raw_user_meta_data->>'role';
  IF _role IS NOT NULL AND _role IN ('parent', 'child', 'teen', 'teacher', 'admin', 'partner') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, _role::app_role);
  END IF;

  RETURN NEW;
END;
$function$;