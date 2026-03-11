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

  // Get free tier id
  const { data: freeTier } = await supabase
    .from("subscription_tiers")
    .select("id")
    .eq("tier_type", "free")
    .single();

  // Delete orphaned auth users (no profile)
  const emails = ["encarregado@kivara.com", "crianca@kivara.com", "admin@kivara.com"];
  const { data: authUsers } = await supabase.auth.admin.listUsers({ perPage: 100 });
  
  for (const u of authUsers?.users || []) {
    if (emails.includes(u.email || "")) {
      await supabase.auth.admin.deleteUser(u.id);
      results[`deleted_${u.email}`] = u.id;
    }
  }

  // Wait for cleanup
  await new Promise(r => setTimeout(r, 1000));

  // 1. Create parent (trigger will auto-create profile, wallet, role, household)
  const { data: parentAuth, error: parentErr } = await supabase.auth.admin.createUser({
    email: "encarregado@kivara.com",
    password,
    email_confirm: true,
    user_metadata: { display_name: "Encarregado Teste", role: "parent", avatar: "👩", country: "AO" },
  });

  if (parentErr) {
    return new Response(JSON.stringify({ error: "Failed to create parent", detail: parentErr.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  results.parent_user_id = parentAuth.user.id;

  // Wait for trigger
  await new Promise(r => setTimeout(r, 3000));

  // Get parent profile
  const { data: parentProfile } = await supabase.from("profiles").select("*").eq("user_id", parentAuth.user.id).single();
  if (!parentProfile) {
    return new Response(JSON.stringify({ error: "Parent profile not auto-created by trigger" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  results.parent_profile_id = parentProfile.id;
  results.household_id = parentProfile.household_id;

  // Create tenant and link
  let tenantId = parentProfile.tenant_id;
  if (!tenantId && freeTier) {
    const { data: tenant } = await supabase.from("tenants").insert({
      name: "Família Teste",
      tenant_type: "family",
      currency: "AOA",
      subscription_tier_id: freeTier.id,
    }).select("id").single();
    tenantId = tenant?.id;

    if (tenantId) {
      await supabase.from("profiles").update({ tenant_id: tenantId }).eq("id", parentProfile.id);
      if (parentProfile.household_id) {
        await supabase.from("households").update({ tenant_id: tenantId }).eq("id", parentProfile.household_id);
      }
    }
  }
  results.tenant_id = tenantId;

  // Add parent as household guardian
  if (parentProfile.household_id) {
    await supabase.from("household_guardians").insert({
      household_id: parentProfile.household_id,
      profile_id: parentProfile.id,
      role: "primary",
    });
  }

  // 2. Create child
  const { data: childAuth, error: childErr } = await supabase.auth.admin.createUser({
    email: "crianca@kivara.com",
    password,
    email_confirm: true,
    user_metadata: { display_name: "Criança Teste", role: "child", avatar: "🦊", country: "AO" },
  });

  if (childErr) {
    results.child_error = childErr.message;
  } else {
    results.child_user_id = childAuth.user.id;
    await new Promise(r => setTimeout(r, 3000));

    const { data: childProfile } = await supabase.from("profiles").select("*").eq("user_id", childAuth.user.id).single();
    if (childProfile) {
      results.child_profile_id = childProfile.id;

      // Link to parent's household and tenant
      await supabase.from("profiles").update({
        household_id: parentProfile.household_id,
        tenant_id: tenantId,
      }).eq("id", childProfile.id);

      // Create children record
      await supabase.from("children").insert({
        parent_profile_id: parentProfile.id,
        profile_id: childProfile.id,
        nickname: "Criança Teste",
      });

      // Give initial balance
      const { data: systemWalletId } = await supabase.rpc("get_system_wallet_id");
      const { data: childWallet } = await supabase
        .from("wallets").select("id").eq("profile_id", childProfile.id).eq("wallet_type", "virtual").single();

      if (systemWalletId && childWallet) {
        await supabase.from("ledger_entries").insert({
          debit_wallet_id: systemWalletId,
          credit_wallet_id: childWallet.id,
          amount: 100,
          entry_type: "allowance",
          description: "Saldo inicial de teste",
          created_by: parentProfile.id,
        });
        results.initial_balance = "100 KVC";
      } else {
        results.balance_note = { systemWalletId, childWallet };
      }
    }
  }

  // 3. Create admin
  const { data: adminAuth, error: adminErr } = await supabase.auth.admin.createUser({
    email: "admin@kivara.com",
    password,
    email_confirm: true,
    user_metadata: { display_name: "Admin KIVARA", role: "admin", avatar: "🛡️" },
  });
  results.admin = adminErr ? adminErr.message : adminAuth?.user?.id;

  results.credentials = {
    parent: { email: "encarregado@kivara.com", password },
    child: { email: "crianca@kivara.com", password },
    admin: { email: "admin@kivara.com", password },
  };

  return new Response(JSON.stringify(results, null, 2), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
