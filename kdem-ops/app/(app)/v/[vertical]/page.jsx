"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { useApp } from "@/lib/ctx";
import { VERTICALS } from "@/lib/schemas";
import Counters from "@/components/Counters";
import DataTable from "@/components/DataTable";
import PolicyHub from "@/components/PolicyHub";
import EventsTable from "@/components/EventsTable";
import TasksPanel from "@/components/TasksPanel";
import MeetingsMini from "@/components/MeetingsMini";
import ProposalsBoard from "@/components/ProposalsBoard";
import BBView from "@/components/BBView";
import ContactsDirectory from "@/components/ContactsDirectory";
import { RefreshCw } from "lucide-react";

export default function VerticalPage() {
  return (
    <Suspense fallback={null}>
      <VerticalPageInner />
    </Suspense>
  );
}

function VerticalPageInner() {
  const { vertical } = useParams();
  const v = VERTICALS[vertical];
  const { canView, fy } = useApp();
  const searchParams = useSearchParams();
  const urlTab = searchParams.get("tab");
  const [tab, setTab] = useState("overview");
  const [counts, setCounts] = useState({});
  useEffect(() => { if (urlTab) setTab(urlTab); }, [urlTab]);

  const loadCounts = useCallback(async () => {
    if (!v || v.isBB) return;
    const { data } = await supabase.from("records").select("vertical,tab,fy,data");
    const m = {};
    v.tabs.forEach((t) => {
      if (t.isEvents || t.isProposals || t.isPolicyHub || t.isDatabase) return;
      const sources = t.sources || [{ vertical: t.home || vertical, tab: t.key }];
      m[t.viewKey || t.key] = (data || []).filter((r) =>
        (t.noFy || r.fy === fy) &&
        sources.some((s) => s.vertical === r.vertical && s.tab === r.tab) &&
        (!t.filter || t.filter(r.data || {}))
      ).length;
    });
    setCounts(m);
  }, [vertical, v, fy]);

  useEffect(() => { setTab(urlTab || "overview"); }, [vertical, urlTab]);
  useEffect(() => { loadCounts(); }, [loadCounts]);
  useEffect(() => {
    if (v?.isBB) return;
    const ch = supabase.channel(`v-${vertical}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "records" }, loadCounts)
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, [vertical, v, loadCounts]);

  if (!v) return <div className="empty">Unknown vertical.</div>;
  if (!canView(vertical))
    return <div className="card empty">This workspace belongs to the {v.name} team. Your vertical is in the sidebar.</div>;
  if (v.isBB) return <BBView />;

  const activeTab = v.tabs.find((t) => (t.viewKey || t.key) === tab);
  if (tab !== "overview" && !activeTab) { setTimeout(() => setTab("overview")); return null; } // stale link to a removed tab

  return (
    <>
      <div className="card pad" style={{ display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap", borderLeft: `4px solid ${v.color}` }}>
        <div style={{ fontFamily: "var(--display)", fontSize: 21, fontWeight: 700 }}>{v.name}</div>
      </div>

      <div className="tabbar">
        <button className={`tab ${tab === "overview" ? "on" : ""}`} onClick={() => setTab("overview")}>Overview</button>
        {v.tabs.map((t) => {
          const key = t.viewKey || t.key;
          return (
            <button key={key} className={`tab ${tab === key ? "on" : ""}`} onClick={() => setTab(key)}>
              {t.label}
              {counts[key] != null && <span className="count">{counts[key]}</span>}
            </button>
          );
        })}
      </div>

      {tab === "overview" ? (
        <>
          <Counters vertical={vertical} color={v.color}
            onJump={(n) => {
              const t = v.tabs.find((x) => (x.viewKey || x.key) === n.tab || x.key === n.tab);
              if (t) setTab(t.viewKey || t.key);
            }} />
          <TasksPanel vertical={vertical} title={`${v.short} tasks`} />
          <EventsTable vertical={vertical} verticalFilter={vertical} title={`${v.short} events`} />
          <MeetingsMini vertical={vertical} title={`${v.short} meetings`} />
        </>
      ) : activeTab?.isEvents ? (
        <EventsTable vertical={vertical} />
      ) : activeTab?.isProposals ? (
        <ProposalsBoard vertical={vertical} accentColor={v.color} />
      ) : activeTab?.isPolicyHub ? (
        <PolicyHub vertical={vertical} hub={activeTab} accentColor={v.color} />
      ) : activeTab?.isDatabase ? (
        <ContactsDirectory vertical={vertical} accentColor={v.color} />
      ) : (
        <DataTable pageVertical={vertical} tabDef={activeTab} accentColor={v.color}
          headExtra={activeTab.key === "digital" ? <SocialSync /> : null} />
      )}
    </>
  );
}

// Pull live follower counts (social-sync edge function)
function SocialSync() {
  const { notify } = useApp();
  const [busy, setBusy] = useState(false);
  async function run() {
    setBusy(true);
    const { data, error } = await supabase.functions.invoke("social-sync");
    setBusy(false);
    if (error) return notify("Sync isn't set up yet — deploy the social-sync function (see README)");
    const r = data?.results || {};
    const done = Object.entries(r).filter(([, v]) => typeof v === "number").map(([k]) => k);
    const off = Object.entries(r).filter(([, v]) => typeof v !== "number").map(([k, v]) => `${k}: ${v}`);
    notify(done.length ? `Updated ${done.join(", ")}${off.length ? ` · ${off.length} not synced` : ""}` : off.join(" · ") || "Nothing to sync");
  }
  return (
    <button className="btn sm" disabled={busy} onClick={run} title="Fetch follower counts from the platforms">
      <RefreshCw size={13} className={busy ? "spin" : ""} /> Sync now
    </button>
  );
}
