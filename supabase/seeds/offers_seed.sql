-- =============================================================================
-- Student Offers & Entitlements Hub -- Seed Data
-- File: supabase/seeds/offers_seed.sql
-- Apply: run via Supabase SQL editor, execute_sql, or
--        psql -f supabase/seeds/offers_seed.sql
--
-- Seeds: ~62 offers across 15 categories, offer_support_groups junction rows,
--        and 21 "starting uni" checklist items linked to offers by slug.
--
-- Idempotency:
--   * offers ................... ON CONFLICT (slug) DO NOTHING
--   * offer_support_groups ..... ON CONFLICT DO NOTHING (composite PK)
--   * starting_uni_checklist_items uses WHERE NOT EXISTS by title
--
-- NOTE: depends on offer_categories already seeded by migration
--       20260414000002_student_offers_hub.sql (15 rows).
-- =============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. OFFERS -- Government Entitlements (13)
-- ---------------------------------------------------------------------------
INSERT INTO public.offers (
  category_id, title, slug, summary, description, brand, offer_type,
  discount_text, url, eligible_stages, scotland_only,
  requires_young_scot, requires_totum, requires_unidays, requires_student_beans,
  verification_method, min_age, max_age, last_verified_at, display_order, is_active
) VALUES
((SELECT id FROM public.offer_categories WHERE slug = 'government-entitlements'),
  'Education Maintenance Allowance (EMA)', 'ema',
  'Weekly GBP 30 payment for eligible 16-19s in school or college.',
  'Education Maintenance Allowance pays GBP 30 per week to eligible 16-19 year olds in full-time non-advanced education (school or college). Eligibility is means-tested on household income. Pupils must meet attendance thresholds. Apply through your school or college.',
  NULL, 'entitlement', 'GBP 30/week', 'https://www.mygov.scot/ema',
  ARRAY['s5','s6','college']::TEXT[], TRUE,
  FALSE, FALSE, FALSE, FALSE,
  'school_id', 16, 19, DATE '2026-04-14', 10, TRUE),

((SELECT id FROM public.offer_categories WHERE slug = 'government-entitlements'),
  'School Clothing Grant', 'school-clothing-grant',
  'Council grant toward school uniform, PE kit and shoes.',
  'Scottish local councils pay a School Clothing Grant of at least GBP 120 for primary and GBP 150 for secondary pupils in eligible households (typically those receiving qualifying benefits or meeting income thresholds). Apply through your local council.',
  NULL, 'entitlement', 'GBP 150+/year', 'https://www.mygov.scot/school-clothing-grants',
  ARRAY['s1','s2','s3','s4','s5','s6']::TEXT[], TRUE,
  FALSE, FALSE, FALSE, FALSE,
  'school_id', NULL, NULL, DATE '2026-04-14', 20, TRUE),

((SELECT id FROM public.offer_categories WHERE slug = 'government-entitlements'),
  'Free School Meals', 'free-school-meals',
  'Free lunch for eligible secondary pupils.',
  'Eligible secondary pupils receive a free lunch every day the school serves meals. Eligibility is based on household benefits. Primary pupils P1-P5 receive universal free meals across Scotland. Apply through your local council.',
  NULL, 'entitlement', 'Free', 'https://www.mygov.scot/school-meals',
  ARRAY['s1','s2','s3','s4','s5','s6']::TEXT[], TRUE,
  FALSE, FALSE, FALSE, FALSE,
  'school_id', NULL, NULL, DATE '2026-04-14', 30, TRUE),

((SELECT id FROM public.offer_categories WHERE slug = 'government-entitlements'),
  'Young Scot National Entitlement Card (NEC)', 'young-scot-nec',
  'Free photo ID and discount card for 11-25 year olds in Scotland.',
  'The Young Scot NEC is a free photo ID card that doubles as proof of age, a discount card with access to 1000+ offers, and can be loaded as a bus pass. Apply online at young.scot from age 11 -- issued through your local council.',
  NULL, 'entitlement', 'Free', 'https://young.scot/get-informed/young-scot-national-entitlement-card',
  ARRAY['s1','s2','s3','s4','s5','s6','college','undergraduate','postgraduate']::TEXT[], TRUE,
  FALSE, FALSE, FALSE, FALSE,
  'none', 11, 25, DATE '2026-04-14', 40, TRUE),

((SELECT id FROM public.offer_categories WHERE slug = 'government-entitlements'),
  'Free Bus Travel (Under 22)', 'free-bus-travel-under-22',
  'Free bus travel for under-22s living in Scotland.',
  'Everyone under 22 resident in Scotland can travel free on most scheduled bus services through the Under 22s Bus Pass scheme. Accessed via a Young Scot NEC or a Saltire Card for younger children. Covers most scheduled services; some open-tour and express routes excluded.',
  NULL, 'entitlement', 'Free', 'https://www.mygov.scot/under-22s-bus-pass',
  ARRAY['s1','s2','s3','s4','s5','s6','college','undergraduate','postgraduate']::TEXT[], TRUE,
  TRUE, FALSE, FALSE, FALSE,
  'young_scot', NULL, 21, DATE '2026-04-14', 50, TRUE),

((SELECT id FROM public.offer_categories WHERE slug = 'government-entitlements'),
  'Council Tax Student Exemption', 'council-tax-student-exemption',
  'Full-time students are disregarded from council tax.',
  'Full-time students are disregarded for council tax. If everyone in a property is a full-time student the household pays no council tax. Apply with your local council using your matriculation letter. Scotland-wide but also applies UK-wide.',
  NULL, 'entitlement', 'Full exemption', 'https://www.mygov.scot/council-tax/discounts-exemptions-and-reductions',
  ARRAY['college','undergraduate','postgraduate']::TEXT[], FALSE,
  FALSE, FALSE, FALSE, FALSE,
  'institution_email', NULL, NULL, DATE '2026-04-14', 60, TRUE),

((SELECT id FROM public.offer_categories WHERE slug = 'government-entitlements'),
  'Free NHS Prescriptions', 'free-prescriptions',
  'All NHS prescriptions are free in Scotland.',
  'NHS prescriptions are free for everyone living in Scotland, regardless of age or income. Present your prescription at any NHS pharmacy -- no exemption form required.',
  NULL, 'entitlement', 'Free', 'https://www.nhsinform.scot/care-support-and-rights/nhs-services/pharmacy/prescriptions/',
  ARRAY['s1','s2','s3','s4','s5','s6','college','undergraduate','postgraduate']::TEXT[], TRUE,
  FALSE, FALSE, FALSE, FALSE,
  'none', NULL, NULL, DATE '2026-04-14', 70, TRUE),

((SELECT id FROM public.offer_categories WHERE slug = 'government-entitlements'),
  'Free NHS Eye Tests', 'free-nhs-eye-tests',
  'Free NHS eye examinations for everyone in Scotland.',
  'NHS eye examinations are free for all residents of Scotland, typically every two years (more often if clinically indicated). Book with any optician offering NHS tests.',
  NULL, 'entitlement', 'Free', 'https://www.nhsinform.scot/tests-and-treatments/non-surgical-procedures/eye-examination/',
  ARRAY['s1','s2','s3','s4','s5','s6','college','undergraduate','postgraduate']::TEXT[], TRUE,
  FALSE, FALSE, FALSE, FALSE,
  'none', NULL, NULL, DATE '2026-04-14', 80, TRUE),

((SELECT id FROM public.offer_categories WHERE slug = 'government-entitlements'),
  'Free NHS Dental Check-ups', 'free-nhs-dental-checkups',
  'Free NHS dental check-ups for all residents in Scotland.',
  'Routine NHS dental examinations are free for everyone registered with an NHS dentist in Scotland. Additional treatments may carry NHS charges.',
  NULL, 'entitlement', 'Free check-ups', 'https://www.nhsinform.scot/care-support-and-rights/nhs-services/dental/dental-charges/',
  ARRAY['s1','s2','s3','s4','s5','s6','college','undergraduate','postgraduate']::TEXT[], TRUE,
  FALSE, FALSE, FALSE, FALSE,
  'none', NULL, NULL, DATE '2026-04-14', 90, TRUE),

