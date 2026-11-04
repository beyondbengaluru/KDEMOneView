-- ============================================================
-- Beyond Bengaluru tasks — replaced with the Tasks Updates document.
-- Run AFTER migrate_v10.sql. Re-running replaces them again.
-- Strategic items are shared only with Varun and Chetan.
-- ============================================================
do $$
declare
  me uuid := (select id from profiles where lower(email) = 'varun.m@karnatakadigital.in');
  chetan uuid := (select id from profiles where name ilike 'chetan%' order by created_at limit 1);
  p uuid;
begin
  delete from tasks where vertical = 'bb';

  insert into tasks (title, vertical, cluster, topic, status, priority, due_date, visibility, notes, sort_order, strategic, shared_with, created_by)
  values ('DC lead sharing with the Department', 'bb', 'Mangaluru', 'Data Centre', 'inprogress', 'medium', null, 'vertical', 'We agreed with the Department to work together on data centre promotion and investment and to share leads both ways. We shared our DC leads; the consulting team used them, without keeping us in the loop, to invite companies to the BTS Data Centre Roundtable, and has not shared its data with us.', 1, false, '{}', me) returning id into p;
  insert into tasks (title, vertical, cluster, topic, status, priority, due_date, visibility, notes, sort_order, strategic, shared_with, created_by, parent_id, assignee) values
    ('Draft mail to MD, KITS and Director, IT BT', 'bb', 'Mangaluru', 'Data Centre', 'todo', 'medium', null, 'vertical', 'Raise it constructively: agree a joint lead register and keep KDEM in the loop on DC invitations.', 1, false, '{}', me, p, '');
  insert into tasks (title, vertical, cluster, topic, status, priority, due_date, visibility, notes, sort_order, strategic, shared_with, created_by)
  values ('Data Centre CoE with NITK', 'bb', 'Mangaluru', 'Data Centre', 'inprogress', 'medium', null, 'vertical', 'NITK Surathkal is preparing the PPT and proposal for the Data Centre Centre of Excellence.', 2, false, '{}', me) returning id into p;
  insert into tasks (title, vertical, cluster, topic, status, priority, due_date, visibility, notes, sort_order, strategic, shared_with, created_by, parent_id, assignee) values
    ('NITK to share the PPT and proposal with KDEM', 'bb', 'Mangaluru', 'Data Centre', 'todo', 'medium', null, 'vertical', '', 1, false, '{}', me, p, ''),
    ('Share the CoE proposal formally with the Department', 'bb', 'Mangaluru', 'Data Centre', 'todo', 'medium', null, 'vertical', 'After KDEM review.', 2, false, '{}', me, p, '');
  insert into tasks (title, vertical, cluster, topic, status, priority, due_date, visibility, notes, sort_order, strategic, shared_with, created_by)
  values ('Vision Document 2030 — progress update', 'bb', 'Mangaluru', 'Vision 2030', 'todo', 'medium', null, 'vertical', 'Show progress achieved in 2026 and any support needed.', 3, false, '{}', me) returning id into p;
  insert into tasks (title, vertical, cluster, topic, status, priority, due_date, visibility, notes, sort_order, strategic, shared_with, created_by, parent_id, assignee) values
    ('Compile 2026 progress against Vision 2030', 'bb', 'Mangaluru', 'Vision 2030', 'todo', 'medium', null, 'vertical', '', 1, false, '{}', me, p, ''),
    ('Share with the Union Finance Minister via the MP of Mangaluru', 'bb', 'Mangaluru', 'Vision 2030', 'todo', 'medium', null, 'vertical', 'Include where help is needed.', 2, false, '{}', me, p, '');
  insert into tasks (title, vertical, cluster, topic, status, priority, due_date, visibility, notes, sort_order, strategic, shared_with, created_by)
  values ('Denmark / Japan roadshow', 'bb', 'Mangaluru', 'Roadshows', 'todo', 'medium', null, 'vertical', 'To be planned with the Consul General / JETRO.', 4, false, '{}', me) returning id into p;
  insert into tasks (title, vertical, cluster, topic, status, priority, due_date, visibility, notes, sort_order, strategic, shared_with, created_by, parent_id, assignee) values
    ('Plan the roadshow with the Consul General / JETRO', 'bb', 'Mangaluru', 'Roadshows', 'todo', 'medium', null, 'vertical', '', 1, false, '{}', me, p, ''),
    ('Share the roadshow proposal with the CEO Office', 'bb', 'Mangaluru', 'Roadshows', 'todo', 'medium', '2026-11-09', 'vertical', 'Within 5 days.', 2, false, '{}', me, p, '');
  insert into tasks (title, vertical, cluster, topic, status, priority, due_date, visibility, notes, sort_order, strategic, shared_with, created_by)
  values ('New company by ex-Infosys founders', 'bb', 'Mangaluru', 'Company onboarding', 'todo', 'medium', null, 'vertical', 'New company started by former Infosys entrepreneurs.', 5, false, '{}', me) returning id into p;
  insert into tasks (title, vertical, cluster, topic, status, priority, due_date, visibility, notes, sort_order, strategic, shared_with, created_by, parent_id, assignee) values
    ('Meet the founders', 'bb', 'Mangaluru', 'Company onboarding', 'todo', 'medium', null, 'vertical', '', 1, false, '{}', me, p, ''),
    ('Issue a PR', 'bb', 'Mangaluru', 'Company onboarding', 'todo', 'medium', null, 'vertical', '', 2, false, '{}', me, p, ''),
    ('Mail the Secretary about the new company', 'bb', 'Mangaluru', 'Company onboarding', 'todo', 'medium', null, 'vertical', '', 3, false, '{}', me, p, '');
  insert into tasks (title, vertical, cluster, topic, status, priority, due_date, visibility, notes, sort_order, strategic, shared_with, created_by)
  values ('New company from Mandya — inauguration', 'bb', 'Mysuru', 'Company onboarding', 'todo', 'medium', null, 'vertical', '', 6, false, '{}', me) returning id into p;
  insert into tasks (title, vertical, cluster, topic, status, priority, due_date, visibility, notes, sort_order, strategic, shared_with, created_by, parent_id, assignee) values
    ('Send a formal invite to the Chairman and Secretary for the inauguration', 'bb', 'Mysuru', 'Company onboarding', 'todo', 'medium', null, 'vertical', '', 1, false, '{}', me, p, ''),
    ('PR for the inauguration', 'bb', 'Mysuru', 'Company onboarding', 'todo', 'medium', null, 'vertical', '', 2, false, '{}', me, p, '');
  insert into tasks (title, vertical, cluster, topic, status, priority, due_date, visibility, notes, sort_order, strategic, shared_with, created_by)
  values ('GTC — Electricity (Telemonks)', 'bb', 'Mysuru', 'GTC', 'inprogress', 'medium', null, 'vertical', 'Pipeline company Telemonks wants to set up at the GTC. The current supply has 5–6 hour outages. A new underground HT line from an identified source 3.6 km away is needed, costing about ₹1.3 Cr.', 7, false, '{}', me) returning id into p;
  insert into tasks (title, vertical, cluster, topic, status, priority, due_date, visibility, notes, sort_order, strategic, shared_with, created_by, parent_id, assignee) values
    ('Letter to KPTCL for an additional HT line', 'bb', 'Mysuru', 'GTC', 'todo', 'medium', null, 'vertical', 'The current line has unreliable supply with 5–6 hour outages, which does not meet the standards of global companies in the pipeline; request an additional line from the identified source 3.6 km away.', 1, false, '{}', me, p, '');
  insert into tasks (title, vertical, cluster, topic, status, priority, due_date, visibility, notes, sort_order, strategic, shared_with, created_by)
  values ('Pune meeting — 3 pipeline companies', 'bb', 'Mysuru', 'Company onboarding', 'todo', 'medium', null, 'vertical', '', 8, false, '{}', me) returning id into p;
  insert into tasks (title, vertical, cluster, topic, status, priority, due_date, visibility, notes, sort_order, strategic, shared_with, created_by, parent_id, assignee) values
    ('Set up a meeting in Pune with the leadership of the 3 pipeline companies', 'bb', 'Mysuru', 'Company onboarding', 'todo', 'medium', null, 'vertical', '', 1, false, '{}', me, p, '');
  insert into tasks (title, vertical, cluster, topic, status, priority, due_date, visibility, notes, sort_order, strategic, shared_with, created_by)
  values ('GlowTouch — 18,000 sq ft at GTC', 'bb', 'Mysuru', 'GTC', 'inprogress', 'medium', null, 'vertical', 'GlowTouch is in the pipeline for 18,000 sq ft at the GTC.', 9, false, '{}', me) returning id into p;
  insert into tasks (title, vertical, cluster, topic, status, priority, due_date, visibility, notes, sort_order, strategic, shared_with, created_by, parent_id, assignee) values
    ('Await invite update for the welcome address at the leadership meet, Mangaluru', 'bb', 'Mysuru', 'GTC', 'todo', 'medium', '2026-11-10', 'vertical', 'Leadership meet on 10 November.', 1, false, '{}', me, p, ''),
    ('Await the team''s confirmation of onboarding as a GTC tenant', 'bb', 'Mysuru', 'GTC', 'todo', 'medium', null, 'vertical', '', 2, false, '{}', me, p, '');
  insert into tasks (title, vertical, cluster, topic, status, priority, due_date, visibility, notes, sort_order, strategic, shared_with, created_by)
  values ('JCE TBI CoE — GTC visit', 'bb', 'Mysuru', 'GTC', 'todo', 'medium', null, 'vertical', 'Potential lead for the GTC and the new land parcel.', 10, false, '{}', me) returning id into p;
  insert into tasks (title, vertical, cluster, topic, status, priority, due_date, visibility, notes, sort_order, strategic, shared_with, created_by, parent_id, assignee) values
    ('Show the JCE TBI CoE team the GTC and the new land parcel in the GTC premises', 'bb', 'Mysuru', 'GTC', 'todo', 'medium', null, 'vertical', '', 1, false, '{}', me, p, '');
  insert into tasks (title, vertical, cluster, topic, status, priority, due_date, visibility, notes, sort_order, strategic, shared_with, created_by)
  values ('University of Mysuru — entrepreneurship space', 'bb', 'Mysuru', 'Startups', 'todo', 'medium', null, 'vertical', 'Available: 50 seats, 8–9 working rooms, a 100-seat auditorium, 2 acres of outdoor land and 4,000 sq ft bare shell. Discuss how KDEM can use it to promote entrepreneurship among students of the University of Mysuru and beyond.', 11, false, '{}', me) returning id into p;
  insert into tasks (title, vertical, cluster, topic, status, priority, due_date, visibility, notes, sort_order, strategic, shared_with, created_by, parent_id, assignee) values
    ('Get time from the Vice-Chancellor', 'bb', 'Mysuru', 'Startups', 'todo', 'medium', null, 'vertical', '', 1, false, '{}', me, p, 'KK, Chetan, Sudheer'),
    ('Meet the VC with Sudhanva Dhananjaya', 'bb', 'Mysuru', 'Startups', 'todo', 'medium', null, 'vertical', '', 2, false, '{}', me, p, 'KK, Chetan, Sudheer');
  insert into tasks (title, vertical, cluster, topic, status, priority, due_date, visibility, notes, sort_order, strategic, shared_with, created_by)
  values ('JSS facility inauguration', 'bb', 'Mysuru', 'Inaugurations', 'todo', 'medium', null, 'vertical', '', 12, false, '{}', me) returning id into p;
  insert into tasks (title, vertical, cluster, topic, status, priority, due_date, visibility, notes, sort_order, strategic, shared_with, created_by, parent_id, assignee) values
    ('Seek time from the Minister''s office for the inauguration', 'bb', 'Mysuru', 'Inaugurations', 'todo', 'medium', null, 'vertical', '', 1, false, '{}', me, p, '');
  insert into tasks (title, vertical, cluster, topic, status, priority, due_date, visibility, notes, sort_order, strategic, shared_with, created_by)
  values ('LEAP Lab and GTC', 'bb', 'Kalaburagi', 'LEAP Lab', 'inprogress', 'medium', null, 'vertical', 'The GTC and LEAP Lab proposals can be combined into one, on the allotted 2 acres.', 13, false, '{}', me) returning id into p;
  insert into tasks (title, vertical, cluster, topic, status, priority, due_date, visibility, notes, sort_order, strategic, shared_with, created_by, parent_id, assignee) values
    ('Share the LEAP Lab proposal — equipment and objectives', 'bb', 'Kalaburagi', 'LEAP Lab', 'todo', 'medium', '2026-11-06', 'vertical', '', 1, false, '{}', me, p, ''),
    ('Formalise the DPR once agreed, with Narendra (design consultant)', 'bb', 'Kalaburagi', 'LEAP Lab', 'todo', 'medium', null, 'vertical', '', 2, false, '{}', me, p, ''),
    ('Proposal for GTC + LEAP Lab on the allotted 2 acres', 'bb', 'Kalaburagi', 'LEAP Lab', 'todo', 'medium', null, 'vertical', 'Can be combined with the LEAP Lab proposal.', 3, false, '{}', me, p, ''),
    ('Finalise the tender', 'bb', 'Kalaburagi', 'LEAP Lab', 'todo', 'medium', '2026-12-31', 'vertical', 'By December.', 4, false, '{}', me, p, '');
  insert into tasks (title, vertical, cluster, topic, status, priority, due_date, visibility, notes, sort_order, strategic, shared_with, created_by)
  values ('CoE Agritech', 'bb', 'Kalaburagi', 'CoE', 'inprogress', 'medium', null, 'vertical', '₹10 Cr committed by the DC, Kalaburagi; more to be secured from the IT BT Department. 3 acres allotted for the Bioinnovation centre.', 14, false, '{}', me) returning id into p;
  insert into tasks (title, vertical, cluster, topic, status, priority, due_date, visibility, notes, sort_order, strategic, shared_with, created_by, parent_id, assignee) values
    ('Meet or call the JD Agritech about the NOC for the allotted 3-acre land', 'bb', 'Kalaburagi', 'CoE', 'todo', 'medium', '2026-11-04', 'vertical', 'For the Bioinnovation land.', 1, false, '{}', me, p, ''),
    ('Secure additional funds from the IT BT Department', 'bb', 'Kalaburagi', 'CoE', 'todo', 'medium', null, 'vertical', '₹10 Cr already committed by the DC.', 2, false, '{}', me, p, ''),
    ('Schedule a meeting with Adil, Bangalore Bioinnovation Centre, on the CoE', 'bb', 'Kalaburagi', 'CoE', 'todo', 'medium', null, 'vertical', '', 3, false, '{}', me, p, ''),
    ('Discuss the final CoE proposal with the CEO', 'bb', 'Kalaburagi', 'CoE', 'todo', 'medium', null, 'vertical', '', 4, false, '{}', me, p, '');
  insert into tasks (title, vertical, cluster, topic, status, priority, due_date, visibility, notes, sort_order, strategic, shared_with, created_by)
  values ('ESDM land promotion — 100 acres', 'bb', 'Kalaburagi', 'ESDM', 'inprogress', 'medium', null, 'vertical', '100 acres available at the new subsidised rate of ₹45 lakh per acre.', 15, false, '{}', me) returning id into p;
  insert into tasks (title, vertical, cluster, topic, status, priority, due_date, visibility, notes, sort_order, strategic, shared_with, created_by, parent_id, assignee) values
    ('Promote the 100-acre land to attract new leads to Kalaburagi', 'bb', 'Kalaburagi', 'ESDM', 'todo', 'medium', null, 'vertical', '', 1, false, '{}', me, p, '');
  insert into tasks (title, vertical, cluster, topic, status, priority, due_date, visibility, notes, sort_order, strategic, shared_with, created_by)
  values ('CoE Dashboard handover', 'bb', null, 'CoE', 'inprogress', 'medium', null, 'private', 'The dashboard was given to the Department; it is a private view built as a pilot.', 16, true, array_remove(array[chetan], null), me) returning id into p;
  insert into tasks (title, vertical, cluster, topic, status, priority, due_date, visibility, notes, sort_order, strategic, shared_with, created_by, parent_id, assignee) values
    ('Reply to the GM on the dashboard handover', 'bb', null, 'CoE', 'todo', 'medium', null, 'private', 'Points: (1) upgrade the CoE section and ask each CoE to update its details; (2) it is currently a private pilot view; (3) we are handing it over — it needs to be hosted on a server and maintained by IT or the Department.', 1, true, array_remove(array[chetan], null), me, p, '');
end $$;
