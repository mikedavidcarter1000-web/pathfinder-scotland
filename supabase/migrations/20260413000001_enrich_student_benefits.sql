-- Enrich student_benefits with comprehensive Scottish entitlements data.
--
-- Adds detail columns for income thresholds, award breakdowns, administering
-- bodies, application windows, verification metadata, and a link back to
-- universities for university-specific top-ups. Then backfills existing rows
-- with richer data and inserts the full catalogue of SAAS bursaries,
-- professional/vocational funding, FE support, charitable trusts, university
-- top-ups, Scottish Child Payment, postgraduate funding, sport scholarships,
-- and hardship funds.
--
-- This file is idempotent: column adds use IF NOT EXISTS, row updates key on
-- name, and new rows are deleted-then-inserted by name to allow safe re-runs.

-- ============================================================================
-- PART 1 — Schema: new columns on student_benefits
-- ============================================================================

ALTER TABLE student_benefits ADD COLUMN IF NOT EXISTS income_thresholds JSONB DEFAULT '{}'::jsonb;
ALTER TABLE student_benefits ADD COLUMN IF NOT EXISTS award_details JSONB DEFAULT '{}'::jsonb;
ALTER TABLE student_benefits ADD COLUMN IF NOT EXISTS administering_body TEXT;
ALTER TABLE student_benefits ADD COLUMN IF NOT EXISTS application_process TEXT;
ALTER TABLE student_benefits ADD COLUMN IF NOT EXISTS application_deadline TEXT;
ALTER TABLE student_benefits ADD COLUMN IF NOT EXISTS eligibility_details TEXT;
ALTER TABLE student_benefits ADD COLUMN IF NOT EXISTS last_verified DATE DEFAULT '2026-04-11';
ALTER TABLE student_benefits ADD COLUMN IF NOT EXISTS verification_notes TEXT;
ALTER TABLE student_benefits ADD COLUMN IF NOT EXISTS is_repayable BOOLEAN DEFAULT false;
ALTER TABLE student_benefits ADD COLUMN IF NOT EXISTS related_university_id UUID REFERENCES universities(id);

CREATE INDEX IF NOT EXISTS idx_sb_related_uni ON student_benefits(related_university_id);

-- ============================================================================
-- PART 2 — Update existing benefits with richer data
-- ============================================================================

-- Young Students' Bursary: exact thresholds and process
UPDATE student_benefits SET
  income_thresholds = '{"under_21000": 2000, "21000_23999": 1125, "24000_33999": 500, "34000_plus": 0}'::jsonb,
  award_details = '{"type": "non-repayable", "payment": "monthly (double in September)", "max_years": 4}'::jsonb,
  administering_body = 'SAAS',
  application_process = 'Apply via SAAS online account from April. Income evidence required. Apply by 30 June for guaranteed assessment before course start.',
  application_deadline = '31 March',
  last_verified = '2026-04-11'
WHERE name = 'Young Students'' Bursary';

-- Care-Experienced Students' Bursary: correct figure and package
UPDATE student_benefits SET
  discount_value = 'Up to GBP 9,000/year non-repayable',
  award_details = '{"bursary": 9000, "special_support_loan": 2400, "summer_accommodation": 1330, "total_package": 12730, "non_repayable_total": 10330}'::jsonb,
  eligibility_details = 'Must have been looked after by a local authority at any point before turning 18. Includes foster care, kinship care, residential care, looked after at home. No age limit. No income assessment.',
  administering_body = 'SAAS',
  verification_notes = 'Increased from GBP 8,100 to GBP 9,000. Age cap removed. Some university pages still show old figure.',
  last_verified = '2026-04-11'
WHERE name = 'Care-Experienced Students'' Bursary';

-- EMA: thresholds and attendance requirement
UPDATE student_benefits SET
  income_thresholds = '{"1_child": 24421, "2_plus_children": 26884}'::jsonb,
  eligibility_details = '16-19 years old in S5/S6 or non-advanced college course. 100% weekly attendance required. Not paid during holidays.',
  administering_body = 'Local council (funded by Scottish Government)',
  last_verified = '2026-04-11'
WHERE name = 'Education Maintenance Allowance (EMA)';

-- School Clothing Grant: per-council variance
UPDATE student_benefits SET
  discount_value = 'GBP 150/year minimum per secondary pupil (varies by council)',
  verification_notes = 'Amounts vary by council: Glasgow/Edinburgh GBP 150, South Lanarkshire GBP 170, Renfrewshire GBP 200. National minimum unchanged since at least 2023.',
  administering_body = 'Local council',
  last_verified = '2026-04-11'
