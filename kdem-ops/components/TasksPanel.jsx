"use client";
import { Fragment, useEffect, useMemo, useState, useCallback } from "react";
import { Plus, Trash2, Presentation, CalendarCheck, Lock, Users, ChevronRight, ChevronDown, ArrowUp, ArrowDown, CornerDownRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useApp } from "@/lib/ctx";
import { SCOPES, VERTICAL_KEYS, BB_CLUSTERS, CLUSTER_TABS, TASK_VISIBILITIES, vColor, vName, cShort } from "@/lib/schemas";
import { todayISO } from "@/lib/util";
import Modal from "./Modal";
import Pill from "./Pill";
import Attachments from "./Attachments";
import { useSort } from "@/lib/sort";

/**
 * Tasks with sub-tasks. A task is an initiative or activity (free-text
 * topic, no fixed categories); its sub-tasks are the actions, each with its
 * own owner, deadline, status and notes. Rows keep one line — notes are
 * clipped like an Excel cell (hover to read, click to edit) and the table
 * scrolls sideways. Order is manual (arrows or type a position) unless a
 * column header is clicked to sort.
 *
 * Modes:  vertical — that vertical (+ tasks shared into it)
 *         cluster  — one BB cluster      coreOnly — BB tasks with no cluster
 *         strategic — only Strategic tasks (otherwise they're left out)
 * Row-level security decides what each person can see.
 */
