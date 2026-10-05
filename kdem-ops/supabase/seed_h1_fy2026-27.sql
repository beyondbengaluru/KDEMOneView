-- ============================================================
-- KDEM OneView — H1 FY 2026-27 refresh  (1 Apr 2026 – 30 Sep 2026)
-- Source: "H1 FY 2026-27 Progress Report", all six verticals.
-- Prepared: 5 October 2026.
--
-- HOW TO RUN
--   Paste the whole file into Supabase → SQL Editor → Run.
--   Safe to re-run: every row it writes carries  data->>'src' = 'H1-FY2627'
--   and the script deletes that tag before re-inserting. Rows you add or
--   edit in the app are never touched.
--
--   Run supabase/migrate_v6.sql FIRST (adds Davanagere to the BB cluster
--   lists used by row-level security) — otherwise the Davanagere rows below
--   are rejected for non-master users.
--
-- KNOWN GAP — Beyond Bengaluru jobs
--   The H1 report gives employment only as cluster totals (1,486 total:
--   HDB 125 · KBG 50 · MLR 211 · MYS 1,100+), not per company. Per-company
--   `jobs` is therefore left unset rather than invented, so the BB
--   "Jobs (landed)" counter will under-report until the numbers are filled
--   in. See the UPDATE template at the bottom of this file.
-- ============================================================

begin;

-- ---------- 0. Idempotent cleanup ----------
delete from records where data->>'src' = 'H1-FY2627';

-- Retire the Q1 placeholder rows that H1 now names properly
delete from records where fy = '2026-27' and data->>'name' like '%(rename)%';


-- ============================================================
-- IT SERVICES & GLOBAL CAPABILITY CENTRES  (itgcc)
-- ============================================================

-- 1. GCC attraction — 26 new onboarded (state-wide)
insert into records (vertical, tab, fy, data)
select 'itgcc', 'gccs', '2026-27',
       jsonb_build_object('name', n, 'type', 'GCC — New', 'cluster', 'Bengaluru',
                          'stage', 'Grounded', 'notes', 'H1 FY26-27 — new GCC onboarded',
                          'src', 'H1-FY2627')
from unnest(array[
  'The Standard','Arrive','Merck KGaA (MGCC)','Woodside','RAKSUL','ARKO Corp',
  'Abercrombie & Fitch','Under Armour','Warner Music Group','Officeworks','SITA',
  'Cyderes','DePuy Synthes','Festo','Zimmer Biomet','Codec','Axiado Corporation',
  'N-able','Ahead','Craft Henz','Mann+Hummel','Halo Kinetic','Natus Sensory',
  'Fictiv','Tazapay','DSP']) as n;

-- 14 GCCs expanded (state-wide)
insert into records (vertical, tab, fy, data)
select 'itgcc', 'gccs', '2026-27',
       jsonb_build_object('name', n, 'type', 'GCC — Expansion', 'cluster', 'Bengaluru',
                          'stage', 'Grounded', 'notes', 'H1 FY26-27 — GCC expansion',
                          'src', 'H1-FY2627')
from unnest(array[
  'Pegasystems','Toast Inc.','Catalyst Brands','eBay','Kraft Heinz','Target Corp.',
  'Best Buy','SolarEdge','SBM Offshore','SAP Labs','Sirva','Alcon',
  'Progress Software','LIDL']) as n;

-- 1 Nano GCC
insert into records (vertical, tab, fy, data) values
('itgcc','gccs','2026-27','{"name":"Teksalah LLC","type":"Nano GCC","cluster":"Mangaluru","stage":"Grounded","notes":"H1 FY26-27 — first Nano GCC in Mangaluru","src":"H1-FY2627"}');


-- 2. Emerging clusters — 21 new companies onboarded (BB 21/30)
--    HDB 7 · Kalaburagi 5 · Mangaluru 5 · Mysuru 4
insert into records (vertical, tab, fy, data)
select 'itgcc', 'gccs', '2026-27',
       jsonb_build_object('name', c.name, 'type', 'GCC — New', 'cluster', c.cluster,
                          'stage', 'Grounded',
                          'notes', 'H1 FY26-27 — Beyond Bengaluru onboarding (' || c.q || ')',
                          'src', 'H1-FY2627')
from (values
  ('3Gen Consulting',        'Mysuru',                     'Q1'),
  ('Mathera Technologies',   'Mysuru',                     'Q1'),
  ('Yugasys',                'Mysuru',                     'Q1'),
  ('Kodre Minds',            'Mysuru',                     'Q1'),
  ('Tsuyo',                  'Hubballi-Dharwad-Belagavi',  'Q1'),
  ('Crevavi Technologies',   'Hubballi-Dharwad-Belagavi',  'Q1'),
  ('KabadiMan',              'Hubballi-Dharwad-Belagavi',  'Q1'),
  ('Cipherion Pvt Ltd',      'Hubballi-Dharwad-Belagavi',  'Q1'),
  ('Lara Tech Consulting',   'Mangaluru',                  'Q1'),
  ('Zynthora AI',            'Mangaluru',                  'Q1'),
  ('MITCON',                 'Kalaburagi',                 'Q1'),
  ('Zemicon',                'Kalaburagi',                 'Q1'),
  ('Lion Circuits',          'Kalaburagi',                 'Q1'),
  ('Deskly by Aller',        'Kalaburagi',                 'Q1'),
  ('Hospigrow Academy',      'Hubballi-Dharwad-Belagavi',  'Q2'),
  ('Zentoja Technologies',   'Hubballi-Dharwad-Belagavi',  'Q2'),
  ('Trivadhi Labs',          'Hubballi-Dharwad-Belagavi',  'Q2'),
  ('Ziliqon',                'Mangaluru',                  'Q2'),
  ('Avishkar AI',            'Mangaluru',                  'Q2'),
  ('Volvitech',              'Mangaluru',                  'Q2'),
  ('Buy U Foods',            'Kalaburagi',                 'Q2')
) as c(name, cluster, q);

-- 19 companies expanded in the emerging clusters
insert into records (vertical, tab, fy, data)
select 'itgcc', 'gccs', '2026-27',
       jsonb_build_object('name', c.name, 'type', 'GCC — Expansion', 'cluster', c.cluster,
                          'stage', 'Grounded',
                          'notes', 'H1 FY26-27 — Beyond Bengaluru expansion (' || c.q || ')',
                          'src', 'H1-FY2627')
from (values
  ('IBM',                      'Mysuru',                    'Q1'),
  ('Kaynes Technology',        'Mysuru',                    'Q1'),
  ('Docket Run Tech',          'Hubballi-Dharwad-Belagavi', 'Q1'),
  ('Updapt',                   'Mangaluru',                 'Q1'),
  ('Incture',                  'Mangaluru',                 'Q1'),
  ('EchoPeak',                 'Mangaluru',                 'Q1'),
  ('DAZN',                     'Mangaluru',                 'Q1'),
  ('Everi',                    'Mangaluru',                 'Q1'),
  ('Pierian',                  'Mangaluru',                 'Q1'),
  ('Sophrosyne',               'Mangaluru',                 'Q1'),
  ('Terra Circuits',           'Kalaburagi',                'Q1'),
  ('Infosys',                  'Mangaluru',                 'Q2'),
  ('Manipal Dot Net Pvt. Ltd', 'Mangaluru',                 'Q2'),
  ('The Web People LLP',       'Mangaluru',                 'Q2'),
  ('Elogixa',                  'Mangaluru',                 'Q2'),
  ('G&S Consulting',           'Mangaluru',                 'Q2'),
  ('Rprocess',                 'Mysuru',                    'Q2'),
  ('Prudent',                  'Mysuru',                    'Q2'),
  ('Straviant',                'Mysuru',                    'Q2')
) as c(name, cluster, q);


-- 3. Beyond Bengaluru pipeline — 50 companies
insert into records (vertical, tab, fy, data)
select 'itgcc', 'gccs', '2026-27',
       jsonb_build_object('name', c.name, 'type', 'IT/ITeS',
                          'cluster', c.cluster, 'stage', 'Engaged',
                          'notes', 'H1 FY26-27 — BB pipeline (50 companies)'
                                   || case when c.loc <> '' then ' · ' || c.loc else '' end,
                          'src', 'H1-FY2627')
from (values
  ('Innovai Solutions',      'Hubballi-Dharwad-Belagavi', ''),
  ('Writer Group',           'Hubballi-Dharwad-Belagavi', ''),
  ('JSW Group',              'Hubballi-Dharwad-Belagavi', ''),
  ('Soul Sara',              'Hubballi-Dharwad-Belagavi', ''),
  ('iMerit',                 'Hubballi-Dharwad-Belagavi', ''),
  ('Semiksha Semiconductor', 'Hubballi-Dharwad-Belagavi', ''),
  ('Airtel Nextra',          'Hubballi-Dharwad-Belagavi', ''),
  ('MyBranch (Hospet)',      'Kalaburagi',                'Hospet'),
  ('Lion Circuits',          'Kalaburagi',                ''),
  ('Mysira Labs Pvt Ltd',    'Kalaburagi',                ''),
  ('Webveer Pvt Ltd',        'Kalaburagi',                ''),
  ('Bits & Bytes Pvt Ltd',   'Kalaburagi',                ''),
  ('Shiksha Gurukul Pvt Ltd','Kalaburagi',                ''),
  ('Hyperfin Pvt Ltd',       'Kalaburagi',                ''),
  ('RVR Innovation LLP',     'Kalaburagi',                ''),
  ('Gurukul Skills School',  'Kalaburagi',                ''),
  ('Futuresphere LLP',       'Kalaburagi',                ''),
  ('Agritwin AI',            'Kalaburagi',                ''),
  ('Scale Access Network',   'Kalaburagi',                ''),
  ('Ascendion Bengaluru',    'Kalaburagi',                ''),
  ('Graymatics',             'Kalaburagi',                ''),
  ('Foliages',               'Mangaluru',                 ''),
  ('MyBranch',               'Mangaluru',                 ''),
  ('SonicLamb',              'Mangaluru',                 ''),
  ('Mitcon (Tumakuru)',      'Tumakuru',                  ''),
  ('Terra Logic',            'Mysuru',                    ''),
  ('HTCL Technologies',      'Mysuru',                    ''),
  ('Kyndryl',                'Mysuru',                    ''),
  ('3M',                     'Mysuru',                    ''),
  ('Thales',                 'Mysuru',                    ''),
  ('BPL PCB',                'Mysuru',                    ''),
  ('Quarks Technologies',    'Mysuru',                    ''),
  ('Prudent Partners',       'Mysuru',                    ''),
  ('Tekmonks (Data Centre)', 'Mysuru',                    ''),
  ('Takeda (GCC)',           'Mysuru',                    ''),
  ('Fusion Force (GCC)',     'Mysuru',                    ''),
  ('Grassroots Solutions',   'Mysuru',                    ''),
  ('Data Corp',              'Mysuru',                    ''),
  ('Yappes Technologies',    'Mysuru',                    ''),
  ('Techno Solutions',       'Mysuru',                    ''),
  ('eShare',                 '',                          'Cluster TBD'),
  ('Nokia',                  '',                          'Cluster TBD'),
  ('Allstate',               '',                          'Cluster TBD'),
  ('Saks',                   '',                          'Cluster TBD'),
  ('Carl Zeiss',             '',                          'Cluster TBD'),
  ('Revolut',                '',                          'Cluster TBD'),
  ('Solventum',              '',                          'Cluster TBD'),
  ('NIFCO',                  '',                          'Cluster TBD'),
  ('Kenvue',                 '',                          'Cluster TBD'),
  ('Lowe''s',                '',                          'Cluster TBD')
) as c(name, cluster, loc);


