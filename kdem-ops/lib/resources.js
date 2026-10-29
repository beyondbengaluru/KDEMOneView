"use client";
import { supabase } from "./supabase";

export const RESOURCE_CATEGORIES = ["Policy", "Guideline", "Template", "Report", "Presentation", "Form", "Document", "Other"];

// "Karnataka_Startup_Policy_2025-30.pdf" → "Karnataka Startup Policy 2025-30"
export function titleFromFile(name) {
  const base = String(name).replace(/\.[^.]+$/, "");
  let t = base;
  try { t = decodeURIComponent(base); } catch { /* keep as is */ }
  return t.replace(/[_]+/g, " ").replace(/\s*\.\s*/g, " ").replace(/\s+/g, " ").trim() || name;
}

// The type is usually in the name; otherwise the file extension decides
export function categoryFromFile(name) {
  let n = String(name).toLowerCase();
  try { n = decodeURIComponent(n); } catch { /* keep as is */ }
  const ext = (n.match(/\.([a-z0-9]+)$/) || [])[1] || "";
  const has = (re) => re.test(n.replace(/[_\-.]+/g, " "));
  if (has(/\bpolic(y|ies)\b/)) return "Policy";
  if (has(/\b(opg|guideline|guidelines|sop|manual|handbook|framework|circular|notification)\b/)) return "Guideline";
  if (has(/\b(report|landscape|study|survey|analysis|whitepaper|white paper)\b/)) return "Report";
  if (has(/\b(template|format|proforma|sample)\b/)) return "Template";
  if (has(/\b(form|application|checklist)\b/)) return "Form";
  if (has(/\b(ppt|deck|presentation|pitch)\b/) || ["ppt", "pptx", "key", "odp"].includes(ext)) return "Presentation";
  if (["doc", "docx", "pdf", "odt", "rtf", "txt", "xls", "xlsx", "csv"].includes(ext)) return "Document";
  return "Other";
}
// Live links open in their own editor, so edits happen in one shared copy
export const LINK_TYPES = [
  ["google", "Google Docs / Sheets / Slides"],
  ["m365", "Microsoft 365 (Word / Excel / PowerPoint online)"],
  ["other", "Other link"],
];

export async function openResource(r, notify) {
  if (r.kind === "link") return window.open(r.url, "_blank", "noopener");
  const { data, error } = await supabase.storage.from("docs").createSignedUrl(`resources/${r.id}/${r.file_name}`, 3600);
  if (error || !data?.signedUrl) return notify?.("You don't have access to this file");
  window.open(data.signedUrl, "_blank");
}