((SELECT id FROM public.offer_categories WHERE slug = 'government-entitlements'),
  'Free Period Products', 'free-period-products',
  'Legally free period products in schools, colleges and universities.',
  'Under the Period Products (Free Provision) (Scotland) Act, free tampons, pads and reusable products are available in every Scottish school, college, university and many public buildings. Scotland is the first country in the world to guarantee this legally.',
  NULL, 'entitlement', 'Free', 'https://www.gov.scot/policies/women-and-girls/free-period-products/',
  ARRAY['s1','s2','s3','s4','s5','s6','college','undergraduate','postgraduate']::TEXT[], TRUE,
  FALSE, FALSE, FALSE, FALSE,
  'none', NULL, NULL, DATE '2026-04-14', 100, TRUE),

((SELECT id FROM public.offer_categories WHERE slug = 'government-entitlements'),
  'Scottish Child Payment', 'scottish-child-payment',
  'Weekly payment per eligible child under 16 in low-income households.',
  'Scottish Child Payment is a weekly payment (paid every four weeks) for families receiving qualifying benefits with children under 16. Relevant for young parents and families. Amount is set by Social Security Scotland -- check mygov.scot for the current rate.',
  NULL, 'entitlement', 'Weekly payment', 'https://www.mygov.scot/scottish-child-payment',
  ARRAY['s1','s2','s3','s4','s5','s6','college','undergraduate','postgraduate']::TEXT[], TRUE,
  FALSE, FALSE, FALSE, FALSE,
  'none', NULL, NULL, DATE '2026-04-14', 110, TRUE),

((SELECT id FROM public.offer_categories WHERE slug = 'government-entitlements'),
  'SAAS Tuition Fee Payment', 'saas-tuition-fee-payment',
  'Full tuition fees paid for eligible Scottish undergraduates at Scottish universities.',
  'The Student Awards Agency Scotland (SAAS) pays full tuition fees for eligible Scottish-domiciled undergraduates at Scottish universities. Apply at saas.gov.uk every academic year.',
  NULL, 'entitlement', 'Tuition paid in full', 'https://www.saas.gov.uk/',
  ARRAY['undergraduate']::TEXT[], TRUE,
  FALSE, FALSE, FALSE, FALSE,
  'institution_email', NULL, NULL, DATE '2026-04-14', 120, TRUE),

((SELECT id FROM public.offer_categories WHERE slug = 'government-entitlements'),
  'SAAS Bursary & Living Cost Grant', 'saas-bursary-living-cost-grant',
  'Means-tested bursaries and loans for living costs.',
  'Scottish undergraduates can apply to SAAS for means-tested bursaries (non-repayable) and student loans for living costs. Higher support is available for students from the lowest household incomes. Apply each academic year at saas.gov.uk.',
  NULL, 'entitlement', 'Up to several thousand GBP/year', 'https://www.saas.gov.uk/full-time/ug/young',
  ARRAY['undergraduate']::TEXT[], TRUE,
  FALSE, FALSE, FALSE, FALSE,
  'institution_email', NULL, NULL, DATE '2026-04-14', 130, TRUE)
ON CONFLICT (slug) DO NOTHING;


-- ---------------------------------------------------------------------------
-- 2. OFFERS -- Free Software and Tools (8)
-- ---------------------------------------------------------------------------
INSERT INTO public.offers (
  category_id, title, slug, summary, description, brand, offer_type,
  discount_text, url, eligible_stages, scotland_only,
  requires_young_scot, requires_totum, requires_unidays, requires_student_beans,
  verification_method, min_age, max_age, last_verified_at, display_order, is_active
) VALUES
((SELECT id FROM public.offer_categories WHERE slug = 'free-software-and-tools'),
  'GitHub Student Developer Pack', 'github-student-developer-pack',
  '100+ free developer tools worth over USD 10,000/year.',
  'GitHub Student Developer Pack bundles free access to 100+ tools including GitHub Copilot, Namecheap domains, DigitalOcean credits, Canva Pro, JetBrains IDEs, and more. Verify with an institutional email from age 13.',
  'GitHub', 'free_resource', 'Free (USD 10,000+ value)', 'https://education.github.com/pack',
  ARRAY['s2','s3','s4','s5','s6','college','undergraduate','postgraduate']::TEXT[], FALSE,
  FALSE, FALSE, FALSE, FALSE,
  'institution_email', 13, NULL, DATE '2026-04-14', 10, TRUE),

((SELECT id FROM public.offer_categories WHERE slug = 'free-software-and-tools'),
  'JetBrains All Products Educational Pack', 'jetbrains-education',
  'Free IntelliJ IDEA Ultimate, PyCharm, WebStorm and all JetBrains IDEs.',
  'A free educational licence for the entire JetBrains product line (IntelliJ IDEA Ultimate, PyCharm Professional, WebStorm, CLion, DataGrip, RubyMine, GoLand and others). Renew yearly while eligible.',
  'JetBrains', 'free_resource', 'Free', 'https://www.jetbrains.com/community/education/',
  ARRAY['s1','s2','s3','s4','s5','s6','college','undergraduate','postgraduate']::TEXT[], FALSE,
  FALSE, FALSE, FALSE, FALSE,
  'institution_email', NULL, NULL, DATE '2026-04-14', 20, TRUE),

((SELECT id FROM public.offer_categories WHERE slug = 'free-software-and-tools'),
  'Autodesk Education (AutoCAD, Revit, Maya, Fusion 360)', 'autodesk-education',
  'Free professional CAD, BIM and 3D tools for students.',
  'Free one-year (renewable) educational licences for Autodesk software including AutoCAD, Revit, Maya, 3ds Max, Inventor, and Fusion 360. Verify through the Autodesk education site.',
  'Autodesk', 'free_resource', 'Free', 'https://www.autodesk.com/education/edu-software/overview',
  ARRAY['s1','s2','s3','s4','s5','s6','college','undergraduate','postgraduate']::TEXT[], FALSE,
  FALSE, FALSE, FALSE, FALSE,
  'institution_email', NULL, NULL, DATE '2026-04-14', 30, TRUE),

((SELECT id FROM public.offer_categories WHERE slug = 'free-software-and-tools'),
  'Microsoft Office 365 Education', 'microsoft-office-365-education',
  'Free Word, Excel, PowerPoint, OneNote and Teams for students.',
  'Free access to Microsoft Office 365 (Word, Excel, PowerPoint, OneNote, Teams) plus 1 TB OneDrive storage for students and staff with a valid school, college or university email address.',
  'Microsoft', 'free_resource', 'Free', 'https://www.microsoft.com/en-gb/education/products/office',
  ARRAY['s1','s2','s3','s4','s5','s6','college','undergraduate','postgraduate']::TEXT[], FALSE,
  FALSE, FALSE, FALSE, FALSE,
  'institution_email', NULL, NULL, DATE '2026-04-14', 40, TRUE),

((SELECT id FROM public.offer_categories WHERE slug = 'free-software-and-tools'),
  'Canva for Education', 'canva-education',
  'Canva Pro free for teachers and students via their school.',
  'Canva for Education gives full access to Canva Pro features, premium templates and classroom tools. Access is typically invited by a teacher or verified via an institutional email.',
  'Canva', 'free_resource', 'Free', 'https://www.canva.com/education/',
  ARRAY['s1','s2','s3','s4','s5','s6','college','undergraduate','postgraduate']::TEXT[], FALSE,
  FALSE, FALSE, FALSE, FALSE,
  'institution_email', NULL, NULL, DATE '2026-04-14', 50, TRUE),

