// Initialize a Paystack transaction for a unified audit_request
import { createClient } from "npm:@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const PAYSTACK_SECRET = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!PAYSTACK_SECRET) throw new Error("PAYSTACK_SECRET_KEY not configured");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Unauthorized" }, 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: userData } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    const user = userData.user;
    if (!user) return json({ error: "Unauthorized" }, 401);

    const { audit_request_id, callback_url } = await req.json();
    if (!audit_request_id) return json({ error: "audit_request_id required" }, 400);

    const { data: row, error: reqErr } = await supabase
      .from("audit_requests")
      .select("id, user_id, total_kobo, currency, reference, contact_email, audit_type, tier")
      .eq("id", audit_request_id)
      .single();
    if (reqErr || !row) return json({ error: "Request not found" }, 404);
    if (row.user_id !== user.id) return json({ error: "Forbidden" }, 403);
    if (!row.total_kobo || row.total_kobo < 100) return json({ error: "Invalid amount" }, 400);

    const paystackRef = `${row.reference}-${Date.now().toString(36).toUpperCase()}`;

    const psRes = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        email: row.contact_email || user.email,
        amount: row.total_kobo,
        currency: row.currency || "NGN",
        reference: paystackRef,
        callback_url,
        metadata: {
          audit_request_id: row.id,
          user_id: user.id,
          audit_type: row.audit_type,
          tier: row.tier,
          source_type: "audit",
        },
      }),
    });
    const psJson = await psRes.json();
    if (!psRes.ok || !psJson.status) {
      return json({ error: psJson.message || "Paystack init failed" }, 502);
    }

    await supabase.from("audit_requests")
      .update({ paystack_reference: paystackRef })
      .eq("id", row.id);

    return json({
      authorization_url: psJson.data.authorization_url,
      access_code: psJson.data.access_code,
      reference: paystackRef,
    });
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
