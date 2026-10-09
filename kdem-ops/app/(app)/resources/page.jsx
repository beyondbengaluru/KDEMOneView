"use client";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Plus, Search, FileText, Link2, ExternalLink, Trash2, Lock, Globe2, Upload } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useApp } from "@/lib/ctx";
import { SCOPES, vName, vColor } from "@/lib/schemas";
import Modal from "@/components/Modal";
import { RESOURCE_CATEGORIES, LINK_TYPES, openResource } from "@/lib/resources";

/** Shared documents — policies, templates, reports — for everyone or chosen verticals. */
export default function ResourcesPage() {
  const { profile, notify } = useApp();
  const [rows, setRows] = useState(null);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [editing, setEditing] = useState(null);

  const load = useCallback(async () => {
    const { data } = await supabase.from("resources").select("*").order("updated_at", { ascending: false });
    setRows(data || []);
  }, []);
  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const ch = supabase.channel("resources-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "resources" }, load).subscribe();
    return () => supabase.removeChannel(ch);
  }, [load]);

  const shown = useMemo(() => (rows || []).filter((r) =>
    (cat === "All" || r.category === cat) &&
    (!q || [r.title, r.notes, r.category, r.file_name].some((x) => String(x || "").toLowerCase().includes(q.toLowerCase())))), [rows, q, cat]);

  return (
    <div className="card">
      <div className="card-head">
        <div>
          <div className="t">Resources · {rows?.length ?? 0}</div>
          <div className="s">Policies, guidelines and templates for the team. Live links open in Google or Microsoft 365 for editing together.</div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 7, alignItems: "center", flexWrap: "wrap" }}>
          <div className="searchbox"><Search size={13} style={{ color: "var(--faint)" }} />
            <input placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
          <button className="btn sm primary" onClick={() => setEditing({ kind: "file", category: "Policy", verticals: [] })}>
            <Plus size={13} /> Add resource
          </button>
        </div>
      </div>
      <div className="subtabs">
        {["All", ...RESOURCE_CATEGORIES].map((c) => (
          <button key={c} className={`stab ${cat === c ? "on" : ""}`} onClick={() => setCat(c)}>{c}</button>
        ))}
      </div>
      {!rows ? <div className="loadingrow">Loading…</div> : shown.length === 0 ? (
        <div className="empty">{rows.length ? "Nothing matches." : "No resources yet — add the first policy or template."}</div>
      ) : (
        <div className="propgrid">
          {shown.map((r) => (
            <div key={r.id} className="prop" onClick={() => setEditing(r)}>
              <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                {r.kind === "link" ? <Link2 size={16} style={{ color: "var(--brand)", marginTop: 2 }} /> : <FileText size={16} style={{ color: "var(--brand)", marginTop: 2 }} />}
                <div style={{ fontWeight: 700, fontSize: 13.5, lineHeight: 1.35, flex: 1 }}>{r.title}</div>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                <span className="srcpill">{r.category}</span>
                {r.kind === "link" && <span className="srcpill">{r.link_type === "google" ? "Google · live" : r.link_type === "m365" ? "Microsoft 365 · live" : "Link"}</span>}
                {r.verticals?.length ? (
                  <span className="srcpill" title="Restricted"><Lock size={10} style={{ verticalAlign: -1, marginRight: 3 }} />
                    {r.verticals.map(vName).join(", ")}</span>
                ) : <span className="srcpill"><Globe2 size={10} style={{ verticalAlign: -1, marginRight: 3 }} />Everyone</span>}
              </div>
              {r.notes && <div style={{ fontSize: 12, color: "var(--muted)" }}>{r.notes}</div>}
              <div style={{ marginTop: "auto", display: "flex" }}>
                <button className="btn sm" onClick={(e) => { e.stopPropagation(); openResource(r, notify); }}>
                  <ExternalLink size={13} /> {r.kind === "link" ? "Open & edit" : "Open"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {editing && (
        <ResourceModal row={editing.id ? editing : null} initial={editing} profile={profile} notify={notify}
          onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />
      )}
    </div>
  );
}

function ResourceModal({ row, initial, profile, notify, onClose, onSaved }) {
  const [f, setF] = useState({ link_type: "google", notes: "", ...initial });
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }));
  const editable = !row || row.created_by === profile.id || profile.role === "master";
  const toggleV = (v) => set("verticals", (f.verticals || []).includes(v) ? f.verticals.filter((x) => x !== v) : [...(f.verticals || []), v]);

  async function save() {
    if (!f.title?.trim()) return notify("Give it a title");
    if (f.kind === "link" && !/^https?:\/\//i.test(f.url || "")) return notify("Paste the full link (https://…)");
    if (f.kind === "file" && !row && !file) return notify("Choose a file to upload");
    setBusy(true);
    const payload = {
      title: f.title.trim(), kind: f.kind, category: f.category, notes: f.notes || "",
      verticals: f.verticals || [], link_type: f.kind === "link" ? f.link_type : "",
      url: f.kind === "link" ? f.url : "",
    };
    if (file) payload.file_name = file.name;
    const res = row
      ? await supabase.from("resources").update(payload).eq("id", row.id).select().single()
      : await supabase.from("resources").insert([payload]).select().single();
    if (res.error) { setBusy(false); return notify(res.error.message); }
    if (file) {
      if (row?.file_name && row.file_name !== file.name)
        await supabase.storage.from("docs").remove([`resources/${row.id}/${row.file_name}`]);
      const { error } = await supabase.storage.from("docs").upload(`resources/${res.data.id}/${file.name}`, file, { upsert: true });
      if (error) { setBusy(false); return notify(error.message); }
    }
    setBusy(false); notify("Saved"); onSaved();
  }
  async function remove() {
    if (!window.confirm(`Delete “${row.title}”?`)) return;
    if (row.file_name) await supabase.storage.from("docs").remove([`resources/${row.id}/${row.file_name}`]);
    const { error } = await supabase.from("resources").delete().eq("id", row.id);
    if (error) return notify(error.message);
    notify("Deleted"); onSaved();
  }

  return (
    <Modal title={row ? "Resource" : "Add resource"} onClose={onClose}
      footer={<>
        {row && editable && <button className="btn sm danger" style={{ marginRight: "auto" }} onClick={remove}><Trash2 size={13} /> Delete</button>}
        <button className="btn sm" onClick={onClose}>Close</button>
        {editable && <button className="btn sm primary" disabled={busy} onClick={save}>{busy ? "Saving…" : "Save"}</button>}
      </>}>
      <div className="field"><label>Title</label>
        <input value={f.title || ""} onChange={(e) => set("title", e.target.value)} disabled={!editable} autoFocus /></div>
      <div className="grid2">
        <div className="field"><label>Type</label>
          <select value={f.kind} onChange={(e) => set("kind", e.target.value)} disabled={!editable}>
            <option value="file">Upload a file</option>
            <option value="link">Live link (edit together)</option>
          </select></div>
        <div className="field"><label>Category</label>
          <select value={f.category} onChange={(e) => set("category", e.target.value)} disabled={!editable}>
            {RESOURCE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select></div>
      </div>
      {f.kind === "link" ? (
        <div className="grid2">
          <div className="field"><label>Where it lives</label>
            <select value={f.link_type} onChange={(e) => set("link_type", e.target.value)} disabled={!editable}>
              {LINK_TYPES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </select></div>
          <div className="field"><label>Link</label>
            <input value={f.url || ""} onChange={(e) => set("url", e.target.value)} disabled={!editable} placeholder="https://docs.google.com/…" /></div>
          <div style={{ gridColumn: "1 / -1", fontSize: 11.5, color: "var(--faint)" }}>
            Set sharing in Google / Microsoft to “anyone in the organisation can edit” so the team can work on it live.
          </div>
        </div>
      ) : (
        <div className="field"><label>File</label>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button className="btn sm" disabled={!editable} onClick={() => fileRef.current?.click()}><Upload size={13} /> {file ? "Change" : row ? "Replace file" : "Choose file"}</button>
            <span style={{ fontSize: 12.5, color: "var(--muted)" }}>{file?.name || row?.file_name || "No file chosen"}</span>
            <input ref={fileRef} type="file" hidden onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </div></div>
      )}
      <div className="field"><label>Who can see it</label>
        <div className="chips">
          <button type="button" disabled={!editable} className={`chip ${!(f.verticals || []).length ? "on" : ""}`} onClick={() => set("verticals", [])}>Everyone</button>
          {SCOPES.map((k) => (
            <button key={k} type="button" disabled={!editable} className={`chip ${(f.verticals || []).includes(k) ? "on" : ""}`}
              onClick={() => toggleV(k)}><span className="origin" style={{ background: vColor(k) }} />{vName(k)}</button>
          ))}
        </div>
        <div style={{ fontSize: 11.5, color: "var(--faint)", marginTop: 5 }}>Pick verticals to restrict it. The CEO Office and you can always see it.</div>
      </div>
      <div className="field"><label>Notes</label>
        <textarea value={f.notes || ""} onChange={(e) => set("notes", e.target.value)} disabled={!editable} /></div>
    </Modal>
  );
}
