export type UserRole = 'parent' | 'child' | 'teen' | 'teacher';

export interface User {
  id: string;
  name: string;
  email?: string;
  role: UserRole;
  avatar: string;
  familyId: string;
}

export interface Child {
  id: string;
  name: string;
  username: string;
  pin: string;
  avatar: string;
  parentId: string;
  familyId: string;
  balance: number;
  kivaPoints: number;
  level: Level;
  weeklyAllowance: number;
}

export type Level = 'apprentice' | 'saver' | 'planner' | 'investor' | 'master';

export const LEVEL_CONFIG: Record<Level, { label: string; minPoints: number; color: string; avatar: string; evolvedAvatar: string }> = {
  apprentice: { label: 'Aprendiz', minPoints: 0, color: 'kivara-blue', avatar: '🐣', evolvedAvatar: '🐥' },
  saver: { label: 'Guardador', minPoints: 100, color: 'kivara-green', avatar: '🦊', evolvedAvatar: '🐺' },
  planner: { label: 'Planeador', minPoints: 300, color: 'kivara-gold', avatar: '🦁', evolvedAvatar: '👑' },
  investor: { label: 'Investidor', minPoints: 600, color: 'kivara-purple', avatar: '🐉', evolvedAvatar: '🔮' },
  master: { label: 'Mestre', minPoints: 1000, color: 'kivara-pink', avatar: '🦅', evolvedAvatar: '⭐' },
};

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'approved';
export type TaskCategory = 'cleaning' | 'studying' | 'helping' | 'other';

export interface Task {
  id: string;
  title: string;
  description: string;
  reward: number;
  category: TaskCategory;
  status: TaskStatus;
  childId: string;
  parentId: string;
  createdAt: string;
  completedAt?: string;
}

export type TransactionType = 'earned' | 'spent' | 'saved' | 'allowance' | 'donated';

export type SpendingCategory = 'food' | 'entertainment' | 'education' | 'transport' | 'clothing' | 'tech' | 'other';

export const SPENDING_CATEGORIES: Record<SpendingCategory, { label: string; icon: string; color: string }> = {
  food: { label: 'Alimentação', icon: '🍔', color: 'hsl(var(--chart-1))' },
  entertainment: { label: 'Entretenimento', icon: '🎮', color: 'hsl(var(--chart-2))' },
  education: { label: 'Educação', icon: '📚', color: 'hsl(var(--chart-3))' },
  transport: { label: 'Transporte', icon: '🚌', color: 'hsl(var(--chart-4))' },
  clothing: { label: 'Roupa', icon: '👕', color: 'hsl(var(--chart-5))' },
  tech: { label: 'Tecnologia', icon: '💻', color: 'hsl(var(--primary))' },
  other: { label: 'Outros', icon: '📦', color: 'hsl(var(--muted-foreground))' },
};

export interface Teen {
  id: string;
  name: string;
  username: string;
  pin: string;
  avatar: string;
  parentId: string;
  familyId: string;
  balance: number;
  kivaPoints: number;
  level: Level;
  weeklyAllowance: number;
  weeklySpendLimit: number;
  spendingCategories: SpendingCategory[];
  monthlyBudget: number;
}

export interface Transaction {
  id: string;
  childId: string;
  amount: number;
  type: TransactionType;
  description: string;
  date: string;
  category?: SpendingCategory;
}

export interface Vault {
  id: string;
  childId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  icon: string;
  createdAt: string;
  interestRate: number; // monthly % (e.g. 1 = 1%)
}

export interface DonationCause {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'education' | 'solidarity' | 'environment';
  totalReceived: number;
}

export interface Donation {
  id: string;
  childId: string;
  causeId: string;
  amount: number;
  date: string;
}

export type MissionStatus = 'available' | 'in_progress' | 'completed';

