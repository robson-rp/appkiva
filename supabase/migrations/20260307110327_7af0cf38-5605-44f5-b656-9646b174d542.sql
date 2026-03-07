
ALTER TABLE public.children 
ADD COLUMN IF NOT EXISTS daily_spend_limit numeric NOT NULL DEFAULT 50;
