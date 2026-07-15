// Self-service admin bootstrap disabled in production. To grant the first admin
// role, use the `seed-admin` operator function (requires service-role secret).
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  return new Response(
    JSON.stringify({ error: "This endpoint is disabled. Contact an existing admin." }),
    { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
