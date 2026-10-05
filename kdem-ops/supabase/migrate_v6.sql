-- ============================================================
-- MIGRATE v6 — run this on an EXISTING database (no reset).
-- Adds Davanagere to the Beyond Bengaluru cluster lists used by
-- row-level security, so BB leads/members can write Davanagere rows.
--
-- The H1 FY 2026-27 report tracks Davanagere as a BB location
-- (1 policy awareness session, GM University startup policy session,
-- Women Entrepreneurs Bootcamp). Like Tumakuru and Shivamogga it has
-- no cluster head yet, so it is NOT added to the cluster-head list.
--
-- Run this BEFORE supabase/seed_h1_fy2026-27.sql.
-- Fresh installs don't need it — schema.sql already has it.
-- ============================================================

create or replace function public.can_write_row(v text, d jsonb) returns boolean
language sql stable security definer set search_path = public
as $$
  select my_role() in ('master','ceo')
      or (my_role() in ('lead','member') and my_vertical() = v)
      or (my_role() in ('lead','member') and my_vertical() = 'bb'
          and coalesce(d->>'cluster','') in ('Mysuru','Mangaluru','Hubballi-Dharwad-Belagavi','Kalaburagi','Tumakuru','Shivamogga','Davanagere'))
      or (my_role() = 'cluster_head' and coalesce(d->>'cluster','') = my_cluster())
      or (v = 'db' and my_role() is not null)   -- the Database is maintained by everyone
$$;

drop policy if exists "events write" on public.events;
create policy "events write" on public.events for all to authenticated
  using ( can_write(vertical)
          or (my_role() = 'cluster_head' and coalesce(cluster,'') = my_cluster())
          or (my_vertical() = 'bb' and coalesce(cluster,'') in ('Mysuru','Mangaluru','Hubballi-Dharwad-Belagavi','Kalaburagi','Tumakuru','Shivamogga','Davanagere')) )
  with check ( can_write(vertical)
          or (my_role() = 'cluster_head' and coalesce(cluster,'') = my_cluster())
          or (my_vertical() = 'bb' and coalesce(cluster,'') in ('Mysuru','Mangaluru','Hubballi-Dharwad-Belagavi','Kalaburagi','Tumakuru','Shivamogga','Davanagere')) );
