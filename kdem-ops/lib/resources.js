"use client";
import { supabase } from "./supabase";

export const RESOURCE_CATEGORIES = ["Policy", "Guideline", "Template", "Report", "Presentation", "Form", "Other"];
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

