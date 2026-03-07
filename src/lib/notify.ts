/**
 * Smart Notification Helpers — KIVARA
 * Typed, personalised notification creators with Kivo mascot personality.
 */
import { supabase } from '@/integrations/supabase/client';

type NotifCategory =
  | 'task'
  | 'mission'
  | 'achievement'
  | 'savings'
  | 'streak'
  | 'class'
  | 'reward'
  | 'vault';

interface NotifPayload {
  profileId: string;
  title: string;
  message: string;
  type: NotifCategory;
  urgent?: boolean;
  metadata?: Record<string, any>;
}

/** Low-level send — prefer typed helpers below */
export async function send(payload: NotifPayload) {
  const { error } = await supabase.from('notifications').insert({
    profile_id: payload.profileId,
    title: payload.title,
    message: payload.message,
    type: payload.type,
    urgent: payload.urgent ?? false,
    metadata: payload.metadata ?? {},
  });
  if (error) console.error('[notify]', error.message);
}

/** createNotification for backward compat (accepts type as string) */
export async function createNotification(input: {
  profileId: string;
  title: string;
  message: string;
  type: string;
  urgent?: boolean;
  metadata?: Record<string, any>;
}) {
  const { error } = await supabase.from('notifications').insert({
    profile_id: input.profileId,
    title: input.title,
    message: input.message,
    type: input.type,
    urgent: input.urgent ?? false,
    metadata: input.metadata ?? {},
  });
  if (error) console.error('[notify]', error.message);
}

// ─── Task Notifications ────────────────────────────────────────

/** Notify parent that a child completed a task */
export function notifyTaskCompleted(parentProfileId: string, childName: string, taskTitle: string, taskId: string) {
  return send({
    profileId: parentProfileId,
    title: '✅ Tarefa concluída!',
    message: `${childName} completou a tarefa "${taskTitle}". Revê e aprova a recompensa.`,
    type: 'task',
    metadata: { task_id: taskId },
  });
}

/** Notify child that their task was approved */
export function notifyTaskApproved(childProfileId: string, taskTitle: string, reward: number, taskId: string) {
  return send({
    profileId: childProfileId,
    title: '🎉 Tarefa aprovada!',
    message: `A tarefa "${taskTitle}" foi aprovada! +${reward} KivaCoins na tua carteira.`,
    type: 'task',
    metadata: { task_id: taskId, reward },
  });
}

/** Notify child that a new task was assigned */
export function notifyNewTask(childProfileId: string, taskTitle: string, reward: number) {
  return send({
    profileId: childProfileId,
    title: '📋 Nova tarefa!',
    message: `Kivo diz: Tens uma nova tarefa — "${taskTitle}" vale ${reward} KivaCoins!`,
    type: 'task',
    metadata: { reward },
  });
}

// ─── Vault / Savings Notifications ─────────────────────────────

/** Notify on savings milestone (25%, 50%, 75%, 100%) */
export function notifySavingsMilestone(profileId: string, vaultName: string, percentage: number) {
  const emoji = percentage >= 100 ? '🎉' : percentage >= 75 ? '🚀' : percentage >= 50 ? '🐷' : '💪';
  return send({
    profileId,
    title: `${emoji} Progresso de poupança!`,
    message:
      percentage >= 100
        ? `Parabéns! Atingiste 100% do objectivo no cofre "${vaultName}"!`
        : `Kivo diz: Atingiste ${percentage}% do teu objectivo no cofre "${vaultName}". Continua assim!`,
    type: 'savings',
    metadata: { vault_name: vaultName, percentage },
  });
}

/** Notify parent when child makes a deposit */
export function notifyVaultDeposit(parentProfileId: string, childName: string, amount: number, vaultName: string) {
  return send({
    profileId: parentProfileId,
    title: '🐷 Depósito no cofre!',
    message: `${childName} depositou ${amount} KivaCoins no cofre "${vaultName}".`,
    type: 'vault',
    metadata: { amount, vault_name: vaultName },
  });
}

