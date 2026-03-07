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

  // Verify the caller is a parent of this child or admin
  const { data: callerRole } = await supabaseAdmin.from("user_roles").select("role").eq("user_id", user.id).single();
  const isAdmin = callerRole?.role === "admin";

  if (!isAdmin) {
    // Check parent relationship
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
      return new Response(JSON.stringify({ error: "Sem permissão para exportar dados deste perfil" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
  }

  // Gather all data for this profile
  const [profile, wallets, tasks, consents, streaks, vaults, dreamVaults, activities] = await Promise.all([
    supabaseAdmin.from("profiles").select("*").eq("id", profile_id).single(),
    supabaseAdmin.from("wallets").select("*, balance:wallet_balances(balance)").eq("profile_id", profile_id),
    supabaseAdmin.from("tasks").select("*").eq("child_profile_id", profile_id).order("created_at", { ascending: false }).limit(500),
    supabaseAdmin.from("consent_records").select("*").eq("child_profile_id", profile_id),
    supabaseAdmin.from("streaks").select("*").eq("profile_id", profile_id).single(),
    supabaseAdmin.from("savings_vaults").select("*").eq("profile_id", profile_id),
    supabaseAdmin.from("dream_vaults").select("*").eq("profile_id", profile_id),
    supabaseAdmin.from("streak_activities").select("*").eq("profile_id", profile_id).order("active_date", { ascending: false }).limit(365),
  ]);

  const exportData = {
    exported_at: new Date().toISOString(),
    format_version: "1.0",
    profile: profile.data,
    wallets: wallets.data,
    tasks: tasks.data,
    consent_records: consents.data,
    streaks: streaks.data,
    savings_vaults: vaults.data,
    dream_vaults: dreamVaults.data,
    streak_activities: activities.data,
  };

  return new Response(JSON.stringify(exportData), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
