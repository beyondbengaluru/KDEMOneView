-- ============================================================
-- KDEM OneView — pre-filled data (v5)
-- Sources: Annual Plan FY 2026-27 + Q1 Progress doc + Beyond
-- Bengaluru Pipeline deck + BB Master Tracker + ESDM Fact Sheet.
-- Run AFTER schema.sql. Names marked (rename) are editable dummies
-- where the Q1 doc gave counts without company names.
-- ============================================================

-- ---------- IT / GCC — Q1: 6 new companies landed ----------
insert into records (vertical, tab, fy, data) values
('itgcc','gccs','2026-27','{"name":"Ebay","type":"GCC — New","cluster":"Bengaluru","stage":"Grounded","notes":"Landed Q1 FY26-27"}'),
('itgcc','gccs','2026-27','{"name":"Pega","type":"GCC — New","cluster":"Bengaluru","stage":"Grounded","notes":"Landed Q1 FY26-27"}'),
('itgcc','gccs','2026-27','{"name":"Netsmart","type":"GCC — New","cluster":"Bengaluru","stage":"Grounded","notes":"Landed Q1 FY26-27"}'),
('itgcc','gccs','2026-27','{"name":"TRG Screens","type":"GCC — New","cluster":"Bengaluru","stage":"Grounded","notes":"Landed Q1 FY26-27"}'),
('itgcc','gccs','2026-27','{"name":"DSP","type":"GCC — New","cluster":"Bengaluru","stage":"Grounded","notes":"Landed Q1 FY26-27"}'),
('itgcc','gccs','2026-27','{"name":"Deep Watch","type":"GCC — New","cluster":"Bengaluru","stage":"Grounded","notes":"Landed Q1 FY26-27"}');

-- ---------- BB pipeline (from the Pipeline deck: 20 companies, ₹540Cr ESDM, 1,565 jobs, 490 MW) ----------
insert into records (vertical, tab, fy, data) values
-- Mysuru — ESDM
('esdm','investments','2026-27','{"name":"BPL","segment":"EMS","cluster":"Mysuru","stage":"Hot","value":450,"notes":"BB pipeline — Mysuru"}'),
('esdm','investments','2026-27','{"name":"AWSL","segment":"Components","cluster":"Mysuru","stage":"Hot","value":90,"notes":"BB pipeline — Mysuru"}'),
('esdm','investments','2026-27','{"name":"Quarcs","segment":"EMS","cluster":"Mysuru","stage":"Warm","jobs":500,"notes":"BB pipeline — Mysuru"}'),
('esdm','investments','2026-27','{"name":"AccuMed","segment":"Other","cluster":"Mysuru","stage":"Warm","jobs":100,"notes":"BB pipeline — Mysuru"}'),
-- Mysuru — IT
('itgcc','gccs','2026-27','{"name":"3M","type":"IT/ITeS","cluster":"Mysuru","stage":"Engaged","jobs":250,"notes":"BB pipeline"}'),
('itgcc','gccs','2026-27','{"name":"JSSRIT","type":"IT/ITeS","cluster":"Mysuru","stage":"Engaged","jobs":50,"notes":"BB pipeline"}'),
('itgcc','gccs','2026-27','{"name":"Datacorp","type":"IT/ITeS","cluster":"Mysuru","stage":"Engaged","jobs":200,"contact_name":"Anita Anthony","contact_email":"anitaa2005@gmail.com","contact_phone":"8904404708","notes":"BB pipeline"}'),
-- Mangaluru
('itgcc','gccs','2026-27','{"name":"Consilio","type":"GCC — New","cluster":"Mangaluru","stage":"Engaged","jobs":100,"notes":"BB pipeline"}'),
-- Kalaburagi — IT
('itgcc','gccs','2026-27','{"name":"Bits and Bytes","type":"IT/ITeS","cluster":"Kalaburagi","stage":"Engaged","jobs":10,"notes":"BB pipeline"}'),
('itgcc','gccs','2026-27','{"name":"Mysira Labs","type":"IT/ITeS","cluster":"Kalaburagi","stage":"Engaged","jobs":10,"notes":"BB pipeline"}'),
('itgcc','gccs','2026-27','{"name":"RVR Innovation","type":"IT/ITeS","cluster":"Kalaburagi","stage":"Engaged","jobs":10,"notes":"BB pipeline"}'),
('itgcc','gccs','2026-27','{"name":"DEFSEC Systems","type":"IT/ITeS","cluster":"Kalaburagi","stage":"Engaged","jobs":10,"notes":"BB pipeline"}'),
-- HDB
('itgcc','gccs','2026-27','{"name":"JSW Group","type":"GCC — New","cluster":"Hubballi-Dharwad-Belagavi","stage":"Engaged","jobs":200,"contact_name":"Amol","notes":"BB pipeline — proposed OneHubli techpark"}'),
('itgcc','gccs','2026-27','{"name":"Writer Group","type":"IT/ITeS","cluster":"Hubballi-Dharwad-Belagavi","stage":"Engaged","jobs":125,"contact_name":"Senthil M","notes":"BB pipeline — needs Class A building; shared Astra Tower"}'),
-- other tracked pipeline (BB Master Tracker)
('itgcc','gccs','2026-27','{"name":"Mitcon","type":"Other","cluster":"Tumakuru","stage":"Engaged","contact_name":"Ankita Agarwal","contact_designation":"Head — BD & Strategy","contact_email":"ankita.agarwal@mitconindia.com","contact_phone":"9960352150","notes":"Skills Centre + Testing Laboratory; forwarded to C&I Dept"}'),
('itgcc','gccs','2026-27','{"name":"Grassroots Solutions","type":"IT/ITeS","cluster":"Mysuru","stage":"Prospect","jobs":6,"contact_name":"Sudhir Reddy","contact_email":"sudhir@grssl.com","contact_phone":"9845090402","notes":"Interested in a Mysuru unit"}'),
('itgcc','gccs','2026-27','{"name":"iMerit","type":"IT/ITeS","cluster":"Hubballi-Dharwad-Belagavi","stage":"Prospect","jobs":100,"contact_name":"Santosh","notes":"AI data labelling — expansion"}'),
('itgcc','gccs','2026-27','{"name":"MyBranch","type":"IT/ITeS","cluster":"Mangaluru","stage":"Engaged","notes":"7,500 sqft (Mangaluru) + 2,500 sqft (Hospet)"}'),
('sni','startups','2026-27','{"name":"Soul Sara","cluster":"Hubballi-Dharwad-Belagavi","sector":"AI-based mental health","incentive":"No","contact_name":"Deeksha Shukla","notes":"Registering company in Belagavi"}');

