"use client";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, Settings2, Trash2, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useApp } from "@/lib/ctx";
import {
  VERTICALS, BB_CLUSTERS, CLUSTER_TABS, BB_SECTIONS, CUSTOM_COL_TYPES,
  customSection, cShort, metricsTab,
} from "@/lib/schemas";
import { fmt } from "@/lib/util";
import Counters from "./Counters";
import DataTable from "./DataTable";
import PolicyHub from "./PolicyHub";
import EventsTable from "./EventsTable";
import TasksPanel from "./TasksPanel";
import ProposalsBoard from "./ProposalsBoard";
import ContactsDirectory from "./ContactsDirectory";
import Modal from "./Modal";

const inBB = (d) => BB_CLUSTERS.includes(d.cluster);
const srcOf = (t) => t.sources || [{ vertical: t.home, tab: t.key }];
const matches = (sec, r) =>
  srcOf(sec.tabDef).some((s) => s.vertical === r.vertical && s.tab === r.tab) &&
  (!sec.tabDef.filter || sec.tabDef.filter(r.data || {}));
// Jobs adds up; every other section counts entries
const statOf = (sec, rows) => sec.key === "jobs"
  ? rows.reduce((a, r) => a + (Number(r.data?.jobs) || 0), 0)
  : rows.length;
const GLANCE = ["new", "expansions", "jobs", "pipeline", "dcs", "awareness"];

