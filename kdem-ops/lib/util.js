const FY = { start: "2026-04-01", end: "2027-03-31" };

export const clamp = (n) => Math.max(0, Math.min(1, n || 0));
export const fmt = (n) => {
  const x = Number(n) || 0;
  return x >= 1000 ? x.toLocaleString("en-IN") : String(x);
};
export const fyElapsed = () => {
  const s = +new Date(FY.start), e = +new Date(FY.end), t = Date.now();
  return clamp((t - s) / (e - s));
};
export const pctOf = (cur, target) => clamp(Number(cur) / (Number(target) || 1));

export function paceOf(progress) {
  const gap = progress - fyElapsed();
  if (gap >= 0.05) return { label: "Ahead", color: "var(--good)" };
  if (gap <= -0.12) return { label: "Catching up", color: "var(--warn)" };
  return { label: "On track", color: "var(--good)" };
}

export function verticalProgress(kpis) {
  if (!kpis?.length) return 0;
  return kpis.reduce((s, k) => s + pctOf(k.current, k.target), 0) / kpis.length;
}

export const todayISO = () => new Date().toISOString().slice(0, 10);
export const monthName = (y, m) =>
  new Date(y, m, 1).toLocaleString("en-IN", { month: "long", year: "numeric" });