-- 4. Data Centres — 10 pipeline + 2 cable landing stations; DC Policy announced
delete from records where vertical = 'itgcc' and tab = 'datacentres' and fy = '2026-27';
insert into records (vertical, tab, fy, data) values
('itgcc','datacentres','2026-27','{"name":"Elmeasure","stage":"Pipeline","cluster":"Bengaluru","notes":"H1 — DC pipeline (10)","src":"H1-FY2627"}'),
('itgcc','datacentres','2026-27','{"name":"iQuest","stage":"Pipeline","cluster":"Bengaluru","notes":"H1 — DC pipeline (10)","src":"H1-FY2627"}'),
('itgcc','datacentres','2026-27','{"name":"Latos","stage":"Pipeline","cluster":"Bengaluru","notes":"H1 — DC pipeline (10)","src":"H1-FY2627"}'),
('itgcc','datacentres','2026-27','{"name":"SERA","stage":"Pipeline","cluster":"Bengaluru","notes":"H1 — DC pipeline (10)","src":"H1-FY2627"}'),
('itgcc','datacentres','2026-27','{"name":"Cleoray","stage":"Pipeline","cluster":"Bengaluru","notes":"H1 — DC pipeline (10)","src":"H1-FY2627"}'),
('itgcc','datacentres','2026-27','{"name":"Equinix","stage":"Pipeline","cluster":"Bengaluru","notes":"H1 — DC pipeline (10)","src":"H1-FY2627"}'),
('itgcc','datacentres','2026-27','{"name":"IPC Corp DC","stage":"Pipeline","cluster":"Tumakuru","notes":"H1 — DC pipeline; with co-located capability centre","src":"H1-FY2627"}'),
('itgcc','datacentres','2026-27','{"name":"Driver.ai","stage":"Pipeline","cluster":"Bengaluru","notes":"H1 — DC pipeline (10)","src":"H1-FY2627"}'),
('itgcc','datacentres','2026-27','{"name":"LoftusLane","stage":"Pipeline","capacity":"200 MW","land":"100 Ac (MLR) + 50 Ac (BLR)","cluster":"Mangaluru","location":"Mangaluru / Bengaluru","notes":"H1 — DC pipeline (10)","src":"H1-FY2627"}'),
('itgcc','datacentres','2026-27','{"name":"Henox","stage":"MoU","capacity":"100 MW","land":"20 Acres","cluster":"Mangaluru","location":"Mangaluru","notes":"H1 — DC pipeline + cable landing station (CLS)","src":"H1-FY2627"}'),
('itgcc','datacentres','2026-27','{"name":"OpenCables (CLS)","stage":"Pipeline","cluster":"Mangaluru","location":"Mangaluru","notes":"H1 — cable landing station (2 CLS achieved)","src":"H1-FY2627"}');


-- 5. Roadshows — 2 domestic done, 2 more by October
delete from records where vertical = 'itgcc' and tab = 'roadshows' and fy = '2026-27';
insert into records (vertical, tab, fy, data) values
('itgcc','roadshows','2026-27','{"name":"Domestic Roadshow — Chennai","geography":"Tamil Nadu, India","status":"Done","notes":"H1 FY26-27","src":"H1-FY2627"}'),
('itgcc','roadshows','2026-27','{"name":"Domestic Roadshow — Hyderabad","geography":"Telangana, India","status":"Done","notes":"H1 — GCC Workplace Innovation Summit 2026, roundtable partner (5 Aug 2026)","src":"H1-FY2627"}'),
('itgcc','roadshows','2026-27','{"name":"Domestic Roadshow — Pune","geography":"Maharashtra, India","status":"Planned","notes":"Planned by October 2026","src":"H1-FY2627"}'),
('itgcc','roadshows','2026-27','{"name":"Domestic Roadshow — Delhi","geography":"Delhi, India","status":"Planned","notes":"Planned by October 2026","src":"H1-FY2627"}');


-- ============================================================
-- ESDM  (esdm)
-- ============================================================

-- 1. Investments closed in H1 — ₹3,350 Cr / 1,800 jobs (targets ₹6,000 Cr / 5,000)
delete from records where vertical = 'esdm' and tab = 'investments' and fy = '2026-27';
insert into records (vertical, tab, fy, data) values
('esdm','investments','2026-27','{"name":"Wipro","segment":"Laminates","cluster":"Bengaluru","stage":"Closed","value":1350,"jobs":600,"notes":"H1 FY26-27 closed","src":"H1-FY2627"}'),
('esdm','investments','2026-27','{"name":"Lion Circuits","segment":"PCB / HDI","cluster":"Bengaluru","stage":"Closed","value":350,"jobs":400,"notes":"H1 FY26-27 closed","src":"H1-FY2627"}'),
('esdm','investments','2026-27','{"name":"Avalon","segment":"EMS","cluster":"Bengaluru","stage":"Closed","value":150,"jobs":100,"notes":"H1 FY26-27 closed","src":"H1-FY2627"}'),
('esdm','investments','2026-27','{"name":"Motherson Sumi","segment":"EMS","cluster":"Bengaluru","stage":"Closed","value":1500,"jobs":700,"notes":"H1 FY26-27 closed","src":"H1-FY2627"}'),
-- Live investment pipeline
('esdm','investments','2026-27','{"name":"Aequs HBD","segment":"EMS","cluster":"Hubballi-Dharwad-Belagavi","stage":"Hot","value":1500,"notes":"H1 investment pipeline","src":"H1-FY2627"}'),
('esdm','investments','2026-27','{"name":"AT&S","segment":"PCB / HDI","stage":"Hot","value":2500,"notes":"H1 investment pipeline","src":"H1-FY2627"}'),
('esdm','investments','2026-27','{"name":"Aequs KGF","segment":"EMS","stage":"Hot","value":1000,"notes":"H1 investment pipeline — Kolar Gold Fields","src":"H1-FY2627"}'),
('esdm','investments','2026-27','{"name":"Bharat Forge","segment":"Components","stage":"Hot","value":400,"notes":"H1 investment pipeline","src":"H1-FY2627"}'),
('esdm','investments','2026-27','{"name":"Amber Group","segment":"EMS","stage":"Hot","value":300,"notes":"H1 investment pipeline","src":"H1-FY2627"}'),
('esdm','investments','2026-27','{"name":"Nyobolt DC","segment":"Battery","stage":"Hot","value":8000,"notes":"H1 investment pipeline","src":"H1-FY2627"}'),
('esdm','investments','2026-27','{"name":"Gurutva","segment":"Other","stage":"Hot","value":150,"notes":"H1 investment pipeline","src":"H1-FY2627"}'),
('esdm','investments','2026-27','{"name":"Millennium Semiconductors","segment":"Components","stage":"Hot","value":160,"notes":"H1 investment pipeline","src":"H1-FY2627"}'),
('esdm','investments','2026-27','{"name":"Sumnan Chemicals","segment":"Other","stage":"Hot","value":220,"notes":"H1 investment pipeline","src":"H1-FY2627"}'),
('esdm','investments','2026-27','{"name":"BRAVE","segment":"EMS","stage":"Warm","notes":"H1 investment pipeline — value TBD","src":"H1-FY2627"}'),
('esdm','investments','2026-27','{"name":"AWSL","segment":"Components","stage":"Warm","notes":"H1 investment pipeline — value TBD","src":"H1-FY2627"}'),
('esdm','investments','2026-27','{"name":"IPC","segment":"Other","stage":"Warm","notes":"H1 investment pipeline — value TBD","src":"H1-FY2627"}'),
('esdm','investments','2026-27','{"name":"Applied Materials (AMAT)","segment":"Semiconductor Equipment","stage":"Warm","value":7500,"notes":"H1 — AMAT & LAM Research together close to ₹15,000 Cr; split shown 50/50 pending confirmation","src":"H1-FY2627"}'),
('esdm','investments','2026-27','{"name":"LAM Research","segment":"Semiconductor Equipment","stage":"Warm","value":7500,"notes":"H1 — AMAT & LAM Research together close to ₹15,000 Cr; split shown 50/50 pending confirmation","src":"H1-FY2627"}'),
-- SEMICON India follow-ups from the Netherlands delegation
('esdm','investments','2026-27','{"name":"ASML","segment":"Semiconductor Equipment","stage":"Warm","value":100,"jobs":200,"notes":"H1 — SEMICON India follow-up: 50–200 jobs, ₹100 Cr potential","src":"H1-FY2627"}'),
('esdm','investments','2026-27','{"name":"Brainport Development","segment":"Other","stage":"Warm","value":500,"jobs":400,"notes":"H1 — SEMICON India follow-up: 200–400 jobs, ₹500 Cr; introduction to key industry body in Eindhoven","src":"H1-FY2627"}'),
('esdm','investments','2026-27','{"name":"eLStar Dynamics","segment":"Other","stage":"Warm","value":100,"notes":"H1 — SEMICON India follow-up: ₹50–100 Cr; JV partner (Golden Glass) being evaluated","src":"H1-FY2627"}'),
('esdm','investments','2026-27','{"name":"Keiron Printing Technologies","segment":"Other","stage":"Prospect","notes":"H1 — looking to grow market in India; no set-up intent currently","src":"H1-FY2627"}');

