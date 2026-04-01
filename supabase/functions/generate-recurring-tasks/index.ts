import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  // Auth guard: only service-role key can invoke this cron function
  const authHeader = req.headers.get("Authorization");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (authHeader !== `Bearer ${serviceKey}`) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const today = new Date();
    const dayOfWeek = today.getDay(); // 0=Sun
    const dayOfMonth = today.getDate();

    // Fetch all recurring task templates that are approved (completed cycle)
    const { data: templates, error: fetchErr } = await supabase
      .from("tasks")
      .select("*")
      .eq("is_recurring", true)
      .not("recurrence", "is", null);

    if (fetchErr) throw fetchErr;

    let created = 0;

    for (const tpl of templates ?? []) {
      // Check if we should generate for this recurrence
      const shouldGenerate =
        (tpl.recurrence === "daily") ||
        (tpl.recurrence === "weekly" && dayOfWeek === 1) || // Monday
        (tpl.recurrence === "monthly" && dayOfMonth === 1);

      if (!shouldGenerate) continue;

      // Check if a task from this source was already created today
      const todayStr = today.toISOString().split("T")[0];
      const { data: existing } = await supabase
        .from("tasks")
        .select("id")
        .eq("recurrence_source_id", tpl.id)
        .gte("created_at", todayStr + "T00:00:00Z")
        .lte("created_at", todayStr + "T23:59:59Z")
        .limit(1);

      if (existing && existing.length > 0) continue;

      // Create new task instance
      const { error: insertErr } = await supabase.from("tasks").insert({
        title: tpl.title,
        description: tpl.description,
        reward: tpl.reward,
        category: tpl.category,
        child_profile_id: tpl.child_profile_id,
        parent_profile_id: tpl.parent_profile_id,
        status: "pending",
        is_recurring: false, // instances are not templates
        recurrence_source_id: tpl.id,
      });

      if (!insertErr) created++;
    }

    return new Response(JSON.stringify({ success: true, created }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-recurring-tasks error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