((SELECT id FROM public.offer_categories WHERE slug = 'free-software-and-tools'),
  'Adobe Creative Cloud Student', 'adobe-creative-cloud-student',
  '65-75% off the full Creative Cloud (Photoshop, Illustrator, Premiere, 20+ apps).',
  'Adobe Creative Cloud All Apps for students: currently GBP 16.24/month in the first year, rising to GBP 25.28/month thereafter. Includes Photoshop, Illustrator, Premiere Pro, InDesign, After Effects and more. Verified at sign-up.',
  'Adobe', 'general_discount', 'GBP 16.24/month (65-75% off)', 'https://www.adobe.com/uk/creativecloud/buy/students.html',
  ARRAY['s2','s3','s4','s5','s6','college','undergraduate','postgraduate']::TEXT[], FALSE,
  FALSE, FALSE, FALSE, FALSE,
  'institution_email', 13, NULL, DATE '2026-04-14', 60, TRUE),

((SELECT id FROM public.offer_categories WHERE slug = 'free-software-and-tools'),
  'Notion for Education', 'notion-education',
  'Free Notion Pro plan for students with an education email.',
  'Notion Pro free for students with a valid education email address. Unlimited blocks, unlimited file uploads, and team collaboration in personal workspaces.',
  'Notion', 'free_resource', 'Free Pro plan', 'https://www.notion.so/product/notion-for-education',
  ARRAY['s1','s2','s3','s4','s5','s6','college','undergraduate','postgraduate']::TEXT[], FALSE,
  FALSE, FALSE, FALSE, FALSE,
  'institution_email', NULL, NULL, DATE '2026-04-14', 70, TRUE),

((SELECT id FROM public.offer_categories WHERE slug = 'free-software-and-tools'),
  'Figma for Education', 'figma-education',
  'Free Figma Professional for students and educators.',
  'Free Figma Professional plan for students, including unlimited Figma and FigJam files and advanced team collaboration features. Renew yearly while eligible.',
  'Figma', 'free_resource', 'Free Pro plan', 'https://www.figma.com/education/',
  ARRAY['s1','s2','s3','s4','s5','s6','college','undergraduate','postgraduate']::TEXT[], FALSE,
  FALSE, FALSE, FALSE, FALSE,
  'institution_email', NULL, NULL, DATE '2026-04-14', 80, TRUE)
ON CONFLICT (slug) DO NOTHING;


-- ---------------------------------------------------------------------------
-- 3. OFFERS -- Accommodation Essentials (7)
-- ---------------------------------------------------------------------------
INSERT INTO public.offers (
  category_id, title, slug, summary, description, brand, offer_type,
  discount_text, url, eligible_stages, scotland_only,
  requires_young_scot, requires_totum, requires_unidays, requires_student_beans,
  verification_method, min_age, max_age, last_verified_at, display_order, is_active
) VALUES
((SELECT id FROM public.offer_categories WHERE slug = 'accommodation-essentials'),
  'Council Tax Exemption (Student Housing)', 'council-tax-exemption-student-housing',
  'Applying for council tax exemption at your student accommodation.',
  'If you are a full-time student living in self-contained accommodation outside halls, apply to your local council for the student exemption. Halls of residence are already exempt and need no application. Bring your matriculation letter.',
  NULL, 'entitlement', 'Full exemption', 'https://www.mygov.scot/council-tax/discounts-exemptions-and-reductions',
  ARRAY['college','undergraduate','postgraduate']::TEXT[], FALSE,
  FALSE, FALSE, FALSE, FALSE,
  'institution_email', NULL, NULL, DATE '2026-04-14', 10, TRUE),

((SELECT id FROM public.offer_categories WHERE slug = 'accommodation-essentials'),
  'Scottish Water Student Exemption', 'scottish-water-student-exemption',
  'Automatic water charges exemption when you are council tax exempt.',
  'If your property is exempt from council tax because all occupants are full-time students, water and sewerage charges (collected alongside council tax in Scotland) are automatically exempt too -- no separate application required.',
  NULL, 'entitlement', 'Full exemption', 'https://www.scottishwater.co.uk/your-home/your-charges',
  ARRAY['college','undergraduate','postgraduate']::TEXT[], TRUE,
  FALSE, FALSE, FALSE, FALSE,
  'none', NULL, NULL, DATE '2026-04-14', 20, TRUE),

((SELECT id FROM public.offer_categories WHERE slug = 'accommodation-essentials'),
  'TV Licence: Student Guide', 'tv-licence-student-guide',
  'When students need a TV licence -- and when they do not.',
  'If you watch or record live TV on any device, or use BBC iPlayer, you need a TV licence (currently GBP 174.50/year). Students in halls may be covered by a parental licence under specific conditions -- check the TV Licensing student guidance before assuming.',
  NULL, 'free_resource', 'Info', 'https://www.tvlicensing.co.uk/check-if-you-need-one/for-your-home/students-aud3',
  ARRAY['college','undergraduate','postgraduate']::TEXT[], FALSE,
  FALSE, FALSE, FALSE, FALSE,
  'none', NULL, NULL, DATE '2026-04-14', 30, TRUE),

((SELECT id FROM public.offer_categories WHERE slug = 'accommodation-essentials'),
  'Student Contents Insurance Guide', 'student-contents-insurance-guide',
  'Protect laptops, phones and belongings in halls or shared flats.',
  'Student-specific contents insurance from providers like Endsleigh, Cover4Insurance and UniLet covers valuables in halls and shared flats. Check first whether your parents home insurance extends to students away at university.',
  NULL, 'free_resource', 'Guide', 'https://www.moneysavingexpert.com/insurance/cheap-home-insurance/',
  ARRAY['college','undergraduate','postgraduate']::TEXT[], FALSE,
  FALSE, FALSE, FALSE, FALSE,
  'none', NULL, NULL, DATE '2026-04-14', 40, TRUE),

((SELECT id FROM public.offer_categories WHERE slug = 'accommodation-essentials'),
  'Student Broadband Deals', 'student-broadband-deals-guide',
  'Short-term, student-friendly broadband contracts.',
  'Comparison guide to 9-month and 12-month broadband contracts designed for students (Virgin Media Student, Community Fibre, BT). Check whether your landlord provides broadband before signing up.',
  NULL, 'free_resource', 'Guide', 'https://www.uswitch.com/broadband/student-broadband-deals/',
  ARRAY['college','undergraduate','postgraduate']::TEXT[], FALSE,
  FALSE, FALSE, FALSE, FALSE,
  'none', NULL, NULL, DATE '2026-04-14', 50, TRUE),

((SELECT id FROM public.offer_categories WHERE slug = 'accommodation-essentials'),
  'Student Utility Switching Guide', 'student-utility-switching-guide',
  'How to set up gas and electricity in a student flat.',
  'Step-by-step tenant guide to taking meter readings on move-in, contacting the existing supplier, and whether switching is worthwhile for a 9-month tenancy. Covers joint-tenancy and individual-name accounts.',
  NULL, 'free_resource', 'Guide', 'https://www.citizensadvice.org.uk/scotland/consumer/energy/energy-supply/get-a-better-energy-deal/switching-energy-supplier/',
  ARRAY['college','undergraduate','postgraduate']::TEXT[], FALSE,
  FALSE, FALSE, FALSE, FALSE,
  'none', NULL, NULL, DATE '2026-04-14', 60, TRUE),

((SELECT id FROM public.offer_categories WHERE slug = 'accommodation-essentials'),
  'Tenancy Deposit Protection (Scotland)', 'tenancy-deposit-protection-scotland',
  'Your rights under Scotland''s deposit protection schemes.',
  'Landlords in Scotland must lodge tenancy deposits with one of three approved schemes (SafeDeposits Scotland, mydeposits Scotland, or Letting Protection Service Scotland) within 30 working days of the tenancy start. Know your rights to reclaim your deposit at the end.',
  NULL, 'free_resource', 'Guide', 'https://www.mygov.scot/tenancy-deposit-schemes',
  ARRAY['college','undergraduate','postgraduate']::TEXT[], TRUE,
  FALSE, FALSE, FALSE, FALSE,
  'none', NULL, NULL, DATE '2026-04-14', 70, TRUE)
ON CONFLICT (slug) DO NOTHING;


