-- Update handle_new_user to auto-create household for parents
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _role text;
  _country text;
  _gender text;
  _phone text;
  _institution_name text;
  _sector text;
  _school_tenant_id uuid;
  _profile_id uuid;
  _household_id uuid;
BEGIN
  _country := COALESCE(NEW.raw_user_meta_data->>'country', 'AO');
  _gender := NEW.raw_user_meta_data->>'gender';
  _phone := COALESCE(NEW.phone, NEW.raw_user_meta_data->>'phone');
  _institution_name := NEW.raw_user_meta_data->>'institution_name';
  _sector := NEW.raw_user_meta_data->>'sector';
  
  IF NEW.raw_user_meta_data->>'school_tenant_id' IS NOT NULL THEN
    _school_tenant_id := (NEW.raw_user_meta_data->>'school_tenant_id')::uuid;
  END IF;

  _role := NEW.raw_user_meta_data->>'role';

  -- Auto-create household for parents
  IF _role = 'parent' THEN
    INSERT INTO public.households (name)
    VALUES (COALESCE(NEW.raw_user_meta_data->>'display_name', 'Família'))
    RETURNING id INTO _household_id;
  END IF;

  INSERT INTO public.profiles (user_id, display_name, avatar, country, gender, phone, institution_name, sector, school_tenant_id, household_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email, NEW.phone, 'Utilizador'),
    COALESCE(NEW.raw_user_meta_data->>'avatar', '👤'),
    _country,
    _gender,
    _phone,
    _institution_name,
    _sector,
    _school_tenant_id,
    _household_id
  )
  RETURNING id INTO _profile_id;

  IF _role IS NOT NULL AND _role IN ('parent', 'child', 'teen', 'teacher', 'admin', 'partner') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, _role::app_role);
  END IF;

  RETURN NEW;
END;
$function$;

-- Create a function to ensure a parent has a household (for existing parents)
CREATE OR REPLACE FUNCTION public.ensure_parent_household(_profile_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _existing_household_id uuid;
  _display_name text;
BEGIN
  SELECT household_id, display_name INTO _existing_household_id, _display_name
  FROM profiles WHERE id = _profile_id;

  IF _existing_household_id IS NOT NULL THEN
    RETURN _existing_household_id;
  END IF;

  INSERT INTO households (name)
  VALUES (COALESCE(_display_name, 'Família'))
  RETURNING id INTO _existing_household_id;

  UPDATE profiles SET household_id = _existing_household_id WHERE id = _profile_id;

  RETURN _existing_household_id;
END;
$function$;