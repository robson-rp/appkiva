import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Verify caller
  const authHeader = req.headers.get("Authorization")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: { user }, error: authError } = await userClient.auth.getUser();
  if (authError || !user) {
    return new Response(JSON.stringify({ error: "Não autorizado" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  const { profile_id } = await req.json();
  if (!profile_id) {
    return new Response(JSON.stringify({ error: "profile_id obrigatório" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  // Only parents of this child or admins can request anonymization
  const { data: callerRole } = await supabaseAdmin.from("user_roles").select("role").eq("user_id", user.id).single();
  const isAdmin = callerRole?.role === "admin";

  if (!isAdmin) {
    const { data: callerProfile } = await supabaseAdmin.from("profiles").select("id").eq("user_id", user.id).single();
    if (!callerProfile) {
      return new Response(JSON.stringify({ error: "Perfil não encontrado" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const { data: childLink } = await supabaseAdmin
      .from("children")
      .select("id")
      .eq("parent_profile_id", callerProfile.id)
      .eq("profile_id", profile_id)
      .single();
    if (!childLink) {
      return new Response(JSON.stringify({ error: "Sem permissão" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
  }

  // Anonymize profile data (keep structure, remove PII)
  const anonName = `Utilizador Anónimo ${profile_id.slice(0, 4)}`;
  const { error: profileError } = await supabaseAdmin
    .from("profiles")
    .update({
      display_name: anonName,
      avatar: "👤",
      phone: null,
      date_of_birth: null,
      gender: null,
      country: null,
      institution_name: null,
      sector: null,
    })
    .eq("id", profile_id);

  if (profileError) {
    return new Response(JSON.stringify({ error: profileError.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  // Anonymize children nickname
  await supabaseAdmin
    .from("children")
    .update({ nickname: null, pin_hash: null })
    .eq("profile_id", profile_id);

  // Delete streak activities (non-essential)
  await supabaseAdmin.from("streak_activities").delete().eq("profile_id", profile_id);

  // Delete notifications
  await supabaseAdmin.from("notifications").delete().eq("profile_id", profile_id);

  // Revoke all active consents
  await supabaseAdmin
    .from("consent_records")
    .update({ revoked_at: new Date().toISOString(), revocation_reason: "Anonimização de dados (RGPD Art. 17)" })
    .eq("child_profile_id", profile_id)
    .is("revoked_at", null);

  // Log the action
  await supabaseAdmin.from("audit_log").insert({
    action: "admin_action",
    resource_type: "profiles",
    resource_id: profile_id,
    user_id: user.id,
    metadata: { action_type: "data_anonymization", requested_by: user.id },
  });

  return new Response(JSON.stringify({ success: true, message: "Dados anonimizados com sucesso" }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
