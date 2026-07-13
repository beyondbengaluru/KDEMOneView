"use client";
import { useEffect, useState, useCallback } from "react";
import { Plus, Trash2, Paperclip, Upload, ExternalLink, FileText } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useApp } from "@/lib/ctx";
import { SCOPES, EVENT_TYPES, BB_CLUSTERS, vName, vColor } from "@/lib/schemas";
import Modal from "./Modal";
import Pill from "./Pill";

/**
 * Events planner. Sub-tabs: Internal (our Pre-BTS cluster events, with
 * agenda docs + prep tasks) and External (summits & the rest).
 *  clusterFilter   one cluster's events (BB sections)
 *  verticalFilter  events owned by one vertical (vertical overview panels)
 */
export default function EventsTable({ vertical = "mkt", clusterFilter = null, verticalFilter = null, title = "Events" }) {
  const { canWrite, notify, profile, fy } = useApp();
  const [rows, setRows] = useState([]);
  const [sub, setSub] = useState("internal");
  const [editing, setEditing] = useState(null);

  const load = useCallback(async () => {
    const { data } = await supabase.from("events").select("*").eq("fy", fy).order("date", { ascending: true });
    let out = data || [];
    if (clusterFilter) out = out.filter((e) => e.cluster === clusterFilter);
    if (verticalFilter) out = out.filter((e) => e.vertical === verticalFilter);
    setRows(out);
  }, [clusterFilter, verticalFilter, fy]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const ch = supabase.channel(`events-${vertical}-${clusterFilter || verticalFilter || "all"}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "events" }, () => load())
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, [vertical, clusterFilter, verticalFilter, load]);

  const canEditEvent = (e) =>
    canWrite(e.vertical) ||
    (profile.role === "cluster_head" && (e.cluster || "") === profile.cluster) ||
    (profile.vertical === "bb" && BB_CLUSTERS.includes(e.cluster));

  async function save(f, id) {
    const payload = {
      name: f.name, vertical: f.vertical || vertical, type: f.type || "Domestic",
      cluster: f.type === "Pre-BTS Cluster" ? (f.cluster || clusterFilter || null) : (f.cluster || null),
      date: f.date || null, end_date: f.end_date || null, time: f.time || "",
      location: f.location || "", status: f.status || "planned", notes: f.notes || "", fy,
    };
    const res = id
      ? await supabase.from("events").update(payload).eq("id", id)
      : await supabase.from("events").insert([payload]).select().single();
    if (res.error) { notify(res.error.message); return null; }
    notify("Saved"); load();
    return res.data;
  }
  async function remove(id) {
    const { data } = await supabase.storage.from("docs").list(`events/${id}`);
    if (data?.length) await supabase.storage.from("docs").remove(data.map((f) => `events/${id}/${f.name}`));
    const { error } = await supabase.from("events").delete().eq("id", id);
    notify(error ? error.message : "Deleted"); setEditing(null); load();
  }

  const showSubs = !clusterFilter && !verticalFilter;
  const shown = showSubs
    ? rows.filter((e) => (sub === "internal" ? e.type === "Pre-BTS Cluster" : e.type !== "Pre-BTS Cluster"))
    : rows;

  return (
    <div className="card">
      <div className="card-head">
        <div>
          <div className="t">{title} · {shown.length}</div>
          <div className="s">Internal Pre-BTS cluster events carry agendas & prep tasks; everything feeds the calendar</div>
        </div>
        <button className="btn sm primary" style={{ marginLeft: "auto" }}
          onClick={() => setEditing({
            vertical, status: "planned",
            type: clusterFilter || (showSubs && sub === "internal") ? "Pre-BTS Cluster" : "Domestic",
            cluster: clusterFilter || null,
          })}>
          <Plus size={13} /> Add event
        </button>
      </div>
      {showSubs && (
        <div className="subtabs">
          <button className={`stab ${sub === "internal" ? "on" : ""}`} onClick={() => setSub("internal")}>Internal — Pre-BTS</button>
          <button className={`stab ${sub === "external" ? "on" : ""}`} onClick={() => setSub("external")}>External — Summits & Global</button>
        </div>
      )}
      {shown.length === 0 ? (
        <div className="empty">No events here yet.</div>
      ) : (
        <div className="tablewrap">
          <table className="data">
            <thead><tr><th>Event</th><th>Type</th>{!clusterFilter && <th>Cluster</th>}<th>Date</th><th>Location</th><th>Status</th></tr></thead>
            <tbody>
              {shown.map((e) => (
                <tr key={e.id} onClick={() => setEditing(e)}>
                  <td style={{ fontWeight: 600 }}>{e.name}</td>
                  <td style={{ color: "var(--muted)" }}>{e.type}</td>
                  {!clusterFilter && <td style={{ color: "var(--muted)", fontSize: 12.5 }}>{e.cluster || "—"}</td>}
                  <td style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--muted)", whiteSpace: "nowrap" }}>{e.date || "TBD"}{e.time ? ` · ${e.time}` : ""}</td>
                  <td style={{ color: "var(--muted)" }}>{e.location || "—"}</td>
                  <td><Pill value={e.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {editing && (
        <EventModal event={editing} vertical={vertical}
          editable={editing.id ? canEditEvent(editing) : true}
          onSave={save} onDelete={remove} onClose={() => setEditing(null)} notify={notify} />
      )}
    </div>
  );
}

function EventModal({ event, editable, onSave, onDelete, onClose, notify }) {
  const [f, setF] = useState(event);
  const [team, setTeam] = useState([]);
  useEffect(() => {
    supabase.from("profiles").select("name").order("name").then(({ data }) =>
      setTeam((data || []).map((p) => p.name).filter(Boolean)));
  }, []);
  const [id, setId] = useState(event.id || null);
  const [docs, setDocs] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [step, setStep] = useState({ title: "", assignee: "", due: "" });
  const [uploading, setUploading] = useState(false);
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }));

  const loadExtras = useCallback(async (eid) => {
    if (!eid) return;
    const [d, t] = await Promise.all([
      supabase.storage.from("docs").list(`events/${eid}`),
      supabase.from("tasks").select("*").eq("event_id", eid).order("created_at"),
    ]);
    setDocs(d.data || []); setTasks(t.data || []);
  }, []);
  useEffect(() => { loadExtras(id); }, [id, loadExtras]);

  async function persist(stayOpen) {
    if (!f.name) return null;
    const saved = await onSave(f, id);
    const eid = id || saved?.id || null;
    if (!id && eid) setId(eid);
    if (!stayOpen) onClose();
    return eid;
  }
  async function upload(e) {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;
    const eid = id || (await persist(true));
    if (!eid) return;
    setUploading(true);
    for (const file of files) {
      const { error } = await supabase.storage.from("docs").upload(`events/${eid}/${file.name}`, file, { upsert: true });
      if (error) notify(error.message);
    }
    setUploading(false); loadExtras(eid); notify("Uploaded");
  }
  async function openDoc(name) {
    const { data } = await supabase.storage.from("docs").createSignedUrl(`events/${id}/${name}`, 3600);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
  }
  async function addTask() {
    if (!step.title) return;
    const eid = id || (await persist(true));
    if (!eid) return;
    const { error } = await supabase.from("tasks").insert([{
      title: step.title, vertical: f.type === "Pre-BTS Cluster" ? "bb" : (f.vertical || "mkt"),
      cluster: f.type === "Pre-BTS Cluster" ? (f.cluster || null) : null,
      assignee: step.assignee || "", due_date: step.due || null,
      event_id: eid, show_on_calendar: !!step.due, priority: "medium", status: "todo",
    }]);
    if (error) return notify(error.message);
    setStep({ title: "", assignee: "", due: "" });
    loadExtras(eid); notify("Task created");
  }

  return (
    <Modal title={id ? "Event" : "New event"} onClose={onClose} wide
      footer={
        <>
          {id && editable && (
            <button className="btn sm danger" style={{ marginRight: "auto" }} onClick={() => onDelete(id)}>
              <Trash2 size={13} /> Delete
            </button>
          )}
          <button className="btn sm" onClick={onClose}>Close</button>
          {editable && <button className="btn sm primary" onClick={() => persist(false)}>Save</button>}
        </>
      }>
      <div className="field"><label>Event name</label>
        <input value={f.name ?? ""} onChange={(e) => set("name", e.target.value)} disabled={!editable} autoFocus /></div>
      <div className="grid2">
        <div className="field"><label>Type</label>
          <select value={f.type} onChange={(e) => set("type", e.target.value)} disabled={!editable}>
            {EVENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select></div>
        {f.type === "Pre-BTS Cluster" && (
          <div className="field"><label>Cluster</label>
            <select value={f.cluster ?? ""} onChange={(e) => set("cluster", e.target.value)} disabled={!editable}>
              <option value="">—</option>
              {BB_CLUSTERS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select></div>
        )}
        <div className="field"><label>Owner</label>
          <select value={f.vertical} onChange={(e) => set("vertical", e.target.value)} disabled={!editable}>
            {SCOPES.map((k) => <option key={k} value={k}>{vName(k)}</option>)}
          </select></div>
        <div className="field"><label>Start date</label>
          <input type="date" value={f.date ?? ""} onChange={(e) => set("date", e.target.value)} disabled={!editable} /></div>
        <div className="field"><label>End date</label>
          <input type="date" value={f.end_date ?? ""} onChange={(e) => set("end_date", e.target.value)} disabled={!editable} /></div>
        <div className="field"><label>Time (optional)</label>
          <input type="time" value={f.time ?? ""} onChange={(e) => set("time", e.target.value)} disabled={!editable} /></div>
        <div className="field"><label>Location</label>
          <input value={f.location ?? ""} onChange={(e) => set("location", e.target.value)} disabled={!editable} /></div>
        <div className="field"><label>Status</label>
          <select value={f.status} onChange={(e) => set("status", e.target.value)} disabled={!editable}>
            {["planned", "confirmed", "done", "cancelled"].map((s) => <option key={s} value={s}>{s}</option>)}
          </select></div>
      </div>
      <div className="field"><label>Notes</label>
        <textarea value={f.notes ?? ""} onChange={(e) => set("notes", e.target.value)} disabled={!editable} /></div>

      <div className="subhead"><Paperclip size={12} style={{ verticalAlign: -1, marginRight: 5 }} />Agenda & documents</div>
      {docs.map((d) => (
        <div key={d.name} className="docrow">
          <FileText size={14} style={{ color: "var(--brand)" }} />
          <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.name}</span>
          <button className="btn ghost sm" onClick={() => openDoc(d.name)}><ExternalLink size={13} /></button>
        </div>
      ))}
      {editable && (
        <label className="btn sm" style={{ alignSelf: "flex-start", cursor: "pointer" }}>
          <Upload size={13} /> {uploading ? "Uploading…" : "Upload agenda / docs"}
          <input type="file" multiple hidden onChange={upload} />
        </label>
      )}

      <div className="subhead">Event tasks</div>
      {tasks.map((t) => (
        <div key={t.id} className="docrow">
          <span className="origin" style={{ background: vColor(t.vertical) }} />
          <span style={{ flex: 1 }}>{t.title}</span>
          <Pill value={t.status === "done" ? "Done" : t.status === "inprogress" ? "In progress" : "todo"} />
          <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)" }}>{t.due_date || ""}</span>
        </div>
      ))}
      {editable && (
        <div className="steps-row" style={{ gridTemplateColumns: "1fr 130px 130px 90px" }}>
          <input placeholder="Task for this event" value={step.title}
            onChange={(e) => setStep({ ...step, title: e.target.value })}
            style={{ padding: "8px 10px", border: "1px solid var(--line2)", borderRadius: 9, background: "var(--inset)" }} />
          <input list="kdem-team-e" placeholder="Assignee" value={step.assignee}
            onChange={(e) => setStep({ ...step, assignee: e.target.value })}
            style={{ padding: "8px 10px", border: "1px solid var(--line2)", borderRadius: 9, background: "var(--inset)" }} />
          <datalist id="kdem-team-e">{team.map((n) => <option key={n} value={n} />)}</datalist>
          <input type="date" value={step.due}
            onChange={(e) => setStep({ ...step, due: e.target.value })}
            style={{ padding: "8px 10px", border: "1px solid var(--line2)", borderRadius: 9, background: "var(--inset)" }} />
          <button className="btn sm" onClick={addTask}><Plus size={13} /> Add</button>
        </div>
      )}
    </Modal>
  );
}
