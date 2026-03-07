/**
 * Smart Notification Helpers — KIVARA
 * Typed, personalised notification creators with Kivo mascot personality.
 * Includes throttle engine to prevent notification fatigue.
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
  | 'vault'
  | 'report';

interface NotifPayload {
  profileId: string;
  title: string;
  message: string;
  type: NotifCategory;
  urgent?: boolean;
  metadata?: Record<string, any>;
}

// ─── Throttle Engine ───────────────────────────────────────────

/** Check if a profile can still receive notifications today */
async function canSendNotification(profileId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('check_notification_throttle', {
      _profile_id: profileId,
    });
    if (error) {
      console.warn('[notify] throttle check failed, allowing:', error.message);
      return true; // fail-open
    }
    return data === true;
  } catch {
    return true;
  }
}

/** Log a sent notification for throttle tracking */
async function logNotification(profileId: string, notificationId?: string) {
  const { error } = await supabase.from('notification_log' as any).insert({
    profile_id: profileId,
    notification_id: notificationId ?? null,
  });
  if (error) console.warn('[notify] log insert failed:', error.message);
}

// ─── Core Send ─────────────────────────────────────────────────

/** Low-level send with throttle check */
export async function send(payload: NotifPayload) {
  // Check throttle
  const allowed = await canSendNotification(payload.profileId);
  if (!allowed) {
    console.info('[notify] throttled for', payload.profileId);
    return;
  }

  const { data, error } = await supabase.from('notifications').insert({
    profile_id: payload.profileId,
    title: payload.title,
    message: payload.message,
    type: payload.type,
    urgent: payload.urgent ?? false,
    metadata: payload.metadata ?? {},
  }).select('id').single();

  if (error) {
    console.error('[notify]', error.message);
    return;
  }

  // Log for throttle tracking
  await logNotification(payload.profileId, data?.id);
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
  return send({
    profileId: input.profileId,
    title: input.title,
    message: input.message,
    type: input.type as NotifCategory,
    urgent: input.urgent,
    metadata: input.metadata,
  });
}

// ─── Task Notifications ────────────────────────────────────────

export function notifyTaskCompleted(parentProfileId: string, childName: string, taskTitle: string, taskId: string) {
  return send({
    profileId: parentProfileId,
    title: '✅ Tarefa concluída!',
    message: `${childName} completou a tarefa "${taskTitle}". Revê e aprova a recompensa.`,
    type: 'task',
    metadata: { task_id: taskId },
  });
}

export function notifyTaskApproved(childProfileId: string, taskTitle: string, reward: number, taskId: string) {
  return send({
    profileId: childProfileId,
    title: '🎉 Tarefa aprovada!',
    message: `A tarefa "${taskTitle}" foi aprovada! +${reward} KivaCoins na tua carteira.`,
    type: 'task',
    metadata: { task_id: taskId, reward },
  });
}

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

export function notifyRewardClaimed(parentProfileId: string, childName: string, rewardName: string, price: number) {
  return send({
    profileId: parentProfileId,
    title: '🎁 Recompensa resgatada!',
    message: `${childName} resgatou "${rewardName}" por ${price} KivaCoins.`,
    type: 'reward',
    metadata: { reward_name: rewardName, price },
  });
}

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

export function notifyStreakMilestone(profileId: string, days: number, reward: number) {
  return send({
    profileId,
    title: '🔥 Marco de sequência!',
    message: `Incrível! ${days} dias seguidos! Kivo está orgulhoso — +${reward} KivaPoints!`,
    type: 'streak',
    metadata: { days, reward },
  });
}

export function notifyStreakAtRisk(profileId: string, currentStreak: number) {
  return send({
    profileId,
    title: '⚡ A tua sequência está em risco!',
    message: `Kivo diz: A tua sequência de ${currentStreak} dias está prestes a acabar! Completa uma missão para a manter.`,
    type: 'streak',
    urgent: true,
    metadata: { current_streak: currentStreak },
  });
}

// ─── Lesson / Mission Notifications ────────────────────────────

export function notifyLessonCompleted(profileId: string, lessonTitle: string, points: number) {
  return send({
    profileId,
    title: '📚 Lição concluída!',
    message: `Kivo diz: Parabéns! Completaste a lição "${lessonTitle}" e ganhaste +${points} KivaPoints!`,
    type: 'mission',
    metadata: { lesson_title: lessonTitle, points },
  });
}

export function notifyMissionAvailable(profileId: string, missionTitle: string) {
  return send({
    profileId,
    title: '🎯 Nova missão desbloqueada!',
    message: `Kivo diz: Tens uma nova missão — "${missionTitle}". Aprende a fazer crescer as tuas poupanças!`,
    type: 'mission',
    metadata: { mission_title: missionTitle },
  });
}

export function notifyDailyReminder(profileId: string, childName: string) {
  return send({
    profileId,
    title: '👋 Pronto para o desafio de hoje?',
    message: `Kivo diz: Olá ${childName}! Pronto para o desafio de dinheiro de hoje?`,
    type: 'mission',
    metadata: { trigger: 'daily_reminder' },
  });
}

// ─── Donation Notifications ────────────────────────────────────

export function notifyDonationMade(profileId: string, causeName: string, amount: number) {
  return send({
    profileId,
    title: '💜 Doação realizada!',
    message: `Kivo diz: Que generosidade! Doaste ${amount} KivaCoins para "${causeName}". O mundo agradece!`,
    type: 'achievement',
    metadata: { cause_name: causeName, amount },
  });
}

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

export function notifyLevelUp(profileId: string, newLevel: string) {
  return send({
    profileId,
    title: '🎮 Subiste de nível!',
    message: `Kivo diz: Parabéns! Atingiste o nível "${newLevel}". Novas missões e recompensas te esperam!`,
    type: 'achievement',
    metadata: { level: newLevel },
  });
}

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

// ─── School Challenge Notifications ────────────────────────────

export function notifySchoolChallenge(profileId: string, challengeTitle: string) {
  return send({
    profileId,
    title: '🏫 Novo desafio escolar!',
    message: `Kivo diz: A tua turma tem um novo desafio de poupança — "${challengeTitle}". Consegues ajudar a tua equipa a ganhar?`,
    type: 'class',
    metadata: { challenge_title: challengeTitle },
  });
}

// ─── Weekly Report ─────────────────────────────────────────────

export function notifyWeeklyReport(parentProfileId: string, childName: string, coinsEarned: number, missionsCompleted: number, savingsProgress: number) {
  return send({
    profileId: parentProfileId,
    title: '📊 Relatório semanal',
    message: `Esta semana ${childName} ganhou ${coinsEarned} KivaCoins, completou ${missionsCompleted} missões e tem ${savingsProgress}% de progresso nas poupanças.`,
    type: 'report',
    metadata: { child_name: childName, coins_earned: coinsEarned, missions_completed: missionsCompleted, savings_progress: savingsProgress },
  });
}
