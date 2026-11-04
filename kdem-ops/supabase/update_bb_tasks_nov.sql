-- ============================================================
-- Beyond Bengaluru tasks, grouped by category, plus the GTC links.
-- Run AFTER migrate_v10.sql. Safe to re-run: it replaces all BB tasks.
--
-- Categories (in this order): New companies & pipeline · GTC ·
-- Data centres · New initiatives · Strategic · General.
-- A task with a GTC site also shows under Strategic → GTC → that site.
-- Private items are shared only with Varun and Chetan.
--
-- Records: Tekmonks ("Telemonks") is a data-centre lead taking space at
-- GTC Mysuru (it shows in Data centres, Pipeline and GTC Mysuru — one row);
-- GlowTouch is a pipeline company for GTC Mysuru.
-- ============================================================
do $$
declare
  me uuid := (select id from profiles where lower(email) = 'varun.m@karnatakadigital.in');
  chetan uuid := (select id from profiles where name ilike 'chetan%' order by created_at limit 1);
  p uuid;
begin
  -- ---------- records ----------
  -- Tekmonks ("Telemonks" in the notes) is a data-centre company for GTC
  -- Mysuru. Its pipeline row moves into Data centres, keeping everything
  -- already entered; Pipeline and GTC Mysuru still list it (gtc = Mysuru).
  delete from records where tab = 'datacentres' and lower(data->>'name') = 'telemonks'
    and exists (select 1 from records where lower(data->>'name') = 'tekmonks');
  update records set tab = 'datacentres', data = data || '{"gtc": "Mysuru", "stage": "Pipeline", "project_type": "Data centre at GTC Mysuru", "power": "Reliable supply — current line has 5–6 hour outages", "next_step": "Additional underground HT line from the source 3.6 km away (~₹1.3 Cr): letter to KPTCL"}'
    where vertical = 'itgcc' and tab = 'gccs' and fy = '2026-27' and lower(data->>'name') in ('tekmonks', 'telemonks');
  if exists (select 1 from records where tab = 'datacentres' and fy = '2026-27' and lower(data->>'name') in ('tekmonks', 'telemonks')) then
    update records set data = data || '{"gtc": "Mysuru", "cluster": "Mysuru"}'
      where tab = 'datacentres' and fy = '2026-27' and lower(data->>'name') in ('tekmonks', 'telemonks');
  else
    insert into records (vertical, tab, fy, data) values ('itgcc', 'datacentres', '2026-27',
      '{"name": "Tekmonks", "project_type": "Data centre at GTC Mysuru", "sector": "Data centre", "cluster": "Mysuru", "gtc": "Mysuru", "stage": "Pipeline", "power": "Reliable supply — current line has 5–6 hour outages", "next_step": "Additional underground HT line from the source 3.6 km away (~₹1.3 Cr): letter to KPTCL"}');
  end if;
  if exists (select 1 from records where tab = 'gccs' and fy = '2026-27' and lower(replace(data->>'name', ' ', '')) like 'glowtouch%') then
    update records set data = data || '{"gtc": "Mysuru"}'
      where tab = 'gccs' and fy = '2026-27' and lower(replace(data->>'name', ' ', '')) like 'glowtouch%';
  else
    insert into records (vertical, tab, fy, data) values ('itgcc', 'gccs', '2026-27',
      '{"name": "GlowTouch", "type": "IT/ITeS", "kind": "New", "stage": "Engaged", "cluster": "Mysuru", "gtc": "Mysuru", "sector": "IT/ITeS", "notes": "18,000 sq ft at GTC Mysuru"}');
  end if;

  -- ---------- tasks ----------
  delete from tasks where vertical = 'bb';


  -- New companies & pipeline
  insert into tasks (title, vertical, cluster, topic, gtc, status, priority, due_date, visibility, notes, sort_order, strategic, shared_with, created_by)
  values ('New company by ex-Infosys founders', 'bb', 'Mangaluru', 'New companies & pipeline', null, 'todo', 'medium', null, 'vertical', 'New company started by former Infosys entrepreneurs.', 1, false, '{}', me) returning id into p;
  insert into tasks (title, vertical, cluster, topic, gtc, status, priority, due_date, visibility, notes, sort_order, strategic, shared_with, created_by, parent_id, assignee) values
    ('Meet the founders', 'bb', 'Mangaluru', 'New companies & pipeline', null, 'todo', 'medium', null, 'vertical', '', 1, false, '{}', me, p, ''),
    ('Issue a PR', 'bb', 'Mangaluru', 'New companies & pipeline', null, 'todo', 'medium', null, 'vertical', '', 2, false, '{}', me, p, ''),
    ('Mail the Secretary about the new company', 'bb', 'Mangaluru', 'New companies & pipeline', null, 'todo', 'medium', null, 'vertical', '', 3, false, '{}', me, p, '');

  -- New companies & pipeline
  insert into tasks (title, vertical, cluster, topic, gtc, status, priority, due_date, visibility, notes, sort_order, strategic, shared_with, created_by)
  values ('New company from Mandya — inauguration', 'bb', 'Mysuru', 'New companies & pipeline', null, 'todo', 'medium', null, 'vertical', '', 2, false, '{}', me) returning id into p;
  insert into tasks (title, vertical, cluster, topic, gtc, status, priority, due_date, visibility, notes, sort_order, strategic, shared_with, created_by, parent_id, assignee) values
    ('Send a formal invite to the Chairman and Secretary for the inauguration', 'bb', 'Mysuru', 'New companies & pipeline', null, 'todo', 'medium', null, 'vertical', '', 1, false, '{}', me, p, ''),
    ('PR for the inauguration', 'bb', 'Mysuru', 'New companies & pipeline', null, 'todo', 'medium', null, 'vertical', '', 2, false, '{}', me, p, '');

  -- New companies & pipeline
  insert into tasks (title, vertical, cluster, topic, gtc, status, priority, due_date, visibility, notes, sort_order, strategic, shared_with, created_by)
  values ('Pune meeting — 3 pipeline companies', 'bb', 'Mysuru', 'New companies & pipeline', null, 'todo', 'medium', null, 'vertical', '', 3, false, '{}', me) returning id into p;
  insert into tasks (title, vertical, cluster, topic, gtc, status, priority, due_date, visibility, notes, sort_order, strategic, shared_with, created_by, parent_id, assignee) values
    ('Set up a meeting in Pune with the leadership of the 3 pipeline companies', 'bb', 'Mysuru', 'New companies & pipeline', null, 'todo', 'medium', null, 'vertical', '', 1, false, '{}', me, p, '');

  -- New companies & pipeline
  insert into tasks (title, vertical, cluster, topic, gtc, status, priority, due_date, visibility, notes, sort_order, strategic, shared_with, created_by)
  values ('GlowTouch — 18,000 sq ft at GTC', 'bb', 'Mysuru', 'New companies & pipeline', 'Mysuru', 'inprogress', 'medium', null, 'vertical', 'GlowTouch is in the pipeline for 18,000 sq ft at the GTC.', 4, false, '{}', me) returning id into p;
  insert into tasks (title, vertical, cluster, topic, gtc, status, priority, due_date, visibility, notes, sort_order, strategic, shared_with, created_by, parent_id, assignee) values
    ('Await invite update for the welcome address at the leadership meet, Mangaluru', 'bb', 'Mysuru', 'New companies & pipeline', 'Mysuru', 'todo', 'medium', '2026-11-10', 'vertical', 'Leadership meet on 10 November.', 1, false, '{}', me, p, ''),
    ('Await the team''s confirmation of onboarding as a GTC tenant', 'bb', 'Mysuru', 'New companies & pipeline', 'Mysuru', 'todo', 'medium', null, 'vertical', '', 2, false, '{}', me, p, '');

  -- GTC
  insert into tasks (title, vertical, cluster, topic, gtc, status, priority, due_date, visibility, notes, sort_order, strategic, shared_with, created_by)
  values ('Electricity — additional HT line', 'bb', 'Mysuru', 'GTC', 'Mysuru', 'inprogress', 'medium', null, 'vertical', 'The GTC supply has 5–6 hour outages, which does not meet the standards of the global companies in the pipeline (Tekmonks, GlowTouch). A new underground HT line from an identified source 3.6 km away is needed, costing about ₹1.3 Cr.', 1, false, '{}', me) returning id into p;
  insert into tasks (title, vertical, cluster, topic, gtc, status, priority, due_date, visibility, notes, sort_order, strategic, shared_with, created_by, parent_id, assignee) values
    ('Letter to KPTCL for an additional HT line', 'bb', 'Mysuru', 'GTC', 'Mysuru', 'todo', 'medium', null, 'vertical', 'Request an additional line from the identified source 3.6 km away; the current line has 5–6 hour outages.', 1, false, '{}', me, p, '');

  -- GTC
  insert into tasks (title, vertical, cluster, topic, gtc, status, priority, due_date, visibility, notes, sort_order, strategic, shared_with, created_by)
  values ('JSS (JCE TBI CoE) — GTC meeting', 'bb', 'Mysuru', 'GTC', 'Mysuru', 'todo', 'medium', null, 'vertical', 'Potential lead for the GTC and the new land parcel.', 2, false, '{}', me) returning id into p;
  insert into tasks (title, vertical, cluster, topic, gtc, status, priority, due_date, visibility, notes, sort_order, strategic, shared_with, created_by, parent_id, assignee) values
    ('Set up a meeting with JSS to show the GTC and the new land parcel in the GTC premises', 'bb', 'Mysuru', 'GTC', 'Mysuru', 'todo', 'medium', null, 'vertical', '', 1, false, '{}', me, p, '');

  -- GTC
  insert into tasks (title, vertical, cluster, topic, gtc, status, priority, due_date, visibility, notes, sort_order, strategic, shared_with, created_by)
  values ('LEAP Lab and GTC', 'bb', 'Kalaburagi', 'GTC', 'Kalaburagi', 'inprogress', 'medium', null, 'vertical', 'The GTC and LEAP Lab proposals can be combined into one, on the allotted 2 acres.', 3, false, '{}', me) returning id into p;
  insert into tasks (title, vertical, cluster, topic, gtc, status, priority, due_date, visibility, notes, sort_order, strategic, shared_with, created_by, parent_id, assignee) values
    ('Share the LEAP Lab proposal — equipment and objectives', 'bb', 'Kalaburagi', 'GTC', 'Kalaburagi', 'todo', 'medium', '2026-11-06', 'vertical', '', 1, false, '{}', me, p, ''),
    ('Formalise the DPR once agreed, with Narendra (design consultant)', 'bb', 'Kalaburagi', 'GTC', 'Kalaburagi', 'todo', 'medium', null, 'vertical', '', 2, false, '{}', me, p, ''),
    ('Proposal for GTC + LEAP Lab on the allotted 2 acres', 'bb', 'Kalaburagi', 'GTC', 'Kalaburagi', 'todo', 'medium', null, 'vertical', 'Can be combined with the LEAP Lab proposal.', 3, false, '{}', me, p, ''),
    ('Finalise the tender', 'bb', 'Kalaburagi', 'GTC', 'Kalaburagi', 'todo', 'medium', '2026-12-31', 'vertical', 'By December.', 4, false, '{}', me, p, '');

  -- Data centres
  insert into tasks (title, vertical, cluster, topic, gtc, status, priority, due_date, visibility, notes, sort_order, strategic, shared_with, created_by)
  values ('BTS Data Centre Roundtable — DC lead sharing with the Department', 'bb', 'Mangaluru', 'Data centres', null, 'inprogress', 'medium', null, 'vertical', 'We agreed with the Department to work together on data centre promotion and investment and to share leads both ways. We shared our DC leads; the consulting team used them, without keeping us in the loop, to invite companies to the BTS Data Centre Roundtable, and has not shared its data with us.', 1, false, '{}', me) returning id into p;
  insert into tasks (title, vertical, cluster, topic, gtc, status, priority, due_date, visibility, notes, sort_order, strategic, shared_with, created_by, parent_id, assignee) values
    ('Draft mail to MD, KITS and Director, IT BT', 'bb', 'Mangaluru', 'Data centres', null, 'todo', 'medium', null, 'vertical', 'Raise it constructively: agree a joint lead register and keep KDEM in the loop on DC invitations.', 1, false, '{}', me, p, '');

  -- Data centres
  insert into tasks (title, vertical, cluster, topic, gtc, status, priority, due_date, visibility, notes, sort_order, strategic, shared_with, created_by)
  values ('Data Centre CoE with NITK', 'bb', 'Mangaluru', 'Data centres', null, 'inprogress', 'medium', null, 'vertical', 'NITK Surathkal is preparing the PPT and proposal for the Data Centre Centre of Excellence.', 2, false, '{}', me) returning id into p;
  insert into tasks (title, vertical, cluster, topic, gtc, status, priority, due_date, visibility, notes, sort_order, strategic, shared_with, created_by, parent_id, assignee) values
    ('NITK to share the PPT and proposal with KDEM', 'bb', 'Mangaluru', 'Data centres', null, 'todo', 'medium', null, 'vertical', '', 1, false, '{}', me, p, ''),
    ('Share the CoE proposal formally with the Department', 'bb', 'Mangaluru', 'Data centres', null, 'todo', 'medium', null, 'vertical', 'After KDEM review.', 2, false, '{}', me, p, '');

  -- New initiatives
  insert into tasks (title, vertical, cluster, topic, gtc, status, priority, due_date, visibility, notes, sort_order, strategic, shared_with, created_by)
  values ('University of Mysuru — entrepreneurship space', 'bb', 'Mysuru', 'New initiatives', null, 'todo', 'medium', null, 'vertical', 'Available: 50 seats, 8–9 working rooms, a 100-seat auditorium, 2 acres of outdoor land and 4,000 sq ft bare shell. Discuss how KDEM can use it to promote entrepreneurship among students of the University of Mysuru and beyond.', 1, false, '{}', me) returning id into p;
  insert into tasks (title, vertical, cluster, topic, gtc, status, priority, due_date, visibility, notes, sort_order, strategic, shared_with, created_by, parent_id, assignee) values
    ('Get time from the Vice-Chancellor', 'bb', 'Mysuru', 'New initiatives', null, 'todo', 'medium', null, 'vertical', '', 1, false, '{}', me, p, 'KK, Chetan, Sudheer'),
    ('Meet the VC with Sudhanva Dhananjaya', 'bb', 'Mysuru', 'New initiatives', null, 'todo', 'medium', null, 'vertical', '', 2, false, '{}', me, p, 'KK, Chetan, Sudheer');

  -- New initiatives
  insert into tasks (title, vertical, cluster, topic, gtc, status, priority, due_date, visibility, notes, sort_order, strategic, shared_with, created_by)
  values ('CoE Agritech', 'bb', 'Kalaburagi', 'New initiatives', null, 'inprogress', 'medium', null, 'vertical', '₹10 Cr committed by the DC, Kalaburagi; more to be secured from the IT BT Department. 3 acres allotted for the Bioinnovation centre.', 2, false, '{}', me) returning id into p;
  insert into tasks (title, vertical, cluster, topic, gtc, status, priority, due_date, visibility, notes, sort_order, strategic, shared_with, created_by, parent_id, assignee) values
    ('Meet or call the JD Agritech about the NOC for the allotted 3-acre land', 'bb', 'Kalaburagi', 'New initiatives', null, 'todo', 'medium', '2026-11-04', 'vertical', 'For the Bioinnovation land.', 1, false, '{}', me, p, ''),
    ('Secure additional funds from the IT BT Department', 'bb', 'Kalaburagi', 'New initiatives', null, 'todo', 'medium', null, 'vertical', '₹10 Cr already committed by the DC.', 2, false, '{}', me, p, ''),
    ('Schedule a meeting with Adil, Bangalore Bioinnovation Centre, on the CoE', 'bb', 'Kalaburagi', 'New initiatives', null, 'todo', 'medium', null, 'vertical', '', 3, false, '{}', me, p, ''),
    ('Discuss the final CoE proposal with the CEO', 'bb', 'Kalaburagi', 'New initiatives', null, 'todo', 'medium', null, 'vertical', '', 4, false, '{}', me, p, '');

  -- Strategic
  insert into tasks (title, vertical, cluster, topic, gtc, status, priority, due_date, visibility, notes, sort_order, strategic, shared_with, created_by)
  values ('Vision Document 2030 — progress update', 'bb', 'Mangaluru', 'Strategic', null, 'todo', 'medium', null, 'vertical', 'Show progress achieved in 2026 and any support needed.', 1, false, '{}', me) returning id into p;
  insert into tasks (title, vertical, cluster, topic, gtc, status, priority, due_date, visibility, notes, sort_order, strategic, shared_with, created_by, parent_id, assignee) values
    ('Compile 2026 progress against Vision 2030', 'bb', 'Mangaluru', 'Strategic', null, 'todo', 'medium', null, 'vertical', '', 1, false, '{}', me, p, ''),
    ('Share with the Union Finance Minister via the MP of Mangaluru', 'bb', 'Mangaluru', 'Strategic', null, 'todo', 'medium', null, 'vertical', 'Include where help is needed.', 2, false, '{}', me, p, '');

  -- Strategic
  insert into tasks (title, vertical, cluster, topic, gtc, status, priority, due_date, visibility, notes, sort_order, strategic, shared_with, created_by)
  values ('Denmark / Japan roadshow', 'bb', 'Mangaluru', 'Strategic', null, 'todo', 'medium', null, 'vertical', 'To be planned with the Consul General / JETRO.', 2, false, '{}', me) returning id into p;
  insert into tasks (title, vertical, cluster, topic, gtc, status, priority, due_date, visibility, notes, sort_order, strategic, shared_with, created_by, parent_id, assignee) values
    ('Plan the roadshow with the Consul General / JETRO', 'bb', 'Mangaluru', 'Strategic', null, 'todo', 'medium', null, 'vertical', '', 1, false, '{}', me, p, ''),
    ('Share the roadshow proposal with the CEO Office', 'bb', 'Mangaluru', 'Strategic', null, 'todo', 'medium', '2026-11-09', 'vertical', 'Within 5 days.', 2, false, '{}', me, p, '');

  -- Strategic
  insert into tasks (title, vertical, cluster, topic, gtc, status, priority, due_date, visibility, notes, sort_order, strategic, shared_with, created_by)
  values ('CoE Dashboard handover', 'bb', null, 'Strategic', null, 'inprogress', 'medium', null, 'private', 'The dashboard was given to the Department; it is a private view built as a pilot.', 3, false, array_remove(array[chetan], null), me) returning id into p;
  insert into tasks (title, vertical, cluster, topic, gtc, status, priority, due_date, visibility, notes, sort_order, strategic, shared_with, created_by, parent_id, assignee) values
    ('Reply to the GM on the dashboard handover', 'bb', null, 'Strategic', null, 'todo', 'medium', null, 'private', 'Points: (1) upgrade the CoE section and ask each CoE to update its details; (2) it is currently a private pilot view; (3) we are handing it over — it needs to be hosted on a server and maintained by IT or the Department.', 1, false, array_remove(array[chetan], null), me, p, '');

  -- General
  insert into tasks (title, vertical, cluster, topic, gtc, status, priority, due_date, visibility, notes, sort_order, strategic, shared_with, created_by)
  values ('JSS facility inauguration', 'bb', 'Mysuru', 'General', null, 'todo', 'medium', null, 'vertical', '', 1, false, '{}', me) returning id into p;
  insert into tasks (title, vertical, cluster, topic, gtc, status, priority, due_date, visibility, notes, sort_order, strategic, shared_with, created_by, parent_id, assignee) values
    ('Seek time from the Minister''s office for the inauguration', 'bb', 'Mysuru', 'General', null, 'todo', 'medium', null, 'vertical', '', 1, false, '{}', me, p, '');

  -- General
  insert into tasks (title, vertical, cluster, topic, gtc, status, priority, due_date, visibility, notes, sort_order, strategic, shared_with, created_by)
  values ('ESDM land promotion — 100 acres', 'bb', 'Kalaburagi', 'General', null, 'inprogress', 'medium', null, 'vertical', '100 acres available at the new subsidised rate of ₹45 lakh per acre.', 2, false, '{}', me) returning id into p;
  insert into tasks (title, vertical, cluster, topic, gtc, status, priority, due_date, visibility, notes, sort_order, strategic, shared_with, created_by, parent_id, assignee) values
    ('Promote the 100-acre land to attract new leads to Kalaburagi', 'bb', 'Kalaburagi', 'General', null, 'todo', 'medium', null, 'vertical', '', 1, false, '{}', me, p, '');
end $$;
