-- ============================================================
-- MIGRATE v11 — run on an EXISTING database. Safe to re-run.
-- Beyond Bengaluru pipelines are need-to-know.
--
--  * A pipeline row = a company or data-centre lead (tabs gccs /
--    datacentres) in a BB cluster (or BB-tracked) that has not landed
--    (stage not Grounded / Operational / Closed).
--  * Cluster heads see only their own cluster's pipeline.
--  * Other BB team members see no pipeline rows unless they are given
--    "sees all pipelines" (profiles.pipeline_all, set on the Admin page).
--  * Master, the CEO Office, Varun and Chetan see every pipeline.
--  * Landed companies (new companies, expansions), other verticals' own
--    views (IT & GCC, etc.) and everything else are unchanged.
-- Enforced in the database, so the rows never reach the browser.
-- ============================================================
alter table public.profiles add column if not exists pipeline_all boolean not null default false;

update public.profiles set pipeline_all = true
  where lower(email) = 'varun.m@karnatakadigital.in'
     or id = (select id from public.profiles where name ilike 'chetan%' order by created_at limit 1);

create or replace function public.can_see_pipeline(v text, t text, d jsonb) returns boolean
language sql stable security definer set search_path = public
as $$
  select case
    -- not a BB pipeline row: no change
    when t not in ('gccs', 'datacentres')
      or coalesce(d->>'stage', '') in ('Grounded', 'Operational', 'Closed')
      or not (coalesce(d->>'cluster', '') = any(bb_clusters()) or d->>'bb' = 'true')
      then true
    -- people who see every pipeline
    when my_role() in ('master', 'ceo')
      or coalesce((select pipeline_all from profiles where id = auth.uid()), false)
      then true
    -- cluster heads: their own cluster only
    when my_role() = 'cluster_head'
      then coalesce(d->>'cluster', '') = coalesce(my_cluster(), '')
    -- the rest of the BB team: only with "sees all pipelines"
    when my_vertical() = 'bb'
      then false
    -- other verticals keep their own views (e.g. IT & GCC's GCC pipeline)
    else true
  end
$$;

drop policy if exists "records read" on public.records;
create policy "records read" on public.records for select to authenticated
  using ((not is_external() and can_see_pipeline(vertical, tab, data))
         or (vertical = 'mkt' and tab = my_vertical()));
