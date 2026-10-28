-- ============================================================
-- Beyond Bengaluru — short task titles and expansion defaults.
-- Run once in the SQL Editor (safe to re-run). Updates in place, so
-- status, due dates and any edits your team made are kept.
-- ============================================================
begin;

-- Tasks: short title in the name column, the full description in Notes
update tasks set title = 'JSS Talent Pipeline', notes = 'Talent — aligning JSS academic talent pipelines with NIPUNA programs to attract target companies and GCCs to Mysuru.' where vertical = 'bb' and title = 'Align JSS academic talent pipelines with NIPUNA to attract target companies and GCCs';
update tasks set title = 'KSDC Skill Requirements', notes = 'Talent — ongoing meetings with KSDC on regional skill requirements.' where vertical = 'bb' and title = 'Ongoing meetings with KSDC on regional skill requirements';
update tasks set title = 'Mysuru Talent & Job Portal', notes = 'Talent — coordinating with Johnson Tellis to develop a cluster-specific talent and dedicated job portal; discussions underway.' where vertical = 'bb' and title = 'Cluster talent & job portal with Johnson Tellis';
update tasks set title = 'EMC Cluster (Bhavya Scheme)', notes = 'ESDM — ongoing discussions with Aequs and Kaynes Technology on developing the EMC Cluster under the Bhavya Scheme.' where vertical = 'bb' and title = 'EMC Cluster under Bhavya Scheme — discussions with Aequs and Kaynes Technology';
update tasks set title = 'Kaynes Semiconductor Facility', notes = 'ESDM — coordinating closely with Shri Atheeq''s office on the ₹5,000 Cr proposal for Kaynes'' semiconductor assembly facility in Kochanahalli.' where vertical = 'bb' and title = 'Kaynes ₹5,000 Cr semiconductor assembly facility, Kochanahalli — coordinate with Shri Atheeq''s office';
update tasks set title = 'KAN Cohort 2 Launch', notes = 'Startups — facilitating the KAN Cohort 2 launch in Mysuru on 29 October.' where vertical = 'bb' and title = 'KAN Cohort 2 launch in Mysuru';
update tasks set title = 'Wadhwani Growth Program', notes = 'Startups — rollout of the joint Wadhwani Foundation & KDEM growth program: tailored professional and business assistance to help Mysuru startups and MSMEs scale.' where vertical = 'bb' and title = 'Wadhwani Foundation & KDEM growth program for Mysuru startups and MSMEs — rollout';
update tasks set title = 'Mysuru GTC Onboarding', notes = 'Global Technology Centre — active client onboarding underway; facilitating the operational handover from KRIDL.' where vertical = 'bb' and title = 'GTC — client onboarding and operational handover from KRIDL';
update tasks set title = 'Host the French Minister', notes = 'Engagements — hosting the visit of the French Minister on 16 November.' where vertical = 'bb' and title = 'Host the French Minister''s visit';
update tasks set title = 'Berlin Delegation', notes = 'Engagements — international delegation visit from Berlin, scheduled for 20 November.' where vertical = 'bb' and title = 'Host international delegations from Berlin and Italy';
update tasks set title = 'DC CoE with NITK', notes = 'Data centre & subsea — finalising the operational framework and proposal with NITK Surathkal for the DC CoE; in the final stage.' where vertical = 'bb' and title = 'DC CoE with NITK Surathkal — finalise operational framework and proposal';
update tasks set title = 'LoftusLane & OpenCables Set-up', notes = 'Data centre & subsea — assisting LoftusLane and OpenCables with ground set-up and regulatory clearances for their upcoming data centre and Cable Landing Station facilities.' where vertical = 'bb' and title = 'LoftusLane and OpenCables — ground set-up and regulatory clearances for DC and CLS';
update tasks set title = 'Henox CLS MoU', notes = 'Data centre & subsea — coordinating with Henox to establish a subsea Cable Landing Station; MoU signing targeted for 12 November.' where vertical = 'bb' and title = 'Henox subsea Cable Landing Station — MoU signing';
update tasks set title = 'DC Land Identification', notes = 'Data centre & subsea — land identification drives with the district administration to allocate parcels for prospective data centres.' where vertical = 'bb' and title = 'Land identification for data centres with the district administration';
update tasks set title = 'Data Centre Pipelines', notes = 'Data centre & subsea — building and driving a project pipeline to attract global data centre operators to the cluster.' where vertical = 'bb' and title = 'Build the pipeline of global data centre operators';
update tasks set title = 'NTT Expansion Facilitation', notes = 'GCC & infra — assisting NTT with government clearances and infrastructure for its 2,500-seat facility launching next year.' where vertical = 'bb' and title = 'NTT 2,500-seat facility — government clearances and infrastructure';
update tasks set title = 'WrkWrk Incentives', notes = 'GCC & infra — working with KITS to secure and disburse eligible policy incentives for the WrkWrk co-working space.' where vertical = 'bb' and title = 'WrkWrk co-working — secure and disburse policy incentives with KITS';
update tasks set title = 'ECM Equipment Lab', notes = 'Hardware & AI ecosystem — supporting the new TiE Mangaluru Hardware SIG and Yenepoya TBI 2.0 to set up an ECM equipment lab.' where vertical = 'bb' and title = 'ECM equipment lab with TiE Mangaluru Hardware SIG and Yenepoya TBI 2.0';
update tasks set title = 'TiE Mangaluru AI SIG', notes = 'Hardware & AI ecosystem — partnering with TiE Mangaluru to launch an AI Special Interest Group liaising directly with the ACSEL CoE for AI.' where vertical = 'bb' and title = 'Launch TiE Mangaluru AI SIG linked to the ACSEL AI CoE';
update tasks set title = 'NIPUNA Approvals', notes = 'Talent — final approvals in progress for the ACS NIPUNA and Deshpande Skills proposals in Hubballi.' where vertical = 'bb' and title = 'NIPUNA — final approvals for ACS and Deshpande Skills proposals, Hubballi';
update tasks set title = 'P.C. Jabin College Tie-up', notes = 'Talent — strategic tie-up with P.C. Jabin Science College, Hubballi, to onboard BCA/MCA students for industry projects and policy orientation.' where vertical = 'bb' and title = 'Tie-up with P.C. Jabin Science College for BCA/MCA industry projects';
update tasks set title = 'AI Skills MoU', notes = 'Talent — tripartite MoU between IBMR, WinGrox AI and Think-N-Innovate (Dubai) in Hubballi to build AI skills across students and faculty.' where vertical = 'bb' and title = 'Tripartite MoU: IBMR, WinGrox AI and Think-N-Innovate (Dubai) for AI skills';
update tasks set title = 'Robotics CoE Belagavi', notes = 'Startups — civil work at Maratha Mandal 70% complete; targeting operational readiness and inauguration by December 2026.' where vertical = 'bb' and title = 'Robotics CoE, Belagavi (Maratha Mandal) — complete civil work and inaugurate';
update tasks set title = 'VTU VRIF TBI Inauguration', notes = 'Startups — VTU VRIF Technology Business Incubator in Belagavi inaugurated, with 10 startups onboarded.' where vertical = 'bb' and title = 'VTU VRIF TBI, Belagavi — inaugurated with 10 startups';
update tasks set title = 'CTIE Incubator Review', notes = 'Startups — second TBI/CoE alignment meeting at CTIE Hubballi to define the roadmap for local incubators.' where vertical = 'bb' and title = 'CTIE Hubballi — second TBI/CoE alignment meeting and roadmap';
update tasks set title = 'TiE Hubballi MoU', notes = 'Startups — finalising an MoU with TiE Hubballi (pending execution) to anchor regional startup incubation from 1 November 2026.' where vertical = 'bb' and title = 'MoU with TiE Hubballi for regional startup incubation';
update tasks set title = 'WriterGroup Expansion', notes = 'IT/ITeS pipeline — awaiting management approval for WriterGroup''s BPO expansion in Hubballi; iWorks proposal submitted.' where vertical = 'bb' and title = 'WriterGroup BPO expansion, Hubballi — awaiting management approval (iWorks proposal submitted)';
update tasks set title = 'Equilibrium Expansion', notes = 'IT/ITeS pipeline — awaiting clarity on KITS support for Equilibrium''s 50-seat climate tech facility in Hubballi; workspace options shared.' where vertical = 'bb' and title = 'Equilibrium 50-seat climate tech facility — clarity on KITS support';
update tasks set title = 'One Hubli Workspace', notes = 'Infrastructure — third alignment meeting with WrkWrk (Rohith Bhat) to establish the One Hubli Class A commercial workspace.' where vertical = 'bb' and title = 'One Hubli Class A workspace with WrkWrk (Rohith Bhat)';
update tasks set title = 'Patil Builders DPR', notes = 'Infrastructure — awaiting the DPR for Patil Builders'' Class A space while reviewing OPC guideline requirements.' where vertical = 'bb' and title = 'Patil Builders Class A space — DPR awaited; review OPC guidelines';
update tasks set title = 'HDB GTC Sites', notes = 'Infrastructure — GTC sites at VTU Belagavi and IT Hub Hubballi, with KPIs set for high space utilisation.' where vertical = 'bb' and title = 'GTC sites at VTU Belagavi and IT Hub Hubballi — set utilisation KPIs';
update tasks set title = 'BBB Trust Policy Session', notes = 'Engagements — policy awareness session for the newly added BBB Trust (Forum of Business by Brahmins), Hubballi Chapter.' where vertical = 'bb' and title = 'Policy awareness session — BBB Trust Hubballi Chapter';
update tasks set title = 'Bidar CoE Proposal', notes = 'Bidri Centre of Excellence — drafting a proposal to modernise Bidar''s 600-year-old metal craft with modern tech, contemporary design and wider market access.' where vertical = 'bb' and title = 'Bidri CoE, Bidar — draft proposal to modernise the craft with tech, design and market access';
update tasks set title = 'NAIN Startup Shortlist', notes = 'Startups (hackathons) — with VTU''s VRIF, shortlisting 10–15 NAIN startups for incubation, mentorship and ELEVATE funding readiness.' where vertical = 'bb' and title = 'Shortlist 10–15 NAIN startups with VTU VRIF for incubation and ELEVATE readiness';
update tasks set title = 'GN Jebri Foundation', notes = 'Startups (hackathons) — deploying scalable startup tech solutions for district-level administrative challenges with the GN Jebri Foundation.' where vertical = 'bb' and title = 'GN Jebri Foundation — startup tech for district administrative challenges';
update tasks set title = 'Regional Talent Database', notes = 'Talent — cluster-wide assessment of pre-final and final-year engineering students to build a central regional talent database for industry hiring.' where vertical = 'bb' and title = 'Cluster-wide assessment of engineering students for a regional talent database';
update tasks set title = 'Industrial Land Pricing', notes = 'Infrastructure — reviewing land costs with DIC and the district administration to set affordable pricing that attracts industrial investment.' where vertical = 'bb' and title = 'Land pricing with DIC and district administration to attract industry';

-- The Berlin and Italy delegations become two tasks
insert into tasks (title, vertical, cluster, priority, status, due_date, visibility, notes, created_by)
select 'Italy Delegation', 'bb', 'Mysuru', t.priority, t.status, t.due_date, t.visibility,
       'Engagements — international delegation visit from Italy, scheduled for 20 November.', t.created_by
  from tasks t
 where t.vertical = 'bb' and t.title = 'Berlin Delegation'
   and not exists (select 1 from tasks where vertical = 'bb' and title = 'Italy Delegation')
 limit 1;

-- Expansions: empty "KITS registered" and "Incentives applied" become No
update records set data = data || '{"kits":"No"}'
 where vertical = 'itgcc' and tab = 'gccs' and data->>'kind' = 'Expansion'
   and coalesce(data->>'cluster','') = any(bb_clusters()) and coalesce(data->>'kits','') = '';
update records set data = data || '{"incentive":"No"}'
 where vertical = 'itgcc' and tab = 'gccs' and data->>'kind' = 'Expansion'
   and coalesce(data->>'cluster','') = any(bb_clusters()) and coalesce(data->>'incentive','') = '';

commit;
