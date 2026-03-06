import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const password = "Test1234!";

  const accounts = [
    { email: "encarregado@kivara.com", role: "parent", name: "Encarregado Teste", avatar: "👩" },
    { email: "crianca@kivara.com", role: "child", name: "Criança Teste", avatar: "🦊" },
    { email: "adolescente@kivara.com", role: "teen", name: "Adolescente Teste", avatar: "🧑‍💻" },
    { email: "professor@kivara.com", role: "teacher", name: "Professor Teste", avatar: "👨‍🏫" },
    { email: "admin@kivara.com", role: "admin", name: "Admin KIVARA", avatar: "🛡️" },
  ];

  const results: Record<string, string> = {};

  // Create users
  for (const acc of accounts) {
    // Try to create; if already exists, find by email
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: acc.email,
      password,
      email_confirm: true,
      user_metadata: {
        display_name: acc.name,
        role: acc.role,
        avatar: acc.avatar,
      },
    });

    if (error) {
      if (error.message.includes("already been registered")) {
        // Find existing user
        const { data: listData } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
        const existing = listData?.users?.find((u) => u.email === acc.email);
        if (!existing) {
          return new Response(JSON.stringify({ error: `User ${acc.email} exists but could not be found` }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        results[acc.role] = existing.id;

        // Ensure role exists
        await supabaseAdmin.from("user_roles").upsert(
          { user_id: existing.id, role: acc.role },
          { onConflict: "user_id,role" }
        );

        // Ensure profile exists
        const { data: prof } = await supabaseAdmin
          .from("profiles")
          .select("id")
          .eq("user_id", existing.id)
          .single();
        if (!prof) {
          await supabaseAdmin.from("profiles").insert({
            user_id: existing.id,
            display_name: acc.name,
            avatar: acc.avatar,
          });
        }
        continue;
      }
      return new Response(JSON.stringify({ error: `Failed to create ${acc.role}: ${error.message}` }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    results[acc.role] = data.user.id;
  }

  // Create household
  const { data: household, error: hhError } = await supabaseAdmin
    .from("households")
    .insert({ name: "Família Teste" })
    .select("id")
    .single();

  if (hhError && !hhError.message.includes("duplicate")) {
    return new Response(JSON.stringify({ error: `Household error: ${hhError.message}` }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const householdId = household?.id;

  if (householdId) {
    // Link parent, child, teen to household
    for (const role of ["parent", "child", "teen"]) {
      const userId = results[role];
      await supabaseAdmin
        .from("profiles")
        .update({ household_id: householdId })
        .eq("user_id", userId);
    }

    // Get profile IDs
    const { data: parentProfile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("user_id", results.parent)
      .single();

    const { data: childProfile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("user_id", results.child)
      .single();

    const { data: teenProfile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("user_id", results.teen)
      .single();

    // Create children records linking child and teen to parent
    if (parentProfile && childProfile) {
      await supabaseAdmin
        .from("children")
        .upsert(
          { parent_profile_id: parentProfile.id, profile_id: childProfile.id, nickname: "Criança" },
          { onConflict: "profile_id" }
        );
    }

    if (parentProfile && teenProfile) {
      await supabaseAdmin
        .from("children")
        .upsert(
          { parent_profile_id: parentProfile.id, profile_id: teenProfile.id, nickname: "Adolescente" },
          { onConflict: "profile_id" }
        );
    }

    // Give child and teen some initial balance (100 KivaCoins each)
    for (const profileData of [childProfile, teenProfile]) {
      if (!profileData) continue;
      const { data: wallet } = await supabaseAdmin
        .from("wallets")
        .select("id")
        .eq("profile_id", profileData.id)
        .eq("wallet_type", "virtual")
        .single();

      const { data: parentWallet } = await supabaseAdmin
        .from("wallets")
        .select("id")
        .eq("profile_id", parentProfile!.id)
        .eq("wallet_type", "virtual")
        .single();

      if (wallet && parentWallet) {
        await supabaseAdmin.from("ledger_entries").insert({
          debit_wallet_id: parentWallet.id,
          credit_wallet_id: wallet.id,
          amount: 100,
          entry_type: "allowance",
          description: "Saldo inicial de teste",
          created_by: parentProfile!.id,
        });
      }
    }
  }

  return new Response(
    JSON.stringify({
      success: true,
      message: "Test accounts created successfully",
      accounts: accounts.map((a) => ({ email: a.email, role: a.role, password })),
      household_id: householdId,
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
