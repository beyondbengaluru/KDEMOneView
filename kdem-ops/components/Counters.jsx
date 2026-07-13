"use client";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useApp } from "@/lib/ctx";
import { COUNTERS, buildHelper } from "@/lib/schemas";
import { fmt } from "@/lib/util";

/**
 * Live counters — computed straight from the trackers for the selected FY.
 * Nothing to "update": add a company, the number moves.
 */
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
    const H = buildHelper(r.data || [], e.data || []);
    setNums(defs.map((d) => ({ ...d, value: d.calc(H) })));
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
        <div key={n.label} className="card kpi"
          style={{ borderTop: `3px solid ${color}`, cursor: (n.jump || n.tab) && onJump ? "pointer" : "default" }}
          onClick={() => (n.jump || n.tab) && onJump && onJump(n.jump || n.tab)}>
          <div className="bignum">
            {fmt(n.value)}
            {n.unit && <span style={{ fontSize: 14, fontWeight: 600, color: "var(--faint)", marginLeft: 4 }}>{n.unit}</span>}
          </div>
          <div style={{ fontSize: 12.5, color: "var(--muted)", fontWeight: 600 }}>{n.label}</div>
        </div>
      ))}
    </div>
  );
}
