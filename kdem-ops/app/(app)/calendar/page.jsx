"use client";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
  const { fy } = useApp();
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
    events.forEach((e) => push(e.date, { kind: "event", label: e.name, color: vColor(e.vertical), sub: vName(e.vertical), meta: e }));
    tasks.forEach((t) => push(t.due_date, {
      kind: "task", label: t.title, color: t.status === "done" ? "var(--good)" : "var(--gold)",
      sub: `${vName(t.vertical)} · ${t.status === "done" ? "done" : "due"}`, meta: t,
    }));
    meetings.forEach((mt) => push(mt.date, {
      kind: "meeting", label: mt.title, color: "var(--brand)",
      sub: `${mt.kind} meeting${mt.time ? ` · ${mt.time}` : ""}${mt.mode === "in_person" && mt.venue ? ` · ${mt.venue}` : ""}`,
      meta: mt,
    }));
    return map;
  }, [events, tasks, meetings]);

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
        <div style={{ fontSize: 12, color: "var(--faint)" }}>Everything you can see — events, meetings & task due dates</div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 7 }}>
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
                    {it.kind === "event" ? "Event" : it.kind === "meeting" ? "Meeting" : "Task"} · {it.sub}
                  </div>
                </div>
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