-- ---------- Data Centre pipeline (deck + tracker: ~490 MW) ----------
insert into records (vertical, tab, fy, data) values
('itgcc','datacentres','2026-27','{"name":"LoftusLane","stage":"Pipeline","capacity":"200 MW","land":"100 Ac (MLR) + 50 Ac (BLR)","cluster":"Mangaluru","location":"Mangaluru / Bengaluru"}'),
('itgcc','datacentres','2026-27','{"name":"Henox","stage":"MoU","capacity":"100 MW","land":"20 Acres","cluster":"Mangaluru","location":"Mangaluru","notes":"To review the final MoU"}'),
('itgcc','datacentres','2026-27','{"name":"OpenCables","stage":"Pipeline","capacity":"100 MW","land":"20 Acres","cluster":"Mangaluru","location":"Mangaluru"}'),
('itgcc','datacentres','2026-27','{"name":"Cycity International","stage":"Pipeline","capacity":"75 MW","cluster":"Mangaluru","location":"Mangaluru","notes":"From BB pipeline deck"}'),
('itgcc','datacentres','2026-27','{"name":"DataSamudra","stage":"Pipeline","capacity":"10 MW","land":"10 Acres","cluster":"Mangaluru","location":"Mangaluru"}'),
('itgcc','datacentres','2026-27','{"name":"Airtel Nxtra","stage":"Pipeline","capacity":"5 MW","cluster":"Hubballi-Dharwad-Belagavi","location":"HDB","contact_name":"Chetan Sahni","notes":"10 MW expansion discussion started 2/2/26"}'),
('itgcc','datacentres','2026-27','{"name":"iPC","stage":"Pipeline","capacity":"400 MW","land":"1000 Acres","cluster":"Tumakuru","location":"Tumakuru","notes":"DC-1000 / Electrolyzer — BCG review, meeting with C&I"}'),
('itgcc','datacentres','2026-27','{"name":"RackBank","stage":"Pipeline","capacity":"100–200 MW","land":"25 Acres","cluster":"Bengaluru","location":"~100 km from Bengaluru"}'),
('itgcc','datacentres','2026-27','{"name":"Nyobolt","stage":"Pipeline","capacity":"100 MW","land":"120 Acres","cluster":"Bengaluru","location":"~100 km from Bengaluru","notes":"Schedule meeting with Chetan, Venky, Varun"}');

