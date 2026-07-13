"use client";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useApp } from "@/lib/ctx";
import { VERTICALS, BB_CLUSTERS, BB_SECTIONS, dbTabs } from "@/lib/schemas";
import { fmt } from "@/lib/util";
import Counters from "./Counters";
import DataTable from "./DataTable";
import PolicyHub from "./PolicyHub";
import EventsTable from "./EventsTable";
import TasksPanel from "./TasksPanel";
import ProposalsBoard from "./ProposalsBoard";

const SHORT = { "Hubballi-Dharwad-Belagavi": "HDB" };
const cShort = (c) => SHORT[c] || c;
const LANDED = ["Grounded", "Operational", "Closed"];

/**
 * Beyond Bengaluru — cluster-first, pipeline-honest.
 * Companies & jobs on the glance cards count only what has LANDED;
 * DCs show the pipeline; zeros are hidden. Every number is computed.
 */
export default function BBView() {
  const v = VERTICALS.bb;
  const { fy } = useApp();
  const searchParams = useSearchParams();
  const urlTab = searchParams.get("tab");
  const [tab, setTab] = useState("overview");
  const [dbTab, setDbTab] = useState("db_companies");
  useEffect(() => { if (urlTab) setTab(urlTab); }, [urlTab]);
  const [mirror, setMirror] = useState([]);
  const [tasks, setTasks] = useState([]);

  const loadMirror = useCallback(async () => {
    const pairs = BB_SECTIONS.flatMap((s) => s.tabDef.sources || [{ vertical: s.tabDef.home, tab: s.tabDef.key }]);
    const uniq = [...new Map(pairs.map((p) => [`${p.vertical}|${p.tab}`, p])).values()];
    const res = await Promise.all(uniq.map((p) =>
      supabase.from("records").select("vertical,tab,data").eq("vertical", p.vertical).eq("tab", p.tab).eq("fy", fy)));
    setMirror(res.flatMap((r) => r.data || []));
    const t = await supabase.from("tasks").select("cluster,status").eq("vertical", "bb");
    setTasks(t.data || []);
  }, [fy]);

  useEffect(() => { loadMirror(); }, [loadMirror]);
  useEffect(() => {
    const ch = supabase.channel("bb-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "records" }, loadMirror)
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, loadMirror)
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, [loadMirror]);

  const summary = useMemo(() => {
    const s = {};
    BB_CLUSTERS.forEach((c) => (s[c] = { pipeline: 0, landed: 0, jobs: 0, dcs: 0, startups: 0, openTasks: 0 }));
    mirror.forEach((r) => {
      const d = r.data || {};
      const c = d.cluster;
      if (!s[c]) return;
      if (r.tab === "gccs" || r.tab === "investments") {
        s[c].pipeline++;
        const landed = r.tab === "gccs" ? LANDED.includes(d.stage) : d.stage === "Closed";
        if (landed) { s[c].landed++; s[c].jobs += Number(d.jobs) || 0; }
      }
      if (r.tab === "startups") s[c].startups++;
      if (r.tab === "datacentres") s[c].dcs++;
    });
    tasks.forEach((t) => { if (s[t.cluster] && t.status !== "done") s[t.cluster].openTasks++; });
    return s;
  }, [mirror, tasks]);

  const policyHubDef = v.tabs[0];
  const DB_TABS = dbTabs("bb");

  return (
    <>
      <div className="card pad" style={{ display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap", borderLeft: `4px solid ${v.color}` }}>
        <div>
          <div style={{ fontFamily: "var(--display)", fontSize: 21, fontWeight: 700 }}>{v.name}</div>
          <div style={{ fontSize: 12.5, color: "var(--faint)" }}>6 clusters — mirrored live from every vertical</div>
        </div>
      </div>

      <div className="tabbar">
        <button className={`tab ${tab === "overview" ? "on" : ""}`} onClick={() => setTab("overview")}>Overview</button>
        <button className={`tab ${tab === "all" ? "on" : ""}`} onClick={() => setTab("all")}>All clusters</button>
        {BB_CLUSTERS.map((c) => (
          <button key={c} className={`tab ${tab === c ? "on" : ""}`} onClick={() => setTab(c)}>
            {cShort(c)} <span className="count">{summary[c]?.pipeline || 0}</span>
          </button>
        ))}
        <button className={`tab ${tab === "policies" ? "on" : ""}`} onClick={() => setTab("policies")}>Policies</button>
        <button className={`tab ${tab === "database" ? "on" : ""}`} onClick={() => setTab("database")}>Database</button>
        <button className={`tab ${tab === "proposals" ? "on" : ""}`} onClick={() => setTab("proposals")}>Proposals</button>
      </div>

      {tab === "overview" && (
        <>
          <Counters vertical="bb" color={v.color} onJump={(k) => setTab(k)} />
          <div>
            <div className="section-title">Clusters at a glance</div>
            <div className="section-sub">Landed companies & jobs; DC pipeline — click into a cluster for everything</div>
          </div>
          <div className="vgrid">
            {BB_CLUSTERS.map((c) => {
              const s = summary[c];
              const stats = [
                ["In pipeline", s.pipeline], ["Landed", s.landed], ["Jobs (landed)", s.jobs ? fmt(s.jobs) : 0],
                ["DC pipeline", s.dcs], ["Startups", s.startups],
              ].filter(([, n]) => n && n !== 0);
              return (
                <button key={c} className="card kpi" style={{ borderTop: `3px solid ${v.color}` }} onClick={() => setTab(c)}>
                  <div style={{ fontWeight: 700, fontSize: 14.5 }}>{c}</div>
                  {stats.length === 0 ? (
                    <div style={{ fontSize: 12, color: "var(--faint)" }}>Fresh ground — nothing tracked here yet</div>
                  ) : (
                    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                      {stats.map(([l, n]) => (
                        <div key={l}>
                          <div style={{ fontFamily: "var(--display)", fontSize: 20, fontWeight: 700 }}>{n}</div>
                          <div style={{ fontSize: 10.5, color: "var(--faint)" }}>{l}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  {s.openTasks > 0 && <div style={{ fontSize: 11.5, color: "var(--faint)" }}>{s.openTasks} open tasks</div>}
                </button>
              );
            })}
          </div>
          <TasksPanel vertical="bb" coreOnly title="Core team tasks — Bengaluru" />
        </>
      )}

      {tab === "all" && (
        <>
          <div>
            <div className="section-title">All clusters combined</div>
            <div className="section-sub">Every tracker across all six clusters, in one place</div>
          </div>
          {BB_SECTIONS.map((s) => (
            <DataTable key={`all-${s.label}`} pageVertical="bb" tabDef={s.tabDef} accentColor={v.color}
              extraFilter={(d) => BB_CLUSTERS.includes(d.cluster)}
              title={`${s.label} — all clusters`} />
          ))}
        </>
      )}

      {BB_CLUSTERS.includes(tab) && <ClusterSection cluster={tab} color={v.color} policyHubDef={policyHubDef} />}

      {tab === "policies" && (
        <PolicyHub vertical="bb" hub={policyHubDef} accentColor={v.color}
          extraFilter={(d) => !d.cluster || BB_CLUSTERS.includes(d.cluster)} />
      )}

      {tab === "database" && (
        <div>
          <div className="subtabs" style={{ padding: "0 0 10px" }}>
            {DB_TABS.map((t) => (
              <button key={t.key} className={`stab ${dbTab === t.key ? "on" : ""}`} onClick={() => setDbTab(t.key)}>{t.label}</button>
            ))}
          </div>
          <DataTable pageVertical="bb" tabDef={DB_TABS.find((t) => t.key === dbTab)} accentColor={v.color} />
        </div>
      )}

      {tab === "proposals" && <ProposalsBoard vertical="bb" accentColor={v.color} />}
    </>
  );
}

function ClusterSection({ cluster, color, policyHubDef }) {
  return (
    <>
      <div>
        <div className="section-title">{cluster}</div>
        <div className="section-sub">Mirrored live from IT/GCC, ESDM, Startups & Marketing</div>
      </div>
      {BB_SECTIONS.map((s) => (
        <DataTable key={s.label} pageVertical="bb" tabDef={s.tabDef} accentColor={color}
          defaults={{ cluster }} hideCols={["cluster"]}
          extraFilter={(d) => d.cluster === cluster}
          title={s.label} />
      ))}
      <PolicyHub vertical="bb" hub={policyHubDef} accentColor={color} clusterFilter={cluster} />
      <EventsTable vertical="mkt" clusterFilter={cluster} title={`${cShort(cluster)} events`} />
      <TasksPanel vertical="bb" cluster={cluster} title={`${cShort(cluster)} tasks`} />
      <ProposalsBoard vertical="bb" accentColor={color} clusterFilter={cluster} />
    </>
  );
}