-- ---------------------------------------------------------------------------
-- 4. OFFERS -- Health and Wellbeing (5)
-- ---------------------------------------------------------------------------
INSERT INTO public.offers (
  category_id, title, slug, summary, description, brand, offer_type,
  discount_text, url, eligible_stages, scotland_only,
  requires_young_scot, requires_totum, requires_unidays, requires_student_beans,
  verification_method, min_age, max_age, last_verified_at, display_order, is_active
) VALUES
((SELECT id FROM public.offer_categories WHERE slug = 'health-and-wellbeing'),
  'Register with a GP Near Your University', 'gp-registration-guide',
  'How to register with a new GP practice when you move to study.',
  'When you move to a new term-time address, you should register with a local GP. If your term is under six months you may stay registered at home, but registering locally is usually better. Find practices by postcode on NHS Inform Scotland.',
  NULL, 'free_resource', 'Guide', 'https://www.nhsinform.scot/care-support-and-rights/nhs-services/doctors/registering-with-a-gp-practice',
  ARRAY['college','undergraduate','postgraduate']::TEXT[], TRUE,
  FALSE, FALSE, FALSE, FALSE,
  'none', NULL, NULL, DATE '2026-04-14', 10, TRUE),

((SELECT id FROM public.offer_categories WHERE slug = 'health-and-wellbeing'),
  'Register with an NHS Dentist', 'dentist-registration-guide',
  'Find and register with an NHS dentist near your university.',
  'NHS dental practices in Scotland may have waiting lists, so start the search early. Search by postcode on NHS Inform. Free NHS check-ups are available once registered; additional treatments may carry NHS charges.',
  NULL, 'free_resource', 'Guide', 'https://www.nhsinform.scot/scotlands-service-directory/dental-services/',
  ARRAY['college','undergraduate','postgraduate']::TEXT[], TRUE,
  FALSE, FALSE, FALSE, FALSE,
  'none', NULL, NULL, DATE '2026-04-14', 20, TRUE),

((SELECT id FROM public.offer_categories WHERE slug = 'health-and-wellbeing'),
  'Breathing Space Helpline', 'breathing-space-helpline',
  'Free, confidential mental health phone line: 0800 83 85 87.',
  'Breathing Space is a free, confidential phone service for people in Scotland aged 16+ experiencing low mood, depression or anxiety. Call 0800 83 85 87 -- weekday evenings (6 PM-2 AM) and weekends (24 hours).',
  NULL, 'free_resource', 'Free', 'https://breathingspace.scot/',
  ARRAY['s4','s5','s6','college','undergraduate','postgraduate']::TEXT[], TRUE,
  FALSE, FALSE, FALSE, FALSE,
  'none', 16, NULL, DATE '2026-04-14', 30, TRUE),

((SELECT id FROM public.offer_categories WHERE slug = 'health-and-wellbeing'),
  'University Counselling Services', 'university-counselling-services',
  'Free counselling and mental health support via your university.',
  'All Scottish universities provide free confidential counselling and wellbeing services to enrolled students. Access through your student portal, student association or dedicated wellbeing team. Waiting times vary by institution -- contact early if you need support.',
  NULL, 'free_resource', 'Free', 'https://www.mind.org.uk/information-support/tips-for-everyday-living/student-life/support-at-uni/',
  ARRAY['undergraduate','postgraduate']::TEXT[], FALSE,
  FALSE, FALSE, FALSE, FALSE,
  'institution_email', NULL, NULL, DATE '2026-04-14', 40, TRUE),

((SELECT id FROM public.offer_categories WHERE slug = 'health-and-wellbeing'),
  'Free Period Products on Campus', 'free-period-products-campus',
  'Free tampons, pads and reusable products at every Scottish school, college and university.',
  'Under the Period Products (Free Provision) (Scotland) Act, every school, college and university in Scotland provides free tampons, pads and reusable products in campus bathrooms and wellbeing offices. No proof of eligibility is required.',
  NULL, 'entitlement', 'Free', 'https://www.gov.scot/policies/women-and-girls/free-period-products/',
  ARRAY['s1','s2','s3','s4','s5','s6','college','undergraduate','postgraduate']::TEXT[], TRUE,
  FALSE, FALSE, FALSE, FALSE,
  'none', NULL, NULL, DATE '2026-04-14', 50, TRUE)
ON CONFLICT (slug) DO NOTHING;


-- ---------------------------------------------------------------------------
-- 5. OFFERS -- Transport and Travel (5)
-- ---------------------------------------------------------------------------
INSERT INTO public.offers (
  category_id, title, slug, summary, description, brand, offer_type,
  discount_text, url, eligible_stages, scotland_only,
  requires_young_scot, requires_totum, requires_unidays, requires_student_beans,
  verification_method, min_age, max_age, last_verified_at, display_order, is_active
) VALUES
((SELECT id FROM public.offer_categories WHERE slug = 'transport-and-travel'),
  'Under 22 Bus Pass: How to Apply', 'under-22-bus-pass-application',
  'Apply for free bus travel across Scotland for under-22s.',
  'Free bus travel for under-22s is delivered via the Young Scot NEC. Apply through Young Scot (or your local council for Saltire Card if under 11). Processing typically takes around 10 working days.',
  NULL, 'entitlement', 'Free', 'https://www.mygov.scot/under-22s-bus-pass',
  ARRAY['s1','s2','s3','s4','s5','s6','college','undergraduate','postgraduate']::TEXT[], TRUE,
  TRUE, FALSE, FALSE, FALSE,
  'young_scot', NULL, 21, DATE '2026-04-14', 10, TRUE),

((SELECT id FROM public.offer_categories WHERE slug = 'transport-and-travel'),
  'ScotRail Young Scot Discount', 'scotrail-young-scot-discount',
  'One-third off ScotRail fares plus 50% off season tickets for 16-25s.',
  'Young Scot NEC holders aged 16-25 get one-third off ScotRail Anytime, Off-Peak and Advance fares, and 50% off weekly or monthly season tickets. Show your NEC at the ticket office or load it onto the ScotRail app.',
  'ScotRail', 'general_discount', '1/3 off fares + 50% off season tickets', 'https://www.scotrail.co.uk/plan-your-journey/tickets/railcards/16-25-railcard-and-young-scot-discount',
  ARRAY['s5','s6','college','undergraduate','postgraduate']::TEXT[], TRUE,
  TRUE, FALSE, FALSE, FALSE,
  'young_scot', 16, 25, DATE '2026-04-14', 20, TRUE),

((SELECT id FROM public.offer_categories WHERE slug = 'transport-and-travel'),
  '16-25 Railcard', '16-25-railcard',
  'One-third off most rail fares across Britain for GBP 30/year.',
  'A 16-25 Railcard costs GBP 30 per year (or GBP 70 for 3 years) and gives one-third off most rail fares across Great Britain. Open to anyone 16-25, and to mature students 26+ in full-time education.',
  '16-25 Railcard', 'general_discount', '1/3 off (GBP 30/year)', 'https://www.16-25railcard.co.uk/',
  ARRAY['s5','s6','college','undergraduate','postgraduate']::TEXT[], FALSE,
  FALSE, FALSE, FALSE, FALSE,
  'institution_email', 16, NULL, DATE '2026-04-14', 30, TRUE),

((SELECT id FROM public.offer_categories WHERE slug = 'transport-and-travel'),
  'Citylink Young Scot Discount', 'citylink-25-off',
  '25% off Scottish Citylink coach fares for NEC holders.',
  '25% off Scottish Citylink single and return coach fares across Scotland when you book with a Young Scot NEC number. Covers most scheduled intercity routes.',
  'Scottish Citylink', 'general_discount', '25% off', 'https://www.citylink.co.uk/pages/young-scot',
  ARRAY['s1','s2','s3','s4','s5','s6','college','undergraduate','postgraduate']::TEXT[], TRUE,
  TRUE, FALSE, FALSE, FALSE,
  'young_scot', NULL, NULL, DATE '2026-04-14', 40, TRUE),