-- ---------- BB — Q1 landed: 16 companies / 1,195 jobs (dummy names, rename in app) ----------
insert into records (vertical, tab, fy, data) values
('itgcc','gccs','2026-27','{"name":"Mysuru Landed Co 1 (rename)","type":"IT/ITeS","cluster":"Mysuru","stage":"Grounded","jobs":600,"notes":"Q1 landed — edit name"}'),
('itgcc','gccs','2026-27','{"name":"Mysuru Landed Co 2 (rename)","type":"IT/ITeS","cluster":"Mysuru","stage":"Grounded","jobs":200,"notes":"Q1 landed — edit name"}'),
('itgcc','gccs','2026-27','{"name":"Mysuru Landed Co 3 (rename)","type":"IT/ITeS","cluster":"Mysuru","stage":"Grounded","jobs":100,"notes":"Q1 landed — edit name"}'),
('itgcc','gccs','2026-27','{"name":"Mysuru Landed Co 4 (rename)","type":"Nano GCC","cluster":"Mysuru","stage":"Grounded","jobs":80,"notes":"Q1 landed — edit name"}'),
('itgcc','gccs','2026-27','{"name":"Mangaluru Landed Co 1 (rename)","type":"IT/ITeS","cluster":"Mangaluru","stage":"Grounded","jobs":10,"notes":"Q1 landed — edit name"}'),
('itgcc','gccs','2026-27','{"name":"Mangaluru Landed Co 2 (rename)","type":"IT/ITeS","cluster":"Mangaluru","stage":"Grounded","jobs":10,"notes":"Q1 landed — edit name"}'),
('itgcc','gccs','2026-27','{"name":"Mangaluru Landed Co 3 (rename)","type":"IT/ITeS","cluster":"Mangaluru","stage":"Grounded","jobs":5,"notes":"Q1 landed — edit name"}'),
('itgcc','gccs','2026-27','{"name":"Mangaluru Landed Co 4 (rename)","type":"Nano GCC","cluster":"Mangaluru","stage":"Grounded","jobs":5,"notes":"Q1 landed — edit name"}'),
('itgcc','gccs','2026-27','{"name":"Mangaluru Landed Co 5 (rename)","type":"Nano GCC","cluster":"Mangaluru","stage":"Grounded","jobs":5,"notes":"Q1 landed — edit name"}'),
('itgcc','gccs','2026-27','{"name":"Mangaluru Landed Co 6 (rename)","type":"Nano GCC","cluster":"Mangaluru","stage":"Grounded","jobs":5,"notes":"Q1 landed — edit name"}'),
('itgcc','gccs','2026-27','{"name":"Kalaburagi Landed Co 1 (rename)","type":"IT/ITeS","cluster":"Kalaburagi","stage":"Grounded","jobs":20,"notes":"Q1 landed — edit name"}'),
('itgcc','gccs','2026-27','{"name":"Kalaburagi Landed Co 2 (rename)","type":"IT/ITeS","cluster":"Kalaburagi","stage":"Grounded","jobs":10,"notes":"Q1 landed — edit name"}'),
('itgcc','gccs','2026-27','{"name":"Kalaburagi Landed Co 3 (rename)","type":"Nano GCC","cluster":"Kalaburagi","stage":"Grounded","jobs":10,"notes":"Q1 landed — edit name"}'),
('itgcc','gccs','2026-27','{"name":"Kalaburagi Landed Co 4 (rename)","type":"Nano GCC","cluster":"Kalaburagi","stage":"Grounded","jobs":10,"notes":"Q1 landed — edit name"}'),
('itgcc','gccs','2026-27','{"name":"HDB Landed Co 1 (rename)","type":"IT/ITeS","cluster":"Hubballi-Dharwad-Belagavi","stage":"Grounded","jobs":75,"notes":"Q1 landed — edit name"}'),
('itgcc','gccs','2026-27','{"name":"HDB Landed Co 2 (rename)","type":"IT/ITeS","cluster":"Hubballi-Dharwad-Belagavi","stage":"Grounded","jobs":50,"notes":"Q1 landed — edit name"}');

