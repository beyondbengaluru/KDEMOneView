"use client";
import { useEffect, useMemo, useState, useCallback } from "react";
import { Plus, Trash2, Presentation, CalendarCheck, Lock, Users } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useApp } from "@/lib/ctx";
import { SCOPES, VERTICAL_KEYS, BB_CLUSTERS, TASK_VISIBILITIES, vColor, vName } from "@/lib/schemas";
import { todayISO } from "@/lib/util";
import Modal from "./Modal";
import Pill from "./Pill";

/**
 * Task CRM. Modes:
 *  vertical      only that vertical (+ tasks shared INTO it via `verticals`)
 *  cluster       BB cluster head's tasks
 *  coreOnly      BB core team (cluster is null)
 * Row-level security decides what each person sees (private / vertical /
 * team / CEO) — the panel just renders what comes back.
 */
export default function TasksPanel({ vertical = null, cluster = null, coreOnly = false, title = "Tasks" }) {
  const { canWrite, notify, profile } = useApp();
  const [rows, setRows] = useState([]);
  const [team, setTeam] = useState([]);
  useEffect(() => {
    supabase.from("profiles").select("name").order("name").then(({ data }) =>
      setTeam((data || []).map((p) => p.name).filter(Boolean)));
  }, []);
  const [filter, setFilter] = useState("open");
  const [editing, setEditing] = useState(null);

  const load = useCallback(async () => {
    let qy = supabase.from("tasks").select("*").order("due_date", { ascending: true, nullsFirst: false });
    if (cluster) qy = qy.eq("cluster", cluster);
    if (coreOnly) qy = qy.eq("vertical", "bb").is("cluster", null);
    else if (vertical && !cluster) qy = qy.or(`vertical.eq.${vertical},verticals.cs.{${vertical}}`);
    const { data } = await qy;
    setRows(data || []);
  }, [vertical, cluster, coreOnly]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const ch = supabase.channel(`tasks-${vertical || "all"}-${cluster || "x"}-${coreOnly}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, () => load())
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, [vertical, cluster, coreOnly, load]);

  const filtered = useMemo(() => {
    if (filter === "open") return rows.filter((t) => t.status !== "done");
    if (filter === "done") return rows.filter((t) => t.status === "done");
    return rows;
  }, [rows, filter]);

  const canEditTask = (t) =>
    canWrite(t.vertical) && (profile.role !== "cluster_head" || (t.cluster || "") === profile.cluster);

  async function save(f, id) {
    const payload = {
      title: f.title, vertical: f.vertical, verticals: f.verticals || [],
      cluster: f.cluster || null, assignee: f.assignee || "",
      priority: f.priority, status: f.status, due_date: f.due_date || null, due_time: f.due_time || "",
      visibility: f.visibility || "vertical", notes: f.notes || "",
    };
    const res = id
      ? await supabase.from("tasks").update(payload).eq("id", id)
      : await supabase.from("tasks").insert([payload]);
    if (res.error) return notify(res.error.message);
    notify("Saved"); setEditing(null); load();
  }
  async function remove(id) {
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    notify(error ? error.message : "Deleted"); setEditing(null); load();
  }
  async function cycleStatus(t) {
    if (!canEditTask(t)) return;
    const next = t.status === "todo" ? "inprogress" : t.status === "inprogress" ? "done" : "todo";
    await supabase.from("tasks").update({ status: next }).eq("id", t.id);
    load();
  }

  const defaults = {
    vertical: vertical || profile?.vertical || VERTICAL_KEYS[0],
    cluster: cluster || (profile?.role === "cluster_head" ? profile.cluster : null),
    priority: "medium", status: "todo", visibility: "vertical", verticals: [],
  };
  const overdue = (t) => t.due_date && t.status !== "done" && t.due_date < todayISO();
  const showVerticalCol = !vertical && !coreOnly;
  const showClusterCol = vertical === "bb" || coreOnly || !!cluster;

  return (
    <div className="card">
      <div className="card-head">
        <div>
          <div className="t">{title}</div>
          <div className="s">Click a status pill to advance it</div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 7, alignItems: "center" }}>
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

      {filtered.length === 0 ? (
        <div className="empty">No {filter === "all" ? "" : filter} tasks here.</div>
      ) : (
        <div className="tablewrap">
          <table className="data">
            <thead>
              <tr>
                <th>Task</th>
                {showVerticalCol && <th>Vertical</th>}
                {showClusterCol && !cluster && <th>Cluster</th>}
                <th>Assignee</th><th>Priority</th><th>Status</th><th>Due</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} onClick={() => setEditing(t)}>
                  <td style={{ fontWeight: 600 }}>
                    {t.meeting_id && <Presentation size={12} style={{ color: "var(--brand)", marginRight: 6, verticalAlign: -1 }} title="From a meeting" />}
                    {t.event_id && <CalendarCheck size={12} style={{ color: "var(--gold)", marginRight: 6, verticalAlign: -1 }} title="Event task" />}
                    {t.visibility === "private" && <Lock size={11} style={{ color: "var(--faint)", marginRight: 6, verticalAlign: -1 }} title="Only you can see this" />}
                    {t.visibility === "team" && <Users size={11} style={{ color: "var(--faint)", marginRight: 6, verticalAlign: -1 }} title="Whole team" />}
                    {t.title}
                    {(t.verticals || []).length > 0 && (
                      <span style={{ marginLeft: 7 }}>
                        {t.verticals.map((v) => (
                          <span key={v} title={`Also in ${vName(v)}`} className="origin" style={{ background: vColor(v) }} />
                        ))}
                      </span>
                    )}
                  </td>
                  {showVerticalCol && (
                    <td><span className="pill" style={{ color: vColor(t.vertical), background: `${vColor(t.vertical)}1c` }}>{vName(t.vertical)}</span></td>
                  )}
                  {showClusterCol && !cluster && <td style={{ color: "var(--muted)", fontSize: 12.5 }}>{t.cluster || "Core"}</td>}
                  <td style={{ color: "var(--muted)" }}>{t.assignee || "—"}</td>
                  <td><Pill value={t.priority} /></td>
                  <td onClick={(e) => { e.stopPropagation(); cycleStatus(t); }}>
                    <Pill value={t.status === "done" ? "Done" : t.status === "inprogress" ? "In progress" : "todo"} />
                  </td>
                  <td style={{ color: overdue(t) ? "var(--bad)" : "var(--muted)", fontFamily: "var(--mono)", fontSize: 12, whiteSpace: "nowrap" }}>
                    {t.due_date || "—"}{t.due_time ? ` ${t.due_time}` : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <TaskModal task={editing} editableFn={canEditTask} team={team}
          lockVertical={!!vertical && vertical !== "bb"} lockCluster={!!cluster}
          onSave={save} onDelete={remove} onClose={() => setEditing(null)} />
      )}
    </div>
  );
}

function TaskModal({ task, editableFn, team, lockVertical, lockCluster, onSave, onDelete, onClose }) {
  const [f, setF] = useState({ verticals: [], ...task });
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }));
  const editable = task.id ? editableFn(task) : true;
  const toggleV = (v) =>
    set("verticals", (f.verticals || []).includes(v) ? f.verticals.filter((x) => x !== v) : [...(f.verticals || []), v]);

  return (
    <Modal title={task.id ? "Edit task" : "New task"} onClose={onClose}
      footer={
        <>
          {task.id && editable && (
            <button className="btn sm danger" style={{ marginRight: "auto" }} onClick={() => onDelete(task.id)}>
              <Trash2 size={13} /> Delete
            </button>
          )}
          <button className="btn sm" onClick={onClose}>Cancel</button>
          {editable && <button className="btn sm primary" onClick={() => f.title && onSave(f, task.id)}>Save</button>}
        </>
      }>
      <div className="field"><label>Task</label>
        <input value={f.title ?? ""} onChange={(e) => set("title", e.target.value)} disabled={!editable} autoFocus /></div>
      <div className="grid2">
        <div className="field"><label>Vertical (owner)</label>
          <select value={f.vertical} onChange={(e) => set("vertical", e.target.value)} disabled={!editable || lockVertical}>
            {SCOPES.map((k) => <option key={k} value={k}>{vName(k)}</option>)}
          </select></div>
        {f.vertical === "bb" && (
          <div className="field"><label>Cluster</label>
            <select value={f.cluster ?? ""} onChange={(e) => set("cluster", e.target.value || null)} disabled={!editable || lockCluster}>
              <option value="">Core team (Bengaluru)</option>
              {BB_CLUSTERS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select></div>
        )}
        <div className="field"><label>Assignee</label>
          <input list="kdem-team" value={f.assignee ?? ""} onChange={(e) => set("assignee", e.target.value)} disabled={!editable} />
          <datalist id="kdem-team">{team.map((n) => <option key={n} value={n} />)}</datalist></div>
        <div className="field"><label>Priority</label>
          <select value={f.priority} onChange={(e) => set("priority", e.target.value)} disabled={!editable}>
            {["high", "medium", "low"].map((o) => <option key={o} value={o}>{o}</option>)}
          </select></div>
        <div className="field"><label>Status</label>
          <select value={f.status} onChange={(e) => set("status", e.target.value)} disabled={!editable}>
            <option value="todo">To do</option><option value="inprogress">In progress</option><option value="done">Done</option>
          </select></div>
        <div className="field"><label>Due date</label>
          <input type="date" value={f.due_date ?? ""} onChange={(e) => set("due_date", e.target.value)} disabled={!editable} /></div>
        <div className="field"><label>Time (optional)</label>
          <input type="time" value={f.due_time ?? ""} onChange={(e) => set("due_time", e.target.value)} disabled={!editable} /></div>
        <div className="field"><label>Visible to</label>
          <select value={f.visibility || "vertical"} onChange={(e) => set("visibility", e.target.value)} disabled={!editable}>
            {TASK_VISIBILITIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select></div>

      </div>
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
      <div className="field"><label>Notes</label>
        <textarea value={f.notes ?? ""} onChange={(e) => set("notes", e.target.value)} disabled={!editable} /></div>
    </Modal>
  );
}
