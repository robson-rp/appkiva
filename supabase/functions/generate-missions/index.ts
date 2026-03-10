import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabase = createClient(supabaseUrl, serviceKey);

    // Parse schedule type from body or default to daily
    let scheduleType = "daily";
    try {
      const body = await req.json();
      if (body?.schedule === "weekly") scheduleType = "weekly";
    } catch { /* no body = daily */ }

    // 1. Get all child/teen profiles
    const { data: childRoles } = await supabase
      .from("user_roles")
      .select("user_id, role")
      .in("role", ["child", "teen"]);

    if (!childRoles?.length) {
      return new Response(JSON.stringify({ generated: 0, message: "No children found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userIds = childRoles.map((r: any) => r.user_id);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, user_id, display_name, date_of_birth, household_id")
      .in("user_id", userIds);

    if (!profiles?.length) {
      return new Response(JSON.stringify({ generated: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let totalGenerated = 0;

    for (const profile of profiles) {
      try {
        // 2. Gather behavioral data
        const profileId = profile.id;

        // Balance
        const { data: walletData } = await supabase
          .from("wallet_balances")
          .select("balance")
          .eq("profile_id", profileId)
          .eq("wallet_type", "virtual")
          .eq("currency", "KVC")
          .maybeSingle();
        const balance = Number(walletData?.balance ?? 0);

        // Recent transactions (last 30 days)
        const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();
        const { data: recentTx } = await supabase
          .from("ledger_entries")
          .select("entry_type, amount")
          .eq("created_by", profileId)
          .gte("created_at", thirtyDaysAgo)
          .limit(100);

        const spending = (recentTx ?? [])
          .filter((t: any) => ["purchase", "donation"].includes(t.entry_type))
          .reduce((s: number, t: any) => s + Number(t.amount), 0);
        const savings = (recentTx ?? [])
          .filter((t: any) => ["vault_deposit"].includes(t.entry_type))
          .reduce((s: number, t: any) => s + Number(t.amount), 0);

        // Completed missions count
        const { count: completedMissions } = await supabase
          .from("missions")
          .select("id", { count: "exact", head: true })
          .eq("child_profile_id", profileId)
          .eq("status", "completed");

        // Streak
        const { data: streakData } = await supabase
          .from("streaks")
          .select("current_streak, total_active_days")
          .eq("profile_id", profileId)
          .maybeSingle();

        // Lessons completed
        const { count: lessonsCompleted } = await supabase
          .from("lesson_progress")
          .select("id", { count: "exact", head: true })
          .eq("profile_id", profileId);

        // Dream vaults (with titles for goal-linked missions)
        const { data: vaults } = await supabase
          .from("dream_vaults")
          .select("title, icon, target_amount, current_amount")
          .eq("profile_id", profileId);

        // Recent mission titles (avoid repetition)
        const { data: recentMissions } = await supabase
          .from("missions")
          .select("title")
          .eq("child_profile_id", profileId)
          .order("created_at", { ascending: false })
          .limit(20);
        const recentTitles = (recentMissions ?? []).map((m: any) => m.title);

        // Get parent profile ID
        const { data: childRecord } = await supabase
          .from("children")
          .select("parent_profile_id")
          .eq("profile_id", profileId)
          .maybeSingle();

        if (!childRecord?.parent_profile_id) continue;

        // Calculate age
        let ageGroup = "8-12";
        if (profile.date_of_birth) {
          const age = Math.floor((Date.now() - new Date(profile.date_of_birth).getTime()) / (365.25 * 86400000));
          if (age <= 7) ageGroup = "5-7";
          else if (age <= 12) ageGroup = "8-12";
          else ageGroup = "13-17";
        }
        const role = childRoles.find((r: any) => r.user_id === profile.user_id);
        if (role?.role === "teen") ageGroup = "13-17";

        // 3. Determine difficulty based on completion history
        let difficulty = "beginner";
        const mc = completedMissions ?? 0;
        if (mc >= 50) difficulty = "master";
        else if (mc >= 30) difficulty = "strategist";
        else if (mc >= 15) difficulty = "saver";
        else if (mc >= 5) difficulty = "explorer";

        // 4. Build behavioral context
        const behaviorContext = [];
        if (spending > savings * 2) behaviorContext.push("Gasta muito mais do que poupa — priorizar missões de poupança");
        if ((streakData?.current_streak ?? 0) === 0) behaviorContext.push("Não tem streak activo — missão de re-engagement com bónus");
        if (savings > spending * 2) behaviorContext.push("Poupa consistentemente — missões avançadas de planeamento");
        if ((lessonsCompleted ?? 0) === 0) behaviorContext.push("Nunca completou uma lição — sugerir missão de aprendizagem");
        if ((vaults ?? []).some((v: any) => v.current_amount < v.target_amount * 0.25))
          behaviorContext.push("Tem metas de poupança com pouco progresso — missão de contribuição ao cofre");

        const missionCount = scheduleType === "daily" ? 3 : 2;
        const expireHours = scheduleType === "daily" ? 24 : 168;

        // 5. Call AI to generate missions
        const systemPrompt = `Tu és o motor de missões da KIVARA, uma plataforma de educação financeira para crianças e adolescentes lusófonos. Gera missões pedagógicas personalizadas baseadas no comportamento da criança. As missões devem ser educativas, adequadas à idade, e motivar hábitos financeiros saudáveis. Responde sempre em Português.`;

        const userPrompt = `Gera ${missionCount} missões ${scheduleType === "daily" ? "diárias" : "semanais"} para:
- Nome: ${profile.display_name}
- Faixa etária: ${ageGroup} anos
- Nível: ${difficulty}
- Saldo actual: ${balance} KVC
- Gastos (30d): ${spending} KVC | Poupanças (30d): ${savings} KVC
- Missões concluídas: ${mc}
- Streak actual: ${streakData?.current_streak ?? 0} dias
- Lições concluídas: ${lessonsCompleted ?? 0}
- Cofres: ${(vaults ?? []).length} activos

Contexto comportamental:
${behaviorContext.length ? behaviorContext.map(c => `- ${c}`).join("\n") : "- Comportamento normal"}

NÃO repetir estas missões recentes: ${recentTitles.slice(0, 10).join(", ") || "nenhuma"}

Cada missão deve ter recompensas proporcionais à dificuldade:
- beginner: 5-15 coins, 5-15 points
- explorer: 10-25 coins, 10-20 points
- saver: 20-40 coins, 15-30 points
- strategist: 30-60 coins, 25-40 points
- master: 50-100 coins, 35-50 points`;

        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            tools: [{
              type: "function",
              function: {
                name: "generate_missions",
                description: "Generate personalized financial missions for a child",
                parameters: {
                  type: "object",
                  properties: {
                    missions: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          title: { type: "string" },
                          description: { type: "string" },
                          type: { type: "string", enum: ["saving", "budgeting", "planning", "learning", "social", "goal", "daily", "weekly"] },
                          reward_coins: { type: "number" },
                          reward_points: { type: "number" },
                          target_amount: { type: "number", description: "Optional numeric target" },
                        },
                        required: ["title", "description", "type", "reward_coins", "reward_points"],
                        additionalProperties: false,
                      },
                    },
                  },
                  required: ["missions"],
                  additionalProperties: false,
                },
              },
            }],
            tool_choice: { type: "function", function: { name: "generate_missions" } },
          }),
        });

        if (!response.ok) {
          console.error(`AI error for ${profileId}:`, response.status);
          continue;
        }

        const aiData = await response.json();
        const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
        if (!toolCall?.function?.arguments) continue;

        const result = JSON.parse(toolCall.function.arguments);
        const expiresAt = new Date(Date.now() + expireHours * 3600000).toISOString();

        // 6. Insert missions
        const missionsToInsert = (result.missions ?? []).map((m: any) => ({
          title: m.title,
          description: m.description || "",
          type: m.type || "saving",
          reward: m.reward_coins || 10,
          kiva_points_reward: m.reward_points || 10,
          target_amount: m.target_amount || null,
          child_profile_id: profileId,
          parent_profile_id: childRecord.parent_profile_id,
          household_id: profile.household_id,
          difficulty,
          source: "engine",
          is_auto_generated: true,
          expires_at: expiresAt,
          status: "available",
        }));

        if (missionsToInsert.length) {
          const { error } = await supabase.from("missions").insert(missionsToInsert);
          if (error) {
            console.error(`Insert error for ${profileId}:`, error);
          } else {
            totalGenerated += missionsToInsert.length;

            // 7. Send notification
            await supabase.from("notifications").insert({
              profile_id: profileId,
              title: scheduleType === "daily" ? "Novas missões diárias! 🎯" : "Novas missões semanais! 🏆",
              message: `Tens ${missionsToInsert.length} ${scheduleType === "daily" ? "missões diárias" : "missões semanais"} novas à tua espera!`,
              type: "mission",
            });
          }
        }
      } catch (childError) {
        console.error(`Error processing child ${profile.id}:`, childError);
      }
    }

    return new Response(JSON.stringify({ generated: totalGenerated, schedule: scheduleType }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-missions error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
