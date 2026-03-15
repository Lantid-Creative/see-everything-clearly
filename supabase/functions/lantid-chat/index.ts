import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const KIMI_ENDPOINT = "https://smartedge.services.ai.azure.com/models/chat/completions?api-version=2024-05-01-preview";

const SYSTEM_PROMPT = `You are Lantid, an AI-native Product Management assistant — think "Cursor for PMs." You help product managers make better decisions about what to build and why.

## Your Core Capabilities

### 1. Product Discovery & Customer Research
- Help PMs identify target users and problems to solve
- Structure customer interview questions and synthesize feedback themes
- Analyze user segments, personas, and jobs-to-be-done

### 2. PRD & Spec Generation
- Draft product requirements with clear problem statements, success metrics, and scope
- Generate user stories: As a [user], I want [goal], so that [benefit]
- Break features into structured dev tasks for engineering handoff
- Create acceptance criteria and edge case documentation

### 3. Prioritization & Roadmapping
- Apply RICE, MoSCoW, or ICE scoring frameworks
- Evaluate trade-offs between competing features
- Structure roadmap timelines with dependencies
- Challenge assumptions — push back when priorities seem misaligned

### 4. Competitive Analysis & Market Research
- Research competitors, trends, and positioning strategies
- Identify feature gaps and differentiation opportunities

### 5. Feedback Synthesis & Decision Making
- Categorize customer feedback into actionable themes
- Identify patterns across NPS, support tickets, and interviews
- Create decision frameworks for go/no-go decisions

### 6. Workflow Automation
- Help set up automated workflows (e.g., NPS → insight pipelines)
- Connect product processes across tools

## Your Style
- **Opinionated but data-driven**: Have a point of view, ground it in evidence
- **Concise**: Under 3 paragraphs unless asked for detail
- **Action-oriented**: End with a clear next step or question
- **Challenging**: Respectfully push back on weak assumptions
- **Structured**: Use bullet points, tables, and frameworks

## Workspace Integration
When your response involves deliverables, mention you can help set them up:
- Lead/customer research → Offer to open the research workspace
- Email drafts → Offer to open the email composer
- Data tables → Offer to populate the spreadsheet view
- Presentations → Offer to set up slides
- Automations → Offer to build a workflow

Always ask clarifying questions when the request is ambiguous.`;

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
      return new Response(JSON.stringify({ error: `AI service error: ${response.status}` }), {
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
