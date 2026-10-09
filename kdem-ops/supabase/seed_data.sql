-- ============================================================
-- KDEM OneView — data load: H1 FY 2026-27 ONLY
-- Source: "H1 FY 2026-27 Progress Report" (1 Apr – 30 Sep 2026).
--
-- ⚠  This REPLACES all tracker data. It deletes every row in `records`
--    and `events` (all financial years, including anything typed in the
--    app) and the tasks the old seed created, then loads H1 FY 2026-27.
--    Profiles, settings, meetings, personal items and other tasks are kept.
--
-- Run order on an existing database:
--   1. supabase/migrate_v6.sql   (cluster list incl. Davanagere & Cluster TBD)
--   2. this file
-- ============================================================

begin;

delete from records;
delete from events;
delete from tasks where title in (
  'Step-by-step policy registration guides — KITS',
  'GCC combined launch event — invite Anchors, Secretary, Chairman, CEO',
  'District Digital Committee — concept note',
  'Techceleration agenda — date change follow-up',
  'Cluster Seed Fund — follow up',
  'AVGC CoE — spoke model with ABAI',
  'DC Park — follow up',
  'Finalize KDEM office space at DC Office',
  'ELEVATE applications close 4 July — push outreach',
  'K-Combinator MoA — TiE Mangaluru signing');


-- ============================================================
-- IT / ITeS / GCC
-- ============================================================

-- 26 new GCCs and 14 GCC expansions (state-wide)
insert into records (vertical, tab, fy, data)
select 'itgcc', 'gccs', '2026-27', jsonb_build_object('name', n, 'type', 'GCC', 'kind', 'New', 'cluster', 'Bengaluru', 'stage', 'Grounded', 'notes', 'H1 FY26-27')
from unnest(array['The Standard','Arrive','Merck KGaA (MGCC)','Woodside','RAKSUL','ARKO Corp','Abercrombie & Fitch','Under Armour','Warner Music Group','Officeworks','SITA','Cyderes','DePuy Synthes','Festo','Zimmer Biomet','Codec','Axiado Corporation','N-able','Ahead','Craft Henz','Mann+Hummel','Halo Kinetic','Natus Sensory','Fictiv','Tazapay','DSP']) as n;
insert into records (vertical, tab, fy, data)
select 'itgcc', 'gccs', '2026-27', jsonb_build_object('name', n, 'type', 'GCC', 'kind', 'Expansion', 'cluster', 'Bengaluru', 'stage', 'Grounded', 'notes', 'H1 FY26-27')
from unnest(array['Pegasystems','Toast Inc.','Catalyst Brands','eBay','Kraft Heinz','Target Corp.','Best Buy','SolarEdge','SBM Offshore','SAP Labs','Sirva','Alcon','Progress Software','LIDL']) as n;

-- 1 Nano GCC
insert into records (vertical, tab, fy, data) values
('itgcc','gccs','2026-27','{"name":"Teksalah LLC","type":"Nano GCC","kind":"New","cluster":"Mangaluru","stage":"Grounded","notes":"H1 FY26-27 — first Nano GCC in Mangaluru"}');

-- Beyond Bengaluru: 21 new companies and 19 expansions (by cluster & quarter)
insert into records (vertical, tab, fy, data)
select 'itgcc', 'gccs', '2026-27', jsonb_build_object('name', c.name, 'type', c.type, 'kind', 'New', 'cluster', c.cluster, 'stage', 'Grounded', 'notes', 'Onboarded ' || c.q || ' FY26-27')
from (values
  ('3Gen Consulting', 'IT/ITeS', 'Mysuru', 'Q1'),
  ('Mathera Technologies', 'IT/ITeS', 'Mysuru', 'Q1'),
  ('Yugasys', 'IT/ITeS', 'Mysuru', 'Q1'),
  ('Kodre Minds', 'IT/ITeS', 'Mysuru', 'Q1'),
  ('Tsuyo', 'ESDM / Manufacturing', 'Hubballi-Dharwad-Belagavi', 'Q1'),
  ('Crevavi Technologies', 'IT/ITeS', 'Hubballi-Dharwad-Belagavi', 'Q1'),
  ('KabadiMan', 'Other', 'Hubballi-Dharwad-Belagavi', 'Q1'),
  ('Cipherion Pvt Ltd', 'IT/ITeS', 'Hubballi-Dharwad-Belagavi', 'Q1'),
  ('Lara Tech Consulting', 'IT/ITeS', 'Mangaluru', 'Q1'),
  ('Zynthora AI', 'IT/ITeS', 'Mangaluru', 'Q1'),
  ('MITCON', 'Other', 'Kalaburagi', 'Q1'),
  ('Zemicon', 'ESDM / Manufacturing', 'Kalaburagi', 'Q1'),
  ('Lion Circuits', 'ESDM / Manufacturing', 'Kalaburagi', 'Q1'),
  ('Deskly by Aller', 'IT/ITeS', 'Kalaburagi', 'Q1'),
  ('Hospigrow Academy', 'Other', 'Hubballi-Dharwad-Belagavi', 'Q2'),
  ('Zentoja Technologies', 'IT/ITeS', 'Hubballi-Dharwad-Belagavi', 'Q2'),
  ('Trivadhi Labs', 'IT/ITeS', 'Hubballi-Dharwad-Belagavi', 'Q2'),
  ('Ziliqon', 'IT/ITeS', 'Mangaluru', 'Q2'),
  ('Avishkar AI', 'IT/ITeS', 'Mangaluru', 'Q2'),
  ('Volvitech', 'IT/ITeS', 'Mangaluru', 'Q2'),
  ('Buy U Foods', 'Other', 'Kalaburagi', 'Q2')
) as c(name, type, cluster, q);

insert into records (vertical, tab, fy, data)
select 'itgcc', 'gccs', '2026-27', jsonb_build_object('name', c.name, 'type', c.type, 'kind', 'Expansion', 'cluster', c.cluster, 'stage', 'Grounded', 'notes', 'Expanded ' || c.q || ' FY26-27')
from (values
  ('IBM', 'IT/ITeS', 'Mysuru', 'Q1'),
  ('Kaynes Technology', 'ESDM / Manufacturing', 'Mysuru', 'Q1'),
  ('Docket Run Tech', 'IT/ITeS', 'Hubballi-Dharwad-Belagavi', 'Q1'),
  ('Updapt', 'IT/ITeS', 'Mangaluru', 'Q1'),
  ('Incture', 'IT/ITeS', 'Mangaluru', 'Q1'),
  ('EchoPeak', 'IT/ITeS', 'Mangaluru', 'Q1'),
  ('DAZN', 'IT/ITeS', 'Mangaluru', 'Q1'),
  ('Everi', 'IT/ITeS', 'Mangaluru', 'Q1'),
  ('Pierian', 'IT/ITeS', 'Mangaluru', 'Q1'),
  ('Sophrosyne', 'IT/ITeS', 'Mangaluru', 'Q1'),
  ('Terra Circuits', 'ESDM / Manufacturing', 'Kalaburagi', 'Q1'),
  ('Infosys', 'IT/ITeS', 'Mangaluru', 'Q2'),
  ('Manipal Dot Net Pvt. Ltd', 'IT/ITeS', 'Mangaluru', 'Q2'),
  ('The Web People LLP', 'IT/ITeS', 'Mangaluru', 'Q2'),
  ('Elogixa', 'IT/ITeS', 'Mangaluru', 'Q2'),
  ('G&S Consulting', 'IT/ITeS', 'Mangaluru', 'Q2'),
  ('Rprocess', 'IT/ITeS', 'Mysuru', 'Q2'),
  ('Prudent', 'IT/ITeS', 'Mysuru', 'Q2'),
  ('Straviant', 'IT/ITeS', 'Mysuru', 'Q2')
) as c(name, type, cluster, q);

