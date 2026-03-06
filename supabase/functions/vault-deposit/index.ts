import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface VaultDepositRequest {
  vault_id: string;
  amount: number;
}

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

    // Parse request
    const body: VaultDepositRequest = await req.json();

    if (!body.vault_id) {
      return new Response(
        JSON.stringify({ error: "vault_id é obrigatório" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!body.amount || body.amount <= 0) {
      return new Response(
        JSON.stringify({ error: "O montante deve ser positivo" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get caller profile
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

    // Get vault and verify ownership
    const { data: vault } = await supabaseAdmin
      .from("savings_vaults")
      .select("id, profile_id, current_amount, target_amount, name, household_id")
      .eq("id", body.vault_id)
      .single();

    if (!vault) {
      return new Response(
        JSON.stringify({ error: "Cofre não encontrado" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify ownership: must be own vault or same household (parent depositing)
    if (vault.profile_id !== callerProfile.id && vault.household_id !== callerProfile.household_id) {
      return new Response(
        JSON.stringify({ error: "Não tens permissão para depositar neste cofre" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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

    // Balance check
    const { data: balanceData } = await supabaseAdmin
      .from("wallet_balances")
      .select("balance")
      .eq("wallet_id", callerWallet.id)
      .single();

    const currentBalance = Number(balanceData?.balance ?? 0);
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

    // Check vault overflow (don't allow depositing more than remaining target)
    const remaining = Number(vault.target_amount) - Number(vault.current_amount);
    const depositAmount = remaining > 0 ? Math.min(body.amount, remaining) : body.amount;

    // 1. Create ledger entry (debit wallet → credit wallet, self-transfer for accounting)
    const { error: ledgerError } = await supabaseAdmin
      .from("ledger_entries")
      .insert({
        debit_wallet_id: callerWallet.id,
        credit_wallet_id: callerWallet.id, // self-transfer (vault is conceptual)
        amount: depositAmount,
        entry_type: "vault_deposit",
        description: `Depósito no cofre: ${vault.name}`,
        reference_id: vault.id,
        reference_type: "savings_vault",
        metadata: { vault_name: vault.name },
        requires_approval: false,
        approved_at: new Date().toISOString(),
        created_by: callerProfile.id,
      });

    if (ledgerError) {
      console.error("Ledger error:", ledgerError);
      return new Response(
        JSON.stringify({ error: "Erro ao registar transacção", details: ledgerError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Update vault current_amount
    const newVaultAmount = Number(vault.current_amount) + depositAmount;
    const { error: vaultError } = await supabaseAdmin
      .from("savings_vaults")
      .update({ current_amount: newVaultAmount })
      .eq("id", vault.id);

    if (vaultError) {
      console.error("Vault update error:", vaultError);
      return new Response(
        JSON.stringify({ error: "Erro ao actualizar cofre", details: vaultError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Get new wallet balance
    const { data: newBalance } = await supabaseAdmin
      .from("wallet_balances")
      .select("balance")
      .eq("wallet_id", callerWallet.id)
      .single();

    return new Response(
      JSON.stringify({
        success: true,
        deposited: depositAmount,
        vault_balance: newVaultAmount,
        wallet_balance: Number(newBalance?.balance ?? 0),
      }),
      { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Vault deposit error:", err);
    return new Response(
      JSON.stringify({ error: "Erro interno do servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
