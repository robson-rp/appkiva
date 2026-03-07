import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ClassroomRow {
  id: string;
  name: string;
  grade: string;
  icon: string;
  subject: string | null;
  schedule: string | null;
  description: string | null;
  teacher_profile_id: string;
  school_tenant_id: string | null;
  created_at: string;
}

export interface ClassroomStudentRow {
  id: string;
  classroom_id: string;
  student_profile_id: string;
  added_at: string;
  profile?: {
    id: string;
    display_name: string;
    avatar: string | null;
  };
}

export function useClassrooms() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['classrooms', user?.profileId],
    enabled: !!user?.profileId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('classrooms')
        .select('*')
        .eq('teacher_profile_id', user!.profileId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as ClassroomRow[];
    },
  });
}

export function useClassroomStudents(classroomId: string | null) {
  return useQuery({
    queryKey: ['classroom_students', classroomId],
    enabled: !!classroomId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('classroom_students')
        .select('id, classroom_id, student_profile_id, added_at')
        .eq('classroom_id', classroomId!);
      if (error) throw error;

      // Fetch profiles for each student
      const profileIds = data.map(s => s.student_profile_id);
      if (profileIds.length === 0) return [];

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, display_name, avatar')
        .in('id', profileIds);

      const profileMap = new Map((profiles ?? []).map(p => [p.id, p]));
      return data.map(s => ({
        ...s,
        profile: profileMap.get(s.student_profile_id) || { id: s.student_profile_id, display_name: 'Aluno', avatar: '👤' },
      })) as ClassroomStudentRow[];
    },
  });
}

export function useAllClassroomStudents(classroomIds: string[]) {
  return useQuery({
    queryKey: ['all_classroom_students', classroomIds],
    enabled: classroomIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('classroom_students')
        .select('id, classroom_id, student_profile_id, added_at')
        .in('classroom_id', classroomIds);
      if (error) throw error;

      const profileIds = [...new Set(data.map(s => s.student_profile_id))];
      if (profileIds.length === 0) return [];

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, display_name, avatar')
        .in('id', profileIds);

      const profileMap = new Map((profiles ?? []).map(p => [p.id, p]));
      return data.map(s => ({
        ...s,
        profile: profileMap.get(s.student_profile_id) || { id: s.student_profile_id, display_name: 'Aluno', avatar: '👤' },
      })) as ClassroomStudentRow[];
    },
  });
}

export function useSchoolStudents(schoolTenantId: string | null) {
  return useQuery({
    queryKey: ['school_students', schoolTenantId],
    enabled: !!schoolTenantId,
    queryFn: async () => {
      // Get all profiles linked to this school
      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name, avatar')
        .eq('school_tenant_id', schoolTenantId!);
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useCreateClassroom() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { name: string; grade: string; icon: string; subject?: string; schedule?: string; description?: string; teacher_profile_id: string; school_tenant_id?: string }) => {
      const { data, error } = await supabase
        .from('classrooms')
        .insert(params as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['classrooms'] }),
  });
}

export function useUpdateClassroom() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; name?: string; grade?: string; icon?: string; subject?: string; schedule?: string; description?: string }) => {
      const { error } = await supabase
        .from('classrooms')
        .update(updates as any)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['classrooms'] }),
  });
}

export function useDeleteClassroom() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('classrooms').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['classrooms'] });
      qc.invalidateQueries({ queryKey: ['all_classroom_students'] });
    },
  });
}

export function useAddClassroomStudents() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ classroomId, studentProfileIds }: { classroomId: string; studentProfileIds: string[] }) => {
      const rows = studentProfileIds.map(sid => ({ classroom_id: classroomId, student_profile_id: sid }));
      const { error } = await supabase.from('classroom_students').insert(rows as any);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['classroom_students'] });
      qc.invalidateQueries({ queryKey: ['all_classroom_students'] });
    },
  });
}

export function useRemoveClassroomStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ classroomId, studentProfileId }: { classroomId: string; studentProfileId: string }) => {
      const { error } = await supabase
        .from('classroom_students')
        .delete()
        .eq('classroom_id', classroomId)
        .eq('student_profile_id', studentProfileId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['classroom_students'] });
      qc.invalidateQueries({ queryKey: ['all_classroom_students'] });
    },
  });
}
