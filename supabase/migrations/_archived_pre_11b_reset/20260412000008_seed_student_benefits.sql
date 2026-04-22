-- Seed student_benefits with the canonical catalogue of Scottish student
-- benefits and discounts.
--
-- Groups: Government schemes (priority 85-100), Technology / high-value
-- (70-84), Popular commercial (50-69), Niche (30-49).
--
-- Only widely publicised discounts are included; affiliate network metadata is
-- populated where the brand is known to run a student programme through the
-- named network so the infrastructure is ready when accounts are activated.
-- affiliate_url is intentionally left NULL until accounts are live.

-- ============================================================================
-- GOVERNMENT SCHEMES (priority 85-100)
-- ============================================================================

INSERT INTO student_benefits (
  name, provider, description, short_description, category, discount_value, discount_type,
  eligibility_s1_s4, eligibility_s5_s6, eligibility_college, eligibility_university,
  min_age, max_age, access_method, access_platform,
  is_scotland_only, is_government_scheme, is_care_experienced_only, is_means_tested,
  url, priority_score
) VALUES

-- 1. Free bus travel for under-22s
('Free bus travel for under-22s',
 'Transport Scotland',
 'Every Scottish resident aged 5 to 21 can travel for free on most registered bus services across Scotland. You need a National Entitlement Card (NEC) or Young Scot NEC to use the scheme. Apply through your local council or Young Scot.',
 'Unlimited free bus travel anywhere in Scotland for under-22s.',
 'government', '100% free bus travel', 'free',
 true, true, true, true,
 NULL, 21, 'National Entitlement Card (NEC) or Young Scot NEC', 'Young Scot / local council',
 true, true, false, false,
 'https://www.getyournec.scot', 100),

-- 2. Free tuition fees (SAAS)
('Free tuition fees (SAAS)',
 'Student Awards Agency Scotland',
 'Scottish-domiciled students studying an eligible full-time undergraduate course in Scotland pay no tuition fees — SAAS pays up to GBP 1,820 per year directly to your university or college.',
 'No tuition fees for eligible Scottish undergraduates.',
 'government', 'Free tuition — up to GBP 1,820/year covered', 'free',
 false, false, true, true,
 NULL, NULL, 'Apply to SAAS each academic year', 'SAAS',
 true, true, false, false,
 'https://www.saas.gov.uk', 99),

-- 3. Young Students Bursary
('Young Students'' Bursary',
 'Student Awards Agency Scotland',
 'A means-tested non-repayable bursary of up to GBP 2,000 per year for eligible young Scottish students at university. Paid in addition to student loan support.',
 'Up to GBP 2,000/year non-repayable bursary for eligible young students.',
 'funding', 'Up to GBP 2,000/year non-repayable', 'fixed',
 false, false, false, true,
 NULL, 24, 'Apply to SAAS each academic year', 'SAAS',
 true, true, false, true,
 'https://www.saas.gov.uk', 98),

-- 4. Care-Experienced Bursary
('Care-Experienced Students'' Bursary',
 'Student Awards Agency Scotland',
 'A non-repayable bursary of up to GBP 9,000 per year for care-experienced students in full-time further or higher education. Available to anyone who has ever been looked-after at any stage in their life.',
 'Up to GBP 9,000/year non-repayable for care-experienced students.',
 'funding', 'Up to GBP 9,000/year non-repayable', 'fixed',
 false, false, true, true,
 NULL, NULL, 'Apply to SAAS with evidence of care experience', 'SAAS',
 true, true, true, false,
 'https://www.saas.gov.uk', 97),

-- 5. EMA
('Education Maintenance Allowance (EMA)',
 'Scottish Government',
 'Weekly payment of GBP 30 for students aged 16-19 from lower-income households staying on in S5 or S6, or attending college. Paid fortnightly in arrears, subject to attendance.',
 'GBP 30/week for S5/S6 pupils and college students from lower-income households.',
 'funding', 'GBP 30/week', 'fixed',
 false, true, true, false,
 16, 19, 'Apply through your school or college', 'Local council',
 true, true, false, true,
 'https://www.mygov.scot/ema', 96),

-- 12. Young Scot NEC
('Young Scot National Entitlement Card',
 'Young Scot',
 'Free card for 11-25 year olds acting as proof of age, bus pass, library card, leisure pass, and key to hundreds of discounts with Young Scot Rewards partners across Scotland and online.',
 'Free card unlocking discounts, proof of age, and bus travel.',
 'government', 'Free card — unlocks thousands of discounts', 'free',
 true, true, true, true,
 11, 25, 'Apply online via Young Scot', 'Young Scot',
 true, true, false, false,
 'https://young.scot/get-informed/young-scot-nec', 95),

-- 6. Free prescriptions
('Free NHS prescriptions',
 'NHS Scotland',
 'All NHS prescriptions in Scotland are free for everyone. In England the standard charge is around GBP 9.90 per item — a significant saving for anyone managing a long-term condition.',
 'Free prescriptions for every Scottish resident.',
 'government', 'Free — saves approx GBP 9.90 per item vs England', 'free',
 true, true, true, true,
 NULL, NULL, 'Show your name and address at the pharmacy', 'NHS Scotland',
 true, true, false, false,
 'https://www.nhsinform.scot/care-support-and-rights/nhs-services/pharmacy/prescriptions-and-pharmacy-services', 92),

-- 7. Free period products
('Free period products',
 'Scottish Government',
 'Scotland was the first country in the world to make period products free. Every school, college and university has free products available in toilets and welfare areas.',
 'Free tampons and pads in every school, college, and university.',
 'government', 'Free in every school, college, and university building', 'free',
 true, true, true, true,
 NULL, NULL, 'Collect from school, college, university, or public buildings', NULL,
 true, true, false, false,
 'https://www.mygov.scot/free-period-products', 91),

-- 8. Free NHS eye tests
('Free NHS eye tests',
 'NHS Scotland',
 'NHS Scotland offers free eye examinations to everyone registered with a Scottish GP. Eye tests in England cost around GBP 25.',
 'Free eye examinations for all Scottish residents.',
 'government', 'Free eye test (worth approx GBP 25)', 'free',
 true, true, true, true,
 NULL, NULL, 'Book with any NHS optician in Scotland', 'NHS Scotland',
 true, true, false, false,
 'https://www.nhsinform.scot/care-support-and-rights/nhs-services/dental-and-eyecare/free-eye-examinations-in-scotland', 89),