-- ---------- ESDM — FY 2026-27 Q1: ₹1,850 Cr closed / 1,100 jobs ----------
insert into records (vertical, tab, fy, data) values
('esdm','investments','2026-27','{"name":"Wipro","segment":"Laminates","stage":"Closed","value":1350,"jobs":600,"notes":"Q1 closed"}'),
('esdm','investments','2026-27','{"name":"Lion Circuits","segment":"PCB / HDI","stage":"Closed","value":350,"jobs":400,"notes":"Q1 closed"}'),
('esdm','investments','2026-27','{"name":"Avalon","segment":"EMS","stage":"Closed","value":150,"jobs":100,"notes":"Q1 closed"}'),
-- Live pipeline: 8+ companies, ₹3,350 Cr
('esdm','investments','2026-27','{"name":"Millennium Semiconductors","segment":"Components","stage":"Hot","value":800}'),
('esdm','investments','2026-27','{"name":"BRAVE","segment":"EMS","stage":"Hot","value":400}'),
('esdm','investments','2026-27','{"name":"AWSL (state pipeline)","segment":"Components","stage":"Hot","value":300}'),
('esdm','investments','2026-27','{"name":"Avalon Technologies","segment":"EMS","stage":"Hot","value":350}'),
('esdm','investments','2026-27','{"name":"Elleve Solutions","segment":"Other","stage":"Hot","value":250}'),
('esdm','investments','2026-27','{"name":"Elmeasure","segment":"Components","stage":"Hot","value":250}'),
('esdm','investments','2026-27','{"name":"Alkem / Enzyne","segment":"Components","stage":"Hot","value":350}'),
('esdm','investments','2026-27','{"name":"Sumnan Chemicals","segment":"Other","stage":"Hot","value":250}'),
('esdm','investments','2026-27','{"name":"Chip Prime Semiconductor","segment":"Fabless","stage":"Hot","value":400}');

-- ESDM — FY 2025-26 history (fact sheet)
insert into records (vertical, tab, fy, data) values
('esdm','investments','2025-26','{"name":"Wipro Laminates","segment":"Laminates","stage":"Closed","value":479,"jobs":370,"cluster":"Bengaluru"}'),
('esdm','investments','2025-26','{"name":"Vayu","segment":"EMS","stage":"Closed","value":1250,"jobs":1050,"notes":"Chamarajanagar — BB strategy"}'),
('esdm','investments','2025-26','{"name":"MiniMines","segment":"Battery","stage":"Closed","value":350,"jobs":800}'),
('esdm','investments','2025-26','{"name":"Aequs","segment":"EMS","stage":"Closed","value":350,"jobs":700,"cluster":"Hubballi-Dharwad-Belagavi"}'),
('esdm','investments','2025-26','{"name":"Tsuyo","segment":"EV","stage":"Closed","value":250,"jobs":500,"cluster":"Hubballi-Dharwad-Belagavi"}'),
('esdm','investments','2025-26','{"name":"MicroVia","segment":"PCB / HDI","stage":"Pipeline","value":1000,"jobs":700,"cluster":"Tumakuru"}');

-- ESDM roadshows (Q1: Netherlands done; Japan & South Korea Aug)
insert into records (vertical, tab, fy, data) values
('esdm','roadshows','2026-27','{"name":"Netherlands Roadshow","geography":"Netherlands","date":"2026-06-15","status":"Done","notes":"Completed June 2026"}'),
('esdm','roadshows','2026-27','{"name":"Japan Roadshow","geography":"Japan","date":"2026-08-10","status":"Planned"}'),
('esdm','roadshows','2026-27','{"name":"South Korea Roadshow","geography":"South Korea","date":"2026-08-20","status":"Planned"}'),
('esdm','roadshows','2026-27','{"name":"Taiwan Roadshow","geography":"Taiwan","status":"Planned"}'),
('esdm','roadshows','2026-27','{"name":"US Roadshow","geography":"United States","status":"Planned"}'),
('itgcc','roadshows','2026-27','{"name":"Chennai Roadshow","geography":"Tamil Nadu, India","status":"Done","notes":"Q1 — domestic"}');

-- ESDM policy strategy — companies to bring to K-ESDM benefits
insert into records (vertical, tab, fy, data) values
('esdm','polstrategy','2026-27','{"name":"Tata Technologies","policy":"ESDM Policy","status":"Open","next_action":"Support K-ESDM application"}'),
('esdm','polstrategy','2026-27','{"name":"Schneider","policy":"ESDM Policy","status":"Open","next_action":"Support K-ESDM application"}'),
('esdm','polstrategy','2026-27','{"name":"Kaynes","policy":"ESDM Policy","status":"Open","next_action":"Support K-ESDM application"}'),
('esdm','polstrategy','2026-27','{"name":"Aequs","policy":"ESDM Policy","status":"Open","next_action":"Support K-ESDM application"}'),
('esdm','polstrategy','2026-27','{"name":"Siemens Healthineers","policy":"ESDM Policy","status":"Open","next_action":"Support K-ESDM application"}'),
('esdm','polstrategy','2026-27','{"name":"IFB","policy":"ESDM Policy","status":"Open","next_action":"Support K-ESDM application"}'),
('esdm','polstrategy','2026-27','{"name":"INOX","policy":"ESDM Policy","status":"Open","next_action":"Support K-ESDM application"}'),
('esdm','polstrategy','2026-27','{"name":"Silcarb","policy":"ESDM Policy","status":"Applied","next_action":"Track with Department","notes":"Sent to Department in Q1"}');

