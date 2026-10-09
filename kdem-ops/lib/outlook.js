"use client";
// Outlook calendar sync through Microsoft Graph, signed in per person in the
// browser (MSAL, PKCE — no server secret). Needs an Azure app registration:
//   NEXT_PUBLIC_MS_CLIENT_ID   Application (client) ID
//   NEXT_PUBLIC_MS_TENANT_ID   Directory (tenant) ID, or "organizations"
// Platform: Single-page application, redirect URI <site>/msal-redirect.html
// Delegated permission: Calendars.ReadWrite
import { PublicClientApplication, InteractionRequiredAuthError } from "@azure/msal-browser";

const CLIENT_ID = process.env.NEXT_PUBLIC_MS_CLIENT_ID;
const TENANT = process.env.NEXT_PUBLIC_MS_TENANT_ID || "organizations";
const SCOPES = ["Calendars.ReadWrite"];
const TZ = "India Standard Time";
export const outlookConfigured = !!CLIENT_ID;

let pca = null;
async function app() {
  if (!pca) {
    pca = new PublicClientApplication({
      auth: { clientId: CLIENT_ID, authority: `https://login.microsoftonline.com/${TENANT}`,
        redirectUri: `${window.location.origin}/msal-redirect.html` },
      cache: { cacheLocation: "localStorage" },
    });
    await pca.initialize();
  }
  return pca;
}

export async function outlookAccount() {
  if (!outlookConfigured) return null;
  const a = await app();
  return a.getActiveAccount() || a.getAllAccounts()[0] || null;
}
export async function connectOutlook() {
  const a = await app();
  const r = await a.loginPopup({ scopes: SCOPES, prompt: "select_account" });
  a.setActiveAccount(r.account);
  return r.account;
}
export async function disconnectOutlook() {
  const a = await app();
  const acc = await outlookAccount();
  if (acc) await a.clearCache({ account: acc });
}

async function token() {
  const a = await app();
  const account = await outlookAccount();
  if (!account) throw new Error("Outlook not connected");
  try {
    return (await a.acquireTokenSilent({ scopes: SCOPES, account })).accessToken;
  } catch (e) {
    if (e instanceof InteractionRequiredAuthError) return (await a.acquireTokenPopup({ scopes: SCOPES, account })).accessToken;
    throw e;
  }
}
async function graph(path, opts = {}) {
  const res = await fetch(`https://graph.microsoft.com/v1.0${path}`, {
    ...opts,
    headers: { Authorization: `Bearer ${await token()}`, "Content-Type": "application/json",
      Prefer: `outlook.timezone="${TZ}"`, ...(opts.headers || {}) },
  });
  if (res.status === 204) return null;
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new Error(body?.error?.message || `Outlook error ${res.status}`);
  return body;
}

const addDay = (iso) => { const d = new Date(iso + "T00:00"); d.setDate(d.getDate() + 1); return d.toISOString().slice(0, 10); };
const plusHour = (t) => { const [h, m] = t.split(":").map(Number); return `${String(Math.min(23, h + 1)).padStart(2, "0")}:${String(m).padStart(2, "0")}`; };

// One OneView meeting → Outlook event body
function eventBody(m) {
  const allDay = !m.time;
  const end = m.end_time || (m.time ? plusHour(m.time) : "");
  const lines = [
    m.chaired_by && `Chaired by: ${m.chaired_by}`,
    (m.participants || []).length && `Team: ${m.participants.join(", ")}`,
    m.externals && `External: ${m.externals.replace(/\n/g, "; ")}`,
    m.link && `Join: ${m.link}`,
    "— from KDEM OneView",
  ].filter(Boolean);
  return {
    subject: m.title,
    isAllDay: allDay,
    start: { dateTime: allDay ? `${m.date}T00:00:00` : `${m.date}T${m.time}:00`, timeZone: TZ },
    end: { dateTime: allDay ? `${addDay(m.date)}T00:00:00` : `${m.date}T${end}:00`, timeZone: TZ },
    location: { displayName: m.mode === "online" ? (m.link ? "Online" : "") : (m.venue || "") },
    body: { contentType: "text", content: lines.join("\n") },
  };
}

/** Create or update the meeting in the signed-in person's Outlook. Returns the event id. */
export async function pushMeeting(m, existingId) {
  if (!m.date) return existingId || null;
  if (existingId) {
    try { await graph(`/me/events/${existingId}`, { method: "PATCH", body: JSON.stringify(eventBody(m)) }); return existingId; }
    catch { /* deleted in Outlook — create it again */ }
  }
  const ev = await graph("/me/events", { method: "POST", body: JSON.stringify(eventBody(m)) });
  return ev.id;
}
export async function deleteOutlookEvent(id) {
  try { await graph(`/me/events/${id}`, { method: "DELETE" }); } catch { /* already gone */ }
}

/** Outlook events between two ISO dates, as calendar items. */
export async function listOutlook(fromISO, toISO) {
  const q = `/me/calendarView?startDateTime=${fromISO}T00:00:00&endDateTime=${toISO}T23:59:59` +
    `&$select=id,subject,start,end,isAllDay,location,webLink,onlineMeeting&$top=250&$orderby=start/dateTime`;
  const out = [];
  let page = await graph(q);
  while (page) {
    out.push(...(page.value || []));
    page = page["@odata.nextLink"] ? await graph(page["@odata.nextLink"].replace("https://graph.microsoft.com/v1.0", "")) : null;
  }
  return out.map((e) => ({
    id: e.id, title: e.subject || "(no title)", date: e.start.dateTime.slice(0, 10),
    time: e.isAllDay ? "" : e.start.dateTime.slice(11, 16), end: e.isAllDay ? "" : e.end.dateTime.slice(11, 16),
    location: e.location?.displayName || "", link: e.onlineMeeting?.joinUrl || "", webLink: e.webLink,
  }));
}

/** .ics file for one meeting — works with any calendar, no sign-in needed. */
export function meetingICS(m) {
  const stamp = (d, t) => `${d.replace(/-/g, "")}${t ? `T${t.replace(":", "")}00` : ""}`;
  const end = m.time ? (m.end_time || plusHour(m.time)) : "";
  const esc = (s) => String(s || "").replace(/[,;\\]/g, (c) => `\\${c}`).replace(/\n/g, "\\n");
  const ics = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//KDEM//OneView//EN", "BEGIN:VEVENT",
    `UID:${m.id}@kdem-oneview`, `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").slice(0, 15)}Z`,
    m.time ? `DTSTART;TZID=Asia/Kolkata:${stamp(m.date, m.time)}` : `DTSTART;VALUE=DATE:${stamp(m.date)}`,
    m.time ? `DTEND;TZID=Asia/Kolkata:${stamp(m.date, end)}` : `DTEND;VALUE=DATE:${stamp(addDay(m.date))}`,
    `SUMMARY:${esc(m.title)}`,
    `LOCATION:${esc(m.mode === "online" ? m.link : m.venue)}`,
    `DESCRIPTION:${esc([m.chaired_by && `Chaired by: ${m.chaired_by}`, m.link && `Join: ${m.link}`].filter(Boolean).join("\n"))}`,
    "END:VEVENT", "END:VCALENDAR",
  ].join("\r\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
  a.download = `${(m.title || "meeting").replace(/[^\w]+/g, "_")}.ics`;
  a.click();
  URL.revokeObjectURL(a.href);
}
