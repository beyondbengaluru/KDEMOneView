"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { Plus, Trash2, FileText, Upload, ExternalLink, X, CheckCircle2, Circle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useApp } from "@/lib/ctx";
import { PROPOSAL_STATUSES, PROPOSAL_TARGETS, PROPOSAL_CATEGORIES, BB_CLUSTERS } from "@/lib/schemas";
import Modal from "./Modal";
import Pill from "./Pill";

/**
 * Non-numeric deliverables as cards: proposals submitted to KITS/GoK etc.
 * Each opens with status, summary, NEXT STEPS table, and multiple document
 * uploads (Supabase Storage bucket `docs`). No fake percentages.
 */
export default function ProposalsBoard({ vertical, accentColor, clusterFilter }) {
  const { canWrite, notify } = useApp();
  const editable = canWrite(vertical);
  const [rows, setRows] = useState([]);
  const [open, setOpen] = useState(null);

  const load = useCallback(async () => {
    const { data } = await supabase.from("records").select("*")
      .eq("vertical", vertical).eq("tab", "proposals")
      .order("updated_at", { ascending: false });
    setRows((data || []).filter((r) => !clusterFilter || r.data?.cluster === clusterFilter));
  }, [vertical, clusterFilter]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const ch = supabase.channel(`props-${vertical}-${clusterFilter || "all"}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "records", filter: `vertical=eq.${vertical}` }, () => load())
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, [vertical, clusterFilter, load]);

  async function save(data, id) {
    if (clusterFilter && !data.cluster) data.cluster = clusterFilter;
    const res = id
      ? await supabase.from("records").update({ data }).eq("id", id)
      : await supabase.from("records").insert([{ vertical, tab: "proposals", data }]).select().single();
    if (res.error) return notify(res.error.message);
    notify("Saved");
    load();
    return res.data; // for new proposals, so docs can attach immediately
  }
  async function remove(id) {
    await supabase.storage.from("docs").list(`proposals/${id}`).then(({ data }) =>
      data?.length && supabase.storage.from("docs").remove(data.map((f) => `proposals/${id}/${f.name}`)));
    const { error } = await supabase.from("records").delete().eq("id", id);
    notify(error ? error.message : "Deleted"); setOpen(null); load();
  }

  return (
    <div className="card">
      <div className="card-head">
        <div>
          <div className="t">Proposals & strategic initiatives · {rows.length}</div>
          <div className="s">Reports, CoEs, infrastructure & programs — documents and next steps, tracked to KITS/GoK</div>
        </div>
        {editable && (
          <button className="btn sm primary" style={{ marginLeft: "auto", background: accentColor, borderColor: accentColor }}
            onClick={() => setOpen({ data: { status: "Drafting", steps: [] } })}>
            <Plus size={13} /> New proposal
          </button>
        )}
      </div>

      {rows.length === 0 ? (
        <div className="empty">No proposals yet. These are your non-numeric deliverables — reports, CoEs, EV City, IT parks…</div>
      ) : (
        <div className="propgrid">
          {rows.map((r) => {
            const d = r.data || {};
            const openSteps = (d.steps || []).filter((s) => !s.done);
            return (
              <button key={r.id} className="prop" onClick={() => setOpen(r)}>
                <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <FileText size={16} style={{ color: accentColor, marginTop: 2, flex: "0 0 auto" }} />
                  <div style={{ fontWeight: 700, fontSize: 13.5, lineHeight: 1.35 }}>{d.title}</div>
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <Pill value={d.status} />
                  {d.category && <span className="pill" style={{ color: "var(--muted)", background: "var(--inset)" }}>{d.category}</span>}
                  {d.cluster && <span className="pill" style={{ color: "var(--gold)", background: "color-mix(in srgb, var(--gold) 14%, transparent)" }}>{d.cluster}</span>}
                </div>
                <div style={{ fontSize: 11.5, color: "var(--faint)", marginTop: "auto" }}>
                  {d.submitted_to ? `→ ${d.submitted_to} · ` : ""}
                  {openSteps.length ? `Next: ${openSteps[0].what}` : "No open next steps"}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {open && (
        <ProposalModal row={open.id ? open : null} initial={open.data} vertical={vertical}
          editable={editable} showCluster={vertical === "bb"}
          onSave={save} onDelete={remove} onClose={() => setOpen(null)} notify={notify} />
      )}
    </div>
  );
}

function ProposalModal({ row, initial, editable, showCluster, onSave, onDelete, onClose, notify }) {
  const [f, setF] = useState({ steps: [], ...initial });
  const [id, setId] = useState(row?.id || null);
  const [docs, setDocs] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }));

  const listDocs = useCallback(async (pid) => {
    if (!pid) return;
    const { data } = await supabase.storage.from("docs").list(`proposals/${pid}`);
    setDocs(data || []);
  }, []);
  useEffect(() => { listDocs(id); }, [id, listDocs]);

  async function persist() {
    if (!f.title) return;
    const saved = await onSave(f, id);
    if (!id && saved?.id) setId(saved.id); // stay open → docs can be attached
    else onClose();
  }

  async function upload(e) {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;
    let pid = id;
    if (!pid) {
      if (!f.title) return notify("Add a title first");
      const saved = await onSave(f, null);
      if (!saved?.id) return;
      pid = saved.id; setId(pid);
    }
    setUploading(true);
    for (const file of files) {
      const { error } = await supabase.storage.from("docs")
        .upload(`proposals/${pid}/${file.name}`, file, { upsert: true });
      if (error) notify(error.message);
    }
    setUploading(false);
    listDocs(pid);
    notify("Uploaded");
  }

  async function openDoc(name) {
    const { data } = await supabase.storage.from("docs").createSignedUrl(`proposals/${id}/${name}`, 3600);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
  }
  async function deleteDoc(name) {
    await supabase.storage.from("docs").remove([`proposals/${id}/${name}`]);
    listDocs(id);
  }

  const steps = f.steps || [];
  const setStep = (i, k, v) => set("steps", steps.map((s, j) => (j === i ? { ...s, [k]: v } : s)));

  return (
    <Modal title={id ? "Proposal" : "New proposal"} onClose={onClose} wide
      footer={
        <>
          {id && editable && (
            <button className="btn sm danger" style={{ marginRight: "auto" }} onClick={() => onDelete(id)}>
              <Trash2 size={13} /> Delete
            </button>
          )}
          <button className="btn sm" onClick={onClose}>Close</button>
          {editable && <button className="btn sm primary" onClick={persist}>Save</button>}
        </>
      }>
      <div className="field"><label>Title</label>
        <input value={f.title ?? ""} onChange={(e) => set("title", e.target.value)} disabled={!editable} autoFocus /></div>
      <div className="grid2">
        <div className="field"><label>Submitted to</label>
          <select value={f.submitted_to ?? ""} onChange={(e) => set("submitted_to", e.target.value)} disabled={!editable}>
            <option value="">—</option>
            {PROPOSAL_TARGETS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select></div>
        <div className="field"><label>Category</label>
          <select value={f.category ?? ""} onChange={(e) => set("category", e.target.value)} disabled={!editable}>
            <option value="">—</option>
            {PROPOSAL_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select></div>
        <div className="field"><label>Status</label>
          <select value={f.status ?? "Drafting"} onChange={(e) => set("status", e.target.value)} disabled={!editable}>
            {PROPOSAL_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select></div>
        <div className="field"><label>Owner</label>
          <input value={f.owner ?? ""} onChange={(e) => set("owner", e.target.value)} disabled={!editable} /></div>
        {showCluster && (
          <div className="field"><label>Cluster (optional)</label>
            <select value={f.cluster ?? ""} onChange={(e) => set("cluster", e.target.value)} disabled={!editable}>
              <option value="">— core / statewide —</option>
              {BB_CLUSTERS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select></div>
        )}
      </div>
      <div className="field"><label>Summary / current progress</label>
        <textarea value={f.summary ?? ""} onChange={(e) => set("summary", e.target.value)} disabled={!editable} /></div>

      <div className="subhead">Next steps</div>
      {steps.length === 0 && <div style={{ fontSize: 12.5, color: "var(--faint)" }}>No next steps yet.</div>}
      {steps.map((s, i) => (
        <div key={i} className="steps-row">
          <input placeholder="What needs to happen" value={s.what ?? ""} disabled={!editable}
            onChange={(e) => setStep(i, "what", e.target.value)}
            style={{ padding: "8px 10px", border: "1px solid var(--line2)", borderRadius: 9, background: "var(--inset)" }} />
          <input placeholder="Who" value={s.who ?? ""} disabled={!editable}
            onChange={(e) => setStep(i, "who", e.target.value)}
            style={{ padding: "8px 10px", border: "1px solid var(--line2)", borderRadius: 9, background: "var(--inset)" }} />
          <input type="date" value={s.due ?? ""} disabled={!editable}
            onChange={(e) => setStep(i, "due", e.target.value)}
            style={{ padding: "8px 10px", border: "1px solid var(--line2)", borderRadius: 9, background: "var(--inset)" }} />
          <button className="btn ghost sm" title={s.done ? "Done" : "Mark done"} disabled={!editable}
            onClick={() => setStep(i, "done", !s.done)}>
            {s.done ? <CheckCircle2 size={15} style={{ color: "var(--good)" }} /> : <Circle size={15} />}
          </button>
          <button className="btn ghost sm" disabled={!editable}
            onClick={() => set("steps", steps.filter((_, j) => j !== i))}><X size={14} /></button>
        </div>
      ))}
      {editable && (
        <button className="btn sm ghost" style={{ alignSelf: "flex-start" }}
          onClick={() => set("steps", [...steps, { what: "", who: "", due: "", done: false }])}>
          <Plus size={13} /> Add step
        </button>
      )}

      <div className="subhead">Documents</div>
      {!id && <div style={{ fontSize: 12.5, color: "var(--faint)" }}>Documents attach once the proposal is saved — click Save or upload to auto-save.</div>}
      {docs.map((d) => (
        <div key={d.name} className="docrow">
          <FileText size={14} style={{ color: "var(--brand)" }} />
          <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.name}</span>
          <button className="btn ghost sm" onClick={() => openDoc(d.name)} title="Open"><ExternalLink size={13} /></button>
          {editable && <button className="btn ghost sm" onClick={() => deleteDoc(d.name)} title="Remove"><Trash2 size={13} /></button>}
        </div>
      ))}
      {editable && (
        <>
          <button className="btn sm" style={{ alignSelf: "flex-start" }} disabled={uploading}
            onClick={() => fileRef.current?.click()}>
            <Upload size={13} /> {uploading ? "Uploading…" : "Upload documents"}
          </button>
          <input ref={fileRef} type="file" multiple hidden onChange={upload} />
        </>
      )}
    </Modal>
  );
}