((SELECT id FROM public.offer_categories WHERE slug = 'transport-and-travel'),
  'Hostelling Scotland Free Youth Membership', 'hostelling-scotland-free-membership',
  'Free membership (worth around GBP 20) for Young Scot NEC holders.',
  'Young Scot NEC holders get Hostelling Scotland youth membership free (normally around GBP 20). Membership gives discounted rates at Scottish hostels and Hostelling International hostels worldwide.',
  'Hostelling Scotland', 'free_resource', 'Free membership', 'https://www.hostellingscotland.org.uk/membership/youth-membership/',
  ARRAY['s1','s2','s3','s4','s5','s6','college','undergraduate','postgraduate']::TEXT[], TRUE,
  TRUE, FALSE, FALSE, FALSE,
  'young_scot', NULL, NULL, DATE '2026-04-14', 50, TRUE)
ON CONFLICT (slug) DO NOTHING;


-- ---------------------------------------------------------------------------
-- 6. OFFERS -- Streaming and Media (5)
-- ---------------------------------------------------------------------------
INSERT INTO public.offers (
  category_id, title, slug, summary, description, brand, offer_type,
  discount_text, url, eligible_stages, scotland_only,
  requires_young_scot, requires_totum, requires_unidays, requires_student_beans,
  verification_method, min_age, max_age, last_verified_at, display_order, is_active
) VALUES
((SELECT id FROM public.offer_categories WHERE slug = 'streaming-and-media'),
  'Spotify Premium Student', 'spotify-student',
  '50% off Spotify Premium (around GBP 5.99/month).',
  'Spotify Premium Student gives 50% off the standard Premium price. Verified through UNiDAYS. Renew annually for up to four years of eligibility.',
  'Spotify', 'general_discount', '50% off (around GBP 5.99/month)', 'https://www.spotify.com/uk/student/',
  ARRAY['college','undergraduate','postgraduate']::TEXT[], FALSE,
  FALSE, FALSE, TRUE, FALSE,
  'unidays', NULL, NULL, DATE '2026-04-14', 10, TRUE),

((SELECT id FROM public.offer_categories WHERE slug = 'streaming-and-media'),
  'Apple Music Student', 'apple-music-student',
  '50% off Apple Music with Apple TV+ included.',
  'Apple Music Student gives around 50% off the standard price (approximately GBP 5.99/month). Apple TV+ is included free in eligible countries. Verified through UNiDAYS at sign-up and annually thereafter.',
  'Apple', 'general_discount', '50% off', 'https://www.apple.com/uk/apple-music/student/',
  ARRAY['college','undergraduate','postgraduate']::TEXT[], FALSE,
  FALSE, FALSE, TRUE, FALSE,
  'unidays', NULL, NULL, DATE '2026-04-14', 20, TRUE),

((SELECT id FROM public.offer_categories WHERE slug = 'streaming-and-media'),
  'YouTube Premium Student', 'youtube-premium-student',
  'Around 50% off ad-free YouTube and YouTube Music.',
  'Ad-free YouTube, background play and YouTube Music Premium at roughly half price. Annual re-verification via SheerID. Limited to a total of four years.',
  'YouTube', 'general_discount', '~50% off', 'https://www.youtube.com/premium/student',
  ARRAY['college','undergraduate','postgraduate']::TEXT[], FALSE,
  FALSE, FALSE, FALSE, FALSE,
  'institution_email', NULL, NULL, DATE '2026-04-14', 30, TRUE),

((SELECT id FROM public.offer_categories WHERE slug = 'streaming-and-media'),
  'Amazon Prime Student', 'amazon-prime-student',
  '6 months free, then 50% off Prime.',
  'Six-month free trial of Amazon Prime Student followed by 50% off Prime membership. Includes free fast delivery, Prime Video, Prime Reading and Amazon Music. Verified by institutional email at sign-up.',
  'Amazon', 'general_discount', '6 months free, then 50% off', 'https://www.amazon.co.uk/joinstudent',
  ARRAY['college','undergraduate','postgraduate']::TEXT[], FALSE,
  FALSE, FALSE, FALSE, FALSE,
  'institution_email', NULL, NULL, DATE '2026-04-14', 40, TRUE),

((SELECT id FROM public.offer_categories WHERE slug = 'streaming-and-media'),
  'Tidal Student', 'tidal-student',
  '50% off Tidal hi-fi streaming.',
  'Tidal HiFi Student plan gives 50% off the standard HiFi price. Includes lossless audio and over 100 million tracks. Annual verification required.',
  'Tidal', 'general_discount', '50% off', 'https://tidal.com/student',
  ARRAY['s5','s6','college','undergraduate','postgraduate']::TEXT[], FALSE,
  FALSE, FALSE, FALSE, FALSE,
  'institution_email', NULL, NULL, DATE '2026-04-14', 50, TRUE)
ON CONFLICT (slug) DO NOTHING;


-- ---------------------------------------------------------------------------
-- 7. OFFERS -- Banking and Finance (5)
-- ---------------------------------------------------------------------------
INSERT INTO public.offers (
  category_id, title, slug, summary, description, brand, offer_type,
  discount_text, url, eligible_stages, scotland_only,
  requires_young_scot, requires_totum, requires_unidays, requires_student_beans,
  verification_method, min_age, max_age, last_verified_at, display_order, is_active
) VALUES
((SELECT id FROM public.offer_categories WHERE slug = 'banking-and-finance'),
  'Santander Edge Student Account', 'santander-edge-student',
  'Free 4-year 16-25 Railcard and guaranteed interest-free overdraft.',
  'Santander Edge Student offers a free 4-year 16-25 Railcard (saves approximately GBP 100+) plus a tiered 0% overdraft guaranteed up to GBP 1,500, rising to GBP 2,000 in years 4-5. Open with a UK university offer or enrolment letter.',
  'Santander', 'general_discount', 'Free Railcard + overdraft', 'https://www.santander.co.uk/personal/current-accounts/edge-student-account',
  ARRAY['undergraduate']::TEXT[], FALSE,
  FALSE, FALSE, FALSE, FALSE,
  'institution_email', NULL, NULL, DATE '2026-04-14', 10, TRUE),

((SELECT id FROM public.offer_categories WHERE slug = 'banking-and-finance'),
  'RBS Student Account', 'rbs-student-account',
  'Tiered 0% overdraft up to around GBP 3,250 by year 3; accepts 17+.',
  'RBS Student Bank Account offers a tiered interest-free overdraft (typically up to GBP 500 in term 1, rising to around GBP 3,250 in year 3+). Accepts applications from age 17, which is useful for Scottish students starting university earlier.',
  'Royal Bank of Scotland', 'general_discount', 'Up to ~GBP 3,250 overdraft', 'https://www.rbs.co.uk/current-accounts/student-bank-account.html',
  ARRAY['undergraduate']::TEXT[], FALSE,
  FALSE, FALSE, FALSE, FALSE,
  'institution_email', 17, NULL, DATE '2026-04-14', 20, TRUE),

((SELECT id FROM public.offer_categories WHERE slug = 'banking-and-finance'),
  'Bank of Scotland Student Account', 'bank-of-scotland-student-account',
  'GBP 100 cash plus GBP 90 Deliveroo voucher when you switch.',
  'Bank of Scotland Student Account pays GBP 100 cash and gives a 12-month GBP 90 Deliveroo Plus voucher for switching. 0% overdraft tiered up to around GBP 3,000 in year 3. Accepts applications from age 17.',
  'Bank of Scotland', 'general_discount', 'GBP 100 + Deliveroo voucher', 'https://www.bankofscotland.co.uk/bankaccounts/our-accounts/student-bank-account.html',
  ARRAY['undergraduate']::TEXT[], FALSE,
  FALSE, FALSE, FALSE, FALSE,
  'institution_email', 17, NULL, DATE '2026-04-14', 30, TRUE),

((SELECT id FROM public.offer_categories WHERE slug = 'banking-and-finance'),
  'HSBC Student Account', 'hsbc-student-account',
  'Up to around GBP 3,000 0% overdraft plus cash switching incentive.',
  'HSBC Student Bank Account offers a tiered 0% overdraft up to around GBP 3,000 in year 3, plus a cash incentive on switching (subject to eligibility and promotions). Online, mobile and branch access across the UK.',
  'HSBC', 'general_discount', 'Up to ~GBP 3,000 overdraft', 'https://www.hsbc.co.uk/current-accounts/products/student/',
  ARRAY['undergraduate']::TEXT[], FALSE,
  FALSE, FALSE, FALSE, FALSE,
  'institution_email', NULL, NULL, DATE '2026-04-14', 40, TRUE),

