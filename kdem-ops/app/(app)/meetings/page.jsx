"use client";
import { useEffect, useState, useCallback } from "react";
import { Plus, Trash2, Video, MapPin, Link2, FileDown, CalendarPlus } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useApp } from "@/lib/ctx";
import { SCOPES, vColor, vName } from "@/lib/schemas";
import { generateMoM } from "@/lib/mom";
import Modal from "@/components/Modal";
import Pill from "@/components/Pill";
import Attachments from "@/components/Attachments";
import { outlookAccount, pushMeeting, deleteOutlookEvent, meetingICS } from "@/lib/outlook";

export default function MeetingsPage() {
  const { notify, profile } = useApp();
  const [rows, setRows] = useState([]);
  const [team, setTeam] = useState([]);
  const [editing, setEditing] = useState(null);

  const load = useCallback(async () => {
    const [m, p] = await Promise.all([
      supabase.from("meetings").select("*").order("date", { ascending: false }),
      supabase.from("profiles").select("id,name,title,role,vertical").order("name"),
    ]);
    setRows(m.data || []); setTeam(p.data || []);
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const ch = supabase.channel("meetings-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "meetings" }, () => load())
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, [load]);

  async function save(f, id) {
    const payload = {
      title: f.title, kind: f.kind, mode: f.mode,
      date: f.date || null, time: f.time || "", end_time: f.end_time || "",
      venue: f.mode === "in_person" ? (f.venue || "") : "",
      link: f.mode === "online" ? (f.link || "") : "",
      verticals: f.verticals || [], participants: f.participants || [],
      externals: f.externals || "", chaired_by: f.chaired_by || "", minutes: f.minutes || "",
    };
    const res = id
      ? await supabase.from("meetings").update(payload).eq("id", id)
      : await supabase.from("meetings").insert([payload]).select().single();
    if (res.error) { notify(res.error.message); return null; }
    const saved = res.data || { ...f, ...payload, id };
    // Mirror into the saver's Outlook when they've connected it (Calendar page)
    try {
      if (saved.date && (await outlookAccount())) {
        const ids = { ...(f.outlook_ids || {}) };
        const evId = await pushMeeting(saved, ids[profile.id]);
        if (evId && evId !== ids[profile.id]) {
          ids[profile.id] = evId;
          await supabase.from("meetings").update({ outlook_ids: ids }).eq("id", saved.id);
        }
        saved.outlook_ids = ids;
        notify("Saved · in your Outlook");
      } else notify("Saved");
    } catch (e) { notify(`Saved — Outlook: ${e.message}`); }
    load();
    return saved;
  }
  async function remove(id) {
    const m = rows.find((r) => r.id === id);
    const mine = m?.outlook_ids?.[profile.id];
    if (mine && (await outlookAccount().catch(() => null))) await deleteOutlookEvent(mine);
    const { error } = await supabase.from("meetings").delete().eq("id", id);
    notify(error ? error.message : "Deleted"); setEditing(null); load();
  }

  return (
    <>
      <div className="card">
        <div className="card-head">
          <div>
            <div className="t">Meetings · {rows.length}</div>
            <div className="s">Internal & external — participants, venue or link, minutes, and next steps that become tasks</div>
          </div>
          <button className="btn sm primary" style={{ marginLeft: "auto" }}
            onClick={() => setEditing({
              kind: "internal", mode: "in_person",
              verticals: profile?.vertical ? [profile.vertical] : [], participants: [],
            })}>
            <Plus size={13} /> New meeting
          </button>
        </div>
        {rows.length === 0 ? (
          <div className="empty">No meetings logged yet.</div>
        ) : (
          <div className="tablewrap">
            <table className="data">
              <thead><tr><th>Meeting</th><th>Kind</th><th>Mode</th><th>Date</th><th>Verticals</th><th>People</th></tr></thead>
              <tbody>
                {rows.map((m) => (
                  <tr key={m.id} onClick={() => setEditing(m)}>
                    <td style={{ fontWeight: 600 }}>{m.title}</td>
                    <td><Pill value={m.kind} /></td>
                    <td style={{ color: "var(--muted)" }}>
                      {m.mode === "online"
                        ? <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Video size={13} /> Online</span>
                        : <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><MapPin size={13} /> In person</span>}
                    </td>
                    <td style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--muted)", whiteSpace: "nowrap" }}>
                      {m.date || "TBD"}{m.time ? ` · ${m.time}` : ""}
                    </td>
                    <td>
                      {(m.verticals || []).map((v) => (
                        <span key={v} className="origin" style={{ background: vColor(v) }} title={vName(v)} />
                      ))}
                    </td>
                    <td style={{ color: "var(--muted)", fontSize: 12.5 }}>
                      {(m.participants || []).length}{m.externals ? " + ext" : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing && (
        <MeetingModal meeting={editing} team={team} onSave={save} onDelete={remove}
          onClose={() => setEditing(null)} notify={notify} />
      )}
    </>
  );
}

function MeetingModal({ meeting, team, onSave, onDelete, onClose, notify }) {
  const [f, setF] = useState({ verticals: [], participants: [], ...meeting });
  const [id, setId] = useState(meeting.id || null);
  const [linkedTasks, setLinkedTasks] = useState([]);
  const [step, setStep] = useState({ title: "", vertical: "", assignee: "", due: "" });
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }));
  const toggle = (k, v) =>
    set(k, (f[k] || []).includes(v) ? f[k].filter((x) => x !== v) : [...(f[k] || []), v]);

  const loadTasks = useCallback(async (mid) => {
    if (!mid) return;
    const { data } = await supabase.from("tasks").select("*").eq("meeting_id", mid).order("created_at");
    setLinkedTasks(data || []);
  }, []);
  useEffect(() => { loadTasks(id); }, [id, loadTasks]);

  async function persist(stayOpen) {
    if (!f.title) return null;
    const saved = await onSave(f, id);
    if (saved?.outlook_ids) set("outlook_ids", saved.outlook_ids); // so a second save updates, not duplicates
    const mid = id || saved?.id || null;
    if (!id && mid) setId(mid);
    if (!stayOpen) onClose();
    return mid;
  }

  async function addStep() {
    if (!step.title || !step.vertical) return notify("Next step needs a title and a vertical");
    const mid = id || (await persist(true));
    if (!mid) return;
    const { error } = await supabase.from("tasks").insert([{
      title: step.title, vertical: step.vertical, assignee: step.assignee || "",
      due_date: step.due || null, meeting_id: mid, show_on_calendar: !!step.due,
      priority: "medium", status: "todo",
    }]);
    if (error) return notify(error.message);
    setStep({ title: "", vertical: "", assignee: "", due: "" });
    loadTasks(mid); notify("Task created");
  }

  return (
    <Modal title={id ? "Meeting" : "New meeting"} onClose={onClose} wide
      footer={
        <>
          {id && (
            <button className="btn sm danger" style={{ marginRight: "auto" }} onClick={() => onDelete(id)}>
              <Trash2 size={13} /> Delete
            </button>
          )}
          {id && f.date && (
            <button className="btn sm" title="Download an invite for Outlook, Google or Apple Calendar" onClick={() => meetingICS({ ...f, id })}>
              <CalendarPlus size={13} /> .ics
            </button>
          )}
          {id && (
            <button className="btn sm" onClick={() => generateMoM(f, linkedTasks, team)}>
              <FileDown size={13} /> Download MoM
            </button>
          )}
          <button className="btn sm" onClick={onClose}>Close</button>
          <button className="btn sm primary" onClick={() => persist(false)}>Save</button>
        </>
      }>
      <div className="field"><label>Title</label>
        <input value={f.title ?? ""} onChange={(e) => set("title", e.target.value)} autoFocus /></div>
      <div className="grid2">
        <div className="field"><label>Kind</label>
          <select value={f.kind} onChange={(e) => set("kind", e.target.value)}>
            <option value="internal">Internal</option><option value="external">External</option>
          </select></div>
        <div className="field"><label>Mode</label>
          <select value={f.mode} onChange={(e) => set("mode", e.target.value)}>
            <option value="in_person">In person</option><option value="online">Online</option>
          </select></div>
        <div className="field"><label>Date</label>
          <input type="date" value={f.date ?? ""} onChange={(e) => set("date", e.target.value)} /></div>
        <div className="field"><label>Time</label>
          <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
            <input type="time" value={f.time ?? ""} onChange={(e) => set("time", e.target.value)} />
            <span style={{ color: "var(--faint)", fontSize: 12 }}>to</span>
            <input type="time" value={f.end_time ?? ""} onChange={(e) => set("end_time", e.target.value)} />
          </div></div>
        <div className="field" style={{ gridColumn: "1 / -1" }}><label>Chaired by</label>
          <input placeholder="Dr. N Manjula, IAS — Secretary, Dept of IT BT & ST, GoK"
            value={f.chaired_by ?? ""} onChange={(e) => set("chaired_by", e.target.value)} /></div>
        {f.mode === "in_person" ? (
          <div className="field" style={{ gridColumn: "1 / -1" }}><label>Venue</label>
            <input value={f.venue ?? ""} onChange={(e) => set("venue", e.target.value)} /></div>
        ) : (
          <div className="field" style={{ gridColumn: "1 / -1" }}>
            <label>Meeting link</label>
            <div style={{ display: "flex", gap: 7 }}>
              <input style={{ flex: 1 }} placeholder="https://meet.google.com/…"
                value={f.link ?? ""} onChange={(e) => set("link", e.target.value)} />
              {f.link && (
                <a className="btn sm" href={f.link} target="_blank" rel="noreferrer"><Link2 size={13} /> Join</a>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="field"><label>Verticals involved</label>
        <div className="chips">
          {SCOPES.map((k) => (
            <button key={k} type="button" className={`chip ${(f.verticals || []).includes(k) ? "on" : ""}`}
              onClick={() => toggle("verticals", k)}>{vName(k)}</button>
          ))}
        </div>
      </div>
      <div className="field"><label>Team participants</label>
        <div className="chips">
          {team.map((p) => (
            <button key={p.id} type="button" className={`chip ${(f.participants || []).includes(p.name) ? "on" : ""}`}
              onClick={() => toggle("participants", p.name)}>{p.name}</button>
          ))}
        </div>
      </div>
      <div className="field"><label>External participants {f.kind === "external" ? "" : "(optional)"}</label>
        <textarea placeholder={"One per line: Name — Designation\nShri. Rajesh K — Director, KITS\nSmt. Priya M — Head of Policy, NASSCOM"}
          value={f.externals ?? ""} onChange={(e) => set("externals", e.target.value)} /></div>
      <div className="field"><label>Minutes</label>
        <textarea style={{ minHeight: 110 }} value={f.minutes ?? ""} onChange={(e) => set("minutes", e.target.value)} /></div>

      <Attachments folder="meetings" id={id} ensureId={() => persist(true)} notify={notify} />

      <div className="subhead">Next steps → tasks</div>
      {linkedTasks.map((t) => (
        <div key={t.id} className="docrow">
          <span className="origin" style={{ background: vColor(t.vertical) }} />
          <span style={{ flex: 1 }}>{t.title}</span>
          <Pill value={t.status === "done" ? "Done" : t.status === "inprogress" ? "In progress" : "todo"} />
          <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)" }}>{t.due_date || ""}</span>
        </div>
      ))}
      <div className="grid2">
        <div className="field"><label>New next step</label>
          <input placeholder="What needs to happen" value={step.title}
            onChange={(e) => setStep({ ...step, title: e.target.value })} /></div>
        <div className="field"><label>Vertical</label>
          <select value={step.vertical} onChange={(e) => setStep({ ...step, vertical: e.target.value })}>
            <option value="">—</option>
            {SCOPES.map((k) => <option key={k} value={k}>{vName(k)}</option>)}
          </select></div>
        <div className="field"><label>Assignee</label>
          <input list="kdem-team-m" value={step.assignee} onChange={(e) => setStep({ ...step, assignee: e.target.value })} />
          <datalist id="kdem-team-m">{team.map((p) => <option key={p.id} value={p.name} />)}</datalist></div>
        <div className="field"><label>Due</label>
          <input type="date" value={step.due} onChange={(e) => setStep({ ...step, due: e.target.value })} /></div>
      </div>
      <button className="btn sm" style={{ alignSelf: "flex-start" }} onClick={addStep}>
        <Plus size={13} /> Add as task
      </button>
    </Modal>
  );
}
