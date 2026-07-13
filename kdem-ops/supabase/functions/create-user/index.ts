// Edge Function: lets the Master role create team accounts from the Admin
// page (email + temp password + role/vertical/cluster).
// Deploy:  supabase functions deploy create-user
// Uses the service-role key that Supabase injects automatically.
import { createClient } from "npm:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  const json = (b: unknown, s = 200) =>
    new Response(JSON.stringify(b), { status: s, headers: { ...cors, "Content-Type": "application/json" } });
  try {
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    // Verify the caller is a signed-in Master
    const jwt = (req.headers.get("Authorization") || "").replace("Bearer ", "");
    const { data: { user } } = await admin.auth.getUser(jwt);
    if (!user) return json({ error: "Not signed in" }, 401);
    const { data: prof } = await admin.from("profiles").select("role").eq("id", user.id).single();
    if (prof?.role !== "master") return json({ error: "Master role required" }, 403);

    const { email, password, name, title, role, vertical, cluster } = await req.json();
    if (!email || !password) return json({ error: "Email and password required" }, 400);

    const { data: created, error } = await admin.auth.admin.createUser({
      email, password, email_confirm: true,
    });
    if (error) return json({ error: error.message }, 400);

    await admin.from("profiles").update({
      name: name || email.split("@")[0],
      title: title || "",
      role: role || "member",
      vertical: vertical || null,
      cluster: cluster || null,
    }).eq("id", created.user.id);

    return json({ ok: true });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