-- Beyond Bengaluru pipeline: 50 companies
insert into records (vertical, tab, fy, data)
select 'itgcc', 'gccs', '2026-27', jsonb_build_object('name', c.name, 'type', c.type, 'kind', 'New', 'cluster', c.cluster, 'stage', 'Engaged', 'notes', c.note)
from (values
  ('Innovai Solutions', 'IT/ITeS', 'Hubballi-Dharwad-Belagavi', ''),
  ('Writer Group', 'IT/ITeS', 'Hubballi-Dharwad-Belagavi', ''),
  ('JSW Group', 'GCC', 'Hubballi-Dharwad-Belagavi', ''),
  ('Soul Sara', 'IT/ITeS', 'Hubballi-Dharwad-Belagavi', ''),
  ('iMerit', 'IT/ITeS', 'Hubballi-Dharwad-Belagavi', ''),
  ('Semiksha Semiconductor', 'ESDM / Manufacturing', 'Hubballi-Dharwad-Belagavi', ''),
  ('Airtel Nextra', 'Data Centre', 'Hubballi-Dharwad-Belagavi', ''),
  ('MyBranch (Hospet)', 'IT/ITeS', 'Kalaburagi', 'Hospet'),
  ('Lion Circuits', 'ESDM / Manufacturing', 'Kalaburagi', ''),
  ('Mysira Labs Pvt Ltd', 'IT/ITeS', 'Kalaburagi', ''),
  ('Webveer Pvt Ltd', 'IT/ITeS', 'Kalaburagi', ''),
  ('Bits & Bytes Pvt Ltd', 'IT/ITeS', 'Kalaburagi', ''),
  ('Shiksha Gurukul Pvt Ltd', 'Other', 'Kalaburagi', ''),
  ('Hyperfin Pvt Ltd', 'IT/ITeS', 'Kalaburagi', ''),
  ('RVR Innovation LLP', 'IT/ITeS', 'Kalaburagi', ''),
  ('Gurukul Skills School', 'Other', 'Kalaburagi', ''),
  ('Futuresphere LLP', 'IT/ITeS', 'Kalaburagi', ''),
  ('Agritwin AI', 'IT/ITeS', 'Kalaburagi', ''),
  ('Scale Access Network', 'IT/ITeS', 'Kalaburagi', ''),
  ('Ascendion Bengaluru', 'IT/ITeS', 'Kalaburagi', ''),
  ('Graymatics', 'IT/ITeS', 'Kalaburagi', ''),
  ('Foliages', 'IT/ITeS', 'Mangaluru', ''),
  ('MyBranch', 'IT/ITeS', 'Mangaluru', ''),
  ('SonicLamb', 'IT/ITeS', 'Mangaluru', ''),
  ('Mitcon', 'Other', 'Tumakuru', ''),
  ('Terra Logic', 'IT/ITeS', 'Mysuru', ''),
  ('HTCL Technologies', 'IT/ITeS', 'Mysuru', ''),
  ('Kyndryl', 'IT/ITeS', 'Mysuru', ''),
  ('3M', 'GCC', 'Mysuru', ''),
  ('Thales', 'GCC', 'Mysuru', ''),
  ('BPL PCB', 'ESDM / Manufacturing', 'Mysuru', ''),
  ('Quarks Technologies', 'ESDM / Manufacturing', 'Mysuru', ''),
  ('Prudent Partners', 'IT/ITeS', 'Mysuru', ''),
  ('Tekmonks', 'Data Centre', 'Mysuru', 'Data centre'),
  ('Takeda', 'GCC', 'Mysuru', ''),
  ('Fusion Force', 'GCC', 'Mysuru', ''),
  ('Grassroots Solutions', 'IT/ITeS', 'Mysuru', ''),
  ('Data Corp', 'IT/ITeS', 'Mysuru', ''),
  ('Yappes Technologies', 'IT/ITeS', 'Mysuru', ''),
  ('Techno Solutions', 'IT/ITeS', 'Mysuru', ''),
  ('eShare', 'GCC', 'Cluster TBD', ''),
  ('Nokia', 'GCC', 'Cluster TBD', ''),
  ('Allstate', 'GCC', 'Cluster TBD', ''),
  ('Saks', 'GCC', 'Cluster TBD', ''),
  ('Carl Zeiss', 'GCC', 'Cluster TBD', ''),
  ('Revolut', 'GCC', 'Cluster TBD', ''),
  ('Solventum', 'GCC', 'Cluster TBD', ''),
  ('NIFCO', 'GCC', 'Cluster TBD', ''),
  ('Kenvue', 'GCC', 'Cluster TBD', ''),
  ('Lowe''s', 'GCC', 'Cluster TBD', '')
) as c(name, type, cluster, note);

-- Data centres: 10 in the pipeline, 2 cable landing stations (Henox, OpenCables)
insert into records (vertical, tab, fy, data) values
('itgcc','datacentres','2026-27','{"name":"Elmeasure","stage":"Pipeline"}'),
('itgcc','datacentres','2026-27','{"name":"iQuest","stage":"Pipeline"}'),
('itgcc','datacentres','2026-27','{"name":"Latos","stage":"Pipeline"}'),
('itgcc','datacentres','2026-27','{"name":"SERA","stage":"Pipeline"}'),
('itgcc','datacentres','2026-27','{"name":"Cleoray","stage":"Pipeline"}'),
('itgcc','datacentres','2026-27','{"name":"Equinix","stage":"Pipeline"}'),
('itgcc','datacentres','2026-27','{"name":"IPC Corp DC","stage":"Pipeline","notes":"With a co-located capability centre"}'),
('itgcc','datacentres','2026-27','{"name":"Driver.ai","stage":"Pipeline"}'),
('itgcc','datacentres','2026-27','{"name":"LoftusLane","stage":"Pipeline","cluster":"Mangaluru","location":"Mangaluru"}'),
('itgcc','datacentres','2026-27','{"name":"Henox","stage":"Pipeline","cls":"Yes","cluster":"Mangaluru","location":"Mangaluru","notes":"Data centre and cable landing station"}'),
('itgcc','datacentres','2026-27','{"name":"OpenCables","stage":"Cable landing station","cls":"Yes","cluster":"Mangaluru","location":"Mangaluru"}');