WHERE name = 'School Clothing Grant';

-- Free School Meals: expansion pilot context
UPDATE student_benefits SET
  verification_notes = 'Significant expansion since 2023. S1-S3 pilot in 8 council areas (Aberdeen, Western Isles, Fife, Glasgow, Moray, North Ayrshire, Shetland, South Lanarkshire) via Scottish Child Payment. Pilot ending June 2026.',
  administering_body = 'Local council',
  last_verified = '2026-04-11'
WHERE name = 'Free school meals';

-- ============================================================================
-- PART 3-11 — Delete (for idempotency) then insert new benefits
-- ============================================================================

DELETE FROM student_benefits WHERE name IN (
  -- Part 3: SAAS bursaries
  'Independent Students'' Bursary',
  'Estranged Students'' Bursary',
  'Lone Parents'' Grant',
  'Lone Parents'' Childcare Grant',
  'Adult Dependants'' Grant',
  'Disabled Students'' Allowance (DSA)',
  'Summer Accommodation Grant (Care Experienced)',
  'Part-time Fee Grant',
  -- Part 4: Professional/vocational
  'Paramedic, Nursing and Midwifery Student Bursary (PNMSB)',
  'Teaching Bursary in Scotland',
  -- Part 5: FE
  'FE Student Support Bursary',
  -- Part 6: Charitable trusts
  'Robertson Trust Scholarship',
  'Carnegie Education Fund',
  'The Cross Trust',
  'Unite Foundation Scholarship',
  -- Part 7: University-specific CE
  'Edinburgh Access Scholarship (CE)',
  'Glasgow CE & Estranged Student Bursary',
  'St Andrews Access Award + SA Bursary',
  'Heriot-Watt Expenses Bursary',
  'Stirling Estranged Students Bursary',
  'RGU Unite Foundation Scholarship',
  -- Part 8: Government benefit
  'Scottish Child Payment',
  -- Part 9: PG
  'SAAS Postgraduate Funding',
  -- Part 10: Sport
  'Winning Students 100',
  'SportsAid Scotland',
  -- Part 11: Hardship
  'Discretionary Fund / Hardship Fund'
);

-- ============================================================================
-- PART 3 — SAAS bursaries
-- ============================================================================

INSERT INTO student_benefits (
  name, provider, description, short_description, category, discount_value, discount_type,
  eligibility_s1_s4, eligibility_s5_s6, eligibility_college, eligibility_university,
  min_age, max_age, access_method, access_platform,
  is_scotland_only, is_government_scheme, is_care_experienced_only, is_means_tested, is_repayable,
  url, priority_score,
  income_thresholds, award_details, administering_body,
  application_process, application_deadline, eligibility_details, verification_notes
) VALUES

('Independent Students'' Bursary',
 'Student Awards Agency Scotland',
 'Non-repayable bursary of up to GBP 1,000 per year for students who qualify as independent from their parents. Intended to supplement the standard bursary/loan package where parental income would otherwise apply.',
 'Up to GBP 1,000/year for independent students on household incomes under GBP 21,000.',
 'funding', 'Up to GBP 1,000/year non-repayable', 'fixed',
 false, false, true, true,
 NULL, NULL, 'Apply to SAAS each academic year', 'SAAS',
 true, true, false, true, false,
 'https://www.saas.gov.uk', 85,
 '{"under_21000": 1000, "21000_plus": 0}'::jsonb,
 '{"type": "non-repayable"}'::jsonb,
 'SAAS',
 'Apply via your SAAS online account and provide income evidence for yourself (and partner, if any).',
 '31 March',
 'Must be aged 25+, OR have dependent child, OR self-supported 3+ years, OR married/partnered. Partner''s income assessed.',
 NULL),

('Estranged Students'' Bursary',
 'Student Awards Agency Scotland',
 'Support package for students permanently estranged from their parents. Combines a non-repayable bursary with the full Special Support Loan, giving a total package of up to GBP 11,400. Professional endorsement required.',
 'GBP 1,000 bursary + GBP 10,400 loan = GBP 11,400 total for estranged students.',
 'funding', 'GBP 1,000 bursary + GBP 10,400 loan = GBP 11,400 total', 'fixed',
 false, false, false, true,
 NULL, 24, 'Apply to SAAS with professional endorsement letter', 'SAAS',
 true, true, false, false, false,
 'https://www.saas.gov.uk', 88,
 '{}'::jsonb,
 '{"bursary": 1000, "loan": 10400, "total": 11400}'::jsonb,
 'SAAS',
 'Apply via SAAS and upload an estrangement endorsement from a social worker, doctor, teacher, counsellor or police officer.',
 '31 March',
 'Under 25. Permanently not in contact with parents due to relationship breakdown. Must be endorsed by a professional (social worker, doctor, teacher, counsellor, police officer). Cannot be care experienced (CESB applies instead).',
 'Total package increased to GBP 11,400 from AY 2024-25.'),

