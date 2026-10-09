"use client";
import { useEffect, useMemo, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { outlookConfigured, outlookAccount, connectOutlook, disconnectOutlook, listOutlook, pushMeeting } from "@/lib/outlook";
import { supabase } from "@/lib/supabase";
import { vColor, vName } from "@/lib/schemas";
import { monthName, todayISO } from "@/lib/util";
import { useApp } from "@/lib/ctx";

function shiftWeek(iso, days) {
  const d = new Date(iso + "T00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export default function CalendarPage() {
  const { fy, profile, notify } = useApp();
  // Two calendars: meetings (+ events, synced with Outlook) and tasks
  const [mode, setModeState] = useState("meetings");
  useEffect(() => { const s = localStorage.getItem("kdem-cal"); if (s) setModeState(s); }, []);
  const setMode = (m) => { setModeState(m); localStorage.setItem("kdem-cal", m); setSelected(null); };
  const [ms, setMs] = useState(null);        // signed-in Microsoft account
  const [outlook, setOutlook] = useState([]);
  const [syncing, setSyncing] = useState(false);
  const now = new Date();
  const [y, setY] = useState(now.getFullYear());
  const [m, setM] = useState(now.getMonth());
  const [events, setEvents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [selected, setSelected] = useState(null); // ISO date
  const [view, setView] = useState("month");
  const [weekStart, setWeekStart] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - d.getDay());
    return d.toISOString().slice(0, 10);
  });

  useEffect(() => { outlookAccount().then(setMs).catch(() => setMs(null)); }, []);

  // Pull Outlook for the visible range, and push any of my meetings that aren't there yet
  const syncOutlook = useCallback(async (quiet = false) => {
    if (!ms) return;
    setSyncing(true);
    try {
      const from = new Date(y, m - 1, 1).toISOString().slice(0, 10);
      const to = new Date(y, m + 2, 0).toISOString().slice(0, 10);
      const today = todayISO();
      const mine = meetings.filter((mt) => mt.date && mt.date >= today && !mt.outlook_ids?.[profile.id] &&
        (mt.created_by === profile.id || (mt.participants || []).includes(profile.name)));
      for (const mt of mine) {
        const evId = await pushMeeting(mt, null);
        const ids = { ...(mt.outlook_ids || {}), [profile.id]: evId };
        await supabase.from("meetings").update({ outlook_ids: ids }).eq("id", mt.id);
        mt.outlook_ids = ids;
      }
      setOutlook(await listOutlook(from, to));
      if (!quiet) notify(mine.length ? `Synced · ${mine.length} meeting${mine.length > 1 ? "s" : ""} added to Outlook` : "Synced with Outlook");
    } catch (e) { notify(`Outlook: ${e.message}`); }
    setSyncing(false);
  }, [ms, y, m, meetings, profile, notify]);
  useEffect(() => { if (ms && mode === "meetings" && meetings.length) syncOutlook(true); }, [ms, mode, y, m, meetings.length]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    (async () => {
      const [e, t, m] = await Promise.all([
        supabase.from("events").select("*").eq("fy", fy).neq("status", "cancelled"),
        supabase.from("tasks").select("*").not("due_date", "is", null),
        supabase.from("meetings").select("*").not("date", "is", null),
      ]);
      setEvents(e.data || []);
      setTasks(t.data || []);
      setMeetings(m.data || []);
    })();
  }, [fy]);

  const items = useMemo(() => {
    const map = {};
    const push = (d, item) => { if (d) (map[d] = map[d] || []).push(item); };
    if (mode === "tasks") {
      tasks.forEach((t) => push(t.due_date, {
        kind: "task", label: t.title, color: t.status === "done" ? "var(--good)" : vColor(t.vertical),
        sub: `${vName(t.vertical)} · ${t.status === "done" ? "done" : t.status === "inprogress" ? "in progress" : "due"}${t.assignee ? ` · ${t.assignee}` : ""}`, meta: t,
      }));
      return map;
    }
    events.forEach((e) => push(e.date, { kind: "event", label: e.name, color: vColor(e.vertical), sub: vName(e.vertical), meta: e }));
    const synced = new Set(meetings.flatMap((mt) => Object.values(mt.outlook_ids || {})));
    outlook.filter((o) => !synced.has(o.id)).forEach((o) => push(o.date, {
      kind: "outlook", label: o.title, color: "#0F6CBD",
      sub: `Outlook${o.time ? ` · ${o.time}${o.end ? `–${o.end}` : ""}` : ""}${o.location ? ` · ${o.location}` : ""}`, meta: o,
    }));
    meetings.forEach((mt) => push(mt.date, {
      kind: "meeting", label: mt.title, color: "var(--brand)",
      sub: `${mt.kind} meeting${mt.time ? ` · ${mt.time}` : ""}${mt.mode === "in_person" && mt.venue ? ` · ${mt.venue}` : ""}`,
      meta: mt,
    }));
    return map;
  }, [events, tasks, meetings, outlook, mode]);

  const first = new Date(y, m, 1);
  const startDow = first.getDay();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  const iso = (d) => `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  function shift(delta) {
    if (view === "week") { setWeekStart(shiftWeek(weekStart, delta * 7)); setSelected(null); return; }
    const d = new Date(y, m + delta, 1);
    setY(d.getFullYear()); setM(d.getMonth()); setSelected(null);
  }

  return (
    <>
      <div className="card pad" style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ fontFamily: "var(--display)", fontSize: 19, fontWeight: 700 }}>
          {view === "month" ? monthName(y, m) : `Week of ${new Date(weekStart + "T00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`}
        </div>
        <div className="chips" style={{ marginLeft: 6 }}>
          <button className={`chip ${view === "month" ? "on" : ""}`} onClick={() => setView("month")}>Month</button>
          <button className={`chip ${view === "week" ? "on" : ""}`} onClick={() => setView("week")}>Week</button>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 7, alignItems: "center", flexWrap: "wrap" }}>
          {mode === "meetings" && !outlookConfigured && (
            <button className="btn sm" disabled title="Outlook sync needs a one-time Microsoft app registration — see README">Connect Outlook</button>
          )}
          {mode === "meetings" && outlookConfigured && (ms ? (
            <>
              <span style={{ fontSize: 11.5, color: "var(--faint)" }} title={ms.username}>Outlook connected</span>
              <button className="btn sm ghost" disabled={syncing} onClick={() => syncOutlook()} title="Sync now">
                <RefreshCw size={13} className={syncing ? "spin" : ""} />
              </button>
              <button className="btn sm ghost" onClick={async () => { await disconnectOutlook(); setMs(null); setOutlook([]); }}>Disconnect</button>
            </>
          ) : (
            <button className="btn sm" onClick={async () => {
              try { setMs(await connectOutlook()); notify("Outlook connected"); } catch (e) { notify(`Outlook: ${e.message}`); }
            }}>Connect Outlook</button>
          ))}
          <div className="chips" style={{ marginRight: 6 }}>
            <button className={`chip ${mode === "meetings" ? "on" : ""}`} onClick={() => setMode("meetings")}>Meetings</button>
            <button className={`chip ${mode === "tasks" ? "on" : ""}`} onClick={() => setMode("tasks")}>Tasks</button>
          </div>
          <button className="btn sm ghost" onClick={() => shift(-1)}><ChevronLeft size={14} /></button>
          <button className="btn sm ghost" onClick={() => { const d = new Date(); setY(d.getFullYear()); setM(d.getMonth()); }}>Today</button>
          <button className="btn sm ghost" onClick={() => shift(1)}><ChevronRight size={14} /></button>
        </div>
      </div>

      <div>
        {view === "month" && (<>
        <div className="calgrid" style={{ marginBottom: 6 }}>
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => <div key={d} className="calhead">{d}</div>)}
        </div>
        <div className="calgrid">
          {cells.map((d, i) => {
            if (!d) return <div key={`x${i}`} className="calday dim" style={{ background: "transparent", border: "none" }} />;
            const date = iso(d);
            const dayItems = items[date] || [];
            return (
              <div key={date} className={`calday ${date === todayISO() ? "today" : ""}`}
                style={{ cursor: dayItems.length ? "pointer" : "default" }}
                onClick={() => dayItems.length && setSelected(date)}>
                <div className="dnum">{d}</div>
                {dayItems.slice(0, 3).map((it, j) => (
                  <div key={j} className="calitem" style={{ background: it.color }} title={it.label}>{it.label}</div>
                ))}
                {dayItems.length > 3 && <div style={{ fontSize: 10, color: "var(--faint)" }}>+{dayItems.length - 3} more</div>}
              </div>
            );
          })}
        </div>
        </>)}

        {view === "week" && (
          <div className="weekgrid" style={{ marginTop: 4 }}>
            {Array.from({ length: 7 }, (_, i) => shiftWeek(weekStart, i)).map((d) => {
              const dayItems = items[d] || [];
              const isToday = d === todayISO();
              return (
                <div key={d} className="weekcol" style={isToday ? { borderColor: "var(--brand)" } : undefined}>
                  <div className="weekhead" style={isToday ? { color: "var(--brand)" } : undefined}>
                    {new Date(d + "T00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
                  </div>
                  {dayItems.length === 0 ? (
                    <div style={{ fontSize: 11, color: "var(--faint)" }}>—</div>
                  ) : dayItems.map((it, i) => (
                    <div key={i} style={{ fontSize: 11.5, marginBottom: 7, cursor: "pointer" }} onClick={() => setSelected(d)}>
                      <span className="origin" style={{ background: it.color }} />
                      <span style={{ fontWeight: 600 }}>{it.label}</span>
                      <div style={{ color: "var(--faint)", fontSize: 10.5, marginLeft: 14 }}>{it.sub}</div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selected && (
        <div className="card">
          <div className="card-head">
            <div className="t">{new Date(selected + "T00:00").toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</div>
            <button className="btn sm ghost" style={{ marginLeft: "auto" }} onClick={() => setSelected(null)}>Close</button>
          </div>
          <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 7 }}>
            {(items[selected] || []).map((it, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", background: "var(--inset)", borderRadius: 11 }}>
                <span style={{ width: 8, height: 8, borderRadius: 99, background: it.color }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{it.label}</div>
                  <div style={{ fontSize: 11, color: "var(--faint)" }}>
                    {it.kind === "event" ? "Event" : it.kind === "meeting" ? "Meeting" : it.kind === "outlook" ? "Outlook" : "Task"} · {it.sub}
                  </div>
                </div>
                {it.kind === "outlook" && it.meta.webLink && (
                  <a className="btn sm" style={{ marginLeft: "auto" }} href={it.meta.webLink} target="_blank" rel="noreferrer">Open in Outlook</a>
                )}
                {it.kind === "meeting" && it.meta.mode === "online" && it.meta.link && (
                  <a className="btn sm" style={{ marginLeft: "auto" }} href={it.meta.link} target="_blank" rel="noreferrer">Join</a>
                )}
                {it.kind === "meeting" && (it.meta.participants || []).length > 0 && (
                  <span style={{ marginLeft: it.meta.mode === "online" && it.meta.link ? 0 : "auto", fontSize: 11, color: "var(--faint)" }}>
                    {(it.meta.participants || []).join(", ")}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