-- Roadshows
insert into records (vertical, tab, fy, data) values
('itgcc','roadshows','2026-27','{"name":"Domestic roadshow — Chennai","kind":"Domestic","geography":"Tamil Nadu","status":"Done"}'),
('itgcc','roadshows','2026-27','{"name":"Domestic roadshow — Hyderabad","kind":"Domestic","geography":"Telangana","date":"2026-08-05","status":"Done","notes":"Roundtable partner, GCC Workplace Innovation Summit 2026"}'),
('itgcc','roadshows','2026-27','{"name":"Domestic roadshow — Pune","kind":"Domestic","geography":"Maharashtra","status":"Planned","notes":"By October 2026"}'),
('itgcc','roadshows','2026-27','{"name":"Domestic roadshow — Delhi","kind":"Domestic","geography":"Delhi","status":"Planned","notes":"By October 2026"}');


-- ============================================================
-- ESDM
-- ============================================================

-- Closed in H1: ₹3,350 Cr, 1,800 jobs (targets ₹6,000 Cr, 5,000 jobs)
insert into records (vertical, tab, fy, data) values
('esdm','investments','2026-27','{"name":"Wipro","segment":"Laminates","stage":"Closed","value":1350,"jobs":600}'),
('esdm','investments','2026-27','{"name":"Lion Circuits","segment":"PCB / HDI","stage":"Closed","value":350,"jobs":400}'),
('esdm','investments','2026-27','{"name":"Avalon","segment":"EMS","stage":"Closed","value":150,"jobs":100}'),
('esdm','investments','2026-27','{"name":"Motherson Sumi","segment":"EMS","stage":"Closed","value":1500,"jobs":700}'),
-- Investment pipeline
('esdm','investments','2026-27','{"name":"Aequs HBD","segment":"EMS","cluster":"Hubballi-Dharwad-Belagavi","stage":"Hot","value":1500}'),
('esdm','investments','2026-27','{"name":"AT&S","segment":"PCB / HDI","stage":"Hot","value":2500}'),
('esdm','investments','2026-27','{"name":"Aequs KGF","segment":"EMS","stage":"Hot","value":1000}'),
('esdm','investments','2026-27','{"name":"Bharat Forge","segment":"Components","stage":"Hot","value":400}'),
('esdm','investments','2026-27','{"name":"Amber Group","segment":"EMS","stage":"Hot","value":300}'),
('esdm','investments','2026-27','{"name":"Nyobolt DC","segment":"Battery","stage":"Hot","value":8000}'),
('esdm','investments','2026-27','{"name":"Gurutva","segment":"Other","stage":"Hot","value":150}'),
('esdm','investments','2026-27','{"name":"Millennium Semiconductors","segment":"Components","stage":"Hot","value":160}'),
('esdm','investments','2026-27','{"name":"Sumnan Chemicals","segment":"Other","stage":"Hot","value":220}'),
('esdm','investments','2026-27','{"name":"BRAVE","segment":"EMS","stage":"Pipeline","notes":"Value to be confirmed"}'),
('esdm','investments','2026-27','{"name":"AWSL","segment":"Components","stage":"Pipeline","notes":"Value to be confirmed"}'),
('esdm','investments','2026-27','{"name":"IPC","segment":"Other","stage":"Pipeline","notes":"Value to be confirmed"}'),
('esdm','investments','2026-27','{"name":"AMAT & LAM Research","segment":"Semiconductor Equipment","stage":"Warm","value":15000,"notes":"Working with both; close to ₹15,000 Cr combined"}'),
-- SEMICON India follow-ups with the Netherlands delegation
('esdm','investments','2026-27','{"name":"ASML","segment":"Semiconductor Equipment","stage":"Warm","value":100,"jobs":200,"notes":"Jobs and initial investment: 50–200 jobs, ₹100 Cr"}'),
('esdm','investments','2026-27','{"name":"Brainport Development","segment":"Other","stage":"Warm","value":500,"jobs":400,"notes":"Introduction to key industry body in Eindhoven: 200–400 jobs, ₹500 Cr"}'),
('esdm','investments','2026-27','{"name":"eLStar Dynamics","segment":"Other","stage":"Warm","value":100,"notes":"₹50–100 Cr; potential JV partner (Golden Glass) being evaluated"}'),
('esdm','investments','2026-27','{"name":"Keiron Printing Technologies","segment":"Other","stage":"Prospect","notes":"Looking to grow market in India; no set-up intent currently"}');

-- Roadshows & roundtables
insert into records (vertical, tab, fy, data) values
('esdm','roadshows','2026-27','{"name":"Netherlands roadshow","kind":"International","geography":"Netherlands","date":"2026-06-04","status":"Done","stakeholders":"Health Innovation Netherlands (HI-NL), Utrecht\nKeiron Printing Technologies\neLStar Dynamics\nBrainport Development\nNetherlands Enterprise Agency (RVO) networking event\nASML","notes":"Followed up with the delegation at SEMICON India"}'),
('esdm','roadshows','2026-27','{"name":"Industry roundtable — Bengaluru","kind":"Industry roundtable","geography":"Karnataka","status":"Done"}'),
('esdm','roadshows','2026-27','{"name":"Industry roundtable — Mysuru","kind":"Industry roundtable","geography":"Karnataka","status":"Done"}'),
('esdm','roadshows','2026-27','{"name":"Industry roundtable — HDB","kind":"Industry roundtable","geography":"Karnataka","status":"Done"}'),
('esdm','roadshows','2026-27','{"name":"Japan roadshow","kind":"International","geography":"Japan","status":"Planned","notes":"Late November 2026"}'),
('esdm','roadshows','2026-27','{"name":"Korea / Taiwan roadshow","kind":"International","geography":"South Korea & Taiwan","status":"Planned","notes":"Late November 2026"}');

-- Fund release under the ESDM policy
insert into records (vertical, tab, fy, data) values
('esdm','polstrategy','2026-27','{"name":"Tata Technologies","policy":"ESDM Policy","status":"Applied","next_action":"Lined up for disbursement"}'),
('esdm','polstrategy','2026-27','{"name":"Schneider","policy":"ESDM Policy","status":"In progress","blocker":"Incentive approval process","next_action":"Support through incentive approval for fund release"}'),
('esdm','polstrategy','2026-27','{"name":"Kaynes","policy":"ESDM Policy","status":"Applied","next_action":"Lined up for disbursement"}'),
('esdm','polstrategy','2026-27','{"name":"Aequs","policy":"ESDM Policy","status":"Applied","next_action":"Lined up for disbursement"}'),
('esdm','polstrategy','2026-27','{"name":"Siemens Healthineers","policy":"ESDM Policy","status":"Applied","next_action":"Lined up for disbursement"}'),
('esdm','polstrategy','2026-27','{"name":"IFB","policy":"ESDM Policy","status":"Applied","next_action":"Lined up for disbursement"}'),
('esdm','polstrategy','2026-27','{"name":"INOX","policy":"ESDM Policy","status":"Applied","next_action":"Lined up for disbursement"}'),
('esdm','polstrategy','2026-27','{"name":"Silcarb","policy":"ESDM Policy","status":"Applied","next_action":"Application submitted — track with the Department"}'),
('esdm','polstrategy','2026-27','{"name":"Rakon","policy":"ESDM Policy","status":"In progress","blocker":"Incentive approval process","next_action":"Support through incentive approval for fund release"}');


