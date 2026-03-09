import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, email, user_id, event_type, metadata, ip_address, user_agent, risk_level } = await req.json();

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // ── check-lockout ──
    if (action === "check-lockout") {
      if (!email) {
        return new Response(JSON.stringify({ locked: false }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: lockout } = await supabaseAdmin
        .from("login_lockouts")
        .select("*")
        .eq("email", email.toLowerCase().trim())
        .single();

      if (!lockout) {
        return new Response(JSON.stringify({ locked: false }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (lockout.locked_until && new Date(lockout.locked_until) > new Date()) {
        const retryAfterSeconds = Math.ceil(
          (new Date(lockout.locked_until).getTime() - Date.now()) / 1000,
        );
        return new Response(
          JSON.stringify({
            locked: true,
            locked_until: lockout.locked_until,
            retry_after_seconds: retryAfterSeconds,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      return new Response(JSON.stringify({ locked: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── record-failure ──
    if (action === "record-failure") {
      const normalizedEmail = (email || "").toLowerCase().trim();
      if (!normalizedEmail) {
        return new Response(JSON.stringify({ ok: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Upsert lockout record
      const { data: existing } = await supabaseAdmin
        .from("login_lockouts")
        .select("*")
        .eq("email", normalizedEmail)
        .single();

      const fifteenMinAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();

      if (existing) {
        // Reset counter if last attempt was more than 15 minutes ago
        const resetCounter =
          existing.last_attempt_at && new Date(existing.last_attempt_at) < new Date(fifteenMinAgo);
        const newAttempts = resetCounter ? 1 : existing.failed_attempts + 1;

        let lockedUntil: string | null = null;
        let newLockoutCount = existing.lockout_count;

        if (newAttempts >= 5) {
          // Progressive lockout: 15m, 30m, 60m
          const durations = [15, 30, 60];
          const durationMin = durations[Math.min(existing.lockout_count, durations.length - 1)];
          lockedUntil = new Date(Date.now() + durationMin * 60 * 1000).toISOString();
          newLockoutCount = existing.lockout_count + 1;

          // Log lockout event
          await supabaseAdmin.from("auth_events").insert({
            event_type: "lockout",
            email: normalizedEmail,
            risk_level: "high",
            metadata: { lockout_count: newLockoutCount, duration_min: durationMin },
          });
        }

        await supabaseAdmin
          .from("login_lockouts")
          .update({
            failed_attempts: newAttempts,
            lockout_count: newLockoutCount,
            locked_until: lockedUntil,
            last_attempt_at: new Date().toISOString(),
          })
          .eq("email", normalizedEmail);
      } else {
        await supabaseAdmin.from("login_lockouts").insert({
          email: normalizedEmail,
          failed_attempts: 1,
          lockout_count: 0,
          last_attempt_at: new Date().toISOString(),
        });
      }

      // Log failure event
      await supabaseAdmin.from("auth_events").insert({
        event_type: "login_failure",
        email: normalizedEmail,
        ip_address,
        user_agent,
        risk_level: "medium",
        metadata: metadata || {},
      });

      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── record-success ──
    if (action === "record-success") {
      const normalizedEmail = (email || "").toLowerCase().trim();

      // Reset lockout on success
      if (normalizedEmail) {
        await supabaseAdmin
          .from("login_lockouts")
          .update({ failed_attempts: 0, locked_until: null, last_attempt_at: new Date().toISOString() })
          .eq("email", normalizedEmail);
      }

      // Log success event
      await supabaseAdmin.from("auth_events").insert({
        event_type: "login_success",
        email: normalizedEmail || null,
        user_id: user_id || null,
        ip_address,
        user_agent,
        risk_level: "low",
        metadata: metadata || {},
      });

      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── log-event ──
    if (action === "log-event") {
      await supabaseAdmin.from("auth_events").insert({
        event_type: event_type || "unknown",
        email: email || null,
        user_id: user_id || null,
        ip_address: ip_address || null,
        user_agent: user_agent || null,
        risk_level: risk_level || "low",
        metadata: metadata || {},
      });

      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── check-reset-rate ──
    if (action === "check-reset-rate") {
      const normalizedEmail = (email || "").toLowerCase().trim();
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

      // Check email rate: max 3 per hour
      if (normalizedEmail) {
        const { count } = await supabaseAdmin
          .from("auth_events")
          .select("id", { count: "exact", head: true })
          .eq("event_type", "password_reset_requested")
          .eq("email", normalizedEmail)
          .gte("created_at", oneHourAgo);

        if ((count ?? 0) >= 3) {
          return new Response(
            JSON.stringify({ allowed: false, reason: "email_rate_limit" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } },
          );
        }
      }

      return new Response(JSON.stringify({ allowed: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── admin: unlock-account ──
    if (action === "unlock-account") {
      // Verify caller is admin
      const authHeader = req.headers.get("Authorization");
      if (!authHeader?.startsWith("Bearer ")) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: corsHeaders,
        });
      }
      const supabaseUser = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!,
        { global: { headers: { Authorization: authHeader } } },
      );
      const token = authHeader.replace("Bearer ", "");
      const { data: claims, error: claimsErr } = await supabaseUser.auth.getClaims(token);
      if (claimsErr || !claims?.claims?.sub) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: corsHeaders,
        });
      }

      const { data: roles } = await supabaseAdmin
        .from("user_roles")
        .select("role")
        .eq("user_id", claims.claims.sub);

      if (!roles?.some((r: any) => r.role === "admin")) {
        return new Response(JSON.stringify({ error: "Forbidden" }), {
          status: 403,
          headers: corsHeaders,
        });
      }

      const normalizedEmail = (email || "").toLowerCase().trim();
      await supabaseAdmin
        .from("login_lockouts")
        .update({ failed_attempts: 0, locked_until: null, lockout_count: 0 })
        .eq("email", normalizedEmail);

      await supabaseAdmin.from("auth_events").insert({
        event_type: "account_unlocked",
        email: normalizedEmail,
        user_id: claims.claims.sub,
        risk_level: "low",
        metadata: { unlocked_by: claims.claims.sub },
      });

      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
