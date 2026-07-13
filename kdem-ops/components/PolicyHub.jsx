"use client";
import { useState } from "react";
import DataTable from "./DataTable";

// Policies = Registrations | Incentives Awareness Drive | Strategy
export default function PolicyHub({ vertical, hub, accentColor, clusterFilter, extraFilter }) {
  const [sub, setSub] = useState("registrations");
  const subs = [
    ["registrations", hub.registrations.label],
    ["awareness", hub.awareness.label],
    ["strategy", hub.strategy.label],
  ];
  const tabDef = hub[sub];
  const cf = clusterFilter ? (d) => d.cluster === clusterFilter : extraFilter;
  return (
    <div>
      <div className="subtabs" style={{ padding: "0 0 10px" }}>
        {subs.map(([k, l]) => (
          <button key={k} className={`stab ${sub === k ? "on" : ""}`} onClick={() => setSub(k)}>{l}</button>
        ))}
      </div>
      <DataTable pageVertical={vertical} tabDef={tabDef} accentColor={accentColor}
        defaults={clusterFilter ? { cluster: clusterFilter } : {}}
        hideCols={clusterFilter ? ["cluster"] : []}
        extraFilter={cf} />
    </div>
  );
}
