import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * Determines if an allowance is due based on frequency and last_sent_at.
 */
function isDue(frequency: string, lastSentAt: string | null): boolean {
  if (!lastSentAt) return true; // never sent

  const last = new Date(lastSentAt);
  const now = new Date();
  const diffMs = now.getTime() - last.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  switch (frequency) {
    case "daily":
      return diffDays >= 1;
    case "weekly":
      return diffDays >= 7;
    case "biweekly":
      return diffDays >= 14;
    case "monthly":
      // Check if we're in a new month
      return last.getMonth() !== now.getMonth() || last.getFullYear() !== now.getFullYear();
    default:
      return diffDays >= 7;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Auth guard: only service-role key can invoke this cron function
  const authHeader = req.headers.get("Authorization");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (authHeader !== `Bearer ${serviceKey}`) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 1. Get all active allowance configs
    const { data: configs, error: configError } = await supabaseAdmin
      .from("allowance_configs")
      .select("*");

    if (configError) {
      console.error("Error fetching configs:", configError);
      return new Response(
        JSON.stringify({ error: "Erro ao buscar configurações", details: configError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!configs || configs.length === 0) {
      return new Response(
        JSON.stringify({ processed: 0, message: "Nenhuma configuração de mesada encontrada" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Get system wallet
    const { data: systemWallet } = await supabaseAdmin
      .from("wallets")
      .select("id")
      .eq("is_system", true)
      .eq("wallet_type", "virtual")
      .eq("currency", "KVC")
      .limit(1)
      .single();

    if (!systemWallet) {
      return new Response(
        JSON.stringify({ error: "Carteira-sistema não encontrada" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results: { childProfileId: string; amount: number; status: string; reason?: string }[] = [];

    for (const config of configs) {
      // 3. Check if due
      if (!isDue(config.frequency, config.last_sent_at)) {
        results.push({ childProfileId: config.child_profile_id, amount: 0, status: "skipped", reason: "not_due" });
        continue;
      }

      // 4. Calculate total amount (base + bonuses for completed tasks)
      let totalAmount = Number(config.base_amount) || 0;

      // Count completed tasks since last allowance for bonus calculation
      if (Number(config.task_bonus) > 0) {
        const since = config.last_sent_at ?? new Date(0).toISOString();
        const { data: completedTasks } = await supabaseAdmin
          .from("tasks")
          .select("id")
          .eq("child_profile_id", config.child_profile_id)
          .eq("status", "approved")
          .gte("approved_at", since);

        const taskCount = completedTasks?.length ?? 0;
        totalAmount += taskCount * Number(config.task_bonus);
      }

      if (totalAmount <= 0) {
        results.push({ childProfileId: config.child_profile_id, amount: 0, status: "skipped", reason: "zero_amount" });
        continue;
      }

      // 5. Check parent emission limit
      const { data: emissionStats } = await supabaseAdmin.rpc("get_parent_emission_stats", {
        _parent_profile_id: config.parent_profile_id,
      });

      if (emissionStats && !emissionStats.error) {
        const remaining = Number(emissionStats.remaining) || 0;
        if (totalAmount > remaining) {
          // Send notification to parent about emission limit
          await supabaseAdmin.from("notifications").insert({
            profile_id: config.parent_profile_id,
            title: "⚠️ Mesada automática bloqueada",
            message: `A mesada automática de ${totalAmount} KVC não foi enviada porque excede o limite mensal de emissão (restam ${remaining} KVC).`,
            type: "allowance",
            urgent: true,
            metadata: { child_profile_id: config.child_profile_id, amount: totalAmount, remaining },
          });
          results.push({ childProfileId: config.child_profile_id, amount: totalAmount, status: "blocked", reason: "emission_limit" });
          continue;
        }
      }

      // 6. Get child's wallet
      const { data: childWallet } = await supabaseAdmin
        .from("wallets")
        .select("id")
        .eq("profile_id", config.child_profile_id)
        .eq("wallet_type", "virtual")
        .eq("currency", "KVC")
        .eq("is_system", false)
        .single();

      if (!childWallet) {
        results.push({ childProfileId: config.child_profile_id, amount: totalAmount, status: "error", reason: "no_wallet" });
        continue;
      }

      // 7. Create the ledger entry (system wallet → child wallet)
      const { error: ledgerError } = await supabaseAdmin
        .from("ledger_entries")
        .insert({
          debit_wallet_id: systemWallet.id,
          credit_wallet_id: childWallet.id,
          amount: totalAmount,
          entry_type: "allowance",
          description: `Mesada automática (${config.frequency})`,
          metadata: {
            emission: true,
            system_wallet_used: true,
            automated: true,
            base_amount: config.base_amount,
            task_bonus: config.task_bonus,
            frequency: config.frequency,
          },
          requires_approval: false,
          approved_by: config.parent_profile_id,
          approved_at: new Date().toISOString(),
          created_by: config.parent_profile_id,
        });

      if (ledgerError) {
        console.error(`Ledger error for child ${config.child_profile_id}:`, ledgerError);
        results.push({ childProfileId: config.child_profile_id, amount: totalAmount, status: "error", reason: ledgerError.message });
        continue;
      }

      // 8. Update last_sent_at
      await supabaseAdmin
        .from("allowance_configs")
        .update({ last_sent_at: new Date().toISOString() })
        .eq("id", config.id);

      // 9. Send notification to child
      const { data: childProfile } = await supabaseAdmin
        .from("profiles")
        .select("display_name")
        .eq("id", config.child_profile_id)
        .single();

      await supabaseAdmin.from("notifications").insert({
        profile_id: config.child_profile_id,
        title: "🎉 Mesada recebida!",
        message: `Recebeste ${totalAmount} KVC de mesada automática!`,
        type: "allowance",
        metadata: { amount: totalAmount, automated: true },
      });

      // Notify parent too
      await supabaseAdmin.from("notifications").insert({
        profile_id: config.parent_profile_id,
        title: "✅ Mesada enviada automaticamente",
        message: `${totalAmount} KVC enviados para ${childProfile?.display_name ?? "o teu filho(a)"}.`,
        type: "allowance",
        metadata: { child_profile_id: config.child_profile_id, amount: totalAmount, automated: true },
      });

      results.push({ childProfileId: config.child_profile_id, amount: totalAmount, status: "sent" });
    }

    const sent = results.filter(r => r.status === "sent").length;
    const blocked = results.filter(r => r.status === "blocked").length;
    const skipped = results.filter(r => r.status === "skipped").length;

    console.log(`Process-allowances: sent=${sent}, blocked=${blocked}, skipped=${skipped}`);

    return new Response(
      JSON.stringify({
        processed: configs.length,
        sent,
        blocked,
        skipped,
        results,
        timestamp: new Date().toISOString(),
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Process allowances error:", err);
    return new Response(
      JSON.stringify({ error: "Erro interno do servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
