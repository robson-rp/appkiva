
-- Create enum for reward category
CREATE TYPE public.reward_category AS ENUM ('experience', 'privilege', 'physical', 'digital');

-- Create rewards table
CREATE TABLE public.rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  icon TEXT NOT NULL DEFAULT '🎁',
  category public.reward_category NOT NULL DEFAULT 'experience',
  available BOOLEAN NOT NULL DEFAULT true,
  parent_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  claimed_by UUID REFERENCES public.profiles(id),
  claimed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Updated_at trigger
CREATE TRIGGER rewards_updated_at
  BEFORE UPDATE ON public.rewards
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;

-- Parents can view their rewards
CREATE POLICY "Parents can view their rewards"
  ON public.rewards FOR SELECT
  USING (
    parent_profile_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

-- Children can view rewards from their parent
CREATE POLICY "Children can view family rewards"
  ON public.rewards FOR SELECT
  USING (
    parent_profile_id IN (
      SELECT c.parent_profile_id FROM public.children c
      WHERE c.profile_id IN (
        SELECT id FROM public.profiles WHERE user_id = auth.uid()
      )
    )
  );

-- Parents can create rewards
CREATE POLICY "Parents can create rewards"
  ON public.rewards FOR INSERT
  WITH CHECK (
    parent_profile_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
    AND has_role(auth.uid(), 'parent'::app_role)
  );

-- Parents can update their rewards
CREATE POLICY "Parents can update their rewards"
  ON public.rewards FOR UPDATE
  USING (
    parent_profile_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
    AND has_role(auth.uid(), 'parent'::app_role)
  );

-- Parents can delete their rewards
CREATE POLICY "Parents can delete their rewards"
  ON public.rewards FOR DELETE
  USING (
    parent_profile_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
    AND has_role(auth.uid(), 'parent'::app_role)
  );
