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

    // Get caller profile and roles
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

    if (!isParent && !isAdmin) {
      return new Response(
        JSON.stringify({ error: "Apenas encarregados ou administradores podem gerir carteiras" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const { action, wallet_id, reason } = body;

    if (!action || !["freeze", "unfreeze"].includes(action)) {
      return new Response(
        JSON.stringify({ error: "Acção inválida. Usa 'freeze' ou 'unfreeze'." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!wallet_id) {
      return new Response(
        JSON.stringify({ error: "wallet_id é obrigatório" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get the target wallet with profile info
    const { data: targetWallet } = await supabaseAdmin
      .from("wallets")
      .select("id, profile_id, is_system, is_frozen")
      .eq("id", wallet_id)
      .single();

    if (!targetWallet) {
      return new Response(
        JSON.stringify({ error: "Carteira não encontrada" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (targetWallet.is_system) {
      return new Response(
        JSON.stringify({ error: "Não é possível congelar a carteira-sistema" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If parent, verify wallet belongs to same household
    if (isParent && !isAdmin) {
      const { data: walletProfile } = await supabaseAdmin
        .from("profiles")
        .select("household_id")
        .eq("id", targetWallet.profile_id)
        .single();

      if (!walletProfile || walletProfile.household_id !== callerProfile.household_id) {
        return new Response(
          JSON.stringify({ error: "Não tens permissão sobre esta carteira" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    if (action === "freeze") {
      if (targetWallet.is_frozen) {
        return new Response(
          JSON.stringify({ success: true, message: "Carteira já está congelada" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { error: updateError } = await supabaseAdmin
        .from("wallets")
        .update({
          is_frozen: true,
          frozen_at: new Date().toISOString(),
          frozen_by: callerProfile.id,
          freeze_reason: reason || "Congelada pelo encarregado",
        })
        .eq("id", wallet_id);

      if (updateError) {
        return new Response(
          JSON.stringify({ error: "Erro ao congelar carteira", details: updateError.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Notify wallet owner
      await supabaseAdmin.from("notifications").insert({
        profile_id: targetWallet.profile_id,
        title: "🔒 Carteira congelada",
        message: reason
          ? `A tua carteira foi congelada. Motivo: ${reason}`
          : "A tua carteira foi congelada pelo teu encarregado.",
        type: "wallet_freeze",
        urgent: true,
        metadata: { wallet_id, action: "freeze", frozen_by: callerProfile.id },
      });

      return new Response(
        JSON.stringify({ success: true, action: "freeze", wallet_id }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "unfreeze") {
      if (!targetWallet.is_frozen) {
        return new Response(
          JSON.stringify({ success: true, message: "Carteira já está activa" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { error: updateError } = await supabaseAdmin
        .from("wallets")
        .update({
          is_frozen: false,
          frozen_at: null,
          frozen_by: null,
          freeze_reason: null,
        })
        .eq("id", wallet_id);

      if (updateError) {
        return new Response(
          JSON.stringify({ error: "Erro ao descongelar carteira", details: updateError.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Notify wallet owner
      await supabaseAdmin.from("notifications").insert({
        profile_id: targetWallet.profile_id,
        title: "🔓 Carteira desbloqueada",
        message: "A tua carteira foi desbloqueada. Podes voltar a usar as tuas KivaCoins!",
        type: "wallet_unfreeze",
        metadata: { wallet_id, action: "unfreeze", unfrozen_by: callerProfile.id },
      });

      return new Response(
        JSON.stringify({ success: true, action: "unfreeze", wallet_id }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Acção não reconhecida" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Wallet admin error:", err);
    return new Response(
      JSON.stringify({ error: "Erro interno do servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
