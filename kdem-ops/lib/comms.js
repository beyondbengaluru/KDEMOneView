"use client";
import { useCallback, useEffect, useId, useState } from "react";
import { supabase } from "./supabase";
import { DESKS, vName } from "./schemas";

// Channel ids (enforced by can_see_channel() in SQL):
//   all            everyone in KDEM
//   v:<vertical>   my vertical's team (the CEO Office and Master share v:ceo)
//   dm:<id>:<id>   two people, ids sorted
//   x:<desk>       Marketing ↔ an external agency
export const teamChannel = (profile) => {
  if (!profile || profile.role === "external") return null;
  const v = ["master", "ceo"].includes(profile.role) ? "ceo" : profile.vertical;
  return v ? `v:${v}` : null;
};
export const dmChannel = (a, b) => `dm:${[a, b].sort().join(":")}`;
export const deskChannels = (profile) => {
  if (!profile) return [];
  if (profile.role === "external") return DESKS[profile.vertical] ? [`x:${profile.vertical}`] : [];
  if (["master", "ceo"].includes(profile.role) || profile.vertical === "mkt") return Object.keys(DESKS).map((d) => `x:${d}`);
  return [];
};
export function channelName(ch, profile, people = []) {
  if (ch === "all") return "Everyone";
  if (ch.startsWith("v:")) return `${vName(ch.slice(2))} team`;
  if (ch.startsWith("x:")) return DESKS[ch.slice(2)] || "Agency";
  if (ch.startsWith("dm:")) {
    const other = ch.slice(3).split(":").find((id) => id !== profile?.id);
    return people.find((p) => p.id === other)?.name || "Direct message";
  }
  return ch;
}

const readKey = "kdem-read";
export const lastRead = () => { try { return JSON.parse(localStorage.getItem(readKey) || "{}"); } catch { return {}; } };
export const markRead = (ch) => {
  const m = lastRead(); m[ch] = new Date().toISOString();
  localStorage.setItem(readKey, JSON.stringify(m));
  window.dispatchEvent(new Event("kdem-read"));
};

/** Unread counts per channel for the signed-in person (latest 500 messages they can see). */
export function useUnread(profile) {
  const [unread, setUnread] = useState({});
  const uid = useId(); // several components can watch unread counts at once
  const load = useCallback(async () => {
    if (!profile) return;
    const { data } = await supabase.from("messages").select("channel,created_at,sender")
      .order("created_at", { ascending: false }).limit(500);
    const lr = lastRead(), out = {};
    (data || []).forEach((m) => {
      if (m.sender !== profile.id && (!lr[m.channel] || m.created_at > lr[m.channel])) out[m.channel] = (out[m.channel] || 0) + 1;
    });
    setUnread(out);
  }, [profile]);
  useEffect(() => {
    load();
    const ch = supabase.channel(`unread-${profile?.id || "x"}-${uid}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, load).subscribe();
    window.addEventListener("kdem-read", load);
    return () => { supabase.removeChannel(ch); window.removeEventListener("kdem-read", load); };
  }, [load, profile, uid]);
  return unread;
}
