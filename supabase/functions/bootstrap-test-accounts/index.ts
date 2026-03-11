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

  const freeTierId = freeTier?.id;

  // 1. Create parent
  const { data: parentAuth, error: parentErr } = await supabase.auth.admin.createUser({
    email: "encarregado@kivara.com",
    password,
    email_confirm: true,
    user_metadata: { display_name: "Encarregado Teste", role: "parent", avatar: "👩", country: "AO" },
  });

  if (parentErr) {
    results.parent_error = parentErr.message;
    // Try to find existing
    const { data: profiles } = await supabase.from("profiles").select("id, user_id, household_id, tenant_id").limit(100);
    for (const p of profiles || []) {
      const { data: u } = await supabase.auth.admin.getUserById(p.user_id);
      if (u?.user?.email === "encarregado@kivara.com") {
        results.parent_existing = p;
        break;
      }
    }
  } else {
    results.parent_id = parentAuth.user.id;
  }

  // Wait for trigger to create profile
  await new Promise(r => setTimeout(r, 2000));

  // Get parent profile
  const parentUserId = (parentAuth?.user?.id || (results.parent_existing as any)?.user_id) as string;
  const { data: parentProfile } = await supabase.from("profiles").select("*").eq("user_id", parentUserId).single();
  results.parent_profile = parentProfile;

  if (!parentProfile) {
    return new Response(JSON.stringify({ error: "Parent profile not created", results }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Create tenant for parent
  let tenantId = parentProfile.tenant_id;
  if (!tenantId && freeTierId) {
    const { data: tenant } = await supabase.from("tenants").insert({
      name: "Família Teste",
      tenant_type: "family",
      currency: "AOA",
      subscription_tier_id: freeTierId,
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
    await supabase.from("household_guardians").upsert(
      { household_id: parentProfile.household_id, profile_id: parentProfile.id, role: "primary" },
      { onConflict: "household_id,profile_id" }
    ).select();
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
    results.child_id = childAuth.user.id;
  }

  await new Promise(r => setTimeout(r, 2000));

  const childUserId = childAuth?.user?.id;
  if (childUserId) {
    const { data: childProfile } = await supabase.from("profiles").select("*").eq("user_id", childUserId).single();
    results.child_profile = childProfile;

    if (childProfile) {
      // Link child to parent's household and tenant
      await supabase.from("profiles").update({
        household_id: parentProfile.household_id,
        tenant_id: tenantId,
      }).eq("id", childProfile.id);

      // Create children record
      await supabase.from("children").upsert(
        { parent_profile_id: parentProfile.id, profile_id: childProfile.id, nickname: "Criança Teste" },
        { onConflict: "profile_id" }
      );

      // Give initial balance via system wallet
      const { data: systemWallet } = await supabase.rpc("get_system_wallet_id");
      const { data: childWallet } = await supabase
        .from("wallets").select("id").eq("profile_id", childProfile.id).eq("wallet_type", "virtual").single();

      if (systemWallet && childWallet) {
        const { data: existing } = await supabase.from("ledger_entries")
          .select("id").eq("credit_wallet_id", childWallet.id).eq("description", "Saldo inicial de teste").maybeSingle();

        if (!existing) {
          await supabase.from("ledger_entries").insert({
            debit_wallet_id: systemWallet,
            credit_wallet_id: childWallet.id,
            amount: 100,
            entry_type: "allowance",
            description: "Saldo inicial de teste",
            created_by: parentProfile.id,
          });
          results.initial_balance = "100 KVC credited";
        }
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

  await new Promise(r => setTimeout(r, 1000));

  results.credentials = {
    parent: { email: "encarregado@kivara.com", password },
    child: { email: "crianca@kivara.com", password },
    admin: { email: "admin@kivara.com", password },
  };

  return new Response(JSON.stringify(results, null, 2), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
