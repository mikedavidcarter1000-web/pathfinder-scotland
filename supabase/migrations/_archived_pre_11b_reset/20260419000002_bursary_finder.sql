-- ============================================================================
-- Bursary Finder: schema + seed for entitlement matching
-- ============================================================================
-- Adds a rich bursary catalogue with eligibility criteria so the platform can
-- match students to financial support based on their profile (care status,
-- household income, SIMD, age, course, residency, etc.).
--
-- Distinct from `student_benefits` (commercial discounts + top-level
-- entitlements): this table focuses on means-tested and circumstance-specific
-- financial awards with machine-matchable criteria.
-- ============================================================================

-- ============================================================================
-- Tables
-- ============================================================================

CREATE TABLE bursaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  administering_body TEXT NOT NULL,
  description TEXT,
  student_stages TEXT[] NOT NULL,
  award_type TEXT NOT NULL CHECK (award_type IN (
    'grant','bursary','fee_waiver','accommodation','loan','discount','entitlement'
  )),
  amount_description TEXT,
  amount_min DECIMAL,
  amount_max DECIMAL,
  is_means_tested BOOLEAN DEFAULT false,
  is_repayable BOOLEAN DEFAULT false,

  -- Eligibility criteria (NULL = not a factor)
  income_threshold_max DECIMAL,
  requires_care_experience BOOLEAN,
  requires_estranged BOOLEAN,
  requires_carer BOOLEAN,
  requires_disability BOOLEAN,
  requires_refugee_or_asylum BOOLEAN,
  simd_quintile_max INT,
  min_age INT,
  max_age INT,
  specific_courses TEXT[],
  requires_scottish_residency BOOLEAN DEFAULT true,

  application_process TEXT,
  application_deadline TEXT,
  url TEXT,
  notes TEXT,

  is_active BOOLEAN DEFAULT true,
  last_verified_date DATE,
  academic_year TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Per-student match/tracking table. `students.id` IS `auth.users.id` in this
-- schema, so the RLS policy uses `student_id = auth.uid()` directly rather
-- than joining through a `user_id` column (which does not exist on `students`).
CREATE TABLE student_bursary_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  bursary_id UUID REFERENCES bursaries(id) ON DELETE CASCADE,
  match_status TEXT DEFAULT 'eligible' CHECK (match_status IN (
    'eligible','applied','received','dismissed'
  )),
  matched_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, bursary_id)
);

-- ============================================================================
-- RLS
-- ============================================================================

ALTER TABLE bursaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_bursary_matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active bursaries" ON bursaries
  FOR SELECT USING (is_active = true);

CREATE POLICY "Users see own matches" ON student_bursary_matches
  FOR ALL USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

-- ============================================================================
-- Indexes
-- ============================================================================

CREATE INDEX idx_bursaries_stages ON bursaries USING GIN (student_stages);
CREATE INDEX idx_bursaries_courses ON bursaries USING GIN (specific_courses);
CREATE INDEX idx_bursaries_active ON bursaries(is_active);
CREATE INDEX idx_bursaries_means_tested ON bursaries(is_means_tested);
CREATE INDEX idx_sbm_student ON student_bursary_matches(student_id);
CREATE INDEX idx_sbm_bursary ON student_bursary_matches(bursary_id);
CREATE INDEX idx_sbm_status ON student_bursary_matches(match_status);

-- ============================================================================
-- Seed: bursaries (AY 2025-26, verified 2026-04-01)
-- ============================================================================
-- Column order in the INSERT:
--   name, administering_body, description, student_stages, award_type,
--   amount_description, amount_min, amount_max,
--   is_means_tested, is_repayable,
--   income_threshold_max, requires_care_experience, requires_estranged,
--   requires_carer, requires_disability, requires_refugee_or_asylum,
--   simd_quintile_max, min_age, max_age, specific_courses,
--   requires_scottish_residency,
--   application_process, url, notes,
--   academic_year, last_verified_date
-- ============================================================================

