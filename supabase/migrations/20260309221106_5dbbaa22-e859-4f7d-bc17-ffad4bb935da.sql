
-- Create mission_type enum
CREATE TYPE public.mission_type AS ENUM ('saving', 'budgeting', 'planning', 'custom');

-- Create mission_status enum
CREATE TYPE public.mission_status AS ENUM ('available', 'in_progress', 'completed');

-- Create missions table
CREATE TABLE public.missions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  type mission_type NOT NULL DEFAULT 'custom',
  target_amount numeric DEFAULT NULL,
  reward numeric NOT NULL DEFAULT 10,
  kiva_points_reward integer NOT NULL DEFAULT 10,
  status mission_status NOT NULL DEFAULT 'available',
  child_profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  parent_profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  household_id uuid REFERENCES public.households(id) ON DELETE CASCADE,
  week integer NOT NULL DEFAULT (EXTRACT(WEEK FROM now())::integer),
  completed_at timestamptz DEFAULT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;

-- Parents can CRUD missions they created
CREATE POLICY "Parents can create missions"
  ON public.missions FOR INSERT TO public
  WITH CHECK (
    parent_profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    AND has_role(auth.uid(), 'parent'::app_role)
  );

CREATE POLICY "Parents can view household missions"
  ON public.missions FOR SELECT TO public
  USING (
    parent_profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    AND has_role(auth.uid(), 'parent'::app_role)
  );

CREATE POLICY "Parents can update own missions"
  ON public.missions FOR UPDATE TO public
  USING (
    parent_profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    AND has_role(auth.uid(), 'parent'::app_role)
  );

CREATE POLICY "Parents can delete own missions"
  ON public.missions FOR DELETE TO public
  USING (
    parent_profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    AND has_role(auth.uid(), 'parent'::app_role)
  );

-- Children/teens can view their own missions
CREATE POLICY "Children can view own missions"
  ON public.missions FOR SELECT TO public
  USING (
    child_profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

-- Children can update status of their missions (start/complete)
CREATE POLICY "Children can update own mission status"
  ON public.missions FOR UPDATE TO public
  USING (
    child_profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  )
  WITH CHECK (
    child_profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

-- Admins can view all
CREATE POLICY "Admins can view all missions"
  ON public.missions FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));