-- ============================================================
-- BEYOND BENGALURU
-- (companies, pipeline and data centres above already carry BB clusters)
-- ============================================================

-- Jobs created: 1,486 against a target of 750. The report gives cluster
-- totals only; replace with per-company rows when available.
insert into records (vertical, tab, fy, data) values
('bb','jobs','2026-27','{"name":"Mysuru — H1 total","cluster":"Mysuru","jobs":1100,"period":"H1","notes":"Reported as 1,100+"}'),
('bb','jobs','2026-27','{"name":"Mangaluru — H1 total","cluster":"Mangaluru","jobs":211,"period":"H1"}'),
('bb','jobs','2026-27','{"name":"HDB — H1 total","cluster":"Hubballi-Dharwad-Belagavi","jobs":125,"period":"H1"}'),
('bb','jobs','2026-27','{"name":"Kalaburagi — H1 total","cluster":"Kalaburagi","jobs":50,"period":"H1"}');

-- Policy awareness sessions: 37 of 60 reported; 36 broken out by cluster
insert into records (vertical, tab, fy, data)
select 'bb', 'awareness', '2026-27', jsonb_build_object(
  'name', c.label || ' session ' || g.i, 'cluster', c.cluster,
  'notes', 'H1 FY26-27 — add date, venue and attendance')
from (values
  ('HDB', 'Hubballi-Dharwad-Belagavi', 7),
  ('Kalaburagi', 'Kalaburagi', 11),
  ('Mangaluru', 'Mangaluru', 11),
  ('Mysuru', 'Mysuru', 6),
  ('Davanagere', 'Davanagere', 1)
) as c(label, cluster, n), lateral generate_series(1, c.n) as g(i);


-- ============================================================
-- TALENT ACCELERATOR
-- ============================================================
insert into records (vertical, tab, fy, data) values
('talent','programs','2026-27','{"name":"NIPUNA — 4 proposals executed","scheme":"NIPUNA","trained":4000,"status":"Done"}'),
('talent','programs','2026-27','{"name":"NIPUNA — approved, MoA signed","scheme":"NIPUNA","trained":2925,"status":"In progress","notes":"1,015 currently in training, to complete by December"}'),
('talent','programs','2026-27','{"name":"NIPUNA — approved, MoA being signed","scheme":"NIPUNA","trained":2090,"status":"In progress"}'),
('talent','programs','2026-27','{"name":"NIPUNA — pending approval","scheme":"NIPUNA","trained":2890,"status":"On hold"}'),
('talent','programs','2026-27','{"name":"NIPUNA — additional pipeline evaluated","scheme":"NIPUNA","trained":26165,"status":"Not started","notes":"Evaluation nearly complete"}'),
('talent','programs','2026-27','{"name":"Women@Work — Kalaburagi","scheme":"Women@Work","placed":52,"status":"In progress","notes":"250 soft-skills training & counselling; 450 interviews; 52 internships. Industry orientation workshop for 250 women"}'),
('talent','programs','2026-27','{"name":"Women@Work — Dharwad","scheme":"Women@Work","placed":35,"status":"In progress","notes":"500 counselling; 515 interviews; 35 jobs. Women-specific job drive (515 footfall, 15 companies, 24 offers) pending with the Minister"}'),
('talent','programs','2026-27','{"name":"Women@Work — Mangaluru","scheme":"Women@Work","trained":50,"status":"Done","notes":"Impact Discovery design thinking workshop, incl. 50 students from MITE"}'),
('talent','programs','2026-27','{"name":"CHRO Boardroom — Mysuru Big Tech Show","scheme":"CHRO Roundtable","trained":45,"status":"Done","notes":"23 July 2026, Martin Luther King Hall; 45+ participants. AI, robotics & VLSI, industry–academia collaboration, faculty upskilling"}');

insert into records (vertical, tab, fy, data)
select 'talent', 'partnerships', '2026-27', jsonb_build_object('name', p.name, 'kind', 'Industry', 'status', 'In progress', 'notes', p.note)
from (values
  ('Weaver', 'LOI — AI Industry-Academia program'),
  ('Kyndryl', 'LOI — AI Industry-Academia program'),
  ('Standard', 'LOI — confirmed GEC Bengaluru'),
  ('Consilio', 'LOI — to adopt 2 GECs'),
  ('ExxonMobil', 'LOI — AI Industry-Academia program'),
  ('Genpact', 'LOI — AI Industry-Academia program')
) as p(name, note);


-- ============================================================
-- STARTUPS & INNOVATION
-- ============================================================

