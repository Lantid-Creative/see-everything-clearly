// Issue a short-lived signed URL for a report PDF. Owner or admin only.
import { createClient } from "npm:@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Unauthorized" }, 401);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const { data: userData } = await admin.auth.getUser(authHeader.replace("Bearer ", ""));
    const user = userData.user;
    if (!user) return json({ error: "Unauthorized" }, 401);

    const { report_id } = await req.json();
    if (!report_id) return json({ error: "report_id required" }, 400);

    const { data: report } = await admin
      .from("reports")
      .select("id, storage_path, request_id, status")
      .eq("id", report_id)
      .single();
    if (!report || !report.storage_path) return json({ error: "Report PDF not available" }, 404);
    if (report.status === "revoked") return json({ error: "Report revoked" }, 410);

    const { data: roleRow } = await admin
      .from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle();
    const isAdmin = !!roleRow;

    if (!isAdmin) {
      if (!report.request_id) return json({ error: "Forbidden" }, 403);
      const { data: reqRow } = await admin
        .from("vapt_requests").select("user_id").eq("id", report.request_id).single();
      if (!reqRow || reqRow.user_id !== user.id) return json({ error: "Forbidden" }, 403);
    }

    const { data: signed, error: signErr } = await admin
      .storage.from("reports")
      .createSignedUrl(report.storage_path, 60 * 5);
    if (signErr) throw signErr;

    return json({ url: signed.signedUrl, expires_in: 300 });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