-- 2. Roadshows — 1 international completed, 3 industry roundtables, Japan/Korea/Taiwan ahead
delete from records where vertical = 'esdm' and tab = 'roadshows' and fy = '2026-27';
insert into records (vertical, tab, fy, data) values
('esdm','roadshows','2026-27','{"name":"Netherlands Roadshow","geography":"Netherlands","date":"2026-06-04","status":"Done","leads":6,"stakeholders":"Health Innovation Netherlands (HI-NL), Utrecht\nKeiron Printing Technologies\neLStar Dynamics\nBrainport Development\nNetherlands Enterprise Agency (RVO) Networking Event\nASML","notes":"H1 — completed June 2026; follow-up with the delegation at SEMICON India","src":"H1-FY2627"}'),
('esdm','roadshows','2026-27','{"name":"Industry Roundtable — Bengaluru","geography":"Karnataka, India","status":"Done","notes":"H1 — 1 of 3 industry roundtables","src":"H1-FY2627"}'),
('esdm','roadshows','2026-27','{"name":"Industry Roundtable — Mysuru","geography":"Karnataka, India","status":"Done","notes":"H1 — 2 of 3 industry roundtables","src":"H1-FY2627"}'),
('esdm','roadshows','2026-27','{"name":"Industry Roundtable — HDB","geography":"Karnataka, India","status":"Done","notes":"H1 — 3 of 3 industry roundtables","src":"H1-FY2627"}'),
('esdm','roadshows','2026-27','{"name":"Japan Roadshow","geography":"Japan","date":"2026-11-20","status":"Planned","notes":"Late November 2026","src":"H1-FY2627"}'),
('esdm','roadshows','2026-27','{"name":"Korea / Taiwan Roadshow","geography":"South Korea & Taiwan","date":"2026-11-25","status":"Planned","notes":"Late November 2026","src":"H1-FY2627"}');

-- 3. Fund release under the ESDM policy — 7 lined up, 4 in disbursement (₹1,200 Cr)
delete from records where vertical = 'esdm' and tab = 'polstrategy' and fy = '2026-27';
insert into records (vertical, tab, fy, data) values
('esdm','polstrategy','2026-27','{"name":"Tata Technologies","policy":"ESDM Policy","status":"Applied","blocker":"Incentive approval process","next_action":"Lined up for disbursement","notes":"H1 — 1 of 7 lined up for disbursement","src":"H1-FY2627"}'),
('esdm','polstrategy','2026-27','{"name":"Schneider","policy":"ESDM Policy","status":"In progress","blocker":"Incentive approval process","next_action":"Fund release — currently being supported through incentive approval","notes":"H1 — in disbursement (4 companies, ₹1,200 Cr)","src":"H1-FY2627"}'),
('esdm','polstrategy','2026-27','{"name":"Kaynes","policy":"ESDM Policy","status":"Applied","next_action":"Lined up for disbursement","notes":"H1 — 1 of 7 lined up for disbursement","src":"H1-FY2627"}'),
('esdm','polstrategy','2026-27','{"name":"Aequs","policy":"ESDM Policy","status":"Applied","next_action":"Lined up for disbursement","notes":"H1 — 1 of 7 lined up for disbursement","src":"H1-FY2627"}'),
('esdm','polstrategy','2026-27','{"name":"Siemens Healthineers","policy":"ESDM Policy","status":"Applied","next_action":"Lined up for disbursement","notes":"H1 — 1 of 7 lined up for disbursement","src":"H1-FY2627"}'),
('esdm','polstrategy','2026-27','{"name":"IFB","policy":"ESDM Policy","status":"Applied","next_action":"Lined up for disbursement","notes":"H1 — 1 of 7 lined up for disbursement","src":"H1-FY2627"}'),
('esdm','polstrategy','2026-27','{"name":"INOX","policy":"ESDM Policy","status":"Applied","next_action":"Lined up for disbursement","notes":"H1 — 1 of 7 lined up for disbursement","src":"H1-FY2627"}'),
('esdm','polstrategy','2026-27','{"name":"Silcarb","policy":"ESDM Policy","status":"Applied","next_action":"Track application with the Department","notes":"H1 — application already submitted","src":"H1-FY2627"}'),
('esdm','polstrategy','2026-27','{"name":"Rakon","policy":"ESDM Policy","status":"In progress","blocker":"Incentive approval process","next_action":"Fund release — currently being supported through incentive approval","notes":"H1 — in disbursement","src":"H1-FY2627"}');


-- ============================================================
-- BEYOND BENGALURU  (bb)
-- ============================================================
-- Companies & jobs mirror automatically from the itgcc/esdm rows above
-- (BBView filters by cluster). What is BB-specific is policy adoption.

-- 4. Policy awareness & adoption — 37 of 60 sessions conducted
--    HDB 7 · KBG 11 · MLR 11 · MYS 6 · Davanagere 1 (36 named by cluster in
--    the report; the 37th is counted in the headline figure but not broken out)
delete from records where vertical = 'bb' and tab = 'awareness' and fy = '2026-27';
insert into records (vertical, tab, fy, data)
select 'bb', 'awareness', '2026-27',
       jsonb_build_object(
         'name', c.label || ' — Policy Awareness Session ' || g.i,
         'cluster', c.cluster, 'venue', c.label,
         'notes', 'H1 FY26-27 — session ' || g.i || ' of ' || c.n
                  || ' reported for this cluster; add date, venue & attendance in the app',
         'src', 'H1-FY2627')
from (values
  ('HDB',        'Hubballi-Dharwad-Belagavi',  7),
  ('Kalaburagi', 'Kalaburagi',                11),
  ('Mangaluru',  'Mangaluru',                 11),
  ('Mysuru',     'Mysuru',                     6),
  ('Davanagere', 'Davanagere',                 1)
) as c(label, cluster, n), lateral generate_series(1, c.n) as g(i);

-- Policy registrations in the pipeline with KITS
insert into records (vertical, tab, fy, data)
select 'bb', 'policyreg', '2026-27',
       jsonb_build_object('name', r.name, 'policy', 'IT Policy', 'stage', r.stage,
                          'notes', r.note, 'src', 'H1-FY2627')
from (values
  ('BB application under processing with KITS 1','Under review','H1 — 4 applications under processing with KITS'),
  ('BB application under processing with KITS 2','Under review','H1 — 4 applications under processing with KITS'),
  ('BB application under processing with KITS 3','Under review','H1 — 4 applications under processing with KITS'),
  ('BB application under processing with KITS 4','Under review','H1 — 4 applications under processing with KITS'),
  ('BB site visit in progress 1','Applied','H1 — 2 site visits in progress'),
  ('BB site visit in progress 2','Applied','H1 — 2 site visits in progress'),
  ('BB application in pipeline 1','Outreach','H1 — 6 applications in pipeline'),
  ('BB application in pipeline 2','Outreach','H1 — 6 applications in pipeline'),
  ('BB application in pipeline 3','Outreach','H1 — 6 applications in pipeline'),
  ('BB application in pipeline 4','Outreach','H1 — 6 applications in pipeline'),
  ('BB application in pipeline 5','Outreach','H1 — 6 applications in pipeline'),
  ('BB application in pipeline 6','Outreach','H1 — 6 applications in pipeline')
) as r(name, stage, note);


-- ============================================================
-- TALENT ACCELERATOR  (talent)
-- ============================================================
delete from records where vertical = 'talent' and tab = 'programs' and fy = '2026-27';
insert into records (vertical, tab, fy, data) values
-- 1. NIPUNA Karnataka
('talent','programs','2026-27','{"name":"NIPUNA — 4 proposals executed","scheme":"NIPUNA","trained":4000,"status":"In progress","notes":"H1 — 4,000 students covered under the 4 executed proposals","src":"H1-FY2627"}'),
('talent','programs','2026-27','{"name":"NIPUNA — approved training pipeline (MoA signed)","scheme":"NIPUNA","trained":2925,"status":"In progress","notes":"H1 — part of the 5,015 approved training pipeline; MoA signed","src":"H1-FY2627"}'),
('talent','programs','2026-27','{"name":"NIPUNA — approved training pipeline (MoA being signed)","scheme":"NIPUNA","trained":2090,"status":"Not started","notes":"H1 — part of the 5,015 approved training pipeline; MoA being signed","src":"H1-FY2627"}'),
('talent','programs','2026-27','{"name":"NIPUNA — currently in training","scheme":"NIPUNA","trained":1015,"status":"In progress","notes":"H1 — 1,015 in training, to complete by December 2026","src":"H1-FY2627"}'),
('talent','programs','2026-27','{"name":"NIPUNA — pending approval","scheme":"NIPUNA","trained":2890,"status":"On hold","notes":"H1 — 2,890 students pending approval","src":"H1-FY2627"}'),
('talent','programs','2026-27','{"name":"NIPUNA — additional pipeline evaluated","scheme":"NIPUNA","trained":26165,"status":"Not started","notes":"H1 — 26,165 additional pipeline evaluated; evaluation nearly complete","src":"H1-FY2627"}'),
-- 3. Women@Work
('talent','programs','2026-27','{"name":"Women@Work — Kalaburagi","scheme":"Women@Work","trained":250,"placed":52,"status":"In progress","notes":"H1 — 250 soft-skills training & counselling; 450 interviews; 52 internships","src":"H1-FY2627"}'),
('talent','programs','2026-27','{"name":"Women@Work — Dharwad","scheme":"Women@Work","trained":500,"placed":35,"status":"In progress","notes":"H1 — 500 counselling; 515 interviews; 35 jobs. Women-Specific Job Drive pending with the Minister: 515 footfall, 15 companies, 24 offers","src":"H1-FY2627"}'),
('talent','programs','2026-27','{"name":"Women@Work — Mangaluru","scheme":"Women@Work","trained":50,"status":"In progress","notes":"H1 — Impact Discovery Design Thinking Workshop, incl. 50 students from MITE","src":"H1-FY2627"}'),
('talent','programs','2026-27','{"name":"Women@Work — women connected (target 1,000)","scheme":"Women@Work","trained":1100,"status":"In progress","notes":"H1 — 1,100+ women connected. MAYA approval awaited from the Higher Education Department","src":"H1-FY2627"}'),
-- 4. CHRO & talent roundtables
('talent','programs','2026-27','{"name":"CHRO Boardroom — Mysuru Big Tech Show","scheme":"Other","trained":45,"status":"Done","notes":"H1 — 23 July 2026, 11:30–12:30, Martin Luther King Hall; 45+ participants. 1 of 2 CHRO roundtables. AI, Robotics & VLSI integration, industry–academia collaboration, faculty upskilling","src":"H1-FY2627"}');

