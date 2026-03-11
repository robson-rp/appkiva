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

  const results: Record<string, unknown> = {};

  // Test: manual household + profile insert to check for DB errors
  try {
    const { data: hh, error: hhErr } = await supabase
      .from("households")
      .insert({ name: "Test HH" })
      .select("id")
      .single();
    results.household = { data: hh, error: hhErr?.message };

    if (hh) {
      // Clean up
      await supabase.from("households").delete().eq("id", hh.id);
    }
  } catch (e: any) {
    results.household_exception = e.message;
  }

  // Test: direct profile insert (will fail because user_id FK, but shows if RLS blocks it)
  try {
    const testUuid = "00000000-0000-0000-0000-000000000001";
    const { error: pErr } = await supabase
      .from("profiles")
      .insert({ user_id: testUuid, display_name: "Test" });
    results.profile_insert = pErr?.message || "success";
  } catch (e: any) {
    results.profile_exception = e.message;
  }

  // Test: create user with minimal metadata (no role)
  try {
    const { data, error } = await supabase.auth.admin.createUser({
      email: "test-norole@kivara.com",
      password: "TestPass123!",
      email_confirm: true,
      user_metadata: { display_name: "No Role Test" },
    });
    results.norole_user = error ? error.message : data?.user?.id;

    if (data?.user) {
      await new Promise(r => setTimeout(r, 3000));
      const { data: profile } = await supabase.from("profiles").select("*").eq("user_id", data.user.id).single();
      results.norole_profile = profile;
      // Cleanup
      await supabase.auth.admin.deleteUser(data.user.id);
    }
  } catch (e: any) {
    results.norole_exception = e.message;
  }

  return new Response(JSON.stringify(results, null, 2), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
