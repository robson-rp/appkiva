
-- Trusted devices for 2FA "trust this device" feature
CREATE TABLE public.trusted_devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  device_token text NOT NULL UNIQUE,
  trusted_until timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.trusted_devices ENABLE ROW LEVEL SECURITY;

-- Only readable by the owning user (edge function uses service role for writes)
CREATE POLICY "Users can view own trusted devices"
  ON public.trusted_devices
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());
