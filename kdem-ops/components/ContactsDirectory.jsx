"use client";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Plus, Upload, Download, Search, Phone, Mail, Linkedin, Contact } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useApp } from "@/lib/ctx";
import { BB_CLUSTERS, CONTACT_COLS, dbTabs, isExpansion, isLanded, isPipeline, vColor, vName } from "@/lib/schemas";
import { exportCSV, parseCSV } from "@/lib/csv";
import { RecordModal } from "./DataTable";
import { useSort } from "@/lib/sort";

const TAB_LABEL = {
  datacentres: "Data centres", investments: "ESDM investments", startups: "Startups",
  policyreg: "Policy registrations", polstrategy: "Policy strategy", partnerships: "Partnerships",
  seedfund: "Seed fund", programs: "Programs", jobs: "Jobs", roadshows: "Roadshows", awareness: "Awareness sessions",
  db_companies: "Directory",
};
const COMPANY_TABS = ["gccs", "datacentres", "investments", "startups", "policyreg", "polstrategy", "partnerships", "db_companies"];
const SKIP_TABS = ["proposals", "metrics", "bb_sections", "db_people"];
const hasContact = (d) => d.contact_name || d.contact_phone || d.contact_email || d.contact_linkedin;
const norm = (s) => String(s || "").trim().toLowerCase();

// Editing a contact that lives on a tracker entry edits that entry
const CONTACT_EDIT = {
  key: "contact_edit", label: "Contact",
  columns: [{ key: "name", label: "Company / entry", type: "text" }, ...CONTACT_COLS.map((c) => ({ ...c, hide: false }))],
};

/**
 * A vertical's Database: what was typed in here directly, plus every
 * company and contact person already entered anywhere in the vertical
 * (for Beyond Bengaluru: anything in a BB cluster, from any vertical).
 */
