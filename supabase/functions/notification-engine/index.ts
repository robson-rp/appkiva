import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

/** Fire a web push notification via the send-push-notification function */
async function sendPush(
  supabaseUrl: string,
  serviceRoleKey: string,
  profileId: string,
  title: string,
  body: string,
  data?: Record<string, any>
) {
  try {
    const res = await fetch(`${supabaseUrl}/functions/v1/send-push-notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${serviceRoleKey}`,
      },
      body: JSON.stringify({ action: 'send', profileId, title, body, data }),
    });
    const result = await res.json();
    return result;
  } catch (e) {
    console.error('[notification-engine] push send failed:', e);
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const dayOfWeek = now.getUTCDay(); // 0=Sunday, 1=Monday
  const hour = now.getUTCHours();
  const results: Record<string, number> = {};

  try {
    // ─── 1. Daily Learning Reminder (morning run ~10:00) ───────
    if (hour < 14) {
      const { data: inactiveChildren } = await supabase
        .from('profiles')
        .select('id, display_name, user_id')
        .not('id', 'in', `(${
          (await supabase
            .from('streak_activities')
            .select('profile_id')
            .eq('active_date', today)
          ).data?.map((r: any) => `'${r.profile_id}'`).join(',') || "'00000000-0000-0000-0000-000000000000'"
        })`);

      // Filter to children/teens only via user_roles
      let reminderCount = 0;
      for (const profile of inactiveChildren ?? []) {
        const { data: roles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', profile.user_id);

        const isChild = roles?.some((r: any) => r.role === 'child' || r.role === 'teen');
        if (!isChild) continue;

        // Check throttle
        const { data: allowed } = await supabase.rpc('check_notification_throttle', {
          _profile_id: profile.id,
        });
        if (!allowed) continue;

        const { data: notif } = await supabase.from('notifications').insert({
          profile_id: profile.id,
          title: '👋 Pronto para o desafio de hoje?',
          message: `Kivo diz: Olá ${profile.display_name}! Pronto para o desafio de dinheiro de hoje?`,
          type: 'mission',
          metadata: { trigger: 'daily_reminder' },
        }).select('id').single();

        if (notif) {
          await supabase.from('notification_log').insert({
            profile_id: profile.id,
            notification_id: notif.id,
          });
          reminderCount++;
        }
      }
      results.daily_reminders = reminderCount;
    }

    // ─── 2. Streak At-Risk Reminder (afternoon run ~16:00) ─────
    if (hour >= 14) {
      const { data: atRiskStreaks } = await supabase
        .from('streaks')
        .select('profile_id, current_streak')
        .gt('current_streak', 0)
        .not('last_active_date', 'eq', today);

      let streakCount = 0;
      for (const streak of atRiskStreaks ?? []) {
        const { data: allowed } = await supabase.rpc('check_notification_throttle', {
          _profile_id: streak.profile_id,
        });
        if (!allowed) continue;

        const { data: notif } = await supabase.from('notifications').insert({
          profile_id: streak.profile_id,
          title: '⚡ A tua sequência está em risco!',
          message: `Kivo diz: A tua sequência de ${streak.current_streak} dias está prestes a acabar! Completa uma missão para a manter.`,
          type: 'streak',
          urgent: true,
          metadata: { current_streak: streak.current_streak, trigger: 'streak_at_risk' },
        }).select('id').single();

        if (notif) {
          await supabase.from('notification_log').insert({
            profile_id: streak.profile_id,
            notification_id: notif.id,
          });
          streakCount++;
        }
      }
      results.streak_at_risk = streakCount;
    }

    // ─── 3. Savings Milestone Check ────────────────────────────
    const milestones = [25, 50, 75, 100];

    // Check dream_vaults
    const { data: dreamVaults } = await supabase
      .from('dream_vaults')
      .select('id, profile_id, title, current_amount, target_amount')
      .gt('target_amount', 0);

    let savingsCount = 0;
    for (const vault of dreamVaults ?? []) {
      const pct = Math.floor((vault.current_amount / vault.target_amount) * 100);
      const milestone = milestones.find(m => pct >= m && pct < m + 5);
      if (!milestone) continue;

      // Check if already notified for this milestone
      const { data: existing } = await supabase
        .from('notifications')
        .select('id')
        .eq('profile_id', vault.profile_id)
        .eq('type', 'savings')
        .contains('metadata', { vault_name: vault.title, percentage: milestone })
        .limit(1);

      if (existing && existing.length > 0) continue;

      const { data: allowed } = await supabase.rpc('check_notification_throttle', {
        _profile_id: vault.profile_id,
      });
      if (!allowed) continue;

      const emoji = milestone >= 100 ? '🎉' : milestone >= 75 ? '🚀' : milestone >= 50 ? '🐷' : '💪';
      const { data: notif } = await supabase.from('notifications').insert({
        profile_id: vault.profile_id,
        title: `${emoji} Progresso de poupança!`,
        message: milestone >= 100
          ? `Parabéns! Atingiste 100% do objectivo no sonho "${vault.title}"!`
          : `Kivo diz: Atingiste ${milestone}% do teu objectivo no sonho "${vault.title}". Continua assim!`,
        type: 'savings',
        metadata: { vault_name: vault.title, percentage: milestone, trigger: 'milestone_check' },
      }).select('id').single();

      if (notif) {
        await supabase.from('notification_log').insert({
          profile_id: vault.profile_id,
          notification_id: notif.id,
        });
        savingsCount++;
      }
    }
    results.savings_milestones = savingsCount;

    // ─── 4. Weekly Parent Report (Monday morning) ──────────────
    if (dayOfWeek === 1 && hour < 14) {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

      const { data: parents } = await supabase
        .from('children')
        .select('parent_profile_id, profile_id, nickname');

      const parentMap = new Map<string, Array<{ profileId: string; nickname: string | null }>>();
      for (const c of parents ?? []) {
        const arr = parentMap.get(c.parent_profile_id) || [];
        arr.push({ profileId: c.profile_id, nickname: c.nickname });
        parentMap.set(c.parent_profile_id, arr);
      }

      let reportCount = 0;
      for (const [parentId, children] of parentMap) {
        const { data: allowed } = await supabase.rpc('check_notification_throttle', {
          _profile_id: parentId,
        });
        if (!allowed) continue;

        for (const child of children) {
          // Count lessons completed this week
          const { count: lessonsCount } = await supabase
            .from('lesson_progress')
            .select('*', { count: 'exact', head: true })
            .eq('profile_id', child.profileId)
            .gte('completed_at', weekAgo);

          // Get child display name
          const { data: profile } = await supabase
            .from('profiles')
            .select('display_name')
            .eq('id', child.profileId)
            .single();

          const childName = child.nickname || profile?.display_name || 'O teu filho';

          const { data: notif } = await supabase.from('notifications').insert({
            profile_id: parentId,
            title: '📊 Relatório semanal',
            message: `Esta semana ${childName} completou ${lessonsCount ?? 0} missões. Continua a acompanhar o progresso!`,
            type: 'report',
            metadata: {
              child_name: childName,
              missions_completed: lessonsCount ?? 0,
              trigger: 'weekly_report',
            },
          }).select('id').single();

          if (notif) {
            await supabase.from('notification_log').insert({
              profile_id: parentId,
              notification_id: notif.id,
            });
            reportCount++;
          }
        }
      }
      results.weekly_reports = reportCount;
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
