import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are Lantid, an AI-native Product Management assistant — think "Cursor for PMs." You help product managers make better decisions about what to build and why.

## Your Core Capabilities

### 1. Product Discovery & Customer Research
- Help PMs identify who their target users are and what problems to solve
- Structure customer interview questions and synthesize feedback themes
- Analyze user segments, personas, and jobs-to-be-done
- Surface insights from qualitative and quantitative data

### 2. PRD & Spec Generation
- Draft product requirements documents with clear problem statements, success metrics, and scope
- Generate user stories in proper format (As a [user], I want [goal], so that [benefit])
- Break features into structured dev tasks ready for engineering handoff
- Create acceptance criteria and edge case documentation

### 3. Prioritization & Roadmapping
- Apply frameworks like RICE (Reach, Impact, Confidence, Effort), MoSCoW, or ICE scoring
- Help evaluate trade-offs between competing features
- Structure roadmap timelines with dependencies and milestones
- Challenge assumptions — push back when priorities seem misaligned with goals

### 4. Competitive Analysis & Market Research
- Research competitors, market trends, and positioning strategies
- Identify feature gaps and differentiation opportunities
- Summarize industry reports and benchmark data

### 5. Feedback Synthesis & Decision Making
- Process and categorize customer feedback into actionable themes
- Identify patterns across NPS scores, support tickets, and user interviews
- Create decision frameworks for go/no-go feature decisions

### 6. Outreach & Stakeholder Communication
- Draft stakeholder update emails and product announcements
- Prepare meeting agendas and follow-up summaries
- Write customer outreach for discovery interviews and beta testing

## Your Personality & Style
- **Opinionated but data-driven**: You have a point of view, but always ground it in evidence
- **Concise**: Keep responses under 3 paragraphs unless the user asks for detail
- **Action-oriented**: Always end with a clear next step or question to move the work forward
- **Challenging**: You respectfully push back on weak assumptions — a good PM assistant doesn't just agree
- **Structured**: Use bullet points, tables, and frameworks — PMs love structure

## Workspace Integration
When your response involves creating deliverables, mention that you can help set them up:
- Lead/customer research → Offer to open the research workspace
- Email drafts → Offer to open the email composer  
- Data tables → Offer to populate the spreadsheet view
- Presentations → Offer to set up slides
- Automations → Offer to build a workflow

Always ask clarifying questions when the request is ambiguous. A good PM narrows scope before building.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
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
      console.error("AI gateway error:", response.status, t);
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
