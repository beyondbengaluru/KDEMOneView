"use client";
import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  WidthType, AlignmentType, BorderStyle,
} from "docx";
import { saveAs } from "file-saver";

// Minutes of Meeting — matches the KDEM GC-minutes format:
// MINUTES OF MEETING → meeting title → Date/Venue/Purpose/Chaired-by table
// → attendee table (Sl P/T/V/A | Participants | Designation) → minutes
// prose → Action Items table.

const B = { style: BorderStyle.SINGLE, size: 4, color: "444444" };
const borders = { top: B, bottom: B, left: B, right: B };

const run = (text, opts = {}) =>
  new TextRun({ text: String(text ?? ""), font: "Calibri", size: opts.size || 21, bold: opts.bold, italics: opts.italics });

const cell = (text, { bold = false, width } = {}) =>
  new TableCell({
    borders,
    width: width ? { size: width, type: WidthType.PERCENTAGE } : undefined,
    margins: { top: 70, bottom: 70, left: 110, right: 110 },
    children: [new Paragraph({ children: [run(text, { bold })] })],
  });

const fmtDate = (iso) => {
  if (!iso) return "TBD";
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
};

/**
 * meeting: row from `meetings` (title, kind, mode, date, time, venue, link,
 *          participants[], externals, chaired_by, minutes)
 * tasks:   linked next-step tasks (become Action Items)
 * team:    profiles [{name, title}] to resolve designations
 */
export async function generateMoM(meeting, tasks = [], team = []) {
  const titleFor = (name) => team.find((p) => p.name === name)?.title || "KDEM";

  const attendees = [
    ...(meeting.participants || []).map((n) => ({ mark: "P", name: n, desig: `${titleFor(n)}, KDEM` })),
    ...String(meeting.externals || "")
      .split(/\n|;/).map((s) => s.trim()).filter(Boolean)
      .map((s) => {
        const [name, desig] = s.split(/—|–|-{1,2}|,(.+)/).map((x) => (x || "").trim());
        return { mark: "P", name: name || s, desig: desig || "" };
      }),
  ];

  const children = [
    new Paragraph({
      alignment: AlignmentType.CENTER, spacing: { after: 120 },
      children: [run("MINUTES OF MEETING", { bold: true, size: 28 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER, spacing: { after: 60 },
      children: [run(meeting.title, { bold: true, size: 24 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER, spacing: { after: 180 },
      children: [run("Karnataka Digital Economy Mission (KDEM)", { italics: true, size: 20 })],
    }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({ children: [cell("Date:", { bold: true, width: 18 }), cell(`${fmtDate(meeting.date)}${meeting.time ? ` · ${meeting.time}` : ""}`, { width: 82 })] }),
        new TableRow({ children: [cell(meeting.mode === "online" ? "Link:" : "Venue:", { bold: true }), cell(meeting.mode === "online" ? (meeting.link || "Online") : (meeting.venue || "—"))] }),
        new TableRow({ children: [cell("Purpose:", { bold: true }), cell(meeting.title)] }),
        new TableRow({ children: [cell("Chaired by:", { bold: true }), cell(meeting.chaired_by || "—")] }),
      ],
    }),
    new Paragraph({
      spacing: { before: 200, after: 80 },
      children: [run("Distribution and Attendee List: (P indicates that the member was present; T – via teleconference, V – on vacation, A – absent)", { size: 18, italics: true })],
    }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({ children: [cell("Sl", { bold: true, width: 8 }), cell("Participants", { bold: true, width: 40 }), cell("Designation", { bold: true, width: 52 })] }),
        ...attendees.map((a) =>
          new TableRow({ children: [cell(a.mark, { bold: true }), cell(a.name), cell(a.desig)] })),
      ],
    }),
  ];

  // Minutes prose
  const minutes = String(meeting.minutes || "").split(/\n+/).map((s) => s.trim()).filter(Boolean);
  if (minutes.length) {
    children.push(new Paragraph({ spacing: { before: 240, after: 80 }, children: [run("Minutes", { bold: true, size: 23 })] }));
    minutes.forEach((line) =>
      children.push(new Paragraph({ spacing: { after: 110 }, children: [run(line)] })));
  }

  // Action items
  if (tasks.length) {
    children.push(new Paragraph({ spacing: { before: 240, after: 80 }, children: [run("Action Items", { bold: true, size: 23 })] }));
    children.push(new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({ children: [cell("#", { bold: true, width: 8 }), cell("Action Item", { bold: true, width: 92 })] }),
        ...tasks.map((t, i) =>
          new TableRow({
            children: [
              cell(String(i + 1)),
              cell(`${t.title}${t.assignee ? ` — ${t.assignee}` : ""}${t.due_date ? ` (by ${fmtDate(t.due_date)})` : ""}`),
            ],
          })),
      ],
    }));
  }

  const doc = new Document({
    styles: { default: { document: { run: { font: "Calibri" } } } },
    sections: [{ properties: {}, children }],
  });
  const blob = await Packer.toBlob(doc);
  saveAs(blob, `MoM_${(meeting.title || "Meeting").replace(/\W+/g, "_")}_${meeting.date || ""}.docx`);
}
