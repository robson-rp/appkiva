import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, device_token } = await req.json();

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub as string;

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // ── check-trust: verify if a device token is still valid ──
    if (action === "check-trust") {
      if (!device_token) {
        return new Response(
          JSON.stringify({ trusted: false }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: device } = await supabaseAdmin
        .from("trusted_devices")
        .select("trusted_until")
        .eq("user_id", userId)
        .eq("device_token", device_token)
        .maybeSingle();

      const trusted = !!device && new Date(device.trusted_until) > new Date();

      // Clean up expired token
      if (device && !trusted) {
        await supabaseAdmin
          .from("trusted_devices")
          .delete()
          .eq("user_id", userId)
          .eq("device_token", device_token);
      }

      return new Response(
        JSON.stringify({ trusted }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── trust-device: store a new trusted device (30 days) ──
    if (action === "trust-device") {
      if (!device_token) {
        return new Response(
          JSON.stringify({ error: "device_token required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const trustedUntil = new Date();
      trustedUntil.setDate(trustedUntil.getDate() + 30);

      // Remove old tokens for this user (max 5 trusted devices)
      const { data: existing } = await supabaseAdmin
        .from("trusted_devices")
        .select("id, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: true });

      if (existing && existing.length >= 5) {
        const toDelete = existing.slice(0, existing.length - 4);
        for (const d of toDelete) {
          await supabaseAdmin.from("trusted_devices").delete().eq("id", d.id);
        }
      }

      const { error: insertError } = await supabaseAdmin
        .from("trusted_devices")
        .upsert(
          {
            user_id: userId,
            device_token,
            trusted_until: trustedUntil.toISOString(),
          },
          { onConflict: "device_token" }
        );

      if (insertError) {
        console.error("trust-device insert error:", insertError);
        return new Response(
          JSON.stringify({ error: "Failed to trust device" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("verify-2fa error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
