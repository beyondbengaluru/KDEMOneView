"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Upload, Trash2, ImagePlus, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useApp } from "@/lib/ctx";
import { CLUSTER_TABS, cShort } from "@/lib/schemas";
import Modal from "./Modal";

// A photo is either a file shipped with the app ("/awareness/…", the H1
// report photos) or one uploaded to storage ("docs:records/<id>/<file>").
const isStored = (p) => p.startsWith("docs:");

function usePhotoUrls(paths) {
  const [urls, setUrls] = useState({});
  const key = paths.join("|");
  useEffect(() => {
    const stored = paths.filter(isStored).map((p) => p.slice(5)).filter((p) => !urls[`docs:${p}`]);
    if (!stored.length) return;
    supabase.storage.from("docs").createSignedUrls(stored, 3600).then(({ data }) => {
      const m = {};
      (data || []).forEach((d) => { if (d.signedUrl) m[`docs:${d.path}`] = d.signedUrl; });
      setUrls((u) => ({ ...u, ...m }));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return (p) => (isStored(p) ? urls[p] : p);
}

/**
 * Policy awareness sessions as photos. Every photo uploaded here starts a
 * new session, so the count goes up with each one; open a session to add
 * its date, venue and attendance or more photos.
 */
export default function AwarenessGallery({ rows, cluster, color, id, className = "" }) {
  const { canEditRow, notify, profile } = useApp();
  const [target, setTarget] = useState(cluster || (profile?.role === "cluster_head" ? profile.cluster : CLUSTER_TABS[0]));
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(null);
  const [view, setView] = useState("");   // cluster filter on "All clusters"
  const clusters = useMemo(() => [...new Set(rows.map((r) => r.data?.cluster).filter(Boolean))].sort(), [rows]);
  const fileRef = useRef(null);
  const ordered = useMemo(() => [...rows].sort((a, b) =>
    String(a.data?.cluster).localeCompare(String(b.data?.cluster)) ||
    String(a.data?.name).localeCompare(String(b.data?.name), "en", { numeric: true })), [rows]);
  const photoUrl = usePhotoUrls(rows.flatMap((r) => r.data?.photos || []));
  const canAdd = canEditRow("bb", { cluster: cluster || target });

  async function addPhotos(e) {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;
    const c = cluster || target;
    let n = rows.filter((r) => r.data?.cluster === c).length;
    setBusy(true);
    for (const f of files) {
      n += 1;
      const ins = await supabase.from("records").insert([{ vertical: "bb", tab: "awareness",
        data: { name: `${cShort(c)} session ${n}`, cluster: c, photos: [] } }]).select().single();
      if (ins.error) { notify(ins.error.message); break; }
      const path = `records/${ins.data.id}/${f.name}`;
      const up = await supabase.storage.from("docs").upload(path, f, { upsert: true });
      if (up.error) { notify(up.error.message); continue; }
      await supabase.from("records").update({ data: { ...ins.data.data, photos: [`docs:${path}`] } }).eq("id", ins.data.id);
    }
    setBusy(false);
    notify(`${files.length} session${files.length > 1 ? "s" : ""} added`);
  }

  return (
    <div className={`card anchor ${className}`} id={id}>
      <div className="card-head">
        <div>
          <div className="t">Awareness sessions · {rows.length}</div>
          <div className="s">Add a session with its photo. Open one to add the date, venue or more photos.</div>
        </div>
        {canAdd && (
          <div style={{ marginLeft: "auto", display: "flex", gap: 7, alignItems: "center" }}>
            {!cluster && (
              <select value={target} onChange={(e) => setTarget(e.target.value)}
                style={{ padding: "5px 8px", borderRadius: 8, border: "1px solid var(--line2)", background: "var(--inset)", fontSize: 12.5 }}>
                {CLUSTER_TABS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            )}
            <button className="btn sm primary" style={{ background: color, borderColor: color }} disabled={busy}
              onClick={() => fileRef.current?.click()}>
              <ImagePlus size={13} /> {busy ? "Uploading…" : "Add session"}
            </button>
            <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={addPhotos} />
          </div>
        )}
      </div>
      {!cluster && clusters.length > 1 && (
        <div className="subtabs">
          {["", ...clusters].map((c) => (
            <button key={c || "all"} className={`stab ${view === c ? "on" : ""}`} onClick={() => setView(c)}>
              {c ? `${cShort(c)} · ${rows.filter((r) => r.data?.cluster === c).length}` : `All · ${rows.length}`}
            </button>
          ))}
        </div>
      )}
      {rows.length === 0 ? <div className="empty">No sessions yet — add one with its photo.</div> : (
        <div className="gallery">
          {ordered.filter((r) => !view || r.data?.cluster === view).map((r) => {
            const ph = r.data?.photos || [];
            const d = r.data || {};
            return (
              <button key={r.id} className="gtile" onClick={() => setOpen(r)} title={d.name}>
                {ph[0] && photoUrl(ph[0]) ? <img src={photoUrl(ph[0])} alt={d.name} loading="lazy" /> : <div className="nophoto">No photo</div>}
                {ph.length > 1 && <span className="more">+{ph.length - 1}</span>}
                <span className="cap">{!cluster && `${cShort(d.cluster)} · `}{d.date || d.name}</span>
              </button>
            );
          })}
        </div>
      )}
      {open && (
        <SessionModal row={open} photoUrl={photoUrl} editable={canEditRow("bb", open.data)}
          onClose={() => setOpen(null)} notify={notify} />
      )}
    </div>
  );
}

function SessionModal({ row, photoUrl, editable, onClose, notify }) {
  const [f, setF] = useState({ ...row.data, photos: row.data?.photos || [] });
  const [busy, setBusy] = useState(false);
  const [zoom, setZoom] = useState(null);
  const ref = useRef(null);
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }));

  async function save(next = f, close = true) {
    const { error } = await supabase.from("records").update({ data: next }).eq("id", row.id);
    if (error) return notify(error.message);
    if (close) { notify("Saved"); onClose(); }
  }
  async function addMore(e) {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;
    setBusy(true);
    const added = [];
    for (const file of files) {
      const path = `records/${row.id}/${file.name}`;
      const { error } = await supabase.storage.from("docs").upload(path, file, { upsert: true });
      if (error) notify(error.message); else added.push(`docs:${path}`);
    }
    const next = { ...f, photos: [...f.photos, ...added] };
    setF(next); await save(next, false); setBusy(false);
  }
  async function removePhoto(p) {
    if (!window.confirm("Remove this photo?")) return;
    if (isStored(p)) await supabase.storage.from("docs").remove([p.slice(5)]);
    const next = { ...f, photos: f.photos.filter((x) => x !== p) };
    setF(next); await save(next, false);
  }
  async function removeSession() {
    if (!window.confirm(`Delete ${f.name}? The session count goes down by one.`)) return;
    const stored = f.photos.filter(isStored).map((p) => p.slice(5));
    if (stored.length) await supabase.storage.from("docs").remove(stored);
    const { error } = await supabase.from("records").delete().eq("id", row.id);
    if (error) return notify(error.message);
    notify("Deleted"); onClose();
  }

  return (
    <Modal title={f.name} onClose={onClose} wide
      footer={<>
        {editable && <button className="btn sm danger" style={{ marginRight: "auto" }} onClick={removeSession}><Trash2 size={13} /> Delete session</button>}
        <button className="btn sm" onClick={onClose}>Close</button>
        {editable && <button className="btn sm primary" onClick={() => save()}>Save</button>}
      </>}>
      <div className="photostrip">
        {f.photos.map((p) => (
          <div key={p} className="ph">
            {photoUrl(p) ? <img src={photoUrl(p)} alt="" onClick={() => setZoom(photoUrl(p))} /> : null}
            {editable && <button className="x" title="Remove photo" onClick={() => removePhoto(p)}><X size={12} /></button>}
          </div>
        ))}
      </div>
      {editable && (
        <>
          <button className="btn sm" style={{ alignSelf: "flex-start" }} disabled={busy} onClick={() => ref.current?.click()}>
            <Upload size={13} /> {busy ? "Uploading…" : "Add photos to this session"}
          </button>
          <input ref={ref} type="file" accept="image/*" multiple hidden onChange={addMore} />
        </>
      )}
      <div className="grid2">
        <div className="field"><label>Session</label>
          <input value={f.name || ""} disabled={!editable} onChange={(e) => set("name", e.target.value)} /></div>
        <div className="field"><label>Date (optional)</label>
          <input type="date" value={f.date || ""} disabled={!editable} onChange={(e) => set("date", e.target.value)} /></div>
        <div className="field"><label>Venue (optional)</label>
          <input value={f.venue || ""} disabled={!editable} onChange={(e) => set("venue", e.target.value)} /></div>
        <div className="field"><label>Attendees (optional)</label>
          <input type="number" value={f.companies ?? ""} disabled={!editable} onChange={(e) => set("companies", e.target.value)} /></div>
      </div>
      {zoom && (
        <div className="overlay" onMouseDown={() => setZoom(null)} style={{ zIndex: 60 }}>
          <img src={zoom} alt="" style={{ maxWidth: "92vw", maxHeight: "88vh", borderRadius: 12 }} />
        </div>
      )}
    </Modal>
  );
}
