"use client";
import TasksPanel from "@/components/TasksPanel";
import { useApp } from "@/lib/ctx";

// Beyond Bengaluru people get the same task table as their BB page
// (cluster, cross-vertical, notes); everyone else sees all their tasks.
export default function TasksPage() {
  const { profile } = useApp();
  const bb = profile?.vertical === "bb" || profile?.role === "cluster_head";
  return bb ? <TasksPanel vertical="bb" title="Tasks" /> : <TasksPanel title="Tasks" />;
}
