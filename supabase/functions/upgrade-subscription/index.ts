import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // User client to get current user
    const supabaseUser = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { authorization: authHeader } },
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Admin client for privileged operations
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { tier_id } = await req.json();
    if (!tier_id) {
      return new Response(JSON.stringify({ error: "tier_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate that the tier exists and is active
    const { data: tier, error: tierError } = await supabaseAdmin
      .from("subscription_tiers")
      .select("id, name, tier_type")
      .eq("id", tier_id)
      .eq("is_active", true)
      .single();

    if (tierError || !tier) {
      return new Response(JSON.stringify({ error: "Invalid or inactive tier" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get the user's profile to find tenant
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id, tenant_id, household_id")
      .eq("user_id", user.id)
      .single();

    if (!profile) {
      return new Response(JSON.stringify({ error: "Profile not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let tenantId = profile.tenant_id;

    // If no tenant exists, create one
    if (!tenantId) {
      const { data: newTenant, error: createError } = await supabaseAdmin
        .from("tenants")
        .insert({
          name: `Tenant de ${user.email}`,
          tenant_type: "family",
          subscription_tier_id: tier_id,
          currency: "EUR",
        })
        .select("id")
        .single();

      if (createError || !newTenant) {
        return new Response(JSON.stringify({ error: "Failed to create tenant" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      tenantId = newTenant.id;

      // Link profile to tenant
      await supabaseAdmin
        .from("profiles")
        .update({ tenant_id: tenantId })
        .eq("id", profile.id);

      // Link household if exists
      if (profile.household_id) {
        await supabaseAdmin
          .from("households")
          .update({ tenant_id: tenantId })
          .eq("id", profile.household_id);

        // Link all household members
        await supabaseAdmin
          .from("profiles")
          .update({ tenant_id: tenantId })
          .eq("household_id", profile.household_id);
      }
    } else {
      // Update existing tenant's subscription tier
      await supabaseAdmin
        .from("tenants")
        .update({ subscription_tier_id: tier_id })
        .eq("id", tenantId);
    }

    // Audit log
    await supabaseAdmin.from("audit_log").insert({
      action: "update",
      resource_type: "tenant_subscription",
      resource_id: tenantId,
      profile_id: profile.id,
      user_id: user.id,
      tenant_id: tenantId,
      metadata: { tier_id, tier_name: tier.name, simulated: true },
      old_values: { tenant_id: profile.tenant_id },
      new_values: { subscription_tier_id: tier_id },
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: `Upgraded to ${tier.name}`,
        tenant_id: tenantId,
        tier: { id: tier.id, name: tier.name, type: tier.tier_type },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
