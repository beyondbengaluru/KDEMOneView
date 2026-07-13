"use client";
import { X } from "lucide-react";

export default function Modal({ title, children, footer, onClose, wide }) {
  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={wide ? { width: "min(760px,100%)" } : undefined}>
        <div className="mhead">
          <div className="t">{title}</div>
          <button className="btn ghost sm" style={{ marginLeft: "auto" }} onClick={onClose}><X size={15} /></button>
        </div>
        <div className="mbody">{children}</div>
        {footer && <div className="mfoot">{footer}</div>}
      </div>
    </div>
  );
}