-- ---------- Policy awareness sessions — Q1: 17 (named where known, rest rename) ----------
insert into records (vertical, tab, fy, data) values
('sni','awareness','2026-27','{"name":"DPIIT Tejas Workshop — Raichur","date":"2026-04-01","cluster":"Kalaburagi","venue":"Raichur","companies":600,"notes":"600+ participants"}'),
('sni','awareness','2026-27','{"name":"TiECon Mysuru — policy session","date":"2026-04-16","cluster":"Mysuru","companies":50}'),
('sni','awareness','2026-27','{"name":"Vertex CXO Conclave — Mangaluru","date":"2026-04-24","cluster":"Mangaluru","companies":100,"notes":"100+ delegates"}'),
('sni','awareness','2026-27','{"name":"E Summit 2026 — Belagavi","date":"2026-04-28","cluster":"Hubballi-Dharwad-Belagavi"}'),
('sni','awareness','2026-27','{"name":"Policy Awareness Session — Kalaburagi","date":"2026-05-05","cluster":"Kalaburagi"}'),
('sni','awareness','2026-27','{"name":"Mundhe Banni Meetup — Mysuru","date":"2026-06-06","cluster":"Mysuru"}'),
('bb','awareness','2026-27','{"name":"Awareness session KBG #3 (rename)","cluster":"Kalaburagi","notes":"Q1 — edit details"}'),
('bb','awareness','2026-27','{"name":"Awareness session KBG #4 (rename)","cluster":"Kalaburagi","notes":"Q1 — edit details"}'),
('bb','awareness','2026-27','{"name":"Awareness session KBG #5 (rename)","cluster":"Kalaburagi","notes":"Q1 — edit details"}'),
('bb','awareness','2026-27','{"name":"Awareness session KBG #6 (rename)","cluster":"Kalaburagi","notes":"Q1 — edit details"}'),
('bb','awareness','2026-27','{"name":"Awareness session KBG #7 (rename)","cluster":"Kalaburagi","notes":"Q1 — edit details"}'),
('bb','awareness','2026-27','{"name":"Awareness session KBG #8 (rename)","cluster":"Kalaburagi","notes":"Q1 — edit details"}'),
('bb','awareness','2026-27','{"name":"Awareness session KBG #9 (rename)","cluster":"Kalaburagi","notes":"Q1 — edit details"}'),
('bb','awareness','2026-27','{"name":"Awareness session MLR #2 (rename)","cluster":"Mangaluru","notes":"Q1 — edit details"}'),
('bb','awareness','2026-27','{"name":"Awareness session MLR #3 (rename)","cluster":"Mangaluru","notes":"Q1 — edit details"}'),
('bb','awareness','2026-27','{"name":"Awareness session MLR #4 (rename)","cluster":"Mangaluru","notes":"Q1 — edit details"}'),
('bb','awareness','2026-27','{"name":"Awareness session HDB #2 (rename)","cluster":"Hubballi-Dharwad-Belagavi","notes":"Q1 — edit details"}');

-- ---------- Talent — NIPUNA Q1: 4 proposals executed (4,000 students) + 12 in pipeline (7k) ----------
insert into records (vertical, tab, fy, data) values
('talent','programs','2026-27','{"name":"ASIECT","scheme":"NIPUNA","trained":1000,"status":"In progress","notes":"Q1 executed proposal"}'),
('talent','programs','2026-27','{"name":"ICT Academy","scheme":"NIPUNA","trained":1000,"status":"In progress","notes":"Q1 executed proposal"}'),
('talent','programs','2026-27','{"name":"FUEL","scheme":"NIPUNA","trained":1000,"status":"In progress","notes":"Q1 executed proposal"}'),
('talent','programs','2026-27','{"name":"ARWS","scheme":"NIPUNA","trained":1000,"status":"In progress","notes":"Q1 executed proposal"}'),
('talent','programs','2026-27','{"name":"Deshpande Educational Trust","scheme":"NIPUNA","status":"Not started","notes":"Pipeline proposal — presented to Hon. Minister (7k students across 12 proposals)"}'),
('talent','programs','2026-27','{"name":"Leam (JRSPF)","scheme":"NIPUNA","status":"Not started","notes":"Pipeline proposal"}'),
('talent','programs','2026-27','{"name":"OneDream VisionAstra","scheme":"NIPUNA","status":"Not started","notes":"Pipeline proposal"}'),
('talent','programs','2026-27','{"name":"MEAI (CRE8 Karnataka)","scheme":"NIPUNA","status":"Not started","notes":"Pipeline proposal"}'),
('talent','programs','2026-27','{"name":"Edunet","scheme":"NIPUNA","status":"Not started","notes":"Pipeline proposal"}'),
('talent','programs','2026-27','{"name":"MITCON Consultancy","scheme":"NIPUNA","status":"Not started","notes":"Pipeline proposal"}'),
('talent','programs','2026-27','{"name":"Sona Star Innovations","scheme":"NIPUNA","status":"Not started","notes":"Pipeline proposal"}'),
('talent','programs','2026-27','{"name":"SSAHE","scheme":"NIPUNA","status":"Not started","notes":"Pipeline proposal"}'),
('talent','programs','2026-27','{"name":"VedAtma Trust","scheme":"NIPUNA","status":"Not started","notes":"Pipeline proposal"}'),
('talent','programs','2026-27','{"name":"Syngene International","scheme":"NIPUNA","status":"Not started","notes":"Pipeline proposal"}'),
('talent','programs','2026-27','{"name":"Biocon Academy","scheme":"NIPUNA","status":"Not started","notes":"Pipeline proposal"}'),
('talent','programs','2026-27','{"name":"Cultus (Consolidated)","scheme":"NIPUNA","status":"Not started","notes":"Pipeline proposal"}');

