import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface TransactionRequest {
  entry_type: string;
  amount: number;
  description: string;
  target_profile_id?: string; // for allowance, transfer
  reference_id?: string;
  reference_type?: string;
  metadata?: Record<string, unknown>;
}

const VALID_ENTRY_TYPES = [
  "allowance",
  "task_reward",
  "mission_reward",
  "purchase",
  "donation",
  "vault_deposit",
  "vault_withdraw",
  "vault_interest",
  "transfer",
  "adjustment",
  "refund",
];

// Types that require parent role
const PARENT_ONLY_TYPES = [
  "allowance",
  "task_reward",
  "mission_reward",
  "adjustment",
  "refund",
];

// Types that require approval
const REQUIRES_APPROVAL_TYPES = ["purchase", "donation", "transfer"];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 1. Auth validation
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

    // Admin client for privileged operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 2. Parse and validate request body
    const body: TransactionRequest = await req.json();

    if (!body.entry_type || !VALID_ENTRY_TYPES.includes(body.entry_type)) {
      return new Response(
        JSON.stringify({ error: "Tipo de transacção inválido", valid_types: VALID_ENTRY_TYPES }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!body.amount || body.amount <= 0) {
      return new Response(
        JSON.stringify({ error: "O montante deve ser positivo" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!body.description?.trim()) {
      return new Response(
        JSON.stringify({ error: "A descrição é obrigatória" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Get caller's profile and role
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

    const { data: callerRoles } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);

    const roles = (callerRoles ?? []).map((r) => r.role);
    const isParent = roles.includes("parent");
    const isAdmin = roles.includes("admin");

    // 4. Role-based authorization
    if (PARENT_ONLY_TYPES.includes(body.entry_type) && !isParent && !isAdmin) {
      return new Response(
        JSON.stringify({ error: "Apenas encarregados podem executar esta transacção" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 5. Determine debit and credit wallets
    let debitWalletId: string;
    let creditWalletId: string;
    const requiresApproval = REQUIRES_APPROVAL_TYPES.includes(body.entry_type) && !isParent && !isAdmin;

    // Get caller's wallet
    const { data: callerWallet } = await supabaseAdmin
      .from("wallets")
      .select("id")
      .eq("profile_id", callerProfile.id)
      .eq("wallet_type", "virtual")
      .eq("currency", "KVC")
      .single();

    if (!callerWallet) {
      return new Response(
        JSON.stringify({ error: "Carteira não encontrada" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get target wallet if needed
    let targetWallet: { id: string } | null = null;
    if (body.target_profile_id) {
      // Verify target is in same household
      const { data: targetProfile } = await supabaseAdmin
        .from("profiles")
        .select("id, household_id")
        .eq("id", body.target_profile_id)
        .single();

      if (!targetProfile) {
        return new Response(
          JSON.stringify({ error: "Perfil alvo não encontrado" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (targetProfile.household_id !== callerProfile.household_id && callerProfile.household_id) {
        return new Response(
          JSON.stringify({ error: "O perfil alvo não pertence à mesma família" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: tw } = await supabaseAdmin
        .from("wallets")
        .select("id")
        .eq("profile_id", body.target_profile_id)
        .eq("wallet_type", "virtual")
        .eq("currency", "KVC")
        .single();

      targetWallet = tw;
      if (!targetWallet) {
        return new Response(
          JSON.stringify({ error: "Carteira do alvo não encontrada" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Determine direction based on entry_type
    switch (body.entry_type) {
      case "allowance":
      case "task_reward":
      case "mission_reward":
      case "refund":
        // Parent's wallet → child's wallet (coins flow to child)
        debitWalletId = callerWallet.id;
        creditWalletId = targetWallet?.id ?? callerWallet.id;
        break;

      case "purchase":
      case "donation":
        // Child's wallet → parent's wallet (coins flow from child)
        debitWalletId = callerWallet.id;
        creditWalletId = targetWallet?.id ?? callerWallet.id;
        // For purchases, we need to check the child has sufficient balance
        break;

      case "vault_deposit":
        // Main wallet → vault (self-transfer, different sub-wallets conceptually)
        debitWalletId = callerWallet.id;
        creditWalletId = targetWallet?.id ?? callerWallet.id;
        break;

      case "vault_withdraw":
        debitWalletId = targetWallet?.id ?? callerWallet.id;
        creditWalletId = callerWallet.id;
        break;

      case "transfer":
        if (!targetWallet) {
          return new Response(
            JSON.stringify({ error: "target_profile_id é obrigatório para transferências" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        debitWalletId = callerWallet.id;
        creditWalletId = targetWallet.id;
        break;

      case "adjustment":
        debitWalletId = callerWallet.id;
        creditWalletId = targetWallet?.id ?? callerWallet.id;
        break;

      case "vault_interest":
        // System → vault wallet
        debitWalletId = callerWallet.id;
        creditWalletId = targetWallet?.id ?? callerWallet.id;
        break;

      default:
        debitWalletId = callerWallet.id;
        creditWalletId = targetWallet?.id ?? callerWallet.id;
    }

    // 6. Balance check for debiting operations
    const debitTypes = ["purchase", "donation", "vault_deposit", "transfer"];
    if (debitTypes.includes(body.entry_type)) {
      const { data: balanceData } = await supabaseAdmin
        .from("wallet_balances")
        .select("balance")
        .eq("wallet_id", debitWalletId)
        .single();

      const currentBalance = balanceData?.balance ?? 0;
      if (currentBalance < body.amount) {
        return new Response(
          JSON.stringify({
            error: "Saldo insuficiente",
            current_balance: currentBalance,
            requested: body.amount,
          }),
          { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // 7. Spending limit check (for children/teens)
    if (body.entry_type === "purchase" && !isParent && !isAdmin) {
      // Check daily spending — sum of purchase debits today
      const today = new Date().toISOString().split("T")[0];
      const { data: todaySpending } = await supabaseAdmin
        .from("ledger_entries")
        .select("amount")
        .eq("debit_wallet_id", debitWalletId)
        .eq("entry_type", "purchase")
        .gte("created_at", `${today}T00:00:00Z`);

      const dailyTotal = (todaySpending ?? []).reduce((sum, e) => sum + Number(e.amount), 0) + body.amount;
      const DAILY_SPEND_LIMIT = 50; // TODO: make configurable per child via policies table

      if (dailyTotal > DAILY_SPEND_LIMIT) {
        return new Response(
          JSON.stringify({
            error: "Limite diário de gastos excedido",
            daily_limit: DAILY_SPEND_LIMIT,
            spent_today: dailyTotal - body.amount,
            requested: body.amount,
          }),
          { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // 8. Create the ledger entry
    const { data: entry, error: insertError } = await supabaseAdmin
      .from("ledger_entries")
      .insert({
        debit_wallet_id: debitWalletId,
        credit_wallet_id: creditWalletId,
        amount: body.amount,
        entry_type: body.entry_type,
        description: body.description,
        reference_id: body.reference_id ?? null,
        reference_type: body.reference_type ?? null,
        metadata: body.metadata ?? {},
        requires_approval: requiresApproval,
        approved_by: requiresApproval ? null : callerProfile.id,
        approved_at: requiresApproval ? null : new Date().toISOString(),
        created_by: callerProfile.id,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Ledger insert error:", insertError);
      return new Response(
        JSON.stringify({ error: "Erro ao registar transacção", details: insertError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 9. Get updated balance
    const { data: newBalance } = await supabaseAdmin
      .from("wallet_balances")
      .select("balance")
      .eq("wallet_id", creditWalletId)
      .single();

    return new Response(
      JSON.stringify({
        success: true,
        entry,
        requires_approval: requiresApproval,
        new_balance: newBalance?.balance ?? null,
      }),
      { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Transaction error:", err);
    return new Response(
      JSON.stringify({ error: "Erro interno do servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
