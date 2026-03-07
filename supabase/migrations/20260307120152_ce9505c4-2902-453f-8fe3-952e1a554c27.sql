
-- Feature 2: Add recurring task columns
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS is_recurring boolean DEFAULT false;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS recurrence text;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS recurrence_source_id uuid REFERENCES public.tasks(id) ON DELETE SET NULL;

-- Feature 3: Donation causes table
CREATE TABLE public.donation_causes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  icon text DEFAULT '💜',
  category text DEFAULT 'solidarity',
  total_received numeric DEFAULT 0,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.donation_causes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active causes"
  ON public.donation_causes FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage causes"
  ON public.donation_causes FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Donations table
CREATE TABLE public.donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  cause_id uuid NOT NULL REFERENCES public.donation_causes(id) ON DELETE CASCADE,
  amount numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own donations"
  ON public.donations FOR SELECT
  USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own donations"
  ON public.donations FOR INSERT
  WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins can view all donations"
  ON public.donations FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));