-- 2. AI Industry-Academia programs — 35+ EOIs, 6 LOIs, 17 GEC pitch decks
delete from records where vertical = 'talent' and tab = 'partnerships' and fy = '2026-27';
insert into records (vertical, tab, fy, data)
select 'talent', 'partnerships', '2026-27',
       jsonb_build_object('name', p.name, 'kind', 'Industry', 'status', 'In progress',
                          'notes', p.note, 'src', 'H1-FY2627')
from (values
  ('Weaver',     'H1 — LOI signed for the AI Industry-Academia program (1 of 6)'),
  ('Kyndryl',    'H1 — LOI signed for the AI Industry-Academia program (1 of 6)'),
  ('Standard',   'H1 — LOI signed; GEC Bengaluru confirmed by Standard'),
  ('Consilio',   'H1 — LOI signed; Consilio to adopt 2 GECs'),
  ('ExxonMobil', 'H1 — LOI signed for the AI Industry-Academia program (1 of 6)'),
  ('Genpact',    'H1 — LOI signed for the AI Industry-Academia program (1 of 6)')
) as p(name, note);
insert into records (vertical, tab, fy, data) values
('talent','partnerships','2026-27','{"name":"AI Industry-Academia — 35+ Expressions of Interest","kind":"Industry","status":"In progress","notes":"H1 — 35+ EOIs received; 17 pitch decks from GECs. GMC formation pending with KITS","src":"H1-FY2627"}'),
('talent','partnerships','2026-27','{"name":"Xpheno — cluster talent landscape reports","kind":"Industry","status":"Done","notes":"H1 — Mysuru (Bengaluru and Beyond, June 2026), HDB (HDB Techceleration, Sept 2026) and Mangaluru (Silicon Beach Skills, Technovanza 2026) reports released","src":"H1-FY2627"}');


-- ============================================================
-- STARTUPS & INNOVATION  (sni)
-- ============================================================

-- 5. Beyond Bengaluru BLUE — 3 of 4 events, 30 startups pitched, 9 recognised
delete from records where vertical = 'sni' and tab = 'startups' and fy = '2026-27';
insert into records (vertical, tab, fy, data)
select 'sni', 'startups', '2026-27',
       jsonb_build_object('name', s.name, 'cluster', s.cluster, 'sector', s.sector,
                          'incentive', 'No', 'notes', s.note, 'src', 'H1-FY2627')
from (values
  -- Mysuru BLUE — Demo Day 22 July 2026, STPI Mysuru, 11 VCs
  ('Medvora AI Private Limited',        'Mysuru',    'Healthcare',                     'BLUE Mysuru — Top 10 shortlisted. Founder: Vedavyasa Pai'),
  ('Insanity Labs Private Limited',     'Mysuru',    'Healthcare',                     'BLUE Mysuru — Top 10 shortlisted. Founder: Gajanan S. Revankar'),
  ('Nuevera Innovations Pvt Ltd',       'Mysuru',    'Med-Tech',                       'BLUE Mysuru — Top 10 shortlisted. Founder: Pratik Vijay Waghmare'),
  ('TiaMeds Technologies Private Limited','Mysuru',  'Healthcare',                     'BLUE Mysuru — Top 10 shortlisted. Founder: Abhinandan S. Rao'),
  ('Aayatana Tech Private Limited',     'Mysuru',    'Clean-Tech & Smart-City',        'BLUE Mysuru — Top 10 shortlisted. Founder: Dr. Avinash Gowda'),
  ('Mysoreminds Technologies LLP',      'Mysuru',    'ESDM',                           'BLUE Mysuru — Rank 3 Finalist. Founder: H. V. Raghavendra'),
  ('Deshila Research Private Limited (DTRI)','Mysuru','Telecommunications',            'BLUE Mysuru — Rank 1 Finalist. Founder: Kiran C. Marathe'),
  ('Crisant Technologies',              'Mysuru',    'IT / ITES',                      'BLUE Mysuru — Top 10 shortlisted. Founder: Anand Rajmal Jain'),
  ('Kamireddy Agro Foods Pvt Ltd',      'Mysuru',    'Food & Beverages / Food Processing','BLUE Mysuru — Top 10 shortlisted. Founder: Kamireddy Kiran'),
  ('Molmed Research Foundation',        'Mysuru',    'Biotechnology & Life Sciences',  'BLUE Mysuru — Rank 2 Finalist. Founder: Dr. Bharathi P. Salimath'),
  -- HDB BLUE — Demo Day 2 Sept 2026, KLE CTIE Hubballi, 8 VCs
  ('Imbos Mould Technologies Private Limited','Hubballi-Dharwad-Belagavi','Industrial Machinery & Manufacturing','BLUE HDB — Rank 1 Finalist'),
  ('Kriyavers Private Limited',         'Hubballi-Dharwad-Belagavi','Animation, Visual Effects, Gaming & Comics (AVGC)','BLUE HDB — Rank 3 Finalist'),
  ('KVB Green Energies',                'Hubballi-Dharwad-Belagavi','Agriculture',     'BLUE HDB — Top 10 shortlisted'),
  ('AL Aukik Techlabs LLP (StockWatch)','Hubballi-Dharwad-Belagavi','Banking & Finance','BLUE HDB — Top 10 shortlisted'),
  ('Ravtor Mobility',                   'Hubballi-Dharwad-Belagavi','Automotive (Fuel Based & EV)','BLUE HDB — Top 10 shortlisted'),
  ('Krishiq Innovations LLP',           'Hubballi-Dharwad-Belagavi','Agriculture',     'BLUE HDB — Top 10 shortlisted'),
  ('Acala Design and Tech Pvt Ltd',     'Hubballi-Dharwad-Belagavi','Clean-Tech & Smart-City','BLUE HDB — Top 10 shortlisted'),
  ('Beltech Artificial Intelligence Private Limited','Hubballi-Dharwad-Belagavi','Clean-Tech & Smart-City','BLUE HDB — Top 10 shortlisted'),
  ('Uday Iksa Private Limited',         'Hubballi-Dharwad-Belagavi','Clean-Tech & Smart-City','BLUE HDB — Top 10 shortlisted'),
  ('Trividhi Labs Private Limited',     'Hubballi-Dharwad-Belagavi','IT / ITES',       'BLUE HDB — Rank 2 Finalist'),
  -- Mangaluru BLUE — Demo Day 22 Sept 2026, wrkwrk Mindspace, 10 VCs
  ('Cheggout Services Private Limited', 'Mangaluru', 'Marketing',                      'BLUE Mangaluru — Rank 1 Finalist'),
  ('Goodhart | Vividved Technologies LLP','Mangaluru','Ed-Tech',                       'BLUE Mangaluru — Rank 2 Finalist'),
  ('Gati Gait & Posture Private Limited','Mangaluru','Healthcare',                     'BLUE Mangaluru — Rank 3 Finalist'),
  ('VAPAC Bio-Plastics Private Limited','Mangaluru', 'Clean-Tech & Smart-City',        'BLUE Mangaluru — Top 10 shortlisted'),
  ('Fuwu Innovations Pvt Ltd',          'Mangaluru', 'Healthcare',                     'BLUE Mangaluru — Top 10 shortlisted'),
  ('Tattviq Labs Private Limited',      'Mangaluru', 'Ed-Tech',                        'BLUE Mangaluru — Top 10 shortlisted'),
  ('Plangle Studio Private Limited',    'Mangaluru', 'Visual Effects · Animation',     'BLUE Mangaluru — Top 10 shortlisted'),
  ('HireEdge Technologies Private Limited','Mangaluru','Ed-Tech',                      'BLUE Mangaluru — Top 10 shortlisted'),
  ('Bellare GIS Consultancy Private Limited','Mangaluru','Agriculture',                'BLUE Mangaluru — Top 10 shortlisted'),
  ('Aaptam Foods',                      'Mangaluru', 'Food & Beverages / Food Processing','BLUE Mangaluru — Top 10 shortlisted')
) as s(name, cluster, sector, note);

