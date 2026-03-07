
CREATE TABLE public.login_banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  image_url text NOT NULL,
  link_url text,
  display_order smallint NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.login_banners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active banners"
  ON public.login_banners FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Admins manage banners"
  ON public.login_banners FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO storage.buckets (id, name, public) VALUES ('banners', 'banners', true);

CREATE POLICY "Anyone can view banner images"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'banners');

CREATE POLICY "Admins can manage banner images"
  ON storage.objects FOR ALL
  TO authenticated
  USING (bucket_id = 'banners' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'banners' AND public.has_role(auth.uid(), 'admin'));
