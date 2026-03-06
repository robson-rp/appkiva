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

    const { request_id, action } = await req.json();
    if (!request_id || !action || !["approve", "reject"].includes(action)) {
      return new Response(
        JSON.stringify({ error: "request_id e action (approve/reject) são obrigatórios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get caller profile and verify parent role
    const { data: callerProfile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (!callerProfile) {
      return new Response(
        JSON.stringify({ error: "Perfil não encontrado" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: roles } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);

    const isParent = (roles ?? []).some((r) => r.role === "parent");
    if (!isParent) {
      return new Response(
        JSON.stringify({ error: "Apenas encarregados podem aprovar exceções" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get the request
    const { data: request, error: reqErr } = await supabaseAdmin
      .from("budget_exception_requests")
      .select("*")
      .eq("id", request_id)
      .eq("parent_profile_id", callerProfile.id)
      .single();

    if (reqErr || !request) {
      return new Response(
        JSON.stringify({ error: "Pedido não encontrado" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (request.status !== "pending") {
      return new Response(
        JSON.stringify({ error: "Este pedido já foi processado" }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update request status
    await supabaseAdmin
      .from("budget_exception_requests")
      .update({
        status: action === "approve" ? "approved" : "rejected",
        resolved_at: new Date().toISOString(),
        resolved_by: callerProfile.id,
      })
      .eq("id", request_id);

    if (action === "reject") {
      // Notify child of rejection
      await supabaseAdmin.from("notifications").insert({
        profile_id: request.child_profile_id,
        title: "Pedido recusado 😔",
        message: `O teu encarregado recusou o pedido de exceção ao limite mensal.`,
        type: "budget",
        metadata: { request_id },
      });

      return new Response(
        JSON.stringify({ success: true, action: "rejected" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // === APPROVE: Execute the claim-reward logic ===
    const reward_id = request.reward_id;

    // Get reward
    const { data: reward } = await supabaseAdmin
      .from("rewards")
      .select("*")
      .eq("id", reward_id)
      .single();

    if (!reward || !reward.available || reward.claimed_by) {
      await supabaseAdmin.from("notifications").insert({
        profile_id: request.child_profile_id,
        title: "Recompensa indisponível 😔",
        message: "A recompensa que pediste já não está disponível.",
        type: "budget",
        metadata: { request_id },
      });
      return new Response(
        JSON.stringify({ error: "Recompensa já não disponível" }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get child wallet
    const { data: childWallet } = await supabaseAdmin
      .from("wallets")
      .select("id")
      .eq("profile_id", request.child_profile_id)
      .eq("wallet_type", "virtual")
      .eq("currency", "KVC")
      .single();

    if (!childWallet) {
      return new Response(
        JSON.stringify({ error: "Carteira não encontrada" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check balance
    const { data: balanceData } = await supabaseAdmin
      .from("wallet_balances")
      .select("balance")
      .eq("wallet_id", childWallet.id)
      .single();

    const balance = Number(balanceData?.balance) || 0;
    if (balance < Number(reward.price)) {
      await supabaseAdmin.from("notifications").insert({
        profile_id: request.child_profile_id,
        title: "Saldo insuficiente 😔",
        message: `A exceção foi aprovada mas já não tens saldo suficiente (${balance}/${reward.price} KVC).`,
        type: "budget",
        metadata: { request_id },
      });
      return new Response(
        JSON.stringify({ error: "Saldo insuficiente" }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get parent wallet
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

    // Create ledger entry (debit child, credit parent) — bypasses budget check
    const { error: ledgerErr } = await supabaseAdmin
      .from("ledger_entries")
      .insert({
        debit_wallet_id: childWallet.id,
        credit_wallet_id: parentWallet.id,
        amount: reward.price,
        entry_type: "purchase",
        description: `Resgate (exceção aprovada): ${reward.name}`,
        reference_id: reward.id,
        reference_type: "reward",
        requires_approval: false,
        approved_by: callerProfile.id,
        approved_at: new Date().toISOString(),
        created_by: request.child_profile_id,
        metadata: {
          reward_name: reward.name,
          reward_category: reward.category,
          budget_exception_id: request_id,
        },
      });

    if (ledgerErr) {
      console.error("Ledger error:", ledgerErr);
      return new Response(
        JSON.stringify({ error: "Erro ao registar transacção" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Mark reward as claimed
    await supabaseAdmin
      .from("rewards")
      .update({
        claimed_by: request.child_profile_id,
        claimed_at: new Date().toISOString(),
        available: false,
      })
      .eq("id", reward_id);

    // Get child name
    const { data: childProfile } = await supabaseAdmin
      .from("profiles")
      .select("display_name")
      .eq("id", request.child_profile_id)
      .single();

    // Notify child
    await supabaseAdmin.from("notifications").insert({
      profile_id: request.child_profile_id,
      title: "Pedido aprovado! 🎉",
      message: `O teu encarregado aprovou a exceção! Resgataste "${reward.name}" por ${reward.price} KVC.`,
      type: "budget",
      metadata: { request_id, reward_id, reward_name: reward.name },
    });

    // Get new balance
    const { data: newBalanceData } = await supabaseAdmin
      .from("wallet_balances")
      .select("balance")
      .eq("wallet_id", childWallet.id)
      .single();

    return new Response(
      JSON.stringify({
        success: true,
        action: "approved",
        reward_name: reward.name,
        new_balance: Number(newBalanceData?.balance) || 0,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Budget exception error:", err);
    return new Response(
      JSON.stringify({ error: "Erro interno do servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