-- 6. Cluster Seed Fund — ₹27 Cr mobilised excl. KITS (₹47 Cr incl.), 47 applications
delete from records where vertical = 'sni' and tab = 'seedfund' and fy = '2026-27';
insert into records (vertical, tab, fy, data) values
('sni','seedfund','2026-27','{"name":"Cluster HNI LOIs — Mysuru","cluster":"Mysuru","amount":400,"status":"LOI Received","notes":"H1 — ₹4 Cr of the ₹17 Cr HNI LOIs","src":"H1-FY2627"}'),
('sni','seedfund','2026-27','{"name":"Cluster HNI LOIs — Mangaluru","cluster":"Mangaluru","amount":800,"status":"LOI Received","notes":"H1 — ₹8 Cr of the ₹17 Cr HNI LOIs","src":"H1-FY2627"}'),
('sni','seedfund','2026-27','{"name":"Cluster HNI LOIs — HDB","cluster":"Hubballi-Dharwad-Belagavi","amount":400,"status":"LOI Received","notes":"H1 — ₹4 Cr of the ₹17 Cr HNI LOIs","src":"H1-FY2627"}'),
('sni','seedfund','2026-27','{"name":"Cluster HNI LOIs — Bengaluru","cluster":"Bengaluru","amount":100,"status":"LOI Received","notes":"H1 — ₹1 Cr of the ₹17 Cr HNI LOIs","src":"H1-FY2627"}'),
('sni','seedfund','2026-27','{"name":"SBI","amount":500,"status":"Approved","notes":"H1 — ₹5 Cr institutional commitment","src":"H1-FY2627"}'),
('sni','seedfund','2026-27','{"name":"KSIIDC","amount":500,"status":"Approved","notes":"H1 — ₹5 Cr institutional commitment","src":"H1-FY2627"}'),
('sni','seedfund','2026-27','{"name":"KITS","amount":2000,"status":"Approved","notes":"H1 — ₹20 Cr. Headline ₹27 Cr mobilised EXCLUDES this; total pool ₹47 Cr","src":"H1-FY2627"}'),
('sni','seedfund','2026-27','{"name":"Applications received (47, as on 2 Oct 2026)","status":"LOI Received","notes":"H1 — call for applications launched 3 Sept 2026 at HDB Techceleration 2026. Form: https://forms.gle/7WMGcYjNK8U1dgPd8","src":"H1-FY2627"}');

-- 7./11./12. Programs — KAN, BLUE, ELEVATE, K-Combinator
delete from records where vertical = 'sni' and tab = 'programs' and fy = '2026-27';
insert into records (vertical, tab, fy, data) values
('sni','programs','2026-27','{"name":"KAN Cohort 2 — DERBI Foundation & SHINE Foundation","program":"KAN","cohort":"Cohort 2","status":"Active","notes":"H1 — 19 of the 56 startups selected. Modules 1 & 2 complete; Module 3 in progress; Module 4 est. 15 Oct 2026","src":"H1-FY2627"}'),
('sni','programs','2026-27','{"name":"KAN Cohort 2 — JAIN Launchpad & SJCE-STEP","program":"KAN","cohort":"Cohort 2","status":"Active","notes":"H1 — 19 of the 56 startups selected","src":"H1-FY2627"}'),
('sni','programs','2026-27','{"name":"KAN Cohort 2 — GINSERV & ASTRA","program":"KAN","cohort":"Cohort 2","status":"Active","notes":"H1 — 18 of the 56 startups selected","src":"H1-FY2627"}'),
('sni','programs','2026-27','{"name":"KAN Cohort 2 — intake summary","program":"KAN","cohort":"Cohort 2","status":"Selected","notes":"H1 — 293 applications (105 Beyond Bengaluru, 53 women-led); 127 shortlisted for screening; 66 considered for final evaluation; 56 selected & onboarded; 6 Elevate-backed. 60+ hours of collaborative evaluation. 50+ investors connected; ₹15 lakh+ revenue generated by Cohort 2 startups; 12+ roadshow/outreach engagements","src":"H1-FY2627"}'),
('sni','programs','2026-27','{"name":"KAN Cohort 3 — applications","program":"KAN","cohort":"Cohort 3","status":"Applied","notes":"H1 — 552 applications received (40% from Beyond Bengaluru); call launched 23 July 2026 at Mysuru Big Tech Show; 5 awareness sessions during Pre-BTS; cohort starts October 2026","src":"H1-FY2627"}'),
('sni','programs','2026-27','{"name":"Beyond Bengaluru BLUE — Mysuru","program":"BLUE","cohort":"FY 2026-27","cluster":"Mysuru","status":"Graduated","notes":"H1 — applications live 24 June, closed 15 July 2026; pitching 2 July; Demo Day 22 July 2026 at STPI Mysuru before 11 VCs; Top 3 felicitated 23 July at the Mysuru Big Tech Show. With Ideabaaz and IvyCap Ventures","src":"H1-FY2627"}'),
('sni','programs','2026-27','{"name":"Beyond Bengaluru BLUE — HDB","program":"BLUE","cohort":"FY 2026-27","cluster":"Hubballi-Dharwad-Belagavi","status":"Graduated","notes":"H1 — applications live 20 July, closed 12 Aug 2026; pitching 20 & 24 Aug; Demo Day 2 Sept 2026 at KLE CTIE Hubballi before 8 VCs; Top 3 felicitated 3 Sept at HDB Techceleration 2026. With Ideabaaz and Kalaari Capital","src":"H1-FY2627"}'),
('sni','programs','2026-27','{"name":"Beyond Bengaluru BLUE — Mangaluru","program":"BLUE","cohort":"FY 2026-27","cluster":"Mangaluru","status":"Graduated","notes":"H1 — applications live 15 Aug, closed 10 Sept 2026; pitching 15–17 Sept; Demo Day 22 Sept 2026 at wrkwrk Mindspace before 10 VCs; Top 3 felicitated 23 Sept at Mangaluru Technovanza 2026. With Ideabaaz and MXR World","src":"H1-FY2627"}'),
('sni','programs','2026-27','{"name":"Beyond Bengaluru BLUE — H1 summary","program":"BLUE","cohort":"FY 2026-27","status":"Active","notes":"H1 — 3 of 4 events held; 310 applications; 29 VCs engaged; 30 startups pitched; 9 startups recognised","src":"H1-FY2627"}'),
('sni','programs','2026-27','{"name":"ELEVATE 2026 — jury nominations","program":"ELEVATE","cohort":"2026","status":"Applied","notes":"H1 — 77 jury nominations shared with KITS across all stages, drawn from KDEM''s network","src":"H1-FY2627"}'),
('sni','programs','2026-27','{"name":"K-Combinator — TiE Mangaluru","program":"K-Combinator","cohort":"FY 2026-27","cluster":"Mangaluru","status":"Applied","notes":"H1 — MoA signing with TiE Mangaluru in progress. Powered by TiE Nurture: global mentor network, mentoring & masterclasses, industry & market connects, investor readiness, grants & angel network. Form: https://forms.gle/PNMinvFEoy1vw7268","src":"H1-FY2627"}');

-- 2.1 Startup policy awareness sessions — 11 sessions across 7 districts
delete from records where vertical = 'sni' and tab = 'awareness' and fy = '2026-27';
insert into records (vertical, tab, fy, data) values
('sni','awareness','2026-27','{"name":"Yenepoya TBI, Canara Chamber of Commerce & Industry","date":"2026-07-15","cluster":"Mangaluru","venue":"Mangaluru","notes":"H1 — startup policy awareness session (July 2026)","src":"H1-FY2627"}'),
('sni','awareness','2026-27','{"name":"HAI Conclave 2026","date":"2026-07-20","cluster":"Bengaluru","notes":"H1 — startup policy awareness session","src":"H1-FY2627"}'),
('sni','awareness','2026-27','{"name":"Mysuru Big Tech Show","date":"2026-07-22","cluster":"Mysuru","venue":"Mysuru","notes":"H1 — startup policy awareness session","src":"H1-FY2627"}'),
('sni','awareness','2026-27','{"name":"Startup Policy Session with CAs & CSs — Big Tech Show","date":"2026-07-23","cluster":"Mysuru","venue":"Mysuru","notes":"H1 — startup policy awareness session","src":"H1-FY2627"}'),
('sni','awareness','2026-27','{"name":"GSSSIT Mysuru — Pre-Incubation Program","date":"2026-08-05","cluster":"Mysuru","venue":"GSSSIT, Mysuru","notes":"H1 — startup policy awareness session","src":"H1-FY2627"}'),
('sni','awareness','2026-27','{"name":"Startup World Cup (Pegasus Tech Ventures, CEDAT)","date":"2026-08-08","cluster":"Bengaluru","notes":"H1 — startup policy awareness session","src":"H1-FY2627"}'),
('sni','awareness','2026-27','{"name":"Karnataka Startup Policy session — Health Care Dealroom","cluster":"Bengaluru","venue":"Bengaluru Health Community","notes":"H1 — held across July, August and September 2026","src":"H1-FY2627"}'),
('sni','awareness','2026-27','{"name":"GM University, Davanagere","date":"2026-09-01","cluster":"Davanagere","venue":"GM University, Davanagere","notes":"H1 — startup policy awareness session","src":"H1-FY2627"}'),
('sni','awareness','2026-27','{"name":"SIT Tumakuru","date":"2026-09-01","cluster":"Tumakuru","venue":"SIT, Tumakuru","notes":"H1 — startup policy awareness session","src":"H1-FY2627"}'),
('sni','awareness','2026-27','{"name":"HDB Techceleration","date":"2026-09-02","cluster":"Hubballi-Dharwad-Belagavi","venue":"Hubballi","notes":"H1 — startup policy awareness session","src":"H1-FY2627"}'),
('sni','awareness','2026-27','{"name":"Startup Policy Session with CAs & CSs — HDB Techceleration","date":"2026-09-03","cluster":"Hubballi-Dharwad-Belagavi","venue":"Hubballi","notes":"H1 — startup policy awareness session. 11 sessions covered 7 districts with 1,000+ participants","src":"H1-FY2627"}'),
-- 2. Outreach events (Q1)
('sni','awareness','2026-27','{"name":"DPIIT Tejas Workshop — Raichur","date":"2026-04-01","cluster":"Kalaburagi","venue":"Raichur","companies":600,"notes":"H1 — 600+ participants","src":"H1-FY2627"}'),
('sni','awareness','2026-27','{"name":"TiECon Mysuru — policy awareness session","date":"2026-04-16","cluster":"Mysuru","companies":50,"notes":"H1 — 50+ startups","src":"H1-FY2627"}'),
('sni','awareness','2026-27','{"name":"Vertex CXO Conclave — Mangaluru","date":"2026-04-24","cluster":"Mangaluru","companies":100,"notes":"H1 — 100+ delegates","src":"H1-FY2627"}'),
('sni','awareness','2026-27','{"name":"E-Summit 2026 — Belagavi","date":"2026-04-28","cluster":"Hubballi-Dharwad-Belagavi","notes":"H1 — outreach event","src":"H1-FY2627"}'),
('sni','awareness','2026-27','{"name":"KAN Induction Days — Cohort 2 (3 sessions)","cluster":"Bengaluru","notes":"H1 — policy disseminated across 3 induction days (Apr–May 2026)","src":"H1-FY2627"}'),
('sni','awareness','2026-27','{"name":"Policy Awareness Session — Kalaburagi","date":"2026-05-05","cluster":"Kalaburagi","notes":"H1 — outreach event","src":"H1-FY2627"}'),
('sni','awareness','2026-27','{"name":"Mundhe Banni Meetup — Mysuru","date":"2026-06-06","cluster":"Mysuru","notes":"H1 — outreach event","src":"H1-FY2627"}'),
-- 2.4 Startup X-Factor — 6 online sessions
('sni','awareness','2026-27','{"name":"Startup X-Factor · Session 1","date":"2026-04-30","venue":"Online","companies":70,"notes":"H1 — 90+ registrations, 70+ attendees. Speakers: Pratiti Sharma (DPIIT), Hithesh (KITS Startup Cell), Raghu Dharmaraju (ARTPARK at IISc), Rohit Bafna (888VC), Ashutosh Nerkar (IDFC FIRST Bank). Startups: WhatsLoan, Pixolish System, Saras Aerospace","src":"H1-FY2627"}'),
('sni','awareness','2026-27','{"name":"Startup X-Factor · Session 2","date":"2026-05-27","venue":"Online","companies":100,"notes":"H1 — 230+ registrations, 100+ attendees. Speakers: Suvin Narayan (KDEM), Utkarsh Mathur (MeitY Startup Hub), Santhosh S (Bangalore Bioinnovation Centre), Pritam Guha (SBI Start-Up Branch), Deepak Agrawal (Venture Catalysts++), Shashank H S (KUIC). Startups: Molverse Tech, Canopy Devices, Towner Solutions","src":"H1-FY2627"}'),
('sni','awareness','2026-27','{"name":"Startup X-Factor · Session 3","date":"2026-06-25","venue":"Online","companies":105,"notes":"H1 — 180+ registrations, 105+ attendees. Speakers: Prof. Arindam Ghosh (IISc, Karnataka Quantum Technology Task Force), Sathyanarayana B V (DERBI Foundation), Manu Iyer (Bluehill.VC), Kailashnath M S (Ideaspring Capital). Startups: Mankomb Technologies (Chewy), MachI-AT Aerospace","src":"H1-FY2627"}'),
('sni','awareness','2026-27','{"name":"Startup X-Factor · Session 4","date":"2026-07-30","venue":"Online","companies":95,"notes":"H1 — 240+ registrations, 95+ attendees. Speakers: Omar Saud (KDEM), Preksha Thej (Office of the Principal Scientific Adviser, GoI), Tejbir Singh (TNR Law Offices), Vishnu Das (FSID, IISc). Startups: EcoMine, Neurosense Labs","src":"H1-FY2627"}'),
('sni','awareness','2026-27','{"name":"Startup X-Factor · Session 5","date":"2026-08-27","venue":"Online","companies":90,"notes":"H1 — 270+ registrations, 90+ attendees. Speakers: Girish Hiremath (GINSERV), Mayuresh Raut (Seafund), Sharath Shyamasunder (Startup Zone), Omar Saud (KDEM). Startups: Ylectric Technology, AttentionKart","src":"H1-FY2627"}'),
('sni','awareness','2026-27','{"name":"Startup X-Factor · Session 6","date":"2026-09-30","venue":"Online","companies":100,"notes":"H1 — 250 registrations (assumed), 100+ attendees. Speakers: C.M. Patil (KrishiKalpa Foundation), Subhod Hungund (STPI-Bengaluru), Omar Saud (KDEM)","src":"H1-FY2627"}');

