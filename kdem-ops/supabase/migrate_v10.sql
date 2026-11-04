-- ============================================================
-- MIGRATE v10 — run on an EXISTING database. Safe to re-run.
-- Tasks get sub-tasks, a manual order, a free-text topic, and can be
-- shared with named people (used for Strategic initiatives).
-- ============================================================
alter table public.tasks add column if not exists parent_id uuid references public.tasks(id) on delete cascade;
alter table public.tasks add column if not exists sort_order integer;
alter table public.tasks add column if not exists topic text default '';
alter table public.tasks add column if not exists shared_with uuid[] not null default '{}';
alter table public.tasks add column if not exists strategic boolean not null default false;
create index if not exists tasks_parent on public.tasks (parent_id);

-- Read / update: everything from v9, plus people a task is shared with
drop policy if exists "tasks read" on public.tasks;
create policy "tasks read" on public.tasks for select to authenticated using (
  created_by = auth.uid()
  or assignee = my_name()
  or auth.uid() = any(shared_with)
  or (not is_external() and visibility <> 'private' and not strategic and (
        visibility = 'team'
     or (visibility = 'vertical' and coalesce(my_role(), '') not in ('master','ceo') and (
           my_vertical() = vertical
           or verticals @> array[my_vertical()]
           or (my_role() = 'cluster_head' and vertical = 'bb')))
     or (my_role() = 'cluster_head' and cluster = my_cluster())
     or (my_role() in ('master','ceo') and (
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
          or auth.uid() = any(shared_with)
          or (not strategic and my_role() = 'cluster_head' and visibility <> 'private' and cluster = my_cluster())
          or (not strategic and visibility <> 'private' and can_write(vertical)
              and (my_role() <> 'cluster_head' or coalesce(cluster,'') = my_cluster())) );