('Lone Parents'' Grant',
 'Student Awards Agency Scotland',
 'Non-repayable grant of up to GBP 1,305 per year for single parents raising dependent children while studying full-time at undergraduate level.',
 'Up to GBP 1,305/year for single parents in full-time undergraduate study.',
 'funding', 'Up to GBP 1,305/year non-repayable', 'fixed',
 false, false, false, true,
 NULL, NULL, 'Apply to SAAS alongside main funding application', 'SAAS',
 true, true, false, true, false,
 'https://www.saas.gov.uk', 82,
 '{}'::jsonb,
 '{"max_award": 1305, "type": "non-repayable"}'::jsonb,
 'SAAS',
 'Apply via SAAS; assessed on the student''s own earned income only.',
 '31 March',
 'Must be single parent raising dependent children. Full-time undergraduate only.',
 NULL),

('Lone Parents'' Childcare Grant',
 'Student Awards Agency Scotland',
 'Non-repayable grant of up to GBP 1,215 per year to cover registered or formal childcare for lone parents in full-time undergraduate study. Paid through the university''s Childcare Fund.',
 'Up to GBP 1,215/year for registered childcare if receiving Lone Parents'' Grant.',
 'funding', 'Up to GBP 1,215/year non-repayable', 'fixed',
 false, false, false, true,
 NULL, NULL, 'Apply through your university''s Childcare Fund office', 'University Childcare Fund',
 true, true, false, false, false,
 'https://www.saas.gov.uk', 81,
 '{}'::jsonb,
 '{"max_award": 1215, "type": "non-repayable"}'::jsonb,
 'SAAS (via university Childcare Fund)',
 'Must first receive Lone Parents'' Grant; then apply via the university Childcare Fund.',
 '31 March',
 'Must be receiving Lone Parents'' Grant. Must use registered/formal childcare.',
 NULL),

('Adult Dependants'' Grant',
 'Student Awards Agency Scotland',
 'Non-repayable grant of up to GBP 2,640 per year for students who financially support a dependent adult (e.g. a spouse or partner with no independent income).',
 'Up to GBP 2,640/year if supporting a dependent adult.',
 'funding', 'Up to GBP 2,640/year non-repayable', 'fixed',
 false, false, false, true,
 NULL, NULL, 'Apply to SAAS alongside main funding application', 'SAAS',
 true, true, false, true, false,
 'https://www.saas.gov.uk', 80,
 '{}'::jsonb,
 '{"max_award": 2640, "type": "non-repayable"}'::jsonb,
 'SAAS',
 'Apply via SAAS and provide evidence of the dependent adult''s income.',
 '31 March',
 'For students who care for a dependent adult.',
 NULL),

('Disabled Students'' Allowance (DSA)',
 'Student Awards Agency Scotland',
 'Non-means-tested support for disabled students covering non-medical personal helpers, specialist equipment, consumables, and travel. Not a cash payment — paid to providers on the student''s behalf.',
 'Up to GBP 20,520/year for non-medical help, plus equipment and travel.',
 'funding', 'Up to GBP 20,520/year for non-medical personal help, plus equipment and travel', 'other',
 false, false, true, true,
 NULL, NULL, 'Apply to SAAS with diagnostic evidence', 'SAAS',
 true, true, false, false, false,
 'https://www.saas.gov.uk/disabled-students', 90,
 '{}'::jsonb,
 '{"consumables": 1725, "equipment_total": 5160, "non_medical_personal_help": 20520, "travel": "no fixed cap"}'::jsonb,
 'SAAS',
 'Apply online at SAAS, upload diagnostic evidence, and attend a needs assessment.',
 'Rolling — apply as soon as you know your course',
 'Must have a recognised disability, mental health condition, or specific learning difficulty. Diagnostic evidence required. Working diagnoses accepted for ADHD/Autism. Full-time or part-time (min 50% FTE). No income or age limit.',
 NULL),

