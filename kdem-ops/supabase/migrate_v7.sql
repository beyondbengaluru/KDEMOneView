-- ============================================================
-- MIGRATE v7 — run on an EXISTING database (no reset). Safe to re-run.
-- Run after migrate_v5.sql and migrate_v6.sql.
--
--  1. Task visibility fixed. The old "tasks write" policy was FOR ALL, and in
--     Postgres a FOR ALL policy also grants SELECT — so Master/CEO (who can
--     write to every vertical) could read every task, and vertical leads could
--     read colleagues' private tasks. Writes are now split into
--     insert / update / delete. The CEO Office sees only tasks escalated to it,
--     shared with the whole team, its own, or created by the CEO Office.
--  2. Shivamogga merged into Davanagere (one BB cluster).
--  3. External agency accounts (role 'external', vertical = their desk:
--     'pr_desk' or 'digital_desk') can see and edit only their desk.
--  4. Resources (shared documents and live links) and Communications.
--  5. Meetings: end time + Outlook event ids.
-- ============================================================

-- ---------- helpers ----------
create or replace function public.is_external() returns boolean
language sql stable security definer set search_path = public
as $$ select coalesce((select role from profiles where id = auth.uid()) = 'external', false) $$;

create or replace function public.is_ceo_office(uid uuid) returns boolean
language sql stable security definer set search_path = public
as $$ select exists (select 1 from profiles where id = uid and role in ('master','ceo')) $$;

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check
  check (role in ('master','ceo','lead','member','cluster_head','external'));

-- ---------- 1. tasks ----------
drop policy if exists "tasks read"   on public.tasks;
drop policy if exists "tasks write"  on public.tasks;
drop policy if exists "tasks insert" on public.tasks;
drop policy if exists "tasks update" on public.tasks;
drop policy if exists "tasks delete" on public.tasks;

create policy "tasks read" on public.tasks for select to authenticated using (
  created_by = auth.uid()
  or assignee = my_name()
  or (not is_external() and (
        visibility = 'team'
     or (visibility = 'vertical' and coalesce(my_role(), '') not in ('master','ceo') and (
           my_vertical() = vertical
           or verticals @> array[my_vertical()]
           or (my_role() = 'cluster_head' and vertical = 'bb')))
     or (my_role() in ('master','ceo') and visibility <> 'private' and (
           visibility = 'ceo'                 -- escalated by a team
           or vertical = 'ceo'                -- the CEO Office's own
           or verticals @> array['ceo']       -- shared with the CEO Office
           or is_ceo_office(created_by)))     -- assigned by the CEO Office
  ))
);
create policy "tasks insert" on public.tasks for insert to authenticated
  with check (not is_external() and created_by = auth.uid());
create policy "tasks update" on public.tasks for update to authenticated
  using ( created_by = auth.uid()
          or assignee = my_name()             -- assignees can move their own tasks along
          or (can_write(vertical)
              and (my_role() <> 'cluster_head' or coalesce(cluster,'') = my_cluster())) );
create policy "tasks delete" on public.tasks for delete to authenticated
  using ( created_by = auth.uid()
          or (can_write(vertical)
              and (my_role() <> 'cluster_head' or coalesce(cluster,'') = my_cluster())) );

-- ---------- 2. Shivamogga → Davanagere ----------
create or replace function public.bb_clusters() returns text[]
language sql immutable as $$
  select array['Mysuru','Mangaluru','Hubballi-Dharwad-Belagavi','Kalaburagi',
               'Tumakuru','Davanagere','Cluster TBD']
$$;
update public.records  set data = jsonb_set(data, '{cluster}', '"Davanagere"') where data->>'cluster' = 'Shivamogga';
update public.events   set cluster = 'Davanagere', name = replace(name, 'Shivamogga', 'Davanagere'),
                           location = replace(location, 'Shivamogga', 'Davanagere') where cluster = 'Shivamogga';
update public.tasks    set cluster = 'Davanagere' where cluster = 'Shivamogga';
update public.profiles set cluster = 'Davanagere' where cluster = 'Shivamogga';

-- ---------- 3. external agencies: only their desk ----------
drop policy if exists "records read" on public.records;
create policy "records read" on public.records for select to authenticated
  using (not is_external() or (vertical = 'mkt' and tab = my_vertical()));
drop policy if exists "records external" on public.records;
create policy "records external" on public.records for all to authenticated
  using (is_external() and vertical = 'mkt' and tab = my_vertical())
  with check (is_external() and vertical = 'mkt' and tab = my_vertical());

drop policy if exists "events read" on public.events;
create policy "events read" on public.events for select to authenticated using (not is_external());
drop policy if exists "events write"  on public.events;
drop policy if exists "events insert" on public.events;
drop policy if exists "events update" on public.events;
drop policy if exists "events delete" on public.events;
create or replace function public.can_write_event(v text, c text) returns boolean
language sql stable security definer set search_path = public
as $$
  select can_write(v)
      or (my_role() = 'cluster_head' and coalesce(c,'') = my_cluster())
      or (my_vertical() = 'bb' and coalesce(c,'') = any(bb_clusters()))
$$;
create policy "events insert" on public.events for insert to authenticated with check (can_write_event(vertical, cluster));
create policy "events update" on public.events for update to authenticated using (can_write_event(vertical, cluster));
create policy "events delete" on public.events for delete to authenticated using (can_write_event(vertical, cluster));

drop policy if exists "meetings read"   on public.meetings;
drop policy if exists "meetings write"  on public.meetings;
drop policy if exists "meetings insert" on public.meetings;
drop policy if exists "meetings update" on public.meetings;
drop policy if exists "meetings delete" on public.meetings;
create policy "meetings read"   on public.meetings for select to authenticated using (not is_external());
create policy "meetings insert" on public.meetings for insert to authenticated with check (not is_external());
create policy "meetings update" on public.meetings for update to authenticated using (not is_external());
create policy "meetings delete" on public.meetings for delete to authenticated using (not is_external());

