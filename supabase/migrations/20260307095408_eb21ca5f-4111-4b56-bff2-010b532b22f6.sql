
-- Add reward_amount to sponsored_challenges (KVC per child completion)
ALTER TABLE public.sponsored_challenges 
  ADD COLUMN reward_amount numeric NOT NULL DEFAULT 0;

-- Add budget_spent to partner_programs to track consumed budget
ALTER TABLE public.partner_programs 
  ADD COLUMN budget_spent numeric NOT NULL DEFAULT 0;

-- Add program_id to sponsored_challenges to link challenges to programs
ALTER TABLE public.sponsored_challenges 
  ADD COLUMN program_id uuid REFERENCES public.partner_programs(id) ON DELETE SET NULL;