-- 9. Free dental check-ups
('Free NHS dental check-ups',
 'NHS Scotland',
 'All NHS dental examinations in Scotland are free under the Scottish Government''s free dental examination scheme. Under-26s registered with an NHS dentist also get free standard treatment.',
 'Free dental check-ups, plus free treatment for under-26s.',
 'government', 'Free check-ups + free treatment for under-26s', 'free',
 true, true, true, true,
 NULL, 25, 'Register with an NHS dentist in Scotland', 'NHS Scotland',
 true, true, false, false,
 'https://www.mygov.scot/dental-charges', 88),

-- 10. Council tax exemption
('Council tax exemption',
 'Scottish Government',
 'Households where every resident is a full-time student are 100% exempt from council tax. Where some residents are students and some are not, a 25% discount may apply.',
 '100% exemption for all-student households.',
 'government', '100% exemption if all household members are full-time students', 'free',
 false, false, true, true,
 NULL, NULL, 'Apply via your local council with proof of study', 'Local council',
 true, true, false, false,
 'https://www.mygov.scot/council-tax-reduction/full-time-students', 87),

-- 11. School Clothing Grant
('School Clothing Grant',
 'Scottish Government',
 'Means-tested annual grant of GBP 120-225 per secondary pupil to help with the cost of school uniforms and PE kit. Exact amount varies by local authority.',
 'Annual grant of GBP 120-225 towards secondary school uniform.',
 'government', 'GBP 120-225 per secondary pupil', 'fixed',
 true, true, false, false,
 NULL, 18, 'Apply through your local council', 'Local council',
 true, true, false, true,
 'https://www.mygov.scot/clothing-grants', 86),

-- Best Start Grant (School Age Payment)
('Best Start Grant — School Age Payment',
 'Social Security Scotland',
 'One-off payment of around GBP 314 for families on qualifying benefits when a child starts primary school. Covers the start of primary one year.',
 'One-off payment when starting primary school for eligible families.',
 'funding', 'Approx GBP 314 one-off payment', 'fixed',
 false, false, false, false,
 4, 6, 'Apply through Social Security Scotland', 'mygov.scot',
 true, true, false, true,
 'https://www.mygov.scot/best-start-grant-school-age-payment', 85),

-- Free school meals
('Free school meals',
 'Scottish Government',
 'All pupils in P1-P5 get free school lunches automatically. Pupils in P6 upwards may be eligible if their household receives certain benefits. Secondary school pupils from eligible households continue to receive free meals.',
 'Free lunches automatically in P1-P5; means-tested beyond.',
 'government', 'Free school lunches', 'free',
 true, true, false, false,
 NULL, 18, 'Automatic P1-P5; apply via local council for others', 'Local council',
 true, true, false, true,
 'https://www.mygov.scot/school-meals', 88);

-- ============================================================================
-- FUNDING (priority 70-85)
-- ============================================================================

INSERT INTO student_benefits (
  name, provider, description, short_description, category, discount_value, discount_type,
  eligibility_s1_s4, eligibility_s5_s6, eligibility_college, eligibility_university,
  access_method, is_scotland_only, is_government_scheme, is_care_experienced_only, is_means_tested,
  url, priority_score
) VALUES

('Student loan (SAAS)',
 'Student Awards Agency Scotland',
 'Low-interest repayable student loan of up to around GBP 9,400 per year to help with living costs while at university. Repayment only begins once you earn above the threshold after graduation.',
 'Repayable living-cost loan for eligible undergraduates.',
 'funding', 'Up to approx GBP 9,400/year (repayable)', 'other',
 false, false, false, true,
 'Apply to SAAS each academic year', true, true, false, true,
 'https://www.saas.gov.uk', 84),

('Independent Students'' Bursary',
 'Student Awards Agency Scotland',
 'Means-tested bursary of up to around GBP 1,000 per year for independent students (aged 25 or over, or who have supported themselves for 3+ years).',
 'Bursary for mature/independent students.',
 'funding', 'Up to approx GBP 1,000/year non-repayable', 'fixed',
 false, false, false, true,
 'Apply to SAAS', true, true, false, true,
 'https://www.saas.gov.uk', 82),

('Lone Parent Grant',
 'Student Awards Agency Scotland',
 'Additional grant of up to around GBP 1,305 for lone parents in higher education. Paid on top of the standard bursary and loan package.',
 'Extra grant for single parents in higher education.',
 'funding', 'Up to approx GBP 1,305/year non-repayable', 'fixed',
 false, false, true, true,
 'Apply to SAAS', true, true, false, true,
 'https://www.saas.gov.uk', 80),

('Disabled Students'' Allowance',
 'Student Awards Agency Scotland',
 'Non-repayable support to cover the additional costs of studying caused by a disability, long-term health condition, or specific learning difficulty.',
 'Non-repayable support for disability-related study costs.',
 'funding', 'Up to approx GBP 5,160/year for equipment + non-medical helper costs', 'other',
 false, false, true, true,
 'Apply to SAAS with evidence', true, true, false, false,
 'https://www.saas.gov.uk/full-time/disabled-students-allowance', 81),

('Discretionary Funds (colleges)',
 'Scottish Funding Council',
 'Colleges hold discretionary hardship funds to help students experiencing unexpected financial difficulty. Each college sets its own application process.',
 'Hardship payments via your college.',
 'funding', 'Varies — typically GBP 100-500', 'other',
 false, false, true, false,
 'Apply through college student services', true, true, false, true,
 'https://www.sfc.ac.uk', 72),

('University hardship funds',
 'Scottish universities',
 'Every Scottish university runs a discretionary hardship fund for students facing financial crisis. Payments are usually grants rather than loans and are assessed case-by-case.',
 'Emergency grants via university student services.',
 'funding', 'Varies — typically GBP 250-1,500', 'other',
 false, false, false, true,
 'Apply through university student services', true, true, false, true,
 'https://www.saas.gov.uk', 72);

-- ============================================================================
-- TRAVEL & TRANSPORT
-- ============================================================================

INSERT INTO student_benefits (
  name, provider, description, short_description, category, discount_value, discount_type,
  eligibility_s1_s4, eligibility_s5_s6, eligibility_college, eligibility_university,
  min_age, max_age, access_method, is_scotland_only, url, priority_score
) VALUES

