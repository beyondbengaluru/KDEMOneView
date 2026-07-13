"use client";
import Papa from "papaparse";

export function exportCSV(rows, columns, filename) {
  const data = rows.map((r) => {
    const o = {};
    columns.forEach((c) => (o[c.label] = r.data?.[c.key] ?? r[c.key] ?? ""));
    return o;
  });
  const csv = Papa.unparse(data);
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

// Maps CSV headers to columns by label or key (case-insensitive)
export function parseCSV(file, columns) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: ({ data }) => {
        const byLabel = {};
        columns.forEach((c) => {
          byLabel[c.label.toLowerCase()] = c;
          byLabel[c.key.toLowerCase()] = c;
        });
        const rows = data
          .map((j) => {
            const o = {};
            Object.keys(j).forEach((h) => {
              const c = byLabel[String(h).toLowerCase().trim()];
              if (!c) return;
              let v = j[h];
              if (c.type === "number" || c.type === "percent")
                v = v === "" || v == null ? null : parseFloat(v);
              o[c.key] = v;
            });
            return o;
          })
          .filter((o) => o[columns[0].key]);
        resolve(rows);
      },
      error: reject,
    });
  });
}