drop policy if exists "profiles read" on public.profiles;
create policy "profiles read" on public.profiles for select to authenticated using (
  not is_external() or id = auth.uid() or vertical in ('mkt', my_vertical()) or role in ('master','ceo'));

-- ---------- 4a. resources ----------
create table if not exists public.resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  kind text not null default 'file' check (kind in ('file','link')),
  link_type text default '',          -- Google Docs / Microsoft 365 / Other (links)
  category text default 'Other',
  url text default '',
  file_name text default '',          -- stored at docs/resources/<id>/<file_name>
  verticals text[] not null default '{}',   -- empty = everyone
  notes text default '',
  created_by uuid default auth.uid(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.resources enable row level security;
create or replace function public.can_see_resource(rid uuid) returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from resources r where r.id = rid and not is_external() and (
    r.verticals = '{}' or my_role() in ('master','ceo') or r.created_by = auth.uid()
    or my_vertical() = any(r.verticals)))
$$;
drop policy if exists "resources read"   on public.resources;
drop policy if exists "resources insert" on public.resources;
drop policy if exists "resources update" on public.resources;
drop policy if exists "resources delete" on public.resources;
-- Checked on the row's own columns: a lookup function can't see a row inserted in the same statement
create policy "resources read"   on public.resources for select to authenticated using (
  not is_external() and (verticals = '{}' or my_role() in ('master','ceo')
                         or created_by = auth.uid() or my_vertical() = any(verticals)));
create policy "resources insert" on public.resources for insert to authenticated
  with check (not is_external() and my_role() is not null and created_by = auth.uid());
create policy "resources update" on public.resources for update to authenticated
  using (created_by = auth.uid() or my_role() = 'master');
create policy "resources delete" on public.resources for delete to authenticated
  using (created_by = auth.uid() or my_role() = 'master');
drop trigger if exists resources_touch on public.resources;
create trigger resources_touch before update on public.resources for each row execute function touch_updated_at();

-- ---------- 4b. communications ----------
-- Channels: 'all' (whole team) · 'v:<vertical>' (my vertical; CEO Office = 'v:ceo')
--           'dm:<uuid>:<uuid>' (two people, sorted) · 'x:<desk>' (Marketing ↔ agency)
create or replace function public.can_see_channel(ch text) returns boolean
language sql stable security definer set search_path = public
as $$
  select case
    when ch = 'all'     then my_role() is not null and not is_external()
    when ch like 'v:%'  then not is_external() and substr(ch, 3) =
                               case when my_role() in ('master','ceo') then 'ceo' else my_vertical() end
    when ch like 'dm:%' then auth.uid()::text = any(string_to_array(substr(ch, 4), ':'))
    when ch like 'x:%'  then my_role() in ('master','ceo')
                          or (my_vertical() = 'mkt' and my_role() in ('lead','member'))
                          or (is_external() and substr(ch, 3) = my_vertical())
    else false end
$$;
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  channel text not null,
  body text not null default '',
  attachments jsonb not null default '[]',   -- [{type:'file',name,path} | {type:'resource',id,title}]
  sender uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  created_at timestamptz default now()
);
create index if not exists messages_channel on public.messages (channel, created_at desc);
alter table public.messages enable row level security;
drop policy if exists "messages read"   on public.messages;
drop policy if exists "messages insert" on public.messages;
drop policy if exists "messages delete" on public.messages;
create policy "messages read"   on public.messages for select to authenticated using (can_see_channel(channel));
create policy "messages insert" on public.messages for insert to authenticated
  with check (sender = auth.uid() and can_see_channel(channel));
create policy "messages delete" on public.messages for delete to authenticated using (sender = auth.uid());

do $$ begin
  alter publication supabase_realtime add table public.messages;
exception when others then null; end $$;
do $$ begin
  alter publication supabase_realtime add table public.resources;
exception when others then null; end $$;

-- ---------- storage: who can open which file ----------
-- docs/records/<id>/…   tracker attachments     docs/tasks/<id>/…    task files
-- docs/meetings/<id>/…  meeting files           docs/resources/<id>/… resources
-- docs/comms/<channel>/… chat attachments
create or replace function public.can_see_doc(path text) returns boolean
language sql stable security definer set search_path = public
as $$
  select case split_part(path, '/', 1)
    when 'comms'     then can_see_channel(split_part(path, '/', 2))
    when 'resources' then can_see_resource(nullif(split_part(path, '/', 2), '')::uuid)
    when 'records'   then not is_external() or exists (
                            select 1 from records r where r.id::text = split_part(path, '/', 2)
                              and r.vertical = 'mkt' and r.tab = my_vertical())
    else not is_external() end
$$;
drop policy if exists "docs read"   on storage.objects;
drop policy if exists "docs insert" on storage.objects;
drop policy if exists "docs delete" on storage.objects;
create policy "docs read"   on storage.objects for select to authenticated using (bucket_id = 'docs' and can_see_doc(name));
create policy "docs insert" on storage.objects for insert to authenticated with check (bucket_id = 'docs' and can_see_doc(name));
create policy "docs delete" on storage.objects for delete to authenticated using (bucket_id = 'docs' and can_see_doc(name));

-- ---------- 5. meetings ↔ Outlook ----------
alter table public.meetings add column if not exists end_time text default '';
alter table public.meetings add column if not exists outlook_ids jsonb not null default '{}';  -- {profile_id: outlook_event_id}
