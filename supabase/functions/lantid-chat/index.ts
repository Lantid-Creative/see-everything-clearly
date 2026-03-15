import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const KIMI_ENDPOINT = "https://smartedge.services.ai.azure.com/models/chat/completions?api-version=2024-05-01-preview";

const SYSTEM_PROMPT = `You are Lantid, an AI-native product management assistant. You help with:
- Finding and researching leads and startup founders
- Writing personalized outreach emails
- Running competitive research
- Building presentations and deliverables
- Managing workflows across Google Drive, Notion, email, and more

Your personality: Professional, proactive, concise. You anticipate needs and suggest next steps. You use action-oriented language. When you complete research or tasks, you summarize findings clearly.

When a user asks you to research leads or find people, respond as if you're actually doing it — describe the research process, mention specific companies and founders you "found," and offer to set up an outreach workspace.

When asked about outreach, describe setting up a personalized email campaign with the research you've gathered.

Keep responses under 3 paragraphs. Be helpful but not verbose.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const KIMI_API_KEY = Deno.env.get("KIMI_API_KEY");
    if (!KIMI_API_KEY) throw new Error("KIMI_API_KEY is not configured");

    const response = await fetch(KIMI_ENDPOINT, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${KIMI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "Kimi-K2.5",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Usage limit reached. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("Kimi API error:", response.status, t);
      return new Response(JSON.stringify({ error: `Kimi API error: ${response.status}` }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