export interface Mission {
  id: string;
  title: string;
  description: string;
  type: 'saving' | 'budgeting' | 'planning';
  targetAmount?: number;
  reward: number;
  kivaPointsReward: number;
  status: MissionStatus;
  childId?: string;
  week: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  childId?: string;
}

export interface StoreItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'avatar' | 'accessory' | 'badge' | 'digital';
  image: string;
  owned?: boolean;
}

export type DiaryMood = '😄' | '😊' | '😐' | '😔' | '😤';

export interface DiaryEntry {
  id: string;
  childId: string;
  text: string;
  mood: DiaryMood;
  date: string;
  tags?: string[];
}

export interface SpendingLimit {
  childId: string;
  weeklySpendLimit: number;
  minSavingsPercent: number;
  purchaseBlockEnabled: boolean;
}

export interface AllowanceConfig {
  childId: string;
  baseAmount: number;
  frequency: 'weekly' | 'monthly';
  taskBonus: number;
  missionBonus: number;
  lastSent?: string;
}

export interface SharedGoal {
  id: string;
  name: string;
  icon: string;
  targetAmount: number;
  parentContribution: number;
  childContribution: number;
  childId: string;
  createdAt: string;
}

export interface BehavioralInsight {
  id: string;
  childId: string;
  type: 'positive' | 'warning' | 'neutral';
  title: string;
  description: string;
  metric?: string;
  trend?: 'up' | 'down' | 'stable';
}

export interface DreamVaultItem {
  id: string;
  childId: string;
  title: string;
  description: string;
  icon: string;
  imageUrl?: string;
  targetAmount: number;
  currentAmount: number;
  priority: 'high' | 'medium' | 'low';
  parentComments: ParentComment[];
  createdAt: string;
}

export interface ParentComment {
  id: string;
  text: string;
  date: string;
  emoji?: string;
}

export interface ParentReward {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: string;
  category: 'experience' | 'privilege' | 'physical' | 'digital';
  createdBy: string;
  childId?: string; // if null, available for all children
  available: boolean;
  claimedAt?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'task' | 'mission' | 'achievement' | 'savings' | 'streak' | 'class';
  read: boolean;
  date: string;
  urgent?: boolean;
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  school: string;
  avatar: string;
}

export interface Classroom {
  id: string;
  name: string;
  teacherId: string;
  grade: string;
  studentIds: string[];
  icon: string;
  createdAt: string;
}

export type ChallengeStatus = 'active' | 'upcoming' | 'completed';

export interface CollectiveChallenge {
  id: string;
  title: string;
  description: string;
  classroomId: string;
  icon: string;
  type: 'saving' | 'budgeting' | 'teamwork';
  targetAmount: number;
  currentAmount: number;
  status: ChallengeStatus;
  participants: { childId: string; contribution: number }[];
  reward: number;
  kivaPointsReward: number;
  startDate: string;
  endDate: string;
}

export interface ClassLeaderboard {
  childId: string;
  name: string;
  avatar: string;
  kivaPoints: number;
  tasksCompleted: number;
  savingsRate: number;
}

// ── Educational Engine ──

export type LessonDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type LessonCategory = 'saving' | 'budgeting' | 'investing' | 'earning' | 'donating';

export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
  correctOptionId: string;
  explanation: string;
}

export interface LessonBlock {
  type: 'text' | 'tip' | 'example' | 'highlight';
  content: string;
  icon?: string;
}

export interface MicroLesson {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: LessonCategory;
  difficulty: LessonDifficulty;
  blocks: LessonBlock[];
  quiz: QuizQuestion[];
  kivaPointsReward: number;
  estimatedMinutes: number;
  completed?: boolean;
  score?: number;
}

export const LESSON_CATEGORIES: Record<LessonCategory, { label: string; icon: string; color: string }> = {
  saving: { label: 'Poupança', icon: '🐷', color: 'hsl(var(--chart-3))' },
  budgeting: { label: 'Orçamento', icon: '📊', color: 'hsl(var(--chart-2))' },
  investing: { label: 'Investimento', icon: '📈', color: 'hsl(var(--chart-4))' },
  earning: { label: 'Ganhar', icon: '💰', color: 'hsl(var(--chart-1))' },
  donating: { label: 'Doar', icon: '🤝', color: 'hsl(var(--chart-5))' },
};