('ScotRail Young Scot discount',
 'ScotRail',
 'Young Scot cardholders aged 16-25 get up to 50% off standard ScotRail fares across Scotland. Not valid before 0915 on weekdays but otherwise available anytime.',
 '50% off ScotRail fares with Young Scot card.',
 'travel_transport', 'Up to 50% off rail fares', 'percentage',
 true, true, true, true,
 16, 25, 'Young Scot NEC', true,
 'https://www.scotrail.co.uk/plan-your-journey/tickets-and-railcards/young-scot-discount', 78),

('16-25 Railcard',
 'National Rail',
 'Annual railcard giving 1/3 off most rail fares across the UK. Costs around GBP 30/year, typically pays for itself in a few journeys.',
 '1/3 off UK rail fares for GBP 30/year.',
 'travel_transport', '1/3 off rail fares', 'percentage',
 true, true, true, true,
 16, 25, 'Buy online at 16-25railcard.co.uk', false,
 'https://www.16-25railcard.co.uk', 74),

('26-30 Railcard',
 'National Rail',
 'Annual railcard for 26-30 year olds giving 1/3 off most rail fares UK-wide. Same GBP 30/year price as the 16-25 Railcard.',
 '1/3 off UK rail fares for GBP 30/year (26-30 year olds).',
 'travel_transport', '1/3 off rail fares', 'percentage',
 false, false, true, true,
 26, 30, 'Buy online at 26-30railcard.co.uk', false,
 'https://www.26-30railcard.co.uk', 60),

('Megabus student offers',
 'Megabus',
 'Regular student ticket sales with intercity coach fares from GBP 1-5. Sign up to Megabus emails to catch deals as they launch.',
 'Coach fares from GBP 1 during student sales.',
 'travel_transport', 'Fares from GBP 1', 'fixed',
 true, true, true, true,
 NULL, NULL, 'Sign up via megabus.com', false,
 'https://uk.megabus.com', 50),

('Hostelling Scotland free youth membership',
 'Hostelling Scotland',
 'Free membership for 16-25 year-olds who are Scottish residents — unlocks member rates and a voucher book worth over GBP 100 of discounts at Scottish hostels and attractions.',
 'Free youth membership (worth GBP 20+) + GBP 100+ voucher book.',
 'accommodation', 'Free membership worth GBP 20+', 'free',
 true, true, true, true,
 16, 25, 'Apply online at hostellingscotland.org.uk', true,
 'https://www.hostellingscotland.org.uk/membership/youth', 68),

('National Express Coachcard',
 'National Express',
 '1/3 off most National Express coach fares UK-wide for around GBP 12.50/year.',
 '1/3 off National Express coach fares.',
 'travel_transport', '1/3 off fares', 'percentage',
 true, true, true, true,
 16, 26, 'Buy at nationalexpress.com', false,
 'https://www.nationalexpress.com/en/offers/coachcards', 52);

-- ============================================================================
-- TECHNOLOGY & SOFTWARE (priority 60-85)
-- ============================================================================

INSERT INTO student_benefits (
  name, provider, description, short_description, category, discount_value, discount_type,
  eligibility_s1_s4, eligibility_s5_s6, eligibility_college, eligibility_university,
  access_method, access_platform, affiliate_network, affiliate_commission, affiliate_cookie_days,
  url, priority_score
) VALUES

('GitHub Student Developer Pack',
 'GitHub',
 'Free access to over 100 developer tools for students including domain names, hosting credits, IDE licences, design tools, and cloud credits. Total value typically quoted at over GBP 10,000 per student.',
 'Over GBP 10,000 of free developer tools.',
 'technology', 'Free — GBP 10,000+ value', 'free',
 false, true, true, true,
 'Verify with school/university email at GitHub Education', 'GitHub Education', NULL, NULL, NULL,
 'https://education.github.com/pack', 84),

('Adobe Creative Cloud Student Plan',
 'Adobe',
 'Full Creative Cloud (Photoshop, Illustrator, Premiere Pro, After Effects, InDesign, etc.) at a student rate — around 65% off the standard price for the first year.',
 '65% off Creative Cloud in year one.',
 'technology', '65-70% off Creative Cloud', 'percentage',
 false, true, true, true,
 'Verify with school/university email', 'Adobe', 'partnerize', '3-5%', 30,
 'https://www.adobe.com/uk/creativecloud/buy/students.html', 80),

('Autodesk Education licence',
 'Autodesk',
 'Free 1-year education licences for AutoCAD, Revit, Maya, 3ds Max, Fusion 360, Inventor, and the rest of Autodesk''s portfolio for verified students.',
 'Free Autodesk software for students.',
 'technology', 'Free 1-year licences', 'free',
 false, true, true, true,
 'Verify at autodesk.com/education', 'Autodesk', NULL, NULL, NULL,
 'https://www.autodesk.com/education', 78),

('JetBrains Student Pack',
 'JetBrains',
 'Free professional licences for the entire JetBrains suite (IntelliJ IDEA Ultimate, PyCharm, WebStorm, CLion, etc.) for verified students and teachers.',
 'Free JetBrains IDEs for students.',
 'technology', 'Free professional licences', 'free',
 false, true, true, true,
 'Verify at jetbrains.com/student', 'JetBrains', NULL, NULL, NULL,
 'https://www.jetbrains.com/community/education/#students', 77),

('Microsoft 365 Education',
 'Microsoft',
 'Free Microsoft 365 (Word, Excel, PowerPoint, Teams, OneDrive, OneNote) for students at eligible schools, colleges, and universities.',
 'Free Microsoft 365 for students.',
 'technology', 'Free Office 365', 'free',
 true, true, true, true,
 'Sign up with school/university email', 'Microsoft', NULL, NULL, NULL,
 'https://www.microsoft.com/en-gb/education/products/office', 79),

('Apple Education pricing',
 'Apple',
 'Up to 10% off Mac and iPad, plus discounted AppleCare, for students, teachers, and staff at higher education institutions. Free AirPods often included with Back-to-School promotions.',
 'Up to 10% off Mac + iPad.',
 'technology', 'Up to 10% off + Back-to-School bonus', 'percentage',
 false, false, true, true,
 'Apple Education store with verified status', 'Apple', NULL, NULL, NULL,
 'https://www.apple.com/uk-edu/store', 75),

