import { WeeklyChallenge, ClassLeaderboardEntry } from '@/types/kivara';

function weekStart(): string {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay() + 1); // Monday
  return d.toISOString().split('T')[0];
}

function weekEnd(): string {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay() + 7); // Sunday
  return d.toISOString().split('T')[0];
}

function lastWeekStart(): string {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay() - 6);
  return d.toISOString().split('T')[0];
}

function lastWeekEnd(): string {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay());
  return d.toISOString().split('T')[0];
}

export const mockWeeklyChallenges: WeeklyChallenge[] = [
  {
    id: 'wc-1',
    title: 'Super Poupador',
    description: 'Poupa pelo menos 50 coins esta semana nos teus cofres.',
    type: 'saving',
    icon: '🐷',
    targetValue: 50,
    currentValue: 32,
    reward: 30,
    kivaPointsReward: 20,
    status: 'active',
    weekStart: weekStart(),
    weekEnd: weekEnd(),
    participantCount: 18,
  },
  {
    id: 'wc-2',
    title: 'Maratona de Tarefas',
    description: 'Completa 5 tarefas antes do fim da semana.',
    type: 'tasks',
    icon: '✅',
    targetValue: 5,
    currentValue: 3,
    reward: 25,
    kivaPointsReward: 15,
    status: 'active',
    weekStart: weekStart(),
    weekEnd: weekEnd(),
    participantCount: 22,
  },
  {
    id: 'wc-3',
    title: 'Mestre do Conhecimento',
    description: 'Completa 3 lições de literacia financeira.',
    type: 'learning',
    icon: '📚',
    targetValue: 3,
    currentValue: 1,
    reward: 35,
    kivaPointsReward: 25,
    status: 'active',
    weekStart: weekStart(),
    weekEnd: weekEnd(),
    participantCount: 15,
  },
  {
    id: 'wc-4',
    title: 'Semana Perfeita',
    description: 'Poupa, completa tarefas e aprende — faz tudo numa semana!',
    type: 'mixed',
    icon: '🌟',
    targetValue: 100,
    currentValue: 100,
    reward: 50,
    kivaPointsReward: 40,
    status: 'completed',
    weekStart: lastWeekStart(),
    weekEnd: lastWeekEnd(),
    participantCount: 20,
  },
  {
    id: 'wc-5',
    title: 'Zero Gastos',
    description: 'Não gastes nenhuma moeda durante 3 dias seguidos.',
    type: 'saving',
    icon: '🔒',
    targetValue: 3,
    currentValue: 1,
    reward: 20,
    kivaPointsReward: 15,
    status: 'expired',
    weekStart: lastWeekStart(),
    weekEnd: lastWeekEnd(),
    participantCount: 12,
  },
];

export const mockClassLeaderboard: ClassLeaderboardEntry[] = [
  { rank: 1, name: 'Sofia M.', avatar: '👧', score: 285, challengesCompleted: 4 },
  { rank: 2, name: 'Tomás R.', avatar: '👦', score: 260, challengesCompleted: 3 },
  { rank: 3, name: 'Ana', avatar: '🦊', score: 240, challengesCompleted: 3, isCurrentUser: true },
  { rank: 4, name: 'Miguel S.', avatar: '🧑', score: 210, challengesCompleted: 2 },
  { rank: 5, name: 'Inês P.', avatar: '👩', score: 195, challengesCompleted: 2 },
  { rank: 6, name: 'Pedro L.', avatar: '🐻', score: 180, challengesCompleted: 2 },
  { rank: 7, name: 'Marta C.', avatar: '🌸', score: 150, challengesCompleted: 1 },
  { rank: 8, name: 'Diogo F.', avatar: '⚡', score: 120, challengesCompleted: 1 },
];
