-- ============================================================
-- KDEM OneView — Supabase schema v2  (fresh install: run once)
-- ============================================================

-- ---------- PROFILES ----------
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  email text, name text, title text,
  role text not null default 'member'
    check (role in ('master','ceo','lead','member','cluster_head')),
  vertical text,          -- itgcc | esdm | sni | bb | talent | mkt | null
  cluster text,           -- cluster heads: Mysuru | Mangaluru | Hubballi-Dharwad-Belagavi | Kalaburagi
  created_at timestamptz default now()
);

create or replace function public.my_role() returns text
language sql stable security definer set search_path = public
as $$ select role from profiles where id = auth.uid() $$;

create or replace function public.my_vertical() returns text
language sql stable security definer set search_path = public
as $$ select vertical from profiles where id = auth.uid() $$;

create or replace function public.my_cluster() returns text
language sql stable security definer set search_path = public
as $$ select cluster from profiles where id = auth.uid() $$;

-- Vertical-level rights (tasks, events)
create or replace function public.can_write(v text) returns boolean
language sql stable security definer set search_path = public
as $$
  select my_role() in ('master','ceo')
      or (my_role() in ('lead','member') and my_vertical() = v)
      or (my_role() = 'cluster_head' and v = 'bb')
$$;

-- Row-level rights for shared/mirrored records:
--  • master/ceo: everything
--  • vertical teams: rows homed in their vertical
--  • BB team: any row whose cluster is a BB cluster (mirrored GCCs, DCs,
--    investments, startups, policy registrations…)
--  • cluster heads: only rows of their own cluster
create or replace function public.can_write_row(v text, d jsonb) returns boolean
language sql stable security definer set search_path = public
as $$
  select my_role() in ('master','ceo')
      or (my_role() in ('lead','member') and my_vertical() = v)
      or (my_role() in ('lead','member') and my_vertical() = 'bb'
          and coalesce(d->>'cluster','') in ('Mysuru','Mangaluru','Hubballi-Dharwad-Belagavi','Kalaburagi','Tumakuru','Shivamogga'))
      or (my_role() = 'cluster_head' and coalesce(d->>'cluster','') = my_cluster())
      or (v = 'db' and my_role() is not null)   -- the Database is maintained by everyone
$$;

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, split_part(new.email, '@', 1));
  return new;
end $$;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
create policy "profiles read"   on profiles for select to authenticated using (true);
create policy "profiles update" on profiles for update to authenticated
  using (id = auth.uid() or my_role() = 'master');

-- ---------- SETTINGS (theme color etc., master-controlled) ----------
create table public.settings ( key text primary key, value text );
alter table public.settings enable row level security;
create policy "settings read"  on settings for select to authenticated using (true);
create policy "settings write" on settings for all to authenticated
  using (my_role() = 'master') with check (my_role() = 'master');
insert into settings (key, value) values ('brand', '#0C6B53');

