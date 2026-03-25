import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const AI_GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-3-flash-preview";

const SYSTEM_PROMPT = `You are an AI analyst for a Product Management platform called Lantid. Your job is to analyze the user's workspace data and generate a structured daily briefing.

You MUST respond using the tool provided. Do not output free text.

Analyze the data for:
1. **Priority actions**: What needs immediate attention? (max 3 items)
2. **Anomalies**: Unusual patterns — stale leads, idle workflows, engagement drops, missing data
3. **Wins**: Recent positive momentum — new leads, completed tasks, active conversations
4. **Daily summary**: A 1-2 sentence executive summary of where the product stands today
5. **Suggested next action**: The single most impactful thing the user should do right now, with a specific prompt they can use

Be specific. Reference actual numbers. Don't be generic.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Build a data snapshot for analysis
    const dataParts: string[] = ["## Workspace Snapshot"];

    if (context.userRole) dataParts.push(`- Role: ${context.userRole}`);
    if (context.company) dataParts.push(`- Company: ${context.company}`);
    if (context.productGoals) dataParts.push(`- Product Goals: ${context.productGoals}`);
    if (context.currentPhase) dataParts.push(`- Current Phase: ${context.currentPhase}`);

    dataParts.push(`\n## Stats`);
    dataParts.push(`- Leads: ${context.totalLeads ?? 0}`);
    dataParts.push(`- Conversations: ${context.totalConversations ?? 0}`);
    dataParts.push(`- Workflows: ${context.totalWorkflows ?? 0}`);
    dataParts.push(`- Emails Sent: ${context.emailsSent ?? 0}`);
    dataParts.push(`- Team Members: ${context.teamMembers ?? 0}`);

    if (context.productDetails) {
      const pd = context.productDetails;
      dataParts.push(`\n## Product Details`);
      if (pd.name) dataParts.push(`- Product: ${pd.name}`);
      if (pd.vision) dataParts.push(`- Vision: ${pd.vision}`);
      if (pd.key_objectives) dataParts.push(`- Objectives: ${pd.key_objectives}`);
      if (pd.target_audience) dataParts.push(`- Target Audience: ${pd.target_audience}`);
      if (pd.success_metrics) dataParts.push(`- Success Metrics: ${pd.success_metrics}`);
      if (pd.context_notes) dataParts.push(`- Context Notes: ${pd.context_notes}`);
    }

    if (context.topLeads && context.topLeads.length > 0) {
      dataParts.push(`\n## Recent Leads`);
      context.topLeads.forEach((l: any) => {
        dataParts.push(`- ${l.name} — ${l.title} at ${l.company}`);
      });
    }

    if (context.connectedIntegrations && context.connectedIntegrations.length > 0) {
      dataParts.push(`\n## Connected Integrations: ${context.connectedIntegrations.join(", ")}`);
    }

    // Recent activity timestamps for staleness detection
    if (context.recentActivity) {
      dataParts.push(`\n## Recent Activity Timestamps`);
      if (context.recentActivity.lastConversation) dataParts.push(`- Last conversation: ${context.recentActivity.lastConversation}`);
      if (context.recentActivity.lastLeadAdded) dataParts.push(`- Last lead added: ${context.recentActivity.lastLeadAdded}`);
      if (context.recentActivity.lastEmailSent) dataParts.push(`- Last email sent: ${context.recentActivity.lastEmailSent}`);
      if (context.recentActivity.lastWorkflowUpdate) dataParts.push(`- Last workflow update: ${context.recentActivity.lastWorkflowUpdate}`);
      if (context.recentActivity.staleLeadsCount !== undefined) dataParts.push(`- Leads not updated in 7+ days: ${context.recentActivity.staleLeadsCount}`);
      if (context.recentActivity.undeployedWorkflows !== undefined) dataParts.push(`- Undeployed workflows: ${context.recentActivity.undeployedWorkflows}`);
    }

    dataParts.push(`\nToday is ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}.`);

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
          { role: "user", content: dataParts.join("\n") },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_briefing",
              description: "Generate a structured daily briefing from workspace data",
              parameters: {
                type: "object",
                properties: {
                  summary: {
                    type: "string",
                    description: "1-2 sentence executive summary of product status today",
                  },
                  priority_actions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string", description: "Short action title" },
                        description: { type: "string", description: "Why this matters" },
                        urgency: { type: "string", enum: ["critical", "high", "medium"] },
                        action_type: { type: "string", enum: ["chat", "workspace", "workflow", "spreadsheet", "slides", "command-center"] },
                        action_prompt: { type: "string", description: "Prompt or navigation target" },
                      },
                      required: ["title", "description", "urgency", "action_type"],
                      additionalProperties: false,
                    },
                    description: "Top 1-3 things needing attention",
                  },
                  anomalies: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        signal: { type: "string", description: "What was detected" },
                        severity: { type: "string", enum: ["warning", "info"] },
                        recommendation: { type: "string", description: "What to do about it" },
                      },
                      required: ["signal", "severity", "recommendation"],
                      additionalProperties: false,
                    },
                    description: "Anomalies or patterns detected",
                  },
                  wins: {
                    type: "array",
                    items: {
                      type: "string",
                      description: "A positive momentum point",
                    },
                    description: "Recent wins or positive signals (1-3)",
                  },
                  suggested_action: {
                    type: "object",
                    properties: {
                      label: { type: "string", description: "Button label" },
                      prompt: { type: "string", description: "Chat prompt to execute" },
                      reasoning: { type: "string", description: "Why this is the best next step" },
                    },
                    required: ["label", "prompt", "reasoning"],
                    additionalProperties: false,
                  },
                  health_score: {
                    type: "number",
                    description: "Product health score 0-100 based on data completeness and activity",
                  },
                },
                required: ["summary", "priority_actions", "anomalies", "wins", "suggested_action", "health_score"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "generate_briefing" } },
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

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall || toolCall.function.name !== "generate_briefing") {
      return new Response(JSON.stringify({ error: "Failed to generate briefing" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const briefing = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify({ briefing }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("nerve-center error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
