"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { useApp } from "@/lib/ctx";
import { VERTICALS, dbTabs } from "@/lib/schemas";
import Counters from "@/components/Counters";
import DataTable from "@/components/DataTable";
import PolicyHub from "@/components/PolicyHub";
import EventsTable from "@/components/EventsTable";
import TasksPanel from "@/components/TasksPanel";
import MeetingsMini from "@/components/MeetingsMini";
import ProposalsBoard from "@/components/ProposalsBoard";
import BBView from "@/components/BBView";

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
  const [dbTab, setDbTab] = useState("db_companies");

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
  const DB_TABS = dbTabs(vertical);

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
            onJump={(tabKey) => {
              const t = v.tabs.find((x) => (x.viewKey || x.key) === tabKey || x.key === tabKey);
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
        <div>
          <div className="subtabs" style={{ padding: "0 0 10px" }}>
            {DB_TABS.map((t) => (
              <button key={t.key} className={`stab ${dbTab === t.key ? "on" : ""}`} onClick={() => setDbTab(t.key)}>{t.label}</button>
            ))}
          </div>
          <DataTable pageVertical={vertical} tabDef={DB_TABS.find((t) => t.key === dbTab)} accentColor={v.color} />
        </div>
      ) : (
        <DataTable pageVertical={vertical} tabDef={activeTab} accentColor={v.color} />
      )}
    </>
  );
}
