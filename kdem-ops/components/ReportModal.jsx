"use client";
import { useState } from "react";
import { FileDown } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { VERTICALS, VERTICAL_KEYS, COUNTERS, buildHelper } from "@/lib/schemas";
import { useApp } from "@/lib/ctx";
import { generateReport } from "@/lib/docx";
import Modal from "./Modal";

function monthOptions(fy) {
  const out = [];
  const start = new Date(`${fy.slice(0, 4)}-04-01`);
  for (let i = 0; i < 12; i++) {
    const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
    const from = d.toISOString().slice(0, 10);
    const to = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().slice(0, 10);
    out.push({ label: d.toLocaleString("en-IN", { month: "long", year: "numeric" }), short: d.toLocaleString("en-IN", { month: "long" }), from, to });
  }
  return out;
}
const quarterOptions = (fy) => {
  const y = Number(fy.slice(0, 4));
  return [
    { label: "Q1 (Apr–Jun)", short: "Q1", from: `${y}-04-01`, to: `${y}-06-30` },
    { label: "Q2 (Jul–Sep)", short: "Q2", from: `${y}-07-01`, to: `${y}-09-30` },
    { label: "Q3 (Oct–Dec)", short: "Q3", from: `${y}-10-01`, to: `${y}-12-31` },
    { label: "Q4 (Jan–Mar)", short: "Q4", from: `${y + 1}-01-01`, to: `${y + 1}-03-31` },
  ];
};
const annualOption = (fy) => {
  const y = Number(fy.slice(0, 4));
  return { label: `Annual — FY ${fy}`, short: "Annual", from: `${y}-04-01`, to: `${y + 1}-03-31` };
};

export default function ReportModal({ onClose }) {
  const { fy } = useApp();
  const months = monthOptions(fy);
  const QUARTERS = quarterOptions(fy);
  const now = new Date().toISOString().slice(0, 10);
  const defaultMonth = months.findIndex((m) => m.from <= now && now <= m.to);

  const [scope, setScope] = useState("all");
  const [kind, setKind] = useState("month");
  const [idx, setIdx] = useState(Math.max(0, defaultMonth));
  const [busy, setBusy] = useState(false);

  async function run() {
    setBusy(true);
    const period = kind === "month" ? months[idx] : kind === "quarter" ? QUARTERS[idx % 4] : annualOption(fy);
    const [recs, allEvents, inits, tasks, events] = await Promise.all([
      supabase.from("records").select("vertical,tab,data,updated_at").eq("fy", fy),
      supabase.from("events").select("*").eq("fy", fy).neq("status", "cancelled"),
      supabase.from("records").select("*").eq("tab", "proposals").eq("fy", fy),
      supabase.from("tasks").select("*"),
      supabase.from("events").select("*").eq("fy", fy).gte("date", period.from).lte("date", period.to).order("date"),
    ]);
    const H = buildHelper(recs.data || [], allEvents.data || []);
    const counters = {};
    VERTICAL_KEYS.forEach((vk) => {
      counters[vk] = (COUNTERS[vk] || []).map((d) => ({
        label: d.label, unit: d.unit || "", target: d.target || "—", value: d.calc(H),
      }));
    });
    await generateReport({
      scopeKey: scope,
      period,
      fy,
      data: {
        counters,
        proposals: inits.data || [],
        tasks: (tasks.data || []).filter((t) =>
          t.status !== "done" ||
          (t.updated_at && t.updated_at.slice(0, 10) >= period.from && t.updated_at.slice(0, 10) <= period.to)
        ),
        events: events.data || [],
      },
    });
    setBusy(false);
    onClose();
  }

  const list = kind === "month" ? months : kind === "quarter" ? QUARTERS : [annualOption(fy)];

  return (
    <Modal title="Generate meeting report" onClose={onClose}
      footer={
        <>
          <button className="btn sm" onClick={onClose}>Cancel</button>
          <button className="btn sm primary" onClick={run} disabled={busy}>
            <FileDown size={13} /> {busy ? "Building…" : "Download .docx"}
          </button>
        </>
      }>
      <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 4 }}>
        Your Q1-progress table format — Sl No, Activities, Annual Targets, Progress — with the progress column computed live for FY {fy}, plus proposals, tasks and events.
      </div>
      <div className="field"><label>Scope</label>
        <select value={scope} onChange={(e) => setScope(e.target.value)}>
          <option value="all">All Verticals (CEO review)</option>
          {VERTICAL_KEYS.map((k) => <option key={k} value={k}>{VERTICALS[k].name}</option>)}
        </select></div>
      <div className="grid2">
        <div className="field"><label>Period type</label>
          <select value={kind} onChange={(e) => { setKind(e.target.value); setIdx(0); }}>
            <option value="month">Monthly</option><option value="quarter">Quarterly</option><option value="annual">Annual</option>
          </select></div>
        <div className="field"><label>Period</label>
          <select value={idx} onChange={(e) => setIdx(Number(e.target.value))}>
            {list.map((m, i) => <option key={m.label} value={i}>{m.label}</option>)}
          </select></div>
      </div>
    </Modal>
  );
}
