
-- Allowance configuration per child
CREATE TABLE public.allowance_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  parent_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  base_amount NUMERIC NOT NULL DEFAULT 25,
  frequency TEXT NOT NULL DEFAULT 'weekly',
  task_bonus NUMERIC NOT NULL DEFAULT 5,
  mission_bonus NUMERIC NOT NULL DEFAULT 10,
  last_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (child_profile_id, parent_profile_id)
);

-- Enable RLS
ALTER TABLE public.allowance_configs ENABLE ROW LEVEL SECURITY;

-- Parents can CRUD their own configs
CREATE POLICY "Parents can view their allowance configs"
  ON public.allowance_configs FOR SELECT
  USING (
    parent_profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Parents can create allowance configs"
  ON public.allowance_configs FOR INSERT
  WITH CHECK (
    parent_profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    AND has_role(auth.uid(), 'parent'::app_role)
  );

CREATE POLICY "Parents can update their allowance configs"
  ON public.allowance_configs FOR UPDATE
  USING (
    parent_profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    AND has_role(auth.uid(), 'parent'::app_role)
  );

CREATE POLICY "Parents can delete their allowance configs"
  ON public.allowance_configs FOR DELETE
  USING (
    parent_profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    AND has_role(auth.uid(), 'parent'::app_role)
  );

-- updated_at trigger
CREATE TRIGGER update_allowance_configs_updated_at
  BEFORE UPDATE ON public.allowance_configs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
