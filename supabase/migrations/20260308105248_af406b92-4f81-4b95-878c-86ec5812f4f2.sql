
-- Fix subscription_tiers: drop restrictive policy and recreate as permissive
DROP POLICY IF EXISTS "Anyone can view active tiers" ON public.subscription_tiers;
CREATE POLICY "Anyone can view active tiers" ON public.subscription_tiers
  FOR SELECT USING (is_active = true);

-- Fix tier_regional_prices: drop restrictive policy and recreate as permissive  
DROP POLICY IF EXISTS "Anyone can view regional prices" ON public.tier_regional_prices;
CREATE POLICY "Anyone can view regional prices" ON public.tier_regional_prices
  FOR SELECT USING (true);

-- Fix currency_exchange_rates: ensure permissive
DROP POLICY IF EXISTS "Anyone can view exchange rates" ON public.currency_exchange_rates;
CREATE POLICY "Anyone can view exchange rates" ON public.currency_exchange_rates
  FOR SELECT USING (true);
