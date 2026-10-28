-- ============================================================
-- MIGRATE v8 — run on an EXISTING database. Safe to re-run.
-- "Assigned by the CEO Office" now means created by a CEO Office account
-- only. Tasks a Master creates for a vertical (e.g. the Beyond Bengaluru
-- cluster tasks) stay with that vertical and are not shown to the CEO Office.
-- ============================================================
create or replace function public.is_ceo_office(uid uuid) returns boolean
language sql stable security definer set search_path = public
as $$ select exists (select 1 from profiles where id = uid and role = 'ceo') $$;
