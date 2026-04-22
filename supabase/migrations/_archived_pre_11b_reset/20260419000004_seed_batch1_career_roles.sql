-- Seed Batch 1 career roles: 39 roles across 6 sectors
-- Sectors: Armed Forces (7), Healthcare & Medicine (7), Education & Teaching (7),
--          Construction & Trades (5), Engineering & Manufacturing (8), Business & Finance (5)
-- Source data: docs/audits/batch1_roles.json

INSERT INTO career_roles (
  career_sector_id, title, soc_code_2020, ai_rating, ai_description,
  is_new_ai_role, growth_outlook,
  salary_entry, salary_experienced, salary_median_scotland,
  salary_entry_uk, salary_median_uk, salary_experienced_uk,
  salary_source, salary_last_updated, salary_needs_verification, salary_notes
) VALUES

-- ============================================================
-- Armed Forces (sector id: 80c3a8db-fd9c-42ec-a717-3df66dff0a4c)
-- ============================================================
(
  '80c3a8db-fd9c-42ec-a717-3df66dff0a4c',
  'Army Officer',
  '1171', 3,
  'AI assists with logistics planning, signal intelligence, tactical simulation, and predictive analytics for battlefield management. Command accountability, leadership of soldiers under pressure, and ethical judgement in operations remain human-led. The role is increasingly technical, with officers supervising autonomous and AI-augmented systems during operations from Army bases in Scotland such as Leuchars and Kinloss.',
  false, 'Stable -- strategic national priority',
  34676, 62405, NULL,
  34676, 48740, 62405,
  'Armed Forces Pay Review Body (AFPRB) 2025/26 pay rates; officer cadet salary at Sandhurst for entry; Major rank (OF-3) at 8 years for experienced',
  '2026-04-18', false,
  'Armed Forces pay is UK-wide with no Scotland variant; AFPRB 2025/26 applied 4.5 percent uplift. Entry reflects the Sandhurst officer cadet rate (GBP 34,676); Second Lieutenant on commissioning earns GBP 41,456. Experienced figure uses Major rank after approximately 8 years. Senior officers (Lieutenant Colonel and above) can exceed GBP 95,000. UK percentiles reflect the AFPRB pay scale rather than ASHE 2025 Table 14, as SOC 1171 is not separately published in ASHE.'
),
(
  '80c3a8db-fd9c-42ec-a717-3df66dff0a4c',
  'Army Soldier',
  '3311', 2,
  'AI handles administrative tasks, scheduling, equipment maintenance logs, and training record management. Core physical readiness, combat skills, and field operations remain entirely human. Scottish regiments and training centres continue to recruit from across Scotland with strong regional ties.',
  false, 'Stable -- essential recruitment priority',
  26334, 39565, NULL,
  26334, 32845, 39565,
  'AFPRB 2025/26 pay rates; Phase 1 training entry rate for soldier (Private); Corporal rank at experienced level',
  '2026-04-18', false,
  'Pay is UK-wide, no Scotland variant. Entry reflects Private (Level 1) post-Phase 1 training at GBP 26,334. Lance Corporal progression GBP 34,083; Corporal GBP 39,565 typically at 4-8 years depending on trade. Specialist pay supplements apply for certain trades (e.g. parachutist pay). Warrant Officer Class 1 can exceed GBP 60,000. UK percentiles derived from AFPRB scale as SOC 3311 combined military/protective services figure in ASHE bundles diverse roles.'
),
(
  '80c3a8db-fd9c-42ec-a717-3df66dff0a4c',
  'Royal Navy Officer',
  '1171', 3,
  'AI increasingly involved in supervising autonomous underwater vehicles (AUVs), electronic warfare systems, and sensor fusion on surface vessels. Command decisions, safety-critical navigation, and leadership of crew remain human. HMNB Clyde at Faslane and Coulport anchor the Royal Navy''s Scottish presence, home to the UK submarine service.',
  false, 'Stable -- strong Scottish regional presence',
  34676, 62405, NULL,
  34676, 48740, 62405,
  'AFPRB 2025/26 pay rates; BRNC Dartmouth officer cadet for entry; Lieutenant Commander rank for experienced',
  '2026-04-18', false,
  'Pay UK-wide, no Scotland variant. Entry is BRNC Dartmouth officer cadet rate (GBP 34,676); Sub-Lieutenant on commissioning GBP 41,456. Submariner pay supplements can add up to GBP 10,690 for those serving on Scotland-based vessels. Captain and above can exceed GBP 122,000. UK percentiles from AFPRB scale.'
),
(
  '80c3a8db-fd9c-42ec-a717-3df66dff0a4c',
  'Royal Navy Rating',
  '3311', 3,
  'AI supports operation of autonomous and semi-autonomous systems, particularly on modern platforms like Type 26 frigates built at BAE Systems Govan. Routine maintenance, ship operations, and damage control remain human-delivered. Submariner roles at Faslane carry specialist pay and training.',
  false, 'Stable -- technical specialisms in demand',
  26344, 40000, NULL,
  26344, 32845, 40000,
  'AFPRB 2025/26; Phase 2 training completion for entry; Petty Officer rank for experienced',
  '2026-04-18', false,
  'Pay UK-wide, no Scotland variant. Entry rate post-Phase 2 training GBP 26,344. Leading Hand around GBP 34,000; Petty Officer GBP 40,000. Submariner supplement up to GBP 10,690 for qualified submarine service. Specialist technical ratings (engineering, weapons engineering, medical) attract additional pay. Warrant Officer Class 1 can exceed GBP 60,000.'
),
(
  '80c3a8db-fd9c-42ec-a717-3df66dff0a4c',
  'RAF Officer',
  '1171', 4,
  'Flight systems and sensor fusion technologies increasingly rely on machine learning for target acquisition and threat assessment. Pilot roles, mission command, and operational leadership remain human. RAF Lossiemouth in Moray is home to Typhoon fast jets and P-8A Poseidon maritime patrol aircraft, central to UK Quick Reaction Alert.',
  false, 'Stable -- technical modernisation underway',
  34676, 62405, NULL,
  34676, 48740, 62405,
  'AFPRB 2025/26; RAF College Cranwell officer cadet for entry; Squadron Leader rank for experienced',
  '2026-04-18', false,
  'Pay UK-wide, no Scotland variant. Entry Cranwell officer cadet rate GBP 34,676; Flying Officer on commissioning GBP 41,456. Flying pay supplements apply for pilots and weapon systems officers. Squadron Leader typical experienced figure around GBP 62,405. Wing Commander and above can exceed GBP 80,000.'
),
(
  '80c3a8db-fd9c-42ec-a717-3df66dff0a4c',
  'RAF Airman / Airwoman',
  '3311', 3,
  'AI diagnostics now provide real-time fault detection for complex aircraft systems including Typhoon and P-8A Poseidon fleets at RAF Lossiemouth. Hands-on maintenance, weapons handling, air traffic control, and specialist technical trades remain human. AI augments rather than replaces the technical work.',
  false, 'Stable -- technical specialisms in demand',
  26334, 40000, NULL,
  26334, 32845, 40000,
  'AFPRB 2025/26; Phase 2 training completion for entry; Sergeant rank for experienced',
  '2026-04-18', false,
  'Pay UK-wide, no Scotland variant. Entry post-Phase 2 training GBP 26,334. Corporal around GBP 34,000; Sergeant around GBP 40,000. Specialist technical trades (aircraft engineering, avionics, intelligence) attract additional pay. Flight Sergeant and Warrant Officer roles can exceed GBP 50,000.'
),
(
  '80c3a8db-fd9c-42ec-a717-3df66dff0a4c',
  'Royal Marines Commando',
  '3311', 2,
  'Elite amphibious infantry role where physical endurance, small-unit tactics, and rapid deployment remain the core work. AI supports planning, logistics, and communications but operational execution is entirely human. Commando-trained specialists supplement pay; deployments span global theatres from Scotland-based naval platforms.',
  false, 'Stable -- elite force maintained',
  26344, 40000, NULL,
  26344, 32845, 40000,
  'AFPRB 2025/26; post-Commando Course for entry; Colour Sergeant for experienced',
  '2026-04-18', false,
  'Pay UK-wide, no Scotland variant. Royal Marines follow Naval Service pay scales with Commando supplements. Entry post-training GBP 26,344 plus Commando pay supplement. Corporal around GBP 34,000; Sergeant/Colour Sergeant around GBP 40,000. Specialist qualifications (mountain leader, swimmer canoeist) attract additional pay. Warrant Officer Class 1 can exceed GBP 60,000.'
),

