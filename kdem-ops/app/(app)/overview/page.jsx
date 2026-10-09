"use client";
import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, CalendarDays, Activity } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useApp } from "@/lib/ctx";
import { VERTICALS, VERTICAL_KEYS, COUNTERS, buildHelper, vColor, vName } from "@/lib/schemas";
import { fmt } from "@/lib/util";
import { evalCounters, GoalBar, goalText } from "@/components/Counters";
import TasksPanel from "@/components/TasksPanel";

// CEO/Master command view. Vertical members are routed to their own
// vertical — this cross-vertical view is CEO-office only.
export default function Overview() {
  const router = useRouter();
  const { fy, isCeoLevel, homeVertical, profile } = useApp();
  const [records, setRecords] = useState([]);
  const [events, setEvents] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [activity, setActivity] = useState([]);
  const [counts, setCounts] = useState({ proposals: 0, meetings: 0, openTasks: 0, soon: 0 });

  useEffect(() => {
    if (!isCeoLevel && homeVertical) router.replace(`/v/${homeVertical}`);
  }, [isCeoLevel, homeVertical, router]);

  const load = useCallback(async () => {
    const today = new Date().toISOString().slice(0, 10);
    const in30 = new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10);
    const [r, e, up, act, p, m, t] = await Promise.all([
      supabase.from("records").select("vertical,tab,data,updated_at").eq("fy", fy),
      supabase.from("events").select("*").eq("fy", fy).neq("status", "cancelled"),
      supabase.from("events").select("*").eq("fy", fy).gte("date", today).neq("status", "cancelled").order("date").limit(6),
      supabase.from("records").select("vertical,tab,data,updated_at").order("updated_at", { ascending: false }).limit(8),
      supabase.from("records").select("id", { count: "exact", head: true }).eq("tab", "proposals").eq("fy", fy),
      supabase.from("meetings").select("id", { count: "exact", head: true }),
      supabase.from("tasks").select("id", { count: "exact", head: true }).neq("status", "done"),
    ]);
    const soon = (e.data || []).filter((x) => x.date && x.date >= today && x.date <= in30).length;
    setRecords(r.data || []); setEvents(e.data || []);
    setUpcoming(up.data || []); setActivity(act.data || []);
    setCounts({ proposals: p.count || 0, meetings: m.count || 0, openTasks: t.count || 0, soon });
  }, [fy]);
  useEffect(() => { if (isCeoLevel) load(); }, [load, isCeoLevel]);

  const H = useMemo(() => buildHelper(records, events), [records, events]);
  if (!isCeoLevel)
    return (
      <div className="card pad" style={{ maxWidth: 520 }}>
        <div style={{ fontFamily: "var(--display)", fontSize: 17, fontWeight: 700, marginBottom: 6 }}>
          Almost there — your account isn't assigned yet
        </div>
        <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.55 }}>
          Ask the Master to assign you a role and vertical from the Admin page.
          If you ARE setting this up, promote yourself in the Supabase SQL Editor:
          <code style={{ display: "block", marginTop: 8, padding: "8px 10px", background: "var(--inset)", borderRadius: 8, fontSize: 12 }}>
            update profiles set role='master', name='Your Name' where email='you@kdem.in';
          </code>
          Then refresh this page.
        </div>
      </div>
    );

  const now = new Date();
  const hour = now.getHours();
  const hello = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const first = (profile?.name || "").split(" ")[0];
  const fyStartYear = Number(fy.slice(0, 4));
  const monthIdx = (now.getFullYear() - fyStartYear) * 12 + now.getMonth() - 3; // 0 = April
  const quarter = monthIdx >= 0 && monthIdx < 12 ? `Q${Math.floor(monthIdx / 3) + 1}` : null;
  const goTo = (vk, n) => (n.sec ? `/v/${vk}?tab=all&sec=${n.sec}` : `/v/${vk}${n.tab ? `?tab=${n.tab}` : ""}`);

  return (
    <>
      <div className="card pad" style={{ display: "flex", flexWrap: "wrap", gap: 28, alignItems: "center" }}>
        <div>
          <div style={{ fontFamily: "var(--display)", fontSize: 21, fontWeight: 700 }}>{hello}{first ? `, ${first}` : ""}</div>
          <div style={{ fontSize: 12.5, color: "var(--muted)" }}>
            {now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })} · FY {fy}{quarter ? `, ${quarter}` : ""}
          </div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 26, flexWrap: "wrap" }}>
          {[["Open tasks", counts.openTasks, "/tasks"], ["Events in 30 days", counts.soon, "/calendar"],
            ["Proposals", counts.proposals, null], ["Meetings", counts.meetings, "/meetings"]].map(([l, n, href]) => {
            const inner = (
              <>
                <div className="bignum" style={{ fontSize: 24 }}>{n}</div>
                <div style={{ fontSize: 11, color: "var(--faint)" }}>{l}</div>
              </>
            );
            return href ? <Link key={l} href={href}>{inner}</Link> : <div key={l}>{inner}</div>;
          })}
        </div>
      </div>

      <div className="vgrid">
        {VERTICAL_KEYS.map((vk) => {
          const v = VERTICALS[vk];
          const goals = evalCounters((COUNTERS[vk] || []).slice(0, 3), H);
          return (
            <div key={vk} className="card" style={{ borderTop: `3px solid ${v.color}`, padding: "15px 16px", display: "flex", flexDirection: "column", gap: 14 }}>
              <Link href={`/v/${vk}`} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ fontWeight: 700, fontSize: 14.5 }}>{v.name}</div>
                <ArrowUpRight size={14} style={{ marginLeft: "auto", color: "var(--faint)" }} />
              </Link>
              <div className="goalgrid">
                {goals.map((n) => (
                  <Link key={n.label} href={goTo(vk, n)} className="goal link">
                    <div className="gval">
                      {n.unit === "₹Cr" ? `₹${fmt(n.value)}` : fmt(n.value)}
                      {n.unit === "₹Cr" && <span style={{ fontSize: 11, color: "var(--faint)", marginLeft: 3 }}>Cr</span>}
                    </div>
                    <div className="glbl">{n.label}{n.extraText ? <span style={{ fontWeight: 500, color: "var(--faint)" }}> {n.extraText}</span> : null}</div>
                    <GoalBar value={n.value} goal={n.goal} color={v.color} />
                    {n.goal ? <div className="gof">{goalText(n)}</div> : null}
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="split">
        <TasksPanel title="Tasks" />
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card">
            <div className="card-head">
              <div><div className="t">Upcoming events</div></div>
              <Link href="/calendar" className="btn sm ghost" style={{ marginLeft: "auto" }}>
                <CalendarDays size={13} /> Calendar
              </Link>
            </div>
            {upcoming.length === 0 ? (
              <div className="empty">Nothing scheduled ahead.</div>
            ) : (
              <div style={{ padding: 10, display: "flex", flexDirection: "column", gap: 6 }}>
                {upcoming.map((e) => (
                  <div key={e.id} className="docrow">
                    <span className="origin" style={{ background: vColor(e.vertical) }} />
                    <span style={{ flex: 1, fontWeight: 600 }}>{e.name}</span>
                    <span style={{ fontSize: 11, color: "var(--muted)" }}>{e.cluster || e.location || vName(e.vertical)}</span>
                    <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)" }}>{e.date}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="card">
            <div className="card-head">
              <div><div className="t"><Activity size={13} style={{ verticalAlign: -2, marginRight: 6 }} />Latest activity</div></div>
            </div>
            {activity.length === 0 ? (
              <div className="empty">No updates yet.</div>
            ) : (
              <div style={{ padding: 10, display: "flex", flexDirection: "column", gap: 6 }}>
                {activity.map((r, i) => (
                  <div key={i} className="docrow">
                    <span className="origin" style={{ background: vColor(r.vertical) }} />
                    <span style={{ flex: 1, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {r.data?.name || r.data?.title || r.data?.item || r.data?.program || "Entry"}
                    </span>
                    <span style={{ fontSize: 11, color: "var(--faint)" }}>{vName(r.vertical)} · {r.tab.replace("db_", "")}</span>
                    <span style={{ fontFamily: "var(--mono)", fontSize: 10.5, color: "var(--faint)" }}>
                      {(r.updated_at || "").slice(5, 10)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
