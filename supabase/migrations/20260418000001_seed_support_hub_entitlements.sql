-- Seed support hub entitlements for specific demographic groups.
--
-- Adds support_group TEXT column to student_benefits for demographic filtering
-- on the support hub page, then inserts new entitlements for:
--   young_carer, young_parent, disabled_student, refugee, neet_early_leaver, lgbtq
--
-- Idempotent: uses DELETE-then-INSERT keyed on name.
--
-- Skipped entries (already exist in student_benefits as separate rows):
--   young_parent:      'Lone Parents'' Grant' (£1,305/yr), 'Lone Parents'' Childcare Grant' (£1,215/yr),
--                      'Scottish Child Payment' (£28.20/wk)
--   estranged_student: 'Estranged Students'' Bursary' already covers the £1,000 bursary component
--   disabled_student:  'Disabled Students'' Allowance (DSA)' combined row covers Equipment/Help/Consumables
--                      amounts in award_details JSONB; inserting separate rows would create redundancy

-- ============================================================================
-- PART 1 — Schema: add support_group column
-- ============================================================================

ALTER TABLE student_benefits ADD COLUMN IF NOT EXISTS support_group TEXT;

COMMENT ON COLUMN student_benefits.support_group IS
  'Demographic group this benefit primarily targets. Values: young_carer, young_parent, '
  'estranged_student, disabled_student, refugee, neet_early_leaver, lgbtq, care_experienced. '
  'NULL means the benefit is general-purpose (not group-specific).';

-- ============================================================================
-- PART 2 — Idempotent delete before insert
-- ============================================================================

DELETE FROM student_benefits WHERE name IN (
  'Young Carer Grant',
  'Best Start Grant (pregnancy/first child)',
  'ILF Scotland Transition Fund',
  'Sanctuary Scholarships',
  'Education Maintenance Allowance (Activity Agreement)',
  'Edinburgh Business School LGBTQ+ MSc Scholarship',
  'HISA Gender Expression Fund'
);

-- ============================================================================
-- PART 3 — Insert new entitlements
-- ============================================================================

INSERT INTO student_benefits (
  name, provider, description, short_description, category,
  discount_value, discount_type,
  eligibility_s1_s4, eligibility_s5_s6, eligibility_college, eligibility_university,
  min_age, max_age,
  is_scotland_only, is_government_scheme, is_care_experienced_only, is_means_tested, is_repayable,
  url, priority_score,
  income_thresholds, award_details, administering_body,
  application_process, application_deadline, eligibility_details,
  verification_notes, last_verified, support_group
) VALUES

-- ------------------------------------------------
-- GROUP: young_carer
-- ------------------------------------------------
('Young Carer Grant',
 'Social Security Scotland',
 'Annual payment for young carers aged 16–18 (or up to 20 if still in school or non-advanced college) who provide unpaid care to someone receiving certain disability benefits. GBP 405.10/year from 1 April 2026 following 3.8% CPI uprating. No care assessment required — self-declaration accepted.',
 'GBP 405.10/year for young carers aged 16–18.',
 'government', 'GBP 405.10/year non-repayable', 'fixed',
 false, true, true, false,
 16, 20,
 true, true, false, false, false,
 'https://www.mygov.scot/young-carer-grant', 88,
 '{}'::jsonb,
 '{"amount": 405.10, "period": "per year", "type": "non-repayable"}'::jsonb,
 'Social Security Scotland',
 'Apply online at mygov.scot. Self-declaration of caring role — no formal care assessment required.',
 'Rolling — apply any time',
 'Aged 16–18 (or up to 20 if still in school or non-advanced college). Cares for someone receiving Disability Living Allowance, Personal Independence Payment, Child Disability Payment, or Adult Disability Payment. Must provide at least 16 hours of care per week. Must not be in full-time HE.',
 'Rate confirmed at GBP 405.10 from 1 April 2026 (3.8% CPI uprating). Previous rate was GBP 390.25.',
 '2026-04-12',
 'young_carer'),