// ─── Reward Notifications ──────────────────────────────────────

/** Notify parent when a child claims a reward */
export function notifyRewardClaimed(parentProfileId: string, childName: string, rewardName: string, price: number) {
  return send({
    profileId: parentProfileId,
    title: '🎁 Recompensa resgatada!',
    message: `${childName} resgatou "${rewardName}" por ${price} KivaCoins.`,
    type: 'reward',
    metadata: { reward_name: rewardName, price },
  });
}

/** Notify child on badge/achievement unlock */
export function notifyAchievement(profileId: string, badgeName: string) {
  return send({
    profileId,
    title: '🏆 Badge desbloqueado!',
    message: `Kivo diz: Parabéns! Desbloqueaste o badge "${badgeName}"!`,
    type: 'achievement',
    metadata: { badge_name: badgeName },
  });
}

// ─── Streak Notifications ──────────────────────────────────────

/** Notify on streak milestone */
export function notifyStreakMilestone(profileId: string, days: number, reward: number) {
  return send({
    profileId,
    title: '🔥 Marco de sequência!',
    message: `Incrível! ${days} dias seguidos! Kivo está orgulhoso — +${reward} KivaPoints!`,
    type: 'streak',
    urgent: false,
    metadata: { days, reward },
  });
}

// ─── Lesson Notifications ──────────────────────────────────────

/** Notify on lesson completion */
export function notifyLessonCompleted(profileId: string, lessonTitle: string, points: number) {
  return send({
    profileId,
    title: '📚 Lição concluída!',
    message: `Kivo diz: Parabéns! Completaste a lição "${lessonTitle}" e ganhaste +${points} KivaPoints!`,
    type: 'mission',
    metadata: { lesson_title: lessonTitle, points },
  });
}

// ─── Donation Notifications ────────────────────────────────────

/** Notify on donation */
export function notifyDonationMade(profileId: string, causeName: string, amount: number) {
  return send({
    profileId,
    title: '💜 Doação realizada!',
    message: `Kivo diz: Que generosidade! Doaste ${amount} KivaCoins para "${causeName}". O mundo agradece!`,
    type: 'achievement',
    metadata: { cause_name: causeName, amount },
  });
}

/** Notify parent about child donation */
export function notifyChildDonation(parentProfileId: string, childName: string, causeName: string, amount: number) {
  return send({
    profileId: parentProfileId,
    title: '💜 Doação do ' + childName,
    message: `${childName} doou ${amount} KivaCoins para "${causeName}".`,
    type: 'achievement',
    metadata: { cause_name: causeName, amount },
  });
}

// ─── Allowance Notifications ───────────────────────────────────

/** Notify child about allowance received */
export function notifyAllowanceReceived(childProfileId: string, amount: number) {
  return send({
    profileId: childProfileId,
    title: '💰 Mesada recebida!',
    message: `Kivo diz: Recebeste ${amount} KivaCoins de mesada! Poupa, gasta ou investe com sabedoria.`,
    type: 'reward',
    metadata: { amount },
  });
}

// ─── System / Admin Notifications ──────────────────────────────

/** Notify on level up */
export function notifyLevelUp(profileId: string, newLevel: string) {
  return send({
    profileId,
    title: '🎮 Subiste de nível!',
    message: `Kivo diz: Parabéns! Atingiste o nível "${newLevel}". Novas missões e recompensas te esperam!`,
    type: 'achievement',
    urgent: false,
    metadata: { level: newLevel },
  });
}

/** Notify on budget limit approaching */
export function notifyBudgetWarning(parentProfileId: string, percentUsed: number) {
  return send({
    profileId: parentProfileId,
    title: '⚠️ Limite de orçamento',
    message: `Atenção: ${percentUsed}% do orçamento mensal já foi utilizado.`,
    type: 'savings',
    urgent: percentUsed >= 90,
    metadata: { percent_used: percentUsed },
  });
}