export default function TasksPanel({ vertical = null, cluster = null, coreOnly = false, strategic = false, title = "Tasks" }) {
  const { canWrite, notify, profile } = useApp();
  const [rows, setRows] = useState([]);
  const [team, setTeam] = useState([]);
  useEffect(() => {
    supabase.from("profiles").select("id,name").order("name").then(({ data }) =>
      setTeam((data || []).filter((p) => p.name)));
  }, []);
  const [filter, setFilter] = useState("open");
  // BB task tables: a cluster head starts on their own cluster
  const [clusterView, setClusterView] = useState(profile?.role === "cluster_head" && !strategic ? profile.cluster || "" : "");
  const [editing, setEditing] = useState(null);
  const [collapsed, setCollapsed] = useState({});

  const load = useCallback(async () => {
    let qy = supabase.from("tasks").select("*");
    if (cluster) qy = qy.eq("cluster", cluster);
    if (coreOnly) qy = qy.eq("vertical", "bb").is("cluster", null);
    else if (vertical && !cluster) qy = qy.or(`vertical.eq.${vertical},verticals.cs.{${vertical}}` +
      (vertical === "bb" && profile?.role === "cluster_head" && profile.cluster ? `,cluster.eq.${profile.cluster}` : ""));
    qy = qy.eq("strategic", !!strategic);
    const { data } = await qy;
    setRows(data || []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vertical, cluster, coreOnly, strategic]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const ch = supabase.channel(`tasks-${vertical || "all"}-${cluster || "x"}-${coreOnly}-${strategic}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, () => load())
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, [vertical, cluster, coreOnly, strategic, load]);

  // Manual order first (sort_order), then deadline, then title
  const byOrder = (a, b) =>
    (a.sort_order ?? 1e9) - (b.sort_order ?? 1e9) ||
    String(a.due_date || "9999").localeCompare(String(b.due_date || "9999")) ||
    String(a.title).localeCompare(String(b.title));
  const children = useMemo(() => {
    const m = {};
    rows.filter((t) => t.parent_id).forEach((t) => { (m[t.parent_id] = m[t.parent_id] || []).push(t); });
    Object.values(m).forEach((l) => l.sort(byOrder));
    return m;
  }, [rows]);
  const parentIds = useMemo(() => new Set(rows.map((t) => t.id)), [rows]);

  const top = useMemo(() => {
    // A sub-task whose parent isn't visible to this person shows on its own
    let out = rows.filter((t) => !t.parent_id || !parentIds.has(t.parent_id));
    // One cluster = its own tasks + BB tasks for all clusters + tasks from other verticals
    if (clusterView && !cluster) out = out.filter((t) => t.cluster === clusterView || !t.cluster || t.vertical !== "bb");
    const open = (t) => t.status !== "done" || (children[t.id] || []).some((c) => c.status !== "done");
    if (filter === "open") out = out.filter(open);
    if (filter === "done") out = out.filter((t) => !open(t));
    return [...out].sort(byOrder);
  }, [rows, parentIds, children, filter, clusterView, cluster]);

  const RANK = { high: 0, medium: 1, low: 2, todo: 0, inprogress: 1, done: 2 };
  const { sorted, th } = useSort(top, {
    task: (t) => t.title, priority: (t) => RANK[t.priority], status: (t) => RANK[t.status],
    cross: (t) => [...new Set([t.vertical, ...(t.verticals || [])])].filter((v) => v !== "bb").map(vName).join(", "),
    cluster: (t) => t.cluster || "Core",
    due: (t) => (t.due_date ? `${t.due_date} ${t.due_time || ""}` : ""),
  });
  const headerSorted = sorted !== top;

  // Mirrors the SQL policy
  const canEditTask = (t) =>
    t.created_by === profile.id || (t.assignee && t.assignee === profile.name) ||
    (t.shared_with || []).includes(profile.id) ||
    (!t.strategic && profile.role === "cluster_head" && t.cluster && t.cluster === profile.cluster) ||
    (!t.strategic && t.visibility !== "private" && canWrite(t.vertical) &&
      (profile.role !== "cluster_head" || (t.cluster || "") === profile.cluster));

  async function save(f, id, stayOpen = false) {
    const payload = {
      title: f.title, vertical: f.vertical, verticals: f.verticals || [],
      cluster: f.cluster || null, assignee: f.assignee || "", topic: f.topic || "",
      priority: f.priority, status: f.status, due_date: f.due_date || null, due_time: f.due_time || "",
      visibility: f.visibility || "vertical", notes: f.notes || "",
      parent_id: f.parent_id || null, strategic: !!f.strategic, shared_with: f.shared_with || [],
    };
    if (!id) {
      // New items go to the end of their list
      const sibs = rows.filter((t) => (t.parent_id || null) === payload.parent_id);
      payload.sort_order = sibs.reduce((m, t) => Math.max(m, t.sort_order || 0), 0) + 1;
    }
    const res = id
      ? await supabase.from("tasks").update(payload).eq("id", id)
      : await supabase.from("tasks").insert([payload]).select().single();
    if (res.error) { notify(res.error.message); return null; }
    notify("Saved"); load();
    if (!stayOpen) setEditing(null);
    return res.data;
  }
  async function remove(t) {
    const n = (children[t.id] || []).length;
    if (n && !window.confirm(`Delete “${t.title}” and its ${n} sub-task${n > 1 ? "s" : ""}?`)) return;
    const { error } = await supabase.from("tasks").delete().eq("id", t.id);
    notify(error ? error.message : "Deleted"); setEditing(null); load();
  }
  async function cycleStatus(t) {
    if (!canEditTask(t)) return;
    const next = t.status === "todo" ? "inprogress" : t.status === "inprogress" ? "done" : "todo";
    await supabase.from("tasks").update({ status: next }).eq("id", t.id);
    load();
  }

  // Move an item to position `to` (1-based) in its list; the rest renumber
  async function moveTo(list, t, to) {
    const from = list.findIndex((x) => x.id === t.id);
    const target = Math.max(0, Math.min(list.length - 1, (Number(to) || 1) - 1));
    if (from < 0 || from === target) return;
    const next = [...list];
    next.splice(target, 0, next.splice(from, 1)[0]);
    setRows((rs) => rs.map((r) => { const i = next.findIndex((x) => x.id === r.id); return i >= 0 ? { ...r, sort_order: i + 1 } : r; }));
    const changed = next.map((x, i) => [x, i + 1]).filter(([x, n]) => x.sort_order !== n);
    const res = await Promise.all(changed.map(([x, n]) => supabase.from("tasks").update({ sort_order: n }).eq("id", x.id)));
    if (res.some((r) => r.error)) notify("Some items couldn't be moved — you may not have edit rights on them");
    load();
  }

  const defaults = {
    vertical: vertical || profile?.vertical || VERTICAL_KEYS[0],
    cluster: strategic ? null : cluster || (profile?.role === "cluster_head" ? profile.cluster : clusterView || null),
    priority: "medium", status: "todo", visibility: strategic ? "private" : "vertical", verticals: [],
    strategic, shared_with: [], topic: "",
  };
  const subDefaults = (p) => ({
    parent_id: p.id, parentTitle: p.title, vertical: p.vertical, verticals: p.verticals || [], cluster: p.cluster,
    topic: p.topic || "", visibility: p.visibility, strategic: p.strategic, shared_with: p.shared_with || [],
    priority: "medium", status: "todo",
  });
  const topics = useMemo(() => [...new Set(rows.map((t) => t.topic).filter(Boolean))].sort(), [rows]);
  const overdue = (t) => t.due_date && t.status !== "done" && t.due_date < todayISO();
  const showVerticalCol = !vertical && !coreOnly;
  // Beyond Bengaluru tables: cluster instead of owner, the other verticals
  // a task is shared with instead of "Beyond Bengaluru"
  const bbMode = vertical === "bb" || coreOnly;
  const crossOf = (t) => [...new Set([t.vertical, ...(t.verticals || [])])].filter((v) => v !== "bb");
  const showClusterCol = (vertical === "bb" || coreOnly || !!cluster) && !strategic;
  const anyKids = top.some((t) => (children[t.id] || []).length);

  const renderRow = (t, list, idx, sub = false) => {
    const kids = children[t.id] || [];
    const isOpen = !collapsed[t.id];
    const editable = canEditTask(t);
    return (
      <tr key={t.id} className={`${sub ? "subrow" : ""} ${t.status === "done" ? "isdone" : ""}`}
        onClick={() => setEditing(sub ? { ...t, parentTitle: rows.find((r) => r.id === t.parent_id)?.title } : t)}>
        <td className="ordcell" onClick={(e) => e.stopPropagation()}>
          {!headerSorted && editable ? (
            <span className="ord">
              <input type="number" min={1} max={list.length} defaultValue={idx + 1} key={`${t.id}-${idx}`}
                onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }}
                onBlur={(e) => Number(e.target.value) !== idx + 1 && moveTo(list, t, e.target.value)} title="Type a position" />
              <span className="arrows">
                <button disabled={idx === 0} onClick={() => moveTo(list, t, idx)} title="Move up"><ArrowUp size={11} /></button>
                <button disabled={idx === list.length - 1} onClick={() => moveTo(list, t, idx + 2)} title="Move down"><ArrowDown size={11} /></button>
              </span>
            </span>
          ) : <span style={{ color: "var(--faint)", fontSize: 11.5 }}>{idx + 1}</span>}
        </td>
        <td className="taskcell" title={t.title}>
          <span className="tt">
            {sub ? <CornerDownRight size={12} className="subicon" /> : kids.length ? (
              <button className="caret" onClick={(e) => { e.stopPropagation(); setCollapsed((c) => ({ ...c, [t.id]: isOpen })); }}>
                {isOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
              </button>
            ) : anyKids ? <span className="caret" /> : null}
            {t.meeting_id && <Presentation size={12} style={{ color: "var(--brand)", marginRight: 5 }} />}
            {t.event_id && <CalendarCheck size={12} style={{ color: "var(--gold)", marginRight: 5 }} />}
            {(t.visibility === "private" || t.strategic) && <Lock size={11} style={{ color: "var(--faint)", marginRight: 5 }} />}
            {t.visibility === "team" && <Users size={11} style={{ color: "var(--faint)", marginRight: 5 }} />}
            <span className={sub ? "subtitle" : "maintitle"}>{t.title}</span>
            {sub && bbMode && t.assignee && <span className="ownertag">{t.assignee}</span>}
            {!sub && kids.length > 0 && (
              <span className="kidcount">{kids.filter((k) => k.status === "done").length}/{kids.length}</span>
            )}
            {!sub && editable && (
              <button className="addsub" title="Add a sub-task" onClick={(e) => { e.stopPropagation(); setEditing(subDefaults(t)); }}>
                <Plus size={11} /> Sub-task
              </button>
            )}
          </span>
        </td>
        <td className="clip" style={{ color: "var(--muted)", maxWidth: 150 }} title={t.topic || ""}>{sub ? "" : t.topic || "—"}</td>
        {showVerticalCol && (
          <td>{!sub && <span className="pill" style={{ color: vColor(t.vertical), background: `${vColor(t.vertical)}1c` }}>{vName(t.vertical)}</span>}</td>
        )}
        {showClusterCol && !cluster && <td style={{ color: "var(--muted)", fontSize: 12.5 }}>{sub ? "" : t.cluster ? cShort(t.cluster) : "Core"}</td>}
        {bbMode && !strategic ? (
          <td>{!sub && (crossOf(t).length ? crossOf(t).map((v) => (
            <span key={v} className="pill" style={{ color: vColor(v), background: `${vColor(v)}1c`, marginRight: 4 }}>{vName(v)}</span>
          )) : <span style={{ color: "var(--faint)" }}>—</span>)}</td>
        ) : null}
        {!bbMode && <td className="clip" style={{ color: "var(--muted)", maxWidth: 160 }} title={t.assignee || ""}>{t.assignee || "—"}</td>}
        <td><Pill value={t.priority} /></td>
        <td onClick={(e) => { e.stopPropagation(); cycleStatus(t); }}>
          <Pill value={t.status === "done" ? "Done" : t.status === "inprogress" ? "In progress" : "todo"} />
        </td>
        <td style={{ color: overdue(t) ? "var(--bad)" : "var(--muted)", fontFamily: "var(--mono)", fontSize: 12 }}>
          {t.due_date || "—"}{t.due_time ? ` ${t.due_time}` : ""}
        </td>
        <td className="clip notescell" title={t.notes || ""}>{t.notes || <span style={{ color: "var(--faint)" }}>—</span>}</td>
      </tr>
    );
  };

  return (
    <div className="card">
      <div className="card-head">
        <div><div className="t">{title}</div></div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 7, alignItems: "center", flexWrap: "wrap" }}>
          {(vertical === "bb" || coreOnly) && !cluster && !strategic && (
            <select className="filtersel" value={clusterView} onChange={(e) => setClusterView(e.target.value)}>
              <option value="">All clusters</option>
              {CLUSTER_TABS.map((c) => <option key={c} value={c}>{cShort(c)}</option>)}
            </select>
          )}
          {anyKids && (
            <button className="btn sm ghost" onClick={() => {
              const allClosed = top.every((t) => collapsed[t.id] || !(children[t.id] || []).length);
              setCollapsed(allClosed ? {} : Object.fromEntries(top.map((t) => [t.id, true])));
            }}>
              {top.every((t) => collapsed[t.id] || !(children[t.id] || []).length) ? "Expand all" : "Collapse all"}
            </button>
          )}
          {["open", "done", "all"].map((f) => (
            <button key={f} className={`btn sm ${filter === f ? "primary" : "ghost"}`} onClick={() => setFilter(f)}>
              {f[0].toUpperCase() + f.slice(1)}
            </button>
          ))}
          <button className="btn sm primary" onClick={() => setEditing(defaults)}>
            <Plus size={13} /> Add task
          </button>
        </div>
      </div>

      {top.length === 0 ? (
        <div className="empty">No {filter === "all" ? "" : filter} tasks here.</div>
      ) : (
        <div className="tablewrap">
          <table className="data tasks">
            <thead>
              <tr>
                <th title="Order — use the arrows or type a position">#</th>
                <th {...th("task")}>Task</th>
                <th {...th("topic")}>Topic</th>
                {showVerticalCol && <th {...th("vertical")}>Vertical</th>}
                {showClusterCol && !cluster && <th {...th("cluster")}>Cluster</th>}
                {bbMode && !strategic && <th {...th("cross")}>Cross-vertical</th>}
                {!bbMode && <th {...th("assignee")}>Owner</th>}
                <th {...th("priority")}>Priority</th>
                <th {...th("status")}>Status</th><th {...th("due")}>Deadline</th>
                <th {...th("notes")}>Notes</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((t, i) => (
                <Fragment key={t.id}>
                  {renderRow(t, top, headerSorted ? i : top.indexOf(t))}
                  {!collapsed[t.id] && (children[t.id] || []).map((c, j) => renderRow(c, children[t.id], j, true))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <TaskModal task={editing} editableFn={canEditTask} team={team} topics={topics}
          kids={editing.id ? children[editing.id] || [] : []}
          lockVertical={!!vertical && vertical !== "bb"} lockCluster={!!cluster}
          onSave={save} onDelete={remove} onClose={() => setEditing(null)} notify={notify}
          onAddSub={(p) => setEditing(subDefaults(p))} onOpen={(t) => setEditing(t)} />
      )}
    </div>
  );
}

function TaskModal({ task, editableFn, team, topics, kids, lockVertical, lockCluster, onSave, onDelete, onClose, notify, onAddSub, onOpen }) {
  const [f, setF] = useState({ verticals: [], shared_with: [], ...task });
  const [savedId, setSavedId] = useState(task.id || null);
  const isSub = !!f.parent_id;
  async function ensureId() {
    if (savedId) return savedId;
    if (!f.title) return null;
    const row = await onSave(f, null, true);
    if (row?.id) setSavedId(row.id);
    return row?.id || null;
  }
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }));
  const editable = task.id ? editableFn(task) : true;
  const toggleV = (v) =>
    set("verticals", (f.verticals || []).includes(v) ? f.verticals.filter((x) => x !== v) : [...(f.verticals || []), v]);
  const toggleP = (id) =>
    set("shared_with", (f.shared_with || []).includes(id) ? f.shared_with.filter((x) => x !== id) : [...(f.shared_with || []), id]);

  return (
    <Modal title={isSub ? (task.id ? "Sub-task" : "New sub-task") : task.id ? "Task" : "New task"} onClose={onClose} wide
      footer={
        <>
          {task.id && editable && (
            <button className="btn sm danger" style={{ marginRight: "auto" }} onClick={() => onDelete(task)}>
              <Trash2 size={13} /> Delete
            </button>
          )}
          <button className="btn sm" onClick={onClose}>Cancel</button>
          {editable && <button className="btn sm primary" onClick={() => f.title && onSave(f, savedId)}>Save</button>}
        </>
      }>
      {isSub && <div style={{ fontSize: 12.5, color: "var(--muted)" }}>Part of: <b>{f.parentTitle || "a task"}</b></div>}
      <div className="field"><label>{isSub ? "Action" : "Task / initiative"}</label>
        <input value={f.title ?? ""} onChange={(e) => set("title", e.target.value)} disabled={!editable} autoFocus /></div>
      <div className="grid2">
        {!isSub && (
          <div className="field"><label>Topic (optional — any name)</label>
            <input list="kdem-topics" value={f.topic ?? ""} onChange={(e) => set("topic", e.target.value)} disabled={!editable}
              placeholder="e.g. GTC, Data Centre, Company onboarding" />
            <datalist id="kdem-topics">{topics.map((t) => <option key={t} value={t} />)}</datalist></div>
        )}
        {!isSub && !f.strategic && (
          <div className="field"><label>Vertical (owner)</label>
            <select value={f.vertical} onChange={(e) => set("vertical", e.target.value)} disabled={!editable || lockVertical}>
              {SCOPES.map((k) => <option key={k} value={k}>{vName(k)}</option>)}
            </select></div>
        )}
        {!isSub && !f.strategic && f.vertical === "bb" && (
          <div className="field"><label>Cluster</label>
            <select value={f.cluster ?? ""} onChange={(e) => set("cluster", e.target.value || null)} disabled={!editable || lockCluster}>
              <option value="">All clusters / core team</option>
              {BB_CLUSTERS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select></div>
        )}
        <div className="field"><label>Owner</label>
          <input list="kdem-team" value={f.assignee ?? ""} onChange={(e) => set("assignee", e.target.value)} disabled={!editable} />
          <datalist id="kdem-team">{team.map((p) => <option key={p.id} value={p.name} />)}</datalist></div>
        <div className="field"><label>Priority</label>
          <select value={f.priority} onChange={(e) => set("priority", e.target.value)} disabled={!editable}>
            {["high", "medium", "low"].map((o) => <option key={o} value={o}>{o}</option>)}
          </select></div>
        <div className="field"><label>Status</label>
          <select value={f.status} onChange={(e) => set("status", e.target.value)} disabled={!editable}>
            <option value="todo">To do</option><option value="inprogress">In progress</option><option value="done">Done</option>
          </select></div>
        <div className="field"><label>Deadline</label>
          <input type="date" value={f.due_date ?? ""} onChange={(e) => set("due_date", e.target.value)} disabled={!editable} /></div>
        <div className="field"><label>Time (optional)</label>
          <input type="time" value={f.due_time ?? ""} onChange={(e) => set("due_time", e.target.value)} disabled={!editable} /></div>
        {!isSub && !f.strategic && (
          <div className="field"><label>Visible to</label>
            <select value={f.visibility || "vertical"} onChange={(e) => set("visibility", e.target.value)} disabled={!editable}>
              {TASK_VISIBILITIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select></div>
        )}
      </div>
      {!isSub && (f.strategic || f.visibility === "private") && (
        <div className="field"><label>Also shared with</label>
          <div className="chips">
            {team.map((p) => (
              <button key={p.id} type="button" disabled={!editable}
                className={`chip ${(f.shared_with || []).includes(p.id) ? "on" : ""}`} onClick={() => toggleP(p.id)}>{p.name}</button>
            ))}
          </div>
          <div style={{ fontSize: 11.5, color: "var(--faint)", marginTop: 5 }}>Only you and the people picked here can see it{f.strategic ? " (sub-tasks too)" : ""}.</div>
        </div>
      )}
      {!isSub && !f.strategic && (
        <div className="field"><label>Also visible in (cross-vertical)</label>
          <div className="chips">
            {SCOPES.filter((k) => k !== f.vertical).map((k) => (
              <button key={k} type="button" disabled={!editable}
                className={`chip ${(f.verticals || []).includes(k) ? "on" : ""}`} onClick={() => toggleV(k)}>
                {vName(k)}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="field"><label>{isSub ? "Notes" : "Background notes"}</label>
        <textarea value={f.notes ?? ""} onChange={(e) => set("notes", e.target.value)} disabled={!editable} style={{ minHeight: 90 }} /></div>

      {!isSub && task.id && (
        <>
          <div className="subhead">Sub-tasks · {kids.length}</div>
          {kids.map((k) => (
            <button key={k.id} className="docrow" style={{ border: "none", textAlign: "left", cursor: "pointer" }} onClick={() => onOpen({ ...k, parentTitle: task.title })}>
              <CornerDownRight size={13} style={{ color: "var(--faint)" }} />
              <span style={{ flex: 1 }}>{k.title}</span>
              <Pill value={k.status === "done" ? "Done" : k.status === "inprogress" ? "In progress" : "todo"} />
              <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)" }}>{k.due_date || ""}</span>
            </button>
          ))}
          {editable && (
            <button className="btn sm" style={{ alignSelf: "flex-start" }} onClick={() => onAddSub(task)}>
              <Plus size={13} /> Add sub-task
            </button>
          )}
        </>
      )}
      <Attachments folder="tasks" id={savedId} ensureId={ensureId} editable={editable} notify={notify} />
    </Modal>
  );
}