-- ------------------------------------------------
-- GROUP: young_parent
-- ------------------------------------------------
('Best Start Grant (pregnancy/first child)',
 'Social Security Scotland',
 'One-off payment to help with the costs of pregnancy and caring for a first child, for families on low incomes or receiving qualifying benefits. GBP 767.50 for the pregnancy or first child payment. Separate Best Start Grant payments are also available at early learning and school-age milestones.',
 'GBP 767.50 one-off for pregnancy or first child (low income, verify amount).',
 'government', 'GBP 767.50 one-off (verify current amount)', 'fixed',
 false, true, true, true,
 NULL, NULL,
 true, true, false, true, false,
 'https://www.mygov.scot/best-start-grant-best-start-foods', 84,
 '{}'::jsonb,
 '{"amount": 767.50, "period": "one-off"}'::jsonb,
 'Social Security Scotland',
 'Apply online at mygov.scot. Must apply within the qualifying window: from 24 weeks pregnant up to 3 months after the baby''s due date.',
 'Within 3 months after due date',
 'Families on low income or receiving a qualifying benefit (Universal Credit, Income Support, ESA, Housing Benefit, Child Tax Credit, etc.). Payment is for the first child or a pregnancy. Subsequent children qualify for a smaller payment.',
 'Amount and eligibility criteria subject to change. Check directly with Social Security Scotland before advising students.',
 '2026-04-12',
 'young_parent'),

-- ------------------------------------------------
-- GROUP: disabled_student
-- ------------------------------------------------
('ILF Scotland Transition Fund',
 'ILF Scotland',
 'One-off discretionary grant of up to GBP 4,000 for disabled young people aged 15–25 transitioning from school to further education, employment, or independent living. Intended to fund activities, equipment, or experiences that support the transition journey. Rolling applications — no fixed closing date.',
 'Up to GBP 4,000 one-off for disabled young people (15–25) leaving school.',
 'funding', 'Up to GBP 4,000 one-off (discretionary)', 'fixed',
 false, true, true, true,
 15, 25,
 true, false, false, false, false,
 'https://ilf.scot/transition-fund/', 80,
 '{}'::jsonb,
 '{"amount": 4000, "period": "one-off", "type": "discretionary"}'::jsonb,
 'ILF Scotland',
 'Apply directly via ilf.scot. Rolling applications — no fixed closing date.',
 'Rolling — no fixed closing date',
 'Disabled young people aged 15–25 who are transitioning from school. Must not have received ILF Transition Fund previously (first-time applicants only, since January 2024).',
 'One-off discretionary grant. First-time applicants only since January 2024. Rolling applications, no fixed closing date. Amount subject to change — check ilf.scot.',
 '2026-04-12',
 'disabled_student'),

-- ------------------------------------------------
-- GROUP: refugee
-- ------------------------------------------------
('Sanctuary Scholarships',
 'Individual Scottish universities (via Universities Scotland)',
 'Fee waivers, bursaries, or full scholarships offered by Scottish universities for students with refugee, humanitarian protection, or asylum seeker status. Amount and availability vary by institution — not all universities participate. Check directly with the widening access or funding team at each target university.',
 'Scholarships for students with refugee/asylum seeker status. Amount varies by university.',
 'funding', 'Varies by institution', 'other',
 false, false, false, true,
 NULL, NULL,
 true, false, false, false, false,
 'https://www.universities-scotland.ac.uk/our-priorities/widening-access/sanctuary-scholarships/', 72,
 '{}'::jsonb,
 '{"amount": null, "period": "varies"}'::jsonb,
 'Individual Scottish universities',
 'Contact the widening access or funding team at each university directly. Each institution has its own application process and eligibility criteria.',
 'Varies by institution — check each university''s funding pages',
 'Students with refugee status, humanitarian protection, or asylum seeker status. Not all Scottish universities offer this scholarship — availability and amounts differ by institution.',
 'Amount and availability varies by institution. Check directly with each university. Not a nationally standardised scheme.',
 '2026-04-12',
 'refugee'),