-- ============================================================
-- Healthcare & Medicine (sector id: 8e706fbe-1f19-4156-80a1-631faf1c211c)
-- ============================================================
(
  '8e706fbe-1f19-4156-80a1-631faf1c211c',
  'Paramedic',
  '2255', 3,
  'AI supports real-time diagnostic decision-making, automated patient record handover, and dispatch optimisation through Scottish Ambulance Service systems. The physical response, emergency clinical judgement, and trauma management remain human. Paramedic practice is a graduate-entry profession in Scotland via Glasgow Caledonian or Robert Gordon.',
  false, 'Growing -- high demand across Scotland',
  33315, 48117, 39959,
  29970, 41200, 48170,
  'NHS Scotland Agenda for Change 2025/26 Band 5 entry for probationer paramedics; Band 6 top-point for experienced (newly qualified paramedics enter at Band 6 in some boards); ONS ASHE 2025 Table 14 SOC 2255 for UK percentiles',
  '2026-04-18', true,
  'NHS Scotland AfC 2025/26 applied 4.4 percent uplift. Entry is Band 5 newly qualified (GBP 33,315) progressing rapidly to Band 6 (GBP 39,959 top-point). Experienced paramedic practitioners at Band 7 (GBP 48,117) in specialist or advanced roles. Scottish Ambulance Service is the single national employer. Entry point varies by Health Board (some enter at Band 5, some at Band 6). Figure should be verified against current SAS recruitment pay bands.'
),
(
  '8e706fbe-1f19-4156-80a1-631faf1c211c',
  'Dietitian',
  '2229', 4,
  'AI handles meal-planning algorithms, automated dietary analysis, and pattern recognition in patient nutrition data. The clinical assessment, behaviour change work, and MDT collaboration remain human-led. Dietitians in Scotland are regulated by the HCPC and work across NHS Scotland, primary care, and public health.',
  false, 'Stable -- regulated profession',
  33315, 41483, NULL,
  28050, 42340, 52809,
  'NHS Scotland AfC 2025/26 Band 5 entry; Band 6 top-point for experienced; ONS ASHE 2025 Table 14 SOC 2229 for UK percentiles',
  '2026-04-18', true,
  'Dietitians coded to SOC 2229 (Therapy professionals n.e.c.) as SOC 2020 does not have a distinct dietitian code. NHS Scotland AfC 2025/26 Band 5 for newly qualified; Band 6 at experienced level. Advanced practice Band 7 or Band 8a in specialist roles (eating disorders, renal, paediatrics) can reach GBP 55,000+. UK ASHE percentiles for SOC 2229 bundle dietitians, nutritionists, acupuncturists, and other therapy professions so are less precise.'
),
(
  '8e706fbe-1f19-4156-80a1-631faf1c211c',
  'Speech and Language Therapist',
  '2223', 4,
  'AI tools analyse speech patterns, support aphasia rehabilitation, and generate personalised communication aids. Assessment, therapeutic relationship-building, and complex case formulation remain human. Scottish SLTs work across NHS Scotland, education, and independent practice; entry via degree programmes at Queen Margaret or Strathclyde.',
  false, 'Stable -- growing need in paediatric and adult services',
  33315, 41483, NULL,
  29550, 41200, 49500,
  'NHS Scotland AfC 2025/26 Band 5 entry; Band 6 top-point for experienced; ONS ASHE 2025 Table 14 SOC 2223 for UK percentiles',
  '2026-04-18', true,
  'NHS Scotland AfC 2025/26 Band 5 for newly qualified (GBP 33,315), progressing to Band 6 (GBP 41,483 top-point). Advanced Specialist and Consultant SLT roles reach Band 8a-8b (GBP 55,000-GBP 73,000+). Regulated by HCPC. Strong demand in Scotland across paediatric, stroke rehabilitation, and neurodiversity services. UK percentiles from ASHE are for SOC 2223 Speech and Language Therapists specifically.'
),
(
  '8e706fbe-1f19-4156-80a1-631faf1c211c',
  'Optometrist',
  '2254', 4,
  'AI retinal image analysis is mainstream in Scottish optometry -- the NeurEYE project led from Edinburgh uses retinal scans to detect early-stage dementia. Clinical examination, patient communication, and diagnostic judgement remain human. Optometrists are a key primary eye care provider under NHS Scotland''s General Ophthalmic Services contract.',
  false, 'Emerging -- AI diagnostics expanding role',
  35500, 58000, 44500,
  32000, 48250, 62000,
  'College of Optometrists salary survey 2024 and NHS Scotland GOS contract data for entry; private practice survey for experienced; ONS ASHE 2025 Table 14 SOC 2254 for UK percentiles',
  '2026-04-18', true,
  'Optometrists in Scotland operate under the NHS General Ophthalmic Services (GOS) contract providing free eye examinations -- unique to Scotland. Entry reflects newly qualified optometrist post-Scheme for Registration. Experienced figure covers senior clinical optometrists including IP (Independent Prescribing) qualified. High-street chains (Specsavers, Vision Express) and independents dominate employment. Practice owners can earn substantially more. College of Optometrists survey data is 2024 -- figures flagged for verification.'
),
(
  '8e706fbe-1f19-4156-80a1-631faf1c211c',
  'Mental Health Nurse',
  '2235', 3,
  'AI supports remote monitoring, crisis prediction, and documentation in mental health settings. The therapeutic relationship, risk assessment, de-escalation, and complex clinical judgement remain fundamentally human. Scotland faces significant mental health workforce shortages; NMC-registered Mental Health Nurses are in sustained demand.',
  false, 'High demand -- persistent workforce shortage',
  33315, 41483, NULL,
  29970, 40120, 47500,
  'NHS Scotland AfC 2025/26 Band 5 entry; Band 6 top-point for experienced; ONS ASHE 2025 Table 14 SOC 2235 for UK percentiles',
  '2026-04-18', false,
  'NHS Scotland AfC 2025/26 Band 5 for newly registered (GBP 33,315); Band 6 top-point (GBP 41,483) at experienced. Specialist Nurse, Charge Nurse, and Advanced Nurse Practitioner roles at Band 7 (GBP 48,000-57,000). NMC registration required; training via Scottish universities (Edinburgh Napier, GCU, Robert Gordon, Stirling, UWS, Dundee, Highlands and Islands). Strong preceptorship support; shortage status means faster progression in some Health Boards.'
),
(
  '8e706fbe-1f19-4156-80a1-631faf1c211c',
  'Veterinary Surgeon',
  '2240', 3,
  'AI is transforming veterinary diagnostics in pathology, imaging interpretation, and triage. Surgical intervention, clinical examination, and client communication remain human. Scottish training routes via Glasgow Vet School (University of Glasgow) and SRUC''s new veterinary programme at Aberdeen. Mixed practice in rural Scotland contrasts with urban small animal work.',
  false, 'Stable -- recruitment challenges in rural practice',
  38000, 72000, 48500,
  36000, 54320, 78000,
  'British Veterinary Association (BVA) Voice of the Veterinary Profession 2024 survey; ONS ASHE 2025 Table 14 SOC 2240 for UK percentiles',
  '2026-04-18', true,
  'RCVS-regulated profession. Entry reflects newly qualified vet post-graduation (MRCVS). Experienced figure represents senior vet in mixed practice; specialist referral vets and partners in multi-site practices can earn GBP 100,000+. Rural and large animal practice in Scotland faces recruitment shortages; urban small animal practice is more competitive on pay. BVA 2024 survey data -- flagged for verification against 2025 data if available.'
),
(
  '8e706fbe-1f19-4156-80a1-631faf1c211c',
  'Veterinary Nurse',
  '6132', 2,
  'AI assists with practice management, appointment scheduling, and diagnostic image routing. Hands-on nursing care, anaesthesia monitoring, client communication, and surgical assisting remain human. Training via SVQ, HNC/HND at Scottish colleges (SRUC, Edinburgh College) or degree routes.',
  false, 'Stable -- essential support role',
  24500, 34000, NULL,
  22000, 28150, 34500,
  'British Veterinary Nursing Association salary survey 2024; ONS ASHE 2025 Table 14 SOC 6132 for UK percentiles',
  '2026-04-18', true,
  'RVN (Registered Veterinary Nurse) qualification via RCVS required. Entry reflects newly qualified RVN. Head Nurse and Clinical Coach roles reach GBP 32,000-38,000. Many VN roles are part-time or rota-based which affects annualised figures. BVNA 2024 survey data -- flagged for verification.'
),

