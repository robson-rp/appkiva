import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 1. Auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Não autorizado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseUser.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: "Token inválido" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub;

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 2. Parse body
    const { reward_id } = await req.json();
    if (!reward_id) {
      return new Response(
        JSON.stringify({ error: "reward_id é obrigatório" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Get caller profile
    const { data: callerProfile } = await supabaseAdmin
      .from("profiles")
      .select("id, household_id")
      .eq("user_id", userId)
      .single();

    if (!callerProfile) {
      return new Response(
        JSON.stringify({ error: "Perfil não encontrado" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. Get reward and validate
    const { data: reward, error: rewardErr } = await supabaseAdmin
      .from("rewards")
      .select("*")
      .eq("id", reward_id)
      .single();

    if (rewardErr || !reward) {
      return new Response(
        JSON.stringify({ error: "Recompensa não encontrada" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!reward.available || reward.claimed_by) {
      return new Response(
        JSON.stringify({ error: "Esta recompensa já foi resgatada" }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 5. Verify reward belongs to child's parent (same household)
    const { data: parentProfile } = await supabaseAdmin
      .from("profiles")
      .select("household_id")
      .eq("id", reward.parent_profile_id)
      .single();

    if (parentProfile?.household_id !== callerProfile.household_id && callerProfile.household_id) {
      return new Response(
        JSON.stringify({ error: "Esta recompensa não pertence à tua família" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 6. Check child balance
    const { data: childWallet } = await supabaseAdmin
      .from("wallets")
      .select("id")
      .eq("profile_id", callerProfile.id)
      .eq("wallet_type", "virtual")
      .eq("currency", "KVC")
      .single();

    if (!childWallet) {
      return new Response(
        JSON.stringify({ error: "Carteira não encontrada" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: balanceData } = await supabaseAdmin
      .from("wallet_balances")
      .select("balance")
      .eq("wallet_id", childWallet.id)
      .single();

    const balance = Number(balanceData?.balance) || 0;
    if (balance < Number(reward.price)) {
      return new Response(
        JSON.stringify({ error: "Saldo insuficiente", current_balance: balance, price: reward.price }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 6b. Check monthly budget limit
    const { data: childRecord } = await supabaseAdmin
      .from("children")
      .select("monthly_budget")
      .eq("profile_id", callerProfile.id)
      .maybeSingle();

    const monthlyBudget = Number(childRecord?.monthly_budget) || 0;
    if (monthlyBudget > 0) {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      const { data: monthPurchases } = await supabaseAdmin
        .from("ledger_entries")
        .select("amount")
        .eq("debit_wallet_id", childWallet.id)
        .eq("entry_type", "purchase")
        .gte("created_at", monthStart);

      const totalSpent = (monthPurchases ?? []).reduce((sum: number, e: any) => sum + Number(e.amount), 0);
      const remaining = monthlyBudget - totalSpent;

      if (remaining < Number(reward.price)) {
        return new Response(
          JSON.stringify({
            error: "Limite mensal de gastos excedido",
            monthly_budget: monthlyBudget,
            spent_this_month: totalSpent,
            remaining,
            price: reward.price,
          }),
          { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // 7. Get parent wallet for debit/credit
    const { data: parentWallet } = await supabaseAdmin
      .from("wallets")
      .select("id")
      .eq("profile_id", reward.parent_profile_id)
      .eq("wallet_type", "virtual")
      .eq("currency", "KVC")
      .single();

    if (!parentWallet) {
      return new Response(
        JSON.stringify({ error: "Carteira do encarregado não encontrada" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 8. Create ledger entry (debit child, credit parent)
    const { error: ledgerErr } = await supabaseAdmin
      .from("ledger_entries")
      .insert({
        debit_wallet_id: childWallet.id,
        credit_wallet_id: parentWallet.id,
        amount: reward.price,
        entry_type: "purchase",
        description: `Resgate: ${reward.name}`,
        reference_id: reward.id,
        reference_type: "reward",
        requires_approval: false,
        approved_by: callerProfile.id,
        approved_at: new Date().toISOString(),
        created_by: callerProfile.id,
        metadata: { reward_name: reward.name, reward_category: reward.category },
      });

    if (ledgerErr) {
      console.error("Ledger error:", ledgerErr);
      return new Response(
        JSON.stringify({ error: "Erro ao registar transacção" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 9. Mark reward as claimed
    const { error: updateErr } = await supabaseAdmin
      .from("rewards")
      .update({
        claimed_by: callerProfile.id,
        claimed_at: new Date().toISOString(),
        available: false,
      })
      .eq("id", reward_id);

    if (updateErr) {
      console.error("Reward update error:", updateErr);
      return new Response(
        JSON.stringify({ error: "Erro ao actualizar recompensa" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 10. Create notification for the parent
    await supabaseAdmin.from("notifications").insert({
      profile_id: reward.parent_profile_id,
      title: "Recompensa resgatada! 🎁",
      message: `A recompensa "${reward.name}" foi resgatada por ${reward.price} KivaCoins.`,
      type: "reward",
      metadata: { reward_id: reward.id, reward_name: reward.name, claimed_by: callerProfile.id },
    });

    // Also notify the child (confirmation)
    await supabaseAdmin.from("notifications").insert({
      profile_id: callerProfile.id,
      title: "Recompensa obtida! 🎉",
      message: `Resgataste "${reward.name}" por ${reward.price} KivaCoins. Aproveita!`,
      type: "reward",
      metadata: { reward_id: reward.id, reward_name: reward.name },
    });

    // 12. Check monthly budget threshold (80%) and notify parent
    const { data: childRecord } = await supabaseAdmin
      .from("children")
      .select("monthly_budget, parent_profile_id, profile_id")
      .eq("profile_id", callerProfile.id)
      .maybeSingle();

    if (childRecord && Number(childRecord.monthly_budget) > 0) {
      const monthlyBudget = Number(childRecord.monthly_budget);
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      const { data: monthPurchases } = await supabaseAdmin
        .from("ledger_entries")
        .select("amount")
        .eq("debit_wallet_id", childWallet.id)
        .eq("entry_type", "purchase")
        .gte("created_at", monthStart);

      const totalSpent = (monthPurchases ?? []).reduce((sum: number, e: any) => sum + Number(e.amount), 0);
      const pct = (totalSpent / monthlyBudget) * 100;

      // Get child display name
      const { data: childProfile } = await supabaseAdmin
        .from("profiles")
        .select("display_name")
        .eq("id", callerProfile.id)
        .single();

      const childName = childProfile?.display_name ?? "O teu filho(a)";

      if (pct >= 100) {
        await supabaseAdmin.from("notifications").insert({
          profile_id: childRecord.parent_profile_id,
          title: "🚨 Limite mensal atingido!",
          message: `${childName} atingiu 100% do limite mensal de ${monthlyBudget} KVC (gastou ${totalSpent} KVC).`,
          type: "budget",
          urgent: true,
          metadata: { child_profile_id: callerProfile.id, spent: totalSpent, budget: monthlyBudget, pct: Math.round(pct) },
        });
      } else if (pct >= 80) {
        await supabaseAdmin.from("notifications").insert({
          profile_id: childRecord.parent_profile_id,
          title: "⚠️ Limite mensal quase atingido",
          message: `${childName} já gastou ${Math.round(pct)}% do limite mensal (${totalSpent}/${monthlyBudget} KVC).`,
          type: "budget",
          metadata: { child_profile_id: callerProfile.id, spent: totalSpent, budget: monthlyBudget, pct: Math.round(pct) },
        });
      }
    }

    // 13. Get new balance
    const { data: newBalanceData } = await supabaseAdmin
      .from("wallet_balances")
      .select("balance")
      .eq("wallet_id", childWallet.id)
      .single();

    return new Response(
      JSON.stringify({
        success: true,
        new_balance: Number(newBalanceData?.balance) || 0,
        reward_name: reward.name,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Claim reward error:", err);
    return new Response(
      JSON.stringify({ error: "Erro interno do servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
