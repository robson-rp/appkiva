import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { MicroLesson, LessonCategory, LessonDifficulty, LessonBlock, QuizQuestion } from '@/types/kivara';
import { mockLessons } from '@/data/lessons-data';

interface LessonResponse {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  difficulty: string;
  estimated_minutes: number;
  kiva_points_reward: number;
  blocks: LessonBlock[];
  quiz: QuizQuestion[];
  sort_order: number;
  is_active: boolean;
}

function mapResponseToMicroLesson(row: LessonResponse): MicroLesson {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    icon: row.icon,
    category: row.category as LessonCategory,
    difficulty: row.difficulty as LessonDifficulty,
    estimatedMinutes: row.estimated_minutes,
    kivaPointsReward: row.kiva_points_reward,
    blocks: row.blocks,
    quiz: row.quiz,
  };
}

export function useLessons() {
  return useQuery({
    queryKey: ['lessons'],
    queryFn: async () => {
      const res = await api.get<any>('/lessons');
      const data = Array.isArray(res) ? res : (res?.data ?? []);

      if (!data || data.length === 0) {
        return mockLessons;
      }

      return data.map(mapResponseToMicroLesson);
    },
  });
}

export function useAllLessons() {
  return useQuery({
    queryKey: ['lessons', 'all'],
    queryFn: async () => {
      const res = await api.get<any>('/lessons?include_inactive=true');
      const data = Array.isArray(res) ? res : (res?.data ?? []);
      return data as LessonResponse[];
    },
  });
}