-- Beyond Bengaluru BLUE — the 30 startups that pitched (3 of 4 events)
insert into records (vertical, tab, fy, data)
select 'sni', 'startups', '2026-27', jsonb_build_object('name', s.name, 'cluster', s.cluster, 'sector', s.sector, 'notes', s.note)
from (values
  ('Medvora AI Private Limited','Mysuru','Healthcare','BLUE Mysuru — Top 10. Founder: Vedavyasa Pai'),
  ('Insanity Labs Private Limited','Mysuru','Healthcare','BLUE Mysuru — Top 10. Founder: Gajanan S. Revankar'),
  ('Nuevera Innovations Pvt Ltd','Mysuru','Med-Tech','BLUE Mysuru — Top 10. Founder: Pratik Vijay Waghmare'),
  ('TiaMeds Technologies Private Limited','Mysuru','Healthcare','BLUE Mysuru — Top 10. Founder: Abhinandan S. Rao'),
  ('Aayatana Tech Private Limited','Mysuru','Clean-Tech & Smart-City','BLUE Mysuru — Top 10. Founder: Dr. Avinash Gowda'),
  ('Mysoreminds Technologies LLP','Mysuru','ESDM','BLUE Mysuru — Rank 3. Founder: H. V. Raghavendra'),
  ('Deshila Research Private Limited (DTRI)','Mysuru','Telecommunications','BLUE Mysuru — Rank 1. Founder: Kiran C. Marathe'),
  ('Crisant Technologies','Mysuru','IT / ITES','BLUE Mysuru — Top 10. Founder: Anand Rajmal Jain'),
  ('Kamireddy Agro Foods Pvt Ltd','Mysuru','Food & Beverages / Food Processing','BLUE Mysuru — Top 10. Founder: Kamireddy Kiran'),
  ('Molmed Research Foundation','Mysuru','Biotechnology & Life Sciences','BLUE Mysuru — Rank 2. Founder: Dr. Bharathi P. Salimath'),
  ('Imbos Mould Technologies Private Limited','Hubballi-Dharwad-Belagavi','Industrial Machinery & Manufacturing','BLUE HDB — Rank 1'),
  ('Kriyavers Private Limited','Hubballi-Dharwad-Belagavi','AVGC','BLUE HDB — Rank 3'),
  ('KVB Green Energies','Hubballi-Dharwad-Belagavi','Agriculture','BLUE HDB — Top 10'),
  ('AL Aukik Techlabs LLP (StockWatch)','Hubballi-Dharwad-Belagavi','Banking & Finance','BLUE HDB — Top 10'),
  ('Ravtor Mobility','Hubballi-Dharwad-Belagavi','Automotive (Fuel Based & EV)','BLUE HDB — Top 10'),
  ('Krishiq Innovations LLP','Hubballi-Dharwad-Belagavi','Agriculture','BLUE HDB — Top 10'),
  ('Acala Design and Tech Pvt Ltd','Hubballi-Dharwad-Belagavi','Clean-Tech & Smart-City','BLUE HDB — Top 10'),
  ('Beltech Artificial Intelligence Private Limited','Hubballi-Dharwad-Belagavi','Clean-Tech & Smart-City','BLUE HDB — Top 10'),
  ('Uday Iksa Private Limited','Hubballi-Dharwad-Belagavi','Clean-Tech & Smart-City','BLUE HDB — Top 10'),
  ('Trividhi Labs Private Limited','Hubballi-Dharwad-Belagavi','IT / ITES','BLUE HDB — Rank 2'),
  ('Cheggout Services Private Limited','Mangaluru','Marketing','BLUE Mangaluru — Rank 1'),
  ('Goodhart | Vividved Technologies LLP','Mangaluru','Ed-Tech','BLUE Mangaluru — Rank 2'),
  ('Gati Gait & Posture Private Limited','Mangaluru','Healthcare','BLUE Mangaluru — Rank 3'),
  ('VAPAC Bio-Plastics Private Limited','Mangaluru','Clean-Tech & Smart-City','BLUE Mangaluru — Top 10'),
  ('Fuwu Innovations Pvt Ltd','Mangaluru','Healthcare','BLUE Mangaluru — Top 10'),
  ('Tattviq Labs Private Limited','Mangaluru','Ed-Tech','BLUE Mangaluru — Top 10'),
  ('Plangle Studio Private Limited','Mangaluru','Visual Effects · Animation','BLUE Mangaluru — Top 10'),
  ('HireEdge Technologies Private Limited','Mangaluru','Ed-Tech','BLUE Mangaluru — Top 10'),
  ('Bellare GIS Consultancy Private Limited','Mangaluru','Agriculture','BLUE Mangaluru — Top 10'),
  ('Aaptam Foods','Mangaluru','Food & Beverages / Food Processing','BLUE Mangaluru — Top 10')
) as s(name, cluster, sector, note);

-- Cluster Seed Fund — amounts in ₹ lakh. ₹27 Cr mobilised from HNIs &
-- institutions; KITS's ₹20 Cr is tracked separately (status "KITS allocation")
insert into records (vertical, tab, fy, data) values
('sni','seedfund','2026-27','{"name":"HNI LOIs — Mysuru","cluster":"Mysuru","amount":400,"status":"LOI Received"}'),
('sni','seedfund','2026-27','{"name":"HNI LOIs — Mangaluru","cluster":"Mangaluru","amount":800,"status":"LOI Received"}'),
('sni','seedfund','2026-27','{"name":"HNI LOIs — HDB","cluster":"Hubballi-Dharwad-Belagavi","amount":400,"status":"LOI Received"}'),
('sni','seedfund','2026-27','{"name":"HNI LOIs — Bengaluru","cluster":"Bengaluru","amount":100,"status":"LOI Received"}'),
('sni','seedfund','2026-27','{"name":"SBI","amount":500,"status":"Approved"}'),
('sni','seedfund','2026-27','{"name":"KSIIDC","amount":500,"status":"Approved"}'),
('sni','seedfund','2026-27','{"name":"KITS","amount":2000,"status":"KITS allocation","notes":"Call for applications launched 3 Sept 2026 at HDB Techceleration. Form: https://forms.gle/7WMGcYjNK8U1dgPd8"}');

insert into records (vertical, tab, fy, data) values
('sni','programs','2026-27','{"name":"DERBI Foundation – SHINE Foundation","program":"KAN","cohort":"Cohort 2","status":"Active","notes":"19 startups. Modules 1 & 2 complete; Module 3 in progress; Module 4 by 15 Oct 2026"}'),
('sni','programs','2026-27','{"name":"JAIN Launchpad – SJCE-STEP","program":"KAN","cohort":"Cohort 2","status":"Active","notes":"19 startups"}'),
('sni','programs','2026-27','{"name":"GINSERV – ASTRA","program":"KAN","cohort":"Cohort 2","status":"Active","notes":"18 startups"}'),
('sni','programs','2026-27','{"name":"BLUE — Mysuru","program":"BLUE","cohort":"2026","cluster":"Mysuru","status":"Graduated","notes":"Demo Day 22 July 2026, STPI Mysuru, 11 VCs. With Ideabaaz & IvyCap Ventures"}'),
('sni','programs','2026-27','{"name":"BLUE — HDB","program":"BLUE","cohort":"2026","cluster":"Hubballi-Dharwad-Belagavi","status":"Graduated","notes":"Demo Day 2 Sept 2026, KLE CTIE Hubballi, 8 VCs. With Ideabaaz & Kalaari Capital"}'),
('sni','programs','2026-27','{"name":"BLUE — Mangaluru","program":"BLUE","cohort":"2026","cluster":"Mangaluru","status":"Graduated","notes":"Demo Day 22 Sept 2026, wrkwrk Mindspace, 10 VCs. With Ideabaaz & MXR World"}'),
('sni','programs','2026-27','{"name":"K-Combinator — TiE Mangaluru","program":"K-Combinator","cluster":"Mangaluru","status":"Applied","notes":"MoA signing in progress. Form: https://forms.gle/PNMinvFEoy1vw7268"}');

