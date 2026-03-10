import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(authHeader.replace("Bearer ", ""));
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub;
    const admin = createClient(supabaseUrl, serviceKey);

    // Get caller profile
    const { data: callerProfile } = await admin
      .from("profiles")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (!callerProfile) {
      return new Response(JSON.stringify({ error: "Profile not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { mission_id } = await req.json();
    if (!mission_id) {
      return new Response(JSON.stringify({ error: "mission_id is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch mission
    const { data: mission, error: missionErr } = await admin
      .from("missions")
      .select("*")
      .eq("id", mission_id)
      .maybeSingle();

    if (missionErr || !mission) {
      return new Response(JSON.stringify({ error: "Mission not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify ownership
    if (mission.child_profile_id !== callerProfile.id) {
      return new Response(JSON.stringify({ error: "Not your mission" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Prevent double completion
    if (mission.status === "completed") {
      return new Response(JSON.stringify({ error: "Mission already completed", already_completed: true }), {
        status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check expiration
    if (mission.expires_at && new Date(mission.expires_at) < new Date()) {
      return new Response(JSON.stringify({ error: "Mission has expired" }), {
        status: 410, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Mark as completed
    const { error: updateErr } = await admin
      .from("missions")
      .update({ status: "completed", completed_at: new Date().toISOString() })
      .eq("id", mission_id);

    if (updateErr) throw updateErr;

    // Award KivaCoins via create-transaction edge function
    const reward = mission.reward ?? 0;
    const kivaPoints = mission.kiva_points_reward ?? 0;
    let newBalance: number | null = null;

    if (reward > 0) {
      try {
        // Get system wallet and child wallet
        const { data: systemWallet } = await admin.rpc("get_system_wallet_id");
        const { data: childWallet } = await admin
          .from("wallets")
          .select("id")
          .eq("profile_id", callerProfile.id)
          .eq("wallet_type", "virtual")
          .eq("currency", "KVC")
          .maybeSingle();

        if (systemWallet && childWallet) {
          const idempotencyKey = `mission-reward-${mission_id}`;

          // Check idempotency
          const { data: existing } = await admin
            .from("ledger_entries")
            .select("id")
            .eq("idempotency_key", idempotencyKey)
            .maybeSingle();

          if (!existing) {
            await admin.from("ledger_entries").insert({
              entry_type: "mission_reward",
              amount: reward,
              description: `Recompensa: ${mission.title}`,
              debit_wallet_id: systemWallet,
              credit_wallet_id: childWallet.id,
              created_by: callerProfile.id,
              idempotency_key: idempotencyKey,
              reference_id: mission_id,
              reference_type: "mission",
              metadata: { kiva_points: kivaPoints, difficulty: mission.difficulty },
            });

            // Get updated balance
            const { data: balData } = await admin
              .from("wallet_balances")
              .select("balance")
              .eq("profile_id", callerProfile.id)
              .eq("wallet_type", "virtual")
              .eq("currency", "KVC")
              .maybeSingle();
            newBalance = Number(balData?.balance ?? 0);
          }
        }
      } catch (ledgerErr) {
        console.error("Ledger error:", ledgerErr);
        // Mission is completed, reward failed — log but don't rollback
      }
    }

    // Surprise reward (10% chance)
    let surpriseBonus = 0;
    if (Math.random() < 0.1 && reward > 0) {
      surpriseBonus = Math.ceil(reward * 0.5);
      try {
        const { data: systemWallet } = await admin.rpc("get_system_wallet_id");
        const { data: childWallet } = await admin
          .from("wallets")
          .select("id")
          .eq("profile_id", callerProfile.id)
          .eq("wallet_type", "virtual")
          .eq("currency", "KVC")
          .maybeSingle();

        if (systemWallet && childWallet) {
          const bonusKey = `mission-bonus-${mission_id}`;
          const { data: existingBonus } = await admin
            .from("ledger_entries")
            .select("id")
            .eq("idempotency_key", bonusKey)
            .maybeSingle();

          if (!existingBonus) {
            await admin.from("ledger_entries").insert({
              entry_type: "mission_reward",
              amount: surpriseBonus,
              description: `Bónus surpresa do Kivo! 🎁`,
              debit_wallet_id: systemWallet,
              credit_wallet_id: childWallet.id,
              created_by: callerProfile.id,
              idempotency_key: bonusKey,
              reference_id: mission_id,
              reference_type: "mission_bonus",
              metadata: { surprise: true },
            });
          }
        }
      } catch (bonusErr) {
        console.error("Surprise bonus error:", bonusErr);
        surpriseBonus = 0;
      }
    }

    // Send notification
    const bonusText = surpriseBonus > 0 ? ` + Bónus surpresa: ${surpriseBonus} KVC! 🎁` : '';
    await admin.from("notifications").insert({
      profile_id: callerProfile.id,
      title: surpriseBonus > 0 ? "Missão concluída + Bónus Kivo! 🎁🎉" : "Missão concluída! 🎉",
      message: `Completaste "${mission.title}" e ganhaste ${reward} KVC e ${kivaPoints} pontos!${bonusText}`,
      type: "achievement",
    });

    return new Response(JSON.stringify({
      success: true,
      reward_coins: reward,
      reward_points: kivaPoints,
      new_balance: newBalance,
      surprise_bonus: surpriseBonus,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("complete-mission error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