-- ============================================================
-- Education & Teaching (sector id: fa8a16a4-127a-4830-8bfc-f80e3880a376)
-- ============================================================
(
  'fa8a16a4-127a-4830-8bfc-f80e3880a376',
  'Primary Teacher',
  '2314', 3,
  'AI supports lesson preparation, automated formative assessment, and adaptive learning resources. Pedagogical judgement, classroom management, pastoral care, and relationship-building with children remain the human core. Scottish primary teaching is led by GTCS registration with Curriculum for Excellence delivery; Qualifications Scotland oversees standards.',
  false, 'Stable -- regulated profession with SNCT pay scale',
  33594, 50589, 43607,
  28000, 43607, 51000,
  'SNCT Scottish Teachers'' Pay Scale 2025/26; probationer rate for entry; MGT Point 5 for experienced',
  '2026-04-18', false,
  'Scottish Teachers'' Pay Scale (SNCT) 2025/26 applied 4 percent uplift from August 2025, rising to 4.25 percent from April 2026. Entry is Probationer Teacher rate (GBP 33,594) during the Teacher Induction Scheme (TIS) year. Post-probation teachers enter Main Grade Teacher (MGT) Point 1 at GBP 40,263 rising to MGT Point 5 at GBP 50,589 after approximately 5 years. Chartered Teacher and promoted posts (Principal Teacher, Depute Head) earn significantly more. GTCS registration required. UK ASHE figures for SOC 2314/2313 are lower than Scottish figures due to SNCT pay premium.'
),
(
  'fa8a16a4-127a-4830-8bfc-f80e3880a376',
  'Secondary Teacher',
  '2313', 3,
  'AI augments lesson preparation, automated marking of objective assessments, and attendance analytics. Subject teaching, classroom management, pastoral care, and preparing pupils for National 5, Higher, and Advanced Higher qualifications remain human-led. GTCS registration required; Qualifications Scotland oversees qualifications from February 2026.',
  false, 'Stable -- regulated profession, shortages in STEM subjects',
  33594, 50589, 43607,
  30000, 43607, 53000,
  'SNCT Scottish Teachers'' Pay Scale 2025/26; probationer rate for entry; MGT Point 5 for experienced',
  '2026-04-18', false,
  'Scottish Teachers'' Pay Scale (SNCT) 2025/26 applied 4 percent uplift from August 2025, rising to 4.25 percent from April 2026. Entry is Probationer Teacher rate (GBP 33,594) during the Teacher Induction Scheme (TIS) year. Post-probation teachers enter Main Grade Teacher (MGT) Point 1 at GBP 40,263 rising to MGT Point 5 at GBP 50,589 after approximately 5 years. Chartered Teacher and promoted posts (Principal Teacher, Depute Head) earn significantly more. GTCS registration required. UK ASHE figures for SOC 2314/2313 are lower than Scottish figures due to SNCT pay premium. Subject shortages in Maths, Physics, Chemistry, Computing, and Gaelic can lead to promoted posts faster.'
),
(
  'fa8a16a4-127a-4830-8bfc-f80e3880a376',
  'Additional Support Needs Teacher',
  '2316', 3,
  'AI supports individualised learning plans, assistive communication devices, and progress monitoring for pupils with ASN. The relational, pedagogical, and advocacy work remains entirely human. ASN Teachers in Scotland work within mainstream schools, specialist units, and special schools; additional GTCS endorsement typically required.',
  false, 'Growing -- rising ASN identification and statutory duty',
  33594, 50589, 44120,
  30000, 44120, 52000,
  'SNCT Scottish Teachers'' Pay Scale 2025/26; probationer rate for entry; MGT Point 5 for experienced with ASN allowance',
  '2026-04-18', false,
  'SNCT MGT scale applies with Additional Support Needs Allowances available for certain specialist roles. Principal Teacher (ASN) promoted posts significantly higher. Local authority employment. Specialist qualifications via CALL Scotland, Dyslexia Scotland, and Autism Understanding Scotland supplement core teacher training.'
),
(
  'fa8a16a4-127a-4830-8bfc-f80e3880a376',
  'FE Lecturer',
  '2312', 4,
  'AI augments curriculum delivery, automated assessment of practical and theoretical modules, and industry-relevant simulation. The vocational expertise, industry currency, and learner engagement remain human. Scottish FE lecturers in 26 incorporated colleges teach SCQF 4-8 programmes including HNC/HND and Foundation Apprenticeships.',
  false, 'Emerging -- green skills and digital apprenticeship demand',
  34500, 48000, 40250,
  30500, 40250, 50500,
  'National Recognition and Procedures Agreement (NRPA) FE pay scales 2025/26; Scottish college sector negotiated pay',
  '2026-04-18', true,
  'Scottish FE lecturer pay negotiated via NRPA between colleges and EIS-FELA. Pay harmonisation completed in 2017. Entry reflects Point 1 of lecturer scale; experienced top of lecturer scale before promotion to Curriculum Manager or Head of Department. Industry backgrounds common; teaching qualification (TQFE) required within probation. Recent pay disputes have affected settlement; verify current NRPA scale.'
),
(
  'fa8a16a4-127a-4830-8bfc-f80e3880a376',
  'Early Years Teacher',
  '2315', 3,
  'AI supports observation and assessment recording, personalised learning plans, and parent communication. Play-based pedagogy, attachment-informed practice, and early identification of developmental needs remain human. Scottish Early Years Teachers are BA-qualified and GTCS-registered, working within the 1140 Hours funded childcare expansion.',
  false, 'Stable -- 1140 Hours expansion priority',
  33594, 50589, 38450,
  28000, 38450, 48000,
  'SNCT Scottish Teachers'' Pay Scale 2025/26 applies to GTCS-registered Early Years Teachers in local authority ELC settings',
  '2026-04-18', true,
  'Distinct from Nursery Practitioner (SVQ/HNC qualified). BA Childhood Practice or BEd with Early Years specialism plus GTCS registration. Employment predominantly local authority ELC settings covering 1140 Hours funded provision. Some settings use Senior Early Years Officer roles with different pay scales. Third sector and private nurseries vary significantly below local authority rates.'
),
(
  'fa8a16a4-127a-4830-8bfc-f80e3880a376',
  'School Librarian',
  '2471', 3,
  'AI handles cataloguing, recommendation systems, and research support tools. Information literacy teaching, reading engagement, and supporting digital citizenship remain human. Scottish school librarians (CILIPS-affiliated) face ongoing budget pressure; not all Scottish secondaries retain a qualified librarian.',
  false, 'Declining -- budget pressure in local authorities',
  28150, 40200, 32180,
  24500, 32180, 41000,
  'Scottish Joint Council (SJC) for Local Government Employees 2025/26 pay scales; CILIPS salary survey 2024',
  '2026-04-18', true,
  'Local authority SJC pay scales apply. Entry typically at SCP 30-35 (School Librarian); experienced at SCP 45-50 for senior school library roles. CILIPS-qualified librarians (CILIP chartered) preferred. Role availability varies by local authority with some councils significantly reducing school library provision. Figures flagged for verification against current SJC scales.'
),
(
  'fa8a16a4-127a-4830-8bfc-f80e3880a376',
  'Youth Worker (CLD)',
  '3221', 2,
  'AI handles programme administration, impact data aggregation, and communications. Mentorship, relationship-building with young people, safe-space provision, and community development work remain entirely human. CLD in Scotland is a statutory service with dedicated workforce standards via CLD Standards Council.',
  false, 'Stable -- statutory community service',
  26500, 38400, 30500,
  23000, 30500, 38500,
  'Scottish Joint Council (SJC) for Local Government Employees 2025/26; CLD Standards Council workforce data',
  '2026-04-18', true,
  'Community Learning and Development (CLD) is a statutory Scottish local authority service under the 2013 CLD Regulations. Entry SJC SCP 28-32 (CLD Worker); experienced SCP 42-48 (Senior CLD Worker). CLDSC-registered Youth and Community Worker qualification (HNC, degree, or professional qualification). Third sector youth work (YouthLink Scotland members) varies. Verify against current SJC scales.'
),