-- ------------------------------------------------
-- GROUP: neet_early_leaver
-- ------------------------------------------------
('Education Maintenance Allowance (Activity Agreement)',
 'Local Employability Partnership',
 'Weekly payment of GBP 30 for young people aged 16–19 who are participating in an Activity Agreement — a structured programme for those not in education, employment, or training (NEET). Paid for up to 52 weeks, unlike the term-time-only EMA for school and college students. Means-tested.',
 'GBP 30/week (up to 52 weeks) for young people in an Activity Agreement (NEET support).',
 'government', 'GBP 30/week for up to 52 weeks', 'fixed',
 false, true, false, false,
 16, 19,
 true, true, false, true, false,
 'https://www.mygov.scot/ema', 78,
 '{}'::jsonb,
 '{"amount": 30, "period": "per week", "max_weeks": 52}'::jsonb,
 'Local Employability Partnership (funded by Scottish Government)',
 'Referred via school guidance, careers adviser, or local employability partner. Must be engaged in a formal Activity Agreement or Action Plan agreed with the local authority.',
 'Rolling — tied to Activity Agreement start date',
 'Aged 16–19. Not in full-time education, employment, or training. Must be participating in a formal Activity Agreement or Action Plan agreed with a local authority or employability partner. Means-tested on parental or own income.',
 'This is a distinct EMA variant paid year-round (up to 52 weeks) for Activity Agreement participants. Different from the term-time-only school/college EMA available to S5/S6 and FE students.',
 '2026-04-12',
 'neet_early_leaver'),

-- ------------------------------------------------
-- GROUP: lgbtq
-- ------------------------------------------------
('Edinburgh Business School LGBTQ+ MSc Scholarship',
 'University of Edinburgh Business School',
 'Merit and identity-based scholarship of GBP 10,000 per year for postgraduate MSc students who identify as LGBTQ+. Two scholarships are awarded each year. Open to students of any nationality applying to eligible MSc programmes at Edinburgh Business School.',
 'GBP 10,000/year for LGBTQ+ MSc students at Edinburgh Business School (2 per year).',
 'funding', 'GBP 10,000/year (2 scholarships per year)', 'fixed',
 false, false, false, true,
 NULL, NULL,
 false, false, false, false, false,
 'https://www.business-school.ed.ac.uk/scholarships/msc-lgbt', 65,
 '{}'::jsonb,
 '{"amount": 10000, "period": "per year", "scholarships_available": 2}'::jsonb,
 'University of Edinburgh Business School',
 'Apply as part of the MSc application process at Edinburgh Business School. Check the Business School scholarships page for the current eligible programmes and application window.',
 'Annual — check Edinburgh Business School for deadline',
 'Self-identifying LGBTQ+ students. Postgraduate (MSc) level only. Open to any nationality. Must be applying to an eligible MSc programme at Edinburgh Business School.',
 '2 scholarships per year. Postgraduate (MSc) only. Open to any nationality. Check directly with Edinburgh Business School for current eligible programmes and application deadline.',
 '2026-04-12',
 'lgbtq'),

('HISA Gender Expression Fund',
 'Highlands and Islands Students Association (HISA)',
 'One-off hardship grant of up to GBP 100 for trans, non-binary, and gender-diverse students at the University of the Highlands and Islands (UHI). For items that support gender expression, such as clothing or accessories. Check directly with HISA for current availability.',
 'GBP 100 one-off for trans/non-binary/gender-diverse UHI students.',
 'funding', 'Up to GBP 100 one-off', 'fixed',
 false, false, true, true,
 NULL, NULL,
 true, false, false, false, false,
 'https://hisa.uhi.ac.uk/campaigns/transgenderawarenessweek/', 60,
 '{}'::jsonb,
 '{"amount": 100, "period": "one-off"}'::jsonb,
 'Highlands and Islands Students Association (HISA)',
 'Apply directly to HISA. Check hisa.uhi.ac.uk for the current application form and fund availability.',
 'Rolling — check HISA for availability',
 'Must be a current UHI student. Must identify as trans, non-binary, or gender-diverse. For items that directly support gender expression.',
 'For trans, non-binary, and gender-diverse UHI students only. Check directly with HISA for fund availability and current application process.',
 '2026-04-12',
 'lgbtq');
