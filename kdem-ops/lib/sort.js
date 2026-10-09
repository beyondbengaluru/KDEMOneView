"use client";
import { useMemo, useState } from "react";

// Click a column header to sort: ascending → descending → original order.
// Numbers sort numerically, ISO dates chronologically, text naturally
// ("Q2" before "Q10"); blanks always go last.
const collator = new Intl.Collator("en-IN", { numeric: true, sensitivity: "base" });
const blank = (v) => v == null || v === "" || (Array.isArray(v) && !v.length);
function compare(a, b) {
  if (blank(a) || blank(b)) return blank(a) === blank(b) ? 0 : blank(a) ? 1 : -1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  const na = Number(a), nb = Number(b);
  if (!isNaN(na) && !isNaN(nb) && String(a).trim() !== "" && String(b).trim() !== "") return na - nb;
  return collator.compare(String(a), String(b));
}

/**
 * const { sorted, th } = useSort(rows, { due: (r) => r.due_date });
 * <th {...th("due")}>Due</th>
 * Keys without a getter read row[key], then row.data[key].
 */
export function useSort(rows, getters = {}) {
  const [s, setS] = useState(null);
  const sorted = useMemo(() => {
    if (!s || !rows) return rows;
    const get = getters[s.key] || ((r) => r?.[s.key] ?? r?.data?.[s.key]);
    return rows
      .map((r, i) => [r, i])
      .sort(([a, ia], [b, ib]) => {
        const va = get(a), vb = get(b);
        if (blank(va) || blank(vb)) return compare(va, vb) || ia - ib; // blanks last in both directions
        return compare(va, vb) * s.dir || ia - ib;
      })
      .map(([r]) => r);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, s]);
  const th = (key, extra = {}) => ({
    ...extra,
    className: `sortable${extra.className ? ` ${extra.className}` : ""}`,
    "aria-sort": s?.key === key ? (s.dir === 1 ? "ascending" : "descending") : undefined,
    onClick: () => setS((p) => (p?.key !== key ? { key, dir: 1 } : p.dir === 1 ? { key, dir: -1 } : null)),
  });
  return { sorted, th };
}
