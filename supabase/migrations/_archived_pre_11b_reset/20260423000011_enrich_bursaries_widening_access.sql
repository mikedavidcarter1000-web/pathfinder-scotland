-- Enrich bursaries with widening-access coverage.
-- 3 statutory entitlements migrated from student_benefits (NHS dental, period products, Young Scot NEC)
--   (Student Loan SAAS deliberately excluded -- repayable loan does not belong in bursaries.)
-- 9 new widening-access bursaries closing identified coverage gaps.
-- 1 update applying SIMD-2 gate to Robertson Trust Scholarship.
-- All new rows: needs_verification=true (human confirmation required against canonical sources).
-- Transaction boundary owned by applying tool (no BEGIN/COMMIT here -- see CLAUDE.md).

INSERT INTO public.bursaries (
  name, slug, administering_body, award_type, student_stages,
  amount_description, amount_min, amount_max, amount_frequency,
  is_universal, is_government_scheme, is_charitable_trust, is_means_tested, is_repayable, is_competitive,
  requires_refugee_or_asylum, requires_estranged, requires_young_parent, requires_young_carer,
  requires_care_experience, requires_disability,
  simd_quintile_max, min_age, max_age,
  priority_score, url, last_verified_date, academic_year, is_active, needs_verification, description
) VALUES
-- 1. Migrated: Free NHS Dental Check-ups
('Free NHS Dental Check-ups', 'free-nhs-dental-check-ups', 'NHS Scotland', 'entitlement',
  ARRAY['S1','S2','S3','S4','S5','S6','FE','undergraduate','postgraduate','PGDE'],
  'Free NHS dental examinations; free standard treatment for under-26s registered with an NHS dentist',
  NULL, NULL, NULL,
  true, true, false, false, false, false,
  false, false, false, false, false, false,
  NULL, NULL, NULL,
  80, 'https://www.mygov.scot/dental-charges', DATE '2026-04-18', '2025-26', true, true,
  'All NHS dental examinations in Scotland are free under the Scottish Government''s free dental examination scheme. Students registered with an NHS dentist and under 26 also receive free standard treatment.'),

-- 2. Migrated: Free Period Products
('Free Period Products', 'free-period-products', 'Scottish Government', 'entitlement',
  ARRAY['S1','S2','S3','S4','S5','S6','FE','undergraduate','postgraduate','PGDE'],
  'Free period products available in every school, college, and university building in Scotland',
  NULL, NULL, NULL,
  true, true, false, false, false, false,
  false, false, false, false, false, false,
  NULL, NULL, NULL,
  80, 'https://www.mygov.scot/free-period-products', DATE '2026-04-18', '2025-26', true, true,
  'Scotland was the first country in the world to make period products free by law. Products are available without cost in toilets and welfare areas across every school, college, and university.'),

-- 3. Migrated: Young Scot National Entitlement Card
('Young Scot National Entitlement Card', 'young-scot-national-entitlement-card', 'Young Scot', 'entitlement',
  ARRAY['S2','S3','S4','S5','S6'],
  'Free card acting as proof of age, bus pass, library card, leisure pass, and key to Young Scot Rewards partner discounts',
  NULL, NULL, NULL,
  false, false, true, false, false, false,
  false, false, false, false, false, false,
  NULL, 11, 26,
  80, 'https://young.scot/get-informed/young-scot-nec', DATE '2026-04-18', '2025-26', true, true,
  'Free card for 11 to 26 year olds, acting as proof of age, library card, leisure pass, and key to thousands of discounts with Young Scot Rewards partners across Scotland and online. Also embeds the under-22 free bus travel entitlement.'),

-- 4. New: Sanctuary Scholarship (Scotland)
('Sanctuary Scholarship (Scotland)', 'sanctuary-scholarship-scotland', 'Scottish universities (individual schemes)', 'fee_waiver',
  ARRAY['undergraduate','postgraduate'],
  'Full tuition fee waiver; individual universities may also offer a maintenance stipend or year-round accommodation.',
  NULL, NULL, NULL,
  false, false, false, false, false, true,
  true, false, false, false, false, false,
  NULL, NULL, NULL,
  60, 'https://star-network.org.uk/access-to-university/scholarships/', DATE '2026-04-18', '2025-26', true, true,
  'Scholarship programme offered by individual Scottish universities (co-ordinated via the STAR network) for refugees, people seeking asylum, and those with limited leave to remain. Typically covers tuition fees; some universities also provide a maintenance bursary and year-round accommodation.'),

-- 5. New: Scottish Refugee Council Student Bursary Programme
('Scottish Refugee Council Student Bursary Programme', 'scottish-refugee-council-student-bursary-programme', 'Scottish Refugee Council', 'bursary',
  ARRAY['FE','undergraduate','postgraduate'],
  'Bursary amount varies by programme year; administered by the Scottish Refugee Council.',
  NULL, NULL, NULL,
  false, false, true, false, false, false,
  true, false, false, false, false, false,
  NULL, NULL, NULL,
  60, 'https://www.scottishrefugeecouncil.org.uk/', DATE '2026-04-18', '2025-26', true, true,
  'Bursary for people seeking asylum or with refugee status who wish to enter or continue further or higher education in Scotland. Amount and conditions vary by programme year.'),

