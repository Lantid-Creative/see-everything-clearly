import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const AI_GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-2.5-flash";

const SYSTEM_PROMPT = `You are a market intelligence analyst for a GTM (Go-To-Market) platform. Given a user's product context (name, vision, target audience, industry, goals), generate actionable competitive intelligence and trend alerts.

You MUST respond using the tool provided. Do not output free text.

Generate:
1. **Competitors** (3-5): Likely competitors based on the product description. For each, provide name, positioning, a strength, a weakness, and a threat level (high/medium/low).
2. **Trends** (3-5): Relevant market/industry trends. For each, provide the trend name, a brief description, whether it's an opportunity or threat, and urgency (act_now/watch/monitor).
3. **Strategic Insights** (2-3): Actionable strategic recommendations based on the competitive landscape.
4. **Market Summary**: A 2-3 sentence executive overview of the competitive landscape.

Be specific and practical. Tailor everything to the user's actual product context.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { productContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const contextParts: string[] = ["## Product Context"];
    if (productContext.productName) contextParts.push(`- Product: ${productContext.productName}`);
    if (productContext.company) contextParts.push(`- Company: ${productContext.company}`);
    if (productContext.vision) contextParts.push(`- Vision: ${productContext.vision}`);
    if (productContext.targetAudience) contextParts.push(`- Target Audience: ${productContext.targetAudience}`);
    if (productContext.keyObjectives) contextParts.push(`- Key Objectives: ${productContext.keyObjectives}`);
    if (productContext.productGoals) contextParts.push(`- Product Goals: ${productContext.productGoals}`);
    if (productContext.currentPhase) contextParts.push(`- Current Phase: ${productContext.currentPhase}`);
    if (productContext.successMetrics) contextParts.push(`- Success Metrics: ${productContext.successMetrics}`);
    if (productContext.totalLeads) contextParts.push(`- Active Leads: ${productContext.totalLeads}`);
    contextParts.push(`\nToday is ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}.`);

    const response = await fetch(AI_GATEWAY_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: contextParts.join("\n") },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_market_intel",
              description: "Generate competitive intelligence and market trend analysis",
              parameters: {
                type: "object",
                properties: {
                  market_summary: {
                    type: "string",
                    description: "2-3 sentence executive overview of the competitive landscape",
                  },
                  competitors: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        positioning: { type: "string", description: "How they position in the market" },
                        strength: { type: "string" },
                        weakness: { type: "string" },
                        threat_level: { type: "string", enum: ["high", "medium", "low"] },
                      },
                      required: ["name", "positioning", "strength", "weakness", "threat_level"],
                      additionalProperties: false,
                    },
                  },
                  trends: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        description: { type: "string" },
                        impact: { type: "string", enum: ["opportunity", "threat"] },
                        urgency: { type: "string", enum: ["act_now", "watch", "monitor"] },
                      },
                      required: ["name", "description", "impact", "urgency"],
                      additionalProperties: false,
                    },
                  },
                  strategic_insights: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        description: { type: "string" },
                        action: { type: "string", description: "Specific next step" },
                      },
                      required: ["title", "description", "action"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["market_summary", "competitors", "trends", "strategic_insights"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "generate_market_intel" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Usage limit reached." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: `AI service error: ${response.status}` }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall || toolCall.function.name !== "generate_market_intel") {
      return new Response(JSON.stringify({ error: "Failed to generate market intelligence" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const intel = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify({ intel }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("market-intel error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