-- ---------- RECORDS (all tab data; shared datasets with one home) ----------
create table public.records (
  id uuid primary key default gen_random_uuid(),
  vertical text not null,     -- HOME vertical of the dataset ('db' = permanent directory)
  tab text not null,
  fy text not null default '2026-27',
  data jsonb not null default '{}',
  created_by uuid default auth.uid(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index records_vt on records (fy, vertical, tab);

alter table public.records enable row level security;
create policy "records read"   on records for select to authenticated using (true);
create policy "records insert" on records for insert to authenticated
  with check (can_write_row(vertical, data));
create policy "records update" on records for update to authenticated
  using (can_write_row(vertical, data));
create policy "records delete" on records for delete to authenticated
  using (can_write_row(vertical, data));

-- ---------- TASKS ----------
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  vertical text not null,
  verticals text[] not null default '{}',   -- also visible in (multi-vertical)
  cluster text,                              -- BB cluster tasks
  assignee text default '',
  priority text default 'medium' check (priority in ('high','medium','low')),
  status text default 'todo' check (status in ('todo','inprogress','done')),
  due_date date,
  due_time text default '',
  show_on_calendar boolean default true,
  visibility text not null default 'vertical'
    check (visibility in ('private','vertical','team','ceo')),
  meeting_id uuid,                           -- born from a meeting's next steps
  event_id uuid,                             -- prep tasks for an event
  notes text default '',
  created_by uuid default auth.uid(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create or replace function public.my_name() returns text
language sql stable security definer set search_path = public
as $$ select name from profiles where id = auth.uid() $$;

alter table public.tasks enable row level security;
-- Who SEES a task:
--   private  → creator + assignee only
--   vertical → that vertical's team (incl. cross-vertical shares) + creator/assignee
--   team     → everyone
--   ceo      → creator/assignee + Master/CEO (escalation)
-- Even Master/CEO don't see other teams' private/vertical tasks — they see
-- their own, whole-team ones, and what's escalated to the CEO Office.
create policy "tasks read" on tasks for select to authenticated using (
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
create policy "tasks write" on tasks for all to authenticated
  using ( created_by = auth.uid()
          or (can_write(vertical)
              and (my_role() <> 'cluster_head' or coalesce(cluster,'') = my_cluster())) )
  with check ( created_by = auth.uid()
          or (can_write(vertical)
              and (my_role() <> 'cluster_head' or coalesce(cluster,'') = my_cluster())) );

-- ---------- EVENTS ----------
create table public.events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  vertical text not null default 'mkt',
  type text default 'Domestic',   -- Pre-BTS Cluster | Summit | International | Domestic | Other
  cluster text,                   -- for Pre-BTS cluster events
  date date, end_date date,
  time text default '',
  location text default '',
  status text default 'planned' check (status in ('planned','confirmed','done','cancelled')),
  fy text not null default '2026-27',
  notes text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.events enable row level security;
create policy "events read"  on events for select to authenticated using (true);
create policy "events write" on events for all to authenticated
  using ( can_write(vertical)
          or (my_role() = 'cluster_head' and coalesce(cluster,'') = my_cluster())
          or (my_vertical() = 'bb' and coalesce(cluster,'') in ('Mysuru','Mangaluru','Hubballi-Dharwad-Belagavi','Kalaburagi','Tumakuru','Shivamogga')) )
  with check ( can_write(vertical)
          or (my_role() = 'cluster_head' and coalesce(cluster,'') = my_cluster())
          or (my_vertical() = 'bb' and coalesce(cluster,'') in ('Mysuru','Mangaluru','Hubballi-Dharwad-Belagavi','Kalaburagi','Tumakuru','Shivamogga')) );

-- ---------- MEETINGS (internal/external; minutes; next steps → tasks) ----------
create table public.meetings (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  kind text default 'internal' check (kind in ('internal','external')),
  mode text default 'in_person' check (mode in ('in_person','online')),
  date date, time text default '',
  venue text default '',          -- in-person
  link text default '',           -- online
  verticals text[] not null default '{}',
  participants text[] not null default '{}',   -- team members
  externals text default '',                    -- external participants (one per line: Name — Designation)
  chaired_by text default '',
  minutes text default '',
  created_by uuid default auth.uid(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.meetings enable row level security;
create policy "meetings read"  on meetings for select to authenticated using (true);
create policy "meetings write" on meetings for all to authenticated
  using (true) with check (true);   -- trusted 20-person team

-- ---------- PERSONAL SPACE (reminders — private to each member) ----------
create table public.personal_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  title text not null,
  date date, time text default '',
  notes text default '',
  done boolean default false,
  created_at timestamptz default now()
);
alter table public.personal_items enable row level security;
create policy "personal own" on personal_items for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------- STORAGE (proposal/record/event documents + personal files) ----------
insert into storage.buckets (id, name, public) values ('docs', 'docs', false)
  on conflict (id) do nothing;
create policy "docs read"   on storage.objects for select to authenticated using (bucket_id = 'docs');
create policy "docs insert" on storage.objects for insert to authenticated with check (bucket_id = 'docs');
create policy "docs delete" on storage.objects for delete to authenticated using (bucket_id = 'docs');
insert into storage.buckets (id, name, public) values ('personal', 'personal', false)
  on conflict (id) do nothing;
create policy "personal rw" on storage.objects for all to authenticated
  using (bucket_id = 'personal' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'personal' and (storage.foldername(name))[1] = auth.uid()::text);

-- updated_at maintenance
create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$ begin new.updated_at = now(); return new; end $$;
create trigger records_touch  before update on records  for each row execute function touch_updated_at();
create trigger tasks_touch    before update on tasks    for each row execute function touch_updated_at();
create trigger events_touch   before update on events   for each row execute function touch_updated_at();
create trigger meetings_touch before update on meetings for each row execute function touch_updated_at();

alter publication supabase_realtime add table records, tasks, events, meetings;

-- ============================================================
-- SEED — events. (Every number on the dashboard is computed live from
-- the trackers; there is no KPI table to maintain.)
-- ============================================================
-- Events: 4 globals + 4 Pre-BTS cluster events (mapped to BB too)
insert into events (name, vertical, type, cluster, date, location, status, fy) values
('World FinTech Summit', 'mkt', 'International', null, '2026-05-20', 'Bengaluru', 'done', '2026-27'),
('Global Fintech Festival', 'mkt', 'Domestic', null, '2026-09-15', 'Mumbai', 'planned', '2026-27'),
('Bengaluru Skill Summit', 'mkt', 'Summit', null, '2026-11-04', 'Bengaluru', 'planned', '2026-27'),
('Bengaluru Tech Summit (BTS)', 'mkt', 'Summit', null, '2026-11-18', 'BIEC, Bengaluru', 'planned', '2026-27'),
('Pre-BTS — Mysuru', 'mkt', 'Pre-BTS Cluster', 'Mysuru', '2026-09-10', 'Mysuru', 'planned', '2026-27'),
('Pre-BTS — Mangaluru', 'mkt', 'Pre-BTS Cluster', 'Mangaluru', '2026-09-24', 'Mangaluru', 'planned', '2026-27'),
('Pre-BTS — Hubballi-Dharwad-Belagavi', 'mkt', 'Pre-BTS Cluster', 'Hubballi-Dharwad-Belagavi', '2026-10-08', 'Hubballi', 'planned', '2026-27'),
('Pre-BTS — Kalaburagi', 'mkt', 'Pre-BTS Cluster', 'Kalaburagi', '2026-10-22', 'Kalaburagi', 'planned', '2026-27');

-- Trackers, pipelines, DC list, proposals & the Database are pre-filled
-- from your Excel tracker and the ESDM fact sheet:
--   run supabase/seed_data.sql after this file.

-- ============================================================
-- AFTER RUNNING:
-- 1) Authentication → Users → invite YOURSELF first, then promote:
--    update profiles set role='master', name='Your Name' where email='you@kdem.in';
-- 2) Deploy the create-user function so Master can add members in-app:
--    supabase functions deploy create-user
--    (see supabase/functions/create-user/index.ts and README)
-- 3) Run supabase/seed_data.sql to pre-fill pipelines, DCs, proposals & the Database.
-- 4) Everything else — team & theme — is managed from the Admin page.
-- ============================================================