((SELECT id FROM public.offer_categories WHERE slug = 'banking-and-finance'),
  'Nationwide FlexStudent', 'nationwide-flexstudent',
  'Up to GBP 3,000 0% overdraft plus free worldwide travel insurance.',
  'Nationwide FlexStudent offers up to GBP 3,000 interest-free overdraft (tiered) and free multi-trip worldwide travel insurance for the duration of your studies -- a strong bonus for students planning to travel.',
  'Nationwide', 'general_discount', 'Up to GBP 3,000 overdraft + travel insurance', 'https://www.nationwide.co.uk/current-accounts/flexstudent/',
  ARRAY['undergraduate']::TEXT[], FALSE,
  FALSE, FALSE, FALSE, FALSE,
  'institution_email', NULL, NULL, DATE '2026-04-14', 50, TRUE)
ON CONFLICT (slug) DO NOTHING;


-- ---------------------------------------------------------------------------
-- 8. OFFERS -- Food and Drink (8)
-- ---------------------------------------------------------------------------
INSERT INTO public.offers (
  category_id, title, slug, summary, description, brand, offer_type,
  discount_text, url, eligible_stages, scotland_only,
  requires_young_scot, requires_totum, requires_unidays, requires_student_beans,
  verification_method, min_age, max_age, last_verified_at, display_order, is_active
) VALUES
((SELECT id FROM public.offer_categories WHERE slug = 'food-and-drink'),
  'Co-op 10% Off', 'co-op-young-scot-10-off',
  '10% off at Co-op Food for Young Scot or TOTUM cardholders.',
  '10% off shopping at participating Co-op Food stores for Young Scot NEC and TOTUM cardholders. Applied at the till when you present your card. Excludes alcohol, tobacco and certain promotional items.',
  'Co-op', 'general_discount', '10% off', 'https://young.scot/discounts',
  ARRAY['s1','s2','s3','s4','s5','s6','college','undergraduate','postgraduate']::TEXT[], FALSE,
  TRUE, TRUE, FALSE, FALSE,
  'young_scot', NULL, NULL, DATE '2026-04-14', 10, TRUE),

((SELECT id FROM public.offer_categories WHERE slug = 'food-and-drink'),
  'Pizza Hut 20% Off Dine-in', 'pizza-hut-20-off-dine-in',
  '20% off dine-in bills at participating Pizza Hut restaurants.',
  '20% off your final dine-in bill at participating Pizza Hut Restaurants on presentation of a Young Scot NEC, UNiDAYS code or Student Beans code. Excludes alcohol and set-menu deals.',
  'Pizza Hut', 'general_discount', '20% off', 'https://www.pizzahut.co.uk/restaurants/student-discount/',
  ARRAY['s1','s2','s3','s4','s5','s6','college','undergraduate','postgraduate']::TEXT[], FALSE,
  TRUE, FALSE, TRUE, TRUE,
  'student_beans', NULL, NULL, DATE '2026-04-14', 20, TRUE),

((SELECT id FROM public.offer_categories WHERE slug = 'food-and-drink'),
  'Greggs Free Sausage Roll (Student Beans)', 'greggs-student-free-sausage-roll',
  'Free sausage roll or vegan equivalent via Student Beans.',
  'Free sausage roll (or vegan sausage roll) with a hot drink through Student Beans at participating Greggs stores. One-off redemption code per verified Student Beans account.',
  'Greggs', 'general_discount', 'Free sausage roll', 'https://www.studentbeans.com/uk/offers/greggs',
  ARRAY['s5','s6','college','undergraduate','postgraduate']::TEXT[], FALSE,
  FALSE, FALSE, FALSE, TRUE,
  'student_beans', NULL, NULL, DATE '2026-04-14', 30, TRUE),

((SELECT id FROM public.offer_categories WHERE slug = 'food-and-drink'),
  'Domino''s 35% Off', 'dominos-35-off',
  '35% off Domino''s orders over GBP 25 via Student Beans.',
  '35% off online orders over GBP 25 at Domino''s Pizza with a Student Beans code. Does not combine with other deals (e.g. Two-for-Tuesday, meal deals).',
  'Domino''s Pizza', 'general_discount', '35% off orders over GBP 25', 'https://www.dominos.co.uk/student-discount',
  ARRAY['s5','s6','college','undergraduate','postgraduate']::TEXT[], FALSE,
  FALSE, FALSE, FALSE, TRUE,
  'student_beans', NULL, NULL, DATE '2026-04-14', 40, TRUE),

((SELECT id FROM public.offer_categories WHERE slug = 'food-and-drink'),
  'Deliveroo Plus Student', 'deliveroo-plus-student',
  'Free delivery on orders over GBP 15 for around GBP 2.99/month.',
  'Deliveroo Plus Student costs around GBP 2.99/month (half of standard Plus) for unlimited free delivery on orders over GBP 15, plus exclusive restaurant discounts.',
  'Deliveroo', 'general_discount', '~GBP 2.99/month (50% off)', 'https://deliveroo.co.uk/about/plus',
  ARRAY['college','undergraduate','postgraduate']::TEXT[], FALSE,
  FALSE, FALSE, FALSE, FALSE,
  'institution_email', NULL, NULL, DATE '2026-04-14', 50, TRUE),

((SELECT id FROM public.offer_categories WHERE slug = 'food-and-drink'),
  'Uber One Student', 'uber-one-student',
  'Uber One for around GBP 2.49/month (~58% off).',
  'Uber One Student at around GBP 2.49/month (vs ~GBP 5.99 standard). Discounts on Uber rides and Uber Eats orders. Verified through SheerID.',
  'Uber', 'general_discount', '~GBP 2.49/month (58% off)', 'https://www.uber.com/gb/en/price/deals/uber-one/student/',
  ARRAY['college','undergraduate','postgraduate']::TEXT[], FALSE,
  FALSE, FALSE, FALSE, FALSE,
  'institution_email', NULL, NULL, DATE '2026-04-14', 60, TRUE),

((SELECT id FROM public.offer_categories WHERE slug = 'food-and-drink'),
  'BrewDog 25% Off', 'brewdog-25-off',
  '25% off food and drink at BrewDog bars with student ID.',
  '25% off your food and drink bill at BrewDog bars UK-wide on presentation of valid student ID. Over-18s only; alcoholic drinks included.',
  'BrewDog', 'general_discount', '25% off', 'https://www.brewdog.com/uk/bars',
  ARRAY['college','undergraduate','postgraduate']::TEXT[], FALSE,
  FALSE, FALSE, FALSE, FALSE,
  'school_id', 18, NULL, DATE '2026-04-14', 70, TRUE),

((SELECT id FROM public.offer_categories WHERE slug = 'food-and-drink'),
  'McDonald''s Student Discount', 'mcdonalds-student-discount',
  '20% off via Student Beans in-store or in the MyMcDonald''s app.',
  '20% off McDonald''s orders (in-store or via the MyMcDonald''s app) through a Student Beans code. Excludes Happy Meals and promotional items.',
  'McDonald''s', 'general_discount', '20% off', 'https://www.studentbeans.com/uk/offers/mcdonalds',
  ARRAY['s5','s6','college','undergraduate','postgraduate']::TEXT[], FALSE,
  FALSE, FALSE, FALSE, TRUE,
  'student_beans', NULL, NULL, DATE '2026-04-14', 80, TRUE)
ON CONFLICT (slug) DO NOTHING;


