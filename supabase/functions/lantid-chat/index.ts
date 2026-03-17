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

## Slide Deck Generation
When the user asks you to create, build, or draft a slide deck or presentation:
- ALWAYS generate the actual slide content, not just advice about what to include
- Use this exact format for each slide:

**Slide 1:** Title Slide Name
- Bullet point 1
- Bullet point 2

**Slide 2:** Second Slide Title
- Bullet point 1
- Bullet point 2
- Bullet point 3

- Generate 5-8 slides by default
- Make bullet points concise and impactful
- The first slide should be a title slide

## Workspace Integration
When your response involves deliverables or next steps that map to a tool, include an action link using this exact format on its own line:

→ [[action:slides|Create strategy deck]]
→ [[action:workflow|Build automation workflow]]
→ [[action:workspace|Open outreach workspace]]
→ [[action:spreadsheet|View in spreadsheet]]

Rules for action links:
- Place them at the END of your response, after your main content
- Use only these tool keys: slides, workflow, workspace, spreadsheet
- The label after | should be a short, specific call-to-action (e.g. "Build your GTM deck" not just "Open slides")
- Include 1-2 action links max per response — only when genuinely relevant
- Do NOT include action links for simple Q&A or when no tool usage is implied
- ALWAYS include [[action:slides|...]] when you generate slide content

Always ask clarifying questions when the request is ambiguous.`;

function buildContextPrompt(context: any): string {
  if (!context) return "";

  const parts: string[] = ["\n\n## Current User Context"];

  if (context.userRole) parts.push(`- **Role**: ${context.userRole}`);
  if (context.company) parts.push(`- **Company**: ${context.company}`);
  if (context.productGoals) parts.push(`- **Goals**: ${context.productGoals}`);

  if (context.currentPhase) {
    const phaseGuides: Record<string, { focus: string; actions: string; transition: string }> = {
      discover: {
        focus: "They are in the DISCOVER phase — empathize & explore. Help them identify problems worth solving through user interviews, persona building, and feedback synthesis.",
        actions: "Suggest: running user interviews, building personas, writing problem statements, mapping competitors, synthesizing research themes.",
        transition: "When they have 3-5 validated user insights, suggest moving to DEFINE to write specs.",
      },
      define: {
        focus: "They are in the DEFINE phase — articulate & specify. Help them transform research into concrete product specs.",
        actions: "Suggest: writing PRDs, generating user stories with acceptance criteria, defining success metrics, creating spec decks.",
        transition: "When they have a PRD and user stories, suggest moving to PRIORITIZE to rank the backlog.",
      },
      prioritize: {
        focus: "They are in the PRIORITIZE phase — score & sequence. Help them evaluate features objectively and build a roadmap.",
        actions: "Suggest: applying RICE scoring, building Now/Next/Later roadmaps, running trade-off analyses, competitive gap analysis.",
        transition: "When the roadmap is set and team is aligned, suggest moving to BUILD.",
      },
      build: {
        focus: "They are in the BUILD phase — execute & automate. Help them turn plans into working processes and workflows.",
        actions: "Suggest: planning sprints, creating automation workflows, writing QA checklists, technical handoff docs.",
        transition: "When workflows are running and the team is executing, suggest preparing for LAUNCH.",
      },
      launch: {
        focus: "They are in the LAUNCH phase — ship & announce. Help them get the product in front of users.",
        actions: "Suggest: drafting GTM plans, writing launch emails, building launch decks, creating stakeholder updates.",
        transition: "Once launched, suggest moving to MEASURE to track results.",
      },
      measure: {
        focus: "They are in the MEASURE phase — learn & iterate. Help them track what matters and decide what's next.",
        actions: "Suggest: defining KPIs, planning A/B tests, analyzing user feedback, running retrospectives.",
        transition: "When insights are gathered, suggest starting a new DISCOVER cycle with their learnings.",
      },
    };
    const guide = phaseGuides[context.currentPhase];
    if (guide) {
      parts.push(`\n### Product Lifecycle Phase`);
      parts.push(guide.focus);
      parts.push(guide.actions);
      parts.push(guide.transition);
      parts.push(`Always ground your responses in this phase context. End responses with a clear next step that advances them through this phase.`);
    }
  }

  parts.push(`\n### Workspace Stats`);
  parts.push(`- ${context.totalLeads ?? 0} leads in their pipeline`);
  parts.push(`- ${context.totalConversations ?? 0} conversations`);
  parts.push(`- ${context.totalWorkflows ?? 0} workflows created`);
  parts.push(`- ${context.emailsSent ?? 0} emails sent`);
  parts.push(`- ${context.teamMembers ?? 0} team members`);

  if ((context.totalLeads ?? 0) === 0) parts.push(`- ⚠️ No leads yet — may need help with discovery`);
  if ((context.totalWorkflows ?? 0) === 0) parts.push(`- ⚠️ No workflows yet — suggest automations`);
  if ((context.teamMembers ?? 0) === 0) parts.push(`- ⚠️ Solo user — may benefit from team collaboration tips`);

  const integrations = context.connectedIntegrations || [];
  if (integrations.length > 0) {
    parts.push(`\n### Connected Integrations`);
    parts.push(`The user has connected: ${integrations.join(", ")}`);
    parts.push(`You can reference these integrations in your responses and suggest using them in workflows.`);
  } else {
    parts.push(`\n- ⚠️ No integrations connected — suggest connecting tools like Slack, Notion, or Gmail in the Integrations page`);
  }

  parts.push(`\nUse this context to personalize your responses. Reference their actual data when relevant. When finishing a task, suggest the next phase in the product lifecycle.`);

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

    // Lovable AI gateway returns OpenAI-compatible SSE — pass through directly
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
