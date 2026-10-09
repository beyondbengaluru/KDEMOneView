-- ============================================================
-- MIGRATE v6 — run on an EXISTING database (no reset). Safe to re-run.
--
-- • One list of Beyond Bengaluru clusters for row-level security,
--   via bb_clusters(), now including Davanagere and 'Cluster TBD'
--   (BB leads whose cluster isn't decided yet).
-- • Re-creates can_write_row() and the events write policy to use it.
--
-- Run this BEFORE supabase/seed_data.sql. Fresh installs don't need it —
-- schema.sql already has it.
-- ============================================================

create or replace function public.bb_clusters() returns text[]
language sql immutable as $$
  select array['Mysuru','Mangaluru','Hubballi-Dharwad-Belagavi','Kalaburagi',
               'Tumakuru','Davanagere','Cluster TBD']
$$;

create or replace function public.can_write_row(v text, d jsonb) returns boolean
language sql stable security definer set search_path = public
as $$
  select my_role() in ('master','ceo')
      or (my_role() in ('lead','member') and my_vertical() = v)
      or (my_role() in ('lead','member') and my_vertical() = 'bb'
          and coalesce(d->>'cluster','') = any(bb_clusters()))
      or (my_role() = 'cluster_head' and coalesce(d->>'cluster','') = my_cluster())
      or (v = 'db' and my_role() is not null)   -- the Database is maintained by everyone
$$;

drop policy if exists "events write" on public.events;
create policy "events write" on public.events for all to authenticated
  using ( can_write(vertical)
          or (my_role() = 'cluster_head' and coalesce(cluster,'') = my_cluster())
          or (my_vertical() = 'bb' and coalesce(cluster,'') = any(bb_clusters())) )
  with check ( can_write(vertical)
          or (my_role() = 'cluster_head' and coalesce(cluster,'') = my_cluster())
          or (my_vertical() = 'bb' and coalesce(cluster,'') = any(bb_clusters())) );