-- ---------- Marketing — digital (Q1 actuals) & media ----------
insert into records (vertical, tab, fy, data) values
('mkt','digital','2026-27','{"platform":"LinkedIn","metric":"Followers","value":36332,"as_of":"2026-06-30","notes":"Target 40,000 (base 32,000)"}'),
('mkt','digital','2026-27','{"platform":"Instagram","metric":"Followers","value":100,"as_of":"2026-06-30","notes":"New channel — target 1,500"}'),
('mkt','digital','2026-27','{"platform":"YouTube","metric":"Subscribers","value":570,"as_of":"2026-06-30","notes":"Target 1,200"}'),
('mkt','digital','2026-27','{"platform":"Other","metric":"Followers","value":740,"as_of":"2026-06-30","notes":"Facebook — target 1,400"}'),
('mkt','media','2026-27','{"item":"Q1 media exposures (31)","kind":"Coverage","date":"2026-06-30","notes":"Hosted 6 · Partnered 67 · Roundtable 1 · Industry story 1"}'),
('mkt','media','2026-27','{"item":"Newsletters published (5)","kind":"Press release","date":"2026-06-30","notes":"2 Startup & Innovation, 3 Marketing"}'),
('mkt','media','2026-27','{"item":"Video testimonial — Venkatesh, VergeCloud","kind":"Coverage","date":"2026-06-15"}');

