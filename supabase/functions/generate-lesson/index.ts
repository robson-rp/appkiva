import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const CATEGORIES: Record<string, string> = {
  saving: "Poupança",
  budgeting: "Orçamento e gestão de dinheiro",
  investing: "Investimento",
  earning: "Ganhar dinheiro",
  donating: "Doar e solidariedade",
};

const DIFFICULTIES: Record<string, string> = {
  beginner: "Iniciante (6-9 anos, linguagem simples, exemplos do dia-a-dia)",
  intermediate: "Intermédio (10-13 anos, conceitos mais avançados)",
  advanced: "Avançado (14-17 anos, tópicos complexos como inflação, câmbio, impostos)",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { category, difficulty, topic } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const catLabel = CATEGORIES[category] || category;
    const diffLabel = DIFFICULTIES[difficulty] || difficulty;

    const systemPrompt = `Tu és um especialista em educação financeira para crianças e adolescentes em Angola e países lusófonos. Geras micro-lições educativas em Português de Portugal/Angola.

Cada lição deve ter:
- Um título cativante e curto
- Uma descrição de 1 frase
- Um ícone emoji representativo
- 3 a 5 blocos de conteúdo (tipos: text, tip, example, highlight, image, video)
- 3 perguntas de quiz com 4 opções cada, uma correcta, e uma explicação
- Estimativa de minutos (2-5)
- Recompensa sugerida em KivaPoints (15-30)

Para blocos de tipo "video", usa URLs do YouTube relevantes sobre educação financeira em português.
Para blocos de tipo "image", usa uma URL descritiva placeholder como "https://placehold.co/600x300?text=Descricao+Da+Imagem".

O conteúdo deve ser culturalmente relevante para crianças angolanas/lusófonas, com exemplos práticos usando Kwanza (AOA) ou moeda local.`;

    const userPrompt = `Gera uma micro-lição sobre a categoria "${catLabel}" com nível de dificuldade "${diffLabel}".${topic ? ` Foco no tópico: "${topic}".` : ''} 

A lição deve ser educativa, divertida e interactiva.`;

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
              name: "create_lesson",
              description: "Creates a complete micro-lesson with content blocks and quiz",
              parameters: {
                type: "object",
                properties: {
                  title: { type: "string", description: "Título curto e cativante da lição" },
                  description: { type: "string", description: "Descrição de 1 frase" },
                  icon: { type: "string", description: "Emoji representativo" },
                  estimated_minutes: { type: "number", description: "Estimativa em minutos (2-5)" },
                  kiva_points_reward: { type: "number", description: "Recompensa em KivaPoints (15-30)" },
                  blocks: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        type: { type: "string", enum: ["text", "tip", "example", "highlight", "image", "video"] },
                        content: { type: "string", description: "Conteúdo textual do bloco ou URL para image/video" },
                        caption: { type: "string", description: "Legenda para blocos image/video" },
                      },
                      required: ["type", "content"],
                      additionalProperties: false,
                    },
                  },
                  quiz: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        question: { type: "string" },
                        options: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              id: { type: "string" },
                              text: { type: "string" },
                            },
                            required: ["id", "text"],
                            additionalProperties: false,
                          },
                        },
                        correctOptionId: { type: "string" },
                        explanation: { type: "string" },
                      },
                      required: ["id", "question", "options", "correctOptionId", "explanation"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["title", "description", "icon", "estimated_minutes", "kiva_points_reward", "blocks", "quiz"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "create_lesson" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de pedidos excedido. Tenta novamente em breve." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes. Adiciona créditos ao workspace." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall?.function?.arguments) {
      throw new Error("AI did not return structured lesson data");
    }

    const lesson = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify({ lesson, category, difficulty }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-lesson error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
