import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { childProfileId, childName, childAge } = await req.json();
    if (!childProfileId) throw new Error("childProfileId is required");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Fetch child data from DB
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get recent transactions (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const [walletRes, tasksRes, missionsRes, vaultsRes, streakRes] = await Promise.all([
      // Wallet transactions
      supabase.from("wallet_balances").select("balance").eq("profile_id", childProfileId).eq("wallet_type", "virtual").maybeSingle(),
      // Completed tasks
      supabase.from("household_tasks").select("id, title, status, completed_at, reward").eq("assigned_to", childProfileId).gte("created_at", thirtyDaysAgo),
      // Missions
      supabase.from("missions").select("id, title, status, reward, type").eq("child_profile_id", childProfileId).gte("created_at", thirtyDaysAgo),
      // Savings vaults
      supabase.from("savings_vaults").select("name, current_amount, target_amount, interest_rate").eq("profile_id", childProfileId),
      // Streak
      supabase.from("streaks").select("current_streak, longest_streak, total_active_days").eq("profile_id", childProfileId).maybeSingle(),
    ]);

    const balance = walletRes.data?.balance ?? 0;
    const tasks = tasksRes.data ?? [];
    const missions = missionsRes.data ?? [];
    const vaults = vaultsRes.data ?? [];
    const streak = streakRes.data;

    const completedTasks = tasks.filter((t: any) => t.status === "completed").length;
    const pendingTasks = tasks.filter((t: any) => t.status === "pending").length;
    const completedMissions = missions.filter((m: any) => m.status === "completed").length;
    const totalSaved = vaults.reduce((s: number, v: any) => s + (v.current_amount || 0), 0);
    const totalTargets = vaults.reduce((s: number, v: any) => s + (v.target_amount || 0), 0);

    const contextSummary = `
Criança: ${childName || 'Criança'}, ${childAge || '8-12'} anos.
Saldo actual: ${balance} KVC.
Últimos 30 dias: ${completedTasks} tarefas concluídas, ${pendingTasks} pendentes.
Missões: ${completedMissions} concluídas de ${missions.length} total.
Poupança: ${totalSaved} KVC guardados em ${vaults.length} cofre(s) (meta total: ${totalTargets} KVC).
Streak: ${streak?.current_streak ?? 0} dias consecutivos (recorde: ${streak?.longest_streak ?? 0}).
Dias activos total: ${streak?.total_active_days ?? 0}.
    `.trim();

    const systemPrompt = `Tu és um consultor de educação financeira infantil para pais angolanos/lusófonos. Analisa os dados comportamentais da criança e gera insights curtos, accionáveis e encorajadores. Cada insight deve ter um emoji, um título curto e uma frase de conselho. Responde sempre em Português.`;

    const userPrompt = `Com base nos seguintes dados, gera 3 insights comportamentais personalizados para os pais:\n\n${contextSummary}`;

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
        tools: [
          {
            type: "function",
            function: {
              name: "generate_insights",
              description: "Return 3 behavioral insights about a child's financial habits",
              parameters: {
                type: "object",
                properties: {
                  insights: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        emoji: { type: "string", description: "Um emoji relevante" },
                        title: { type: "string", description: "Título curto do insight (máx 6 palavras)" },
                        description: { type: "string", description: "Conselho accionável para os pais (1-2 frases)" },
                        type: { type: "string", enum: ["positive", "attention", "suggestion"], description: "Tipo: elogio, alerta ou sugestão" },
                      },
                      required: ["emoji", "title", "description", "type"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["insights"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "generate_insights" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de pedidos excedido." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) throw new Error("No structured data returned");

    const result = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-insights error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
