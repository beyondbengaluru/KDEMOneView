"use client";
import { Suspense, useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Send, Paperclip, FolderOpen, FileText, Link2, X, Trash2, Search, Users, Hash, Building2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useApp } from "@/lib/ctx";
import { vColor, ROLE_LABELS } from "@/lib/schemas";
import { teamChannel, dmChannel, deskChannels, channelName, markRead, useUnread } from "@/lib/comms";
import { openResource } from "@/lib/resources";
import Modal from "@/components/Modal";

export default function CommsPage() {
  return <Suspense fallback={null}><Comms /></Suspense>;
}

function Comms() {
  const { profile, notify } = useApp();
  const params = useSearchParams();
  const [people, setPeople] = useState([]);
  const [active, setActive] = useState(params.get("c") || null);
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState("");
  const [pending, setPending] = useState([]);     // attachments for the next message
  const [busy, setBusy] = useState(false);
  const [picker, setPicker] = useState(false);
  const [findPerson, setFindPerson] = useState("");
  const unread = useUnread(profile);
  const fileRef = useRef(null);
  const endRef = useRef(null);

  const team = teamChannel(profile);
  const desks = deskChannels(profile);
  const isExternal = profile?.role === "external";
  useEffect(() => {
    supabase.from("profiles").select("id,name,title,role,vertical").order("name")
      .then(({ data }) => setPeople((data || []).filter((p) => p.id !== profile?.id && p.name)));
  }, [profile]);
  useEffect(() => { if (!active) setActive(isExternal ? desks[0] : team || "all"); }, [active, isExternal, desks, team]);

  const load = useCallback(async () => {
    if (!active) return;
    const { data } = await supabase.from("messages").select("*").eq("channel", active)
      .order("created_at", { ascending: false }).limit(200);
    setMsgs((data || []).reverse());
    markRead(active);
  }, [active]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (!active) return;
    const ch = supabase.channel(`msg-${active}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "messages", filter: `channel=eq.${active}` }, load)
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, [active, load]);
  useEffect(() => { endRef.current?.scrollIntoView({ block: "end" }); }, [msgs.length, active]);

  const byId = useMemo(() => Object.fromEntries([...people, profile].filter(Boolean).map((p) => [p.id, p])), [people, profile]);
  const dmPeople = people.filter((p) => !findPerson || p.name.toLowerCase().includes(findPerson.toLowerCase()));

  async function attachFiles(e) {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    for (const f of files) {
      const path = `comms/${active}/${Date.now()}-${f.name}`;
      const { error } = await supabase.storage.from("docs").upload(path, f);
      if (error) { notify(error.message); continue; }
      setPending((p) => [...p, { type: "file", name: f.name, path }]);
    }
  }
  async function send() {
    if (!text.trim() && !pending.length) return;
    setBusy(true);
    const { error } = await supabase.from("messages").insert([{ channel: active, body: text.trim(), attachments: pending }]);
    setBusy(false);
    if (error) return notify(error.message);
    setText(""); setPending([]); load();
  }
  async function openAttachment(a) {
    if (a.type === "resource") return openResource(a, notify);
    const { data } = await supabase.storage.from("docs").createSignedUrl(a.path, 3600);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank"); else notify("Couldn't open that file");
  }
  async function remove(m) {
    if (!window.confirm("Delete this message?")) return;
    const files = (m.attachments || []).filter((a) => a.type === "file").map((a) => a.path);
    if (files.length) await supabase.storage.from("docs").remove(files);
    await supabase.from("messages").delete().eq("id", m.id);
    load();
  }

  const Item = ({ ch, icon: Icon, label, color }) => (
    <button className={`navitem ${active === ch ? "on" : ""}`} onClick={() => setActive(ch)}>
      {Icon ? <Icon size={15} /> : <span className="spine" style={{ background: color || "var(--faint)" }} />}
      <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</span>
      {unread[ch] > 0 && active !== ch && <span className="badge">{unread[ch]}</span>}
    </button>
  );

  return (
    <div className="card comms">
      <aside className="comms-side">
        {!isExternal && <div className="navlabel">Channels</div>}
        {team && <Item ch={team} icon={Hash} label={channelName(team, profile)} />}
        {!isExternal && <Item ch="all" icon={Users} label="Everyone" />}
        {desks.length > 0 && <div className="navlabel">Agencies</div>}
        {desks.map((d) => <Item key={d} ch={d} icon={Building2} label={channelName(d, profile)} />)}
        <div className="navlabel">Direct messages</div>
        <div className="searchbox" style={{ margin: "2px 8px 6px" }}>
          <Search size={12} style={{ color: "var(--faint)" }} />
          <input placeholder="Find a person" value={findPerson} onChange={(e) => setFindPerson(e.target.value)} style={{ width: "100%" }} />
        </div>
        {dmPeople.map((p) => (
          <Item key={p.id} ch={dmChannel(profile.id, p.id)} label={p.name}
            color={p.role === "external" ? "#E06B2D" : vColor(["master", "ceo"].includes(p.role) ? "ceo" : p.vertical)} />
        ))}
      </aside>

      <section className="comms-main">
        <div className="card-head">
          <div className="t">{active ? channelName(active, profile, people) : ""}</div>
          {active?.startsWith("dm:") && (() => {
            const other = byId[active.slice(3).split(":").find((id) => id !== profile.id)];
            return other ? <div className="s">{other.title || ROLE_LABELS[other.role]}</div> : null;
          })()}
        </div>
        <div className="comms-log">
          {msgs.length === 0 && <div className="empty">No messages yet. Say hello.</div>}
          {msgs.map((m, i) => {
            const who = byId[m.sender];
            const mine = m.sender === profile.id;
            const showHead = i === 0 || msgs[i - 1].sender !== m.sender ||
              new Date(m.created_at) - new Date(msgs[i - 1].created_at) > 10 * 60 * 1000;
            return (
              <div key={m.id} className={`msg ${mine ? "mine" : ""}`}>
                {showHead && (
                  <div className="msg-head">
                    <b>{mine ? "You" : who?.name || "Someone"}</b>
                    <span>{new Date(m.created_at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                )}
                <div className="msg-body">
                  {m.body && <div style={{ whiteSpace: "pre-wrap" }}>{m.body}</div>}
                  {(m.attachments || []).map((a, j) => (
                    <button key={j} className="attach" onClick={() => openAttachment(a)}>
                      {a.type === "resource" && a.kind === "link" ? <Link2 size={13} /> : <FileText size={13} />}
                      {a.type === "resource" ? a.title : a.name}
                      {a.type === "resource" && <span style={{ color: "var(--faint)", fontWeight: 500 }}>· Resources</span>}
                    </button>
                  ))}
                  {mine && <button className="msg-del" title="Delete" onClick={() => remove(m)}><Trash2 size={12} /></button>}
                </div>
              </div>
            );
          })}
          <div ref={endRef} />
        </div>
        <div className="composer">
          {pending.length > 0 && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 7 }}>
              {pending.map((a, i) => (
                <span key={i} className="attach">
                  {a.type === "resource" ? a.title : a.name}
                  <X size={12} style={{ cursor: "pointer" }} onClick={() => setPending((p) => p.filter((_, j) => j !== i))} />
                </span>
              ))}
            </div>
          )}
          <div style={{ display: "flex", gap: 7, alignItems: "flex-end" }}>
            <button className="btn sm ghost" title="Upload a file" onClick={() => fileRef.current?.click()}><Paperclip size={15} /></button>
            <input ref={fileRef} type="file" multiple hidden onChange={attachFiles} />
            {!isExternal && <button className="btn sm ghost" title="Share from Resources" onClick={() => setPicker(true)}><FolderOpen size={15} /></button>}
            <textarea rows={1} placeholder="Write a message — Enter to send, Shift+Enter for a new line" value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} />
            <button className="btn sm primary" disabled={busy} onClick={send}><Send size={14} /></button>
          </div>
        </div>
      </section>

      {picker && (
        <ResourcePicker onClose={() => setPicker(false)}
          onPick={(r) => { setPending((p) => [...p, { type: "resource", id: r.id, title: r.title, kind: r.kind, url: r.url, file_name: r.file_name }]); setPicker(false); }} />
      )}
    </div>
  );
}

function ResourcePicker({ onPick, onClose }) {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");
  useEffect(() => { supabase.from("resources").select("*").order("title").then(({ data }) => setRows(data || [])); }, []);
  const shown = rows.filter((r) => !q || r.title.toLowerCase().includes(q.toLowerCase()));
  return (
    <Modal title="Share from Resources" onClose={onClose}>
      <div className="searchbox"><Search size={13} style={{ color: "var(--faint)" }} />
        <input autoFocus placeholder="Search resources" value={q} onChange={(e) => setQ(e.target.value)} style={{ width: "100%" }} /></div>
      {shown.length === 0 && <div className="empty">No resources found.</div>}
      {shown.map((r) => (
        <button key={r.id} className="docrow" style={{ border: "none", textAlign: "left", cursor: "pointer" }} onClick={() => onPick(r)}>
          {r.kind === "link" ? <Link2 size={14} /> : <FileText size={14} />}
          <span style={{ flex: 1, fontWeight: 600 }}>{r.title}</span>
          <span style={{ fontSize: 11, color: "var(--faint)" }}>{r.category}</span>
        </button>
      ))}
      <div style={{ fontSize: 11.5, color: "var(--faint)" }}>People only see a shared resource if they already have access to it.</div>
    </Modal>
  );
}