-- ============================================================
-- Construction & Trades (sector id: 5d65f7b5-4f66-4c64-aaac-18ff258866c9)
-- ============================================================
(
  '5d65f7b5-4f66-4c64-aaac-18ff258866c9',
  'Welder / Fabricator',
  '5213', 2,
  'Robotic welding is standard in controlled manufacturing environments but site-specific, complex, and shipbuilding fabrication remains human-critical. AI assists with weld quality inspection, material tracking, and project documentation. BAE Systems Govan and Scotstoun, Babcock Rosyth, and offshore wind fabrication at Nigg and Methil anchor Scottish employment.',
  false, 'Stable -- shipbuilding and renewables demand',
  27150, 42400, 36250,
  25000, 36250, 43500,
  'ONS ASHE 2025 Table 14 and Table 15 SOC 5213 Welding trades; Scottish Engineering salary data',
  '2026-04-18', false,
  'ONS ASHE 2025 SOC 5213 Welding Trades. Entry reflects post-apprenticeship (Modern Apprenticeship in Engineering) or HNC-qualified welder. Coded welders (pressure vessel, subsea, nuclear) attract significant premiums; offshore rates can exceed GBP 60,000 with rotation. Scotland benefits from shipbuilding and renewables fabrication clusters.'
),
(
  '5d65f7b5-4f66-4c64-aaac-18ff258866c9',
  'Painter and Decorator',
  '5323', 1,
  'AI has minimal impact on core craft work -- preparation, painting, wallpapering, and finishing remain entirely manual. Small business owners use AI for quoting, scheduling, and customer engagement. Modern Apprenticeship entry route via SDS; self-employment common.',
  false, 'Stable -- housing refurbishment and commercial demand',
  22800, 35500, 29180,
  21000, 29180, 36000,
  'ONS ASHE 2025 Table 14 and Table 15 SOC 5323 Painters and decorators',
  '2026-04-18', false,
  'ONS ASHE 2025 SOC 5323. Entry post-apprenticeship (SVQ Level 3). Self-employed painters can earn more through private contracts but face variability. Specialist work (heritage, decorative finishes) commands premium rates. Scotland figures align with UK given trade''s uniform pay distribution.'
),
(
  '5d65f7b5-4f66-4c64-aaac-18ff258866c9',
  'Roofer / Slater',
  '5313', 1,
  'Roof installation, slating, and leadwork remain skilled manual trades where AI has negligible direct impact. Drone survey and AI-assisted defect detection affect inspection and quoting but not the craft itself. Scottish climate and building heritage sustain high demand, particularly for slating specialists.',
  false, 'Growing -- energy retrofit and heritage demand',
  24200, 40150, 31500,
  22500, 31500, 40500,
  'ONS ASHE 2025 Table 14 and Table 15 SOC 5313 Roofers, roof tilers and slaters',
  '2026-04-18', false,
  'ONS ASHE 2025 SOC 5313. Entry post-apprenticeship (SVQ Level 3 Roofing Occupations). Experienced slaters and heritage roofers command higher rates in Scotland due to stone-built housing stock and Victorian tenement repair demand. Energy retrofit work (EnerPHit, fabric-first renovation) creates new demand. Self-employment common.'
),
(
  '5d65f7b5-4f66-4c64-aaac-18ff258866c9',
  'Scaffolder',
  '5319', 1,
  'Scaffolding erection and dismantling is safety-critical physical work where AI assists with design, logistics, and site planning but not execution. CISRS (Construction Industry Scaffolders Record Scheme) certification required. Scottish infrastructure and renewables projects sustain demand.',
  false, 'Stable -- essential across construction and renewables',
  25400, 41800, 34200,
  23500, 34200, 42500,
  'ONS ASHE 2025 Table 14 SOC 5319 Construction and building trades n.e.c.; CISRS industry pay survey',
  '2026-04-18', true,
  'SOC 5319 captures scaffolders among other construction and building trades n.e.c., so ASHE figures are approximate for this role specifically. CISRS levels (Trainee, Part 1, Part 2, Advanced) dictate pay progression. Offshore and large infrastructure rates considerably higher with rotation patterns. SVQ Level 2/3 in Scaffolding via CISRS.'
),
(
  '5d65f7b5-4f66-4c64-aaac-18ff258866c9',
  'Groundworker / Civil Operative',
  '9120', 1,
  'Excavation, drainage, concreting, and foundations remain heavily manual work. AI supports site survey (drone/LiDAR), logistics, and plant telematics but not core groundworks. CSCS card and plant tickets expand earnings potential. Housebuilding pipeline in Scotland (affordable housing, commuter developments) sustains demand.',
  false, 'Stable -- housebuilding pipeline',
  23150, 36200, 28450,
  21500, 28450, 37500,
  'ONS ASHE 2025 Table 14 and Table 15 SOC 9120 Elementary construction occupations',
  '2026-04-18', false,
  'ONS ASHE 2025 SOC 9120. Entry reflects labourer/trainee groundworker. Experienced groundworkers with plant tickets (dumper, 360 excavator, forward tipping dumper) and ticket combinations earn significantly more. Self-employed gangs on sub-contract piece rates can exceed figure shown. SVQ Level 2 Construction pathway via Modern Apprenticeship.'
),

