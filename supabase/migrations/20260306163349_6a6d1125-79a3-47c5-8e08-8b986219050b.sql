
-- Streaks table: one row per user
CREATE TABLE public.streaks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  current_streak integer NOT NULL DEFAULT 0,
  longest_streak integer NOT NULL DEFAULT 0,
  total_active_days integer NOT NULL DEFAULT 0,
  last_active_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(profile_id)
);

-- Streak activity log: one row per active day
CREATE TABLE public.streak_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  active_date date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(profile_id, active_date)
);

-- Streak reward claims
CREATE TABLE public.streak_reward_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  milestone_days integer NOT NULL,
  kiva_points integer NOT NULL DEFAULT 0,
  claimed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(profile_id, milestone_days)
);

-- RLS
ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streak_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streak_reward_claims ENABLE ROW LEVEL SECURITY;

-- Streaks policies
CREATE POLICY "Users can view own streak" ON public.streaks
  FOR SELECT TO authenticated
  USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own streak" ON public.streaks
  FOR INSERT TO authenticated
  WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own streak" ON public.streaks
  FOR UPDATE TO authenticated
  USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Parents can view household streaks
CREATE POLICY "Parents can view household streaks" ON public.streaks
  FOR SELECT TO authenticated
  USING (profile_id IN (
    SELECT id FROM profiles WHERE household_id = get_user_household_id(auth.uid())
  ));

-- Streak activities policies
CREATE POLICY "Users can view own activities" ON public.streak_activities
  FOR SELECT TO authenticated
  USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own activities" ON public.streak_activities
  FOR INSERT TO authenticated
  WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Parents can view household activities" ON public.streak_activities
  FOR SELECT TO authenticated
  USING (profile_id IN (
    SELECT id FROM profiles WHERE household_id = get_user_household_id(auth.uid())
  ));

-- Streak reward claims policies
CREATE POLICY "Users can view own claims" ON public.streak_reward_claims
  FOR SELECT TO authenticated
  USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own claims" ON public.streak_reward_claims
  FOR INSERT TO authenticated
  WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Trigger for updated_at on streaks
CREATE TRIGGER update_streaks_updated_at
  BEFORE UPDATE ON public.streaks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to record daily activity and update streak
CREATE OR REPLACE FUNCTION public.record_daily_activity(_profile_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _today date := current_date;
  _yesterday date := current_date - 1;
  _streak record;
  _already_recorded boolean;
  _new_current integer;
  _new_longest integer;
BEGIN
  -- Check if already recorded today
  SELECT EXISTS(
    SELECT 1 FROM streak_activities 
    WHERE profile_id = _profile_id AND active_date = _today
  ) INTO _already_recorded;

  IF _already_recorded THEN
    SELECT current_streak, longest_streak, total_active_days
    INTO _streak FROM streaks WHERE profile_id = _profile_id;
    RETURN jsonb_build_object(
      'recorded', false,
      'current_streak', COALESCE(_streak.current_streak, 0),
      'longest_streak', COALESCE(_streak.longest_streak, 0),
      'total_active_days', COALESCE(_streak.total_active_days, 0)
    );
  END IF;

  -- Insert activity
  INSERT INTO streak_activities (profile_id, active_date) VALUES (_profile_id, _today);

  -- Get or create streak record
  INSERT INTO streaks (profile_id, current_streak, longest_streak, total_active_days, last_active_date)
  VALUES (_profile_id, 0, 0, 0, NULL)
  ON CONFLICT (profile_id) DO NOTHING;

  SELECT * INTO _streak FROM streaks WHERE profile_id = _profile_id;

  -- Calculate new streak
  IF _streak.last_active_date = _yesterday THEN
    _new_current := _streak.current_streak + 1;
  ELSIF _streak.last_active_date = _today THEN
    _new_current := _streak.current_streak;
  ELSE
    _new_current := 1;
  END IF;

  _new_longest := GREATEST(_streak.longest_streak, _new_current);

  UPDATE streaks SET
    current_streak = _new_current,
    longest_streak = _new_longest,
    total_active_days = _streak.total_active_days + 1,
    last_active_date = _today
  WHERE profile_id = _profile_id;

  RETURN jsonb_build_object(
    'recorded', true,
    'current_streak', _new_current,
    'longest_streak', _new_longest,
    'total_active_days', _streak.total_active_days + 1
  );
END;
$$;
