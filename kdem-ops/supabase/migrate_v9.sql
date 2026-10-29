-- ============================================================
-- MIGRATE v9 — run on an EXISTING database. Safe to re-run.
-- Cluster heads can see and update every task tagged with their cluster,
-- whichever vertical created it (private tasks stay private).
-- Everything else about task visibility is unchanged from v7/v8.
-- ============================================================
drop policy if exists "tasks read" on public.tasks;
create policy "tasks read" on public.tasks for select to authenticated using (
  created_by = auth.uid()
  or assignee = my_name()
  or (not is_external() and (
        visibility = 'team'
     or (visibility = 'vertical' and coalesce(my_role(), '') not in ('master','ceo') and (
           my_vertical() = vertical
           or verticals @> array[my_vertical()]
           or (my_role() = 'cluster_head' and vertical = 'bb')))
     or (my_role() = 'cluster_head' and visibility <> 'private' and cluster = my_cluster())
     or (my_role() in ('master','ceo') and visibility <> 'private' and (
           visibility = 'ceo'
           or vertical = 'ceo'
           or verticals @> array['ceo']
           or is_ceo_office(created_by)))
  ))
);
drop policy if exists "tasks update" on public.tasks;
create policy "tasks update" on public.tasks for update to authenticated
  using ( created_by = auth.uid()
          or assignee = my_name()
          or (my_role() = 'cluster_head' and visibility <> 'private' and cluster = my_cluster())
          or (can_write(vertical)
              and (my_role() <> 'cluster_head' or coalesce(cluster,'') = my_cluster())) );
