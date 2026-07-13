"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { Plus, Trash2, CheckCircle2, Circle, Upload, ExternalLink, FileText, Presentation, CalendarDays, ListTodo, BellRing } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useApp } from "@/lib/ctx";
import { designationsFor, vColor, vName } from "@/lib/schemas";
import { todayISO } from "@/lib/util";
import Modal from "@/components/Modal";

/**
 * My space — the personal side of OneView.
 * Profile, private reminders (never synced to the team), personal documents
 * (private bucket), and one combined "coming up" list: your reminders +
 * your tasks + your meetings + events, side by side.
 */
export default function MePage() {
  const { profile, notify, refreshProfile, fy } = useApp();
  const [form, setForm] = useState({ name: "", title: "" });
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [docs, setDocs] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [work, setWork] = useState({ tasks: [], meetings: [], events: [] });
  const fileRef = useRef(null);

  useEffect(() => {
    if (profile) setForm({ name: profile.name || "", title: profile.title || "" });
  }, [profile]);

  const loadItems = useCallback(async () => {
    const { data } = await supabase.from("personal_items").select("*")
      .order("date", { ascending: true, nullsFirst: false });
    setItems(data || []);
  }, []);
  const loadDocs = useCallback(async () => {
    if (!profile?.id) return;
    const { data } = await supabase.storage.from("personal").list(profile.id);
    setDocs(data || []);
  }, [profile?.id]);
  const loadWork = useCallback(async () => {
    if (!profile?.name) return;
    const today = todayISO();
    const horizon = new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10);
    const [t, m, e] = await Promise.all([
      supabase.from("tasks").select("*").eq("assignee", profile.name).neq("status", "done")
        .not("due_date", "is", null).lte("due_date", horizon).order("due_date"),
      supabase.from("meetings").select("*").contains("participants", [profile.name])
        .gte("date", today).lte("date", horizon).order("date"),
      supabase.from("events").select("*").eq("fy", fy).gte("date", today).lte("date", horizon)
        .neq("status", "cancelled").order("date").limit(8),
    ]);
    setWork({ tasks: t.data || [], meetings: m.data || [], events: e.data || [] });
  }, [profile?.name, fy]);

  useEffect(() => { loadItems(); loadDocs(); loadWork(); }, [loadItems, loadDocs, loadWork]);

  async function saveProfile() {
    const { error } = await supabase.from("profiles")
      .update({ name: form.name, title: form.title }).eq("id", profile.id);
    if (error) return notify(error.message);
    notify("Profile updated"); refreshProfile();
  }

  async function saveItem(f, id) {
    const payload = { title: f.title, date: f.date || null, time: f.time || "", notes: f.notes || "" };
    const res = id
      ? await supabase.from("personal_items").update(payload).eq("id", id)
      : await supabase.from("personal_items").insert([payload]);
    if (res.error) return notify(res.error.message);
    notify("Saved"); setEditing(null); loadItems();
  }
  async function toggleItem(it) {
    await supabase.from("personal_items").update({ done: !it.done }).eq("id", it.id);
    loadItems();
  }
  async function removeItem(id) {
    await supabase.from("personal_items").delete().eq("id", id);
    setEditing(null); loadItems();
  }

  async function upload(e) {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;
    setUploading(true);
    for (const file of files) {
      const { error } = await supabase.storage.from("personal")
        .upload(`${profile.id}/${file.name}`, file, { upsert: true });
      if (error) notify(error.message);
    }
    setUploading(false); loadDocs(); notify("Uploaded");
  }
  async function openDoc(name) {
    const { data } = await supabase.storage.from("personal").createSignedUrl(`${profile.id}/${name}`, 3600);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
  }
  async function deleteDoc(name) {
    await supabase.storage.from("personal").remove([`${profile.id}/${name}`]);
    loadDocs();
  }

  // combined upcoming feed
  const upcoming = [
    ...items.filter((i) => !i.done && i.date).map((i) => ({ kind: "personal", label: i.title, date: i.date, sub: i.time || "Personal" })),
    ...work.tasks.map((t) => ({ kind: "task", label: t.title, date: t.due_date, sub: `${vName(t.vertical)} · due`, color: vColor(t.vertical) })),
    ...work.meetings.map((m) => ({ kind: "meeting", label: m.title, date: m.date, sub: m.time || m.kind })),
    ...work.events.map((e) => ({ kind: "event", label: e.name, date: e.date, sub: e.cluster || e.location || vName(e.vertical), color: vColor(e.vertical) })),
  ].sort((a, b) => (a.date || "").localeCompare(b.date || "")).slice(0, 12);

  const KindIcon = { personal: BellRing, task: ListTodo, meeting: Presentation, event: CalendarDays };
  const initials = (profile?.name || "?").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <>
      <div className="card pad" style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
        <div className="avatarbtn" style={{ width: 52, height: 52, fontSize: 18, cursor: "default" }}>{initials}</div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end", flex: 1 }}>
          <div className="field" style={{ minWidth: 190 }}>
            <label>Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="field" style={{ minWidth: 160 }}>
            <label>Designation</label>
            <select value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}>
              <option value="">—</option>
              {designationsFor(profile?.role).map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <button className="btn sm primary" onClick={saveProfile}>Save</button>
        </div>
        <div style={{ fontSize: 11.5, color: "var(--faint)" }}>
          Reminders & documents here are private to you — never synced to the team.
        </div>
      </div>

      <div className="split">
        <div className="card">
          <div className="card-head">
            <div>
              <div className="t">Coming up — next 30 days</div>
              <div className="s">Your reminders, tasks, meetings & events in one feed</div>
            </div>
          </div>
          {upcoming.length === 0 ? (
            <div className="empty">Clear runway — nothing due in the next month.</div>
          ) : (
            <div style={{ padding: 10, display: "flex", flexDirection: "column", gap: 6 }}>
              {upcoming.map((u, i) => {
                const I = KindIcon[u.kind];
                return (
                  <div key={i} className="docrow">
                    <I size={13} style={{ color: u.color || "var(--brand)" }} />
                    <span style={{ flex: 1, fontWeight: 600 }}>{u.label}</span>
                    <span style={{ fontSize: 11, color: "var(--muted)" }}>{u.sub}</span>
                    <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: u.date < todayISO() ? "var(--bad)" : "var(--muted)" }}>{u.date}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-head">
            <div>
              <div className="t">Personal reminders</div>
              <div className="s">Only you can see these</div>
            </div>
            <button className="btn sm primary" style={{ marginLeft: "auto" }} onClick={() => setEditing({})}>
              <Plus size={13} /> Add
            </button>
          </div>
          {items.length === 0 ? (
            <div className="empty">No personal reminders yet.</div>
          ) : (
            <div style={{ padding: 10, display: "flex", flexDirection: "column", gap: 6 }}>
              {items.map((it) => (
                <div key={it.id} className="docrow" style={{ opacity: it.done ? 0.55 : 1 }}>
                  <button className="btn ghost sm" onClick={() => toggleItem(it)}>
                    {it.done ? <CheckCircle2 size={15} style={{ color: "var(--good)" }} /> : <Circle size={15} />}
                  </button>
                  <span style={{ flex: 1, fontWeight: 600, textDecoration: it.done ? "line-through" : "none", cursor: "pointer" }}
                    onClick={() => setEditing(it)}>{it.title}</span>
                  <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)" }}>
                    {it.date || ""}{it.time ? ` · ${it.time}` : ""}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div>
            <div className="t">My documents</div>
            <div className="s">Private storage — IDs, letters, notes, anything you need at hand</div>
          </div>
          <button className="btn sm" style={{ marginLeft: "auto" }} disabled={uploading} onClick={() => fileRef.current?.click()}>
            <Upload size={13} /> {uploading ? "Uploading…" : "Upload"}
          </button>
          <input ref={fileRef} type="file" multiple hidden onChange={upload} />
        </div>
        {docs.length === 0 ? (
          <div className="empty">Nothing stored yet.</div>
        ) : (
          <div style={{ padding: 10, display: "flex", flexDirection: "column", gap: 6 }}>
            {docs.map((d) => (
              <div key={d.name} className="docrow">
                <FileText size={14} style={{ color: "var(--brand)" }} />
                <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.name}</span>
                <button className="btn ghost sm" onClick={() => openDoc(d.name)}><ExternalLink size={13} /></button>
                <button className="btn ghost sm" onClick={() => deleteDoc(d.name)}><Trash2 size={13} /></button>
              </div>
            ))}
          </div>
        )}
      </div>

      {editing && (
        <Modal title={editing.id ? "Reminder" : "New reminder"} onClose={() => setEditing(null)}
          footer={
            <>
              {editing.id && (
                <button className="btn sm danger" style={{ marginRight: "auto" }} onClick={() => removeItem(editing.id)}>
                  <Trash2 size={13} /> Delete
                </button>
              )}
              <button className="btn sm" onClick={() => setEditing(null)}>Cancel</button>
              <button className="btn sm primary" onClick={() => editing.title && saveItem(editing, editing.id)}>Save</button>
            </>
          }>
          <div className="field"><label>Reminder</label>
            <input value={editing.title ?? ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} autoFocus /></div>
          <div className="grid2">
            <div className="field"><label>Date</label>
              <input type="date" value={editing.date ?? ""} onChange={(e) => setEditing({ ...editing, date: e.target.value })} /></div>
            <div className="field"><label>Time</label>
              <input type="time" value={editing.time ?? ""} onChange={(e) => setEditing({ ...editing, time: e.target.value })} /></div>
          </div>
          <div className="field"><label>Notes</label>
            <textarea value={editing.notes ?? ""} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} /></div>
        </Modal>
      )}
    </>
  );
}
