import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Find all tenants with paid subscription tiers
    const { data: tenants, error: tErr } = await supabase
      .from("tenants")
      .select(
        "id, currency, subscription_tier_id, subscription_tiers(price_monthly, name, tier_type)"
      )
      .not("subscription_tier_id", "is", null);

    if (tErr) throw tErr;

    let created = 0;

    for (const tenant of tenants ?? []) {
      const tier = tenant.subscription_tiers as unknown as {
        price_monthly: number;
        name: string;
        tier_type: string;
      };

      // Skip free tiers
      if (!tier || Number(tier.price_monthly) <= 0 || tier.tier_type === "free")
        continue;

      // Check last invoice for this tenant
      const { data: lastInvoice } = await supabase
        .from("subscription_invoices")
        .select("created_at")
        .eq("tenant_id", tenant.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      const lastDate = lastInvoice?.created_at
        ? new Date(lastInvoice.created_at)
        : null;
      const now = new Date();
      const daysSinceLast = lastDate
        ? (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
        : 999;

      // Only create if >= 30 days since last invoice
      if (daysSinceLast < 30) continue;

      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7); // 7-day payment window

      // Get regional price if available
      const currency = tenant.currency ?? "USD";
      let amount = Number(tier.price_monthly);

      const { data: regional } = await supabase
        .from("tier_regional_prices")
        .select("price_monthly")
        .eq("tier_id", tenant.subscription_tier_id)
        .eq("currency_code", currency)
        .single();

      if (regional) {
        amount = Number(regional.price_monthly);
      } else if (currency !== "USD") {
        // Convert via exchange rates
        const { data: rate } = await supabase
          .from("currency_exchange_rates")
          .select("rate")
          .eq("base_currency", "USD")
          .eq("target_currency", currency)
          .single();
        if (rate) amount = amount * Number(rate.rate);
      }

      const { error: insertErr } = await supabase
        .from("subscription_invoices")
        .insert({
          tenant_id: tenant.id,
          tier_id: tenant.subscription_tier_id,
          amount,
          currency,
          billing_period: "monthly",
          status: "pending",
          due_date: dueDate.toISOString().split("T")[0],
        });

      if (!insertErr) {
        created++;

        // Notify the parent(s) of this tenant
        const { data: parents } = await supabase
          .from("profiles")
          .select("id")
          .eq("tenant_id", tenant.id);

        for (const parent of parents ?? []) {
          await supabase.from("notifications").insert({
            profile_id: parent.id,
            title: "Factura mensal gerada",
            message: `A tua factura mensal de ${currency} ${amount.toFixed(2)} para o plano ${tier.name} foi gerada.`,
            type: "billing",
            urgent: false,
          });
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, invoices_created: created }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