-- Startup policy sessions & outreach
insert into records (vertical, tab, fy, data) values
('sni','awareness','2026-27','{"name":"DPIIT Tejas Workshop","date":"2026-04-01","cluster":"Kalaburagi","venue":"Raichur","companies":600}'),
('sni','awareness','2026-27','{"name":"TiECon Mysuru","date":"2026-04-16","cluster":"Mysuru","companies":50}'),
('sni','awareness','2026-27','{"name":"Vertex CXO Conclave","date":"2026-04-24","cluster":"Mangaluru","companies":100}'),
('sni','awareness','2026-27','{"name":"E-Summit 2026","date":"2026-04-28","cluster":"Hubballi-Dharwad-Belagavi","venue":"Belagavi"}'),
('sni','awareness','2026-27','{"name":"KAN Induction Days, Cohort 2 (3 days)","venue":"Bengaluru","notes":"April–May 2026"}'),
('sni','awareness','2026-27','{"name":"Policy awareness session","date":"2026-05-05","cluster":"Kalaburagi"}'),
('sni','awareness','2026-27','{"name":"Mundhe Banni Meetup","date":"2026-06-06","cluster":"Mysuru"}'),
('sni','awareness','2026-27','{"name":"Yenepoya TBI, Canara Chamber of Commerce & Industry","date":"2026-07-15","cluster":"Mangaluru","notes":"July 2026"}'),
('sni','awareness','2026-27','{"name":"HAI Conclave 2026","date":"2026-07-20","cluster":"Bengaluru"}'),
('sni','awareness','2026-27','{"name":"Mysuru Big Tech Show","date":"2026-07-22","cluster":"Mysuru"}'),
('sni','awareness','2026-27','{"name":"CAs & CSs session, Big Tech Show","date":"2026-07-23","cluster":"Mysuru"}'),
('sni','awareness','2026-27','{"name":"GSSSIT Pre-Incubation Program","date":"2026-08-05","cluster":"Mysuru"}'),
('sni','awareness','2026-27','{"name":"Startup World Cup (Pegasus Tech Ventures, CEDAT)","date":"2026-08-08","cluster":"Bengaluru"}'),
('sni','awareness','2026-27','{"name":"Health Care Dealroom, Bengaluru Health Community","cluster":"Bengaluru","notes":"July, August and September"}'),
('sni','awareness','2026-27','{"name":"GM University","date":"2026-09-01","cluster":"Davanagere"}'),
('sni','awareness','2026-27','{"name":"SIT Tumakuru","date":"2026-09-01","cluster":"Tumakuru"}'),
('sni','awareness','2026-27','{"name":"HDB Techceleration","date":"2026-09-02","cluster":"Hubballi-Dharwad-Belagavi"}'),
('sni','awareness','2026-27','{"name":"CAs & CSs session, HDB Techceleration","date":"2026-09-03","cluster":"Hubballi-Dharwad-Belagavi"}'),
('sni','awareness','2026-27','{"name":"Startup X-Factor · Session 1","date":"2026-04-30","venue":"Online","companies":70,"notes":"90+ registrations. Startups: WhatsLoan, Pixolish System, Saras Aerospace"}'),
('sni','awareness','2026-27','{"name":"Startup X-Factor · Session 2","date":"2026-05-27","venue":"Online","companies":100,"notes":"230+ registrations. Startups: Molverse Tech, Canopy Devices, Towner Solutions"}'),
('sni','awareness','2026-27','{"name":"Startup X-Factor · Session 3","date":"2026-06-25","venue":"Online","companies":105,"notes":"180+ registrations. Startups: Mankomb Technologies (Chewy), MachI-AT Aerospace"}'),
('sni','awareness','2026-27','{"name":"Startup X-Factor · Session 4","date":"2026-07-30","venue":"Online","companies":95,"notes":"240+ registrations. Startups: EcoMine, Neurosense Labs"}'),
('sni','awareness','2026-27','{"name":"Startup X-Factor · Session 5","date":"2026-08-27","venue":"Online","companies":90,"notes":"270+ registrations. Startups: Ylectric Technology, AttentionKart"}'),
('sni','awareness','2026-27','{"name":"Startup X-Factor · Session 6","date":"2026-09-30","venue":"Online","companies":100,"notes":"~250 registrations"}');


-- ============================================================
-- MARKETING & EVENTS — digital as on 30 Sep 2026
-- ============================================================
insert into records (vertical, tab, fy, data) values
('mkt','digital','2026-27','{"platform":"LinkedIn","metric":"Followers","value":39931,"as_of":"2026-09-30","notes":"+17.2%; target 40,000"}'),
('mkt','digital','2026-27','{"platform":"X (Twitter)","metric":"Followers","value":2215,"as_of":"2026-09-30","notes":"+10%; target 1,000"}'),
('mkt','digital','2026-27','{"platform":"Instagram","metric":"Followers","value":1065,"as_of":"2026-09-30","notes":"New account; target 1,500"}'),
('mkt','digital','2026-27','{"platform":"Facebook","metric":"Followers","value":967,"as_of":"2026-09-30","notes":"+7.27%; target 1,400"}'),
('mkt','digital','2026-27','{"platform":"YouTube","metric":"Subscribers","value":662,"as_of":"2026-09-30","notes":"+4.8%; target 1,200"}'),
('mkt','digital','2026-27','{"platform":"WhatsApp","metric":"Members","value":5550,"as_of":"2026-09-30","notes":"23 groups, 5,550+ members; target 17 groups"}');


-- ============================================================
-- HEADLINE NUMBERS (totals the report gives without a row-by-row list)
-- ============================================================
insert into records (vertical, tab, fy, data)
select m.v, 'metrics', '2026-27', jsonb_build_object('metric', m.name, 'value', m.value, 'as_of', '2026-09-30', 'notes', m.note)
from (values
  ('itgcc', 'GCC pipeline', 200, '200+ GCC pipeline; targeting another 25+ to close by Q4'),
  ('itgcc', 'GCC partners onboarded', 35, '35+ partners'),
  ('itgcc', 'Reports ready for publication', 2, 'Legends and Legacies (Zinnov); The GCC Landscape Report (ANSR)'),
  ('itgcc', 'Reports released', 1, 'AI Governance for Indian Startups (SAMCo), Mangaluru Technovanza 2026'),
  ('esdm', 'Companies lined up for disbursement', 7, 'Tata Technologies, Schneider, Kaynes, Aequs, Siemens Healthineers, IFB, INOX'),
  ('esdm', 'Companies in disbursement', 4, '₹1,200 Cr'),
  ('esdm', 'Disbursement value (₹ Cr)', 1200, 'Across the 4 companies in disbursement'),
  ('bb', 'Applications under processing with KITS', 4, ''),
  ('bb', 'Site visits in progress', 2, ''),
  ('bb', 'Applications in pipeline', 6, ''),
  ('talent', 'Women connected (Women@Work)', 1100, '1,100+ against a target of 1,000'),
  ('talent', 'AI Industry-Academia EOIs', 35, '35+'),
  ('talent', 'GEC pitch decks', 17, ''),
  ('sni', 'Startups engaged by KDEM', 458, ''),
  ('sni', 'Startups registered on Startup Karnataka', 165, ''),
  ('sni', 'Registrations verified by KITS', 85, 'Apr–Sep 2026'),
  ('sni', 'Beyond Bengaluru startups registered', 32, ''),
  ('sni', 'Startups applied for incentives', 72, '16 from Beyond Bengaluru'),
  ('sni', 'Startup database', 1000, '1,000+ — survey forms, events, walk-ins'),
  ('sni', 'Survey responses', 312, 'Survey sent to 22,000+ DPIIT-recognised startups in June 2026; 85 (27.2%) registered on the portal, 227 (72.8%) not'),
  ('sni', 'Founders engaged', 2000, '2,000+ founders & aspiring entrepreneurs'),
  ('sni', 'KAN Cohort 2 startups', 56, '293 applications (105 BB, 53 women-led); 127 shortlisted; 66 evaluated; 6 Elevate-backed; 50+ investors connected; ₹15 lakh+ revenue'),
  ('sni', 'KAN Cohort 3 applications', 552, '40% from Beyond Bengaluru; cohort starts October 2026'),
  ('sni', 'ELEVATE jury nominations', 77, 'Shared with KITS'),
  ('sni', 'BLUE applications', 310, ''),
  ('sni', 'BLUE VCs engaged', 29, ''),
  ('sni', 'BLUE startups pitched', 30, ''),
  ('sni', 'BLUE startups recognised', 9, ''),
  ('mkt', 'Media coverage', 532, ''),
  ('mkt', 'Strategic media interactions', 74, ''),
  ('mkt', 'Hosted events', 54, ''),
  ('mkt', 'Partnered events', 123, ''),
  ('mkt', 'Industry stories', 11, ''),
  ('mkt', 'Press releases', 7, ''),
  ('mkt', 'Monthly newsletters', 5, 'Plus 11 weekly pulses and 2 monthly pulses'),
  ('mkt', 'CSR committed (₹ Cr)', 5.5, 'SAMAGRA — 6 EOIs for NIPUNA Karnataka'),
  ('mkt', 'Fintech company leads', 7, '7+'),
  ('mkt', 'Fintech company pipeline', 20, '20+'),
  ('mkt', 'Fintech angel investors', 20, '20+')
) as m(v, name, value, note);
insert into records (vertical, tab, fy, data) values
('sni','metrics','2026-27','{"metric":"Seed fund applications","value":47,"as_of":"2026-10-02","notes":"Since the call opened on 3 Sept 2026"}');


