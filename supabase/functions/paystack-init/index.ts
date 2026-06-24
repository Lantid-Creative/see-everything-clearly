// Initialize a Paystack transaction for a VAPT request
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

    const { request_id, callback_url } = await req.json();
    if (!request_id) return json({ error: "request_id required" }, 400);

    const { data: reqRow, error: reqErr } = await supabase
      .from("vapt_requests")
      .select("id, user_id, amount_kobo, currency, public_id")
      .eq("id", request_id)
      .single();
    if (reqErr || !reqRow) return json({ error: "Request not found" }, 404);
    if (reqRow.user_id !== user.id) return json({ error: "Forbidden" }, 403);
    if (!reqRow.amount_kobo || reqRow.amount_kobo < 100) return json({ error: "Invalid amount" }, 400);

    const reference = `LNTD-${reqRow.public_id}-${Date.now()}`;

    const psRes = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: user.email,
        amount: reqRow.amount_kobo,
        currency: reqRow.currency || "NGN",
        reference,
        callback_url,
        metadata: { request_id: reqRow.id, user_id: user.id, public_id: reqRow.public_id },
      }),
    });
    const psJson = await psRes.json();
    if (!psRes.ok || !psJson.status) {
      return json({ error: psJson.message || "Paystack init failed" }, 502);
    }

    await supabase.from("payments").insert({
      request_id: reqRow.id,
      user_id: user.id,
      provider: "paystack",
      provider_reference: reference,
      amount_kobo: reqRow.amount_kobo,
      currency: reqRow.currency || "NGN",
      status: "pending",
      raw_response: psJson.data,
    });

    return json({
      authorization_url: psJson.data.authorization_url,
      access_code: psJson.data.access_code,
      reference,
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
