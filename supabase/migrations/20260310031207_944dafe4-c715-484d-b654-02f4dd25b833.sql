
-- 1. New enums
CREATE TYPE public.mission_difficulty AS ENUM ('beginner', 'explorer', 'saver', 'strategist', 'master');
CREATE TYPE public.mission_source AS ENUM ('parent', 'engine', 'admin', 'teacher');

-- 2. Expand mission_type enum
ALTER TYPE public.mission_type ADD VALUE IF NOT EXISTS 'learning';
ALTER TYPE public.mission_type ADD VALUE IF NOT EXISTS 'social';
ALTER TYPE public.mission_type ADD VALUE IF NOT EXISTS 'goal';
ALTER TYPE public.mission_type ADD VALUE IF NOT EXISTS 'daily';
ALTER TYPE public.mission_type ADD VALUE IF NOT EXISTS 'weekly';

-- 3. Add new columns to missions
ALTER TABLE public.missions
  ADD COLUMN IF NOT EXISTS difficulty public.mission_difficulty NOT NULL DEFAULT 'beginner',
  ADD COLUMN IF NOT EXISTS source public.mission_source NOT NULL DEFAULT 'parent',
  ADD COLUMN IF NOT EXISTS expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS is_auto_generated boolean NOT NULL DEFAULT false;

-- 4. Create mission_templates table
CREATE TABLE public.mission_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  type public.mission_type NOT NULL DEFAULT 'saving',
  difficulty public.mission_difficulty NOT NULL DEFAULT 'beginner',
  reward_coins integer NOT NULL DEFAULT 10,
  reward_points integer NOT NULL DEFAULT 10,
  target_amount integer,
  conditions jsonb DEFAULT '{}'::jsonb,
  age_group text DEFAULT 'all',
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.mission_templates ENABLE ROW LEVEL SECURITY;

-- RLS: only admins can manage templates
CREATE POLICY "Admins can manage mission templates"
  ON public.mission_templates FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Public read for templates (engine needs to read them)
CREATE POLICY "Anyone can read active templates"
  ON public.mission_templates FOR SELECT TO authenticated
  USING (is_active = true);