INSERT INTO bursaries (
  name, administering_body, description, student_stages, award_type,
  amount_description, amount_min, amount_max,
  is_means_tested, is_repayable,
  income_threshold_max, requires_care_experience, requires_estranged,
  requires_carer, requires_disability, requires_refugee_or_asylum,
  simd_quintile_max, min_age, max_age, specific_courses,
  requires_scottish_residency,
  application_process, url, notes,
  academic_year, last_verified_date
) VALUES
-- 1. EMA
(
  'Education Maintenance Allowance',
  'Scottish Government (administered by local councils)',
  'Weekly payment for S5 and S6 pupils from low-income households who stay in non-advanced education.',
  ARRAY['S5','S6'], 'grant',
  '£30 per week (term time)', 30, 30,
  true, false,
  26884, NULL, NULL, NULL, NULL, NULL,
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
  'Minimum £120–£150 per year (varies by council)', 120, 150,
  true, false,
  NULL, NULL, NULL, NULL, NULL, NULL,
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
  'Free lunch for pupils in families on qualifying benefits. P1–P5 are universal; P6 onwards means-tested.',
  ARRAY['S1','S2','S3','S4','S5','S6'], 'entitlement',
  'Free school meals during term time', NULL, NULL,
  true, false,
  NULL, NULL, NULL, NULL, NULL, NULL,
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
  NULL, NULL, NULL, NULL, NULL, NULL,
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
  NULL, NULL, NULL, NULL, NULL, NULL,
  NULL, NULL, 15, NULL,
  true,
  'Apply via mygov.scot or Social Security Scotland.',
  'https://www.mygov.scot/scottish-child-payment',
  'Paid to the parent/carer, not the young person. Requires qualifying benefit (e.g. Universal Credit, Child Tax Credit).',
  '2025-26', '2026-04-01'
),
-- 6. Young Students' Bursary
(
  'Young Students'' Bursary',
  'Student Awards Agency Scotland (SAAS)',
  'Means-tested bursary for full-time undergraduates under 25, replacing part of the student loan with non-repayable funding.',
  ARRAY['undergraduate'], 'bursary',
  '£500–£2,000 per year', 500, 2000,
  true, false,
  34000, NULL, NULL, NULL, NULL, NULL,
  NULL, NULL, 24, NULL,
  true,
  'Apply online via SAAS when submitting your funding application.',
  'https://www.saas.gov.uk/full-time/undergraduates/student-loan-bursary-tuition-fees',
  'Bursary amount tapers with household income. Non-repayable.',
  '2025-26', '2026-04-01'
),
-- 7. Independent Students' Bursary
(
  'Independent Students'' Bursary',
  'Student Awards Agency Scotland (SAAS)',
  'Means-tested bursary for undergraduates classed as independent (25+, married, a parent, or self-supporting for 3+ years).',
  ARRAY['undergraduate'], 'bursary',
  'Up to £1,000 per year', NULL, 1000,
  true, false,
  21000, NULL, NULL, NULL, NULL, NULL,
  NULL, 25, NULL, NULL,
  true,
  'Apply online via SAAS when submitting your funding application.',
  'https://www.saas.gov.uk/full-time/undergraduates/student-loan-bursary-tuition-fees',
  'Also available to students under 25 who meet independent status criteria (married, parent, self-supporting 3+ years, or care leaver).',
  '2025-26', '2026-04-01'
),
-- 8. Care Experienced Students' Bursary (CESB)
(
  'Care Experienced Students'' Bursary',
  'Student Awards Agency Scotland (SAAS)',
  'Non-means-tested, non-repayable bursary for students with care experience at any point in their lives.',
  ARRAY['undergraduate','FE'], 'bursary',
  '£9,000 per year', 9000, 9000,
  false, false,
  NULL, true, NULL, NULL, NULL, NULL,
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
  '£665–£1,330', 665, 1330,
  false, false,
  NULL, true, NULL, NULL, NULL, NULL,
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
  NULL, NULL, NULL, NULL, NULL, NULL,
  NULL, NULL, NULL, NULL,
  true,
  'Apply online via SAAS.',
  'https://www.saas.gov.uk',
  'Paid to single parents in full-time higher education.',
  '2025-26', '2026-04-01'
),
-- 11. Lone Parents' Childcare Grant
(
  'Lone Parents'' Childcare Grant',
  'Student Awards Agency Scotland (SAAS)',
  'Means-tested grant to help lone parents cover the cost of registered childcare while studying.',
  ARRAY['undergraduate'], 'grant',
  'Up to £1,215 per year', NULL, 1215,
  true, false,
  NULL, NULL, NULL, NULL, NULL, NULL,
  NULL, NULL, NULL, NULL,
  true,
  'Apply online via SAAS.',
  'https://www.saas.gov.uk',
  'Covers registered childcare costs for lone parents in full-time higher education.',
  '2025-26', '2026-04-01'
),
-- 12. Disabled Students' Allowance
(
  'Disabled Students'' Allowance',
  'Student Awards Agency Scotland (SAAS)',
  'Non-means-tested support to cover disability-related study costs (equipment, support workers, travel).',
  ARRAY['undergraduate','FE'], 'grant',
  'Up to £26,291 per year', NULL, 26291,
  false, false,
  NULL, NULL, NULL, NULL, true, NULL,
  NULL, NULL, NULL, NULL,
  true,
  'Apply via SAAS with supporting medical evidence and a needs assessment.',
  'https://www.saas.gov.uk/full-time/undergraduates/disabled-students-allowance',
  'Covers equipment, non-medical personal help, and disability-related travel costs.',
  '2025-26', '2026-04-01'
),
-- 13. Paramedic, Nursing and Midwifery Students' Bursary (PNMSB)
(
  'Paramedic, Nursing and Midwifery Students'' Bursary',
  'Scottish Government (administered by SAAS)',
  'Non-means-tested bursary for eligible nursing, midwifery, and paramedic students.',
  ARRAY['undergraduate'], 'bursary',
  '£10,000 per year', 10000, 10000,
  false, false,
  NULL, NULL, NULL, NULL, NULL, NULL,
  NULL, NULL, NULL, ARRAY['nursing','midwifery','paramedic'],
  true,
  'Apply via SAAS with course confirmation.',
  'https://www.gov.scot/publications/support-paramedic-nursing-midwifery-students-scotland-academic-year-2025-2026/',
  'Replaces standard SAAS funding for eligible healthcare courses. Non-repayable.',
  '2025-26', '2026-04-01'
),
-- 14. Estranged Students Support Package
(
  'Estranged Students Support Package',
  'Student Awards Agency Scotland (SAAS)',
  'Enhanced funding package for students with no contact with, or support from, their biological, adoptive, or step-parents.',
  ARRAY['undergraduate'], 'bursary',
  'Total package up to £11,400', 11400, 11400,
  false, false,
  NULL, NULL, true, NULL, NULL, NULL,
  NULL, NULL, NULL, NULL,
  true,
  'Apply via SAAS with supporting evidence of estrangement (e.g. Stand Alone Pledge supporting letter).',
  'https://www.saas.gov.uk',
  'Combines maximum bursary and loan entitlements. Estrangement must be ongoing and irreconcilable.',
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
  NULL, true, NULL, NULL, NULL, NULL,
  NULL, NULL, 24, NULL,
  true,
  'Apply online via the Unite Foundation website; selection is competitive.',
  'https://www.unitefoundation.org.uk/scholarship/',
  'Eligibility is care-experienced OR estranged (under 25, starting undergraduate at a partner institution). Matching logic should OR the two flags — this row sets requires_care_experience=true but estranged-only students also qualify.',
  '2025-26', '2026-04-01'
),
-- 16. Carnegie Trust Undergraduate Fee Grant
(
  'Carnegie Trust Undergraduate Fee Grant',
  'Carnegie Trust for the Universities of Scotland',
  'Grant towards tuition fees for Scottish-domiciled undergraduates not eligible for SAAS tuition fee funding.',
  ARRAY['undergraduate'], 'fee_waiver',
  'Up to £1,820 per year', NULL, 1820,
  false, false,
  NULL, NULL, NULL, NULL, NULL, NULL,
  NULL, NULL, NULL, NULL,
  true,
  'Apply online to the Carnegie Trust after SAAS has confirmed ineligibility.',
  'https://carnegie-trust.org/award-schemes/undergraduate-tuition-fee-grants/',
  'Only for students NOT eligible for SAAS tuition fee funding (e.g. second-degree students, some course changes).',
  '2025-26', '2026-04-01'
),
-- 17. Robertson Trust Scholarship
(
  'Robertson Trust Scholarship',
  'The Robertson Trust',
  'Scholarships for Scottish students from low-income or widening-access backgrounds, with dedicated care-experienced and estranged streams.',
  ARRAY['undergraduate'], 'bursary',
  'Varies by stream (financial award plus wraparound support)', NULL, NULL,
  true, false,
  NULL, true, NULL, NULL, NULL, NULL,
  NULL, NULL, NULL, NULL,
  true,
  'Apply online to The Robertson Trust; streams include Journey and Sixth Year.',
  'https://www.therobertsontrust.org.uk',
  'Widening-access backgrounds also eligible (e.g. SIMD20/40, free school meals, first generation). Matching logic should OR care-experience with widening-access indicators.',
  '2025-26', '2026-04-01'
),
-- 18. Free Tuition Fees (SAAS)
(
  'Free Tuition Fees (SAAS)',
  'Student Awards Agency Scotland (SAAS)',
  'SAAS pays tuition fees in full for eligible Scottish-domiciled undergraduates at Scottish universities.',
  ARRAY['undergraduate'], 'fee_waiver',
  'Full tuition fees paid (typically £1,820 per year)', NULL, 1820,
  false, false,
  NULL, NULL, NULL, NULL, NULL, NULL,
  NULL, NULL, NULL, NULL,
  true,
  'Apply online via SAAS at the start of each academic year.',
  'https://www.saas.gov.uk',
  'Universal for eligible Scottish-domiciled undergraduates studying at a Scottish institution.',
  '2025-26', '2026-04-01'
),
-- 19. Council Tax exemption for full-time students
(
  'Council Tax Exemption for Full-Time Students',
  'Scottish local councils',
  'Full-time students are exempt from Council Tax on their term-time address.',
  ARRAY['FE','undergraduate'], 'entitlement',
  'Full Council Tax exemption', NULL, NULL,
  false, false,
  NULL, NULL, NULL, NULL, NULL, NULL,
  NULL, NULL, NULL, NULL,
  true,
  'Request a student status letter from your institution and send it to your local council.',
  'https://www.mygov.scot/council-tax/discounts-and-exemptions',
  'A household is exempt if all adult residents are full-time students; otherwise a discount may apply.',
  '2025-26', '2026-04-01'
),
-- 20. Free NHS prescriptions
(
  'Free NHS Prescriptions',
  'NHS Scotland',
  'All NHS prescriptions in Scotland are free of charge.',
  ARRAY['S1','S2','S3','S4','S5','S6','FE','undergraduate'], 'entitlement',
  'Free prescriptions for all residents', NULL, NULL,
  false, false,
  NULL, NULL, NULL, NULL, NULL, NULL,
  NULL, NULL, NULL, NULL,
  true,
  'Automatic — present your prescription at any Scottish pharmacy.',
  NULL,
  'Universal for everyone living in Scotland.',
  '2025-26', '2026-04-01'
),
-- 21. Free NHS eye tests
(
  'Free NHS Eye Tests',
  'NHS Scotland',
  'All NHS-funded eye examinations in Scotland are free of charge.',
  ARRAY['S1','S2','S3','S4','S5','S6','FE','undergraduate'], 'entitlement',
  'Free eye examinations', NULL, NULL,
  false, false,
  NULL, NULL, NULL, NULL, NULL, NULL,
  NULL, NULL, NULL, NULL,
  true,
  'Book a free NHS eye test at any participating optometrist.',
  NULL,
  'Universal for everyone living in Scotland.',
  '2025-26', '2026-04-01'
);
