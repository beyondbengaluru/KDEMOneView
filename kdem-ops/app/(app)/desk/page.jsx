"use client";
import Link from "next/link";
import { MessagesSquare } from "lucide-react";
import { useApp } from "@/lib/ctx";
import { DESKS, DESK_TABS, VERTICALS } from "@/lib/schemas";
import DataTable from "@/components/DataTable";

/** An external agency's whole workspace: their desk with KDEM Marketing. */
export default function DeskPage() {
  const { profile } = useApp();
  const desk = profile?.vertical;
  if (!DESKS[desk]) return <div className="card empty">Your account isn't linked to a desk yet — ask KDEM to set it up.</div>;
  return (
    <>
      <div className="card pad" style={{ display: "flex", alignItems: "center", gap: 14, borderLeft: `4px solid ${VERTICALS.mkt.color}` }}>
        <div>
          <div style={{ fontFamily: "var(--display)", fontSize: 21, fontWeight: 700 }}>{DESKS[desk]} · KDEM Marketing</div>
          <div style={{ fontSize: 12.5, color: "var(--muted)" }}>Briefs, drafts and approvals — attach files to any item.</div>
        </div>
        <Link href="/comms" className="btn sm" style={{ marginLeft: "auto" }}><MessagesSquare size={14} /> Message the team</Link>
      </div>
      <DataTable pageVertical="mkt" tabDef={DESK_TABS[desk]} accentColor={VERTICALS.mkt.color} />
    </>
  );
}