export const DIFFICULTY_CONFIG: Record<LessonDifficulty, { label: string; color: string }> = {
  beginner: { label: 'Iniciante', color: 'bg-chart-3/15 text-chart-3' },
  intermediate: { label: 'Intermédio', color: 'bg-chart-2/15 text-chart-2' },
  advanced: { label: 'Avançado', color: 'bg-chart-1/15 text-chart-1' },
};

// ── Collectible Badges ──

export type BadgeCategory = 'saving' | 'generosity' | 'discipline' | 'knowledge';
export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export const BADGE_CATEGORIES: Record<BadgeCategory, { label: string; icon: string; color: string }> = {
  saving: { label: 'Poupança', icon: '🐷', color: 'hsl(var(--chart-3))' },
  generosity: { label: 'Generosidade', icon: '❤️', color: 'hsl(var(--chart-1))' },
  discipline: { label: 'Disciplina', icon: '⚡', color: 'hsl(var(--chart-2))' },
  knowledge: { label: 'Conhecimento', icon: '📚', color: 'hsl(var(--chart-4))' },
};

export const BADGE_TIERS: Record<BadgeTier, { label: string; color: string; bg: string; glow: string }> = {
  bronze: { label: 'Bronze', color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-950/30', glow: 'shadow-orange-300/30' },
  silver: { label: 'Prata', color: 'text-slate-500', bg: 'bg-slate-100 dark:bg-slate-800/30', glow: 'shadow-slate-300/30' },
  gold: { label: 'Ouro', color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-950/30', glow: 'shadow-yellow-300/40' },
  platinum: { label: 'Platina', color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-950/30', glow: 'shadow-violet-400/40' },
};

export interface CollectibleBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: BadgeCategory;
  tier: BadgeTier;
  requirement: string;
  unlockedAt?: string;
  childId?: string;
}

// ── Weekly Challenges ──

export type WeeklyChallengeType = 'saving' | 'tasks' | 'learning' | 'mixed';
export type WeeklyChallengeStatus = 'active' | 'completed' | 'expired';

export interface WeeklyChallenge {
  id: string;
  title: string;
  description: string;
  type: WeeklyChallengeType;
  icon: string;
  targetValue: number;
  currentValue: number;
  reward: number;
  kivaPointsReward: number;
  status: WeeklyChallengeStatus;
  weekStart: string;
  weekEnd: string;
  participantCount: number;
}

export interface ClassLeaderboardEntry {
  rank: number;
  name: string;
  avatar: string;
  score: number;
  challengesCompleted: number;
  isCurrentUser?: boolean;
}

// ── Daily Streaks ──

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  totalActiveDays: number;
  lastActiveDate: string;
  activeDates: string[]; // ISO date strings
  streakRewards: StreakReward[];
}

export interface StreakReward {
  days: number;
  label: string;
  icon: string;
  kivaPoints: number;
  claimed: boolean;
}

export const STREAK_MILESTONES: StreakReward[] = [
  { days: 3, label: '3 Dias Seguidos', icon: '🔥', kivaPoints: 10, claimed: false },
  { days: 7, label: 'Semana Completa', icon: '⭐', kivaPoints: 25, claimed: false },
  { days: 14, label: '2 Semanas', icon: '💪', kivaPoints: 50, claimed: false },
  { days: 30, label: 'Mês Inteiro', icon: '🏆', kivaPoints: 100, claimed: false },
  { days: 60, label: '2 Meses', icon: '💎', kivaPoints: 200, claimed: false },
  { days: 100, label: 'Centenário', icon: '👑', kivaPoints: 500, claimed: false },
];