('Summer Accommodation Grant (Care Experienced)',
 'Student Awards Agency Scotland',
 'Non-repayable grant covering summer accommodation costs for care-experienced students, so they can retain a year-round home while at university. GBP 1,330 in formal accommodation, GBP 665 in informal.',
 'GBP 1,330 (formal) or GBP 665 (informal) for summer accommodation.',
 'funding', 'GBP 1,330 (formal) or GBP 665 (informal)', 'fixed',
 false, false, false, true,
 NULL, NULL, 'Apply to SAAS alongside CESB', 'SAAS',
 true, true, true, false, false,
 'https://www.saas.gov.uk', 86,
 '{}'::jsonb,
 '{"formal": 1330, "informal": 665}'::jsonb,
 'SAAS',
 'Apply via SAAS with confirmation of care-experienced status. Paid over the summer.',
 '31 March',
 'Must be eligible for CESB. Not available in final year or 1-year courses.',
 'Replaced older Vacation Grant for Care Leavers from summer 2024.'),

('Part-time Fee Grant',
 'Student Awards Agency Scotland',
 'Covers tuition fees for eligible part-time HN-level and above courses for students earning under GBP 25,000 per year. Enables part-time study without tuition costs for lower-income students.',
 'Covers tuition fees for part-time HN+ courses if you earn under GBP 25,000.',
 'funding', 'Covers tuition fees for eligible part-time courses', 'free',
 false, false, true, true,
 NULL, NULL, 'Apply to SAAS for each academic year', 'SAAS',
 true, true, false, true, false,
 'https://www.saas.gov.uk', 75,
 '{"earnings_cap": 25000}'::jsonb,
 '{"type": "fee waiver"}'::jsonb,
 'SAAS',
 'Apply via SAAS with evidence of earnings and course enrolment.',
 '31 March',
 'Student must earn less than GBP 25,000/year before tax. Part-time HN level and above.',
 NULL),

-- ============================================================================
-- PART 4 — Professional / vocational bursaries
-- ============================================================================

('Paramedic, Nursing and Midwifery Student Bursary (PNMSB)',
 'Scottish Government (via SAAS)',
 'Non-means-tested bursary for pre-registration nursing, midwifery and paramedic science degrees at Scottish universities. Pays GBP 10,000/year for years 1-3 and GBP 7,500 for year 4, replacing tuition fees and loan for eligible courses.',
 'GBP 10,000/year (yrs 1-3) + GBP 7,500 (yr 4) for nursing, midwifery, paramedic.',
 'funding', 'GBP 10,000/year (years 1-3) + GBP 7,500 (year 4) — non-repayable', 'fixed',
 false, false, false, true,
 NULL, NULL, 'Apply via SAAS once registered on an eligible course', 'SAAS',
 true, true, false, false, false,
 'https://www.saas.gov.uk', 92,
 '{}'::jsonb,
 '{"year_1": 10000, "year_2": 10000, "year_3": 10000, "year_4": 7500, "non_means_tested": true}'::jsonb,
 'SAAS on behalf of Scottish Government',
 'Apply through SAAS once enrolled on an eligible programme. No parental income assessment.',
 '31 March',
 'Pre-registration nursing (Adult, Child, Mental Health, Learning Disabilities), midwifery, or paramedic science degree at Scottish universities. First degree students only. Allied health professions (physio, OT, radiography) are NOT covered.',
 'GBP 10,000 confirmed for AY 2025-26. Significantly more generous than England''s GBP 5,000 NHS Learning Support Fund.'),

('Teaching Bursary in Scotland',
 'Skills Development Scotland',
 'Tax-free bursary for career-changers entering a PGDE in priority shortage subjects. Recipients commit to teaching in Scottish schools after qualifying.',
 'GBP 15,000-20,000 tax-free for career-changer PGDE students in shortage subjects.',
 'funding', 'GBP 15,000-20,000 tax-free (verify current amount)', 'fixed',
 false, false, false, true,
 NULL, NULL, 'Apply via teachinscotland.scot', 'Skills Development Scotland',
 true, true, false, false, false,
 'https://teachinscotland.scot', 78,
 '{}'::jsonb,
 '{"range_low": 15000, "range_high": 20000, "tax_free": true}'::jsonb,
 'Skills Development Scotland',
 'Apply through teachinscotland.scot during the annual window; evidence of prior employment history required.',
 'Annual window — check teachinscotland.scot',
 'Career changers only: 36+ months paid employment in last 84 months. 2:1 degree. Eligible shortage subjects: Chemistry, Computing, Home Economics, Mathematics, Physics, Technological Education, Modern Languages, Gaelic.',
 'DISCREPANCY: teachinscotland.scot states GBP 15,000; Scottish Government EQIA states GBP 20,000. Verify before launch.'),

-- ============================================================================
-- PART 5 — FE college bursary
-- ============================================================================