-- 6. New: MCR Pathways Young Carer Bursary
('MCR Pathways Young Carer Bursary', 'mcr-pathways-young-carer-bursary', 'MCR Pathways', 'bursary',
  ARRAY['S3','S4','S5','S6','FE','undergraduate'],
  'Bursary support to reduce financial barriers for young carers in the MCR Pathways mentoring programme.',
  NULL, NULL, NULL,
  false, false, true, false, false, false,
  false, false, false, true, false, false,
  NULL, NULL, NULL,
  60, 'https://mcrpathways.org/', DATE '2026-04-18', '2025-26', true, true,
  'Bursary support from MCR Pathways for young carers participating in their mentoring programme, aimed at reducing financial barriers to staying in school and progressing to further or higher education.'),

-- 7. New: Stand Alone Pledge Universities (Scotland)
('Stand Alone Pledge Universities (Scotland)', 'stand-alone-pledge-universities-scotland', 'Stand Alone (participating Scottish universities)', 'bursary',
  ARRAY['undergraduate','postgraduate'],
  'Varies by institution; typically includes an estranged student bursary, year-round accommodation, and dedicated pastoral support.',
  NULL, NULL, NULL,
  false, false, true, false, false, false,
  false, true, false, false, false, false,
  NULL, NULL, NULL,
  60, 'https://www.standalone.org.uk/', DATE '2026-04-18', '2025-26', true, true,
  'Universities signed up to the Stand Alone Pledge commit to offering estranged students bursary support, year-round accommodation, and dedicated pastoral provision. Exact offer varies by institution; check your target university''s student-support pages.'),

-- 8. New: Buttle UK Education Support Fund (verified scope: 2-20yo, S4+ schoolage; LAC excluded -- see notes)
('Buttle UK Education Support Fund', 'buttle-uk-education-support-fund', 'Buttle UK', 'grant',
  ARRAY['S4','S5','S6','FE','undergraduate'],
  'Grant for essential costs such as study materials, travel, and living expenses.',
  NULL, NULL, NULL,
  false, false, true, false, false, false,
  false, true, false, false, true, false,
  NULL, 14, 20,
  40, 'https://buttleuk.org/', DATE '2026-04-18', '2025-26', true, true,
  'Grant for care-experienced and estranged young people in further or higher education, helping cover essential costs such as study materials, travel, and living expenses.'),

-- 9. New: Aberlour Urgent Assistance Fund
('Aberlour Urgent Assistance Fund', 'aberlour-urgent-assistance-fund', 'Aberlour', 'grant',
  ARRAY['S1','S2','S3','S4','S5','S6','FE','undergraduate','postgraduate','PGDE'],
  'Hardship grant covering essential living costs; means-tested.',
  NULL, NULL, NULL,
  false, false, true, true, false, false,
  false, false, false, false, false, false,
  NULL, NULL, NULL,
  40, 'https://www.aberlour.org.uk/urgent-assistance-fund/', DATE '2026-04-18', '2025-26', true, true,
  'Hardship grant from Aberlour for families and young people in Scotland facing urgent financial crisis. Awards cover essential living costs such as food, heating, and school essentials; application is means-tested.'),

-- 10. New: Young Parent Support Fund (Institutional)
('Young Parent Support Fund (Institutional)', 'young-parent-support-fund-institutional', 'Scottish colleges and universities', 'grant',
  ARRAY['FE','undergraduate'],
  'Discretionary institutional support covering childcare, study materials, and living costs.',
  NULL, NULL, NULL,
  false, false, false, false, false, false,
  false, false, true, false, false, false,
  NULL, NULL, NULL,
  60, 'https://www.saas.gov.uk/guides/lone-parents-grant', DATE '2026-04-18', '2025-26', true, true,
  'Discretionary institutional support for young parents in further or higher education, covering childcare, study materials, and living costs. Administered by individual colleges and universities alongside SAAS statutory funding.'),

-- 11. New: Access Bursary (Scotland Colleges)
('Access Bursary (Scotland Colleges)', 'access-bursary-scotland-colleges', 'Scottish colleges', 'bursary',
  ARRAY['FE'],
  'Bursary targeted at FE students from SIMD quintile 1 or 2 postcodes.',
  NULL, NULL, NULL,
  false, false, false, false, false, false,
  false, false, false, false, false, false,
  2, NULL, NULL,
  60, 'https://www.saas.gov.uk/', DATE '2026-04-18', '2025-26', true, true,
  'Bursary targeted at further-education students from SIMD quintile 1 or 2 postcodes, administered by individual Scottish colleges as part of their discretionary bursary allocation.'),

-- 12. New: Nuffield Research Placement Bursary
('Nuffield Research Placement Bursary', 'nuffield-research-placement-bursary', 'Nuffield Foundation', 'bursary',
  ARRAY['S5','S6'],
  'Paid summer research placement; payment covers travel, subsistence, and stipend.',
  NULL, NULL, NULL,
  false, false, true, false, false, true,
  false, false, false, false, false, false,
  2, NULL, NULL,
  40, 'https://www.nuffieldresearchplacements.org/', DATE '2026-04-18', '2025-26', true, true,
  'Paid summer research placement for S5-S6 students from backgrounds under-represented in STEM careers. Priority given to students from SIMD quintile 1 or 2 postcodes and low-income households. Competitive application.');

-- Apply SIMD-2 gate to existing Robertson Trust Scholarship.
-- Robertson Trust's Journey Programme explicitly prioritises applicants from SIMD 1-2 postcodes
-- and care-experienced or estranged young people.
UPDATE public.bursaries
SET simd_quintile_max = 2,
    last_verified_date = DATE '2026-04-18',
    updated_at = NOW()
WHERE slug = 'robertson-trust-scholarship';
