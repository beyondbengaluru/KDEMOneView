"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Paperclip, FileText, ExternalLink, Trash2, Upload } from "lucide-react";
import { supabase } from "@/lib/supabase";

/**
 * Files stored under docs/<folder>/<id>/. `ensureId` saves the parent first
 * when it's new, so you can attach while creating a task or meeting.
 */
export default function Attachments({ folder, id, ensureId, editable = true, notify }) {
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const ref = useRef(null);

  const list = useCallback(async (rid) => {
    if (!rid) return setFiles([]);
    const { data } = await supabase.storage.from("docs").list(`${folder}/${rid}`);
    setFiles((data || []).filter((f) => f.name !== ".emptyFolderPlaceholder"));
  }, [folder]);
  useEffect(() => { list(id); }, [id, list]);

  async function upload(e) {
    const picked = Array.from(e.target.files || []);
    e.target.value = "";
    if (!picked.length) return;
    const rid = id || (ensureId && (await ensureId()));
    if (!rid) return notify?.("Fill in the title first, then attach");
    setBusy(true);
    for (const f of picked) {
      const { error } = await supabase.storage.from("docs").upload(`${folder}/${rid}/${f.name}`, f, { upsert: true });
      if (error) notify?.(error.message);
    }
    setBusy(false); list(rid);
  }
  async function open(name) {
    const { data } = await supabase.storage.from("docs").createSignedUrl(`${folder}/${id}/${name}`, 3600);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
  }
  async function remove(name) {
    if (!window.confirm(`Remove ${name}?`)) return;
    await supabase.storage.from("docs").remove([`${folder}/${id}/${name}`]);
    list(id);
  }

  return (
    <>
      <div className="subhead"><Paperclip size={12} style={{ verticalAlign: -1, marginRight: 5 }} />Documents</div>
      {files.map((f) => (
        <div key={f.name} className="docrow">
          <FileText size={14} style={{ color: "var(--brand)" }} />
          <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</span>
          <button className="btn ghost sm" onClick={() => open(f.name)} title="Open"><ExternalLink size={13} /></button>
          {editable && <button className="btn ghost sm" onClick={() => remove(f.name)} title="Remove"><Trash2 size={13} /></button>}
        </div>
      ))}
      {!files.length && !editable && <div style={{ fontSize: 12, color: "var(--faint)" }}>No documents.</div>}
      {editable && (
        <>
          <button className="btn sm" style={{ alignSelf: "flex-start" }} disabled={busy} onClick={() => ref.current?.click()}>
            <Upload size={13} /> {busy ? "Uploading…" : "Attach files"}
          </button>
          <input ref={ref} type="file" multiple hidden onChange={upload} />
        </>
      )}
    </>
  );
}