('Canva for Education',
 'Canva',
 'Free Canva Pro for students and teachers at verified schools — unlocks premium templates, backgrounds, stock photos, and brand kits.',
 'Free Canva Pro for students.',
 'technology', 'Free Canva Pro (worth GBP 100+/yr)', 'free',
 true, true, true, true,
 'Verify via school email', 'Canva', NULL, NULL, NULL,
 'https://www.canva.com/education', 72),

('Figma Education',
 'Figma',
 'Free access to Figma Professional plan for students and educators, including unlimited Figma and FigJam files.',
 'Free Figma Professional plan.',
 'technology', 'Free Professional plan', 'free',
 false, true, true, true,
 'Verify with school email at figma.com/education', 'Figma', NULL, NULL, NULL,
 'https://www.figma.com/education', 68),

('Notion for Students',
 'Notion',
 'Free Notion Plus plan for verified students and educators — unlimited blocks, file uploads, and 30-day page history.',
 'Free Notion Plus plan.',
 'technology', 'Free Plus plan', 'free',
 false, true, true, true,
 'Verify with school email at notion.so/students', 'Notion', NULL, NULL, NULL,
 'https://www.notion.so/students', 66),

('Grammarly Student',
 'Grammarly',
 'Discounted Grammarly Premium for students — typically around 20% off the annual plan.',
 '20% off Grammarly Premium.',
 'technology', 'Approx 20% off Premium', 'percentage',
 false, true, true, true,
 'Via Student Beans / UNiDAYS', 'Student Beans / UNiDAYS', NULL, NULL, NULL,
 'https://www.grammarly.com/students', 58);

-- ============================================================================
-- ENTERTAINMENT & LEISURE (priority 50-75)
-- ============================================================================

INSERT INTO student_benefits (
  name, provider, description, short_description, category, discount_value, discount_type,
  eligibility_s1_s4, eligibility_s5_s6, eligibility_college, eligibility_university,
  min_age, access_method, access_platform, affiliate_network, affiliate_commission, affiliate_cookie_days,
  url, priority_score
) VALUES

('Spotify Premium Student',
 'Spotify',
 'Spotify Premium at 50% of the standard price for verified higher education students. Includes Hulu bundle in some regions.',
 '50% off Spotify Premium.',
 'entertainment', '50% off Premium', 'subscription',
 false, false, true, true,
 NULL, 'Verify via SheerID on Spotify signup', 'Spotify', NULL, NULL, NULL,
 'https://www.spotify.com/uk/student', 74),

('Apple Music Student',
 'Apple',
 'Apple Music at roughly half the standard price for students in higher education. Includes Apple TV+ at no extra cost.',
 'Half-price Apple Music + Apple TV+.',
 'entertainment', 'Approx 50% off + free Apple TV+', 'subscription',
 false, false, true, true,
 NULL, 'Verify via UNiDAYS on Apple Music', 'Apple / UNiDAYS', NULL, NULL, NULL,
 'https://support.apple.com/en-gb/HT205928', 72),

('Amazon Prime Student',
 'Amazon',
 'Amazon Prime Student gives students 6 months free, then 50% off the standard Amazon Prime price. Includes free next-day delivery, Prime Video, Prime Music, and Prime Reading.',
 '6 months free then 50% off Prime.',
 'entertainment', '6 months free then 50% off', 'subscription',
 false, false, true, true,
 NULL, 'Sign up with university email at amazon.co.uk/joinstudent', 'Amazon', 'amazon', 'GBP flat fee', 1,
 'https://www.amazon.co.uk/joinstudent', 76),

('YouTube Premium Student',
 'YouTube',
 'YouTube Premium at student rate — around half the standard price. Ad-free videos, background play, and YouTube Music Premium included.',
 'Half-price YouTube Premium.',
 'entertainment', 'Approx 50% off', 'subscription',
 false, false, true, true,
 NULL, 'Verify via SheerID', 'YouTube', NULL, NULL, NULL,
 'https://www.youtube.com/premium/student', 66),

('Odeon Students',
 'Odeon',
 'Discounted cinema tickets for students at Odeon cinemas UK-wide. Usually available with a valid student ID — savings around 15-25% off standard adult prices.',
 '15-25% off cinema tickets.',
 'entertainment', '15-25% off tickets', 'percentage',
 false, true, true, true,
 16, 'Show student ID at the box office', 'Odeon', NULL, NULL, NULL,
 'https://www.odeon.co.uk', 60),

('Vue cinema student tickets',
 'Vue',
 'Reduced cinema tickets for students on presentation of a valid student ID. Prices vary by venue.',
 'Discounted cinema tickets with student ID.',
 'entertainment', 'Reduced student ticket price', 'percentage',
 false, true, true, true,
 16, 'Show student ID at box office', 'Vue', NULL, NULL, NULL,
 'https://www.myvue.com', 56),

('Cineworld Unlimited Student',
 'Cineworld',
 'Unlimited membership discount for students — around 25% off the standard monthly price for unlimited cinema visits.',
 'Approx 25% off Unlimited membership.',
 'entertainment', 'Approx 25% off Unlimited', 'subscription',
 false, false, true, true,
 18, 'Via Student Beans', 'Student Beans', NULL, NULL, NULL,
 'https://www.cineworld.co.uk/unlimited', 58),

('PureGym Student',
 'PureGym',
 'Discounted student gym membership at PureGym — around 10-15% off standard monthly rates depending on location.',
 '10-15% off PureGym membership.',
 'entertainment', '10-15% off membership', 'percentage',
 false, false, true, true,
 16, 'Via Student Beans / UNiDAYS', 'Student Beans / UNiDAYS', NULL, NULL, NULL,
 'https://www.puregym.com/students', 54),

('National Trust for Scotland — free student membership',
 'National Trust for Scotland',
 'Young Scot cardholders get free youth membership to the National Trust for Scotland, giving free entry to castles, gardens, and heritage sites across Scotland.',
 'Free NTS youth membership with Young Scot.',
 'entertainment', 'Free membership (worth GBP 30+)', 'free',
 true, true, true, true,
 11, 'Via Young Scot Rewards', 'Young Scot', NULL, NULL, NULL,
 'https://young.scot/rewards', 62);

