-- ============================================================
-- Beyond Bengaluru — data centre table, jobs from companies, task notes.
-- Run once in the SQL Editor (safe to re-run). BB rows only.
-- ============================================================
begin;

-- The BB team can edit rows flagged bb = true (BB-tracked data centres in Bengaluru)
create or replace function public.can_write_row(v text, d jsonb) returns boolean
language sql stable security definer set search_path = public
as $$
  select my_role() in ('master','ceo')
      or (my_role() in ('lead','member') and my_vertical() = v)
      or (my_role() in ('lead','member') and my_vertical() = 'bb'
          and (coalesce(d->>'cluster','') = any(bb_clusters()) or d->>'bb' = 'true'))
      or (my_role() = 'cluster_head' and coalesce(d->>'cluster','') = my_cluster())
      or (v = 'db' and my_role() is not null)
$$;

-- Data centres: the six in the BB data-centre table. Rackbank and NAIDAC
-- want land in Bengaluru, so they carry bb = true to stay on the BB list.
delete from records where vertical = 'itgcc' and tab = 'datacentres' and fy = '2026-27'
  and (coalesce(data->>'cluster','') = any(bb_clusters()) or data->>'bb' = 'true'
       or lower(data->>'name') in ('loftuslane','henox','opencables','datasamudra','rackbank','naidac',
                                   'cycity international','airtel nxtra','ipc corp dc'));
insert into records (vertical, tab, fy, data) values
('itgcc','datacentres','2026-27','{"name": "LoftusLane", "contact_name": "Pushkar", "project_type": "Hyperscale AI Data Center (200 MW)", "capacity": "200 MW", "initial_phase": "100 MW", "investment": "USD 1.2 Billion", "land": "100 acres MLR + 50 acres BLR (North)", "power": "Dual 220 kVA feeds", "cls": "No", "next_step": "Confirm land parcel; initiate facilitation", "cluster": "Mangaluru", "stage": "Pipeline"}'),
('itgcc','datacentres','2026-27','{"name": "Henox", "contact_name": "Sakthi Vel", "project_type": "Cable Landing Station + AI Data Center + Edge Ecosystem", "capacity": "100+ MW", "initial_phase": "20 MW", "investment": "Not disclosed", "land": "~40,000 sq ft (CLS) + 20 acres MLR", "power": "Redundant supply to CLS site", "cls": "Yes — Open CLS at AI City Mangaluru", "next_step": "MoU signing to be formalised and schedule site visits", "cluster": "Mangaluru", "stage": "Pipeline"}'),
('itgcc','datacentres','2026-27','{"name": "OpenCables", "contact_name": "Sunil Tagare", "project_type": "Submarine Cable + Open CLS + AI Data Center + Satellite Park", "capacity": "100+ MW", "initial_phase": "2–20 MW", "investment": "Not disclosed", "land": "25 acres, MLR", "power": "220/440 kV", "cls": "Yes — India''s first Open CLS at Mangaluru", "next_step": "Support in land facilitation and policy incentives", "cluster": "Mangaluru", "stage": "Pipeline"}'),
('itgcc','datacentres','2026-27','{"name": "Datasamudra", "contact_name": "Balaji Rajagopal", "project_type": "AI Data Center", "capacity": "10 MW", "initial_phase": "10 MW", "investment": "Not disclosed", "land": "10 acres, MLR", "power": "18 MVA", "cls": "N/A", "next_step": "Schedule land visits for identified land in MLR", "cluster": "Mangaluru", "stage": "Pipeline"}'),
('itgcc','datacentres','2026-27','{"name": "Rackbank", "contact_name": "Narendra Sen", "project_type": "AI SEZ Data Center Park + AI infrastructure", "capacity": "200 MW", "initial_phase": "100 MW", "investment": "Not disclosed", "land": "25 acres, BLR", "power": "300–400 kV", "cls": "N/A", "next_step": "Incentives / land identification in BLR", "cluster": "Bengaluru", "stage": "Pipeline", "bb": true}'),
('itgcc','datacentres','2026-27','{"name": "NAIDAC", "contact_name": "Ankit Khurana", "project_type": "Hyperscale AI Data Centre + Multi-Tenant GPU Hub", "capacity": "200 MW", "initial_phase": "100 MW", "investment": "USD 1.2 Billion", "land": "120 acres, BLR", "power": "132 kV x 2", "cls": "N/A", "next_step": "Land identification to be done in BLR", "cluster": "Bengaluru", "stage": "Pipeline", "bb": true}'),
-- IPC Corp DC goes back to the IT & GCC list as reported in H1 (no BB cluster)
('itgcc','datacentres','2026-27','{"name":"IPC Corp DC","stage":"Pipeline","notes":"With a co-located capability centre"}');

-- Jobs now come from the jobs entered on each company; the separate list goes
delete from records where vertical = 'bb' and tab = 'jobs';

-- Task notes: keep just the topic (drop the "Q3–Q4 update · " prefix)
update tasks set notes = regexp_replace(notes, '^Q3–Q4 update · ', '')
 where vertical = 'bb' and notes like 'Q3–Q4 update · %';

commit;
