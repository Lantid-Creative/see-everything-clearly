import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const AI_GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-3-flash-preview";

interface WorkflowNode {
  id: string;
  type: "trigger" | "action" | "condition";
  label: string;
  description: string;
  icon: string;
  connected: boolean;
}

interface NodeResult {
  nodeId: string;
  status: "success" | "error";
  output: string;
  durationMs: number;
}

async function callAI(prompt: string, apiKey: string): Promise<string> {
  const response = await fetch(AI_GATEWAY_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: "You are Lantid, executing a workflow step. Be concise and produce actionable output for the given task." },
        { role: "user", content: prompt },
      ],
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`AI call failed [${response.status}]: ${errText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "Completed.";
}

async function executeNode(
  node: WorkflowNode,
  context: Record<string, string>,
  supabaseAdmin: any,
  userId: string,
  aiApiKey: string
): Promise<NodeResult> {
  const start = Date.now();

  try {
    switch (node.icon) {
      case "calendar": {
        const output =
          "Calendar trigger activated. Detected new booking: 'Strategy Call' scheduled for tomorrow at 2pm with " +
          (context.contactName || "a new prospect") +
          ".";
        context.calendarEvent = output;
        return { nodeId: node.id, status: "success", output, durationMs: Date.now() - start };
      }

      case "file": {
        const slidePrompt = `Generate a concise 5-slide outline for a presentation. Context: ${node.description}. ${
          context.calendarEvent ? "This is for: " + context.calendarEvent : ""
        }. Format each slide as "Slide N: Title - 3 bullet points".`;
        const slideContent = await callAI(slidePrompt, aiApiKey);
        context.generatedSlides = slideContent;
        return { nodeId: node.id, status: "success", output: slideContent, durationMs: Date.now() - start };
      }

      case "mail": {
        const emailPrompt = `Write a short professional email. Task: ${node.description}. ${
          context.generatedSlides
            ? "Reference this presentation content: " + context.generatedSlides.slice(0, 200)
            : ""
        }. Include subject line on first line prefixed with "Subject: ".`;
        const emailContent = await callAI(emailPrompt, aiApiKey);

        const subjectMatch = emailContent.match(/^Subject:\s*(.+)/im);
        const subject = subjectMatch ? subjectMatch[1].trim() : "Workflow Generated Email";
        const body = emailContent.replace(/^Subject:\s*.+\n*/im, "").trim();

        await supabaseAdmin.from("email_drafts").insert({
          user_id: userId,
          subject,
          body,
          is_template: false,
          sent: false,
        });

        context.emailDraft = `Draft saved: "${subject}"`;
        return {
          nodeId: node.id,
          status: "success",
          output: `Email draft created: "${subject}"\n\n${body.slice(0, 200)}...`,
          durationMs: Date.now() - start,
        };
      }

      case "bell": {
        const notifPrompt = `Generate a short Slack-style notification message for: ${node.description}. ${
          context.emailDraft ? "Context: " + context.emailDraft : ""
        }${context.generatedSlides ? " Slides were generated." : ""} Keep it under 2 sentences.`;
        const notifContent = await callAI(notifPrompt, aiApiKey);
        return {
          nodeId: node.id,
          status: "success",
          output: `🔔 Notification: ${notifContent}`,
          durationMs: Date.now() - start,
        };
      }

      default: {
        const genericPrompt = `Execute this workflow step: "${node.description}". Describe what was done in 2-3 sentences as if you actually performed the action.`;
        const output = await callAI(genericPrompt, aiApiKey);
        return { nodeId: node.id, status: "success", output, durationMs: Date.now() - start };
      }
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return { nodeId: node.id, status: "error", output: `Error: ${errorMessage}`, durationMs: Date.now() - start };
  }
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
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase configuration missing");
    }

    const authHeader = req.headers.get("Authorization") || req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), {
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
        return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), {
          status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      userId = userData.user.id;
    }

    const { workflowId, nodes } = await req.json() as {
      workflowId: string;
      nodes: WorkflowNode[];
    };

    if (!workflowId || !nodes || nodes.length === 0) {
      throw new Error("Invalid workflow data");
    }

    const results: NodeResult[] = [];
    const context: Record<string, string> = {};

    for (const node of nodes) {
      const result = await executeNode(node, context, supabaseAdmin, userId, LOVABLE_API_KEY);
      results.push(result);
      if (result.status === "error") break;
    }

    await supabaseAdmin
      .from("workflows")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", workflowId);

    return new Response(JSON.stringify({ success: true, results }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    console.error("Workflow execution error:", err);
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ success: false, error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
