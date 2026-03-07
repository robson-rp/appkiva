
CREATE TABLE public.banner_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  banner_id uuid NOT NULL REFERENCES public.login_banners(id) ON DELETE CASCADE,
  clicked_at timestamp with time zone NOT NULL DEFAULT now(),
  user_agent text,
  referrer text
);

ALTER TABLE public.banner_clicks ENABLE ROW LEVEL SECURITY;

-- Anyone can insert clicks (unauthenticated users on login page)
CREATE POLICY "Anyone can insert banner clicks"
  ON public.banner_clicks FOR INSERT
  WITH CHECK (true);

-- Admins can view click stats
CREATE POLICY "Admins can view banner clicks"
  ON public.banner_clicks FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));
