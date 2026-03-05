import { StreakData } from '@/types/kivara';

// Generate last N days as ISO date strings
function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

// Simulated active dates: 12-day streak ending today, plus some older scattered days
const activeDates = [
  // Current streak: 12 days
  ...Array.from({ length: 12 }, (_, i) => daysAgo(i)),
  // Older activity (gap of 2 days, then 5 days)
  ...Array.from({ length: 5 }, (_, i) => daysAgo(14 + i)),
  // Even older scattered
  daysAgo(25), daysAgo(26), daysAgo(27),
  daysAgo(32), daysAgo(33),
];

export const mockStreakData: StreakData = {
  currentStreak: 12,
  longestStreak: 12,
  totalActiveDays: activeDates.length,
  lastActiveDate: daysAgo(0),
  activeDates,
  streakRewards: [
    { days: 3, label: '3 Dias Seguidos', icon: '🔥', kivaPoints: 10, claimed: true },
    { days: 7, label: 'Semana Completa', icon: '⭐', kivaPoints: 25, claimed: true },
    { days: 14, label: '2 Semanas', icon: '💪', kivaPoints: 50, claimed: false },
    { days: 30, label: 'Mês Inteiro', icon: '🏆', kivaPoints: 100, claimed: false },
    { days: 60, label: '2 Meses', icon: '💎', kivaPoints: 200, claimed: false },
    { days: 100, label: 'Centenário', icon: '👑', kivaPoints: 500, claimed: false },
  ],
};
