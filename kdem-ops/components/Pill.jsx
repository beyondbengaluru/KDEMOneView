"use client";
import { PILL_COLORS } from "@/lib/schemas";

export default function Pill({ value }) {
  if (value == null || value === "") return <span style={{ color: "var(--faint)" }}>—</span>;
  const c = PILL_COLORS[value] || "#8B978F";
  return <span className="pill" style={{ color: c, background: `${c}1c` }}>{String(value)}</span>;
}