-- ============================================================================
-- FOOD & DRINK (priority 40-65)
-- ============================================================================

INSERT INTO student_benefits (
  name, provider, description, short_description, category, discount_value, discount_type,
  eligibility_s1_s4, eligibility_s5_s6, eligibility_college, eligibility_university,
  access_method, access_platform, affiliate_network, affiliate_commission, affiliate_cookie_days,
  url, priority_score
) VALUES

('Domino''s Pizza student discount',
 'Domino''s',
 '35% off Domino''s online orders for verified students via UNiDAYS. Valid on full-price menu items; exclusions apply.',
 '35% off Domino''s online.',
 'food_drink', '35% off', 'percentage',
 false, true, true, true,
 'UNiDAYS code applied at checkout', 'UNiDAYS', 'awin', '3-6%', 30,
 'https://www.dominos.co.uk/student', 64),

('Pizza Hut student discount',
 'Pizza Hut',
 '20% off Pizza Hut orders for verified students via Student Beans and UNiDAYS.',
 '20% off Pizza Hut.',
 'food_drink', '20% off', 'percentage',
 false, true, true, true,
 'Via Student Beans / UNiDAYS', 'Student Beans / UNiDAYS', 'awin', '3-5%', 30,
 'https://www.pizzahut.co.uk', 60),

('KFC student discount',
 'KFC',
 'Student Beans discount on selected KFC menu items and meal deals — typically around 15-20% off.',
 '15-20% off KFC via Student Beans.',
 'food_drink', '15-20% off', 'percentage',
 false, true, true, true,
 'Student Beans', 'Student Beans', NULL, NULL, NULL,
 'https://www.kfc.co.uk', 54),

('McDonald''s student offers',
 'McDonald''s',
 'Rotating McDonald''s student offers via UNiDAYS and the McDonald''s app — typically free items, meal deal upgrades, and BOGOF on selected products.',
 'Free items and meal deal upgrades via app.',
 'food_drink', 'Free items / deals', 'other',
 true, true, true, true,
 'My McDonald''s app + UNiDAYS', 'UNiDAYS', NULL, NULL, NULL,
 'https://www.mcdonalds.com/gb/en-gb/app.html', 52),

('Nando''s student discount',
 'Nando''s',
 '20% off Nando''s dine-in for students with valid student ID (excludes alcohol and some days — check locally).',
 '20% off dine-in at Nando''s.',
 'food_drink', '20% off', 'percentage',
 false, false, true, true,
 'Show student ID in restaurant', 'Nando''s', NULL, NULL, NULL,
 'https://www.nandos.co.uk', 58),

('Wagamama student discount',
 'Wagamama',
 '20% off Wagamama food orders for students dining in with a valid student ID.',
 '20% off Wagamama dine-in.',
 'food_drink', '20% off', 'percentage',
 false, false, true, true,
 'Show student ID in restaurant', 'Wagamama', NULL, NULL, NULL,
 'https://www.wagamama.com', 50),

('Greggs — free sausage roll / sweet treat',
 'Greggs',
 'Free sausage roll or sweet treat when you download the Greggs app and sign up — plus ongoing app-exclusive deals and rewards.',
 'Free sausage roll with the Greggs app.',
 'food_drink', 'Free item on signup + app rewards', 'free',
 true, true, true, true,
 'Download Greggs app', 'Greggs app', NULL, NULL, NULL,
 'https://www.greggs.co.uk/greggs-app', 58),

('Subway student offers',
 'Subway',
 'Regular rotating offers for students via Subway Rewards app and Student Beans — often BOGOF subs, free cookies, and meal deal discounts.',
 'BOGOF subs and rotating app offers.',
 'food_drink', 'Rotating app offers', 'other',
 true, true, true, true,
 'Subway Rewards app', 'Subway', NULL, NULL, NULL,
 'https://www.subway.com/en-gb', 48),

('Costa Coffee Student',
 'Costa',
 'Costa Club app members collect beans for free drinks — students also get rotating offers via Student Beans.',
 'Free drinks via Costa Club + student offers.',
 'food_drink', 'Free drinks via Costa Club', 'free',
 true, true, true, true,
 'Costa Club app + Student Beans', 'Costa Club', NULL, NULL, NULL,
 'https://www.costa.co.uk/costa-club', 46),

('Starbucks Student Rewards',
 'Starbucks',
 'Starbucks Rewards members earn stars for free drinks — plus student-specific offers run periodically via UNiDAYS.',
 'Rewards stars and student offers.',
 'food_drink', 'Free drinks via Rewards + discounts', 'other',
 true, true, true, true,
 'Starbucks Rewards app + UNiDAYS', 'UNiDAYS', NULL, NULL, NULL,
 'https://www.starbucks.co.uk/rewards', 44),

('Deliveroo Plus Student',
 'Deliveroo',
 'Deliveroo Plus Student — free delivery on eligible orders at a reduced student rate (around 50% off standard subscription).',
 '50% off Deliveroo Plus.',
 'food_drink', 'Approx 50% off Plus subscription', 'subscription',
 false, true, true, true,
 'Verify student email at signup', 'Deliveroo', 'awin', '2-4%', 30,
 'https://deliveroo.co.uk/plus', 60),

('Just Eat student offers',
 'Just Eat',
 'Rotating student discount codes via UNiDAYS and Student Beans — typically 10-25% off orders over a threshold.',
 '10-25% off Just Eat orders.',
 'food_drink', '10-25% off', 'percentage',
 false, true, true, true,
 'Code via UNiDAYS / Student Beans', 'UNiDAYS / Student Beans', 'awin', '2-4%', 30,
 'https://www.just-eat.co.uk', 56),

('Uber Eats student offer',
 'Uber Eats',
 'Uber One Student — around 50% off the Uber One subscription for verified students, unlocking free delivery and discounts on both Uber Eats and Uber rides.',
 '50% off Uber One.',
 'food_drink', 'Approx 50% off Uber One', 'subscription',
 false, false, true, true,
 'Verify student status on Uber app', 'Uber', NULL, NULL, NULL,
 'https://www.ubereats.com/gb', 54),