('FE Student Support Bursary',
 'Scottish Funding Council',
 'Weekly maintenance bursary for full-time non-advanced (FE) college students. Rates vary by circumstance: self-supporting, still at home, care-experienced, or with dependants. Care-experienced students receive the highest flat rate with no means test.',
 'Up to GBP 125.55/week (self-supporting) or GBP 225/week (care experienced).',
 'funding', 'Up to GBP 125.55/week (self-supporting) or GBP 225/week (care experienced)', 'fixed',
 false, false, true, false,
 16, NULL, 'Apply through your college student funding team', 'College',
 true, true, false, true, false,
 'https://www.mygov.scot/fe-bursary', 87,
 '{}'::jsonb,
 '{"self_supporting_weekly": 125.55, "parental_at_home_weekly": 49.91, "universal_credit_topup_weekly": 28, "care_experienced_weekly": 225, "dependant_allowance_weekly": 67.55, "halls_weekly": 140.13}'::jsonb,
 'Scottish Funding Council (transferring to SAAS from AY 2026-27)',
 'Apply via your college''s student funding office as part of enrolment; income evidence required unless you are care-experienced.',
 'Apply at course enrolment',
 'Full-time non-advanced courses. Self-supporting students assessed on own/partner income. Under-18s normally receive EMA instead. Cannot receive both EMA and bursary maintenance.',
 'Maintenance rates appear unchanged since 2023/24. FE support transferring from SFC to SAAS from AY 2026-27.'),

-- ============================================================================
-- PART 6 — Charitable trusts
-- ============================================================================

('Robertson Trust Scholarship',
 'The Robertson Trust',
 'Flagship scholarship from one of Scotland''s largest independent funders. Provides up to GBP 4,250 per year for the full duration of an undergraduate programme, plus wellbeing and career support. Nominated — cannot be self-applied.',
 'Up to GBP 4,250/year across your UG degree (nomination only).',
 'funding', 'Up to GBP 4,250/year for duration of UG programme', 'fixed',
 false, false, false, true,
 NULL, NULL, 'Nomination only — ask your school, college, university, or support organisation', 'The Robertson Trust',
 true, false, false, true, false,
 'https://www.therobertsontrust.org.uk/our-themes/education-pathways/the-robertson-trust-scholarship', 75,
 '{}'::jsonb,
 '{"annual_award": 4250, "type": "non-repayable", "covers": "full UG programme"}'::jsonb,
 'The Robertson Trust',
 'You must be nominated — the Trust does not accept direct applications. Contact your school guidance lead or university widening participation office.',
 'Annual — check nominating body',
 'By nomination only — cannot self-apply. Must be nominated by school, college, university, or voluntary organisation. Priority for homelessness, substance misuse, domestic violence, unpaid caring, deep poverty.',
 NULL),

('Carnegie Education Fund',
 'Carnegie Trust for the Universities of Scotland',
 'Undergraduate tuition fee grant from the Carnegie Trust for students who are not eligible for SAAS tuition fee support. Median recipient household income is around GBP 10,000/year.',
 'Up to GBP 1,820/year to cover tuition fees if you''re not eligible for SAAS.',
 'funding', 'Up to GBP 1,820/year (covers tuition fees)', 'fixed',
 false, false, false, true,
 NULL, NULL, 'Apply online at carnegie-trust.org', 'Carnegie Trust',
 true, false, false, true, false,
 'https://carnegie-trust.org/award-schemes/undergraduate-tuition-fee-grants/', 70,
 '{}'::jsonb,
 '{"annual_award": 1820, "covers": "tuition fees"}'::jsonb,
 'Carnegie Trust for the Universities of Scotland',
 'Apply online between 1 June and 1 December via carnegie-trust.org.',
 '1 June to 1 December',
 'For students NOT eligible for SAAS tuition fee support. Low household income (median recipient GBP 10,000/year). Resident in Scotland with at least 2 years secondary schooling in Scotland.',
 NULL),

('The Cross Trust',
 'The Cross Trust',
 'Grants for young Scottish students (under 30) pursuing arts, music or academic study. Awards are discretionary and based on a combination of academic merit and financial need.',
 'Variable grants for under-30s in arts, music, or academic study.',
 'funding', 'Variable grants', 'fixed',
 false, false, true, true,
 NULL, 29, 'Search OSCR for The Cross Trust contact details', 'The Cross Trust',
 true, false, false, true, false,
 'https://www.oscr.org.uk/about-charities/search-the-register/charity-details?number=SC008620', 65,
 '{}'::jsonb,
 '{"type": "variable"}'::jsonb,
 'The Cross Trust',
 'Contact trustees directly — no public application portal. Find contact details via OSCR.',
 'Annual — contact trust direct',
 'Under 30. Scottish birth or parentage. High academic merit required. Financial need. Covers arts, music, and academic study.',
 'Original research pointed to www.crosstrust.org.uk, but the domain did not resolve during verification on 2026-04-11. URL now points at the OSCR charity register entry (charity no. SC008620) — manually confirm trust contact details and update before launch.'),

