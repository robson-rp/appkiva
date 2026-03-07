
-- Notification log for throttle tracking
CREATE TABLE notification_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  notification_id uuid REFERENCES notifications(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  date date NOT NULL DEFAULT current_date
);
CREATE INDEX idx_notif_log_profile_date ON notification_log(profile_id, date);

ALTER TABLE notification_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view notification log"
  ON notification_log FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service role can insert notification log"
  ON notification_log FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Throttle check function
CREATE OR REPLACE FUNCTION check_notification_throttle(_profile_id uuid)
RETURNS boolean
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _role text;
  _count integer;
  _max integer;
BEGIN
  SELECT ur.role::text INTO _role FROM user_roles ur
    JOIN profiles p ON p.user_id = ur.user_id
    WHERE p.id = _profile_id LIMIT 1;

  IF _role IN ('admin','teacher','partner') THEN RETURN true; END IF;
  IF _role = 'parent' THEN _max := 3; 
  ELSE _max := 5; END IF;

  SELECT count(*) INTO _count FROM notification_log
    WHERE profile_id = _profile_id AND date = current_date;

  RETURN _count < _max;
END; $$;