('Co-op food student discount',
 'Co-op',
 '10% off Co-op food shopping for NUS / TOTUM cardholders. Valid in store with card scan.',
 '10% off Co-op groceries.',
 'food_drink', '10% off', 'percentage',
 false, false, true, true,
 'NUS / TOTUM card', 'TOTUM', NULL, NULL, NULL,
 'https://www.coop.co.uk/totum', 50);

-- ============================================================================
-- RETAIL & FASHION (priority 40-65)
-- ============================================================================

INSERT INTO student_benefits (
  name, provider, description, short_description, category, discount_value, discount_type,
  eligibility_s1_s4, eligibility_s5_s6, eligibility_college, eligibility_university,
  access_method, access_platform, affiliate_network, affiliate_commission, affiliate_cookie_days,
  url, priority_score
) VALUES

('ASOS student discount',
 'ASOS',
 '10% off full-price orders at ASOS for students via UNiDAYS. Often boosted to 20% during student promo periods.',
 '10-20% off ASOS.',
 'retail_fashion', '10-20% off', 'percentage',
 false, true, true, true,
 'UNiDAYS code at checkout', 'UNiDAYS', 'awin', '3-7%', 30,
 'https://www.asos.com/students', 64),

('Nike student discount',
 'Nike',
 '10% off Nike orders for verified students via UNiDAYS.',
 '10% off Nike.',
 'retail_fashion', '10% off', 'percentage',
 false, true, true, true,
 'UNiDAYS code', 'UNiDAYS', 'awin', '4-8%', 30,
 'https://www.nike.com/gb/help/a/student-discount', 60),

('adidas student discount',
 'adidas',
 '15-25% off adidas for students via UNiDAYS or Student Beans — discount varies by promotion.',
 '15-25% off adidas.',
 'retail_fashion', '15-25% off', 'percentage',
 false, true, true, true,
 'UNiDAYS / Student Beans code', 'UNiDAYS / Student Beans', 'awin', '4-8%', 30,
 'https://www.adidas.co.uk', 60),

('H&M student discount',
 'H&M',
 '10% off H&M orders online for verified students via Student Beans.',
 '10% off H&M online.',
 'retail_fashion', '10% off', 'percentage',
 false, true, true, true,
 'Student Beans code', 'Student Beans', 'awin', '5-7%', 30,
 'https://www2.hm.com/en_gb', 54),

('New Balance student discount',
 'New Balance',
 '15% off New Balance orders via Student Beans and UNiDAYS.',
 '15% off New Balance.',
 'retail_fashion', '15% off', 'percentage',
 false, true, true, true,
 'Student Beans / UNiDAYS', 'Student Beans / UNiDAYS', 'awin', '4-8%', 30,
 'https://www.newbalance.co.uk', 50),

('JD Sports student discount',
 'JD Sports',
 '10-20% off JD Sports orders for verified students via Student Beans.',
 '10-20% off JD Sports.',
 'retail_fashion', '10-20% off', 'percentage',
 false, true, true, true,
 'Student Beans', 'Student Beans', 'awin', '3-6%', 30,
 'https://www.jdsports.co.uk', 50),

('Boohoo student discount',
 'Boohoo',
 '15-20% off boohoo orders for students via Student Beans.',
 '15-20% off boohoo.',
 'retail_fashion', '15-20% off', 'percentage',
 false, true, true, true,
 'Student Beans', 'Student Beans', 'awin', '3-7%', 30,
 'https://www.boohoo.com/page/student-discount.html', 48),

('PrettyLittleThing student discount',
 'PrettyLittleThing',
 '25-30% off PrettyLittleThing orders for students via Student Beans.',
 '25-30% off PLT.',
 'retail_fashion', '25-30% off', 'percentage',
 false, true, true, true,
 'Student Beans', 'Student Beans', 'awin', '3-7%', 30,
 'https://www.prettylittlething.com', 48),

('Schuh student discount',
 'Schuh',
 '10% off Schuh orders for students via Student Beans.',
 '10% off Schuh.',
 'retail_fashion', '10% off', 'percentage',
 false, true, true, true,
 'Student Beans', 'Student Beans', 'awin', '4-8%', 30,
 'https://www.schuh.co.uk', 44),

('Office Shoes student discount',
 'Office Shoes',
 '10% off Office Shoes for students via Student Beans.',
 '10% off Office Shoes.',
 'retail_fashion', '10% off', 'percentage',
 false, true, true, true,
 'Student Beans', 'Student Beans', NULL, NULL, NULL,
 'https://www.office.co.uk', 42),

('The North Face student discount',
 'The North Face',
 '10% off The North Face outdoor gear for verified students via Student Beans.',
 '10% off The North Face.',
 'retail_fashion', '10% off', 'percentage',
 false, true, true, true,
 'Student Beans', 'Student Beans', 'awin', '4-8%', 30,
 'https://www.thenorthface.co.uk', 48),

('Cotswold Outdoor student discount',
 'Cotswold Outdoor',
 '15% off Cotswold Outdoor for students, with valid student ID in store or via Student Beans online.',
 '15% off outdoor gear.',
 'retail_fashion', '15% off', 'percentage',
 false, true, true, true,
 'Student Beans / in-store ID', 'Student Beans', NULL, NULL, NULL,
 'https://www.cotswoldoutdoor.com', 46),

('Topshop / Topman (ASOS) student',
 'Topshop',
 '10% off Topshop/Topman orders via UNiDAYS through the ASOS platform.',
 '10% off Topshop.',
 'retail_fashion', '10% off', 'percentage',
 false, true, true, true,
 'UNiDAYS', 'UNiDAYS', 'awin', '3-7%', 30,
 'https://www.asos.com/topshop', 40),

('Levi''s student discount',
 'Levi''s',
 '15% off Levi''s orders for students via Student Beans.',
 '15% off Levi''s.',
 'retail_fashion', '15% off', 'percentage',
 false, true, true, true,
 'Student Beans', 'Student Beans', 'awin', '4-8%', 30,
 'https://www.levi.com/GB/en_GB', 42),

('Ray-Ban student discount',
 'Ray-Ban',
 '15% off Ray-Ban for students via Student Beans and UNiDAYS.',
 '15% off Ray-Ban.',
 'retail_fashion', '15% off', 'percentage',
 false, true, true, true,
 'Student Beans / UNiDAYS', 'Student Beans / UNiDAYS', 'awin', '4-8%', 30,
 'https://www.ray-ban.com/uk', 40);