('Unite Foundation Scholarship',
 'Unite Foundation',
 'National scholarship providing free ensuite accommodation 365 days a year for up to 3 years to care leavers, care-experienced and estranged students under 25. Only 70 awards a year nationally — highly competitive.',
 'Free ensuite accommodation 365 days/year for up to 3 years.',
 'accommodation', 'Free ensuite accommodation 365 days/year for up to 3 years', 'free',
 false, false, false, true,
 NULL, 25, 'Apply via unitefoundation.org.uk', 'Unite Foundation',
 false, false, true, false, false,
 'https://www.unitefoundation.org.uk/scholarship/', 88,
 '{}'::jsonb,
 '{"type": "accommodation", "duration_years": 3, "scholarships_per_year_uk": 70}'::jsonb,
 'Unite Foundation',
 'Apply online at the Unite Foundation website; applications typically open in spring.',
 'Annual — check Unite Foundation website',
 'Care leaver, care experienced, or estranged. Age 25 or under. Home fee status. 70 scholarships nationally per year — competitive.',
 NULL);

-- ============================================================================
-- PART 7 — University-specific Care Experienced top-ups
-- ============================================================================

INSERT INTO student_benefits (
  name, provider, description, short_description, category, discount_value, discount_type,
  eligibility_s1_s4, eligibility_s5_s6, eligibility_college, eligibility_university,
  min_age, max_age, access_method, access_platform,
  is_scotland_only, is_government_scheme, is_care_experienced_only, is_means_tested, is_repayable,
  url, priority_score,
  related_university_id,
  eligibility_details, administering_body
) VALUES

('Edinburgh Access Scholarship (CE)',
 'University of Edinburgh',
 'Care-experienced top-up package at the University of Edinburgh: a bursary amount that varies by income band, plus guaranteed 365-day accommodation, no deposit or guarantor requirement, and graduation support.',
 'Income-banded top-up plus 365-day accommodation and graduation support.',
 'funding', 'Varies by income band — automatic for CESB recipients', 'fixed',
 false, false, false, true,
 NULL, NULL, 'Automatic for CESB recipients; contact the Widening Participation team', 'University of Edinburgh',
 true, false, true, false, false,
 'https://registryservices.ed.ac.uk/student-funding', 80,
 (SELECT id FROM universities WHERE slug = 'edinburgh'),
 '365-day accommodation guaranteed, no deposit/guarantor, graduation support',
 'University of Edinburgh Widening Participation'),

('Glasgow CE & Estranged Student Bursary',
 'University of Glasgow',
 'GBP 1,500/year bursary (5 bursaries available) for care-experienced and estranged students at Glasgow. Paired with 365-day accommodation and access to Undergraduate Talent Scholarships.',
 'GBP 1,500/year + 365-day accommodation + Talent Scholarships.',
 'funding', 'GBP 1,500/year (5 bursaries available)', 'fixed',
 false, false, false, true,
 NULL, NULL, 'Apply via Glasgow widening participation team', 'University of Glasgow',
 true, false, true, false, false,
 'https://www.gla.ac.uk/study/widerparticipation/', 80,
 (SELECT id FROM universities WHERE slug = 'glasgow'),
 'Plus 365-day accommodation, Undergraduate Talent Scholarships',
 'University of Glasgow Widening Participation'),

('St Andrews Access Award + SA Bursary',
 'University of St Andrews',
 'Access Award and St Andrews Bursary — each GBP 500/year — for eligible widening-access and care-experienced students. Includes 365-day accommodation, no deposit or guarantor, and an Employability Bursary worth up to GBP 500.',
 'GBP 500/year each, 365-day accommodation, Employability Bursary up to GBP 500.',
 'funding', 'GBP 500/year each', 'fixed',
 false, false, false, true,
 NULL, NULL, 'Automatic with offer acceptance; contact Money Advice team', 'University of St Andrews',
 true, false, true, false, false,
 'https://www.st-andrews.ac.uk/study/money/undergraduate/', 78,
 (SELECT id FROM universities WHERE slug = 'st-andrews'),
 '365-day accommodation, no deposit/guarantor, Employability Bursary up to GBP 500',
 'University of St Andrews Money Advice'),

