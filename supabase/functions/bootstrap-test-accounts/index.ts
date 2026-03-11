import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const password = "Kivara2026!@";
  const results: Record<string, unknown> = {};

  // Test 1: simple user creation
  console.log("Creating test user...");
  const { data, error } = await supabase.auth.admin.createUser({
    email: "test-simple@kivara.com",
    password,
    email_confirm: true,
    user_metadata: { display_name: "Test Simple", role: "parent", avatar: "👩" },
  });

  if (error) {
    console.error("Create user error:", error);
    results.error = error.message;
    results.error_full = JSON.stringify(error);
  } else {
    results.user_id = data.user.id;
    console.log("User created:", data.user.id);

    // Wait and check profile
    await new Promise(r => setTimeout(r, 3000));
    const { data: profile, error: profileErr } = await supabase.from("profiles").select("*").eq("user_id", data.user.id).single();
    results.profile = profile;
    results.profile_error = profileErr?.message;

    // Cleanup
    await supabase.auth.admin.deleteUser(data.user.id);
    results.cleaned = true;
  }

  return new Response(JSON.stringify(results, null, 2), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