-- ============================================================================
-- HEALTH & BEAUTY (priority 35-60)
-- ============================================================================

INSERT INTO student_benefits (
  name, provider, description, short_description, category, discount_value, discount_type,
  eligibility_s1_s4, eligibility_s5_s6, eligibility_college, eligibility_university,
  access_method, access_platform, affiliate_network, affiliate_commission, affiliate_cookie_days,
  url, priority_score
) VALUES

('Boots Advantage Card + student offers',
 'Boots',
 'Earn Advantage Card points on every Boots purchase plus rotating student discounts via UNiDAYS — typically 10% off beauty and fragrance.',
 '10% off + Advantage Card points.',
 'health_beauty', '10% off + points', 'percentage',
 true, true, true, true,
 'UNiDAYS + Advantage Card', 'UNiDAYS', 'awin', '5-8%', 7,
 'https://www.boots.com/student-discount', 58),

('Superdrug Student Health & Beautycard',
 'Superdrug',
 '10% student discount in store and online plus points on every purchase with the Superdrug Health & Beautycard.',
 '10% off + Beautycard points.',
 'health_beauty', '10% off + points', 'percentage',
 true, true, true, true,
 'Health & Beautycard + student ID', 'Superdrug', 'awin', '3-6%', 30,
 'https://www.superdrug.com/student-discount', 56),

('The Body Shop student discount',
 'The Body Shop',
 '25% off The Body Shop for students via Student Beans / UNiDAYS.',
 '25% off The Body Shop.',
 'health_beauty', '25% off', 'percentage',
 false, true, true, true,
 'Student Beans / UNiDAYS', 'Student Beans / UNiDAYS', 'awin', '4-8%', 30,
 'https://www.thebodyshop.com/en-gb', 50),

('Lookfantastic student discount',
 'Lookfantastic',
 '20% off Lookfantastic beauty orders for students via Student Beans.',
 '20% off Lookfantastic.',
 'health_beauty', '20% off', 'percentage',
 false, true, true, true,
 'Student Beans', 'Student Beans', 'awin', '4-10%', 30,
 'https://www.lookfantastic.com', 48),

('Beauty Bay student discount',
 'Beauty Bay',
 '10% off Beauty Bay orders for students via Student Beans.',
 '10% off Beauty Bay.',
 'health_beauty', '10% off', 'percentage',
 false, true, true, true,
 'Student Beans', 'Student Beans', 'awin', '5-10%', 30,
 'https://www.beautybay.com', 42),

('Feelunique student discount',
 'Feelunique',
 '10-20% off Feelunique for students via Student Beans.',
 '10-20% off Feelunique.',
 'health_beauty', '10-20% off', 'percentage',
 false, true, true, true,
 'Student Beans', 'Student Beans', 'awin', '5-10%', 30,
 'https://www.feelunique.com', 40),

('Toni & Guy student discount',
 'Toni & Guy',
 'Student Cut & Finish at Toni & Guy salons — typically around 20% off with valid student ID.',
 '20% off hair cuts.',
 'health_beauty', 'Approx 20% off', 'percentage',
 false, true, true, true,
 'Show student ID in salon', 'Toni & Guy', NULL, NULL, NULL,
 'https://www.toniandguy.com', 38),

('Clinique student discount',
 'Clinique',
 '15% off Clinique orders for verified students via Student Beans.',
 '15% off Clinique.',
 'health_beauty', '15% off', 'percentage',
 false, true, true, true,
 'Student Beans', 'Student Beans', 'awin', '5-10%', 30,
 'https://www.clinique.co.uk', 40);

-- ============================================================================
-- BANKING (priority 55-75)
-- ============================================================================

INSERT INTO student_benefits (
  name, provider, description, short_description, category, discount_value, discount_type,
  eligibility_s1_s4, eligibility_s5_s6, eligibility_college, eligibility_university,
  access_method, url, priority_score
) VALUES

('Santander 1|2|3 Student Account',
 'Santander',
 'Student current account with interest-free overdraft up to GBP 1,500 in year 1 (rising over the course of study), plus a 4-year free 16-25 Railcard worth GBP 120.',
 'Interest-free overdraft + free Railcard.',
 'banking', 'GBP 1,500 overdraft + free Railcard', 'other',
 false, false, true, true,
 'Apply online with university acceptance proof', 'https://www.santander.co.uk/personal/current-accounts/123-student-account', 74),

('NatWest / RBS Student Account',
 'NatWest / RBS',
 'Student current account with interest-free overdraft up to GBP 2,000, plus regular signup incentives (cash bonus, tech perks, or subscription gifts).',
 'Up to GBP 2,000 overdraft + signup bonus.',
 'banking', 'Up to GBP 2,000 overdraft + signup bonus', 'other',
 false, false, true, true,
 'Apply online with UCAS confirmation', 'https://www.natwest.com/current-accounts/student-bank-account.html', 72),

('Bank of Scotland Student Account',
 'Bank of Scotland',
 'Student current account with interest-free planned overdraft up to GBP 1,500, contactless debit card, and mobile banking.',
 'GBP 1,500 interest-free overdraft.',
 'banking', 'GBP 1,500 interest-free overdraft', 'other',
 false, false, true, true,
 'Apply online with student status proof', 'https://www.bankofscotland.co.uk/current-accounts/student-account.html', 70),

('HSBC Student Account',
 'HSBC',
 'HSBC Student Bank Account with GBP 3,000 interest-free overdraft over three years (GBP 1,000 year 1), plus regular HSBC student offers.',
 'Up to GBP 3,000 interest-free overdraft.',
 'banking', 'Up to GBP 3,000 overdraft', 'other',
 false, false, true, true,
 'Apply online with acceptance letter', 'https://www.hsbc.co.uk/student-bank-account', 70),

('Nationwide FlexStudent',
 'Nationwide',
 'Nationwide FlexStudent account with arranged overdraft up to GBP 3,000 (staged over three years), 1% interest on in-credit balances, and no arrangement fees.',
 'Up to GBP 3,000 arranged overdraft.',
 'banking', 'Up to GBP 3,000 overdraft + 1% in-credit', 'other',
 false, false, true, true,
 'Apply online with student proof', 'https://www.nationwide.co.uk/current-accounts/flexstudent', 68),

