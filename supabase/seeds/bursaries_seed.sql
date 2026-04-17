-- ============================================================================
-- Bursaries seed data (reference copy)
-- ============================================================================
-- Full INSERT of all bursaries. The initial seed is in the migration file
-- 20260419000002_bursary_finder.sql; additions in 20260422000001.
-- This file exists as a consolidated reference for reseeding if needed.
-- ============================================================================

-- Clear existing data (only use when reseeding from scratch)
-- TRUNCATE bursaries CASCADE;

INSERT INTO bursaries (
  name, administering_body, description, student_stages, award_type,
  amount_description, amount_min, amount_max,
  is_means_tested, is_repayable,
  income_threshold_max, requires_care_experience, requires_estranged,
  requires_carer, requires_disability, requires_refugee_or_asylum,
  requires_young_parent,
  simd_quintile_max, min_age, max_age, specific_courses,
  requires_scottish_residency,
  application_process, url, notes,
  academic_year, last_verified_date
) VALUES
-- 1. Education Maintenance Allowance (EMA)
(
  'Education Maintenance Allowance',
  'Scottish Government (administered by local councils)',
  'Weekly payment for S5 and S6 pupils from low-income households who stay in non-advanced education.',
  ARRAY['S5','S6'], 'grant',
  '£30 per week (term time)', 30, 30,
  true, false,
  26884, NULL, NULL, NULL, NULL, NULL, NULL,
  NULL, 16, 19, NULL,
  true,
  'Apply through your local council or school.',
  'https://www.mygov.scot/ema',
  'Household income thresholds: £24,421 (one dependent child) or £26,884 (two or more dependent children).',
  '2025-26', '2026-04-01'
),
-- 2. School Clothing Grant
(
  'School Clothing Grant',
  'Scottish local councils',
  'Annual grant to help with the cost of school uniforms and clothing.',
  ARRAY['S1','S2','S3','S4','S5','S6'], 'grant',
  'Minimum £120-£150 per year (varies by council)', 120, 150,
  true, false,
  NULL, NULL, NULL, NULL, NULL, NULL, NULL,
  NULL, NULL, NULL, NULL,
  true,
  'Apply through your local council.',
  'https://www.mygov.scot/school-grants',
  'Requires receipt of a qualifying benefit (e.g. Universal Credit, Income Support). Exact amount set by each council.',
  '2025-26', '2026-04-01'
),
-- 3. Free School Meals
(
  'Free School Meals',
  'Scottish local councils',
  'Free lunch for pupils in families on qualifying benefits. P1-P5 are universal; P6 onwards means-tested.',
  ARRAY['S1','S2','S3','S4','S5','S6'], 'entitlement',
  'Free school meals during term time', NULL, NULL,
  true, false,
  NULL, NULL, NULL, NULL, NULL, NULL, NULL,
  NULL, NULL, NULL, NULL,
  true,
  'Apply through your local council.',
  'https://www.mygov.scot/school-meals',
  'Requires receipt of a qualifying benefit (e.g. Universal Credit below earnings threshold, Income Support, JSA).',
  '2025-26', '2026-04-01'
),
-- 4. Free Bus Travel (Young Scot)
(
  'Young Persons'' Free Bus Travel Scheme',
  'Transport Scotland (via Young Scot NEC card)',
  'Free bus travel across Scotland for under-22s on registered services.',
  ARRAY['S1','S2','S3','S4','S5','S6','FE','undergraduate'], 'entitlement',
  'Unlimited free bus travel', NULL, NULL,
  false, false,
  NULL, NULL, NULL, NULL, NULL, NULL, NULL,
  NULL, NULL, 21, NULL,
  true,
  'Apply for a Young Scot NEC with bus travel added, via young.scot or local council.',
  'https://young.scot/',
  'Universal for Scotland residents aged 5 to 21.',
  '2025-26', '2026-04-01'
),
-- 5. Scottish Child Payment
(
  'Scottish Child Payment',
  'Social Security Scotland',
  'Weekly payment for families with children under 16 who receive qualifying benefits.',
  ARRAY['S1','S2','S3','S4','S5','S6'], 'grant',
  '£28.20 per week per child', 28.20, 28.20,
  true, false,
  NULL, NULL, NULL, NULL, NULL, NULL, NULL,
  NULL, NULL, 15, NULL,
  true,
  'Apply via mygov.scot or Social Security Scotland.',
  'https://www.mygov.scot/scottish-child-payment',
  'Paid to the parent/carer, not the young person. Requires qualifying benefit (e.g. Universal Credit, Child Tax Credit).',
  '2025-26', '2026-04-01'
),
-- 6. Young Students'' Bursary
(
  'Young Students'' Bursary',
  'Student Awards Agency Scotland (SAAS)',
  'Means-tested bursary for full-time undergraduates under 25, replacing part of the student loan with non-repayable funding.',
  ARRAY['undergraduate'], 'bursary',
  '£500-£2,000 per year', 500, 2000,
  true, false,
  34000, NULL, NULL, NULL, NULL, NULL, NULL,
  NULL, NULL, 24, NULL,
  true,
  'Apply online via SAAS when submitting your funding application.',
  'https://www.saas.gov.uk/full-time/undergraduates/student-loan-bursary-tuition-fees',
  'Bursary amount tapers with household income. Non-repayable.',
  '2025-26', '2026-04-01'
),
-- 7. Independent Students'' Bursary
(
  'Independent Students'' Bursary',
  'Student Awards Agency Scotland (SAAS)',
  'Means-tested bursary for undergraduates classed as independent (25+, married, a parent, or self-supporting for 3+ years).',
  ARRAY['undergraduate'], 'bursary',
  'Up to £1,000 per year', NULL, 1000,
  true, false,
  21000, NULL, NULL, NULL, NULL, NULL, NULL,
  NULL, 25, NULL, NULL,
  true,
  'Apply online via SAAS when submitting your funding application.',
  'https://www.saas.gov.uk/full-time/undergraduates/student-loan-bursary-tuition-fees',
  'Also available to students under 25 who meet independent status criteria (married, parent, self-supporting 3+ years, or care leaver).',
  '2025-26', '2026-04-01'
),
-- 8. Care Experienced Students'' Bursary (CESB)
(
  'Care Experienced Students'' Bursary',
  'Student Awards Agency Scotland (SAAS)',
  'Non-means-tested, non-repayable bursary for students with care experience at any point in their lives.',
  ARRAY['undergraduate','FE'], 'bursary',
  '£9,000 per year', 9000, 9000,
  false, false,
  NULL, true, NULL, NULL, NULL, NULL, NULL,
  NULL, NULL, NULL, NULL,
  true,
  'Apply via SAAS with evidence of care experience from a local authority or equivalent.',
  'https://www.saas.gov.uk/full-time/support-for-care-experienced-students/bursary',
  'Replaces the student loan for eligible care-experienced students. Not repayable.',
  '2025-26', '2026-04-01'
),
-- 9. Summer Accommodation Grant
(
  'Summer Accommodation Grant',
  'Student Awards Agency Scotland (SAAS)',
  'Grant to cover accommodation costs over the summer for care-experienced students.',
  ARRAY['undergraduate','FE'], 'accommodation',
  '£665-£1,330', 665, 1330,
  false, false,
  NULL, true, NULL, NULL, NULL, NULL, NULL,
  NULL, NULL, NULL, NULL,
  true,
  'Apply via SAAS alongside the Care Experienced Students'' Bursary.',
  'https://www.saas.gov.uk/full-time/support-for-care-experienced-students/bursary',
  'Paid in addition to the Care Experienced Students'' Bursary to cover non-term-time accommodation.',
  '2025-26', '2026-04-01'
),
-- 10. Lone Parent Grant
(
  'Lone Parent Grant',
  'Student Awards Agency Scotland (SAAS)',
  'Means-tested grant to help lone parents with the extra costs of being a single parent while studying.',
  ARRAY['undergraduate'], 'grant',
  'Up to £1,305 per year', NULL, 1305,
  true, false,
  NULL, NULL, NULL, NULL, NULL, NULL, true,
  NULL, NULL, NULL, NULL,
  true,
  'Apply online via SAAS.',
  'https://www.saas.gov.uk',
  'Paid to single parents in full-time higher education.',
  '2025-26', '2026-04-01'
),
-- 11. Lone Parents'' Childcare Grant
(
  'Lone Parents'' Childcare Grant',
  'Student Awards Agency Scotland (SAAS)',
  'Means-tested grant to help lone parents cover the cost of registered childcare while studying.',
  ARRAY['undergraduate'], 'grant',
  'Up to £1,215 per year', NULL, 1215,
  true, false,
  NULL, NULL, NULL, NULL, NULL, NULL, true,
  NULL, NULL, NULL, NULL,
  true,
  'Apply online via SAAS.',
  'https://www.saas.gov.uk',
  'Covers registered childcare costs for lone parents in full-time higher education.',
  '2025-26', '2026-04-01'
),
-- 12. Dependants'' Grant
(
  'Dependants'' Grant',
  'Student Awards Agency Scotland (SAAS)',
  'Means-tested grant for students with dependent adults or children to help with extra costs while studying.',
  ARRAY['undergraduate'], 'grant',
  'Up to £2,640 per year', NULL, 2640,
  true, false,
  NULL, NULL, NULL, NULL, NULL, NULL, NULL,
  NULL, NULL, NULL, NULL,
  true,
  'Apply online via SAAS.',
  'https://www.saas.gov.uk',
  'Available to students with financially dependent family members.',
  '2025-26', '2026-04-01'
),
-- 13. Disabled Students'' Allowance
(
  'Disabled Students'' Allowance',
  'Student Awards Agency Scotland (SAAS)',
  'Non-means-tested support to cover disability-related study costs (equipment, support workers, travel).',
  ARRAY['undergraduate','FE'], 'grant',
  'Up to £26,291 per year', NULL, 26291,
  false, false,
  NULL, NULL, NULL, NULL, true, NULL, NULL,
  NULL, NULL, NULL, NULL,
  true,
  'Apply via SAAS with supporting medical evidence and a needs assessment.',
  'https://www.saas.gov.uk/full-time/undergraduates/disabled-students-allowance',
  'Covers equipment, non-medical personal help, and disability-related travel costs.',
  '2025-26', '2026-04-01'
),
-- 14. Travel Expenses Grant (Islands)
(
  'Travel Expenses Grant (Islands)',
  'Student Awards Agency Scotland (SAAS)',
  'Grant covering actual travel costs for students living on Scottish islands who need to travel to the mainland for study.',
  ARRAY['undergraduate'], 'grant',
  'Actual travel costs reimbursed', NULL, NULL,
  false, false,
  NULL, NULL, NULL, NULL, NULL, NULL, NULL,
  NULL, NULL, NULL, NULL,
  true,
  'Apply via SAAS with evidence of island residency and travel costs.',
  'https://www.saas.gov.uk',
  'For students ordinarily resident on a Scottish island attending a mainland institution.',
  '2025-26', '2026-04-01'
),
-- 15. Unite Foundation Scholarship
(
  'Unite Foundation Scholarship',
  'Unite Foundation',
  'Free student accommodation for up to three years (365 days per year) for care-experienced or estranged young people.',
  ARRAY['undergraduate'], 'accommodation',
  'Free accommodation (365 days/year) for up to 3 years', NULL, NULL,
  false, false,
  NULL, true, NULL, NULL, NULL, NULL, NULL,
  NULL, NULL, 24, NULL,
  true,
  'Apply online via the Unite Foundation website; selection is competitive.',
  'https://www.unitefoundation.org.uk/scholarship/',
  'Eligibility is care-experienced OR estranged (under 25, starting undergraduate at a partner institution).',
  '2025-26', '2026-04-01'
),
-- 16. Scottish Child Payment
(
  'Scottish Child Payment',
  'Social Security Scotland',
  'Weekly payment for families with children under 16 who receive qualifying benefits.',
  ARRAY['S1','S2','S3','S4','S5','S6'], 'grant',
  '£28.20 per week per child', 28.20, 28.20,
  true, false,
  NULL, NULL, NULL, NULL, NULL, NULL, NULL,
  NULL, NULL, 15, NULL,
  true,
  'Apply via mygov.scot or Social Security Scotland.',
  'https://www.mygov.scot/scottish-child-payment',
  'Paid to the parent/carer, not the young person. Requires qualifying benefit.',
  '2025-26', '2026-04-01'
),
-- 17. Young Carer Grant
(
  'Young Carer Grant',
  'Social Security Scotland',
  'One-off annual payment for young carers aged 16-18 who provide regular unpaid care.',
  ARRAY['S5','S6'], 'grant',
  '£378.98 (one-off annual payment)', 378.98, 378.98,
  false, false,
  NULL, NULL, NULL, true, NULL, NULL, NULL,
  NULL, 16, 18, NULL,
  true,
  'Apply online via mygov.scot or Social Security Scotland.',
  'https://www.mygov.scot/young-carer-grant',
  'Must care for someone who receives a qualifying disability benefit for an average of 16+ hours per week.',
  '2025-26', '2026-04-01'
),
-- 18. Best Start Grant School Age Payment
(
  'Best Start Grant School Age Payment',
  'Social Security Scotland',
  'One-off payment to help with costs when a child starts or moves to a new school.',
  ARRAY['S1'], 'grant',
  '£294.70 (one-off)', 294.70, 294.70,
  true, false,
  NULL, NULL, NULL, NULL, NULL, NULL, NULL,
  NULL, NULL, NULL, NULL,
  true,
  'Apply via mygov.scot or Social Security Scotland.',
  'https://www.mygov.scot/best-start-grant-best-start-foods',
  'Paid to parent/carer. Requires qualifying benefit. For children starting P1 or transitioning to secondary.',
  '2025-26', '2026-04-01'
),
-- 19. Supplementary Grant for Mature Students
(
  'Supplementary Grant for Mature Students',
  'Student Awards Agency Scotland (SAAS)',
  'Additional grant for students aged 25 or over in further or higher education.',
  ARRAY['FE','undergraduate'], 'grant',
  'Up to £1,072 per year', NULL, 1072,
  true, false,
  NULL, NULL, NULL, NULL, NULL, NULL, NULL,
  NULL, 25, NULL, NULL,
  true,
  'Apply via SAAS as part of your funding application.',
  'https://www.saas.gov.uk',
  'For mature students (25+) in full-time FE or HE courses.',
  '2025-26', '2026-04-01'
),
-- 20. Further Education Bursary
(
  'Further Education Bursary',
  'Colleges Scotland (individual college bursary funds)',
  'Means-tested bursary for full-time further education students at Scottish colleges.',
  ARRAY['FE'], 'bursary',
  'Variable (typically £500-£4,000 per year)', 500, 4000,
  true, false,
  NULL, NULL, NULL, NULL, NULL, NULL, NULL,
  NULL, NULL, NULL, NULL,
  true,
  'Apply directly to your college''s student funding team.',
  NULL,
  'Amount varies by college and personal circumstances. Covers living costs, travel, and study materials.',
  '2025-26', '2026-04-01'
),
-- 21. Discretionary / Hardship Fund
(
  'Discretionary / Hardship Fund',
  'Individual Scottish universities',
  'Emergency or supplementary funding for students in financial difficulty.',
  ARRAY['undergraduate'], 'grant',
  'Variable (one-off or recurring)', NULL, NULL,
  true, false,
  NULL, NULL, NULL, NULL, NULL, NULL, NULL,
  NULL, NULL, NULL, NULL,
  true,
  'Apply to your university''s student services or funding office.',
  NULL,
  'Available to students who have already accessed all statutory funding. Prioritised for care-experienced, estranged, and disabled students at many institutions.',
  '2025-26', '2026-04-01'
),
-- 22. Care Experienced Bursary for FE Students
(
  'Care Experienced Bursary for FE Students',
  'Colleges Scotland / Scottish Funding Council',
  'Non-means-tested bursary for care-experienced students in further education.',
  ARRAY['FE'], 'bursary',
  '£8,100 per year', 8100, 8100,
  false, false,
  NULL, true, NULL, NULL, NULL, NULL, NULL,
  NULL, NULL, NULL, NULL,
  true,
  'Apply through your college with evidence of care experience.',
  NULL,
  'Similar to the SAAS Care Experienced Students'' Bursary but for FE-level study. Non-repayable.',
  '2025-26', '2026-04-01'
),
-- 23. Carer''s Allowance
(
  'Carer''s Allowance',
  'Department for Work and Pensions (DWP)',
  'Weekly payment for people who spend at least 35 hours a week caring for someone with a qualifying disability.',
  ARRAY['S4','S5','S6','FE','undergraduate'], 'entitlement',
  '£81.90 per week', 81.90, 81.90,
  false, false,
  NULL, NULL, NULL, true, NULL, NULL, NULL,
  NULL, 16, NULL, NULL,
  true,
  'Apply online via gov.uk or by phone.',
  'https://www.gov.uk/carers-allowance',
  'Must be 16+, care for someone 35+ hours per week, and earn no more than £151 per week after deductions.',
  '2025-26', '2026-04-01'
),
-- 24. Paramedic, Nursing and Midwifery Students'' Bursary
(
  'Paramedic, Nursing and Midwifery Students'' Bursary',
  'Scottish Government (administered by SAAS)',
  'Non-means-tested bursary for eligible nursing, midwifery, and paramedic students.',
  ARRAY['undergraduate'], 'bursary',
  '£10,000 per year', 10000, 10000,
  false, false,
  NULL, NULL, NULL, NULL, NULL, NULL, NULL,
  NULL, NULL, NULL, ARRAY['nursing','midwifery','paramedic'],
  true,
  'Apply via SAAS with course confirmation.',
  'https://www.gov.scot/publications/support-paramedic-nursing-midwifery-students-scotland-academic-year-2025-2026/',
  'Replaces standard SAAS funding for eligible healthcare courses. Non-repayable.',
  '2025-26', '2026-04-01'
),
-- 25. Estranged Students Support Package
(
  'Estranged Students Support Package',
  'Student Awards Agency Scotland (SAAS)',
  'Enhanced funding package for students with no contact with, or support from, their biological, adoptive, or step-parents.',
  ARRAY['undergraduate'], 'bursary',
  'Total package up to £11,400', 11400, 11400,
  false, false,
  NULL, NULL, true, NULL, NULL, NULL, NULL,
  NULL, NULL, NULL, NULL,
  true,
  'Apply via SAAS with supporting evidence of estrangement.',
  'https://www.saas.gov.uk',
  'Combines maximum bursary and loan entitlements. Estrangement must be ongoing and irreconcilable.',
  '2025-26', '2026-04-01'
),
-- 26. Carnegie Trust Undergraduate Fee Grant
(
  'Carnegie Trust Undergraduate Fee Grant',
  'Carnegie Trust for the Universities of Scotland',
  'Grant towards tuition fees for Scottish-domiciled undergraduates not eligible for SAAS tuition fee funding.',
  ARRAY['undergraduate'], 'fee_waiver',
  'Up to £1,820 per year', NULL, 1820,
  false, false,
  NULL, NULL, NULL, NULL, NULL, NULL, NULL,
  NULL, NULL, NULL, NULL,
  true,
  'Apply online to the Carnegie Trust after SAAS has confirmed ineligibility.',
  'https://carnegie-trust.org/award-schemes/undergraduate-tuition-fee-grants/',
  'Only for students NOT eligible for SAAS tuition fee funding (e.g. second-degree students, some course changes).',
  '2025-26', '2026-04-01'
),
-- 27. Robertson Trust Scholarship
(
  'Robertson Trust Scholarship',
  'The Robertson Trust',
  'Scholarships for Scottish students from low-income or widening-access backgrounds.',
  ARRAY['undergraduate'], 'bursary',
  'Varies by stream (financial award plus wraparound support)', NULL, NULL,
  true, false,
  NULL, true, NULL, NULL, NULL, NULL, NULL,
  NULL, NULL, NULL, NULL,
  true,
  'Apply online to The Robertson Trust; streams include Journey and Sixth Year.',
  'https://www.therobertsontrust.org.uk',
  'Widening-access backgrounds also eligible (e.g. SIMD20/40, free school meals, first generation).',
  '2025-26', '2026-04-01'
),
-- 28. Free Tuition Fees (SAAS)
(
  'Free Tuition Fees (SAAS)',
  'Student Awards Agency Scotland (SAAS)',
  'SAAS pays tuition fees in full for eligible Scottish-domiciled undergraduates at Scottish universities.',
  ARRAY['undergraduate'], 'fee_waiver',
  'Full tuition fees paid (typically £1,820 per year)', NULL, 1820,
  false, false,
  NULL, NULL, NULL, NULL, NULL, NULL, NULL,
  NULL, NULL, NULL, NULL,
  true,
  'Apply online via SAAS at the start of each academic year.',
  'https://www.saas.gov.uk',
  'Universal for eligible Scottish-domiciled undergraduates studying at a Scottish institution.',
  '2025-26', '2026-04-01'
),
-- 29. Council Tax Exemption for Full-Time Students
(
  'Council Tax Exemption for Full-Time Students',
  'Scottish local councils',
  'Full-time students are exempt from Council Tax on their term-time address.',
  ARRAY['FE','undergraduate'], 'entitlement',
  'Full Council Tax exemption', NULL, NULL,
  false, false,
  NULL, NULL, NULL, NULL, NULL, NULL, NULL,
  NULL, NULL, NULL, NULL,
  true,
  'Request a student status letter from your institution and send it to your local council.',
  'https://www.mygov.scot/council-tax/discounts-and-exemptions',
  'A household is exempt if all adult residents are full-time students; otherwise a discount may apply.',
  '2025-26', '2026-04-01'
),
-- 30. Free NHS Prescriptions
(
  'Free NHS Prescriptions',
  'NHS Scotland',
  'All NHS prescriptions in Scotland are free of charge.',
  ARRAY['S1','S2','S3','S4','S5','S6','FE','undergraduate'], 'entitlement',
  'Free prescriptions for all residents', NULL, NULL,
  false, false,
  NULL, NULL, NULL, NULL, NULL, NULL, NULL,
  NULL, NULL, NULL, NULL,
  true,
  'Automatic -- present your prescription at any Scottish pharmacy.',
  NULL,
  'Universal for everyone living in Scotland.',
  '2025-26', '2026-04-01'
),
-- 31. Free NHS Eye Tests
(
  'Free NHS Eye Tests',
  'NHS Scotland',
  'All NHS-funded eye examinations in Scotland are free of charge.',
  ARRAY['S1','S2','S3','S4','S5','S6','FE','undergraduate'], 'entitlement',
  'Free eye examinations', NULL, NULL,
  false, false,
  NULL, NULL, NULL, NULL, NULL, NULL, NULL,
  NULL, NULL, NULL, NULL,
  true,
  'Book a free NHS eye test at any participating optometrist.',
  NULL,
  'Universal for everyone living in Scotland.',
  '2025-26', '2026-04-01'
),
-- 32. Young Persons'' Free Bus Travel
(
  'Young Persons'' Free Bus Travel Scheme',
  'Transport Scotland (via Young Scot NEC card)',
  'Free bus travel across Scotland for under-22s on registered services.',
  ARRAY['S1','S2','S3','S4','S5','S6','FE','undergraduate'], 'entitlement',
  'Unlimited free bus travel', NULL, NULL,
  false, false,
  NULL, NULL, NULL, NULL, NULL, NULL, NULL,
  NULL, NULL, 21, NULL,
  true,
  'Apply for a Young Scot NEC with bus travel added, via young.scot or local council.',
  'https://young.scot/',
  'Universal for Scotland residents aged 5 to 21.',
  '2025-26', '2026-04-01'
)
ON CONFLICT DO NOTHING;
