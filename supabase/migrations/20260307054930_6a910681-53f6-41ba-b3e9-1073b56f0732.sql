-- Change default currency from USD to AOA on tenants and subscription_tiers
ALTER TABLE public.tenants ALTER COLUMN currency SET DEFAULT 'AOA';
ALTER TABLE public.subscription_tiers ALTER COLUMN currency SET DEFAULT 'AOA';

-- Add country column to profiles for currency mapping
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'AO';