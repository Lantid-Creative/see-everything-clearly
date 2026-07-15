// Public report verification endpoint with simple per-IP rate limiting
import { createClient } from "npm:@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RATE_LIMIT_WINDOW_SEC = 60;
const RATE_LIMIT_MAX = 15;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const url = new URL(req.url);
    const codeRaw =
      url.searchParams.get("code") ||
      (req.method === "POST" ? (await req.json().catch(() => ({}))).code : null);
    const code = (codeRaw || "").trim().toUpperCase();
    if (!code || code.length > 64) return json({ valid: false, reason: "invalid_code" }, 400);

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
    const ua = req.headers.get("user-agent")?.slice(0, 256) || "";

    // Rate limit: count attempts in last window
    const since = new Date(Date.now() - RATE_LIMIT_WINDOW_SEC * 1000).toISOString();
    const { count } = await supabase
      .from("verification_attempts")
      .select("id", { count: "exact", head: true })
      .eq("ip", ip)
      .gte("created_at", since);
    if ((count ?? 0) >= RATE_LIMIT_MAX) {
      await supabase.from("verification_attempts").insert({ verification_code: code, ip, user_agent: ua, result: "rate_limited" });
      return json({ valid: false, reason: "rate_limited" }, 429);
    }

    const { data: report } = await supabase
      .from("reports")
      .select("verification_code, company_name, target, scope_summary, assessment_type, report_type, status, overall_result, issued_at, revoked_at")
      .eq("verification_code", code)
      .maybeSingle();

    let result: string;
    let payload: Record<string, unknown>;
    if (!report) {
      result = "invalid";
      payload = { valid: false, reason: "not_found" };
    } else if (report.status === "revoked") {
      result = "revoked";
      payload = {
        valid: false,
        reason: "revoked",
        revoked_at: report.revoked_at,
        company_name: maskCompany(report.company_name),
        issued_at: report.issued_at,
      };
    } else {
      result = "valid";
      payload = {
        valid: true,
        verification_code: report.verification_code,
        company_name: report.company_name,
        target: report.target,
        scope_summary: report.scope_summary,
        assessment_type: report.assessment_type,
        report_type: (report as { report_type?: string }).report_type ?? "vapt",
        overall_result: report.overall_result,
        issued_at: report.issued_at,
        issuer: "Lantid",
      };
    }

    await supabase.from("verification_attempts").insert({ verification_code: code, ip, user_agent: ua, result });
    return json(payload, result === "invalid" ? 404 : 200);
  } catch (e) {
    return json({ valid: false, reason: "error", error: (e as Error).message }, 500);
  }
});

function maskCompany(name: string) {
  if (!name) return name;
  if (name.length <= 4) return name[0] + "***";
  return name.slice(0, 3) + "***" + name.slice(-2);
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