-- ---------------------------------------------------------------------------
-- 9. OFFERS -- Retail and Fashion (6)
-- ---------------------------------------------------------------------------
INSERT INTO public.offers (
  category_id, title, slug, summary, description, brand, offer_type,
  discount_text, url, eligible_stages, scotland_only,
  requires_young_scot, requires_totum, requires_unidays, requires_student_beans,
  verification_method, min_age, max_age, last_verified_at, display_order, is_active
) VALUES
((SELECT id FROM public.offer_categories WHERE slug = 'retail-and-fashion'),
  'ASOS 10% Off', 'asos-10-off',
  '10% off most full-price items via UNiDAYS.',
  '10% off full-price items at ASOS through UNiDAYS. Excludes selected brands and sale items. Generate your session code on UNiDAYS before checkout.',
  'ASOS', 'general_discount', '10% off', 'https://www.asos.com/discount-codes-vouchers/',
  ARRAY['college','undergraduate','postgraduate']::TEXT[], FALSE,
  FALSE, FALSE, TRUE, FALSE,
  'unidays', NULL, NULL, DATE '2026-04-14', 10, TRUE),

((SELECT id FROM public.offer_categories WHERE slug = 'retail-and-fashion'),
  'H&M 10% Off', 'hm-10-off',
  '10% off H&M online orders via Student Beans.',
  '10% off H&M online orders with a unique Student Beans code. Free-delivery thresholds apply separately. In-store redemption via H&M Member QR codes where available.',
  'H&M', 'general_discount', '10% off', 'https://www2.hm.com/en_gb/customer-service/student-discount.html',
  ARRAY['s5','s6','college','undergraduate','postgraduate']::TEXT[], FALSE,
  FALSE, FALSE, FALSE, TRUE,
  'student_beans', 16, NULL, DATE '2026-04-14', 20, TRUE),

((SELECT id FROM public.offer_categories WHERE slug = 'retail-and-fashion'),
  'Mountain Warehouse 20% Off', 'mountain-warehouse-20-off',
  '20% off outdoor clothing and kit for Young Scot holders.',
  '20% off full-price outdoor clothing and equipment at Mountain Warehouse with a Young Scot NEC, online and in-store. Excludes sale items and selected electricals.',
  'Mountain Warehouse', 'general_discount', '20% off', 'https://www.mountainwarehouse.com/help/student-discount/',
  ARRAY['s1','s2','s3','s4','s5','s6','college','undergraduate','postgraduate']::TEXT[], FALSE,
  TRUE, FALSE, FALSE, FALSE,
  'young_scot', NULL, NULL, DATE '2026-04-14', 30, TRUE),

((SELECT id FROM public.offer_categories WHERE slug = 'retail-and-fashion'),
  'Specsavers 25% Off Glasses', 'specsavers-25-off-glasses',
  '25% off glasses from the GBP 69 range upwards.',
  '25% off glasses at Specsavers from the GBP 69 range and higher (excludes GBP 20 and GBP 35 ranges). Verify via Student Beans or TOTUM. One pair per transaction.',
  'Specsavers', 'general_discount', '25% off', 'https://www.specsavers.co.uk/student-offers',
  ARRAY['s5','s6','college','undergraduate','postgraduate']::TEXT[], FALSE,
  FALSE, TRUE, FALSE, TRUE,
  'student_beans', NULL, NULL, DATE '2026-04-14', 40, TRUE),

((SELECT id FROM public.offer_categories WHERE slug = 'retail-and-fashion'),
  'Boots Student Discount', 'boots-student-discount',
  '10-20% off beauty, health and wellbeing products.',
  '10-20% off at Boots (rate varies by campaign) -- redeem via Student Beans or UNiDAYS. Covers beauty, fragrance, electricals and selected pharmacy items.',
  'Boots', 'general_discount', '10-20% off', 'https://www.boots.com/students',
  ARRAY['s5','s6','college','undergraduate','postgraduate']::TEXT[], FALSE,
  FALSE, FALSE, TRUE, TRUE,
  'student_beans', NULL, NULL, DATE '2026-04-14', 50, TRUE),

((SELECT id FROM public.offer_categories WHERE slug = 'retail-and-fashion'),
  'JD Sports Student Discount', 'jd-sports-student-discount',
  '10-20% off sports and streetwear via UNiDAYS or Student Beans.',
  '10-20% off JD Sports online and in-store (rate varies by campaign) with UNiDAYS or Student Beans verification. Excludes selected brands and pre-order items.',
  'JD Sports', 'general_discount', '10-20% off', 'https://www.jdsports.co.uk/student-discount/',
  ARRAY['s5','s6','college','undergraduate','postgraduate']::TEXT[], FALSE,
  FALSE, FALSE, TRUE, TRUE,
  'unidays', NULL, NULL, DATE '2026-04-14', 60, TRUE)
ON CONFLICT (slug) DO NOTHING;


-- ---------------------------------------------------------------------------
-- 10. OFFER_SUPPORT_GROUPS -- junction rows linking offers to support tags
-- ---------------------------------------------------------------------------

-- EMA, School Clothing Grant, Free School Meals
-- -> young-carers, young-parents, care-experienced, estranged-students
INSERT INTO public.offer_support_groups (offer_id, support_group)
SELECT o.id, sg.tag
FROM public.offers o
CROSS JOIN (VALUES ('young-carers'), ('young-parents'),
                   ('care-experienced'), ('estranged-students')) AS sg(tag)
WHERE o.slug IN ('ema', 'school-clothing-grant', 'free-school-meals')
ON CONFLICT DO NOTHING;

-- Scottish Child Payment -> young-parents, care-experienced
INSERT INTO public.offer_support_groups (offer_id, support_group)
SELECT o.id, sg.tag
FROM public.offers o
CROSS JOIN (VALUES ('young-parents'), ('care-experienced')) AS sg(tag)
WHERE o.slug = 'scottish-child-payment'
ON CONFLICT DO NOTHING;

-- GP Registration, Dentist Registration -> refugees-asylum-seekers, esol-eal
INSERT INTO public.offer_support_groups (offer_id, support_group)
SELECT o.id, sg.tag
FROM public.offers o
CROSS JOIN (VALUES ('refugees-asylum-seekers'), ('esol-eal')) AS sg(tag)
WHERE o.slug IN ('gp-registration-guide', 'dentist-registration-guide')
ON CONFLICT DO NOTHING;

-- Breathing Space -> lgbtq, young-carers, estranged-students, care-experienced
INSERT INTO public.offer_support_groups (offer_id, support_group)
SELECT o.id, sg.tag
FROM public.offers o
CROSS JOIN (VALUES ('lgbtq'), ('young-carers'),
                   ('estranged-students'), ('care-experienced')) AS sg(tag)
WHERE o.slug = 'breathing-space-helpline'
ON CONFLICT DO NOTHING;

-- Contents Insurance, Tenancy Deposit Protection, Utility Switching Guide
-- -> estranged-students, care-experienced
INSERT INTO public.offer_support_groups (offer_id, support_group)
SELECT o.id, sg.tag
FROM public.offers o
CROSS JOIN (VALUES ('estranged-students'), ('care-experienced')) AS sg(tag)
WHERE o.slug IN ('student-contents-insurance-guide',
                 'tenancy-deposit-protection-scotland',
                 'student-utility-switching-guide')
ON CONFLICT DO NOTHING;

-- Hostelling Scotland, Free Bus Travel -> rural-island
INSERT INTO public.offer_support_groups (offer_id, support_group)
SELECT o.id, 'rural-island'
FROM public.offers o
WHERE o.slug IN ('hostelling-scotland-free-membership', 'free-bus-travel-under-22')
ON CONFLICT DO NOTHING;

-- All remaining accommodation items (not yet tagged)
-- -> estranged-students, care-experienced
INSERT INTO public.offer_support_groups (offer_id, support_group)
SELECT o.id, sg.tag
FROM public.offers o
CROSS JOIN (VALUES ('estranged-students'), ('care-experienced')) AS sg(tag)
WHERE o.slug IN ('council-tax-exemption-student-housing',
                 'scottish-water-student-exemption',
                 'tv-licence-student-guide',
                 'student-broadband-deals-guide')
ON CONFLICT DO NOTHING;

-- SAAS Tuition + Bursary -> mature-students, care-experienced, estranged-students
INSERT INTO public.offer_support_groups (offer_id, support_group)
SELECT o.id, sg.tag
FROM public.offers o
CROSS JOIN (VALUES ('mature-students'), ('care-experienced'),
                   ('estranged-students')) AS sg(tag)
