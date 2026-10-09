"use client";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useApp } from "@/lib/ctx";
import { COUNTERS, buildHelper } from "@/lib/schemas";
import { fmt } from "@/lib/util";

export function evalCounters(defs, H) {
  return defs.map((d) => ({ ...d, value: d.calc(H), extraText: d.extra ? d.extra(H) : "" }));
}

// value / goal as a thin bar; past the goal the bar stays full
export function GoalBar({ value, goal, color }) {
  if (!goal) return null;
  const pct = Math.min(100, Math.round((Number(value) / goal) * 100));
  return <div className="gbar"><span style={{ width: `${pct}%`, background: color }} /></div>;
}

export function goalText(n) {
  if (!n.goal) return "";
  const g = n.unit === "₹Cr" ? `₹${fmt(n.goal)} Cr` : fmt(n.goal);
  return `Goal ${g}`;
}

export function valueText(n) {
  return n.unit === "₹Cr" ? `₹${fmt(n.value)} Cr` : n.unit ? `${fmt(n.value)} ${n.unit}` : fmt(n.value);
}

/** Live counters for one vertical, with the goal under each number. */
export default function Counters({ vertical, color, onJump }) {
  const { fy } = useApp();
  const [nums, setNums] = useState(null);

  const load = useCallback(async () => {
    const defs = COUNTERS[vertical] || [];
    if (!defs.length) return setNums([]);
    const [r, e] = await Promise.all([
      supabase.from("records").select("vertical,tab,data,updated_at").eq("fy", fy),
      supabase.from("events").select("*").eq("fy", fy).neq("status", "cancelled"),
    ]);
    setNums(evalCounters(defs, buildHelper(r.data || [], e.data || [])));
  }, [vertical, fy]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const ch = supabase.channel(`counters-${vertical}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "records" }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "events" }, () => load())
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, [vertical, load]);

  if (!nums) return <div className="loadingrow">Loading…</div>;
  if (!nums.length) return null;

  return (
    <div className="kpigrid">
      {nums.map((n) => (
        <button key={n.label} className="card kpi"
          style={{ borderTop: `3px solid ${color}`, cursor: onJump ? "pointer" : "default" }}
          onClick={() => onJump && onJump(n)}>
          <div className="bignum">
            {n.unit === "₹Cr" && <span style={{ fontSize: 18 }}>₹</span>}
            {fmt(n.value)}
            {n.unit && <span style={{ fontSize: 14, fontWeight: 600, color: "var(--faint)", marginLeft: 4 }}>{n.unit === "₹Cr" ? "Cr" : n.unit}</span>}
            {n.extraText && <span className="gextra" style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", marginLeft: 6 }}>{n.extraText}</span>}
          </div>
          <div style={{ fontSize: 12.5, color: "var(--muted)", fontWeight: 600 }}>{n.label}</div>
          {n.goal ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: "auto" }}>
              <GoalBar value={n.value} goal={n.goal} color={color} />
              <div style={{ fontSize: 11, color: "var(--faint)" }}>{goalText(n)}</div>
            </div>
          ) : null}
        </button>
      ))}
    </div>
  );
}
