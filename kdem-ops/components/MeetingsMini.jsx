"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Video, MapPin, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { vColor, vName } from "@/lib/schemas";
import Pill from "./Pill";

// Compact recent-meetings list for a vertical; full workspace lives at /meetings
export default function MeetingsMini({ vertical, title = "Meetings" }) {
  const [rows, setRows] = useState([]);
  const load = useCallback(async () => {
    const { data } = await supabase.from("meetings").select("*")
      .contains("verticals", [vertical]).order("date", { ascending: false }).limit(6);
    setRows(data || []);
  }, [vertical]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const ch = supabase.channel(`mmini-${vertical}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "meetings" }, () => load())
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, [vertical, load]);

  return (
    <div className="card">
      <div className="card-head">
        <div><div className="t">{title}</div></div>
        <Link href="/meetings" className="btn sm ghost" style={{ marginLeft: "auto" }}>
          Open Meetings <ArrowRight size={13} />
        </Link>
      </div>
      {rows.length === 0 ? (
        <div className="empty">No meetings tagged to this vertical yet.</div>
      ) : (
        <div style={{ padding: 10, display: "flex", flexDirection: "column", gap: 6 }}>
          {rows.map((m) => (
            <Link key={m.id} href="/meetings" className="docrow" style={{ textDecoration: "none", color: "inherit" }}>
              {m.mode === "online" ? <Video size={13} style={{ color: "var(--brand)" }} /> : <MapPin size={13} style={{ color: "var(--brand)" }} />}
              <span style={{ flex: 1, fontWeight: 600 }}>{m.title}</span>
              <Pill value={m.kind} />
              <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)" }}>{m.date || "TBD"}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
