import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  // ── Admin auth guard ──────────────────────────────────────
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabaseAuth = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const { data: { user }, error: userError } = await supabaseAuth.auth.getUser();
  if (userError || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const userId = user.id;

  // Verify admin role
  const supabaseCheck = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
  const { data: roleData } = await supabaseCheck
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();

  if (!roleData) {
    return new Response(JSON.stringify({ error: "Forbidden: admin role required" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  // ── End auth guard ────────────────────────────────────────

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const lookupClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const password = "Kivara2026!@";

  const accounts = [
    { email: "encarregado@kivara.com", role: "parent", name: "Encarregado Teste", avatar: "👩" },
    { email: "crianca@kivara.com", role: "child", name: "Criança Teste", avatar: "🦊" },
    { email: "adolescente@kivara.com", role: "teen", name: "Adolescente Teste", avatar: "🧑‍💻" },
    { email: "professor@kivara.com", role: "teacher", name: "Professor Teste", avatar: "👨‍🏫" },
    { email: "parceiro@kivara.com", role: "partner", name: "Parceiro Teste", avatar: "🏢" },
    { email: "admin@kivara.com", role: "admin", name: "Admin KIVARA", avatar: "🛡️" },
  ];

  const results: Record<string, string> = {};

  // Build a map of display_name -> user_id from profiles to find existing users
  const findUserIdByName = async (name: string): Promise<string | null> => {
    const { data } = await supabaseAdmin
      .from("profiles")
      .select("user_id")
      .eq("display_name", name)
      .limit(1)
      .maybeSingle();
    return data?.user_id ?? null;
  };

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
      // User already exists – look up by display_name in profiles and force-update password
      const existingUserId = await findUserIdByName(acc.name);

      if (existingUserId) {
        // Force-update password to the new one
        await supabaseAdmin.auth.admin.updateUserById(existingUserId, {
          password,
          email_confirm: true,
          user_metadata: {
            display_name: acc.name,
            role: acc.role,
            avatar: acc.avatar,
          },
        });

        results[acc.role] = existingUserId;

        const { data: existingRoles } = await supabaseAdmin
          .from("user_roles")
          .select("id")
          .eq("user_id", existingUserId)
          .eq("role", acc.role);

        if (!existingRoles || existingRoles.length === 0) {
          await supabaseAdmin.from("user_roles").insert({ user_id: existingUserId, role: acc.role });
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


    // ─── 6b. Seed streak data ────────────────────────────────
    const { data: childProfile2 } = await supabaseAdmin
      .from("profiles").select("id").eq("user_id", results.child).single();
    const { data: teenProfile2 } = await supabaseAdmin
      .from("profiles").select("id").eq("user_id", results.teen).single();

    const today = new Date();
    const toISO = (d: Date) => d.toISOString().split("T")[0];
    const daysAgo = (n: number) => {
      const d = new Date(today);
      d.setDate(d.getDate() - n);
      return toISO(d);
    };

    const streakProfiles = [
      {
        profile: childProfile2,
        currentStreak: 12,
        longestStreak: 12,
        // 12-day streak + 5 older days + 3 scattered = 20 days
        activeDays: [
          ...Array.from({ length: 12 }, (_, i) => daysAgo(i)),
          ...Array.from({ length: 5 }, (_, i) => daysAgo(14 + i)),
          daysAgo(25), daysAgo(26), daysAgo(27),
        ],
        claimedMilestones: [3, 7], // claimed 3-day and 7-day
      },
      {
        profile: teenProfile2,
        currentStreak: 5,
        longestStreak: 8,
        // 5-day streak + older 8-day streak + scattered = 16 days
        activeDays: [
          ...Array.from({ length: 5 }, (_, i) => daysAgo(i)),
          ...Array.from({ length: 8 }, (_, i) => daysAgo(10 + i)),
          daysAgo(22), daysAgo(23), daysAgo(24),
        ],
        claimedMilestones: [3],
      },
    ];

    for (const sp of streakProfiles) {
      if (!sp.profile) continue;
      const pid = sp.profile.id;

      // Upsert streak summary
      const { data: existingStreak } = await supabaseAdmin
        .from("streaks").select("id").eq("profile_id", pid).maybeSingle();

      if (!existingStreak) {
        await supabaseAdmin.from("streaks").insert({
          profile_id: pid,
          current_streak: sp.currentStreak,
          longest_streak: sp.longestStreak,
          total_active_days: sp.activeDays.length,
          last_active_date: toISO(today),
        });
      } else {
        await supabaseAdmin.from("streaks").update({
          current_streak: sp.currentStreak,
          longest_streak: sp.longestStreak,
          total_active_days: sp.activeDays.length,
          last_active_date: toISO(today),
        }).eq("id", existingStreak.id);
      }

      // Insert activity dates (ignore conflicts)
      for (const date of sp.activeDays) {
        await supabaseAdmin.from("streak_activities")
          .upsert({ profile_id: pid, active_date: date }, { onConflict: "profile_id,active_date" });
      }

      // Insert claimed milestones
      for (const days of sp.claimedMilestones) {
        const pts = days === 3 ? 10 : days === 7 ? 25 : days === 14 ? 50 : days === 30 ? 100 : 0;
        await supabaseAdmin.from("streak_reward_claims")
          .upsert({ profile_id: pid, milestone_days: days, kiva_points: pts }, { onConflict: "profile_id,milestone_days" });
      }
    }
  }

  // ─── 7. Partner tenant & seed data ─────────────────────────
  let partnerTenantId: string | undefined;
  const partnerUserId = results.partner;

  if (partnerUserId && !partnerUserId.startsWith("skipped")) {
    // Check if partner already has a tenant
    const { data: partnerProfile } = await supabaseAdmin
      .from("profiles")
      .select("id, tenant_id")
      .eq("user_id", partnerUserId)
      .single();

    if (partnerProfile?.tenant_id) {
      partnerTenantId = partnerProfile.tenant_id;
    } else {
      // Create partner tenant
      const { data: pTenant } = await supabaseAdmin
        .from("tenants")
        .insert({
          name: "Banco Parceiro Teste",
          tenant_type: "institutional_partner",
          currency: "EUR",
          subscription_tier_id: tierIds["partner_program"],
          real_money_enabled: false,
        })
        .select("id")
        .single();

      partnerTenantId = pTenant?.id;

      if (partnerTenantId) {
        await supabaseAdmin
          .from("profiles")
          .update({ tenant_id: partnerTenantId })
          .eq("user_id", partnerUserId);
      }
    }

    // Seed partner programs
    if (partnerTenantId) {
      const { data: existingPrograms } = await supabaseAdmin
        .from("partner_programs")
        .select("id")
        .eq("partner_tenant_id", partnerTenantId)
        .limit(1);

      if (!existingPrograms || existingPrograms.length === 0) {
        await supabaseAdmin.from("partner_programs").insert([
          { partner_tenant_id: partnerTenantId, program_name: "Escola Primária Sol", program_type: "school", status: "active", children_count: 85, investment_amount: 3200, started_at: "2026-01-15T00:00:00Z" },
          { partner_tenant_id: partnerTenantId, program_name: "Família Ferreira", program_type: "family", status: "active", children_count: 3, investment_amount: 150, started_at: "2026-02-01T00:00:00Z" },
          { partner_tenant_id: partnerTenantId, program_name: "Colégio Esperança", program_type: "school", status: "active", children_count: 120, investment_amount: 4500, started_at: "2025-11-01T00:00:00Z" },
          { partner_tenant_id: partnerTenantId, program_name: "Família Santos", program_type: "family", status: "active", children_count: 2, investment_amount: 100, started_at: "2026-03-01T00:00:00Z" },
          { partner_tenant_id: partnerTenantId, program_name: "Escola Básica Norte", program_type: "school", status: "pending", children_count: 65, investment_amount: 2500, started_at: "2026-03-01T00:00:00Z" },
          { partner_tenant_id: partnerTenantId, program_name: "Família Costa", program_type: "family", status: "active", children_count: 4, investment_amount: 200, started_at: "2025-12-01T00:00:00Z" },
        ]);
      }

      // Seed sponsored challenges
      const { data: existingChallenges } = await supabaseAdmin
        .from("sponsored_challenges")
        .select("id")
        .eq("partner_tenant_id", partnerTenantId)
        .limit(1);

      if (!existingChallenges || existingChallenges.length === 0) {
        await supabaseAdmin.from("sponsored_challenges").insert([
          { partner_tenant_id: partnerTenantId, title: "Poupar para o Futuro", description: "Desafio de poupança mensal para crianças dos 8-12 anos", status: "active", participants_count: 145, completion_rate: 78, start_date: "2026-02-01", end_date: "2026-02-28" },
          { partner_tenant_id: partnerTenantId, title: "Mercado Escolar", description: "Simulação de compras inteligentes no ambiente escolar", status: "active", participants_count: 89, completion_rate: 62, start_date: "2026-02-15", end_date: "2026-03-15" },
          { partner_tenant_id: partnerTenantId, title: "Desafio Familiar", description: "Poupança em família com metas semanais partilhadas", status: "draft", participants_count: 0, completion_rate: 0, start_date: "2026-04-01", end_date: "2026-04-30" },
          { partner_tenant_id: partnerTenantId, title: "Educação Financeira Básica", description: "Completar 10 lições de literacia financeira", status: "completed", participants_count: 210, completion_rate: 91, start_date: "2026-01-01", end_date: "2026-01-31" },
        ]);
      }
    }
  }

  return new Response(
    JSON.stringify({
      success: true,
      message: "Test accounts seeded with subscription tiers, tenant and partner data",
      accounts: accounts.map((a) => ({ email: a.email, role: a.role, password })),
      household_id: householdId,
      tenant_id: tenantId,
      partner_tenant_id: partnerTenantId,
      subscription_tiers: tierIds,
      currencies: currencies.map((c) => c.code),
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
