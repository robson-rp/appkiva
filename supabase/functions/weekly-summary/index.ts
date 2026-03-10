import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { householdId } = await req.json();
    if (!householdId) throw new Error("householdId is required");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // Get all children in this household
    const { data: childProfiles } = await supabase
      .from("profiles")
      .select("id, display_name, avatar, household_id")
      .eq("household_id", householdId);

    if (!childProfiles || childProfiles.length === 0) {
      return new Response(JSON.stringify({ children: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Filter to only children (those in the children table)
    const { data: childrenRows } = await supabase
      .from("children")
      .select("profile_id")
      .in("profile_id", childProfiles.map((p) => p.id));

    const childProfileIds = (childrenRows || []).map((c) => c.profile_id);
    const childProfilesFiltered = childProfiles.filter((p) => childProfileIds.includes(p.id));

    const summaries = await Promise.all(
      childProfilesFiltered.map(async (child) => {
        const [tasksRes, missionsRes, balanceRes, streakRes, vaultsRes] = await Promise.all([
          // Tasks completed this week
          supabase
            .from("household_tasks")
            .select("id, title, reward, status, completed_at")
            .eq("assigned_to", child.id)
            .gte("completed_at", weekAgo)
            .eq("status", "completed"),
          // Missions this week
          supabase
            .from("missions")
            .select("id, title, reward, status, completed_at")
            .eq("child_profile_id", child.id)
            .gte("created_at", weekAgo),
          // Current balance
          supabase
            .from("wallet_balances")
            .select("balance")
            .eq("profile_id", child.id)
            .eq("wallet_type", "virtual")
            .eq("currency", "KVC")
            .maybeSingle(),
          // Streak
          supabase
            .from("streaks")
            .select("current_streak, longest_streak")
            .eq("profile_id", child.id)
            .maybeSingle(),
          // Savings vaults total
          supabase
            .from("savings_vaults")
            .select("current_amount, target_amount")
            .eq("profile_id", child.id),
        ]);

        const tasks = tasksRes.data || [];
        const missions = missionsRes.data || [];
        const vaults = vaultsRes.data || [];

        const tasksCompleted = tasks.length;
        const tasksEarned = tasks.reduce((s, t) => s + (t.reward || 0), 0);
        const missionsCompleted = missions.filter((m) => m.status === "completed").length;
        const missionsActive = missions.filter((m) => m.status === "in_progress").length;
        const missionsEarned = missions
          .filter((m) => m.status === "completed")
          .reduce((s, m) => s + (m.reward || 0), 0);
        const totalSaved = vaults.reduce((s, v) => s + (v.current_amount || 0), 0);

        // Get balance from 7 days ago via ledger (sum credits - debits this week)
        const balance = balanceRes.data?.balance ?? 0;

        // Calculate net change this week from wallet transactions
        const { data: walletRow } = await supabase
          .from("wallets")
          .select("id")
          .eq("profile_id", child.id)
          .eq("wallet_type", "virtual")
          .eq("currency", "KVC")
          .maybeSingle();

        let weeklyNetChange = 0;
        if (walletRow) {
          const { data: credits } = await supabase
            .from("ledger_entries")
            .select("amount")
            .eq("credit_wallet_id", walletRow.id)
            .gte("created_at", weekAgo);

          const { data: debits } = await supabase
            .from("ledger_entries")
            .select("amount")
            .eq("debit_wallet_id", walletRow.id)
            .gte("created_at", weekAgo);

          const totalCredits = (credits || []).reduce((s, e) => s + e.amount, 0);
          const totalDebits = (debits || []).reduce((s, e) => s + e.amount, 0);
          weeklyNetChange = totalCredits - totalDebits;
        }

        return {
          profileId: child.id,
          displayName: child.display_name,
          avatar: child.avatar,
          balance,
          weeklyNetChange,
          tasksCompleted,
          tasksEarned,
          missionsCompleted,
          missionsActive,
          missionsEarned,
          totalSaved,
          currentStreak: streakRes.data?.current_streak ?? 0,
          longestStreak: streakRes.data?.longest_streak ?? 0,
        };
      })
    );

    return new Response(JSON.stringify({ children: summaries }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("weekly-summary error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
