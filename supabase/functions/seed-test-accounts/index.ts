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

  // ─── 1. Create or find users ───────────────────────────────
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
      const { data: signInData } = await lookupClient.auth.signInWithPassword({
        email: acc.email,
        password,
      });

      if (signInData?.user) {
        results[acc.role] = signInData.user.id;

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

  // ─── 2. Supported currencies ───────────────────────────────
  const currencies = [
    { code: "EUR", symbol: "€", name: "Euro", decimal_places: 2 },
    { code: "USD", symbol: "$", name: "US Dollar", decimal_places: 2 },
    { code: "AOA", symbol: "Kz", name: "Kwanza Angolano", decimal_places: 0 },
    { code: "BRL", symbol: "R$", name: "Real Brasileiro", decimal_places: 2 },
    { code: "KES", symbol: "KSh", name: "Kenyan Shilling", decimal_places: 0 },
    { code: "NGN", symbol: "₦", name: "Nigerian Naira", decimal_places: 0 },
  ];

  for (const cur of currencies) {
    await supabaseAdmin
      .from("supported_currencies")
      .upsert(cur, { onConflict: "code" });
  }

  // ─── 3. Subscription tiers ─────────────────────────────────
  const tiers = [
    {
      name: "Gratuito",
      tier_type: "free",
      price_monthly: 0,
      price_yearly: 0,
      max_children: 2,
      max_classrooms: 0,
      features: JSON.stringify(["savings_vaults"]),
    },
    {
      name: "Família Premium",
      tier_type: "family_premium",
      price_monthly: 4.99,
      price_yearly: 49.99,
      max_children: 10,
      max_classrooms: 0,
      features: JSON.stringify([
        "savings_vaults",
        "dream_vaults",
        "custom_rewards",
        "budget_exceptions",
        "multi_child",
        "advanced_analytics",
        "export_reports",
        "real_money_wallet",
      ]),
    },
    {
      name: "Escola Institucional",
      tier_type: "school_institutional",
      price_monthly: 29.99,
      price_yearly: 299.99,
      max_children: 500,
      max_classrooms: 20,
      features: JSON.stringify([
        "savings_vaults",
        "dream_vaults",
        "custom_rewards",
        "classroom_mode",
        "advanced_analytics",
        "export_reports",
        "multi_child",
        "priority_support",
      ]),
    },
    {
      name: "Parceiro",
      tier_type: "partner_program",
      price_monthly: 0,
      price_yearly: 0,
      max_children: 1000,
      max_classrooms: 50,
      features: JSON.stringify([
        "savings_vaults",
        "dream_vaults",
        "custom_rewards",
        "budget_exceptions",
        "classroom_mode",
        "advanced_analytics",
        "export_reports",
        "multi_child",
        "real_money_wallet",
        "priority_support",
      ]),
    },
  ];

  // Upsert tiers by tier_type (unique name)
  const tierIds: Record<string, string> = {};
  for (const tier of tiers) {
    // Check if exists
    const { data: existing } = await supabaseAdmin
      .from("subscription_tiers")
      .select("id")
      .eq("tier_type", tier.tier_type)
      .maybeSingle();

    if (existing) {
      await supabaseAdmin
        .from("subscription_tiers")
        .update({ ...tier, features: JSON.parse(tier.features) })
        .eq("id", existing.id);
      tierIds[tier.tier_type] = existing.id;
    } else {
      const { data: inserted } = await supabaseAdmin
        .from("subscription_tiers")
        .insert({ ...tier, features: JSON.parse(tier.features) })
        .select("id")
        .single();
      if (inserted) tierIds[tier.tier_type] = inserted.id;
    }
  }

  // ─── 4. Create household ──────────────────────────────────
  const { data: household, error: hhError } = await supabaseAdmin
    .from("households")
    .insert({ name: "Família Teste" })
    .select("id")
    .single();

  // If household already exists, find it
  let householdId = household?.id;
  if (hhError) {
    // Try to find existing household via parent profile
    const { data: parentProfile } = await supabaseAdmin
      .from("profiles")
      .select("household_id")
      .eq("user_id", results.parent)
      .single();
    householdId = parentProfile?.household_id ?? undefined;
  }

  // ─── 5. Create tenant & link to household ──────────────────
  let tenantId: string | undefined;

  if (householdId) {
    // Check if tenant already exists for this household
    const { data: existingHousehold } = await supabaseAdmin
      .from("households")
      .select("tenant_id")
      .eq("id", householdId)
      .single();

    if (existingHousehold?.tenant_id) {
      tenantId = existingHousehold.tenant_id;
      // Update existing tenant to use Family Premium tier
      await supabaseAdmin
        .from("tenants")
        .update({
          subscription_tier_id: tierIds["family_premium"],
          currency: "EUR",
          real_money_enabled: true,
        })
        .eq("id", tenantId);
    } else {
      // Create new tenant
      const { data: tenant } = await supabaseAdmin
        .from("tenants")
        .insert({
          name: "Família Teste",
          tenant_type: "family",
          currency: "EUR",
          subscription_tier_id: tierIds["family_premium"],
          real_money_enabled: true,
        })
        .select("id")
        .single();

      tenantId = tenant?.id;

      if (tenantId) {
        // Link household to tenant
        await supabaseAdmin
          .from("households")
          .update({ tenant_id: tenantId })
          .eq("id", householdId);
      }
    }

    // Link all family profiles to tenant
    if (tenantId) {
      for (const role of ["parent", "child", "teen"]) {
        const userId = results[role];
        if (userId && !userId.startsWith("skipped")) {
          await supabaseAdmin
            .from("profiles")
            .update({ household_id: householdId, tenant_id: tenantId })
            .eq("user_id", userId);
        }
      }
    }
  }

  // ─── 6. Link profiles, create children, initial balances ───
  if (householdId) {
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

    for (const profileData of [childProfile, teenProfile]) {
      if (!profileData || !parentProfile) continue;
      const { data: wallet } = await supabaseAdmin
        .from("wallets")
        .select("id")
        .eq("profile_id", profileData.id)
        .eq("wallet_type", "virtual")
        .single();

      const { data: parentWallet } = await supabaseAdmin
        .from("wallets")
        .select("id")
        .eq("profile_id", parentProfile.id)
        .eq("wallet_type", "virtual")
        .single();

      if (wallet && parentWallet) {
        // Check if initial balance already exists
        const { data: existingEntry } = await supabaseAdmin
          .from("ledger_entries")
          .select("id")
          .eq("credit_wallet_id", wallet.id)
          .eq("entry_type", "allowance")
          .eq("description", "Saldo inicial de teste")
          .maybeSingle();

        if (!existingEntry) {
          await supabaseAdmin.from("ledger_entries").insert({
            debit_wallet_id: parentWallet.id,
            credit_wallet_id: wallet.id,
            amount: 100,
            entry_type: "allowance",
            description: "Saldo inicial de teste",
            created_by: parentProfile.id,
          });
        }
      }
    }
  }

  return new Response(
    JSON.stringify({
      success: true,
      message: "Test accounts seeded with subscription tiers and tenant",
      accounts: accounts.map((a) => ({ email: a.email, role: a.role, password })),
      household_id: householdId,
      tenant_id: tenantId,
      subscription_tiers: tierIds,
      currencies: currencies.map((c) => c.code),
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
