// Verify a Paystack transaction and mark payment + request as paid
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

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const url = new URL(req.url);
    const reference =
      url.searchParams.get("reference") ||
      (req.method === "POST" ? (await req.json().catch(() => ({}))).reference : null);
    if (!reference) return json({ error: "reference required" }, 400);

    const psRes = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
    });
    const psJson = await psRes.json();
    if (!psRes.ok || !psJson.status) {
      return json({ error: psJson.message || "Verify failed" }, 502);
    }

    const status = psJson.data.status; // 'success' | 'failed' | ...
    const newStatus = status === "success" ? "paid" : status === "failed" ? "failed" : "pending";

    const { data: pay } = await supabase
      .from("payments")
      .select("id, request_id, pci_request_id, source_type")
      .eq("provider_reference", reference)
      .single();

    if (pay) {
      await supabase.from("payments")
        .update({ status: newStatus, raw_response: psJson.data })
        .eq("id", pay.id);

      if (newStatus === "paid") {
        if (pay.source_type === "pci" && pay.pci_request_id) {
          await supabase.from("pci_dss_requests")
            .update({ status: "paid" })
            .eq("id", pay.pci_request_id)
            .in("status", ["new", "pending_payment"]);
        } else if (pay.request_id) {
          await supabase.from("vapt_requests")
            .update({ status: "paid" })
            .eq("id", pay.request_id)
            .in("status", ["pending_payment"]);
        }
      }
    }

    return json({ status: newStatus, paystack: psJson.data });
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