('Lloyds Bank Student Account',
 'Lloyds',
 'Student current account with interest-free planned overdraft up to GBP 1,500 in year 1, rising in subsequent years.',
 'GBP 1,500 interest-free overdraft.',
 'banking', 'Up to GBP 1,500 overdraft', 'other',
 false, false, true, true,
 'Apply online', 'https://www.lloydsbank.com/current-accounts/all-accounts/student.html', 64);

-- ============================================================================
-- ACCOMMODATION (priority 45-70)
-- ============================================================================

INSERT INTO student_benefits (
  name, provider, description, short_description, category, discount_value, discount_type,
  eligibility_s1_s4, eligibility_s5_s6, eligibility_college, eligibility_university,
  min_age, max_age, access_method, is_scotland_only, url, priority_score
) VALUES

('Hostelling Scotland Explore Scotland',
 'Hostelling Scotland',
 'Discounted multi-night passes for exploring Scottish hostels. Combine with free youth membership for significant savings on a Highlands trip.',
 'Discounted multi-night hostel passes.',
 'accommodation', 'Reduced per-night rate', 'percentage',
 true, true, true, true,
 16, 25, 'Book via hostellingscotland.org.uk', true,
 'https://www.hostellingscotland.org.uk/about-us/explore-scotland', 54),

('Homes for Students student lets',
 'Homes for Students',
 'Purpose-built student accommodation across Scottish cities with all bills and Wi-Fi included — regular early-bird and referral discounts.',
 'Early-bird discounts on student accommodation.',
 'accommodation', 'Varies — early-bird and referral offers', 'other',
 false, false, true, true,
 NULL, NULL, 'Book via homesforstudents.co.uk', false,
 'https://www.homesforstudents.co.uk', 48),

('Unite Students offers',
 'Unite Students',
 'Purpose-built student accommodation provider with seasonal booking offers, cashback promos, and referral bonuses.',
 'Seasonal deals and referral bonuses.',
 'accommodation', 'Varies — seasonal promotions', 'other',
 false, false, true, true,
 NULL, NULL, 'Book via unitestudents.com', false,
 'https://www.unitestudents.com', 48);

-- ============================================================================
-- EDUCATION TOOLS (priority 35-60)
-- ============================================================================

INSERT INTO student_benefits (
  name, provider, description, short_description, category, discount_value, discount_type,
  eligibility_s1_s4, eligibility_s5_s6, eligibility_college, eligibility_university,
  access_method, access_platform, affiliate_network, affiliate_commission, affiliate_cookie_days,
  url, priority_score
) VALUES

('Ryman student discount',
 'Ryman',
 '10% off Ryman stationery for students via Student Beans.',
 '10% off Ryman stationery.',
 'education_tools', '10% off', 'percentage',
 true, true, true, true,
 'Student Beans', 'Student Beans', NULL, NULL, NULL,
 'https://www.ryman.co.uk', 42),

('Paperchase student discount',
 'Paperchase',
 '10-15% off Paperchase stationery and cards for students via Student Beans.',
 '10-15% off Paperchase.',
 'education_tools', '10-15% off', 'percentage',
 true, true, true, true,
 'Student Beans', 'Student Beans', NULL, NULL, NULL,
 'https://www.paperchase.com', 38),

('WHSmith student offers',
 'WHSmith',
 'Rotating student offers on stationery and textbooks via Student Beans and in-store promotions.',
 'Rotating stationery discounts.',
 'education_tools', 'Varies', 'other',
 true, true, true, true,
 'Student Beans / in-store', 'Student Beans', NULL, NULL, NULL,
 'https://www.whsmith.co.uk', 36),

('Quizlet Plus Student',
 'Quizlet',
 'Quizlet Plus (offline access, advanced study tools, no ads) at a reduced student rate via Student Beans.',
 'Discounted Quizlet Plus.',
 'education_tools', 'Approx 20% off', 'subscription',
 true, true, true, true,
 'Student Beans', 'Student Beans', NULL, NULL, NULL,
 'https://quizlet.com/en-gb/upgrade', 50),

('Perlego student subscription',
 'Perlego',
 'Unlimited academic textbooks on Perlego at a student discount via Student Beans and UNiDAYS — around 50% off the standard monthly price.',
 'Approx 50% off Perlego subscription.',
 'education_tools', 'Approx 50% off', 'subscription',
 false, true, true, true,
 'Student Beans / UNiDAYS', 'Student Beans / UNiDAYS', 'awin', '10-20%', 30,
 'https://www.perlego.com', 58),

('Chegg student plan',
 'Chegg',
 'Chegg Study homework help service with rotating student offers via UNiDAYS and Student Beans.',
 'Discounted Chegg Study.',
 'education_tools', 'Rotating discounts', 'subscription',
 false, true, true, true,
 'UNiDAYS / Student Beans', 'UNiDAYS / Student Beans', NULL, NULL, NULL,
 'https://www.chegg.com', 44),

('TOTUM student card',
 'NUS / TOTUM',
 'Paid student discount card replacing the old NUS Extra. Unlocks hundreds of exclusive discounts across food, retail, travel, and lifestyle. Around GBP 14.99/year.',
 'Hundreds of exclusive discounts (GBP 14.99/yr).',
 'education_tools', 'Approx GBP 15/year — hundreds of discounts', 'subscription',
 false, true, true, true,
 'Buy at totum.com', 'TOTUM', NULL, NULL, NULL,
 'https://www.totum.com', 60),

('UNiDAYS',
 'UNiDAYS',
 'Free student discount platform with hundreds of verified brand partners. Verify once with your school/university email and unlock codes for fashion, tech, food, travel, and beauty.',
 'Free — hundreds of verified student discounts.',
 'education_tools', 'Free platform', 'free',
 false, true, true, true,
 'Sign up at myunidays.com', 'UNiDAYS', NULL, NULL, NULL,
 'https://www.myunidays.com', 70),

('Student Beans',
 'Student Beans',
 'Free student discount platform with thousands of student offers across food, fashion, tech, and services. Free to join and verify with student status.',
 'Free — thousands of verified student offers.',
 'education_tools', 'Free platform', 'free',
 true, true, true, true,
 'Sign up at studentbeans.com', 'Student Beans', NULL, NULL, NULL,
 'https://www.studentbeans.com', 70);
