// Edge Function: pulls follower counts from each social platform's official
// API and records them in Marketing → Digital (one row per platform per day).
// Deploy:  supabase functions deploy social-sync
// Run:     "Sync now" in the Digital tab, or on a schedule (supabase/social_cron.sql).
//
// Each platform runs only when its secrets are set (supabase secrets set KEY=value):
//   YouTube    YOUTUBE_API_KEY, YOUTUBE_CHANNEL_ID              (free Google API key)
//   Facebook   META_PAGE_TOKEN, FACEBOOK_PAGE_ID                (long-lived Page access token)
//   Instagram  META_PAGE_TOKEN, INSTAGRAM_BUSINESS_ID           (IG business account linked to the Page)
//   LinkedIn   LINKEDIN_TOKEN, LINKEDIN_ORG_ID                  (Community Management API, org admin token)
//   X          X_BEARER_TOKEN, X_USERNAME                       (X API Basic tier or above)
import { createClient } from "npm:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const env = (k: string) => Deno.env.get(k) || "";

async function getJSON(url: string, headers: Record<string, string> = {}) {
  const r = await fetch(url, { headers });
  const body = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(body?.error?.message || body?.message || body?.detail || `HTTP ${r.status}`);
  return body;
}

type Source = { platform: string; metric: string; needs: string[]; fetch: () => Promise<number> };
const SOURCES: Source[] = [
  { platform: "YouTube", metric: "Subscribers", needs: ["YOUTUBE_API_KEY", "YOUTUBE_CHANNEL_ID"],
    fetch: async () => Number((await getJSON(
      `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${env("YOUTUBE_CHANNEL_ID")}&key=${env("YOUTUBE_API_KEY")}`,
    )).items?.[0]?.statistics?.subscriberCount) },
  { platform: "Facebook", metric: "Followers", needs: ["META_PAGE_TOKEN", "FACEBOOK_PAGE_ID"],
    fetch: async () => {
      const b = await getJSON(`https://graph.facebook.com/v21.0/${env("FACEBOOK_PAGE_ID")}?fields=followers_count,fan_count&access_token=${env("META_PAGE_TOKEN")}`);
      return Number(b.followers_count ?? b.fan_count);
    } },
  { platform: "Instagram", metric: "Followers", needs: ["META_PAGE_TOKEN", "INSTAGRAM_BUSINESS_ID"],
    fetch: async () => Number((await getJSON(
      `https://graph.facebook.com/v21.0/${env("INSTAGRAM_BUSINESS_ID")}?fields=followers_count&access_token=${env("META_PAGE_TOKEN")}`,
    )).followers_count) },
  { platform: "LinkedIn", metric: "Followers", needs: ["LINKEDIN_TOKEN", "LINKEDIN_ORG_ID"],
    fetch: async () => Number((await getJSON(
      `https://api.linkedin.com/rest/networkSizes/urn%3Ali%3Aorganization%3A${env("LINKEDIN_ORG_ID")}?edgeType=COMPANY_FOLLOWED_BY_COMPANY`,
      { Authorization: `Bearer ${env("LINKEDIN_TOKEN")}`, "LinkedIn-Version": "202501", "X-Restli-Protocol-Version": "2.0.0" },
    )).firstDegreeSize) },
  { platform: "X (Twitter)", metric: "Followers", needs: ["X_BEARER_TOKEN", "X_USERNAME"],
    fetch: async () => Number((await getJSON(
      `https://api.x.com/2/users/by/username/${env("X_USERNAME")}?user.fields=public_metrics`,
      { Authorization: `Bearer ${env("X_BEARER_TOKEN")}` },
    )).data?.public_metrics?.followers_count) },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  const json = (b: unknown, s = 200) =>
    new Response(JSON.stringify(b), { status: s, headers: { ...cors, "Content-Type": "application/json" } });
  const admin = createClient(env("SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"));

  // Allowed: the scheduler (service-role key) or a signed-in Marketing / CEO Office user
  const jwt = (req.headers.get("Authorization") || "").replace("Bearer ", "");
  if (jwt !== env("SUPABASE_SERVICE_ROLE_KEY")) {
    const { data: { user } } = await admin.auth.getUser(jwt);
    if (!user) return json({ error: "Not signed in" }, 401);
    const { data: p } = await admin.from("profiles").select("role,vertical").eq("id", user.id).single();
    if (!(["master", "ceo"].includes(p?.role) || (p?.vertical === "mkt" && ["lead", "member"].includes(p?.role))))
      return json({ error: "Marketing or CEO Office only" }, 403);
  }

  const today = new Date(Date.now() + 5.5 * 3600e3).toISOString().slice(0, 10); // IST date
  const results: Record<string, unknown> = {};
  for (const s of SOURCES) {
    if (s.needs.some((k) => !env(k))) { results[s.platform] = "not configured"; continue; }
    try {
      const value = await s.fetch();
      if (!Number.isFinite(value)) throw new Error("No count in the response");
      // One auto row per platform per day — replace today's if it exists
      await admin.from("records").delete().eq("vertical", "mkt").eq("tab", "digital")
        .eq("data->>platform", s.platform).eq("data->>as_of", today).eq("data->>source", "auto");
      const { error } = await admin.from("records").insert([{
        vertical: "mkt", tab: "digital",
        data: { platform: s.platform, metric: s.metric, value, as_of: today, source: "auto", notes: "Synced from the platform" },
      }]);
      if (error) throw error;
      results[s.platform] = value;
    } catch (e) {
      results[s.platform] = `error: ${e instanceof Error ? e.message : String(e)}`;
    }
  }
  return json({ ok: true, as_of: today, results });
});
