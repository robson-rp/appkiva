
-- Classrooms table
CREATE TABLE public.classrooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  grade text NOT NULL DEFAULT '',
  icon text NOT NULL DEFAULT '🎓',
  subject text,
  schedule text,
  description text,
  teacher_profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  school_tenant_id uuid REFERENCES public.tenants(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Classroom students junction table
CREATE TABLE public.classroom_students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id uuid NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
  student_profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  added_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(classroom_id, student_profile_id)
);

-- Enable RLS
ALTER TABLE public.classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classroom_students ENABLE ROW LEVEL SECURITY;

-- Updated_at triggers
CREATE TRIGGER update_classrooms_updated_at BEFORE UPDATE ON public.classrooms
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS for classrooms: teachers can CRUD their own classrooms
CREATE POLICY "Teachers can view own classrooms" ON public.classrooms
  FOR SELECT TO authenticated
  USING (teacher_profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Teachers can create classrooms" ON public.classrooms
  FOR INSERT TO authenticated
  WITH CHECK (
    teacher_profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    AND has_role(auth.uid(), 'teacher')
  );

CREATE POLICY "Teachers can update own classrooms" ON public.classrooms
  FOR UPDATE TO authenticated
  USING (
    teacher_profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    AND has_role(auth.uid(), 'teacher')
  );

CREATE POLICY "Teachers can delete own classrooms" ON public.classrooms
  FOR DELETE TO authenticated
  USING (
    teacher_profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    AND has_role(auth.uid(), 'teacher')
  );

CREATE POLICY "Admins can view all classrooms" ON public.classrooms
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- RLS for classroom_students
CREATE POLICY "Teachers can view classroom students" ON public.classroom_students
  FOR SELECT TO authenticated
  USING (
    classroom_id IN (
      SELECT id FROM classrooms WHERE teacher_profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Teachers can add students" ON public.classroom_students
  FOR INSERT TO authenticated
  WITH CHECK (
    classroom_id IN (
      SELECT id FROM classrooms WHERE teacher_profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    )
    AND has_role(auth.uid(), 'teacher')
  );

CREATE POLICY "Teachers can remove students" ON public.classroom_students
  FOR DELETE TO authenticated
  USING (
    classroom_id IN (
      SELECT id FROM classrooms WHERE teacher_profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    )
    AND has_role(auth.uid(), 'teacher')
  );

-- Students can view classrooms they belong to
CREATE POLICY "Students can view own classrooms" ON public.classrooms
  FOR SELECT TO authenticated
  USING (
    id IN (
      SELECT classroom_id FROM classroom_students 
      WHERE student_profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Students can view own enrollment" ON public.classroom_students
  FOR SELECT TO authenticated
  USING (
    student_profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );
