import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const AI_GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-3-flash-preview";

const SYSTEM_PROMPT = `You are the Autonomous Agent for Lantid, a Product Management platform. You analyze workspace data and TAKE PROACTIVE ACTIONS to help the user without being asked.

You MUST respond using the tool provided. Analyze the data and decide which actions to take:

1. **Draft emails** for stale leads (not contacted in 7+ days) — generate personalized outreach
2. **Update lead statuses** — mark stale leads as "needs-attention", active ones as "engaged"
3. **Chain workflows** — if undeployed workflows exist, suggest deployment or improvements
4. **Research suggestions** — identify gaps in lead profiles and suggest research actions
5. **Notifications** — surface important patterns the user should know about

Rules:
- Only take actions that genuinely help. Don't create busywork.
- Draft emails should be personalized using lead name, company, and title.
- Be specific — reference actual data, names, numbers.
- Maximum 5 actions per run. Quality over quantity.
- Each action should have a clear, concise title and description.`;

interface LeadData {
  id: string;
  name: string;
  company: string;
  title: string;
  email: string;
  status: string | null;
  updated_at: string;
  about: string | null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error("Supabase configuration missing");

    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Missing or invalid Authorization header" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const supabaseClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims?.sub) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claimsData.claims.sub as string;

    // Gather workspace snapshot
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const [leadsRes, staleLeadsRes, workflowsRes, emailDraftsRes, profileRes] = await Promise.all([
      supabaseAdmin.from("leads").select("id, name, company, title, email, status, updated_at, about").eq("user_id", user.id).order("updated_at", { ascending: false }).limit(20),
      supabaseAdmin.from("leads").select("id, name, company, title, email, status, updated_at, about").eq("user_id", user.id).lt("updated_at", sevenDaysAgo).limit(10),
      supabaseAdmin.from("workflows").select("id, name, is_deployed, nodes, updated_at").eq("user_id", user.id).limit(10),
      supabaseAdmin.from("email_drafts").select("id, subject, lead_id, sent, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10),
      supabaseAdmin.from("profiles").select("display_name, company, role, product_goals").eq("id", user.id).single(),
    ]);

    const leads = leadsRes.data || [];
    const staleLeads = staleLeadsRes.data || [];
    const workflows = workflowsRes.data || [];
    const emailDrafts = emailDraftsRes.data || [];
    const profile = profileRes.data;

    // Build context for AI
    const dataParts: string[] = ["## Workspace Data for Autonomous Analysis"];

    if (profile) {
      dataParts.push(`\n### User Profile`);
      if (profile.display_name) dataParts.push(`- Name: ${profile.display_name}`);
      if (profile.company) dataParts.push(`- Company: ${profile.company}`);
      if (profile.role) dataParts.push(`- Role: ${profile.role}`);
      if (profile.product_goals) dataParts.push(`- Goals: ${profile.product_goals}`);
    }

    dataParts.push(`\n### Lead Pipeline (${leads.length} total)`);
    leads.forEach((l: LeadData) => {
      const daysSinceUpdate = Math.floor((Date.now() - new Date(l.updated_at).getTime()) / (1000 * 60 * 60 * 24));
      dataParts.push(`- ${l.name} | ${l.title} at ${l.company} | ${l.email} | Status: ${l.status || "new"} | Last updated: ${daysSinceUpdate}d ago${l.about ? ` | About: ${l.about.slice(0, 100)}` : ""}`);
    });

    if (staleLeads.length > 0) {
      dataParts.push(`\n### ⚠️ Stale Leads (7+ days no contact): ${staleLeads.length}`);
      staleLeads.forEach((l: LeadData) => {
        dataParts.push(`- ${l.name} (${l.company}) — ${l.email} — Status: ${l.status || "new"}`);
      });
    }

    dataParts.push(`\n### Workflows (${workflows.length})`);
    workflows.forEach((w: any) => {
      dataParts.push(`- "${w.name}" | Deployed: ${w.is_deployed ? "Yes" : "No"} | Nodes: ${Array.isArray(w.nodes) ? w.nodes.length : 0}`);
    });

    dataParts.push(`\n### Recent Email Drafts (${emailDrafts.length})`);
    emailDrafts.slice(0, 5).forEach((e: any) => {
      dataParts.push(`- "${e.subject}" | Sent: ${e.sent ? "Yes" : "No"}`);
    });

    dataParts.push(`\nToday: ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`);

    // Call AI to decide actions
    const aiResponse = await fetch(AI_GATEWAY_URL, {
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
        tools: [{
          type: "function",
          function: {
            name: "execute_agent_actions",
            description: "Execute autonomous actions based on workspace analysis",
            parameters: {
              type: "object",
              properties: {
                actions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      action_type: {
                        type: "string",
                        enum: ["draft_email", "update_lead_status", "chain_workflow", "research", "notify"],
                      },
                      title: { type: "string", description: "Short action title" },
                      description: { type: "string", description: "What was done and why" },
                      lead_id: { type: "string", description: "Lead UUID if applicable" },
                      lead_name: { type: "string", description: "Lead name for display" },
                      email_subject: { type: "string", description: "For draft_email: email subject" },
                      email_body: { type: "string", description: "For draft_email: personalized email body" },
                      new_status: { type: "string", description: "For update_lead_status: new status value" },
                      workflow_id: { type: "string", description: "Workflow UUID if applicable" },
                    },
                    required: ["action_type", "title", "description"],
                    additionalProperties: false,
                  },
                  description: "List of autonomous actions to execute (max 5)",
                },
                summary: { type: "string", description: "One sentence summary of what the agent did this run" },
              },
              required: ["actions", "summary"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "execute_agent_actions" } },
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await aiResponse.text();
      console.error("AI error:", aiResponse.status, errText);
      throw new Error(`AI service error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No actions generated");

    const { actions, summary } = JSON.parse(toolCall.function.arguments);

    // Execute each action
    const executedActions: any[] = [];

    for (const action of actions) {
      try {
        const metadata: Record<string, any> = {};

        if (action.action_type === "draft_email" && action.email_subject && action.email_body) {
          // Create email draft in database
          const { data: draft } = await supabaseAdmin.from("email_drafts").insert({
            user_id: user.id,
            subject: action.email_subject,
            body: action.email_body,
            lead_id: action.lead_id || null,
            is_template: false,
            sent: false,
          }).select("id").single();
          metadata.email_draft_id = draft?.id;
          metadata.email_subject = action.email_subject;
          metadata.lead_name = action.lead_name;
        }

        if (action.action_type === "update_lead_status" && action.lead_id && action.new_status) {
          await supabaseAdmin.from("leads")
            .update({ status: action.new_status, updated_at: new Date().toISOString() })
            .eq("id", action.lead_id)
            .eq("user_id", user.id);
          metadata.lead_id = action.lead_id;
          metadata.new_status = action.new_status;
          metadata.lead_name = action.lead_name;
        }

        if (action.action_type === "chain_workflow" && action.workflow_id) {
          metadata.workflow_id = action.workflow_id;
        }

        // Log the action
        await supabaseAdmin.from("agent_actions").insert({
          user_id: user.id,
          action_type: action.action_type,
          title: action.title,
          description: action.description,
          status: action.action_type === "draft_email" ? "pending_review" : "completed",
          metadata,
        });

        executedActions.push({
          ...action,
          metadata,
          executed: true,
        });
      } catch (err) {
        console.error(`Failed to execute action: ${action.title}`, err);
        executedActions.push({ ...action, executed: false, error: String(err) });
      }
    }

    // Create a notification for the user
    await supabaseAdmin.from("notifications").insert({
      user_id: user.id,
      type: "agent",
      title: "Agent completed a run",
      message: summary,
    });

    return new Response(JSON.stringify({
      success: true,
      summary,
      actions: executedActions,
      actionsCount: executedActions.filter(a => a.executed).length,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("autonomous-agent error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
