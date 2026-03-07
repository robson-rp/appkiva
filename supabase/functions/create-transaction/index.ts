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
  target_profile_id?: string;
  reference_id?: string;
  reference_type?: string;
  metadata?: Record<string, unknown>;
}

const VALID_ENTRY_TYPES = [
  "allowance", "task_reward", "mission_reward", "purchase", "donation",
  "vault_deposit", "vault_withdraw", "vault_interest", "transfer", "adjustment", "refund",
];

// Types that emit KVC from system wallet
const EMISSION_TYPES = ["allowance", "task_reward", "mission_reward", "vault_interest", "adjustment", "refund"];

// Types that require parent role
const PARENT_ONLY_TYPES = ["allowance", "task_reward", "mission_reward", "adjustment", "refund"];

// Types that require approval
const REQUIRES_APPROVAL_TYPES = ["purchase", "donation", "transfer"];

function errorResponse(message: string, status: number, extra?: Record<string, unknown>) {
  return new Response(
    JSON.stringify({ error: message, ...extra }),
    { status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function getSystemWalletId(supabaseAdmin: ReturnType<typeof createClient>): Promise<string | null> {
  const { data } = await supabaseAdmin
    .from("wallets")
    .select("id")
    .eq("is_system", true)
    .eq("wallet_type", "virtual")
    .eq("currency", "KVC")
    .limit(1)
    .single();
  return data?.id ?? null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 1. Auth validation
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return errorResponse("Não autorizado", 401);
    }

    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseUser.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return errorResponse("Token inválido", 401);
    }

    const userId = claimsData.claims.sub;

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 2. Parse and validate request body
    const body: TransactionRequest = await req.json();

    if (!body.entry_type || !VALID_ENTRY_TYPES.includes(body.entry_type)) {
      return errorResponse("Tipo de transacção inválido", 400, { valid_types: VALID_ENTRY_TYPES });
    }

    if (!body.amount || body.amount <= 0) {
      return errorResponse("O montante deve ser positivo", 400);
    }

    if (!body.description?.trim()) {
      return errorResponse("A descrição é obrigatória", 400);
    }

    // 3. Get caller's profile and role
    const { data: callerProfile } = await supabaseAdmin
      .from("profiles")
      .select("id, household_id")
      .eq("user_id", userId)
      .single();

    if (!callerProfile) {
      return errorResponse("Perfil não encontrado", 404);
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
      return errorResponse("Apenas encarregados podem executar esta transacção", 403);
    }

    // 5. Get system wallet for emission types
    const systemWalletId = await getSystemWalletId(supabaseAdmin);
    if (!systemWalletId) {
      return errorResponse("Carteira-sistema não configurada. Contacte o administrador.", 500);
    }

    // 6. Get caller's wallet
    const { data: callerWallet } = await supabaseAdmin
      .from("wallets")
      .select("id")
      .eq("profile_id", callerProfile.id)
      .eq("wallet_type", "virtual")
      .eq("currency", "KVC")
      .eq("is_system", false)
      .single();

    if (!callerWallet) {
      return errorResponse("Carteira não encontrada", 404);
    }

    // 7. Get target wallet if needed
    let targetWallet: { id: string } | null = null;
    if (body.target_profile_id) {
      const { data: targetProfile } = await supabaseAdmin
        .from("profiles")
        .select("id, household_id")
        .eq("id", body.target_profile_id)
        .single();

      if (!targetProfile) {
        return errorResponse("Perfil alvo não encontrado", 404);
      }

      if (targetProfile.household_id !== callerProfile.household_id && callerProfile.household_id) {
        return errorResponse("O perfil alvo não pertence à mesma família", 403);
      }

      const { data: tw } = await supabaseAdmin
        .from("wallets")
        .select("id")
        .eq("profile_id", body.target_profile_id)
        .eq("wallet_type", "virtual")
        .eq("currency", "KVC")
        .eq("is_system", false)
        .single();

      targetWallet = tw;
      if (!targetWallet) {
        return errorResponse("Carteira do alvo não encontrada", 404);
      }
    }

    // 8. Determine debit and credit wallets
    let debitWalletId: string;
    let creditWalletId: string;
    const requiresApproval = REQUIRES_APPROVAL_TYPES.includes(body.entry_type) && !isParent && !isAdmin;
    const isEmission = EMISSION_TYPES.includes(body.entry_type);

    switch (body.entry_type) {
      case "allowance":
      case "task_reward":
      case "mission_reward":
      case "refund":
      case "adjustment":
      case "vault_interest":
        // EMISSION: System wallet → target (child/teen) wallet
        debitWalletId = systemWalletId;
        creditWalletId = targetWallet?.id ?? callerWallet.id;
        break;

      case "purchase":
      case "donation":
        // BURN: Child's wallet → system wallet (coins return to system)
        debitWalletId = callerWallet.id;
        creditWalletId = systemWalletId;
        break;

      case "vault_deposit":
        debitWalletId = callerWallet.id;
        creditWalletId = targetWallet?.id ?? callerWallet.id;
        break;

      case "vault_withdraw":
        debitWalletId = targetWallet?.id ?? callerWallet.id;
        creditWalletId = callerWallet.id;
        break;

      case "transfer":
        if (!targetWallet) {
          return errorResponse("target_profile_id é obrigatório para transferências", 400);
        }
        debitWalletId = callerWallet.id;
        creditWalletId = targetWallet.id;
        break;

      default:
        debitWalletId = callerWallet.id;
        creditWalletId = targetWallet?.id ?? callerWallet.id;
    }

    // 9. Balance check for debiting operations (skip for system wallet emissions)
    const debitTypes = ["purchase", "donation", "vault_deposit", "transfer"];
    if (debitTypes.includes(body.entry_type)) {
      const { data: balanceData } = await supabaseAdmin
        .from("wallet_balances")
        .select("balance")
        .eq("wallet_id", debitWalletId)
        .single();

      const currentBalance = balanceData?.balance ?? 0;
      if (currentBalance < body.amount) {
        return errorResponse("Saldo insuficiente", 422, {
          current_balance: currentBalance,
          requested: body.amount,
        });
      }
    }

    // 10. Spending limit check (for children/teens)
    if (body.entry_type === "purchase" && !isParent && !isAdmin) {
      const today = new Date().toISOString().split("T")[0];
      const { data: todaySpending } = await supabaseAdmin
        .from("ledger_entries")
        .select("amount")
        .eq("debit_wallet_id", debitWalletId)
        .eq("entry_type", "purchase")
        .gte("created_at", `${today}T00:00:00Z`);

      const dailyTotal = (todaySpending ?? []).reduce((sum, e) => sum + Number(e.amount), 0) + body.amount;
      const DAILY_SPEND_LIMIT = 50;

      if (dailyTotal > DAILY_SPEND_LIMIT) {
        return errorResponse("Limite diário de gastos excedido", 422, {
          daily_limit: DAILY_SPEND_LIMIT,
          spent_today: dailyTotal - body.amount,
          requested: body.amount,
        });
      }
    }

    // 10b. Monthly budget check
    if (body.entry_type === "purchase" && !isParent && !isAdmin) {
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
          .eq("debit_wallet_id", debitWalletId)
          .eq("entry_type", "purchase")
          .gte("created_at", monthStart);

        const totalSpent = (monthPurchases ?? []).reduce((sum: number, e: any) => sum + Number(e.amount), 0);
        const remaining = monthlyBudget - totalSpent;

        if (remaining < body.amount) {
          return errorResponse("Limite mensal de gastos excedido", 422, {
            monthly_budget: monthlyBudget,
            spent_this_month: totalSpent,
            remaining,
            requested: body.amount,
          });
        }
      }
    }

    // 11. Create the ledger entry
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
        metadata: {
          ...(body.metadata ?? {}),
          emission: isEmission,
          system_wallet_used: debitWalletId === systemWalletId || creditWalletId === systemWalletId,
        },
        requires_approval: requiresApproval,
        approved_by: requiresApproval ? null : callerProfile.id,
        approved_at: requiresApproval ? null : new Date().toISOString(),
        created_by: callerProfile.id,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Ledger insert error:", insertError);
      return errorResponse("Erro ao registar transacção", 500, { details: insertError.message });
    }

    // 12. Budget threshold notification for purchases
    if (body.entry_type === "purchase") {
      const { data: childRecord } = await supabaseAdmin
        .from("children")
        .select("monthly_budget, parent_profile_id")
        .eq("profile_id", callerProfile.id)
        .maybeSingle();

      if (childRecord && Number(childRecord.monthly_budget) > 0) {
        const monthlyBudget = Number(childRecord.monthly_budget);
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

        const { data: monthPurchases } = await supabaseAdmin
          .from("ledger_entries")
          .select("amount")
          .eq("debit_wallet_id", debitWalletId)
          .eq("entry_type", "purchase")
          .gte("created_at", monthStart);

        const totalSpent = (monthPurchases ?? []).reduce((sum: number, e: any) => sum + Number(e.amount), 0);
        const pct = (totalSpent / monthlyBudget) * 100;

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
    }

    // 13. Get updated balance (for the recipient wallet)
    const balanceWalletId = isEmission ? creditWalletId : creditWalletId;
    const { data: newBalance } = await supabaseAdmin
      .from("wallet_balances")
      .select("balance")
      .eq("wallet_id", balanceWalletId)
      .single();

    return new Response(
      JSON.stringify({
        success: true,
        entry,
        requires_approval: requiresApproval,
        new_balance: newBalance?.balance ?? null,
        emission: isEmission,
      }),
      { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Transaction error:", err);
    return errorResponse("Erro interno do servidor", 500);
  }
});