WHERE o.slug IN ('saas-tuition-fee-payment', 'saas-bursary-living-cost-grant')
ON CONFLICT DO NOTHING;

-- Council Tax Student Exemption -> mature-students, estranged-students
INSERT INTO public.offer_support_groups (offer_id, support_group)
SELECT o.id, sg.tag
FROM public.offers o
CROSS JOIN (VALUES ('mature-students'), ('estranged-students')) AS sg(tag)
WHERE o.slug = 'council-tax-student-exemption'
ON CONFLICT DO NOTHING;

-- University Counselling Services
-- -> lgbtq, young-carers, estranged-students, care-experienced, refugees-asylum-seekers
INSERT INTO public.offer_support_groups (offer_id, support_group)
SELECT o.id, sg.tag
FROM public.offers o
CROSS JOIN (VALUES ('lgbtq'), ('young-carers'),
                   ('estranged-students'), ('care-experienced'),
                   ('refugees-asylum-seekers')) AS sg(tag)
WHERE o.slug = 'university-counselling-services'
ON CONFLICT DO NOTHING;


-- ---------------------------------------------------------------------------
-- 11. STARTING_UNI_CHECKLIST_ITEMS (21 items, linked to offers by slug)
-- ---------------------------------------------------------------------------

-- FINANCE (5 items)
INSERT INTO public.starting_uni_checklist_items (title, description, category, linked_offer_id, url, display_order, is_active)
SELECT v.title, v.description, v.category, (SELECT id FROM public.offers WHERE slug = v.slug), v.url, v.display_order, TRUE
FROM (VALUES
  ('Apply for SAAS funding',
   'Apply every academic year for tuition fee payment and any means-tested bursary or student loan.',
   'finance', 'saas-tuition-fee-payment', NULL::TEXT, 10),
  ('Open a student bank account',
   'Compare student accounts for interest-free overdrafts, switching cash incentives and perks like railcards.',
   'finance', 'santander-edge-student', NULL::TEXT, 20),
  ('Set up council tax exemption',
   'Register as a full-time student with your local council to avoid council tax charges.',
   'finance', 'council-tax-student-exemption', NULL::TEXT, 30),
  ('Check EMA eligibility if aged 16-19',
   'If you are staying on at school or going to college, check whether you qualify for the GBP 30/week Education Maintenance Allowance.',
   'finance', 'ema', NULL::TEXT, 40),
  ('Register for your Young Scot NEC',
   'The Young Scot National Entitlement Card is free and unlocks bus travel, train discounts and 1000+ offers.',
   'finance', 'young-scot-nec', NULL::TEXT, 50)
) AS v(title, description, category, slug, url, display_order)
WHERE NOT EXISTS (SELECT 1 FROM public.starting_uni_checklist_items WHERE title = v.title);

-- HEALTH (4 items)
INSERT INTO public.starting_uni_checklist_items (title, description, category, linked_offer_id, url, display_order, is_active)
SELECT v.title, v.description, v.category, (SELECT id FROM public.offers WHERE slug = v.slug), v.url, v.display_order, TRUE
FROM (VALUES
  ('Register with a GP near your university',
   'Finding a local GP early matters -- wait times vary. Register at your term-time address if you will be there more than six months.',
   'health', 'gp-registration-guide', NULL::TEXT, 60),
  ('Register with a dentist',
   'NHS dental practices may have waiting lists, so start looking as soon as you know your term-time address.',
   'health', 'dentist-registration-guide', NULL::TEXT, 70),
  ('Check university counselling services',
   'Every Scottish university offers free counselling -- note the contact details so you have them if you need them.',
   'health', 'university-counselling-services', NULL::TEXT, 80),
  ('Confirm free prescription access',
   'Prescriptions are already free in Scotland -- you do not need to apply, but good to know before any health need arises.',
   'health', 'free-prescriptions', NULL::TEXT, 90)
) AS v(title, description, category, slug, url, display_order)
WHERE NOT EXISTS (SELECT 1 FROM public.starting_uni_checklist_items WHERE title = v.title);

-- HOUSING (6 items)
INSERT INTO public.starting_uni_checklist_items (title, description, category, linked_offer_id, url, display_order, is_active)
SELECT v.title, v.description, v.category, (SELECT id FROM public.offers WHERE slug = v.slug), v.url, v.display_order, TRUE
FROM (VALUES
  ('Understand tenancy deposit protection',
   'Your landlord must lodge your deposit with an approved Scottish scheme within 30 working days. Know your rights.',
   'housing', 'tenancy-deposit-protection-scotland', NULL::TEXT, 100),
  ('Set up contents insurance',
   'Check whether your parents home insurance extends to students first, then consider a student-specific policy.',
   'housing', 'student-contents-insurance-guide', NULL::TEXT, 110),
  ('Set up broadband',
   'Check whether the landlord provides broadband. If not, compare 9-month student contracts.',
   'housing', 'student-broadband-deals-guide', NULL::TEXT, 120),
  ('Confirm council tax exemption with your local council',
   'Submit your matriculation letter to the local council covering your accommodation (halls are automatic, private lets are not).',
   'housing', 'council-tax-exemption-student-housing', NULL::TEXT, 130),
  ('Check Scottish Water exemption',
   'If council tax exempt as a full-time student, water and sewerage charges are auto-exempt -- no separate form needed.',
   'housing', 'scottish-water-student-exemption', NULL::TEXT, 140),
  ('Understand TV licence requirements',
   'If you watch live TV or BBC iPlayer on any device, you may need a TV licence. Check the rules for halls before assuming you are covered.',
   'housing', 'tv-licence-student-guide', NULL::TEXT, 150)
) AS v(title, description, category, slug, url, display_order)
WHERE NOT EXISTS (SELECT 1 FROM public.starting_uni_checklist_items WHERE title = v.title);

-- ADMIN (3 items -- no linked offers, external URLs)
INSERT INTO public.starting_uni_checklist_items (title, description, category, linked_offer_id, url, display_order, is_active)
VALUES
  ('Register to vote at your new address',
   'Students can register at both their term-time and home address. Register online at gov.uk.',
   'admin', NULL, 'https://www.gov.uk/register-to-vote', 160, TRUE),
  ('Update address with DVLA if applicable',
   'Update your driving licence address on gov.uk if you hold a full or provisional licence. It is free.',
   'admin', NULL, 'https://www.gov.uk/change-address-driving-licence', 170, TRUE),
  ('Set up mail redirection if needed',
   'Royal Mail offers paid mail redirection from your home address for 3, 6 or 12 months.',
   'admin', NULL, 'https://www.royalmail.com/personal/receiving-mail/redirection', 180, TRUE)
ON CONFLICT DO NOTHING;

-- TECH (3 items)
INSERT INTO public.starting_uni_checklist_items (title, description, category, linked_offer_id, url, display_order, is_active)
SELECT v.title, v.description, v.category, (SELECT id FROM public.offers WHERE slug = v.slug), v.url, v.display_order, TRUE
FROM (VALUES
  ('Activate GitHub Student Developer Pack',
   'Free developer tools worth over USD 10,000/year including GitHub Copilot, JetBrains IDEs and domain credits.',
   'tech', 'github-student-developer-pack', NULL::TEXT, 190),
  ('Install free Microsoft Office 365',
   'Free Word, Excel, PowerPoint and OneNote for students with an institutional email.',
   'tech', 'microsoft-office-365-education', NULL::TEXT, 200),
  ('Check Adobe, Autodesk and JetBrains eligibility for your course',
   'If your course needs design, engineering or coding tools, check the free or reduced-price educational licences from Adobe, Autodesk and JetBrains.',
   'tech', 'adobe-creative-cloud-student', NULL::TEXT, 210)
) AS v(title, description, category, slug, url, display_order)
WHERE NOT EXISTS (SELECT 1 FROM public.starting_uni_checklist_items WHERE title = v.title);

COMMIT;

-- =============================================================================
-- END OF SEED FILE
-- =============================================================================
