"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function signIn(e) {
    e.preventDefault();
    setBusy(true); setErr("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return setErr(error.message);
    router.replace("/overview");
  }

  return (
    <div className="login-wrap">
      <div className="card pad login-card">
        <div style={{ fontSize: 10, letterSpacing: ".15em", textTransform: "uppercase", color: "var(--gold)", fontWeight: 700 }}>
          Karnataka Digital Economy Mission
        </div>
        <div style={{ fontFamily: "var(--display)", fontSize: 24, fontWeight: 700, margin: "6px 0 2px" }}>
          OneView
        </div>
        <div style={{ fontSize: 13, color: "var(--faint)", marginBottom: 20 }}>
          Sign in with your KDEM account
        </div>
        <form onSubmit={signIn} style={{ display: "flex", flexDirection: "column", gap: 13 }}>
          <div className="field">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {err && <div style={{ color: "var(--bad)", fontSize: 12.5 }}>{err}</div>}
          <button className="btn primary" disabled={busy} style={{ justifyContent: "center", padding: "10px" }}>
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <div style={{ fontSize: 11.5, color: "var(--faint)", marginTop: 16 }}>
          No account? Ask your admin to invite you from Supabase.
        </div>
      </div>
    </div>
  );
}