-- 1. Startup registration & incentives — headline numbers
insert into records (vertical, tab, fy, data) values
('sni','policyreg','2026-27','{"name":"Startups engaged by KDEM (458)","policy":"Startup Policy","stage":"Outreach","notes":"H1 — 458 startups engaged by KDEM; 1,000+ compiled in the startup database (survey forms, events, walk-ins)","src":"H1-FY2627"}'),
('sni','policyreg','2026-27','{"name":"Registered on Startup Karnataka (165)","policy":"Startup Policy","stage":"Registered","notes":"H1 — 165 registered; 85 verified by KITS (Apr–Sep 2026); 32 from Beyond Bengaluru","src":"H1-FY2627"}'),
('sni','policyreg','2026-27','{"name":"Applied for incentives (72)","policy":"Startup Policy","stage":"Applied","notes":"H1 — 72 startups applied for incentives, of which 16 from Beyond Bengaluru","src":"H1-FY2627"}'),
('sni','policyreg','2026-27','{"name":"DPIIT survey — 22,000+ reached, 312 responses","policy":"Startup Policy","stage":"Outreach","notes":"H1 — survey rolled out June 2026 to 22,000+ DPIIT-recognised startups; 312 responses; only 85 (27.2%) registered on the Startup Karnataka Portal, 227 (72.8%) unregistered/in progress/unaware. Quarterly exercise planned","src":"H1-FY2627"}'),
('sni','policyreg','2026-27','{"name":"KAN-program survey — 90 startups, 10 responses","policy":"Startup Policy","stage":"Outreach","notes":"H1 — 10 responses (11.1%); 8 (80%) registered on the Portal; 6 applied for incentives (State GST and Patent Reimbursement most sought). Handholding ongoing","src":"H1-FY2627"}');


-- ============================================================
-- MARKETING & EVENTS  (mkt)
-- ============================================================

-- 7. Digital media presence — as on 30 September 2026
delete from records where vertical = 'mkt' and tab = 'digital' and fy = '2026-27';
insert into records (vertical, tab, fy, data) values
('mkt','digital','2026-27','{"platform":"LinkedIn","metric":"Followers","value":39931,"as_of":"2026-09-30","notes":"H1 — +17.2% (base 32,000; FY target 40,000)","src":"H1-FY2627"}'),
('mkt','digital','2026-27','{"platform":"YouTube","metric":"Subscribers","value":662,"as_of":"2026-09-30","notes":"H1 — +4.8% (base 570; FY target 1,200)","src":"H1-FY2627"}'),
('mkt','digital','2026-27','{"platform":"Other","metric":"Followers","value":967,"as_of":"2026-09-30","notes":"H1 — Facebook, +7.27% (base 740; FY target 1,400)","src":"H1-FY2627"}'),
('mkt','digital','2026-27','{"platform":"Instagram","metric":"Followers","value":1065,"as_of":"2026-09-30","notes":"H1 — new account (FY target 1,500)","src":"H1-FY2627"}'),
('mkt','digital','2026-27','{"platform":"X (Twitter)","metric":"Followers","value":2215,"as_of":"2026-09-30","notes":"H1 — +10% (FY target 1,000, already exceeded)","src":"H1-FY2627"}'),
('mkt','digital','2026-27','{"platform":"Other","metric":"Followers","value":5550,"as_of":"2026-09-30","notes":"H1 — WhatsApp: 23 groups with 5,550+ members (FY target 17 groups at 280 avg., +25%)","src":"H1-FY2627"}');

-- 8. Media interviews & strategic communications
delete from records where vertical = 'mkt' and tab = 'media' and fy = '2026-27';
insert into records (vertical, tab, fy, data) values
('mkt','media','2026-27','{"item":"Media coverage (532)","kind":"Coverage","date":"2026-09-30","notes":"H1 FY26-27 total","src":"H1-FY2627"}'),
('mkt','media','2026-27','{"item":"Strategic media interactions (74)","kind":"Interview","date":"2026-09-30","notes":"H1 FY26-27 total","src":"H1-FY2627"}'),
('mkt','media','2026-27','{"item":"Industry stories (11)","kind":"Coverage","date":"2026-09-30","notes":"H1 FY26-27 total","src":"H1-FY2627"}'),
('mkt','media','2026-27','{"item":"Press releases (7)","kind":"Press release","date":"2026-09-30","notes":"H1 FY26-27 total","src":"H1-FY2627"}'),
('mkt','media','2026-27','{"item":"Monthly newsletters (5)","kind":"Press release","date":"2026-09-30","notes":"H1 — plus 11 weekly pulses and 2 monthly pulses","src":"H1-FY2627"}'),
('mkt','media','2026-27','{"item":"Hosted events (54)","kind":"Other","date":"2026-09-30","notes":"H1 FY26-27 total","src":"H1-FY2627"}'),
('mkt','media','2026-27','{"item":"Partnered events (123)","kind":"Other","date":"2026-09-30","notes":"H1 FY26-27 total","src":"H1-FY2627"}'),
('mkt','media','2026-27','{"item":"Event promotions (3)","kind":"Other","date":"2026-09-30","notes":"H1 — C2C engagement completed; 3 cluster events; all 6 cluster stories achieved","src":"H1-FY2627"}'),
('mkt','media','2026-27','{"item":"SAMAGRA CSR — ₹5.5 Cr committed","kind":"Other","date":"2026-09-30","notes":"H1 — 6 EOIs for NIPUNA Karnataka; ₹5.5 Cr committed for Karnataka CSR initiatives","src":"H1-FY2627"}'),
('mkt','media','2026-27','{"item":"World FinTech Summit & Global Fintech Fest","kind":"Other","date":"2026-09-10","notes":"H1 — World FinTech Summit, Bengaluru 5–6 May 2026; Global Fintech Fest, Mumbai 9–10 Sept 2026. 7+ fintech company leads; 20+ company pipeline; 20+ angel investors. Fintech CoE branded at the event; Fintech Task Group 2.0 action plan","src":"H1-FY2627"}');


