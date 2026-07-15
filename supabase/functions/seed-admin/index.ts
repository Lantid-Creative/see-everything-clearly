// One-off seed: creates the Lantid admin account and grants admin role.
// Idempotent — safe to invoke multiple times.
import { createClient } from "npm:@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SEED_EMAIL = "lantidcreative@gmail.com";
const SEED_PASSWORD = "Lantid@123?";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    );

    // Look up existing user by email
    let userId: string | null = null;
    const { data: list, error: listErr } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
    if (listErr) throw listErr;
    const existing = list.users.find((u) => u.email?.toLowerCase() === SEED_EMAIL);

    if (existing) {
      userId = existing.id;
      // Reset password + confirm email to guarantee the credentials work
      await admin.auth.admin.updateUserById(existing.id, {
        password: SEED_PASSWORD,
        email_confirm: true,
      });
    } else {
      const { data: created, error: createErr } = await admin.auth.admin.createUser({
        email: SEED_EMAIL,
        password: SEED_PASSWORD,
        email_confirm: true,
        user_metadata: { display_name: "Lantid Admin" },
      });
      if (createErr) throw createErr;
      userId = created.user?.id ?? null;
    }
    if (!userId) throw new Error("Failed to resolve user id");

    // Grant admin role (idempotent thanks to unique(user_id, role))
    const { error: roleErr } = await admin.from("user_roles").upsert(
      { user_id: userId, role: "admin" } as never,
      { onConflict: "user_id,role" } as never
    );
    if (roleErr) throw roleErr;

    return new Response(
      JSON.stringify({ ok: true, user_id: userId, email: SEED_EMAIL, existed: !!existing }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: (e as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
