"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutGrid, ListTodo, CalendarDays, Presentation, ShieldCheck,
  Moon, Sun, LogOut, FileDown, UserRound, Search,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { AppCtx, buildPerms } from "@/lib/ctx";
import { VERTICALS, VERTICAL_KEYS, FYS, DEFAULT_FY, applyTheme } from "@/lib/schemas";
import ReportModal from "@/components/ReportModal";
import SearchPalette from "@/components/SearchPalette";

export default function AppLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dark, setDark] = useState(false);
  const [fy, setFyState] = useState(DEFAULT_FY);
  const [menu, setMenu] = useState(false);
  const [report, setReport] = useState(false);
  const [search, setSearch] = useState(false);
  const [toast, setToast] = useState("");
  const menuRef = useRef(null);

  const notify = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2400);
  }, []);

  const setFy = useCallback((val) => {
    setFyState(val);
    localStorage.setItem("kdem-fy", val);
  }, []);

  useEffect(() => {
    if (localStorage.getItem("kdem-theme") === "dark") setDark(true);
    const savedFy = localStorage.getItem("kdem-fy");
    if (savedFy && FYS.includes(savedFy)) setFyState(savedFy);
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("kdem-theme", dark ? "dark" : "light");
  }, [dark]);

  // ⌘K / Ctrl-K opens global search
  useEffect(() => {
    const fn = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setSearch(true); }
    };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, []);

  // close avatar menu on outside click
  useEffect(() => {
    const fn = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenu(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const refreshProfile = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) return;
    const { data: prof } = await supabase.from("profiles").select("*").eq("id", data.session.user.id).single();
    setProfile(prof);
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) return router.replace("/login");
      const [{ data: prof }, { data: theme }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", data.session.user.id).single(),
        supabase.from("settings").select("value").eq("key", "theme").single(),
      ]);
      if (theme?.value) applyTheme(theme.value);
      if (alive) { setProfile(prof); setLoading(false); }
    })();
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) router.replace("/login");
    });
    return () => { alive = false; sub.subscription.unsubscribe(); };
  }, [router]);

  if (loading) return <div className="login-wrap" style={{ color: "var(--faint)" }}>Loading…</div>;

  const perms = buildPerms(profile);
  const initials = (profile?.name || "?").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const active = (href) => pathname === href || pathname.startsWith(href + "/");

  const pageTitle =
    pathname.startsWith("/v/") ? VERTICALS[pathname.split("/")[2]]?.name || "Vertical" :
    pathname.startsWith("/tasks") ? "Tasks" :
    pathname.startsWith("/calendar") ? "Calendar" :
    pathname.startsWith("/meetings") ? "Meetings" :
    pathname.startsWith("/db") ? "Database" :
    pathname.startsWith("/me") ? "My space" :
    pathname.startsWith("/admin") ? "Admin" : "All Verticals";

  return (
    <AppCtx.Provider value={{ profile, ...perms, notify, fy, setFy, refreshProfile }}>
      <div className="shell">
        <aside className="sidebar">
          <div className="brand">
            <div className="eyebrow">KDEM</div>
            <div className="title">OneView</div>
            <div className="sub">Operations Centre</div>
          </div>
          <div className="navlabel">Command</div>
          {perms.isCeoLevel && (
            <Link href="/overview" className={`navitem ${active("/overview") ? "on" : ""}`}>
              <LayoutGrid size={16} /> All Verticals
            </Link>
          )}
          <Link href="/tasks" className={`navitem ${active("/tasks") ? "on" : ""}`}>
            <ListTodo size={16} /> Tasks
          </Link>
          <Link href="/meetings" className={`navitem ${active("/meetings") ? "on" : ""}`}>
            <Presentation size={16} /> Meetings
          </Link>
          <Link href="/calendar" className={`navitem ${active("/calendar") ? "on" : ""}`}>
            <CalendarDays size={16} /> Calendar
          </Link>
          <div className="navlabel">{perms.isCeoLevel ? "Verticals" : "My vertical"}</div>
          {!perms.isCeoLevel && !perms.homeVertical && (
            <div style={{ padding: "4px 16px", fontSize: 11.5, color: "var(--faint)" }}>
              Not assigned yet — ask your Master
            </div>
          )}
          {(perms.isCeoLevel ? VERTICAL_KEYS : VERTICAL_KEYS.filter((k) => k === perms.homeVertical)).map((k) => (
            <Link key={k} href={`/v/${k}`} className={`navitem ${active(`/v/${k}`) ? "on" : ""}`}>
              <span className="spine" style={{ background: VERTICALS[k].color }} />
              {VERTICALS[k].short}
            </Link>
          ))}
          {!perms.isCeoLevel && perms.homeVertical && (
            <div style={{ paddingLeft: 10 }}>
              {(perms.homeVertical === "bb"
                ? [["overview", "Overview"], ["all", "All clusters"], ["Mysuru", "Mysuru"], ["Mangaluru", "Mangaluru"],
                   ["Hubballi-Dharwad-Belagavi", "HDB"], ["Kalaburagi", "Kalaburagi"], ["Tumakuru", "Tumakuru"],
                   ["Shivamogga", "Shivamogga"], ["policies", "Policies"], ["database", "Database"], ["proposals", "Proposals"]]
                : [["overview", "Overview"],
                   ...VERTICALS[perms.homeVertical].tabs.map((t) => [t.viewKey || t.key, t.label])]
              ).map(([k, l]) => (
                <Link key={k} href={`/v/${perms.homeVertical}?tab=${encodeURIComponent(k)}`}
                  className="navitem" style={{ fontSize: 12.5, padding: "6px 14px", color: "var(--muted)" }}>
                  {l}
                </Link>
              ))}
            </div>
          )}
          {perms.isCeoLevel && (
            <>
              <div className="navlabel">System</div>
              <Link href="/admin" className={`navitem ${active("/admin") ? "on" : ""}`}>
                <ShieldCheck size={16} /> {perms.isMaster ? "Admin" : "Team"}
              </Link>
            </>
          )}
        </aside>

        <div className="main">
          <header className="topbar" style={{ position: "relative" }}>
            <div className="pagetitle">{pageTitle}</div>
            <div className="fychip">FY {fy}</div>
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 9 }} ref={menuRef}>
              <button className="btn ghost" onClick={() => setSearch(true)} title="Search everything (⌘K)">
                <Search size={15} />
              </button>
              <button className="avatarbtn" onClick={() => setMenu((m) => !m)}>{initials}</button>
              {menu && (
                <div className="menu">
                  <div className="mhead2">
                    <div style={{ fontWeight: 700, fontSize: 13.5 }}>{profile?.name}</div>
                    <div style={{ fontSize: 11.5, color: "var(--faint)" }}>{profile?.title || profile?.email}</div>
                  </div>
                  <Link href="/me" className="menuitem" onClick={() => setMenu(false)}>
                    <UserRound size={15} /> My space
                  </Link>
                  <button className="menuitem" onClick={() => { setMenu(false); setReport(true); }}>
                    <FileDown size={15} /> Download report
                  </button>
                  <div style={{ fontSize: 10.5, color: "var(--faint)", padding: "8px 11px 3px", fontWeight: 700, letterSpacing: ".05em" }}>FINANCIAL YEAR</div>
                  <div className="fyopt">
                    {FYS.map((f) => (
                      <button key={f} className={`chip ${fy === f ? "on" : ""}`} onClick={() => setFy(f)}>FY {f}</button>
                    ))}
                  </div>
                  <button className="menuitem" onClick={() => setDark(!dark)}>
                    {dark ? <Sun size={15} /> : <Moon size={15} />} {dark ? "Light mode" : "Dark mode"}
                  </button>
                  <button className="menuitem" style={{ color: "var(--bad)" }}
                    onClick={async () => { await supabase.auth.signOut(); }}>
                    <LogOut size={15} /> Sign out
                  </button>
                </div>
              )}
            </div>
          </header>
          <main className="content">{children}</main>
        </div>
      </div>
      {report && <ReportModal onClose={() => setReport(false)} />}
      {search && <SearchPalette onClose={() => setSearch(false)} />}
      {toast && <div className="toast">{toast}</div>}
    </AppCtx.Provider>
  );
}