-- ============================================================
-- PROPOSALS & INITIATIVES — H1 status across verticals
-- ============================================================
delete from records where tab = 'proposals' and fy = '2026-27';
insert into records (vertical, tab, fy, data) values
-- IT / GCC
('itgcc','proposals','2026-27','{"title":"Legends & Legacies — with Zinnov","category":"Report","status":"Approved","submitted_to":"KDEM Internal","summary":"H1 — ready for publication","steps":[],"src":"H1-FY2627"}'),
('itgcc','proposals','2026-27','{"title":"The GCC Landscape Report — with ANSR","category":"Report","status":"Approved","submitted_to":"KDEM Internal","summary":"H1 — ready for publication","steps":[],"src":"H1-FY2627"}'),
('itgcc','proposals','2026-27','{"title":"AI Governance for Indian Startups — with SAMCo","category":"Report","status":"Delivered","submitted_to":"GoK","summary":"H1 — released at Mangaluru Technovanza 2026","steps":[],"src":"H1-FY2627"}'),
('itgcc','proposals','2026-27','{"title":"Gaming CoE — HDB cluster (Leslie Ventures)","category":"CoE","status":"Drafting","submitted_to":"ITBT Department","cluster":"Hubballi-Dharwad-Belagavi","summary":"H1 — AI-powered engines & Gaming CoE proposal; draft being discussed with industry leaders","steps":[],"src":"H1-FY2627"}'),
('itgcc','proposals','2026-27','{"title":"Gaming proposal — Mangaluru (ABAI)","category":"CoE","status":"Drafting","submitted_to":"ITBT Department","cluster":"Mangaluru","summary":"H1 — draft under discussion with industry leaders; revised RFP from KITS expected","steps":[],"src":"H1-FY2627"}'),
('itgcc','proposals','2026-27','{"title":"AI Action Plan — AI University draft & bill","category":"Policy","status":"Submitted to KITS","submitted_to":"GoK","summary":"H1 — AI university draft and bill submitted; industry inputs provided and notification completed","steps":[],"src":"H1-FY2627"}'),
('itgcc','proposals','2026-27','{"title":"Cyber Security Policy — with CySecK","category":"Policy","status":"In execution","submitted_to":"GoK","summary":"H1 — engaged with CySecK; CSA Report (Cyber & AI Skill Gap Report) published","steps":[],"src":"H1-FY2627"}'),
('itgcc','proposals','2026-27','{"title":"Quantum Cyber Security Sandbox for PQC — with IIT-B","category":"CoE","status":"In execution","submitted_to":"GoK","summary":"H1 — in progress; aligned with the National Quantum Mission (NQM)","steps":[],"src":"H1-FY2627"}'),
('itgcc','proposals','2026-27','{"title":"Kyndryl — agentic AI & air-gapped enablement","category":"Program","status":"In execution","submitted_to":"KDEM Internal","summary":"H1 — for brownfield and greenfield centres","steps":[],"src":"H1-FY2627"}'),
('itgcc','proposals','2026-27','{"title":"Goodworks GCC portal","category":"Program","status":"In execution","submitted_to":"KDEM Internal","summary":"H1 — additional works. 35+ partners onboarded for GCC; 200+ GCC pipeline, targeting another 25+ to close by Q4","steps":[],"src":"H1-FY2627"}'),
('itgcc','proposals','2026-27','{"title":"Virtual CoE for Intelligence","category":"CoE","status":"In execution","submitted_to":"KDEM Internal","summary":"H1 — in progress","steps":[],"src":"H1-FY2627"}'),
('itgcc','proposals','2026-27','{"title":"CM Catalyst Connect — A Dialogue for Karnataka''s GCC Future","category":"Event","status":"Delivered","submitted_to":"GoK","summary":"H1 — with ASSOCHAM, IESA, NASSCOM and STPI","steps":[],"src":"H1-FY2627"}'),
-- ESDM
('esdm','proposals','2026-27','{"title":"Karnataka ESDM Landscape Report","category":"Report","status":"On hold","submitted_to":"KDEM Internal","summary":"H1 — publication paused: the two vendors evaluated quoted ₹10–12 lakh on 2023–24 vintage data. Ministry of Commerce & Industry to release an updated data series in late October; publication to be re-evaluated then","steps":[],"src":"H1-FY2627"}'),
('esdm','proposals','2026-27','{"title":"EV City & EV testing","category":"Infrastructure","status":"On hold","submitted_to":"GoK","summary":"H1 — meeting with the ARAI team (Pune) and MD KITS to explore synergy with the Ministry of Heavy Industries'' ₹500 Cr Heavy Construction Machinery Test Track fund, adding 2/3/4-wheeler testing. A standalone 100-acre EV City does not appear viable currently","steps":[],"src":"H1-FY2627"}'),
('esdm','proposals','2026-27','{"title":"Drone Testing Facility — with Drone Federation of India","category":"Infrastructure","status":"Approved","submitted_to":"GoK","summary":"H1 — approved by the Finance Department and Cabinet; roles and responsibilities with DFI finalised to the Department''s satisfaction. Meeting held between MD KITS and DFI","steps":[],"src":"H1-FY2627"}'),
('esdm','proposals','2026-27','{"title":"PCB Park — Mysuru","category":"Infrastructure","status":"In execution","submitted_to":"KITS","cluster":"Mysuru","summary":"H1 — land identified in Chamarajanagar; Kaynes considered to acquire the land and Aequs to develop an Electronics & Semiconductor Park. Aequs–Kaynes and Kaynes–CMO coordination meetings done. Land identified at Badanaguppe (Phase 2 or 4); exploring private industrial park partners","steps":[],"src":"H1-FY2627"}'),
-- Beyond Bengaluru
('bb','proposals','2026-27','{"title":"Mangaluru IT Park","category":"Infrastructure","status":"Under review","submitted_to":"KITS","cluster":"Mangaluru","summary":"H1 — 50+ acre Government parcel identified at Bengre–Bolur, Mangaluru; multiple site visits completed. ~18 acres buildable (CRZ) for a GCC plug-and-play campus + CLS. Feasibility study submitted; awaiting KITS approval to commission the study","steps":[],"src":"H1-FY2627"}'),
('bb','proposals','2026-27','{"title":"Mysuru IT City","category":"Infrastructure","status":"Under review","submitted_to":"KITS","cluster":"Mysuru","summary":"H1 — land identified at North EDZ, Koorgalli (7.48 acres) and South EDZ, GTC Campus Nanjangud (8 acres); multiple site visits completed. Feasibility study submitted; awaiting KITS approval to commission the study","steps":[],"src":"H1-FY2627"}'),
('bb','proposals','2026-27','{"title":"Centres of Excellence — hub-and-spoke model","category":"CoE","status":"Submitted to KITS","submitted_to":"GoK","summary":"H1 — formal note submitted; awaiting budgetary provision/allocation","steps":[],"src":"H1-FY2627"}'),
('bb','proposals','2026-27','{"title":"Cluster Seed Fund operationalisation","category":"Program","status":"In execution","submitted_to":"KITS","summary":"H1 — ₹27 Cr mobilised from HNIs & institutions (₹17 Cr HNI LOIs + ₹5 Cr SBI + ₹5 Cr KSIIDC), plus ₹20 Cr from KITS. Call for applications launched 3 Sept 2026 at HDB Techceleration; 47 applications as on 2 Oct 2026","steps":[],"src":"H1-FY2627"}'),
-- Talent
('talent','proposals','2026-27','{"title":"Karnataka Talent Landscape & Employability Report 2026","category":"Report","status":"In execution","submitted_to":"KDEM Internal","summary":"H1 — cluster-specific reports released for Mysuru, HDB and Mangaluru; a consolidated Karnataka Talent Report is being developed","steps":[],"src":"H1-FY2627"}'),
('talent','proposals','2026-27','{"title":"Women@Work (MAYA)","category":"Program","status":"Under review","submitted_to":"GoK","summary":"H1 — MAYA approval awaited from the Higher Education Department. Women-Specific Job Drive, Dharwad pending with the Minister","steps":[],"src":"H1-FY2627"}'),
('talent','proposals','2026-27','{"title":"AI Industry-Academia Programs (GMC)","category":"Program","status":"Under review","submitted_to":"KITS","summary":"H1 — GMC formation pending with KITS. 35+ EOIs, 6 LOIs, 17 GEC pitch decks","steps":[],"src":"H1-FY2627"}'),
-- Startups & Innovation
('sni','proposals','2026-27','{"title":"Startup Dashboard","category":"Program","status":"In execution","submitted_to":"KDEM Internal","summary":"H1 — wireframes completed; UI/frontend development underway, integrating the broader KITE ecosystem. Modules: startup registrations & policy incentives, CoE/ecosystem partner integration, investor engagement & funding analytics, district-wise insights, program tracking, ELEVATE lifecycle tracking. Review with Prashant Prakash (Co-Chair, VG for Startups) scheduled","steps":[],"src":"H1-FY2627"}'),
('sni','proposals','2026-27','{"title":"K-Combinator — TiE Mangaluru","category":"Program","status":"Under review","submitted_to":"KDEM Internal","cluster":"Mangaluru","summary":"H1 — MoA signing in progress","steps":[],"src":"H1-FY2627"}'),
('sni','proposals','2026-27','{"title":"DPIIT State Startup Ranking (6th Edition)","category":"Report","status":"Drafting","submitted_to":"KITS","summary":"H1 — draft action plan prepared for Action Points 3, 9, 11, 13, 14, 16 and 19 under the Draft States'' Ranking Framework; reports to be shared with KITS by Oct 2026","steps":[],"src":"H1-FY2627"}'),
('sni','proposals','2026-27','{"title":"Startup Genome Ranking (GSER)","category":"Report","status":"In execution","submitted_to":"KDEM Internal","summary":"H1 — meetings held June–Sept 2026 with Ravi Narayan, President, Startup Genome India. Exhaustive documents prepared on the 6 ranking parameters with suggestions and additional data for the 2027 cycle. Meeting with Anna Chadwell (Account Manager) on 29 Sept 2026","steps":[],"src":"H1-FY2627"}'),
('sni','proposals','2026-27','{"title":"Bengaluru Innovation Report 2026","category":"Report","status":"Drafting","submitted_to":"KDEM Internal","summary":"H1 — final draft by Oct 2026","steps":[],"src":"H1-FY2627"}'),
('sni','proposals','2026-27','{"title":"Incubators & Accelerators Compendium","category":"Report","status":"Drafting","submitted_to":"KDEM Internal","summary":"H1 — first draft completed. Startup Pulse weekly newsletter running since 6 July 2026","steps":[],"src":"H1-FY2627"}'),
('sni','proposals','2026-27','{"title":"CoE AI Raichur","category":"CoE","status":"In execution","submitted_to":"KITS","cluster":"Kalaburagi","summary":"H1 — in progress","steps":[],"src":"H1-FY2627"}'),
-- Marketing & Events
('mkt','proposals','2026-27','{"title":"BTS 2026 — Beyond Bengaluru pavilion & Future Makers Conclave","category":"Event","status":"In execution","submitted_to":"KDEM Internal","summary":"H1 — proposed BB pavilion with 150 startups + 50 from Bengaluru; 10 roundtable sessions; GIA support and extended cluster visits (one delegation confirmed); proposed speakers shared with MMActiv; IFIA Bharat Innovation showcase of 30 innovators globally. Scheduled November 2026","steps":[],"src":"H1-FY2627"}'),
('mkt','proposals','2026-27','{"title":"Bengaluru Skill Summit 2026","category":"Event","status":"In execution","submitted_to":"KDEM Internal","summary":"H1 — 4–6 November. Skill Hackathon launched; speakers suggested; CSR roundtables, Global Skill session and CG roundtable planned","steps":[],"src":"H1-FY2627"}'),
('mkt','proposals','2026-27','{"title":"Global AI and FutureTech Expo (GAFX)","category":"Event","status":"Drafting","submitted_to":"KDEM Internal","summary":"H1 — planning initiated","steps":[],"src":"H1-FY2627"}');


