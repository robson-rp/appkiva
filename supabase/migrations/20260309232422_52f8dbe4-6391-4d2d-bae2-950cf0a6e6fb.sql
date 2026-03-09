
-- Weekly challenges table
CREATE TABLE public.weekly_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  type text NOT NULL DEFAULT 'saving',
  icon text NOT NULL DEFAULT '🐷',
  target_value numeric NOT NULL DEFAULT 0,
  current_value numeric NOT NULL DEFAULT 0,
  reward numeric NOT NULL DEFAULT 0,
  kiva_points_reward integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active',
  week_start date NOT NULL DEFAULT date_trunc('week', CURRENT_DATE)::date,
  week_end date NOT NULL DEFAULT (date_trunc('week', CURRENT_DATE) + interval '6 days')::date,
  participant_count integer NOT NULL DEFAULT 0,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.weekly_challenges ENABLE ROW LEVEL SECURITY;

-- Users can view own challenges
CREATE POLICY "Users can view own weekly challenges"
  ON public.weekly_challenges FOR SELECT TO authenticated
  USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Users can update own challenges (progress)
CREATE POLICY "Users can update own weekly challenges"
  ON public.weekly_challenges FOR UPDATE TO authenticated
  USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Admins/teachers can manage all
CREATE POLICY "Admins can manage weekly challenges"
  ON public.weekly_challenges FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- System can insert for any user
CREATE POLICY "System can insert weekly challenges"
  ON public.weekly_challenges FOR INSERT TO authenticated
  WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Classroom members can view challenges of classmates
CREATE POLICY "Classroom members can view peer challenges"
  ON public.weekly_challenges FOR SELECT TO authenticated
  USING (profile_id IN (
    SELECT cs.student_profile_id FROM classroom_students cs
    WHERE cs.classroom_id IN (
      SELECT cs2.classroom_id FROM classroom_students cs2
      WHERE cs2.student_profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    )
  ));

-- Household members can view family challenges  
CREATE POLICY "Household members can view family challenges"
  ON public.weekly_challenges FOR SELECT TO authenticated
  USING (profile_id IN (
    SELECT id FROM profiles WHERE household_id = get_user_household_id(auth.uid())
  ));
