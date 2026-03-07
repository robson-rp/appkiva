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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Auth check
    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user },
    } = await userClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Não autenticado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { challenge_id, child_profile_id } = await req.json();
    if (!challenge_id || !child_profile_id) {
      return new Response(
        JSON.stringify({ error: "challenge_id e child_profile_id obrigatórios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const admin = createClient(supabaseUrl, serviceKey);

    // Get challenge with reward_amount and partner info
    const { data: challenge, error: chErr } = await admin
      .from("sponsored_challenges")
      .select("id, reward_amount, partner_tenant_id, program_id, status")
      .eq("id", challenge_id)
      .single();

    if (chErr || !challenge) {
      return new Response(JSON.stringify({ error: "Desafio não encontrado" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (challenge.status !== "active") {
      return new Response(JSON.stringify({ error: "Desafio não está activo" }), {
        status: 422,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!challenge.reward_amount || challenge.reward_amount <= 0) {
      return new Response(JSON.stringify({ error: "Desafio sem prémio configurado" }), {
        status: 422,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check program budget if linked
    if (challenge.program_id) {
      const { data: program } = await admin
        .from("partner_programs")
        .select("investment_amount, budget_spent")
        .eq("id", challenge.program_id)
        .single();

      if (program) {
        const remaining = Number(program.investment_amount) - Number(program.budget_spent);
        if (remaining < challenge.reward_amount) {
          return new Response(
            JSON.stringify({ error: "Orçamento do programa insuficiente" }),
            { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
    }

    // Get partner wallet (find a profile with this tenant_id)
    const { data: partnerProfile } = await admin
      .from("profiles")
      .select("id")
      .eq("tenant_id", challenge.partner_tenant_id)
      .limit(1)
      .single();

    if (!partnerProfile) {
      return new Response(JSON.stringify({ error: "Perfil do parceiro não encontrado" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: partnerWallet } = await admin
      .from("wallets")
      .select("id")
      .eq("profile_id", partnerProfile.id)
      .eq("wallet_type", "virtual")
      .eq("currency", "KVC")
      .single();

    const { data: childWallet } = await admin
      .from("wallets")
      .select("id")
      .eq("profile_id", child_profile_id)
      .eq("wallet_type", "virtual")
      .eq("currency", "KVC")
      .single();

    if (!partnerWallet || !childWallet) {
      return new Response(JSON.stringify({ error: "Wallet não encontrada" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create ledger entry: partner -> child
    const { data: entry, error: ledgerErr } = await admin
      .from("ledger_entries")
      .insert({
        entry_type: "mission_reward",
        amount: challenge.reward_amount,
        description: `Prémio do desafio patrocinado: ${challenge_id}`,
        debit_wallet_id: partnerWallet.id,
        credit_wallet_id: childWallet.id,
        created_by: partnerProfile.id,
        reference_id: challenge_id,
        reference_type: "sponsored_challenge",
        metadata: { child_profile_id, challenge_id },
      })
      .select()
      .single();

    if (ledgerErr) {
      return new Response(JSON.stringify({ error: ledgerErr.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update budget_spent on the program
    if (challenge.program_id) {
      await admin.rpc("update_program_budget_spent", {
        _program_id: challenge.program_id,
        _amount: challenge.reward_amount,
      }).catch(() => {
        // Fallback: direct update
        admin
          .from("partner_programs")
          .update({
            budget_spent: Number(challenge.reward_amount),
          })
          .eq("id", challenge.program_id);
      });

      // Simple increment via direct SQL isn't available, so do read-update
      const { data: prog } = await admin
        .from("partner_programs")
        .select("budget_spent")
        .eq("id", challenge.program_id)
        .single();

      if (prog) {
        await admin
          .from("partner_programs")
          .update({ budget_spent: Number(prog.budget_spent) + Number(challenge.reward_amount) })
          .eq("id", challenge.program_id);
      }
    }

    // Update participants count
    await admin
      .from("sponsored_challenges")
      .update({ participants_count: (challenge as any).participants_count ? (challenge as any).participants_count + 1 : 1 })
      .eq("id", challenge_id);

    return new Response(
      JSON.stringify({ success: true, entry, reward_amount: challenge.reward_amount }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
