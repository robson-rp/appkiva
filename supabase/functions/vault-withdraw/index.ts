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

    const body = await req.json();

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

    // Get caller roles
    const { data: callerRoles } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);

    const roles = (callerRoles ?? []).map((r) => r.role);
    const isParent = roles.includes("parent");
    const isAdmin = roles.includes("admin");

    // Get vault and verify ownership
    const { data: vault } = await supabaseAdmin
      .from("savings_vaults")
      .select("id, profile_id, current_amount, name, household_id, requires_parent_approval")
      .eq("id", body.vault_id)
      .single();

    if (!vault) {
      return new Response(
        JSON.stringify({ error: "Cofre não encontrado" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Must be own vault or same household (parent)
    if (vault.profile_id !== callerProfile.id && vault.household_id !== callerProfile.household_id) {
      return new Response(
        JSON.stringify({ error: "Não tens permissão para levantar deste cofre" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parental approval gate: if vault requires approval and caller is child/teen
    if (vault.requires_parent_approval && !isParent && !isAdmin) {
      // Find the parent in the household
      const { data: parentProfiles } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("household_id", callerProfile.household_id)
        .neq("id", callerProfile.id);

      const { data: callerProfileName } = await supabaseAdmin
        .from("profiles")
        .select("display_name")
        .eq("id", callerProfile.id)
        .single();

      const childName = callerProfileName?.display_name ?? "O teu filho(a)";

      // Notify all parents in household
      if (parentProfiles && parentProfiles.length > 0) {
        const notifications = parentProfiles.map((p) => ({
          profile_id: p.id,
          title: "🔒 Pedido de levantamento do cofre",
          message: `${childName} quer levantar ${body.amount} KVC do cofre "${vault.name}". Aprova na secção de cofres.`,
          type: "vault_approval",
          urgent: true,
          metadata: {
            vault_id: vault.id,
            vault_name: vault.name,
            amount: body.amount,
            child_profile_id: callerProfile.id,
          },
        }));

        await supabaseAdmin.from("notifications").insert(notifications);
      }

      return new Response(
        JSON.stringify({
          success: false,
          requires_parent_approval: true,
          message: "Levantamento requer aprovação parental. O teu encarregado foi notificado.",
        }),
        { status: 202, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check caller's wallet is not frozen
    const { data: callerWallet } = await supabaseAdmin
      .from("wallets")
      .select("id, is_frozen")
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

    if (callerWallet.is_frozen) {
      return new Response(
        JSON.stringify({ error: "A tua carteira está congelada. Contacta o teu encarregado." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check vault has enough funds
    const vaultBalance = Number(vault.current_amount);
    const withdrawAmount = Math.min(body.amount, vaultBalance);

    if (withdrawAmount <= 0) {
      return new Response(
        JSON.stringify({ error: "O cofre está vazio" }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. Create ledger entry
    const { error: ledgerError } = await supabaseAdmin
      .from("ledger_entries")
      .insert({
        debit_wallet_id: callerWallet.id,
        credit_wallet_id: callerWallet.id,
        amount: withdrawAmount,
        entry_type: "vault_withdraw",
        description: `Levantamento do cofre: ${vault.name}`,
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
    const newVaultAmount = vaultBalance - withdrawAmount;
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
        withdrawn: withdrawAmount,
        vault_balance: newVaultAmount,
        wallet_balance: Number(newBalance?.balance ?? 0),
      }),
      { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Vault withdraw error:", err);
    return new Response(
      JSON.stringify({ error: "Erro interno do servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