-- ---------- Proposals & initiatives (Q1 status) ----------
insert into records (vertical, tab, fy, data) values
('itgcc','proposals','2026-27','{"title":"Legends & Legacies — GCC Report","category":"Report","status":"In execution","submitted_to":"KDEM Internal","steps":[]}'),
('itgcc','proposals','2026-27','{"title":"Karnataka GCC Landscape Report","category":"Report","status":"In execution","submitted_to":"KDEM Internal","steps":[]}'),
('itgcc','proposals','2026-27','{"title":"Samco AI Government Report","category":"Report","status":"In execution","submitted_to":"GoK","steps":[]}'),
('itgcc','proposals','2026-27','{"title":"Gaming CoE Karnataka","category":"CoE","status":"In execution","submitted_to":"ITBT Department","summary":"Support Dept in setup + Global Gaming Events","steps":[]}'),
('esdm','proposals','2026-27','{"title":"Karnataka ESDM Landscape 2026 Report","category":"Report","status":"In execution","submitted_to":"KDEM Internal","summary":"Vendor finalised by Jun 30; release at BTS","steps":[]}'),
('esdm','proposals','2026-27','{"title":"Drone Testing Facility — with DFI","category":"Infrastructure","status":"In execution","submitted_to":"GoK","summary":"Land identified in Chintamani; comfort letter to DFI for AAI/DGCA; budget with FD","steps":[]}'),
('esdm','proposals','2026-27','{"title":"EV Testing Facility & EV City","category":"Infrastructure","status":"In execution","submitted_to":"GoK","steps":[]}'),
('esdm','proposals','2026-27','{"title":"Lahari Expansion (₹100 Cr)","category":"Infrastructure","status":"In execution","submitted_to":"GoK","summary":"₹80 Cr GoI + ₹15 Cr GoK + ₹5 Cr own; letter of support issued","steps":[]}'),
('sni','proposals','2026-27','{"title":"Startup Dashboard (real-time)","category":"Program","status":"In execution","submitted_to":"KDEM Internal","summary":"Wireframes done; UI development underway; review with VG Co-Chair","steps":[]}'),
('sni','proposals','2026-27','{"title":"K-Combinator — TiE Mangaluru","category":"Program","status":"Under review","submitted_to":"KDEM Internal","summary":"MoA signing in progress","steps":[]}'),
('sni','proposals','2026-27','{"title":"Startup Genome (GSER) engagement","category":"Report","status":"In execution","submitted_to":"KITS","summary":"MoU signed; GSER 2026 PR planned","steps":[]}'),
('sni','proposals','2026-27','{"title":"Karnataka Innovation Reports + Incubator Compendium","category":"Report","status":"Drafting","submitted_to":"KDEM Internal","steps":[]}'),
('talent','proposals','2026-27','{"title":"Karnataka Talent Landscape Report 2026","category":"Report","status":"Approved","submitted_to":"KDEM Internal","summary":"Prepared — Q1","steps":[]}'),
('talent','proposals','2026-27','{"title":"Karnataka Skills Intelligence & Strategy Unit","category":"Program","status":"In execution","submitted_to":"GoK","steps":[]}'),
('talent','proposals','2026-27','{"title":"Women@Work (Maya)","category":"Program","status":"Under review","submitted_to":"GoK","summary":"Approval awaited from HE Dept","steps":[]}'),
('bb','proposals','2026-27','{"title":"Cluster Talent & Employability Reports (3)","category":"Report","status":"In execution","submitted_to":"KDEM Internal","summary":"Launch during Pre-BTS events","steps":[]}'),
('bb','proposals','2026-27','{"title":"Mysuru AI City","category":"Infrastructure","status":"Drafting","submitted_to":"KITS","cluster":"Mysuru","steps":[]}'),
('bb','proposals','2026-27','{"title":"Mangaluru DC Park","category":"Infrastructure","status":"Drafting","submitted_to":"KITS","cluster":"Mangaluru","steps":[]}'),
('bb','proposals','2026-27','{"title":"Kalaburagi Innovation Centre (LEAP) + AgriTech CoE","category":"CoE","status":"Submitted to KITS","submitted_to":"ITBT Department","cluster":"Kalaburagi","steps":[]}'),
('bb','proposals','2026-27','{"title":"Step-by-step policy registration guides","category":"Program","status":"In execution","submitted_to":"KITS","steps":[]}'),
('mkt','proposals','2026-27','{"title":"BTS 2026 — Future Makers Conclave plan","category":"Event","status":"Drafting","submitted_to":"KDEM Internal","steps":[]}');

-- ---------- Per-vertical Databases ----------
insert into records (vertical, tab, fy, data) values
('itgcc','db_companies','2026-27','{"name":"Grassroots Solutions","cluster":"Mysuru","status":"Pipeline","sector":"Manufacturing / GCC","contact_name":"Sudhir Reddy","contact_email":"sudhir@grssl.com","contact_phone":"9845090402"}'),
('itgcc','db_companies','2026-27','{"name":"Data Corp","cluster":"Mysuru","status":"Pipeline","sector":"IT/ITeS","contact_name":"Anita Anthony","contact_designation":"HR Head","contact_email":"anitaa2005@gmail.com","contact_phone":"8904404708"}'),
('itgcc','db_companies','2026-27','{"name":"LoftusLane","cluster":"Mangaluru","status":"Pipeline","sector":"Data Centre"}'),
('itgcc','db_companies','2026-27','{"name":"Airtel Nxtra","cluster":"Hubballi-Dharwad-Belagavi","status":"Pipeline","sector":"Data Centre","contact_name":"Chetan Sahni"}'),
('esdm','db_companies','2026-27','{"name":"Wipro","status":"Active in Karnataka","sector":"Laminates / PCB"}'),
('esdm','db_companies','2026-27','{"name":"Lion Circuits","status":"Active in Karnataka","sector":"PCB"}'),
('sni','db_companies','2026-27','{"name":"Yappes Technologies","cluster":"Mysuru","status":"Prospect","sector":"Tech","contact_name":"Bhanu Jain"}'),
('sni','db_companies','2026-27','{"name":"Foliages","cluster":"Mangaluru","status":"Prospect","sector":"Startup","contact_name":"Reyo Augustine","contact_phone":"+91 96561 29812"}'),
('bb','db_companies','2026-27','{"name":"Mitcon","cluster":"Tumakuru","status":"Pipeline","sector":"Skills & testing labs","contact_name":"Ankita Agarwal","contact_email":"ankita.agarwal@mitconindia.com","contact_phone":"9960352150"}'),
('bb','db_people','2026-27','{"name":"Ankita Agarwal","company":"Mitcon","designation":"Head — BD & Strategy","cluster":"Tumakuru","context":"BB enquiry","contact_email":"ankita.agarwal@mitconindia.com","contact_phone":"9960352150"}'),
('bb','db_people','2026-27','{"name":"Sudhir Reddy","company":"Grassroots Solutions","designation":"Business Partner","cluster":"Mysuru","context":"BB enquiry","contact_email":"sudhir@grssl.com","contact_phone":"9845090402"}'),
('bb','db_people','2026-27','{"name":"Girish Vijayapura","company":"Innovai Solutions","designation":"Director","cluster":"Hubballi-Dharwad-Belagavi","context":"90-day AI pilot proposal","contact_email":"girishvv123@gmail.com"}'),
('bb','db_people','2026-27','{"name":"Chetan Sahni","company":"Airtel Nxtra","designation":"","cluster":"Hubballi-Dharwad-Belagavi","context":"DC expansion discussion 2/2/26"}');