export default function ContactsDirectory({ vertical, accentColor }) {
  const { canEditRow, notify, profile } = useApp();
  const [sub, setSub] = useState("contacts");
  const [recs, setRecs] = useState(null);
  const [sectionNames, setSectionNames] = useState({});
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState(null); // { tabDef, row, initial }
  const csvRef = useRef(null);
  const vcfRef = useRef(null);
  const [DB_COMPANIES, DB_PEOPLE] = dbTabs(vertical);

  const load = useCallback(async () => {
    let qy = supabase.from("records").select("id,vertical,tab,fy,data,updated_at");
    if (vertical !== "bb") qy = qy.eq("vertical", vertical);
    const [{ data }, defs] = await Promise.all([
      qy,
      vertical === "bb"
        ? supabase.from("records").select("data").eq("vertical", "bb").eq("tab", "bb_sections")
        : Promise.resolve({ data: [] }),
    ]);
    const inScope = (r) => vertical !== "bb" || r.vertical === "bb" || BB_CLUSTERS.includes(r.data?.cluster);
    setRecs((data || []).filter((r) => inScope(r) && !["proposals", "metrics", "bb_sections"].includes(r.tab)));
    setSectionNames(Object.fromEntries((defs.data || []).map((d) => [d.data?.key, d.data?.name])));
  }, [vertical]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const ch = supabase.channel(`dir-${vertical}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "records" }, load)
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, [vertical, load]);

  const sourceOf = useCallback((r) => {
    const d = r.data || {};
    if (r.tab === "gccs") return isPipeline(d) ? "Pipeline" : isLanded(d) ? (isExpansion(d) ? "Expansion" : "New company") : "Companies";
    if (r.tab.startsWith("cs_")) return sectionNames[r.tab] || "Custom section";
    return TAB_LABEL[r.tab] || r.tab;
  }, [sectionNames]);

  const contacts = useMemo(() => {
    if (!recs) return [];
    const manual = recs.filter((r) => r.tab === "db_people" && r.vertical === vertical).map((r) => ({
      id: r.id, rec: r, manual: true, name: r.data.name, company: r.data.company, designation: r.data.designation,
      cluster: r.data.cluster, phone: r.data.contact_phone, email: r.data.contact_email, linkedin: r.data.contact_linkedin,
      source: "Added here",
    }));
    const derived = recs.filter((r) => !SKIP_TABS.includes(r.tab) && hasContact(r.data || {})).map((r) => ({
      id: r.id, rec: r, manual: false, name: r.data.contact_name || "—", company: r.data.name,
      designation: r.data.contact_designation, cluster: r.data.cluster, phone: r.data.contact_phone,
      email: r.data.contact_email, linkedin: r.data.contact_linkedin, source: sourceOf(r),
    }));
    return [...manual, ...derived].sort((a, b) => norm(a.name).localeCompare(norm(b.name)));
  }, [recs, vertical, sourceOf]);

  const companies = useMemo(() => {
    if (!recs) return [];
    const map = new Map();
    recs.filter((r) => COMPANY_TABS.includes(r.tab) || r.tab.startsWith("cs_")).forEach((r) => {
      const d = r.data || {};
      if (!d.name) return;
      const k = norm(d.name);
      const e = map.get(k) || { key: k, name: d.name, clusters: new Set(), sources: new Set(), contacts: 0, manual: null, sector: "", recs: [] };
      if (d.cluster) e.clusters.add(d.cluster);
      if (r.tab === "db_companies" && r.vertical === vertical) { e.manual = r; e.sector = d.sector || d.status || ""; }
      else e.sources.add(sourceOf(r));
      if (hasContact(d)) e.contacts++;
      e.recs.push(r);
      map.set(k, e);
    });
    contacts.filter((c) => c.manual && c.company).forEach((c) => { const e = map.get(norm(c.company)); if (e) e.contacts++; });
    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [recs, contacts, vertical, sourceOf]);

  const s = q.toLowerCase();
  const shownContacts = !q ? contacts : contacts.filter((c) =>
    [c.name, c.company, c.designation, c.cluster, c.phone, c.email, c.source].some((x) => String(x || "").toLowerCase().includes(s)));
  const shownCompanies = !q ? companies : companies.filter((c) =>
    [c.name, c.sector, ...c.clusters, ...c.sources].some((x) => String(x || "").toLowerCase().includes(s)));

  const cs = useSort(shownContacts, { contact: (c) => c.phone || c.email || c.linkedin });
  const ks = useSort(shownCompanies, {
    cluster: (c) => [...c.clusters].join(", "), from: (c) => [...c.sources, ...(c.manual ? ["Directory"] : [])].join(", "),
  });

  // ---------- writes ----------
  async function saveManual(tabDef, form, row) {
    const data = { ...form };
    if (profile?.role === "cluster_head" && !data.cluster) data.cluster = profile.cluster;
    if (!canEditRow(row?.vertical || vertical, data)) { notify("No edit rights for this entry"); return undefined; }
    const res = row?.id
      ? await supabase.from("records").update({ data }).eq("id", row.id)
      : await supabase.from("records").insert([{ vertical, tab: tabDef.key, data }]).select().single();
    if (res.error) { notify(res.error.message); return null; }
    notify("Saved"); load();
    return res.data || row;
  }
  async function saveOnSource(rec, form) {
    const data = { ...rec.data, ...form };
    const { error } = await supabase.from("records").update({ data }).eq("id", rec.id);
    if (error) { notify(error.message); return null; }
    notify("Saved"); load();
    return rec;
  }
  async function remove(row) {
    const { error } = await supabase.from("records").delete().eq("id", row.id);
    notify(error ? error.message : "Deleted"); setEditing(null); load();
  }

  function openContact(c) {
    if (c.manual) return setEditing({ tabDef: DB_PEOPLE, row: c.rec, manual: true });
    setEditing({ tabDef: CONTACT_EDIT, row: c.rec, manual: false });
  }
  function openCompany(c) {
    if (c.manual) return setEditing({ tabDef: DB_COMPANIES, row: c.manual, manual: true });
    // Not in the directory yet — add it, so sector / status / notes can be kept
    setEditing({ tabDef: DB_COMPANIES, row: null, manual: true, initial: { name: c.name, cluster: [...c.clusters][0] || "" } });
  }

  async function importCSV(e) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    const tabDef = sub === "contacts" ? DB_PEOPLE : DB_COMPANIES;
    try {
      const rows = await parseCSV(f, tabDef.columns);
      if (!rows.length) return notify("No matching rows found in file");
      const { error } = await supabase.from("records").insert(rows.map((data) => ({ vertical, tab: tabDef.key, data: withCluster(data) })));
      if (error) return notify(error.message);
      notify(`Imported ${rows.length}`); load();
    } catch { notify("Could not read that file"); }
  }
  const withCluster = (d) => (profile?.role === "cluster_head" && !d.cluster ? { ...d, cluster: profile.cluster } : d);

  // Contacts shared from a phone (WhatsApp "Share contact", iPhone/Android
  // exports) arrive as .vcf files — one file can hold many cards.
  async function importVCF(e) {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;
    const cards = (await Promise.all(files.map((f) => f.text()))).flatMap(parseVCards);
    const known = new Set(contacts.flatMap((c) => [norm(c.phone).replace(/\D/g, "").slice(-10), norm(c.email)]).filter(Boolean));
    const fresh = cards.filter((c) => {
      const keys = [norm(c.contact_phone).replace(/\D/g, "").slice(-10), norm(c.contact_email)].filter(Boolean);
      return !keys.some((k) => known.has(k));
    });
    if (!fresh.length) return notify(cards.length ? "Already in the database" : "No contacts found in that file");
    const { error } = await supabase.from("records").insert(fresh.map((data) => ({
      vertical, tab: "db_people", data: withCluster({ ...data, context: data.context || "Imported from phone contact" }),
    })));
    if (error) return notify(error.message);
    notify(`Added ${fresh.length} contact${fresh.length > 1 ? "s" : ""}${cards.length > fresh.length ? ` · ${cards.length - fresh.length} already here` : ""}`);
    load();
  }

  function doExport() {
    if (sub === "contacts")
      exportCSV(shownContacts, [
        { key: "name", label: "Name" }, { key: "company", label: "Company" }, { key: "designation", label: "Designation" },
        { key: "cluster", label: "Cluster" }, { key: "phone", label: "Phone" }, { key: "email", label: "Email" },
        { key: "linkedin", label: "LinkedIn" }, { key: "source", label: "From" },
      ], `kdem_${vertical}_contacts.csv`);
    else
      exportCSV(shownCompanies.map((c) => ({ ...c, cluster: [...c.clusters].join("; "), from: [...c.sources, ...(c.manual ? ["Directory"] : [])].join("; ") })), [
        { key: "name", label: "Company" }, { key: "cluster", label: "Cluster" }, { key: "from", label: "Found in" },
        { key: "contacts", label: "Contacts" }, { key: "sector", label: "Sector / status" },
      ], `kdem_${vertical}_companies.csv`);
  }

  const ed = editing;
  return (
    <div className="card">
      <div className="card-head">
        <div className="subtabs" style={{ padding: 0 }}>
          <button className={`stab ${sub === "contacts" ? "on" : ""}`} onClick={() => setSub("contacts")}>Contacts · {contacts.length}</button>
          <button className={`stab ${sub === "companies" ? "on" : ""}`} onClick={() => setSub("companies")}>Companies · {companies.length}</button>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 7, alignItems: "center", flexWrap: "wrap" }}>
          <div className="searchbox">
            <Search size={13} style={{ color: "var(--faint)" }} />
            <input placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <button className="btn sm" onClick={doExport}><Download size={13} /> Export</button>
          <button className="btn sm" onClick={() => csvRef.current?.click()}><Upload size={13} /> Import CSV</button>
          <input ref={csvRef} type="file" accept=".csv" hidden onChange={importCSV} />
          {sub === "contacts" && (
            <>
              <button className="btn sm" title="Contact cards (.vcf) from WhatsApp or your phone" onClick={() => vcfRef.current?.click()}>
                <Contact size={13} /> Import .vcf
              </button>
              <input ref={vcfRef} type="file" accept=".vcf,text/vcard,text/x-vcard" multiple hidden onChange={importVCF} />
            </>
          )}
          <button className="btn sm primary" style={{ background: accentColor, borderColor: accentColor }}
            onClick={() => setEditing({ tabDef: sub === "contacts" ? DB_PEOPLE : DB_COMPANIES, row: null, manual: true })}>
            <Plus size={13} /> Add
          </button>
        </div>
      </div>

      {!recs ? <div className="loadingrow">Loading…</div> : sub === "contacts" ? (
        shownContacts.length === 0 ? <div className="empty">No contacts yet.</div> : (
          <div className="tablewrap">
            <table className="data">
              <thead><tr><th {...cs.th("name")}>Name</th><th {...cs.th("company")}>Company</th><th {...cs.th("designation")}>Designation</th><th {...cs.th("cluster")}>Cluster</th><th {...cs.th("contact")}>Contact</th><th {...cs.th("source")}>From</th></tr></thead>
              <tbody>
                {cs.sorted.map((c) => (
                  <tr key={`${c.manual ? "m" : "d"}-${c.id}`} onClick={() => openContact(c)}>
                    <td style={{ fontWeight: 600 }}>{c.name}</td>
                    <td style={{ color: "var(--muted)" }}>{c.company || "—"}</td>
                    <td style={{ color: "var(--muted)" }}>{c.designation || "—"}</td>
                    <td style={{ color: "var(--muted)" }}>{c.cluster || "—"}</td>
                    <td onClick={(e) => e.stopPropagation()} style={{ whiteSpace: "nowrap" }}>
                      {c.phone && <a className="iconlink" href={`tel:${c.phone}`} title={c.phone}><Phone size={14} /></a>}
                      {c.email && <a className="iconlink" href={`mailto:${c.email}`} title={c.email}><Mail size={14} /></a>}
                      {c.linkedin && <a className="iconlink" href={c.linkedin} target="_blank" rel="noreferrer" title="LinkedIn"><Linkedin size={14} /></a>}
                      {!c.phone && !c.email && !c.linkedin && <span style={{ color: "var(--faint)" }}>—</span>}
                    </td>
                    <td>
                      <span className="srcpill">
                        {!c.manual && c.rec.vertical !== vertical && <span className="origin" style={{ background: vColor(c.rec.vertical) }} title={vName(c.rec.vertical)} />}
                        {c.source}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        shownCompanies.length === 0 ? <div className="empty">No companies yet.</div> : (
          <div className="tablewrap">
            <table className="data">
              <thead><tr><th {...ks.th("name")}>Company</th><th {...ks.th("cluster")}>Cluster</th><th {...ks.th("from")}>Found in</th><th {...ks.th("contacts", { style: { textAlign: "right" } })}>Contacts</th><th {...ks.th("sector")}>Sector / status</th></tr></thead>
              <tbody>
                {ks.sorted.map((c) => (
                  <tr key={c.key} onClick={() => openCompany(c)}>
                    <td style={{ fontWeight: 600 }}>{c.name}</td>
                    <td style={{ color: "var(--muted)" }}>{[...c.clusters].join(", ") || "—"}</td>
                    <td><span style={{ display: "inline-flex", gap: 4, flexWrap: "wrap" }}>
                      {[...c.sources].map((x) => <span key={x} className="srcpill">{x}</span>)}
                      {c.manual && <span className="srcpill">Directory</span>}
                    </span></td>
                    <td className="num-cell">{c.contacts || "—"}</td>
                    <td style={{ color: "var(--muted)" }}>{c.sector || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {ed && (
        <RecordModal
          tabDef={ed.tabDef} hideCols={[]}
          row={ed.row} initial={ed.initial || {}}
          editable={ed.row ? canEditRow(ed.row.vertical, ed.row.data) : true}
          onSave={(form, row) => (ed.manual ? saveManual(ed.tabDef, form, row?.id ? row : ed.row) : saveOnSource(ed.row, form))}
          onDelete={ed.manual ? remove : undefined}
          onClose={() => setEditing(null)} notify={notify}
        />
      )}
    </div>
  );
}

export function parseVCards(text) {
  const unfolded = String(text).replace(/\r\n?/g, "\n").replace(/\n[ \t]/g, "");
  return unfolded.split(/BEGIN:VCARD/i).slice(1).map((card) => {
    const o = {};
    card.split("\n").forEach((line) => {
      const i = line.indexOf(":");
      if (i < 0) return;
      const prop = line.slice(0, i).toUpperCase().split(";")[0].replace(/^ITEM\d+\./, "");
      const val = line.slice(i + 1).replace(/\\,/g, ",").replace(/\\;/g, ";").replace(/\\n/gi, " ").trim();
      if (!val) return;
      if (prop === "FN") o.name = val;
      else if (prop === "N" && !o.name) o.name = val.split(";").slice(0, 2).reverse().filter(Boolean).join(" ");
      else if (prop === "ORG") o.company = val.split(";").filter(Boolean).join(", ");
      else if (prop === "TITLE") o.designation = val;
      else if (prop === "TEL" && !o.contact_phone) o.contact_phone = val;
      else if (prop === "EMAIL" && !o.contact_email) o.contact_email = val;
      else if (prop === "URL" && /linkedin/i.test(val)) o.contact_linkedin = val;
      else if (prop === "NOTE") o.notes = val;
    });
    if (!o.name && o.contact_phone) o.name = o.contact_phone;
    return o;
  }).filter((o) => o.name);
}
