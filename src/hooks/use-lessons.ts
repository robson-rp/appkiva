import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MicroLesson, LessonCategory, LessonDifficulty } from '@/types/kivara';
import { mockLessons } from '@/data/lessons-data';

interface DbLesson {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  difficulty: string;
  estimated_minutes: number;
  kiva_points_reward: number;
  blocks: any;
  quiz: any;
  sort_order: number;
  is_active: boolean;
}

function mapDbToMicroLesson(row: DbLesson): MicroLesson {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    icon: row.icon,
    category: row.category as LessonCategory,
    difficulty: row.difficulty as LessonDifficulty,
    estimatedMinutes: row.estimated_minutes,
    kivaPointsReward: row.kiva_points_reward,
    blocks: row.blocks as MicroLesson['blocks'],
    quiz: row.quiz as MicroLesson['quiz'],
  };
}

export function useLessons() {
  return useQuery({
    queryKey: ['lessons'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;

      if (!data || data.length === 0) {
        return mockLessons;
      }

      return (data as unknown as DbLesson[]).map(mapDbToMicroLesson);
    },
  });
}

export function useAllLessons() {
  return useQuery({
    queryKey: ['lessons', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data as unknown as DbLesson[];
    },
  });
}