('Heriot-Watt Expenses Bursary',
 'Heriot-Watt University',
 'GBP 525 starter-pack bursary (laptop, WiFi, travel) for care-experienced and estranged students at Heriot-Watt. Plus 365-day accommodation and a graduation costs grant.',
 'GBP 525 starter pack + 365-day accommodation + graduation grant.',
 'funding', 'GBP 525 (laptop, WiFi, travel)', 'fixed',
 false, false, false, true,
 NULL, NULL, 'Contact Heriot-Watt student funding team', 'Heriot-Watt University',
 true, false, true, false, false,
 'https://www.hw.ac.uk/uk/students/money/bursaries-scholarships.htm', 76,
 (SELECT id FROM universities WHERE slug = 'heriot-watt'),
 '365-day accommodation, graduation costs grant',
 'Heriot-Watt University Student Funding'),

('Stirling Estranged Students Bursary',
 'University of Stirling',
 'GBP 500 bursary for estranged students at Stirling, paired with 365-day accommodation and no graduation fee.',
 'GBP 500 + 365-day accommodation + no graduation fee.',
 'funding', 'GBP 500', 'fixed',
 false, false, false, true,
 NULL, NULL, 'Contact Stirling Student Support', 'University of Stirling',
 true, false, true, false, false,
 'https://www.stir.ac.uk/student-life/support/money-advice/', 74,
 (SELECT id FROM universities WHERE slug = 'stirling'),
 '365-day accommodation, no graduation fee',
 'University of Stirling Student Support'),

('RGU Unite Foundation Scholarship',
 'Robert Gordon University',
 'Free accommodation for 365 days a year for up to 3 years at Robert Gordon University via the Unite Foundation scheme. Includes financial support for open days and pre-entry visits.',
 'Free accommodation 365 days for up to 3 years, plus pre-entry visit support.',
 'funding', 'Free accommodation 365 days for up to 3 years', 'free',
 false, false, false, true,
 NULL, NULL, 'Apply via Unite Foundation with RGU as host institution', 'RGU / Unite Foundation',
 false, false, true, false, false,
 'https://www.rgu.ac.uk/student-life/widening-access-and-inclusion', 76,
 (SELECT id FROM universities WHERE slug = 'rgu'),
 'Financial support for open days/visits',
 'Robert Gordon University Widening Access');

-- ============================================================================
-- PART 8 — Scottish Child Payment
-- ============================================================================

INSERT INTO student_benefits (
  name, provider, description, short_description, category, discount_value, discount_type,
  eligibility_s1_s4, eligibility_s5_s6, eligibility_college, eligibility_university,
  min_age, max_age, access_method, access_platform,
  is_scotland_only, is_government_scheme, is_care_experienced_only, is_means_tested, is_repayable,
  url, priority_score,
  administering_body, eligibility_details, verification_notes
) VALUES

('Scottish Child Payment',
 'Social Security Scotland',
 'Weekly payment of GBP 28.20 per child under 16 for families receiving qualifying benefits. Receipt of Scottish Child Payment now also unlocks expanded free school meal eligibility across Scotland.',
 'GBP 28.20/week per child under 16 for low-income families.',
 'government', 'GBP 28.20/week per child', 'fixed',
 true, true, false, false,
 NULL, NULL, 'Apply via mygov.scot or Social Security Scotland', 'Social Security Scotland',
 true, true, false, true, false,
 'https://www.mygov.scot/scottish-child-payment', 85,
 'Social Security Scotland',
 'For families with children under 16 receiving qualifying benefits (UC, IS, JSA, ESA, Pension Credit, CTC, WTC). Receipt now qualifies for expanded FSM eligibility.',
 'Increased from GBP 25/week (2023) to GBP 27.15 (April 2025) to GBP 28.20 (April 2026).');

-- ============================================================================
-- PART 9 — Postgraduate funding
-- ============================================================================

INSERT INTO student_benefits (
  name, provider, description, short_description, category, discount_value, discount_type,
  eligibility_s1_s4, eligibility_s5_s6, eligibility_college, eligibility_university,
  min_age, max_age, access_method, access_platform,
  is_scotland_only, is_government_scheme, is_care_experienced_only, is_means_tested, is_repayable,
  url, priority_score,
  administering_body, eligibility_details, award_details
) VALUES

