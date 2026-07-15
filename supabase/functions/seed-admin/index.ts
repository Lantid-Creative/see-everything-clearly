// Locked-down admin bootstrap. Requires the SUPABASE_SERVICE_ROLE_KEY to be
// supplied via the `x-admin-setup-key` header. Callable only by operators
// with backend access — not exposed to end users.
import { createClient } from "npm:@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-setup-key",
};

const SEED_EMAIL = "lantidcreative@gmail.com";

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const provided = req.headers.get("x-admin-setup-key") ?? "";
    const expected = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    if (!expected || !provided || !timingSafeEqual(provided, expected)) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Password must be supplied by caller — never hardcoded.
    const body = await req.json().catch(() => ({} as Record<string, unknown>));
    const password = typeof body.password === "string" ? body.password : "";
    if (password.length < 12) {
      return new Response(JSON.stringify({ error: "password must be at least 12 chars" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    );

    let userId: string | null = null;
    const { data: list, error: listErr } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
    if (listErr) throw listErr;
    const existing = list.users.find((u) => u.email?.toLowerCase() === SEED_EMAIL);

    if (existing) {
      userId = existing.id;
      await admin.auth.admin.updateUserById(existing.id, { password, email_confirm: true });
    } else {
      const { data: created, error: createErr } = await admin.auth.admin.createUser({
        email: SEED_EMAIL,
        password,
        email_confirm: true,
        user_metadata: { display_name: "Lantid Admin" },
      });
      if (createErr) throw createErr;
      userId = created.user?.id ?? null;
    }
    if (!userId) throw new Error("Failed to resolve user id");

    const { error: roleErr } = await admin.from("user_roles").upsert(
      { user_id: userId, role: "admin" } as never,
      { onConflict: "user_id,role" } as never
    );
    if (roleErr) throw roleErr;

    return new Response(
      JSON.stringify({ ok: true, user_id: userId, existed: !!existing }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: (e as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
