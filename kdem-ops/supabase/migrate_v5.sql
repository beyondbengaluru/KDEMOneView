-- ============================================================
-- MIGRATE v5 — run this on an EXISTING database (no reset).
-- Fixes: task visibility actually enforced; adds time fields.
-- Fresh installs don't need this (schema.sql already has it all).
-- ============================================================

-- Task visibility column (+ constraint), time fields
alter table public.tasks  add column if not exists visibility text not null default 'vertical';
alter table public.tasks  drop constraint if exists tasks_visibility_check;
alter table public.tasks  add constraint tasks_visibility_check
  check (visibility in ('private','vertical','team','ceo'));
alter table public.tasks  add column if not exists due_time text default '';
alter table public.events add column if not exists time text default '';

create or replace function public.my_name() returns text
language sql stable security definer set search_path = public
as $$ select name from profiles where id = auth.uid() $$;

-- Replace the old "everyone sees every task" policy with real scoping
drop policy if exists "tasks read"  on public.tasks;
drop policy if exists "tasks write" on public.tasks;

create policy "tasks read" on public.tasks for select to authenticated using (
  created_by = auth.uid()
  or assignee = my_name()
  or visibility = 'team'
  or (visibility = 'vertical' and (
        my_vertical() = vertical
        or verticals @> array[my_vertical()]
        or (my_role() = 'cluster_head' and vertical = 'bb')
        or (vertical = 'ceo' and my_role() in ('master','ceo'))
     ))
  or (visibility = 'ceo' and my_role() in ('master','ceo'))
);
create policy "tasks write" on public.tasks for all to authenticated
  using ( created_by = auth.uid()
          or (can_write(vertical)
              and (my_role() <> 'cluster_head' or coalesce(cluster,'') = my_cluster())) )
  with check ( created_by = auth.uid()
          or (can_write(vertical)
              and (my_role() <> 'cluster_head' or coalesce(cluster,'') = my_cluster())) );
