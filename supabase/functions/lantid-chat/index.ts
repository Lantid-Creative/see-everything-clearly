import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const AI_GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-3-flash-preview";

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

## Slide Deck Generation — CRITICAL RULES

When the user asks you to create, build, or draft a slide deck, presentation, or pitch deck:

1. **USE THE PRODUCT CONTEXT**: If product details are provided below (vision, objectives, target audience, etc.), USE THEM to make the deck specific and compelling. Do NOT ask for information that's already in the context.
2. **ALWAYS generate the actual slide content** — not just advice
3. Use this EXACT format for each slide:

**Slide 1:** Title Slide Name
- Bullet point 1
- Bullet point 2

**Slide 2:** Second Slide Title
- Bullet point 1
- Bullet point 2
- Bullet point 3

4. Generate 5-8 slides by default
5. Make bullet points concise, specific, and impactful — use real data from context
6. The first slide should be a title slide
7. ALWAYS end with: [[action:slides|Open in Slide Editor]]

## Workspace Integration
When your response involves deliverables or next steps that map to a tool, include an action link using this exact format on its own line:

→ [[action:slides|Create strategy deck]]
→ [[action:workflow|Build automation workflow]]
→ [[action:workspace|Open outreach workspace]]
→ [[action:spreadsheet|View in spreadsheet]]

Rules for action links:
- Place them at the END of your response, after your main content
- Use only these tool keys: slides, workflow, workspace, spreadsheet
- The label after | should be a short, specific call-to-action
- Include 1-2 action links max per response — only when genuinely relevant
- ALWAYS include [[action:slides|...]] when you generate slide content

Always ask clarifying questions when the request is ambiguous — UNLESS you already have enough context from the product details to proceed.`;

function buildContextPrompt(context: any): string {
  if (!context) return "";

  const parts: string[] = ["\n\n## Current User Context"];

  if (context.userRole) parts.push(`- **Role**: ${context.userRole}`);
  if (context.company) parts.push(`- **Company**: ${context.company}`);
  if (context.productGoals) parts.push(`- **Goals**: ${context.productGoals}`);

  // Product details from Command Center — the AI should use these heavily
  if (context.productDetails) {
    const pd = context.productDetails;
    parts.push(`\n### 🎯 Product Details (from Command Center — use this data!)`);
    if (pd.name) parts.push(`- **Product Name**: ${pd.name}`);
    if (pd.vision) parts.push(`- **Vision**: ${pd.vision}`);
    if (pd.key_objectives) parts.push(`- **Key Objectives**: ${pd.key_objectives}`);
    if (pd.target_audience) parts.push(`- **Target Audience**: ${pd.target_audience}`);
    if (pd.success_metrics) parts.push(`- **Success Metrics**: ${pd.success_metrics}`);
    if (pd.context_notes) parts.push(`- **Competitive Context / Notes**: ${pd.context_notes}`);
    parts.push(`\n⚡ When the user asks to create a deck or presentation, USE the above product details to generate specific, data-driven slides. Do not ask for info that is already here.`);
  }

  // Top leads for context
  if (context.topLeads && context.topLeads.length > 0) {
    parts.push(`\n### Recent Leads`);
    context.topLeads.forEach((l: any) => {
      parts.push(`- ${l.name} — ${l.title} at ${l.company}`);
    });
  }

  if (context.currentPhase) {
    const phaseGuides: Record<string, { focus: string; actions: string; transition: string }> = {
      discover: {
        focus: "They are in the DISCOVER phase — empathize & explore.",
        actions: "Suggest: user interviews, personas, problem statements, competitor mapping.",
        transition: "When they have 3-5 validated insights, suggest moving to DEFINE.",
      },
      define: {
        focus: "They are in the DEFINE phase — articulate & specify.",
        actions: "Suggest: PRDs, user stories, success metrics, spec decks.",
        transition: "When they have a PRD and stories, suggest PRIORITIZE.",
      },
      prioritize: {
        focus: "They are in the PRIORITIZE phase — score & sequence.",
        actions: "Suggest: RICE scoring, roadmaps, trade-off analyses.",
        transition: "When the roadmap is set, suggest BUILD.",
      },
      build: {
        focus: "They are in the BUILD phase — execute & automate.",
        actions: "Suggest: sprint planning, workflows, QA checklists.",
        transition: "When executing, suggest preparing for LAUNCH.",
      },
      launch: {
        focus: "They are in the LAUNCH phase — ship & announce.",
        actions: "Suggest: GTM plans, launch emails, launch decks, stakeholder updates.",
        transition: "Once launched, suggest MEASURE.",
      },
      measure: {
        focus: "They are in the MEASURE phase — learn & iterate.",
        actions: "Suggest: KPIs, A/B tests, feedback analysis, retrospectives.",
        transition: "When insights gathered, suggest new DISCOVER cycle.",
      },
    };
    const guide = phaseGuides[context.currentPhase];
    if (guide) {
      parts.push(`\n### Product Lifecycle Phase`);
      parts.push(guide.focus);
      parts.push(guide.actions);
      parts.push(guide.transition);
    }
  }

  parts.push(`\n### Workspace Stats`);
  parts.push(`- ${context.totalLeads ?? 0} leads in pipeline`);
  parts.push(`- ${context.totalConversations ?? 0} conversations`);
  parts.push(`- ${context.totalWorkflows ?? 0} workflows`);
  parts.push(`- ${context.emailsSent ?? 0} emails sent`);
  parts.push(`- ${context.teamMembers ?? 0} team members`);

  const integrations = context.connectedIntegrations || [];
  if (integrations.length > 0) {
    parts.push(`\n### Connected Integrations: ${integrations.join(", ")}`);
  }

  parts.push(`\nUse this context to personalize responses. Reference actual data when relevant.`);

  return parts.join("\n");
}

const TITLE_SYSTEM_PROMPT = `You generate short, descriptive titles for conversations. Given the user's first message, return a concise title (3-6 words) that captures the topic. Return ONLY the title, nothing else. No quotes, no punctuation at the end.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, context, generateTitle } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Title generation mode (non-streaming)
    if (generateTitle) {
      const titleResponse = await fetch(AI_GATEWAY_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { role: "system", content: TITLE_SYSTEM_PROMPT },
            ...messages.map((m: any) => ({ role: m.role, content: m.content })),
          ],
          max_tokens: 30,
        }),
      });

      if (!titleResponse.ok) {
        const errText = await titleResponse.text();
        console.error("Title generation error:", titleResponse.status, errText);
        return new Response(JSON.stringify({ title: messages[0]?.content?.slice(0, 40) || "Untitled" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const titleData = await titleResponse.json();
      const title = titleData.choices?.[0]?.message?.content?.trim() || messages[0]?.content?.slice(0, 40) || "Untitled";

      return new Response(JSON.stringify({ title }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Normal streaming chat
    const contextPrompt = buildContextPrompt(context);
    const fullSystemPrompt = SYSTEM_PROMPT + contextPrompt;

    const response = await fetch(AI_GATEWAY_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: fullSystemPrompt },
          ...messages.map((m: any) => ({ role: m.role, content: m.content })),
        ],
        max_tokens: 4096,
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