-- ============================================================
-- Engineering & Manufacturing (sector id: d5dedc2d-1b24-433f-a962-df70f0ebeb97)
-- ============================================================
(
  'd5dedc2d-1b24-433f-a962-df70f0ebeb97',
  'Wind Turbine Engineer / Technician',
  '3114', 4,
  'Predictive maintenance models drive scheduled repairs on offshore and onshore wind farms; AI analyses SCADA data to identify component degradation. Physical climb, mechanical repair, and blade work remain human. Scotland''s onshore and offshore wind fleet (ScotWind, INTOG) and fabrication sites (Nigg, Methil) drive sustained recruitment.',
  false, 'High growth -- ScotWind deployment',
  35200, 62500, 51240,
  32000, 51240, 65000,
  'Renewables industry salary surveys (RenewableUK, Global Wind Organisation 2024-25); ONS ASHE 2025 Table 14 SOC 3114 Electrical and electronics technicians; Scotland adjustment for North Sea cluster',
  '2026-04-18', true,
  'SOC 3114 covers electrical and electronics technicians broadly. Wind technicians often enter via Modern Apprenticeship in Wind Turbine Maintenance, HNC/HND Engineering, or sector conversion. GWO (Global Wind Organisation) certifications required. Offshore rotation rates substantially higher (GBP 55,000-75,000 for experienced). Scotland hosts high proportion of UK offshore wind employment. Figures flagged for verification against 2025 RenewableUK data.'
),
(
  'd5dedc2d-1b24-433f-a962-df70f0ebeb97',
  'Sustainability Engineer',
  '2152', 4,
  'AI handles carbon accounting, energy modelling, material lifecycle analysis, and regulatory reporting. The systems thinking, stakeholder engagement, and engineering trade-off judgement remain human. Scottish net-zero targets (2045) and Scottish Government procurement drive sustained corporate demand.',
  false, 'Growing -- corporate net-zero commitments',
  34150, 58400, 48120,
  31000, 48120, 62000,
  'ONS ASHE 2025 Table 14 and Table 15 SOC 2152 Environment professionals',
  '2026-04-18', false,
  'SOC 2152 Environment Professionals covers sustainability engineers, climate consultants, and environmental specialists. Entry reflects graduate engineer with sustainability specialism (MEng/MSc). IEMA Practitioner or Chartered Environmentalist status raises earnings. Scotland market supported by net-zero procurement, ClimateXChange, and corporate reporting mandates.'
),
(
  'd5dedc2d-1b24-433f-a962-df70f0ebeb97',
  'Petroleum / Energy Engineer',
  '2126', 5,
  'AI acts as operating system for modern oil and gas and CCS operations, handling subsurface modelling, well sensor data, and production optimisation. Engineering judgement on integrity, safety, and transition economics remains human. Aberdeen and NE Scotland remain the UK hub, pivoting to carbon capture (Acorn Project) and offshore wind integration.',
  false, 'Transitioning -- oil and gas declining, CCS and offshore wind growing',
  38400, 85000, 68450,
  36000, 68450, 95000,
  'ONS ASHE 2025 Table 14 and Table 15 SOC 2126 Mechanical engineers; OGUK/Offshore Energies UK salary survey 2024',
  '2026-04-18', true,
  'SOC 2126 Mechanical Engineers used as proxy; petroleum engineering is not separately coded in SOC 2020. Aberdeen cluster commands salary premium. Senior specialists (subsea, reservoir, integrity) exceed GBP 100,000. Workforce transitioning to CCS (Acorn Project at St Fergus), hydrogen, and offshore wind -- Energy Transition Zone in Aberdeen. Flagged for verification against current Offshore Energies UK data.'
),
(
  'd5dedc2d-1b24-433f-a962-df70f0ebeb97',
  'Marine / Naval Architecture Engineer',
  '2128', 4,
  'AI supports complex hull design, hydrodynamics simulation, and autonomous vessel development. The integration of mechanical, structural, and electronic systems plus safety certification remain human engineering disciplines. Clyde shipbuilding (BAE Systems Govan, Scotstoun, Ferguson Marine at Port Glasgow) and Rosyth (Babcock) anchor Scottish employment.',
  false, 'Stable -- naval shipbuilding pipeline',
  36150, 64200, 53180,
  33000, 53180, 68000,
  'ONS ASHE 2025 Table 14 SOC 2128 Naval architects, marine engineers; RINA salary survey',
  '2026-04-18', true,
  'SOC 2128 Naval Architects and Marine Engineers. Entry reflects graduate with MEng in Naval Architecture (Strathclyde is a key UK provider). Chartered Engineer status (CEng via RINA or IMarEST) significantly increases earnings. Type 26 and Type 31 programmes at BAE Systems Govan/Scotstoun sustain Scottish demand; autonomous vessel development (Loch Ness trials) is emerging. Flagged for verification.'
),
(
  'd5dedc2d-1b24-433f-a962-df70f0ebeb97',
  'Automotive Engineer',
  '2126', 4,
  'AI transforms battery management systems, autonomous vehicle perception, and manufacturing line optimisation. Mechanical design, testing, and integration remain human engineering work. Scotland lacks a major OEM but has EV component suppliers and research clusters (University of Strathclyde, Heriot-Watt) linked to wider UK automotive.',
  false, 'Stable -- EV transition driving demand',
  32800, 55500, 45670,
  30000, 45670, 60000,
  'ONS ASHE 2025 Table 14 SOC 2126 Mechanical engineers',
  '2026-04-18', false,
  'SOC 2126 Mechanical Engineers used. Scotland has no volume OEM but hosts component suppliers and research activity. Entry graduate engineer (MEng Mechanical or Automotive). CEng via IMechE raises experienced figure. Broader UK market (Midlands, North East) offers higher volumes; Scotland roles cluster around EV battery research and drivetrain suppliers.'
),
(
  'd5dedc2d-1b24-433f-a962-df70f0ebeb97',
  'Materials Engineer / Metallurgist',
  '2129', 5,
  'AI accelerates alloy discovery, composite design, and failure mode prediction. Laboratory characterisation, field testing, and process engineering interpretation remain human. Scottish AMRC (Advanced Manufacturing Research Centre) in Renfrewshire and NMIS (National Manufacturing Institute Scotland) support materials research for aerospace and marine applications.',
  false, 'Growing -- advanced manufacturing and energy transition',
  33500, 58200, 47320,
  31000, 47320, 62000,
  'ONS ASHE 2025 Table 14 SOC 2129 Engineering professionals n.e.c.; IOM3 salary survey',
  '2026-04-18', true,
  'SOC 2129 Engineering Professionals n.e.c. covers materials engineers and metallurgists. Entry MEng or MSc Materials/Metallurgy. Chartered Engineer via IOM3 raises salary. NMIS Lightweight Manufacturing Centre and aerospace supply chain (Spirit AeroSystems Prestwick) sustain specialist roles. Figures flagged pending 2025 IOM3 data.'
),
(
  'd5dedc2d-1b24-433f-a962-df70f0ebeb97',
  'Structural Engineer',
  '2121', 4,
  'AI supports structural analysis, BIM integration, and code-checking. Engineering judgement on load paths, resilience, and signing off designs remain human (and legally human-bound). Scottish consultancies (Arup, Ramboll, Buro Happold, Will Rudd) and public sector employ structural engineers on housing, infrastructure, and heritage projects.',
  false, 'Stable -- regulated profession with steady infrastructure pipeline',
  32150, 56800, 46250,
  29500, 46250, 62000,
  'ONS ASHE 2025 Table 14 SOC 2121 Civil engineers; Institution of Structural Engineers salary survey',
  '2026-04-18', false,
  'SOC 2121 Civil Engineers covers structural engineers in UK classification. Entry reflects graduate with MEng Civil/Structural. Chartered Engineer via IStructE or ICE materially raises salary. Scotland''s infrastructure pipeline (Spaces for People, LEZ, affordable housing) supports stable demand. Consultancy roles typically higher paid than public sector.'
),
(
  'd5dedc2d-1b24-433f-a962-df70f0ebeb97',
  'Process Engineer',
  '2127', 6,
  'AI is the core tool for real-time process monitoring, optimisation, and predictive maintenance in smart factories. Workers adopt AI tools intensively; junior analyst work is increasingly automated. Engineering judgement on unit operations, safety, and capital projects remains human but augmented. Whisky (Diageo, Chivas), food and drink, pharmaceuticals (GSK Montrose), and petrochemicals (INEOS Grangemouth) drive Scottish demand.',
  false, 'Emerging -- Industry 4.0 and smart manufacturing',
  34400, 60150, 49180,
  32000, 49180, 65000,
  'ONS ASHE 2025 Table 14 SOC 2127 Production and process engineers',
  '2026-04-18', false,
  'SOC 2127 Production and Process Engineers. Entry MEng Chemical or Process Engineering (Strathclyde, Heriot-Watt, Edinburgh). Chartered Engineer via IChemE raises salary significantly. Whisky distillation, pharmaceuticals, and petrochemicals are the key Scottish employers; INEOS Grangemouth restructuring affects Central Belt cluster. AI adoption is high compared to other engineering disciplines.'
),

