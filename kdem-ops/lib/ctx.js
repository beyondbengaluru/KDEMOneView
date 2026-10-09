"use client";
import { createContext, useContext } from "react";
import { BB_CLUSTERS } from "./schemas";

// { profile, isMaster, isCeoLevel, canWrite(v), canEditRow(v,data), notify }
export const AppCtx = createContext(null);
export const useApp = () => useContext(AppCtx);

export function buildPerms(profile) {
  const role = profile?.role;
  const isMaster = role === "master";
  const isCeoLevel = role === "master" || role === "ceo";
  const isExternal = role === "external";   // agency account: only its Marketing desk

  const canWrite = (vertical) => {
    if (!profile || isExternal) return false;
    if (isCeoLevel) return true;
    if (role === "cluster_head") return vertical === "bb";
    return profile.vertical === vertical;
  };

  // Row-level mirror of the SQL can_write_row():
  // BB team can edit any record belonging to a BB cluster (mirrored rows),
  // cluster heads only their own cluster's rows, teams their vertical.
  const canEditRow = (vertical, data = {}) => {
    if (!profile) return false;
    if (isExternal) return vertical === "mkt";   // RLS limits them to their desk's rows
    if (isCeoLevel) return true;
    if (role === "cluster_head") return (data?.cluster || "") === profile.cluster;
    if (profile.vertical === vertical) return true;
    if (profile.vertical === "bb" && BB_CLUSTERS.includes(data?.cluster)) return true;
    return false;
  };

  // Which vertical pages this person can open
  const canView = (vertical) => {
    if (!profile || isExternal) return false;
    if (isCeoLevel) return true;
    if (role === "cluster_head") return vertical === "bb";
    return profile.vertical === vertical;
  };

  const homeVertical = isCeoLevel || isExternal ? null : role === "cluster_head" ? "bb" : profile?.vertical || null;

  return { isMaster, isCeoLevel, isExternal, canWrite, canEditRow, canView, homeVertical };
}