-- ---------- Events: 6 Pre-BTS (real names/dates) + globals + Q1 done ----------
delete from events;
insert into events (name, vertical, type, cluster, date, end_date, location, status, fy) values
('Mysuru Big Tech Show', 'mkt', 'Pre-BTS Cluster', 'Mysuru', '2026-07-22', '2026-07-23', 'Mysuru', 'confirmed', '2026-27'),
('Kalaburagi Techxplore', 'mkt', 'Pre-BTS Cluster', 'Kalaburagi', '2026-08-05', '2026-08-06', 'Kalaburagi', 'planned', '2026-27'),
('HDB Techceleration', 'mkt', 'Pre-BTS Cluster', 'Hubballi-Dharwad-Belagavi', '2026-08-19', '2026-08-20', 'Hubballi', 'planned', '2026-27'),
('Tumakuru Techpulse', 'mkt', 'Pre-BTS Cluster', 'Tumakuru', '2026-09-09', '2026-09-10', 'Tumakuru', 'planned', '2026-27'),
('Mangaluru Technovanza', 'mkt', 'Pre-BTS Cluster', 'Mangaluru', '2026-09-22', '2026-09-23', 'Mangaluru', 'planned', '2026-27'),
('Shivamogga Tech Rise', 'mkt', 'Pre-BTS Cluster', 'Shivamogga', '2026-10-07', '2026-10-08', 'Shivamogga', 'planned', '2026-27'),
('C2C Engagement', 'mkt', 'Domestic', null, '2026-05-12', null, 'Bengaluru', 'done', '2026-27'),
('World FinTech Summit', 'mkt', 'International', null, '2026-05-20', null, 'Bengaluru', 'done', '2026-27'),
('ESDM Industry Roundtable — Bengaluru', 'esdm', 'Domestic', null, '2026-07-15', null, 'Bengaluru', 'confirmed', '2026-27'),
('Beyond Bengaluru BLUE — Mysuru', 'sni', 'Domestic', 'Mysuru', '2026-07-22', null, 'STPI, Mysuru', 'confirmed', '2026-27'),
('Global Fintech Festival', 'mkt', 'Domestic', null, '2026-09-15', null, 'Mumbai', 'planned', '2026-27'),
('Bengaluru Skill Summit', 'mkt', 'Summit', null, '2026-11-04', null, 'Bengaluru', 'planned', '2026-27'),
('Bengaluru Tech Summit (BTS)', 'mkt', 'Summit', null, '2026-11-18', '2026-11-20', 'BIEC, Bengaluru', 'planned', '2026-27');

-- ---------- Live cluster tasks (from tracker) ----------
insert into tasks (title, vertical, cluster, priority, status, visibility) values
('Step-by-step policy registration guides — KITS','bb',null,'high','inprogress','vertical'),
('GCC combined launch event — invite Anchors, Secretary, Chairman, CEO','bb','Mysuru','high','inprogress','vertical'),
('District Digital Committee — concept note','bb','Mysuru','high','inprogress','vertical'),
('Techceleration agenda — date change follow-up','bb','Hubballi-Dharwad-Belagavi','medium','inprogress','vertical'),
('Cluster Seed Fund — follow up','bb','Hubballi-Dharwad-Belagavi','medium','todo','vertical'),
('AVGC CoE — spoke model with ABAI','bb','Mangaluru','medium','todo','vertical'),
('DC Park — follow up','bb','Mangaluru','high','inprogress','vertical'),
('Finalize KDEM office space at DC Office','bb','Kalaburagi','medium','todo','vertical'),
('ELEVATE applications close 4 July — push outreach','sni',null,'high','inprogress','vertical'),
('K-Combinator MoA — TiE Mangaluru signing','sni',null,'medium','inprogress','vertical');