-- ============================================================
-- PROPOSALS & STRATEGIC INITIATIVES
-- ============================================================
insert into records (vertical, tab, fy, data) values
-- IT / GCC
('itgcc','proposals','2026-27','{"title":"Legends & Legacies — with Zinnov","category":"Report","status":"Approved","submitted_to":"KDEM Internal","summary":"H1 — ready for publication","steps":[]}'),
('itgcc','proposals','2026-27','{"title":"The GCC Landscape Report — with ANSR","category":"Report","status":"Approved","submitted_to":"KDEM Internal","summary":"H1 — ready for publication","steps":[]}'),
('itgcc','proposals','2026-27','{"title":"AI Governance for Indian Startups — with SAMCo","category":"Report","status":"Delivered","submitted_to":"GoK","summary":"H1 — released at Mangaluru Technovanza 2026","steps":[]}'),
('itgcc','proposals','2026-27','{"title":"Gaming CoE — HDB cluster (Leslie Ventures)","category":"CoE","status":"Drafting","submitted_to":"ITBT Department","cluster":"Hubballi-Dharwad-Belagavi","summary":"H1 — AI-powered engines & Gaming CoE proposal; draft being discussed with industry leaders","steps":[]}'),
('itgcc','proposals','2026-27','{"title":"Gaming proposal — Mangaluru (ABAI)","category":"CoE","status":"Drafting","submitted_to":"ITBT Department","cluster":"Mangaluru","summary":"H1 — draft under discussion with industry leaders; revised RFP from KITS expected","steps":[]}'),
('itgcc','proposals','2026-27','{"title":"AI Action Plan — AI University draft & bill","category":"Policy","status":"Submitted to KITS","submitted_to":"GoK","summary":"H1 — AI university draft and bill submitted; industry inputs provided and notification completed","steps":[]}'),
('itgcc','proposals','2026-27','{"title":"Cyber Security Policy — with CySecK","category":"Policy","status":"In execution","submitted_to":"GoK","summary":"H1 — engaged with CySecK; CSA Report (Cyber & AI Skill Gap Report) published","steps":[]}'),
('itgcc','proposals','2026-27','{"title":"Quantum Cyber Security Sandbox for PQC — with IIT-B","category":"CoE","status":"In execution","submitted_to":"GoK","summary":"H1 — in progress; aligned with the National Quantum Mission (NQM)","steps":[]}'),
('itgcc','proposals','2026-27','{"title":"Kyndryl — agentic AI & air-gapped enablement","category":"Program","status":"In execution","submitted_to":"KDEM Internal","summary":"H1 — for brownfield and greenfield centres","steps":[]}'),
('itgcc','proposals','2026-27','{"title":"Goodworks GCC portal","category":"Program","status":"In execution","submitted_to":"KDEM Internal","summary":"H1 — additional works. 35+ partners onboarded for GCC; 200+ GCC pipeline, targeting another 25+ to close by Q4","steps":[]}'),
('itgcc','proposals','2026-27','{"title":"Virtual CoE for Intelligence","category":"CoE","status":"In execution","submitted_to":"KDEM Internal","summary":"H1 — in progress","steps":[]}'),
('itgcc','proposals','2026-27','{"title":"CM Catalyst Connect — A Dialogue for Karnataka''s GCC Future","category":"Event","status":"Delivered","submitted_to":"GoK","summary":"H1 — with ASSOCHAM, IESA, NASSCOM and STPI","steps":[]}'),
-- ESDM
('esdm','proposals','2026-27','{"title":"Karnataka ESDM Landscape Report","category":"Report","status":"On hold","submitted_to":"KDEM Internal","summary":"H1 — publication paused: the two vendors evaluated quoted ₹10–12 lakh on 2023–24 vintage data. Ministry of Commerce & Industry to release an updated data series in late October; publication to be re-evaluated then","steps":[]}'),
('esdm','proposals','2026-27','{"title":"EV City & EV testing","category":"Infrastructure","status":"On hold","submitted_to":"GoK","summary":"H1 — meeting with the ARAI team (Pune) and MD KITS to explore synergy with the Ministry of Heavy Industries'' ₹500 Cr Heavy Construction Machinery Test Track fund, adding 2/3/4-wheeler testing. A standalone 100-acre EV City does not appear viable currently","steps":[]}'),
('esdm','proposals','2026-27','{"title":"Drone Testing Facility — with Drone Federation of India","category":"Infrastructure","status":"Approved","submitted_to":"GoK","summary":"H1 — approved by the Finance Department and Cabinet; roles and responsibilities with DFI finalised to the Department''s satisfaction. Meeting held between MD KITS and DFI","steps":[]}'),
('esdm','proposals','2026-27','{"title":"PCB Park — Mysuru","category":"Infrastructure","status":"In execution","submitted_to":"KITS","cluster":"Mysuru","summary":"H1 — land identified in Chamarajanagar; Kaynes considered to acquire the land and Aequs to develop an Electronics & Semiconductor Park. Aequs–Kaynes and Kaynes–CMO coordination meetings done. Land identified at Badanaguppe (Phase 2 or 4); exploring private industrial park partners","steps":[]}'),
-- Beyond Bengaluru
('bb','proposals','2026-27','{"title":"Mangaluru IT Park","category":"Infrastructure","status":"Under review","submitted_to":"KITS","cluster":"Mangaluru","summary":"H1 — 50+ acre Government parcel identified at Bengre–Bolur, Mangaluru; multiple site visits completed. ~18 acres buildable (CRZ) for a GCC plug-and-play campus + CLS. Feasibility study submitted; awaiting KITS approval to commission the study","steps":[]}'),
('bb','proposals','2026-27','{"title":"Mysuru IT City","category":"Infrastructure","status":"Under review","submitted_to":"KITS","cluster":"Mysuru","summary":"H1 — land identified at North EDZ, Koorgalli (7.48 acres) and South EDZ, GTC Campus Nanjangud (8 acres); multiple site visits completed. Feasibility study submitted; awaiting KITS approval to commission the study","steps":[]}'),
('bb','proposals','2026-27','{"title":"Centres of Excellence — hub-and-spoke model","category":"CoE","status":"Submitted to KITS","submitted_to":"GoK","summary":"H1 — formal note submitted; awaiting budgetary provision/allocation","steps":[]}'),
('bb','proposals','2026-27','{"title":"Cluster Seed Fund operationalisation","category":"Program","status":"In execution","submitted_to":"KITS","summary":"H1 — ₹27 Cr mobilised from HNIs & institutions (₹17 Cr HNI LOIs + ₹5 Cr SBI + ₹5 Cr KSIIDC), plus ₹20 Cr from KITS. Call for applications launched 3 Sept 2026 at HDB Techceleration; 47 applications as on 2 Oct 2026","steps":[]}'),
-- Talent
('talent','proposals','2026-27','{"title":"Karnataka Talent Landscape & Employability Report 2026","category":"Report","status":"In execution","submitted_to":"KDEM Internal","summary":"H1 — cluster-specific reports released for Mysuru, HDB and Mangaluru; a consolidated Karnataka Talent Report is being developed","steps":[]}'),
('talent','proposals','2026-27','{"title":"Women@Work (MAYA)","category":"Program","status":"Under review","submitted_to":"GoK","summary":"H1 — MAYA approval awaited from the Higher Education Department. Women-Specific Job Drive, Dharwad pending with the Minister","steps":[]}'),
('talent','proposals','2026-27','{"title":"AI Industry-Academia Programs (GMC)","category":"Program","status":"Under review","submitted_to":"KITS","summary":"H1 — GMC formation pending with KITS. 35+ EOIs, 6 LOIs, 17 GEC pitch decks","steps":[]}'),
-- Startups & Innovation
('sni','proposals','2026-27','{"title":"Startup Dashboard","category":"Program","status":"In execution","submitted_to":"KDEM Internal","summary":"H1 — wireframes completed; UI/frontend development underway, integrating the broader KITE ecosystem. Modules: startup registrations & policy incentives, CoE/ecosystem partner integration, investor engagement & funding analytics, district-wise insights, program tracking, ELEVATE lifecycle tracking. Review with Prashant Prakash (Co-Chair, VG for Startups) scheduled","steps":[]}'),
('sni','proposals','2026-27','{"title":"K-Combinator — TiE Mangaluru","category":"Program","status":"Under review","submitted_to":"KDEM Internal","cluster":"Mangaluru","summary":"H1 — MoA signing in progress","steps":[]}'),
('sni','proposals','2026-27','{"title":"DPIIT State Startup Ranking (6th Edition)","category":"Report","status":"Drafting","submitted_to":"KITS","summary":"H1 — draft action plan prepared for Action Points 3, 9, 11, 13, 14, 16 and 19 under the Draft States'' Ranking Framework; reports to be shared with KITS by Oct 2026","steps":[]}'),
('sni','proposals','2026-27','{"title":"Startup Genome Ranking (GSER)","category":"Report","status":"In execution","submitted_to":"KDEM Internal","summary":"H1 — meetings held June–Sept 2026 with Ravi Narayan, President, Startup Genome India. Exhaustive documents prepared on the 6 ranking parameters with suggestions and additional data for the 2027 cycle. Meeting with Anna Chadwell (Account Manager) on 29 Sept 2026","steps":[]}'),
('sni','proposals','2026-27','{"title":"Bengaluru Innovation Report 2026","category":"Report","status":"Drafting","submitted_to":"KDEM Internal","summary":"H1 — final draft by Oct 2026","steps":[]}'),
('sni','proposals','2026-27','{"title":"Incubators & Accelerators Compendium","category":"Report","status":"Drafting","submitted_to":"KDEM Internal","summary":"H1 — first draft completed. Startup Pulse weekly newsletter running since 6 July 2026","steps":[]}'),
('sni','proposals','2026-27','{"title":"CoE AI Raichur","category":"CoE","status":"In execution","submitted_to":"KITS","cluster":"Kalaburagi","summary":"H1 — in progress","steps":[]}'),
-- Marketing & Events
('mkt','proposals','2026-27','{"title":"BTS 2026 — Beyond Bengaluru pavilion & Future Makers Conclave","category":"Event","status":"In execution","submitted_to":"KDEM Internal","summary":"H1 — proposed BB pavilion with 150 startups + 50 from Bengaluru; 10 roundtable sessions; GIA support and extended cluster visits (one delegation confirmed); proposed speakers shared with MMActiv; IFIA Bharat Innovation showcase of 30 innovators globally. Scheduled November 2026","steps":[]}'),
('mkt','proposals','2026-27','{"title":"Bengaluru Skill Summit 2026","category":"Event","status":"In execution","submitted_to":"KDEM Internal","summary":"H1 — 4–6 November. Skill Hackathon launched; speakers suggested; CSR roundtables, Global Skill session and CG roundtable planned","steps":[]}'),
('mkt','proposals','2026-27','{"title":"Global AI and FutureTech Expo (GAFX)","category":"Event","status":"Drafting","submitted_to":"KDEM Internal","summary":"H1 — planning initiated","steps":[]}');


