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

  // Separate client for sign-in lookups (won't pollute admin client session)
  const lookupClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const password = "Test1234!";

  const accounts = [
    { email: "encarregado@kivara.com", role: "parent", name: "Encarregado Teste", avatar: "👩" },
    { email: "crianca@kivara.com", role: "child", name: "Criança Teste", avatar: "🦊" },
    { email: "adolescente@kivara.com", role: "teen", name: "Adolescente Teste", avatar: "🧑‍💻" },
    { email: "professor@kivara.com", role: "teacher", name: "Professor Teste", avatar: "👨‍🏫" },
    { email: "admin@kivara.com", role: "admin", name: "Admin KIVARA", avatar: "🛡️" },
  ];

  const results: Record<string, string> = {};

  // Create or find users
  for (const acc of accounts) {
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
      // User likely already exists — find them via sign in
      const { data: signInData } = await supabaseAdmin.auth.signInWithPassword({
        email: acc.email,
        password,
      });

      if (signInData?.user) {
        results[acc.role] = signInData.user.id;

        // Ensure role exists
        const { data: existingRoles } = await supabaseAdmin
          .from("user_roles")
          .select("id")
          .eq("user_id", signInData.user.id)
          .eq("role", acc.role);

        if (!existingRoles || existingRoles.length === 0) {
          await supabaseAdmin.from("user_roles").insert({ user_id: signInData.user.id, role: acc.role });
        }
      } else {
        results[acc.role] = `skipped: ${error.message}`;
      }
      continue;
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
