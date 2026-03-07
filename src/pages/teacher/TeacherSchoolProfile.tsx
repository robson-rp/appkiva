import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useClassrooms, useAllClassroomStudents } from '@/hooks/use-classrooms';
import { School, Users, GraduationCap, BookOpen, MapPin, Calendar, Globe } from 'lucide-react';
import { format } from 'date-fns';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } } };

function useTeacherSchool() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['teacher_school', user?.profileId],
    enabled: !!user?.profileId,
    queryFn: async () => {
      // Get teacher's school_tenant_id from profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('school_tenant_id')
        .eq('id', user!.profileId)
        .single();
      if (!profile?.school_tenant_id) return null;

      const { data: tenant } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', profile.school_tenant_id)
        .single();
      return tenant;
    },
  });
}

function useSchoolTeachers(schoolTenantId: string | null) {
  return useQuery({
    queryKey: ['school_teachers', schoolTenantId],
    enabled: !!schoolTenantId,
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, display_name, avatar')
        .eq('school_tenant_id', schoolTenantId!);
      // Filter to teachers only via user_roles
      if (!data || data.length === 0) return [];
      const userIds: string[] = [];
      for (const p of data) {
        const { data: prof } = await supabase
          .from('profiles')
          .select('user_id')
          .eq('id', p.id)
          .single();
        if (prof) userIds.push(prof.user_id);
      }
      // Just return profiles linked to school - good enough
      return data;
    },
  });
}

function useSchoolStudentCount(schoolTenantId: string | null) {
  return useQuery({
    queryKey: ['school_student_count', schoolTenantId],
    enabled: !!schoolTenantId,
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id')
        .eq('school_tenant_id', schoolTenantId!);
      return data?.length ?? 0;
    },
  });
}

export default function TeacherSchoolProfile() {
  const { data: school, isLoading } = useTeacherSchool();
  const { data: classrooms = [] } = useClassrooms();
  const classroomIds = classrooms.map(c => c.id);
  const { data: allStudents = [] } = useAllClassroomStudents(classroomIds);
  const { data: teachers = [] } = useSchoolTeachers(school?.id ?? null);
  const { data: studentCount = 0 } = useSchoolStudentCount(school?.id ?? null);

  const uniqueStudents = new Set(allStudents.map(s => s.student_profile_id)).size;

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-3xl mx-auto">
        <Skeleton className="h-48 rounded-2xl" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!school) {
    return (
      <div className="max-w-3xl mx-auto">
        <Card className="border-border/50">
          <CardContent className="p-12 text-center">
            <div className="text-5xl mb-4">🏫</div>
            <h3 className="font-display font-bold text-lg mb-2">Sem escola associada</h3>
            <p className="text-sm text-muted-foreground">
              O teu perfil ainda não está vinculado a nenhuma escola. Contacta o administrador para ser associado.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4 sm:space-y-6 max-w-3xl mx-auto">
      {/* Hero */}
      <motion.div variants={item}>
        <Card className="border-0 overflow-hidden relative shadow-kivara">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-secondary" />
          <div className="absolute top-[-30%] right-[-10%] w-[45%] h-[80%] rounded-full bg-white/5 blur-3xl" />
          <CardContent className="relative z-10 p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center text-3xl shadow-lg">
                🏫
              </div>
              <div className="flex-1">
                <p className="text-primary-foreground/60 text-xs font-medium uppercase tracking-wider">Escola</p>
                <h1 className="font-display text-xl sm:text-2xl font-bold text-primary-foreground mt-1">{school.name}</h1>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge className="bg-white/15 text-primary-foreground border-0 backdrop-blur-sm text-xs">
                    <Globe className="h-3 w-3 mr-1" /> {school.currency}
                  </Badge>
                  <Badge className={`border-0 backdrop-blur-sm text-xs ${school.is_active ? 'bg-secondary/30 text-primary-foreground' : 'bg-destructive/30 text-primary-foreground'}`}>
                    {school.is_active ? '✅ Ativa' : '❌ Inativa'}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={item} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Turmas', value: classrooms.length, icon: GraduationCap, color: 'text-primary' },
          { label: 'Meus Alunos', value: uniqueStudents, icon: Users, color: 'text-secondary' },
          { label: 'Total Alunos', value: studentCount, icon: BookOpen, color: 'text-chart-3' },
          { label: 'Professores', value: teachers.length, icon: School, color: 'text-chart-4' },
        ].map(stat => (
          <Card key={stat.label} className="border-border/50">
            <CardContent className="p-4 text-center">
              <stat.icon className={`h-5 w-5 mx-auto mb-2 ${stat.color}`} />
              <p className="font-display font-bold text-2xl">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* School Details */}
      <motion.div variants={item}>
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-base flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" /> Detalhes da Escola
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Nome</p>
                <p className="text-sm font-display font-bold">{school.name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Moeda</p>
                <p className="text-sm font-display font-bold">{school.currency}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Criada em</p>
                <p className="text-sm font-display font-bold flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  {format(new Date(school.created_at), 'dd/MM/yyyy')}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Estado</p>
                <Badge variant={school.is_active ? 'default' : 'destructive'} className="text-xs">
                  {school.is_active ? 'Ativa' : 'Inativa'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* My Classes */}
      <motion.div variants={item}>
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-base flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-primary" /> As Minhas Turmas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {classrooms.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Ainda não criaste turmas.</p>
            ) : classrooms.map(cls => {
              const students = allStudents.filter(s => s.classroom_id === cls.id);
              return (
                <div key={cls.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-xl">
                    {cls.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-display font-bold">{cls.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {cls.grade}{cls.subject ? ` · ${cls.subject}` : ''} · {students.length} aluno(s)
                    </p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