-- ============================================================
-- EVENTS
-- ============================================================
insert into events (name, vertical, type, cluster, date, end_date, location, status, fy, notes) values
-- Pre-BTS cluster events: 3 of 6 held in H1
('Mysuru Big Tech Show','mkt','Pre-BTS Cluster','Mysuru','2026-07-22','2026-07-23','Mysuru','done','2026-27','H1 — cluster event held. Mysuru Talent Landscape Report & BB BLUE Mysuru Top 3 felicitation'),
('HDB Techceleration','mkt','Pre-BTS Cluster','Hubballi-Dharwad-Belagavi','2026-09-02','2026-09-03','Hubballi','done','2026-27','H1 — cluster event held. HDB Talent Landscape Report, BB BLUE HDB Top 3, Cluster Seed Fund call for applications'),
('Mangaluru Technovanza','mkt','Pre-BTS Cluster','Mangaluru','2026-09-22','2026-09-23','Mangaluru','done','2026-27','H1 — cluster event held. Mangaluru Talent Landscape Report, AI Governance for Indian Startups report, BB BLUE Mangaluru Top 3'),
('Kalaburagi Techxplore','mkt','Pre-BTS Cluster','Kalaburagi',null,null,'Kalaburagi','planned','2026-27','H2 — remaining cluster event'),
('Tumakuru Techpulse','mkt','Pre-BTS Cluster','Tumakuru',null,null,'Tumakuru','planned','2026-27','H2 — remaining cluster event'),
('Davanagere Tech Rise','mkt','Pre-BTS Cluster','Davanagere',null,null,'Davanagere','planned','2026-27','H2 — remaining cluster event'),
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
