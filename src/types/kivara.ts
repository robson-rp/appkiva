export type UserRole = 'parent' | 'child' | 'teacher';

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

export interface Transaction {
  id: string;
  childId: string;
  amount: number;
  type: TransactionType;
  description: string;
  date: string;
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
  type: 'task' | 'mission' | 'achievement' | 'savings';
  read: boolean;
  date: string;
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
