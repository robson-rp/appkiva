CREATE POLICY "Anyone can view active school tenants"
ON public.tenants
FOR SELECT
TO anon, authenticated
USING (tenant_type = 'school' AND is_active = true);