-- ============================================================
-- EVENTS — H1 actuals
-- ============================================================
delete from events where fy = '2026-27';
insert into events (name, vertical, type, cluster, date, end_date, location, status, fy, notes) values
-- Pre-BTS cluster events: 3 of 6 held in H1
('Mysuru Big Tech Show','mkt','Pre-BTS Cluster','Mysuru','2026-07-22','2026-07-23','Mysuru','done','2026-27','H1 — cluster event held. Mysuru Talent Landscape Report & BB BLUE Mysuru Top 3 felicitation'),
('HDB Techceleration','mkt','Pre-BTS Cluster','Hubballi-Dharwad-Belagavi','2026-09-02','2026-09-03','Hubballi','done','2026-27','H1 — cluster event held. HDB Talent Landscape Report, BB BLUE HDB Top 3, Cluster Seed Fund call for applications'),
('Mangaluru Technovanza','mkt','Pre-BTS Cluster','Mangaluru','2026-09-22','2026-09-23','Mangaluru','done','2026-27','H1 — cluster event held. Mangaluru Talent Landscape Report, AI Governance for Indian Startups report, BB BLUE Mangaluru Top 3'),
('Kalaburagi Techxplore','mkt','Pre-BTS Cluster','Kalaburagi',null,null,'Kalaburagi','planned','2026-27','H2 — remaining cluster event'),
('Tumakuru Techpulse','mkt','Pre-BTS Cluster','Tumakuru',null,null,'Tumakuru','planned','2026-27','H2 — remaining cluster event'),
('Shivamogga Tech Rise','mkt','Pre-BTS Cluster','Shivamogga',null,null,'Shivamogga','planned','2026-27','H2 — remaining cluster event'),
-- Summits & flagship
('World FinTech Summit','mkt','Domestic',null,'2026-05-05','2026-05-06','Bengaluru','done','2026-27','H1 — 7+ fintech leads; Fintech CoE branded at the event'),
('Global Fintech Fest','mkt','International',null,'2026-09-09','2026-09-10','Mumbai','done','2026-27','H1 — 20+ company pipeline; 20+ angel investors for fintech'),
('Bengaluru Skill Summit','mkt','Summit',null,'2026-11-04','2026-11-06','Bengaluru','planned','2026-27','Skill Hackathon launched; CSR roundtables & Global Skill session planned'),
('Bengaluru Tech Summit (BTS) — Future Makers Conclave','mkt','Summit',null,'2026-11-18','2026-11-20','BIEC, Bengaluru','planned','2026-27','BB pavilion: 150 startups + 50 from Bengaluru; 10 roundtables'),
-- IT / GCC roadshows
('Domestic Roadshow — Chennai','itgcc','Domestic',null,null,null,'Chennai','done','2026-27','H1 — domestic GCC roadshow'),
('GCC Workplace Innovation Summit 2026 — Hyderabad','itgcc','Domestic',null,'2026-08-05',null,'Hyderabad','done','2026-27','H1 — roundtable partner for "Building India''s Next GCC Destinations"'),
('Domestic Roadshow — Pune','itgcc','Domestic',null,null,null,'Pune','planned','2026-27','Planned by October 2026'),
('Domestic Roadshow — Delhi','itgcc','Domestic',null,null,null,'New Delhi','planned','2026-27','Planned by October 2026'),
('CM Catalyst Connect','itgcc','Domestic',null,null,null,'Bengaluru','done','2026-27','H1 — A Dialogue for Karnataka''s GCC Future, with ASSOCHAM, IESA, NASSCOM, STPI'),
-- ESDM
('Netherlands Roadshow','esdm','International',null,'2026-06-04',null,'Netherlands','done','2026-27','H1 — HI-NL Utrecht, Keiron, eLStar Dynamics, Brainport Development, RVO, ASML'),
('SEMICON India','esdm','Domestic',null,'2026-09-16','2026-09-18','New Delhi','done','2026-27','H1 — follow-up with the Netherlands delegation'),
('electronica | productronica India 2026','esdm','Domestic',null,'2026-09-16','2026-09-18','New Delhi','done','2026-27','H1 — event participation'),
('ESDM Industry Roundtable — Bengaluru','esdm','Domestic',null,null,null,'Bengaluru','done','2026-27','H1 — 1 of 3 industry roundtables'),
('ESDM Industry Roundtable — Mysuru','esdm','Domestic','Mysuru',null,null,'Mysuru','done','2026-27','H1 — 2 of 3 industry roundtables'),
('ESDM Industry Roundtable — HDB','esdm','Domestic','Hubballi-Dharwad-Belagavi',null,null,'Hubballi','done','2026-27','H1 — 3 of 3 industry roundtables'),
('Japan Roadshow','esdm','International',null,'2026-11-20',null,'Japan','planned','2026-27','Late November 2026'),
('Korea / Taiwan Roadshow','esdm','International',null,'2026-11-25',null,'South Korea & Taiwan','planned','2026-27','Late November 2026'),
-- Startups & Innovation
('Beyond Bengaluru BLUE — Mysuru (Demo Day)','sni','Domestic','Mysuru','2026-07-22',null,'STPI, Mysuru','done','2026-27','H1 — Top 10 pitched before 11 VCs; with Ideabaaz & IvyCap Ventures'),
('Beyond Bengaluru BLUE — HDB (Demo Day)','sni','Domestic','Hubballi-Dharwad-Belagavi','2026-09-02',null,'KLE CTIE, Hubballi','done','2026-27','H1 — Top 10 pitched before 8 VCs; with Ideabaaz & Kalaari Capital'),
('Beyond Bengaluru BLUE — Mangaluru (Demo Day)','sni','Domestic','Mangaluru','2026-09-22',null,'wrkwrk Mindspace, Mangaluru','done','2026-27','H1 — Top 10 pitched before 10 VCs; with Ideabaaz & MXR World'),
('SAP Labs — Startup Social 2026','sni','Domestic',null,'2026-08-04',null,'Bengaluru','done','2026-27','H1 — GTM event participation'),
('Ideabaaz Startup Fest 2026','sni','Domestic',null,'2026-08-29',null,'New Delhi','done','2026-27','H1 — 10 startups'),
('Zinnov Confluence 2026','sni','Domestic',null,'2026-08-19','2026-08-20','Bengaluru','done','2026-27','H1 — GTM event participation'),
('PRAGATI Q-Foundry 2026 Tech Expo','sni','Domestic',null,'2026-09-29','2026-09-30','New Delhi','done','2026-27','H1 — GTM event participation'),
('CF Partners Japan — MakiChalle 2026 Innovation Pitch Challenge','sni','International',null,'2026-07-15',null,'Japan','done','2026-27','H1 — startup delegation & global expansion'),
('London & Partners','sni','International',null,'2026-09-28',null,'Bengaluru','done','2026-27','H1 — startup delegation & global expansion'),
('French Consulate visit to Mysuru','sni','International','Mysuru','2026-08-15',null,'Mysuru','done','2026-27','H1 — startup delegation & global expansion'),
-- Talent
('CHRO Boardroom — Mysuru Big Tech Show','talent','Domestic','Mysuru','2026-07-23',null,'Martin Luther King Hall, Mysuru','done','2026-27','H1 — 11:30–12:30; 45+ participants. 1 of 2 CHRO roundtables'),
-- District events (Startups & Innovation, 2.2)
('DPIIT Tejas Workshop — Raichur','sni','Domestic','Kalaburagi','2026-04-01',null,'Raichur','done','2026-27','H1 — 600+ participants'),
('Women Entrepreneurs Bootcamp — Davanagere','sni','Domestic','Davanagere',null,null,'Davanagere','done','2026-27','H1 — district event'),
('Policy Awareness Session — Kalaburagi','sni','Domestic','Kalaburagi','2026-05-05',null,'Kalaburagi','done','2026-27','H1 — district event');

commit;


-- ============================================================
-- OPTIONAL — fill in Beyond Bengaluru per-company jobs
-- The H1 report gives only cluster totals (HDB 125 · KBG 50 · MLR 211 ·
-- MYS 1,100+ = 1,486). Once you have the per-company split, run one
-- UPDATE per company so the BB "Jobs (landed)" counter is correct:
--
--   update records
--      set data = data || jsonb_build_object('jobs', 40)
--    where fy = '2026-27' and vertical = 'itgcc' and tab = 'gccs'
--      and data->>'name' = '3Gen Consulting';
--
-- To list the H1 rows still missing a jobs figure:
--
--   select data->>'cluster' as cluster, data->>'name' as company
--     from records
--    where data->>'src' = 'H1-FY2627' and tab = 'gccs'
--      and data->>'cluster' <> 'Bengaluru' and data->>'cluster' <> ''
--      and data->>'jobs' is null
--    order by 1, 2;
-- ============================================================
