
-- 1. Badges definition table
CREATE TABLE public.badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  icon text NOT NULL DEFAULT '🏆',
  category text NOT NULL DEFAULT 'saving',
  tier text NOT NULL DEFAULT 'bronze',
  requirement text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active badges" ON public.badges
  FOR SELECT TO authenticated USING (is_active = true);

CREATE POLICY "Admins can manage badges" ON public.badges
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 2. Badge progress per profile
CREATE TABLE public.badge_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_id uuid NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  unlocked_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(profile_id, badge_id)
);

ALTER TABLE public.badge_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own badge progress" ON public.badge_progress
  FOR SELECT TO authenticated
  USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own badge progress" ON public.badge_progress
  FOR INSERT TO authenticated
  WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Household members can view badge progress" ON public.badge_progress
  FOR SELECT TO authenticated
  USING (profile_id IN (
    SELECT p.id FROM profiles p WHERE p.household_id = get_user_household_id(auth.uid())
  ));

CREATE POLICY "Teachers can view student badge progress" ON public.badge_progress
  FOR SELECT TO authenticated
  USING (
    has_role(auth.uid(), 'teacher'::app_role) AND
    profile_id IN (
      SELECT cs.student_profile_id FROM classroom_students cs
      JOIN classrooms c ON c.id = cs.classroom_id
      WHERE c.teacher_profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    )
  );

-- 3. Collective challenges table (for teachers)
CREATE TABLE public.collective_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  classroom_id uuid NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
  teacher_profile_id uuid NOT NULL REFERENCES public.profiles(id),
  type text NOT NULL DEFAULT 'saving',
  icon text NOT NULL DEFAULT '🐷',
  target_amount numeric NOT NULL DEFAULT 0,
  current_amount numeric NOT NULL DEFAULT 0,
  reward numeric NOT NULL DEFAULT 0,
  kiva_points_reward integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'upcoming',
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  end_date date NOT NULL DEFAULT (CURRENT_DATE + 7),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.collective_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can manage own challenges" ON public.collective_challenges
  FOR ALL TO authenticated
  USING (teacher_profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) AND has_role(auth.uid(), 'teacher'::app_role))
  WITH CHECK (teacher_profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) AND has_role(auth.uid(), 'teacher'::app_role));

CREATE POLICY "Students can view classroom challenges" ON public.collective_challenges
  FOR SELECT TO authenticated
  USING (classroom_id IN (
    SELECT cs.classroom_id FROM classroom_students cs
    WHERE cs.student_profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  ));

CREATE POLICY "Admins can view all challenges" ON public.collective_challenges
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));
