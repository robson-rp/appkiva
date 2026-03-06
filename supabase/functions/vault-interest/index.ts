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
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get all vaults with positive balance and interest rate
    const { data: vaults, error: vaultsError } = await supabaseAdmin
      .from("savings_vaults")
      .select("id, profile_id, current_amount, interest_rate, name, household_id")
      .gt("current_amount", 0)
      .gt("interest_rate", 0);

    if (vaultsError) {
      console.error("Error fetching vaults:", vaultsError);
      return new Response(
        JSON.stringify({ error: "Erro ao buscar cofres" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!vaults || vaults.length === 0) {
      return new Response(
        JSON.stringify({ message: "Nenhum cofre elegível para juros", processed: 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let processed = 0;
    let totalInterest = 0;
    const errors: string[] = [];

    for (const vault of vaults) {
      // Monthly interest = current_amount * (interest_rate / 100), minimum 1 KVC
      const interest = Math.max(1, Math.round(vault.current_amount * (vault.interest_rate / 100)));

      if (interest <= 0) continue;

      // Get wallet for vault owner
      const { data: wallet } = await supabaseAdmin
        .from("wallets")
        .select("id")
        .eq("profile_id", vault.profile_id)
        .eq("wallet_type", "virtual")
        .eq("currency", "KVC")
        .single();

      if (!wallet) {
        errors.push(`Carteira não encontrada para profile ${vault.profile_id}`);
        continue;
      }

      // Create ledger entry for interest
      const { error: ledgerError } = await supabaseAdmin
        .from("ledger_entries")
        .insert({
          debit_wallet_id: wallet.id,
          credit_wallet_id: wallet.id,
          amount: interest,
          entry_type: "vault_interest",
          description: `Juros mensais: ${vault.name} (+${vault.interest_rate}%)`,
          reference_id: vault.id,
          reference_type: "savings_vault",
          metadata: {
            vault_name: vault.name,
            interest_rate: vault.interest_rate,
            principal: vault.current_amount,
          },
          requires_approval: false,
          approved_at: new Date().toISOString(),
          created_by: vault.profile_id,
        });

      if (ledgerError) {
        errors.push(`Erro ledger cofre ${vault.id}: ${ledgerError.message}`);
        continue;
      }

      // Update vault balance with interest
      const newAmount = Number(vault.current_amount) + interest;
      const { error: updateError } = await supabaseAdmin
        .from("savings_vaults")
        .update({ current_amount: newAmount })
        .eq("id", vault.id);

      if (updateError) {
        errors.push(`Erro update cofre ${vault.id}: ${updateError.message}`);
        continue;
      }

      // Create notification for the vault owner
      await supabaseAdmin.from("notifications").insert({
        profile_id: vault.profile_id,
        title: "Juros recebidos! 📈",
        message: `O teu cofre "${vault.name}" rendeu +${interest} KVC de juros este mês!`,
        type: "savings",
        metadata: { vault_id: vault.id, interest },
      });

      processed++;
      totalInterest += interest;
    }

    console.log(`Interest calculation complete: ${processed} vaults, ${totalInterest} KVC total`);

    return new Response(
      JSON.stringify({
        success: true,
        processed,
        total_interest: totalInterest,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Vault interest error:", err);
    return new Response(
      JSON.stringify({ error: "Erro interno do servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
