"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Building2, ListTodo, Presentation, CalendarDays, FileText, UserRound } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useApp } from "@/lib/ctx";
import { VERTICALS, vName, CLUSTER_TABS, isGcc, isLanded, isExpansion } from "@/lib/schemas";

// Where a record lives in the app: its vertical tab, or the Beyond
// Bengaluru cluster section for people who only see BB.
const BB_SEC = { datacentres: "dcs", jobs: "jobs", awareness: "awareness", startups: "startups", policyreg: "policyreg" };
function linkFor(r, canView) {
  const d = r.data || {};
  const bbSec = r.tab === "gccs" ? (!isLanded(d) ? "pipeline" : isExpansion(d) ? "expansions" : "new")
    : r.tab.startsWith("cs_") ? r.tab : BB_SEC[r.tab];
  if (r.vertical !== "bb" && canView(r.vertical)) {
    const tab = r.tab === "gccs" ? (isGcc(d) || !d.type ? "gccs" : "itcos")
      : r.tab.startsWith("db_") ? "database"
      : ["policyreg", "awareness", "polstrategy"].includes(r.tab) ? "policies"
      : r.tab === "metrics" ? "overview" : r.tab;
    return `/v/${r.vertical}?tab=${tab}`;
  }
  if (canView("bb")) {
    if (bbSec && CLUSTER_TABS.includes(d.cluster)) return `/v/bb?tab=${encodeURIComponent(d.cluster)}&sec=${bbSec}`;
    if (bbSec) return `/v/bb?tab=all&sec=${bbSec}`;
    return `/v/bb?tab=${r.tab.startsWith("db_") ? "database" : r.tab === "metrics" ? "overview" : "policies"}`;
  }
  return null;
}

/**
 * ⌘K / Ctrl-K — search everything you can see: companies & records,
 * tasks, meetings, events, proposals. RLS keeps it scoped per person.
 */
export default function SearchPalette({ onClose }) {
  const router = useRouter();
  const { canView } = useApp();
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [busy, setBusy] = useState(false);
  const boxRef = useRef(null);

  const run = useCallback(async (term) => {
    if (term.trim().length < 2) return setResults([]);
    setBusy(true);
    const like = `%${term}%`;
    const [recs, people, tasks, meets, evts] = await Promise.all([
      supabase.from("records").select("id,vertical,tab,data").ilike("data->>name", like).limit(8),
      supabase.from("records").select("id,vertical,tab,data").ilike("data->>contact_name", like).limit(5),
      supabase.from("tasks").select("id,title,vertical,status").ilike("title", like).limit(6),
      supabase.from("meetings").select("id,title,date").ilike("title", like).limit(5),
      supabase.from("events").select("id,name,date,vertical").ilike("name", like).limit(5),
    ]);
    const recs2 = await supabase.from("records").select("id,vertical,tab,data")
      .ilike("data->>title", like).eq("tab", "proposals").limit(5);
    const out = [
      ...(recs.data || []).map((r) => ({
        icon: Building2, label: r.data?.name,
        sub: `${vName(r.vertical)} · ${r.tab.replace("db_", "database — ")}${r.data?.cluster ? ` · ${r.data.cluster}` : ""}`,
        go: linkFor(r, canView),
      })),
      ...(people.data || []).map((r) => ({
        icon: UserRound, label: r.data?.contact_name, sub: `Contact · ${r.data?.name || ""}${r.data?.contact_designation ? ` · ${r.data.contact_designation}` : ""}`,
        go: linkFor(r, canView),
      })),
      ...(recs2.data || []).map((r) => ({
        icon: FileText, label: r.data?.title, sub: `${vName(r.vertical)} · proposal`,
        go: r.vertical === "bb" || (!canView(r.vertical) && canView("bb")) ? "/v/bb?tab=all" : canView(r.vertical) ? `/v/${r.vertical}?tab=proposals` : null,
      })),
      ...(tasks.data || []).map((t) => ({
        icon: ListTodo, label: t.title, sub: `Task · ${vName(t.vertical)} · ${t.status}`, go: "/tasks",
      })),
      ...(meets.data || []).map((m) => ({
        icon: Presentation, label: m.title, sub: `Meeting · ${m.date || "TBD"}`, go: "/meetings",
      })),
      ...(evts.data || []).map((e) => ({
        icon: CalendarDays, label: e.name, sub: `Event · ${e.date || "TBD"}`, go: "/calendar",
      })),
    ].filter((r) => r.label);
    setResults(out);
    setBusy(false);
  }, [canView]);

  useEffect(() => {
    const t = setTimeout(() => run(q), 220);
    return () => clearTimeout(t);
  }, [q, run]);

  useEffect(() => {
    const fn = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [onClose]);

  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{ alignItems: "flex-start", paddingTop: "12vh" }}>
      <div className="modal" ref={boxRef} style={{ maxWidth: 560, width: "92%", padding: 0, overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", borderBottom: "1px solid var(--line)" }}>
          <Search size={16} style={{ color: "var(--faint)" }} />
          <input autoFocus placeholder="Search companies, tasks, meetings, events, proposals…"
            value={q} onChange={(e) => setQ(e.target.value)}
            style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 14.5 }} />
          <span style={{ fontSize: 10.5, color: "var(--faint)", border: "1px solid var(--line2)", borderRadius: 5, padding: "2px 6px" }}>esc</span>
        </div>
        <div style={{ maxHeight: 380, overflowY: "auto", padding: 7 }}>
          {busy && <div className="loadingrow">Searching…</div>}
          {!busy && q.length >= 2 && results.length === 0 && <div className="loadingrow">No matches for “{q}”.</div>}
          {!busy && results.map((r, i) => {
            const I = r.icon;
            return (
              <button key={i} className="menuitem" style={{ opacity: r.go ? 1 : 0.6 }}
                onClick={() => { if (r.go) { router.push(r.go); onClose(); } }}>
                <I size={15} style={{ color: "var(--brand)", flex: "0 0 auto" }} />
                <span style={{ flex: 1, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.label}</span>
                <span style={{ fontSize: 11, color: "var(--faint)", whiteSpace: "nowrap" }}>{r.sub}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
