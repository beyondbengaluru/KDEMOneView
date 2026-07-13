"use client";
import { useEffect, useState, useCallback } from "react";
import { UserPlus, Palette } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useApp } from "@/lib/ctx";
import { VERTICALS, VERTICAL_KEYS, HEAD_CLUSTERS, THEMES, applyTheme, ROLE_LABELS, designationsFor } from "@/lib/schemas";
import Modal from "@/components/Modal";


const ROLES = [
  ["master", "Master (admin)"],
  ["ceo", "CEO Office"],
  ["lead", "Vertical Lead"],
  ["member", "Vertical Member"],
  ["cluster_head", "BB Cluster Head"],
];

export default function AdminPage() {
  const { isMaster, isCeoLevel, notify } = useApp();
  const [people, setPeople] = useState([]);
  const [editP, setEditP] = useState(null);
  const [addP, setAddP] = useState(null);
  const [theme, setThemeState] = useState("emerald");

  const load = useCallback(async () => {
    const [p, t] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at"),
      supabase.from("settings").select("value").eq("key", "theme").single(),
    ]);
    setPeople(p.data || []);
    if (t.data?.value) setThemeState(t.data.value);
  }, []);
  useEffect(() => { load(); }, [load]);

  if (!isMaster) return <div className="card empty">Admin access is limited to the Master role.</div>;

  async function saveProfile(f) {
    const { error } = await supabase.from("profiles").update({
      name: f.name, title: f.title || "", role: f.role,
      vertical: ["lead", "member"].includes(f.role) ? f.vertical : (f.role === "cluster_head" ? "bb" : (f.role === "ceo" ? "ceo" : null)),
      cluster: f.role === "cluster_head" ? f.cluster : null,
    }).eq("id", f.id);
    notify(error ? error.message : "Saved");
    setEditP(null); load();
  }

  async function createMember(f) {
    if (!f.email || !f.password) return notify("Email and a temporary password are required");
    const { data: { session } } = await supabase.auth.getSession();
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/create-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          email: f.email, password: f.password, name: f.name, title: f.title || "",
          role: f.role || "member",
          vertical: ["lead", "member"].includes(f.role) ? f.vertical : (f.role === "cluster_head" ? "bb" : (f.role === "ceo" ? "ceo" : null)),
          cluster: f.role === "cluster_head" ? f.cluster : null,
        }),
      });
      const out = await res.json();
      if (!res.ok || out.error) return notify(out.error || "Could not create user");
      notify(`Account created for ${f.email}`);
      setAddP(null); load();
    } catch {
      notify("Could not reach create-user — deploy it with: supabase functions deploy create-user");
    }
  }

  async function setTheme(key) {
    const { error } = await supabase.from("settings").upsert({ key: "theme", value: key });
    if (error) return notify(error.message);
    setThemeState(key);
    applyTheme(key);
    notify("Theme updated for everyone");
  }


  if (!isCeoLevel) return <div className="card empty">Team view is for the CEO office.</div>;

  return (
    <>
      <div className="card">
        <div className="card-head">
          <div>
            <div className="t">Team & access</div>
            <div className="s">Create accounts right here. Master/CEO edit all; leads & members edit their vertical; the BB team edits anything in its clusters; cluster heads edit their own cluster.</div>
          </div>
          {isMaster && (
            <button className="btn sm primary" style={{ marginLeft: "auto" }}
              onClick={() => setAddP({ role: "member", vertical: VERTICAL_KEYS[0] })}>
              <UserPlus size={13} /> Add member
            </button>
          )}
        </div>
        <div className="tablewrap">
          <table className="data">
            <thead><tr><th>Name</th><th>Designation</th><th>Email</th><th>Role</th><th>Vertical</th><th>Cluster</th></tr></thead>
            <tbody>
              {people.map((p) => (
                <tr key={p.id} onClick={() => isMaster && setEditP({ ...p })}>
                  <td style={{ fontWeight: 600 }}>{p.name || "—"}</td>
                  <td style={{ color: "var(--muted)" }}>{p.title || "—"}</td>
                  <td style={{ color: "var(--muted)" }}>{p.email}</td>
                  <td><span className="pill" style={{ color: "var(--brand)", background: "var(--brand-soft)" }}>{ROLE_LABELS[p.role] || p.role}</span></td>
                  <td style={{ color: "var(--muted)" }}>{p.vertical === "ceo" ? "CEO Office" : p.vertical ? VERTICALS[p.vertical]?.short : "All"}</td>
                  <td style={{ color: "var(--muted)" }}>{p.cluster || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isMaster && (
      <div className="card">
        <div className="card-head">
          <div>
            <div className="t"><Palette size={14} style={{ verticalAlign: -2, marginRight: 6 }} />Dashboard theme</div>
            <div className="s">Repaints the whole dashboard — canvas, sidebar and accents — for the entire team</div>
          </div>
        </div>
        <div style={{ padding: 16 }}>
          <div className="swatches">
            {THEMES.map(([key, label, hex]) => (
              <button key={key} className={`swatch ${theme === key ? "on" : ""}`} title={label}
                style={{ background: hex }} onClick={() => setTheme(key)} />
            ))}
          </div>
          <div style={{ fontSize: 11.5, color: "var(--faint)", marginTop: 10 }}>
            Every dashboard number is computed live from the trackers — nothing to maintain here.
          </div>
        </div>
      </div>
      )}

      {editP && (
        <Modal title="Edit member" onClose={() => setEditP(null)}
          footer={<>
            <button className="btn sm" onClick={() => setEditP(null)}>Cancel</button>
            <button className="btn sm primary" onClick={() => saveProfile(editP)}>Save</button>
          </>}>
          <div className="grid2">
            <div className="field"><label>Name</label>
              <input value={editP.name ?? ""} onChange={(e) => setEditP({ ...editP, name: e.target.value })} /></div>
            <div className="field"><label>Designation</label>
              <select value={editP.title ?? ""} onChange={(e) => setEditP({ ...editP, title: e.target.value })}>
                <option value="">—</option>
                {designationsFor(editP.role).map((d) => <option key={d} value={d}>{d}</option>)}
              </select></div>
            <div className="field"><label>Role</label>
              <select value={editP.role} onChange={(e) => setEditP({ ...editP, role: e.target.value })}>
                {ROLES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select></div>
            {["lead", "member"].includes(editP.role) && (
              <div className="field"><label>Vertical</label>
                <select value={editP.vertical ?? ""} onChange={(e) => setEditP({ ...editP, vertical: e.target.value })}>
                  <option value="">—</option>
                  {VERTICAL_KEYS.map((k) => <option key={k} value={k}>{VERTICALS[k].short}</option>)}
                </select></div>
            )}
            {editP.role === "cluster_head" && (
              <div className="field"><label>Cluster</label>
                <select value={editP.cluster ?? ""} onChange={(e) => setEditP({ ...editP, cluster: e.target.value })}>
                  <option value="">—</option>
                  {HEAD_CLUSTERS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select></div>
            )}
          </div>
        </Modal>
      )}

      {addP && (
        <Modal title="Add team member" onClose={() => setAddP(null)}
          footer={<>
            <button className="btn sm" onClick={() => setAddP(null)}>Cancel</button>
            <button className="btn sm primary" onClick={() => createMember(addP)}>Create account</button>
          </>}>
          <div className="grid2">
            <div className="field"><label>Name</label>
              <input value={addP.name ?? ""} onChange={(e) => setAddP({ ...addP, name: e.target.value })} autoFocus /></div>
            <div className="field"><label>Designation</label>
              <select value={addP.title ?? ""} onChange={(e) => setAddP({ ...addP, title: e.target.value })}>
                <option value="">—</option>
                {designationsFor(addP.role).map((d) => <option key={d} value={d}>{d}</option>)}
              </select></div>
            <div className="field"><label>Email</label>
              <input type="email" value={addP.email ?? ""} onChange={(e) => setAddP({ ...addP, email: e.target.value })} /></div>
            <div className="field"><label>Temporary password</label>
              <input value={addP.password ?? ""} onChange={(e) => setAddP({ ...addP, password: e.target.value })}
                placeholder="They sign in with this, then change it" /></div>
            <div className="field"><label>Role</label>
              <select value={addP.role} onChange={(e) => setAddP({ ...addP, role: e.target.value })}>
                {ROLES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select></div>
            {["lead", "member"].includes(addP.role) && (
              <div className="field"><label>Vertical</label>
                <select value={addP.vertical ?? ""} onChange={(e) => setAddP({ ...addP, vertical: e.target.value })}>
                  {VERTICAL_KEYS.map((k) => <option key={k} value={k}>{VERTICALS[k].short}</option>)}
                </select></div>
            )}
            {addP.role === "cluster_head" && (
              <div className="field"><label>Cluster</label>
                <select value={addP.cluster ?? ""} onChange={(e) => setAddP({ ...addP, cluster: e.target.value })}>
                  <option value="">—</option>
                  {HEAD_CLUSTERS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select></div>
            )}
          </div>
          <div style={{ fontSize: 11.5, color: "var(--faint)" }}>
            Requires the create-user function (one-time): <code>supabase functions deploy create-user</code>
          </div>
        </Modal>
      )}

    </>
  );
}
