import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
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
      const data = await api.get<ClassroomRow[]>('/classrooms');
      return data;
    },
  });
}

export function useClassroomStudents(classroomId: string | null) {
  return useQuery({
    queryKey: ['classroom_students', classroomId],
    enabled: !!classroomId,
    queryFn: async () => {
      const data = await api.get<ClassroomStudentRow[]>(`/classrooms/${classroomId}/students`);
      return data;
    },
  });
}

export function useAllClassroomStudents(classroomIds: string[]) {
  return useQuery({
    queryKey: ['all_classroom_students', classroomIds],
    enabled: classroomIds.length > 0,
    queryFn: async () => {
      const allStudents: ClassroomStudentRow[] = [];
      for (const classroomId of classroomIds) {
        const students = await api.get<ClassroomStudentRow[]>(`/classrooms/${classroomId}/students`);
        allStudents.push(...students);
      }
      return allStudents;
    },
  });
}

export function useSchoolStudents(schoolTenantId: string | null) {
  return useQuery({
    queryKey: ['school_students', schoolTenantId],
    enabled: !!schoolTenantId,
    queryFn: async () => {
      const data = await api.get<Array<{ id: string; display_name: string; avatar: string | null }>>('/school/students');
      return data;
    },
  });
}

export function useCreateClassroom() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { name: string; grade: string; icon: string; subject?: string; schedule?: string; description?: string; teacher_profile_id: string; school_tenant_id?: string }) => {
      const data = await api.post<ClassroomRow>('/classrooms', params);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['classrooms'] }),
  });
}

export function useUpdateClassroom() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; name?: string; grade?: string; icon?: string; subject?: string; schedule?: string; description?: string }) => {
      await api.patch(`/classrooms/${id}`, updates);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['classrooms'] }),
  });
}

export function useDeleteClassroom() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/classrooms/${id}`);
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
      for (const studentId of studentProfileIds) {
        await api.post(`/classrooms/${classroomId}/students/${studentId}`, {});
      }
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
      await api.delete(`/classrooms/${classroomId}/students/${studentProfileId}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['classroom_students'] });
      qc.invalidateQueries({ queryKey: ['all_classroom_students'] });
    },
  });
}