('SAAS Postgraduate Funding',
 'Student Awards Agency Scotland',
 'Combined loan package for taught Masters and PGDip students: up to GBP 7,000 towards tuition fees plus up to GBP 6,900 for living costs. Not means-tested. PhDs are not eligible.',
 'Up to GBP 13,900 total loan for taught Masters / PGDip.',
 'funding', 'Up to GBP 13,900 total (GBP 7,000 tuition fee loan + GBP 6,900 living cost loan)', 'other',
 false, false, false, true,
 NULL, 60, 'Apply via SAAS online account', 'SAAS',
 true, true, false, false, true,
 'https://www.saas.gov.uk/postgraduate', 70,
 'SAAS / Student Loans Company',
 'Taught Masters and PGDip only. PhDs not eligible. Not means-tested. Under 61 for living cost loan.',
 '{"tuition_loan": 7000, "living_loan": 6900, "total": 13900, "repayable": true}'::jsonb);

-- ============================================================================
-- PART 10 — Sport scholarships
-- ============================================================================

INSERT INTO student_benefits (
  name, provider, description, short_description, category, discount_value, discount_type,
  eligibility_s1_s4, eligibility_s5_s6, eligibility_college, eligibility_university,
  min_age, max_age, access_method, access_platform,
  is_scotland_only, is_government_scheme, is_care_experienced_only, is_means_tested, is_repayable,
  url, priority_score,
  administering_body, application_deadline, eligibility_details
) VALUES

('Winning Students 100',
 'Winning Students Scotland',
 'Scholarship for talented student athletes studying in Scotland, covering accommodation, competition fees and equipment. Aimed at those competing in Olympic, Paralympic or Commonwealth sports at national level or above.',
 'Support package for student athletes competing at national level or above.',
 'funding', 'Scholarship covering accommodation, competition fees, equipment', 'other',
 false, false, true, true,
 NULL, NULL, 'Apply online at winningstudents-scotland.ac.uk', 'Winning Students Scotland',
 true, false, false, false, false,
 'https://www.winningstudents-scotland.ac.uk/the-scholarship/', 60,
 'Winning Students Scotland',
 '1 August - 19 September',
 'British passport. 60+ credits at Scottish institution. Olympic, Paralympic, or Commonwealth sport at national level or above.'),

('SportsAid Scotland',
 'SportsAid Scotland',
 'Grants for young talented athletes (aged 12-22) competing at national level. Funds travel, training and equipment costs. Requires nomination by a Scottish Governing Body of Sport.',
 'Grants for travel/training for under-22 athletes competing at national level.',
 'funding', 'Variable grants for travel and training', 'other',
 true, true, true, true,
 12, 22, 'Nomination by Scottish Governing Body of Sport', 'SportsAid Scotland',
 true, false, false, false, false,
 'https://www.sportsaidscotland.org.uk/', 55,
 'SportsAid Scotland',
 'Annual — nomination led',
 'Competing at national level. Nomination by Scottish Governing Body of Sport required.');

-- ============================================================================
-- PART 11 — Discretionary / Hardship Fund
-- ============================================================================

INSERT INTO student_benefits (
  name, provider, description, short_description, category, discount_value, discount_type,
  eligibility_s1_s4, eligibility_s5_s6, eligibility_college, eligibility_university,
  min_age, max_age, access_method, access_platform,
  is_scotland_only, is_government_scheme, is_care_experienced_only, is_means_tested, is_repayable,
  url, priority_score,
  administering_body, eligibility_details
) VALUES

('Discretionary Fund / Hardship Fund',
 'Universities & Colleges Scotland',
 'Non-repayable hardship grants held by every Scottish university and college. Paid from a limited pot and prioritised for lone parents, care-experienced, estranged, student carers and students with dependent children. You must have applied for all available statutory support first.',
 'Non-repayable hardship grants administered by your institution.',
 'funding', 'Non-repayable grants — varies by institution (e.g. Edinburgh caps at GBP 3,000/year)', 'other',
 false, false, true, true,
 NULL, NULL, 'Apply through your institution''s student funding office', 'University/College',
 true, false, false, true, false,
 'https://www.saas.gov.uk/help-support', 78,
 'Individual universities/colleges',
 'Must demonstrate financial shortfall. Must have applied for all available statutory support first. Priority: lone parents, care-experienced, estranged, student carers, those with dependent children. Cash-limited — not all applications successful.');

-- ============================================================================
-- Done
-- ============================================================================

-- Verification query for manual check after applying:
-- SELECT COUNT(*) AS total,
--        COUNT(*) FILTER (WHERE income_thresholds <> '{}'::jsonb) AS with_thresholds,
--        COUNT(*) FILTER (WHERE related_university_id IS NOT NULL) AS uni_specific
-- FROM student_benefits;
