"use client";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Plus, Upload, Download, Search, Trash2, Phone, Mail, Linkedin, Paperclip, ExternalLink, FileText } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useApp } from "@/lib/ctx";
import { vColor, vName } from "@/lib/schemas";
import { exportCSV, parseCSV } from "@/lib/csv";
import Modal from "./Modal";
import Pill from "./Pill";

/**
 * Schema-driven table over one or more record sources (mirroring), scoped
 * to the selected FY (unless tabDef.noFy). tabDef.hasDocs adds attachments
 * (photos/files) to each entry.
 */
export default function DataTable({ pageVertical, tabDef, accentColor, defaults = {}, hideCols = [], extraFilter, title }) {
  const { canEditRow, notify, profile, fy } = useApp();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState(null);
  const fileRef = useRef(null);

  const sources = tabDef.sources || [{ vertical: tabDef.home || pageVertical, tab: tabDef.key }];
  const srcKey = JSON.stringify(sources) + fy + (tabDef.viewKey || tabDef.key);

  const homeFor = useCallback((data) => {
    if (tabDef.homeByField) {
      const v = tabDef.homeByField.map[data?.[tabDef.homeByField.field]];
      if (v) return v;
    }
    return tabDef.home || pageVertical;
  }, [tabDef, pageVertical]);

  const load = useCallback(async (initial = false) => {
    if (initial) { setRows([]); setLoading(true); }
    const results = await Promise.all(sources.map((s) => {
      let qy = supabase.from("records").select("*").eq("vertical", s.vertical).eq("tab", s.tab);
      if (!tabDef.noFy) qy = qy.eq("fy", fy);
      return qy;
    }));
    const all = results.flatMap((r) => r.data || []);
    all.sort((a, b) => (b.updated_at || "").localeCompare(a.updated_at || ""));
    setRows(all); setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [srcKey]);

  useEffect(() => { load(true); }, [load]);
  useEffect(() => {
    const ch = supabase.channel(`rec-${pageVertical}-${tabDef.viewKey || tabDef.key}-${title || "x"}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "records" }, () => load())
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, [pageVertical, tabDef, title, load]);

  const filtered = useMemo(() => {
    let out = rows;
    if (tabDef.filter) out = out.filter((r) => tabDef.filter(r.data || {}));
    if (extraFilter) out = out.filter((r) => extraFilter(r.data || {}));
    if (q) {
      const s = q.toLowerCase();
      out = out.filter((r) => Object.values(r.data || {}).some((v) => String(v ?? "").toLowerCase().includes(s)));
    }
    return out;
  }, [rows, q, tabDef, extraFilter]);

  const mirrored = sources.length > 1 || (tabDef.home && tabDef.home !== pageVertical);

  async function save(form, row) {
    const data = { ...defaults, ...form };
    if (profile.role === "cluster_head" && tabDef.columns.some((c) => c.key === "cluster") && !data.cluster)
      data.cluster = profile.cluster;
    const home = row ? row.vertical : homeFor(data);
    if (!canEditRow(home, data))
      return notify("No edit rights for this entry — check the cluster/policy you picked.");
    const res = row
      ? await supabase.from("records").update({ data }).eq("id", row.id)
      : await supabase.from("records").insert([{ vertical: home, tab: tabDef.key, fy, data }]).select().single();
    if (res.error) { notify(res.error.message); return null; }
    notify("Saved"); load();
    return res.data || row;
  }

  async function remove(row) {
    if (tabDef.hasDocs) {
      const { data } = await supabase.storage.from("docs").list(`records/${row.id}`);
      if (data?.length) await supabase.storage.from("docs").remove(data.map((f) => `records/${row.id}/${f.name}`));
    }
    const { error } = await supabase.from("records").delete().eq("id", row.id);
    notify(error ? error.message : "Deleted"); setEditing(null); load();
  }

  async function importFile(e) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    try {
      const parsed = await parseCSV(f, tabDef.columns);
      if (!parsed.length) return notify("No matching rows found in file");
      const groups = {};
      parsed.forEach((d) => {
        const data = { ...defaults, ...d };
        const h = homeFor(data);
        (groups[h] = groups[h] || []).push({ vertical: h, tab: tabDef.key, fy, data });
      });
      for (const h of Object.keys(groups)) {
        const { error } = await supabase.from("records").insert(groups[h]);
        if (error) return notify(error.message);
      }
      notify(`Imported ${parsed.length} rows`); load();
    } catch { notify("Could not read that file"); }
  }

  const visibleCols = tabDef.columns.filter((c) => !c.hide && !hideCols.includes(c.key));

  return (
    <div className="card">
      <div className="card-head">
        <div>
          <div className="t">{title || tabDef.label} · {filtered.length}</div>
          {(tabDef.sub || mirrored) && (
            <div className="s">{tabDef.sub || "Shared dataset — entries appear in every vertical that tracks them"}</div>
          )}
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 7, alignItems: "center", flexWrap: "wrap" }}>
          <div className="searchbox">
            <Search size={13} style={{ color: "var(--faint)" }} />
            <input placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <button className="btn sm" onClick={() => exportCSV(filtered, tabDef.columns, `kdem_${tabDef.viewKey || tabDef.key}.csv`)}>
            <Download size={13} /> Export
          </button>
          <button className="btn sm" onClick={() => fileRef.current?.click()}>
            <Upload size={13} /> Import
          </button>
          <input ref={fileRef} type="file" accept=".csv" hidden onChange={importFile} />
          <button className="btn sm primary" style={{ background: accentColor, borderColor: accentColor }}
            onClick={() => setEditing({ data: { ...defaults } })}>
            <Plus size={13} /> Add
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loadingrow">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="empty">Nothing here yet — add an entry or import a CSV.</div>
      ) : (
        <div className="tablewrap">
          <table className="data">
            <thead>
              <tr>
                {visibleCols.map((c) => (
                  <th key={c.key} style={c.type === "number" ? { textAlign: "right" } : undefined}>{c.label}</th>
                ))}
                {tabDef.hasContact && <th>Contact</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} onClick={() => setEditing(r)}>
                  {visibleCols.map((c, i) => {
                    const v = r.data?.[c.key];
                    const first = i === 0;
                    if (c.type === "select")
                      return <td key={c.key}>{first && mirrored && <Origin v={r.vertical} />}<Pill value={v} /></td>;
                    if (c.type === "number")
                      return <td key={c.key} className="num-cell">{v != null && v !== "" ? Number(v).toLocaleString("en-IN") : "—"}</td>;
                    return (
                      <td key={c.key} style={first ? { fontWeight: 600 } : { color: "var(--muted)" }}>
                        {first && mirrored && <Origin v={r.vertical} />}{v || "—"}
                      </td>
                    );
                  })}
                  {tabDef.hasContact && <ContactCell d={r.data} />}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <RecordModal
          tabDef={tabDef} hideCols={hideCols}
          row={editing.id ? editing : null}
          initial={editing.data || {}}
          editable={editing.id ? canEditRow(editing.vertical, editing.data) : true}
          onSave={save} onDelete={remove} onClose={() => setEditing(null)} notify={notify}
        />
      )}
    </div>
  );
}

function Origin({ v }) {
  return <span className="origin" style={{ background: vColor(v) }} title={`Tracked by ${vName(v)}`} />;
}

function ContactCell({ d }) {
  const stop = (e) => e.stopPropagation();
  const any = d?.contact_name || d?.contact_phone || d?.contact_email || d?.contact_linkedin;
  return (
    <td onClick={stop} style={{ whiteSpace: "nowrap" }}>
      {!any ? <span style={{ color: "var(--faint)" }}>—</span> : (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 2 }}>
          {d.contact_name && <span style={{ fontSize: 12, color: "var(--muted)", marginRight: 5 }} title={d.contact_designation || ""}>{d.contact_name}</span>}
          {d.contact_phone && <a className="iconlink" href={`tel:${d.contact_phone}`} title={d.contact_phone}><Phone size={14} /></a>}
          {d.contact_email && <a className="iconlink" href={`mailto:${d.contact_email}`} title={d.contact_email}><Mail size={14} /></a>}
          {d.contact_linkedin && <a className="iconlink" href={d.contact_linkedin} target="_blank" rel="noreferrer" title="LinkedIn"><Linkedin size={14} /></a>}
        </span>
      )}
    </td>
  );
}

function RecordModal({ tabDef, hideCols, row, initial, editable, onSave, onDelete, onClose, notify }) {
  const [form, setForm] = useState(() => ({ ...initial, ...(row?.data || {}) }));
  const [id, setId] = useState(row?.id || null);
  const [docs, setDocs] = useState([]);
  const [uploading, setUploading] = useState(false);
  const docRef = useRef(null);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const cols = tabDef.columns.filter((c) => !hideCols.includes(c.key));
  const firstKey = tabDef.columns[0].key;

  const listDocs = useCallback(async (rid) => {
    if (!rid || !tabDef.hasDocs) return;
    const { data } = await supabase.storage.from("docs").list(`records/${rid}`);
    setDocs(data || []);
  }, [tabDef.hasDocs]);
  useEffect(() => { listDocs(id); }, [id, listDocs]);

  async function persist(stayOpen) {
    if (!form[firstKey]) return null;
    const saved = await onSave(form, row || (id ? { id, vertical: null } : null));
    const rid = id || saved?.id || null;
    if (!id && rid) setId(rid);
    if (!stayOpen) onClose();
    return rid;
  }

  async function upload(e) {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;
    let rid = id || (await persist(true));
    if (!rid) return notify("Fill the first field, then attach");
    setUploading(true);
    for (const file of files) {
      const { error } = await supabase.storage.from("docs").upload(`records/${rid}/${file.name}`, file, { upsert: true });
      if (error) notify(error.message);
    }
    setUploading(false); listDocs(rid); notify("Uploaded");
  }
  async function openDoc(name) {
    const { data } = await supabase.storage.from("docs").createSignedUrl(`records/${id}/${name}`, 3600);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
  }
  async function deleteDoc(name) {
    await supabase.storage.from("docs").remove([`records/${id}/${name}`]);
    listDocs(id);
  }

  return (
    <Modal title={id ? "Edit entry" : "New entry"} onClose={onClose}
      footer={
        <>
          {id && row && editable && (
            <button className="btn sm danger" style={{ marginRight: "auto" }} onClick={() => onDelete(row)}>
              <Trash2 size={13} /> Delete
            </button>
          )}
          <button className="btn sm" onClick={onClose}>Cancel</button>
          {editable && <button className="btn sm primary" onClick={() => persist(false)}>Save</button>}
        </>
      }>
      <div className="grid2">
        {cols.map((c) => (
          <div className="field" key={c.key} style={c.type === "textarea" ? { gridColumn: "1 / -1" } : undefined}>
            <label>{c.label}</label>
            {c.type === "select" ? (
              <select disabled={!editable} value={form[c.key] ?? ""} onChange={(e) => set(c.key, e.target.value)}>
                <option value="">—</option>
                {c.options.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            ) : c.type === "textarea" ? (
              <textarea disabled={!editable} value={form[c.key] ?? ""} onChange={(e) => set(c.key, e.target.value)} />
            ) : (
              <input disabled={!editable}
                type={c.type === "number" ? "number" : c.type === "date" ? "date" : "text"}
                value={form[c.key] ?? ""} onChange={(e) => set(c.key, e.target.value)} />
            )}
          </div>
        ))}
      </div>
      {tabDef.hasDocs && (
        <>
          <div className="subhead"><Paperclip size={12} style={{ verticalAlign: -1, marginRight: 5 }} />Photos & documents</div>
          {docs.map((d) => (
            <div key={d.name} className="docrow">
              <FileText size={14} style={{ color: "var(--brand)" }} />
              <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.name}</span>
              <button className="btn ghost sm" onClick={() => openDoc(d.name)}><ExternalLink size={13} /></button>
              {editable && <button className="btn ghost sm" onClick={() => deleteDoc(d.name)}><Trash2 size={13} /></button>}
            </div>
          ))}
          {editable && (
            <>
              <button className="btn sm" style={{ alignSelf: "flex-start" }} disabled={uploading}
                onClick={() => docRef.current?.click()}>
                <Upload size={13} /> {uploading ? "Uploading…" : "Attach files"}
              </button>
              <input ref={docRef} type="file" multiple hidden onChange={upload} />
            </>
          )}
        </>
      )}
    </Modal>
  );
}
