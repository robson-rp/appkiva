
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _role text;
BEGIN
  INSERT INTO public.profiles (user_id, display_name, avatar)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email, 'Utilizador'),
    COALESCE(NEW.raw_user_meta_data->>'avatar', '👤')
  );

  _role := NEW.raw_user_meta_data->>'role';
  IF _role IS NOT NULL AND _role IN ('parent', 'child', 'teen', 'teacher', 'admin') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, _role::app_role);
  END IF;

  RETURN NEW;
END;
$function$;
