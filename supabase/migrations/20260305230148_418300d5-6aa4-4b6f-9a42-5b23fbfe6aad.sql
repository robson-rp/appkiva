
-- Create enums for task status and category
CREATE TYPE public.task_status AS ENUM ('pending', 'in_progress', 'completed', 'approved');
CREATE TYPE public.task_category AS ENUM ('cleaning', 'studying', 'helping', 'other');

-- Create tasks table
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  reward NUMERIC NOT NULL DEFAULT 0,
  category public.task_category NOT NULL DEFAULT 'other',
  status public.task_status NOT NULL DEFAULT 'pending',
  child_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  parent_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Updated_at trigger
CREATE TRIGGER tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Parents can view tasks they created
CREATE POLICY "Parents can view their tasks"
  ON public.tasks FOR SELECT
  USING (
    parent_profile_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
    OR child_profile_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

-- Parents can create tasks
CREATE POLICY "Parents can create tasks"
  ON public.tasks FOR INSERT
  WITH CHECK (
    parent_profile_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
    AND has_role(auth.uid(), 'parent'::app_role)
  );

-- Parents can update their tasks
CREATE POLICY "Parents can update their tasks"
  ON public.tasks FOR UPDATE
  USING (
    parent_profile_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
    AND has_role(auth.uid(), 'parent'::app_role)
  );

-- Children can update task status (to mark as completed)
CREATE POLICY "Children can update task status"
  ON public.tasks FOR UPDATE
  USING (
    child_profile_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

-- Parents can delete their tasks
CREATE POLICY "Parents can delete their tasks"
  ON public.tasks FOR DELETE
  USING (
    parent_profile_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
    AND has_role(auth.uid(), 'parent'::app_role)
  );
