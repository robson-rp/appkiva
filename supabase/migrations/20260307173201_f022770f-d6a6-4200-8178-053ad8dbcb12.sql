
-- 1. Create diary_entries table
CREATE TABLE public.diary_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  text text NOT NULL,
  mood text NOT NULL DEFAULT '😊',
  tags text[] DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.diary_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own diary entries"
  ON public.diary_entries FOR SELECT
  USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own diary entries"
  ON public.diary_entries FOR INSERT
  WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own diary entries"
  ON public.diary_entries FOR DELETE
  USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Parents can view children's diary (household)
CREATE POLICY "Parents can view household diary entries"
  ON public.diary_entries FOR SELECT
  USING (
    has_role(auth.uid(), 'parent'::app_role)
    AND profile_id IN (
      SELECT p.id FROM profiles p WHERE p.household_id = get_user_household_id(auth.uid())
    )
  );

-- 2. Create delete_child_safe RPC
CREATE OR REPLACE FUNCTION public.delete_child_safe(_child_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _parent_profile_id uuid;
  _child_profile_id uuid;
BEGIN
  -- Get caller's profile
  SELECT id INTO _parent_profile_id
  FROM profiles WHERE user_id = auth.uid();

  -- Verify ownership
  SELECT profile_id INTO _child_profile_id
  FROM children
  WHERE id = _child_id AND parent_profile_id = _parent_profile_id;

  IF _child_profile_id IS NULL THEN
    RAISE EXCEPTION 'Criança não encontrada ou não autorizado';
  END IF;

  -- Delete child record (cascade will handle related data)
  DELETE FROM children WHERE id = _child_id;
END;
$$;