export default function BBView() {
  const v = VERTICALS.bb;
  const { fy, canWrite } = useApp();
  const searchParams = useSearchParams();
  const urlTab = searchParams.get("tab");
  const urlSec = searchParams.get("sec");
  // Proposals now sit at the top of "All clusters"; keep old links working
  const [tab, setTab] = useState(urlTab === "proposals" ? "all" : urlTab || "overview");
  const [focus, setFocus] = useState(urlSec || null);
  useEffect(() => { if (urlTab) setTab(urlTab === "proposals" ? "all" : urlTab); if (urlSec) setFocus(urlSec); }, [urlTab, urlSec]);

  const [mirror, setMirror] = useState(null);
  const [defs, setDefs] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [revealed, setRevealed] = useState({});   // scope → section keys shown while empty
  const [editDef, setEditDef] = useState(null);   // custom section being created / edited

  const load = useCallback(async () => {
    const tabs = [...new Set(BB_SECTIONS.flatMap((s) => srcOf(s.tabDef).map((x) => x.tab)))];
    const [r, d, t] = await Promise.all([
      supabase.from("records").select("id,vertical,tab,data").eq("fy", fy)
        .or(`tab.in.(${tabs.join(",")}),tab.like.cs_*`),
      supabase.from("records").select("id,vertical,data,created_at")
        .eq("vertical", "bb").eq("tab", "bb_sections").order("created_at"),
      supabase.from("tasks").select("cluster,status").eq("vertical", "bb"),
    ]);
    setMirror(r.data || []); setDefs(d.data || []); setTasks(t.data || []);
  }, [fy]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const ch = supabase.channel("bb-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "records" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, load)
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, [load]);

  const sections = useMemo(() => [...BB_SECTIONS, ...defs.map(customSection)], [defs]);
  const statFor = useCallback((sec, pred) =>
    statOf(sec, (mirror || []).filter((r) => matches(sec, r) && pred(r.data || {}))), [mirror]);

  const reveal = (scope, key) => setRevealed((m) => ({ ...m, [scope]: [...new Set([...(m[scope] || []), key])] }));
  const jumpTo = (scope, key) => { setTab(scope); setFocus(key); };

  const glance = useMemo(() => {
    const byKey = Object.fromEntries(sections.map((s) => [s.key, s]));
    const out = {};
    CLUSTER_TABS.forEach((c) => {
      out[c] = {
        stats: GLANCE.map((k) => [byKey[k].label, statFor(byKey[k], (d) => d.cluster === c), k]),
        companies: ["new", "expansions", "pipeline"].reduce((a, k) => a + statFor(byKey[k], (d) => d.cluster === c), 0),
        openTasks: tasks.filter((t) => t.cluster === c && t.status !== "done").length,
      };
    });
    return out;
  }, [sections, statFor, tasks]);

  const canManage = canWrite("bb");
  const sectionProps = {
    sections, mirror, revealed, reveal, focus, clearFocus: () => setFocus(null),
    color: v.color, canManage, statFor, onNewSection: () => setEditDef({}), onEditSection: setEditDef,
  };

  return (
    <>
      <div className="card pad" style={{ display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap", borderLeft: `4px solid ${v.color}` }}>
        <div style={{ fontFamily: "var(--display)", fontSize: 21, fontWeight: 700 }}>{v.name}</div>
      </div>

      <div className="tabbar">
        <button className={`tab ${tab === "overview" ? "on" : ""}`} onClick={() => setTab("overview")}>Overview</button>
        <button className={`tab ${tab === "all" ? "on" : ""}`} onClick={() => setTab("all")}>All clusters</button>
        {CLUSTER_TABS.map((c) => (
          <button key={c} className={`tab ${tab === c ? "on" : ""}`} onClick={() => setTab(c)}>
            {cShort(c)} {glance[c]?.companies ? <span className="count">{glance[c].companies}</span> : null}
          </button>
        ))}
        <button className={`tab ${tab === "policies" ? "on" : ""}`} onClick={() => setTab("policies")}>Policies</button>
        <button className={`tab ${tab === "metrics" ? "on" : ""}`} onClick={() => setTab("metrics")}>Numbers</button>
        <button className={`tab ${tab === "database" ? "on" : ""}`} onClick={() => setTab("database")}>Database</button>
      </div>

      {tab === "overview" && (
        <>
          <Counters vertical="bb" color={v.color} onJump={(n) => jumpTo("all", n.sec)} />
          <div className="section-title">Clusters</div>
          <div className="vgrid">
            {CLUSTER_TABS.map((c) => {
              const g = glance[c];
              const stats = g.stats.filter(([, n]) => n);
              return (
                <div key={c} className="card kpi" style={{ borderTop: `3px solid ${v.color}` }} onClick={() => setTab(c)}>
                  <div style={{ fontWeight: 700, fontSize: 14.5 }}>{c}</div>
                  {stats.length === 0 ? (
                    <div style={{ fontSize: 12, color: "var(--faint)" }}>Nothing tracked yet</div>
                  ) : (
                    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                      {stats.map(([l, n, k]) => (
                        <button key={k} style={{ background: "none", border: "none", textAlign: "left", padding: 0 }}
                          onClick={(e) => { e.stopPropagation(); jumpTo(c, k); }}>
                          <div style={{ fontFamily: "var(--display)", fontSize: 20, fontWeight: 700 }}>{fmt(n)}</div>
                          <div style={{ fontSize: 10.5, color: "var(--faint)" }}>{l}</div>
                        </button>
                      ))}
                    </div>
                  )}
                  {g.openTasks > 0 && <div style={{ fontSize: 11.5, color: "var(--faint)" }}>{g.openTasks} open tasks</div>}
                </div>
              );
            })}
          </div>
          <TasksPanel vertical="bb" coreOnly title="Core team tasks" />
        </>
      )}

      {tab === "all" && (
        <>
          <SectionHead title="All clusters" {...sectionProps} scope="all" pred={inBB} />
          <ProposalsBoard vertical="bb" accentColor={v.color} includeMirrors />
          <Sections {...sectionProps} scope="all" />
        </>
      )}

      {CLUSTER_TABS.includes(tab) && (
        <>
          <SectionHead title={tab} {...sectionProps} scope={tab} pred={(d) => d.cluster === tab} facts />
          <ProposalsBoard key={`p-${tab}`} vertical="bb" accentColor={v.color} clusterFilter={tab} includeMirrors />
          <Sections key={`s-${tab}`} {...sectionProps} scope={tab} cluster={tab} />
          <EventsTable vertical="mkt" clusterFilter={tab} title={`${cShort(tab)} events`} />
          <TasksPanel vertical="bb" cluster={tab} title={`${cShort(tab)} tasks`} />
        </>
      )}

      {tab === "policies" && (
        <PolicyHub vertical="bb" hub={v.tabs[0]} accentColor={v.color}
          extraFilter={(d) => !d.cluster || BB_CLUSTERS.includes(d.cluster)} />
      )}

      {tab === "metrics" && <DataTable pageVertical="bb" tabDef={metricsTab("bb")} accentColor={v.color} />}

      {tab === "database" && <ContactsDirectory vertical="bb" accentColor={v.color} />}

      {editDef && (
        <CustomSectionModal row={editDef.id ? editDef : null} cluster={CLUSTER_TABS.includes(tab) ? tab : null}
          onClose={() => setEditDef(null)}
          onSaved={(key) => { setEditDef(null); load(); if (key) reveal(CLUSTER_TABS.includes(tab) ? tab : "all", key); }} />
      )}
    </>
  );
}

/** Title row: cluster name, a few headline numbers, and the "Add section" menu. */
function SectionHead({ title, scope, pred, facts, sections, statFor, revealed, reveal, canManage, onNewSection }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);
  const shown = (s) => statFor(s, pred) > 0 || (revealed[scope] || []).includes(s.key);
  const hidden = sections.filter((s) => !shown(s));
  const headline = facts
    ? sections.filter((s) => GLANCE.includes(s.key)).map((s) => [s.label, statFor(s, pred)]).filter(([, n]) => n)
    : [];

  return (
    <div className="sechead">
      <h2>{title}</h2>
      {headline.length > 0 && (
        <div className="facts">
          {headline.map(([l, n]) => <span key={l}><b>{fmt(n)}</b> {l.toLowerCase()}</span>)}
        </div>
      )}
      {canManage && (
        <div className="dropwrap" ref={ref}>
          <button className="btn sm" onClick={() => setOpen((o) => !o)}><Plus size={13} /> Add section</button>
          {open && (
            <div className="dropmenu">
              {hidden.length > 0 && <div className="dlabel">Show a section</div>}
              {hidden.map((s) => (
                <button key={s.key} className="menuitem" onClick={() => { reveal(scope, s.key); setOpen(false); }}>
                  {s.label}{s.custom && <span className="n">custom</span>}
                </button>
              ))}
              {hidden.length > 0 && <div style={{ borderTop: "1px solid var(--line)", margin: "6px 0" }} />}
              <button className="menuitem" onClick={() => { setOpen(false); onNewSection(); }}>
                <Plus size={14} /> New section with your own columns…
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** The sections, in order. Empty ones stay hidden unless picked from "Add section". */
function Sections({ scope, cluster, sections, mirror, revealed, focus, clearFocus, reveal, color, canManage, statFor, onEditSection }) {
  const pred = cluster ? (d) => d.cluster === cluster : inBB;

  // Jumped here from a tile: make sure the section is visible, then scroll to it.
  useEffect(() => {
    if (!focus || !mirror) return;
    const target = sections.find((s) => s.key === focus);
    if (target && statFor(target, pred) === 0) reveal(scope, focus);
    const t1 = setTimeout(() => document.getElementById(`bbsec-${focus}`)?.scrollIntoView({ behavior: "smooth", block: "start" }), 350);
    const t2 = setTimeout(clearFocus, 2000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focus, mirror === null]);

  if (!mirror) return <div className="loadingrow">Loading…</div>;
  const visible = sections.filter((s) => statFor(s, pred) > 0 || (revealed[scope] || []).includes(s.key) || focus === s.key);
  if (!visible.length)
    return <div className="card empty">Nothing tracked here yet. Use “Add section” to start one.</div>;

  return visible.map((s) => (
    <DataTable key={`${scope}-${s.key}`} id={`bbsec-${s.key}`} className={focus === s.key ? "flash" : ""}
      pageVertical="bb" tabDef={s.tabDef} accentColor={color} title={s.label}
      defaults={{ ...(s.defaults || {}), ...(cluster ? { cluster } : {}) }}
      hideCols={cluster ? ["cluster"] : []}
      extraFilter={pred}
      headExtra={s.custom && canManage ? (
        <button className="btn sm ghost" title="Edit section" onClick={() => onEditSection({ id: s.defId, data: s.def })}>
          <Settings2 size={13} />
        </button>
      ) : null} />
  ));
}

const slug = (t) => String(t || "").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "").slice(0, 30) || "col";

/** Create or edit a custom section: its name and the columns it needs. */
function CustomSectionModal({ row, cluster, onClose, onSaved }) {
  const { notify, profile } = useApp();
  const init = row?.data || {};
  const [name, setName] = useState(init.name || "");
  const [hasContact, setHasContact] = useState(!!init.hasContact);
  const [cols, setCols] = useState(() => (init.columns?.length ? init.columns : [
    { key: "", label: "Name", type: "text" },
    { key: "", label: "Notes", type: "textarea" },
  ]).map((c) => ({ ...c, options: Array.isArray(c.options) ? c.options.join(", ") : c.options || "" })));
  const [busy, setBusy] = useState(false);
  const set = (i, k, val) => setCols((cs) => cs.map((c, j) => (j === i ? { ...c, [k]: val } : c)));

  async function save() {
    if (!name.trim()) return notify("Give the section a name");
    const named = cols.filter((c) => c.label.trim());
    if (!named.length) return notify("Add at least one column");
    const used = new Set(["cluster"]);
    const columns = named.map((c) => {
      let key = c.key || slug(c.label);
      while (used.has(key)) key = `${key}_2`;
      used.add(key);
      return {
        key, label: c.label.trim(), type: c.type,
        ...(c.type === "select" ? { options: String(c.options).split(",").map((o) => o.trim()).filter(Boolean) } : {}),
      };
    });
    const key = init.key || `cs_${slug(name)}_${Math.random().toString(36).slice(2, 6)}`;
    const data = {
      ...init, name: name.trim(), key, columns, hasContact,
      cluster: init.cluster || (profile?.role === "cluster_head" ? profile.cluster : cluster) || null,
    };
    setBusy(true);
    const res = row
      ? await supabase.from("records").update({ data }).eq("id", row.id)
      : await supabase.from("records").insert([{ vertical: "bb", tab: "bb_sections", data }]);
    setBusy(false);
    if (res.error) return notify(res.error.message);
    notify(row ? "Section updated" : "Section added");
    onSaved(key);
  }

  async function remove() {
    const { count } = await supabase.from("records").select("id", { count: "exact", head: true }).eq("tab", init.key);
    if (!window.confirm(`Delete “${init.name}”${count ? ` and its ${count} entries` : ""}? This can't be undone.`)) return;
    if (count) {
      const { error } = await supabase.from("records").delete().eq("tab", init.key);
      if (error) return notify(error.message);
    }
    const { error } = await supabase.from("records").delete().eq("id", row.id);
    if (error) return notify(error.message);
    notify("Section deleted");
    onSaved(null);
  }

  return (
    <Modal title={row ? "Edit section" : "New section"} onClose={onClose} wide
      footer={<>
        {row && <button className="btn sm danger" style={{ marginRight: "auto" }} onClick={remove}><Trash2 size={13} /> Delete section</button>}
        <button className="btn sm" onClick={onClose}>Cancel</button>
        <button className="btn sm primary" disabled={busy} onClick={save}>{row ? "Save" : "Add section"}</button>
      </>}>
      <div className="field">
        <label>Section name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Land parcels, Colleges, Incubators" autoFocus />
      </div>
      <div className="subhead">Columns</div>
      <div style={{ fontSize: 12, color: "var(--faint)", marginTop: -8 }}>
        The first column is the entry's name and is required. Cluster is added automatically.
      </div>
      {cols.map((c, i) => (
        <div key={i} className="colrow">
          <input style={{ padding: "8px 10px", border: "1px solid var(--line2)", borderRadius: 9, background: "var(--inset)" }}
            value={c.label} placeholder={i === 0 ? "Name column (required)" : "Column name"} onChange={(e) => set(i, "label", e.target.value)} />
          <select style={{ padding: "8px 10px", border: "1px solid var(--line2)", borderRadius: 9, background: "var(--inset)" }}
            value={c.type} onChange={(e) => set(i, "type", e.target.value)}>
            {CUSTOM_COL_TYPES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </select>
          {c.type === "select" ? (
            <input style={{ padding: "8px 10px", border: "1px solid var(--line2)", borderRadius: 9, background: "var(--inset)" }}
              value={c.options} placeholder="Options, comma-separated" onChange={(e) => set(i, "options", e.target.value)} />
          ) : <span />}
          <button className="btn sm ghost" disabled={i === 0} title="Remove column"
            onClick={() => setCols((cs) => cs.filter((_, j) => j !== i))}><X size={13} /></button>
        </div>
      ))}
      <button className="btn sm" style={{ alignSelf: "flex-start" }}
        onClick={() => setCols((cs) => [...cs, { key: "", label: "", type: "text", options: "" }])}>
        <Plus size={13} /> Add column
      </button>
      <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13 }}>
        <input type="checkbox" checked={hasContact} onChange={(e) => setHasContact(e.target.checked)} />
        Include contact person fields (name, designation, phone, email, LinkedIn)
      </label>
    </Modal>
  );
}