-- ============================================================
-- Business & Finance (sector id: 13a2285b-3e6b-4e24-9129-5dcf652d8d89)
-- ============================================================
(
  '13a2285b-3e6b-4e24-9129-5dcf652d8d89',
  'Business Analyst',
  '2431', 8,
  'AI handles routine data synthesis, requirements documentation, process mapping, and stakeholder reporting. The analyst role is shifting toward high-level strategic questioning, stakeholder mediation, and AI output validation. Edinburgh-Glasgow financial corridor (FNZ, Aegon, Lloyds, RBS, Tesco Bank, Aviva) drives strong Scottish demand.',
  false, 'Reshaping around AI -- strategic roles growing, routine roles shrinking',
  31250, 58150, 48240,
  29500, 48240, 68000,
  'ONS ASHE 2025 Table 14 and Table 15 SOC 2431 Management consultants and business analysts',
  '2026-04-18', false,
  'SOC 2431 bundles management consultants and business analysts -- BA typically earn below consultant median. BCS and IIBA certifications common entry. Scotland''s financial services sector drives demand in Edinburgh and Glasgow; London-based BAs earn 30-40 percent more. Progression to Senior/Lead BA or transition to Product Owner/Product Manager common.'
),
(
  '13a2285b-3e6b-4e24-9129-5dcf652d8d89',
  'HR Manager / Recruitment Consultant',
  '1135', 6,
  'AI screens CVs, analyses workforce sentiment, supports compensation benchmarking, and drafts policy. Complex casework, conflict resolution, union negotiation, and strategic workforce planning remain human-led. CIPD qualifications (CIPD Level 5 or 7) standard for HR Manager roles; recruitment consultants typically via REC pathways.',
  false, 'Stable -- AI-augmented rather than replaced',
  32400, 62500, 52900,
  30000, 52900, 72000,
  'ONS ASHE 2025 Table 14 and Table 15 SOC 1135 Human resources managers and directors',
  '2026-04-18', false,
  'SOC 1135 covers HR Managers and Directors. Entry for this role reflects mid-career HR professional moving into management (HR Advisor progressing); pure entry-level HR is coded differently (SOC 3563 HR Officers, lower pay). Recruitment Consultant pay varies widely by commission structure -- GBP 25,000 base + commission typical, top billers exceed GBP 80,000 OTE. London premium applies.'
),
(
  '13a2285b-3e6b-4e24-9129-5dcf652d8d89',
  'Marketing Manager / Brand Manager',
  '1132', 6,
  'AI handles content generation, A/B testing, SEO optimisation, trend forecasting, and customer segmentation. Managers act as creative directors, brand custodians, and AI output supervisors. Scottish financial services, whisky, food and drink, and tech startups drive demand; Edinburgh and Glasgow cluster most roles.',
  false, 'Shifting to strategy -- creative direction over execution',
  30800, 68400, 58250,
  28500, 58250, 85000,
  'ONS ASHE 2025 Table 14 and Table 15 SOC 1132 Marketing, sales and advertising directors',
  '2026-04-18', false,
  'SOC 1132 Marketing, Sales and Advertising Directors. Entry figure reflects Marketing Manager level (Assistant/Junior Marketing roles code to SOC 3554 with lower pay). Brand Manager in FMCG/whisky often requires graduate scheme entry. London-based roles pay 40-50 percent above Scotland figure. CIM Diploma common qualification. Digital marketing specialists (PPC, SEO, social) may have distinct career tracks.'
),
(
  '13a2285b-3e6b-4e24-9129-5dcf652d8d89',
  'Mortgage Adviser',
  '3534', 4,
  'AI automates basic mortgage eligibility checking, document processing, and affordability calculations. Complex advisory work -- adverse credit, buy-to-let, self-employed, specialist lending -- remains human. CeMAP qualification required; employed by banks, building societies (Leeds BS, Nationwide, Santander), or independent mortgage brokerages.',
  false, 'Stable -- advisory element resilient to automation',
  26150, 52000, 38450,
  24500, 38450, 58000,
  'ONS ASHE 2025 Table 14 SOC 3534 Finance and investment analysts and advisers',
  '2026-04-18', true,
  'SOC 3534 bundles finance and investment advisers broadly. Mortgage Adviser pay often includes commission/bonus on completions. Employed Mortgage Advisers (bank or building society) have more stable but lower base than self-employed brokers. CeMAP Levels 1-3 required; CeRER for equity release specialism. Scottish property market variation (Edinburgh, Glasgow, rural) affects transaction volume and earnings.'
),
(
  '13a2285b-3e6b-4e24-9129-5dcf652d8d89',
  'Entrepreneur / Small Business Owner',
  '1190', 5,
  'AI transforms marketing, operations, bookkeeping, and customer service for small businesses -- sole traders and SME owners increasingly use AI tools as the equivalent of an unpaid team. The core entrepreneurial work -- identifying opportunity, managing risk, leading people -- remains human. Scotland has approximately 382,000 SMEs; support via Business Gateway, Scottish Enterprise, and Highlands and Islands Enterprise.',
  false, 'Variable -- strong startup ecosystem in Edinburgh/Glasgow; challenges in rural areas',
  24000, 75000, 34500,
  18000, 34500, 80000,
  'ONS Self-Employment Income Survey 2024; Federation of Small Businesses (FSB) Scotland 2024 data',
  '2026-04-18', true,
  'Earnings are highly variable by sector, scale, and stage -- representative figures only. Entry reflects sole trader/self-employed drawings in early years; experienced reflects established SME owner. Successful scale-up founders (Scottish EDGE winners, Techscaler alumni) can earn substantially more; many SME owners also earn less than equivalent employed roles. SOC 1190 Managers and Directors n.e.c. used as no dedicated entrepreneur code exists. Figures flagged for verification given high variance.'
);
