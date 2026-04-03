import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const AI_GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-2.5-flash";

const SYSTEM_PROMPT = `You are the GTM (Go-To-Market) Generator for Lantid, a Product Management platform. Given a single product/feature description, you generate a COMPLETE go-to-market plan by creating all artifacts at once.

You MUST use the tool provided to return structured output. Generate ALL of the following:

1. **PRD** — A product requirements document with sections: overview, problem statement, target users, key features (3-5), user stories (3-5), success metrics, and timeline.

2. **Leads** — 5 ideal customer profiles / target leads. Each with realistic name, title, company, email pattern, and a personalization note for outreach.

3. **Emails** — One personalized outreach email per lead. Subject + body. Reference the product, their role, and why it matters to them.

4. **Slides** — A 5-slide pitch deck outline. Each slide has a title and 3-4 bullet points. Slides: Problem, Solution, Market, Traction/Plan, Ask.

5. **Workflow** — An automation workflow with 3-5 nodes that chains the GTM actions (e.g., "Research leads" → "Draft emails" → "Schedule follow-ups" → "Track responses").

Be specific, actionable, and professional. Use the product description to make everything contextually relevant.`;

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

    const authHeader = req.headers.get("Authorization") || req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const token = authHeader.replace(/^Bearer\s+/i, "");

    // Resilient auth: try getClaims first, fall back to getUser
    const supabaseAuth = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    let userId: string;
    const { data: claimsData } = await supabaseAuth.auth.getClaims(token);
    if (claimsData?.claims?.sub) {
      userId = claimsData.claims.sub as string;
    } else {
      const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
      if (userError || !userData?.user) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      userId = userData.user.id;
    }

    const { prompt } = await req.json();
    if (!prompt || typeof prompt !== "string") throw new Error("Missing prompt");

    // Get user profile for context
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("display_name, company, role, product_goals")
      .eq("id", user.id)
      .single();

    let userContext = `Product/Feature Description: ${prompt}`;
    if (profile) {
      if (profile.company) userContext += `\nUser's Company: ${profile.company}`;
      if (profile.role) userContext += `\nUser's Role: ${profile.role}`;
      if (profile.product_goals) userContext += `\nProduct Goals: ${profile.product_goals}`;
    }

    // Call AI
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
          { role: "user", content: userContext },
        ],
        tools: [{
          type: "function",
          function: {
            name: "generate_gtm_plan",
            description: "Generate a complete GTM plan with PRD, leads, emails, slides, and workflow",
            parameters: {
              type: "object",
              properties: {
                prd: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    overview: { type: "string" },
                    problem_statement: { type: "string" },
                    target_users: { type: "string" },
                    features: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          name: { type: "string" },
                          description: { type: "string" },
                        },
                        required: ["name", "description"],
                        additionalProperties: false,
                      },
                    },
                    user_stories: {
                      type: "array",
                      items: { type: "string" },
                    },
                    success_metrics: { type: "array", items: { type: "string" } },
                    timeline: { type: "string" },
                  },
                  required: ["title", "overview", "problem_statement", "target_users", "features", "user_stories", "success_metrics", "timeline"],
                  additionalProperties: false,
                },
                leads: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      title: { type: "string" },
                      company: { type: "string" },
                      email: { type: "string" },
                      personalization_note: { type: "string" },
                    },
                    required: ["name", "title", "company", "email", "personalization_note"],
                    additionalProperties: false,
                  },
                },
                emails: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      lead_name: { type: "string" },
                      subject: { type: "string" },
                      body: { type: "string" },
                    },
                    required: ["lead_name", "subject", "body"],
                    additionalProperties: false,
                  },
                },
                slides: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      bullets: { type: "array", items: { type: "string" } },
                    },
                    required: ["title", "bullets"],
                    additionalProperties: false,
                  },
                },
                workflow: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    nodes: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: { type: "string" },
                          type: { type: "string" },
                          label: { type: "string" },
                          description: { type: "string" },
                        },
                        required: ["id", "type", "label", "description"],
                        additionalProperties: false,
                      },
                    },
                  },
                  required: ["name", "nodes"],
                  additionalProperties: false,
                },
              },
              required: ["prd", "leads", "emails", "slides", "workflow"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "generate_gtm_plan" } },
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "Credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await aiResponse.text();
      console.error("AI error:", aiResponse.status, errText);
      throw new Error(`AI service error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No GTM plan generated");

    const plan = JSON.parse(toolCall.function.arguments);

    // Persist all artifacts to database
    const results: Record<string, any> = { plan };

    // 1. Create leads
    const leadInserts = plan.leads.map((l: any) => ({
      user_id: user.id,
      name: l.name,
      title: l.title,
      company: l.company,
      email: l.email,
      lead_type: "outreach",
      status: "verified",
      about: l.personalization_note,
    }));

    const { data: createdLeads } = await supabaseAdmin
      .from("leads")
      .insert(leadInserts)
      .select("id, name");
    results.leadsCreated = createdLeads?.length || 0;

    // 2. Create email drafts linked to leads
    const leadMap = new Map((createdLeads || []).map((l: any) => [l.name, l.id]));
    const emailInserts = plan.emails.map((e: any) => ({
      user_id: user.id,
      subject: e.subject,
      body: e.body,
      lead_id: leadMap.get(e.lead_name) || null,
      sent: false,
      is_template: false,
    }));

    const { data: createdEmails } = await supabaseAdmin
      .from("email_drafts")
      .insert(emailInserts)
      .select("id");
    results.emailsCreated = createdEmails?.length || 0;

    // 3. Create workflow
    const workflowNodes = plan.workflow.nodes.map((n: any) => ({
      id: crypto.randomUUID(),
      type: n.type,
      label: n.label,
      description: n.description,
    }));

    const { data: createdWorkflow } = await supabaseAdmin
      .from("workflows")
      .insert({
        user_id: user.id,
        name: plan.workflow.name,
        nodes: workflowNodes,
        is_deployed: false,
      })
      .select("id")
      .single();
    results.workflowCreated = !!createdWorkflow;

    // 4. Log agent action
    await supabaseAdmin.from("agent_actions").insert({
      user_id: user.id,
      action_type: "gtm_generation",
      title: `GTM Plan: ${plan.prd.title}`,
      description: `Generated PRD, ${results.leadsCreated} leads, ${results.emailsCreated} emails, 5 slides, and 1 workflow`,
      status: "completed",
      metadata: { prompt, prd_title: plan.prd.title },
    });

    // 5. Notification
    await supabaseAdmin.from("notifications").insert({
      user_id: user.id,
      type: "gtm",
      title: "GTM Plan generated",
      message: `"${plan.prd.title}" — ${results.leadsCreated} leads, ${results.emailsCreated} emails, workflow ready`,
    });

    return new Response(JSON.stringify({
      success: true,
      plan,
      results,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("gtm-generator error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
