"use client";
import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, WidthType, AlignmentType, BorderStyle,
} from "docx";
import { saveAs } from "file-saver";
import { VERTICALS } from "./schemas";

const B = { style: BorderStyle.SINGLE, size: 4, color: "D8DDD6" };
const borders = { top: B, bottom: B, left: B, right: B };

const cell = (text, { bold = false, width, shade } = {}) =>
  new TableCell({
    borders,
    width: width ? { size: width, type: WidthType.PERCENTAGE } : undefined,
    shading: shade ? { fill: shade } : undefined,
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    children: [new Paragraph({ children: [new TextRun({ text: String(text ?? ""), bold, size: 19, font: "Calibri" })] })],
  });

const headerRow = (labels) =>
  new TableRow({ children: labels.map((l) => cell(l, { bold: true, shade: "EEF1EC" })) });

const h1 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 200, after: 120 }, children: [new TextRun({ text: t, font: "Calibri", size: 32, bold: true, color: "0C6B53" })] });
const h2 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 }, children: [new TextRun({ text: t, font: "Calibri", size: 25, bold: true, color: "17201B" })] });
const p = (t, opts = {}) => new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: t, font: "Calibri", size: 20, color: opts.muted ? "5B6963" : "17201B", italics: opts.italics })] });

// Exact Q1-progress format: Sl No | Activities / Initiatives |
// Annual Targets & Measurable Outcomes — FY | {Period} Progress,
// with the progress column computed live from the trackers.
function kpiTable(counters, fy, periodLabel) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      headerRow([
        "Sl No",
        "Activities / Initiatives",
        `Annual Targets & Measurable Outcomes — FY ${fy}`,
        `${periodLabel} Progress`,
      ]),
      ...counters.map((k, i) =>
        new TableRow({
          children: [
            cell(String(i + 1), { width: 7 }),
            cell(k.label, { width: 27 }),
            cell(k.target, { width: 38 }),
            cell(`${Number(k.value).toLocaleString("en-IN")} ${k.unit || ""}`.trim(), { width: 28 }),
          ],
        })
      ),
    ],
  });
}

function proposalsTable(rows) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      headerRow(["Proposal", "Submitted to", "Status", "Next step"]),
      ...rows.map((r) =>
        new TableRow({
          children: [
            cell(r.data?.title, { width: 36 }),
            cell(r.data?.submitted_to, { width: 18 }),
            cell(r.data?.status, { width: 18 }),
            cell((r.data?.steps || []).find((st) => !st.done)?.what || "—", { width: 28 }),
          ],
        })
      ),
    ],
  });
}

function tasksTable(rows) {
  const statusLabel = { todo: "To do", inprogress: "In progress", done: "Done" };
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      headerRow(["Task", "Assignee", "Priority", "Status", "Due"]),
      ...rows.map((t) =>
        new TableRow({
          children: [
            cell(t.title, { width: 40 }),
            cell(t.assignee, { width: 18 }),
            cell(t.priority, { width: 14 }),
            cell(statusLabel[t.status] || t.status, { width: 14 }),
            cell(t.due_date || "—", { width: 14 }),
          ],
        })
      ),
    ],
  });
}

function eventsTable(rows) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      headerRow(["Event", "Type", "Date", "Location", "Status"]),
      ...rows.map((e) =>
        new TableRow({
          children: [
            cell(e.name, { width: 34 }),
            cell(e.type, { width: 16 }),
            cell(e.date || "—", { width: 16 }),
            cell(e.location, { width: 20 }),
            cell(e.status, { width: 14 }),
          ],
        })
      ),
    ],
  });
}

/**
 * scopeKey: 'all' or a vertical key
 * period: { label, from, to }  (ISO dates)
 * fy: '2026-27'
 * data: { counters, proposals, tasks, events }  — pre-filtered by caller
 */
export async function generateReport({ scopeKey, period, fy, data }) {
  const scopeName = scopeKey === "all" ? "All Verticals" : VERTICALS[scopeKey].name;
  const children = [
    new Paragraph({
      alignment: AlignmentType.LEFT, spacing: { after: 40 },
      children: [new TextRun({ text: "KARNATAKA DIGITAL ECONOMY MISSION", font: "Calibri", size: 17, color: "B07A1E", bold: true })],
    }),
    h1(`Progress Report — ${scopeName}`),
    p(`FY ${fy} · Period: ${period.label} · Generated ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`, { muted: true }),
  ];

  const verticals = scopeKey === "all" ? Object.keys(VERTICALS) : [scopeKey];

  for (const vk of verticals) {
    const v = VERTICALS[vk];
    const counters = (data.counters?.[vk] || []).filter((c) => c.value || c.target !== "—");
    const inits = data.proposals.filter((r) => r.vertical === vk);
    const tasks = data.tasks.filter((t) => t.vertical === vk);

    if (counters.length) {
      children.push(h2(v.name.toUpperCase()));
      children.push(kpiTable(counters, fy, period.short || period.label));
      children.push(p("Note: Subject to approval from the respective department", { muted: true }));
    }
    if (inits.length) {
      children.push(h2("Proposals & strategic initiatives"));
      children.push(proposalsTable(inits));
    }
    const done = tasks.filter((t) => t.status === "done");
    const open = tasks.filter((t) => t.status !== "done");
    if (done.length) {
      children.push(h2("Completed this period"));
      children.push(tasksTable(done));
    }
    if (open.length) {
      children.push(h2("Open tasks"));
      children.push(tasksTable(open));
    }
  }

  const evts = data.events;
  if (evts.length) {
    children.push(h2(`Events in period`));
    children.push(eventsTable(evts));
  }

  const doc = new Document({
    styles: { default: { document: { run: { font: "Calibri" } } } },
    sections: [{ properties: {}, children }],
  });

  const blob = await Packer.toBlob(doc);
  const fname = `KDEM_OneView_${scopeKey === "all" ? "All" : VERTICALS[scopeKey].short.replace(/\W+/g, "")}_FY${fy}_${period.label.replace(/\W+/g, "_")}.docx`;
  saveAs(blob, fname);
}
