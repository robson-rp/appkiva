
-- Budget exception request statuses
CREATE TYPE public.budget_exception_status AS ENUM ('pending', 'approved', 'rejected');

-- Budget exception requests table
CREATE TABLE public.budget_exception_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_profile_id UUID NOT NULL REFERENCES public.profiles(id),
  parent_profile_id UUID NOT NULL REFERENCES public.profiles(id),
  reward_id UUID NOT NULL REFERENCES public.rewards(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  status budget_exception_status NOT NULL DEFAULT 'pending',
  reason TEXT,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.budget_exception_requests ENABLE ROW LEVEL SECURITY;

-- Children can create requests for themselves
CREATE POLICY "Children can create own requests"
  ON public.budget_exception_requests FOR INSERT
  WITH CHECK (
    child_profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

-- Children can view own requests
CREATE POLICY "Children can view own requests"
  ON public.budget_exception_requests FOR SELECT
  USING (
    child_profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

-- Parents can view requests from their household
CREATE POLICY "Parents can view household requests"
  ON public.budget_exception_requests FOR SELECT
  USING (
    parent_profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    AND has_role(auth.uid(), 'parent'::app_role)
  );

-- Parents can update (approve/reject) requests
CREATE POLICY "Parents can update household requests"
  ON public.budget_exception_requests FOR UPDATE
  USING (
    parent_profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    AND has_role(auth.uid(), 'parent'::app_role)
  );
