-- Add 4 missing bursaries from original spec
-- Teaching Bursary, Cross Trust, Snowdon Trust, Winning Students 100

-- 4.1 Teaching Bursary in Scotland
INSERT INTO public.bursaries (
  name, slug, administering_body, description, student_stages, award_type,
  amount_description, amount_min, amount_max, amount_frequency,
  is_means_tested, is_repayable, min_age,
  specific_courses, requires_scottish_residency,
  application_process, application_deadline, url, notes,
  is_active, last_verified_date, academic_year,
  priority_score, is_government_scheme, needs_verification
) VALUES (
  'Teaching Bursary in Scotland',
  'teaching-bursary-scotland',
  'Skills Development Scotland (SDS) on behalf of Scottish Government',
  'Tax-free bursary of approximately GBP 15,000 for career changers on the 1-year PGDE (Professional Graduate Diploma in Education). Training must be in a priority subject: Chemistry, Computing Science, Home Economics, Mathematics, Physics, Technological Education, Modern Languages, or Gaelic. Paid in 10 monthly instalments from September to June. Over and above any SAAS student support.',
  ARRAY['PGDE'],
  'bursary',
  'GBP 15,000 tax-free (verify current amount)',
  15000, 20000, 'total_package',
  false, false, null,
  ARRAY['Chemistry', 'Computing Science', 'Home Economics', 'Mathematics', 'Physics', 'Technological Education', 'Modern Languages', 'Gaelic'],
  true,
  'Apply via https://teachingbursaryinscotland.co.uk/ after accepting PGDE offer. Typically opens around March. Outcome within 20 working days.',
  'Opens approximately March each year',
  'https://teachingbursaryinscotland.co.uk/',
  'Career changers only: must have been in paid employment (or receiving Carer''s Allowance) for at least 36 months out of the last 84 months. Must hold 2:1 degree or equivalent. Must NOT have been in full-time education recently. DISCREPANCY: teachinscotland.scot states GBP 15,000; Scottish Government EQIA states GBP 20,000 -- verify current amount before platform launch. Separate Preference Waiver Payment (up to GBP 8,000) available for graduates willing to complete Teacher Induction anywhere in Scotland.',
  true, CURRENT_DATE, '2025-26',
  85, true, true
);

-- 4.2 Cross Trust
INSERT INTO public.bursaries (
  name, slug, administering_body, description, student_stages, award_type,
  amount_description, amount_frequency,
  is_means_tested, is_repayable, max_age,
  requires_scottish_residency,
  application_process, url, notes,
  is_active, last_verified_date, academic_year,
  priority_score, is_charitable_trust
) VALUES (
  'Cross Trust',
  'cross-trust',
  'The Cross Trust',
  'Variable grants for university, college, and educational opportunities including arts, music, visual and performing arts. Requires demonstrated financial need and high academic merit. Applicants must be under 30, with Scottish birth or parentage.',
  ARRAY['FE', 'undergraduate', 'postgraduate'],
  'grant',
  'Variable (not published)',
  'variable',
  true, false, 29,
  true,
  'Via application form on Cross Trust website.',
  'https://www.crosstrust.org.uk',
  'One of the most widely cited Scottish charitable trusts for students. Covers arts, visual and performing arts, music as well as academic study. Scottish birth or parentage required.',
  true, CURRENT_DATE, '2025-26',
  60, true
);

-- 4.3 Snowdon Trust
INSERT INTO public.bursaries (
  name, slug, administering_body, description, student_stages, award_type,
  amount_description, amount_min, amount_max, amount_frequency,
  is_means_tested, is_repayable,
  requires_disability, requires_scottish_residency,
  url, notes,
  is_active, last_verified_date, academic_year,
  priority_score, is_charitable_trust
) VALUES (
  'Snowdon Trust',
  'snowdon-trust',
  'Snowdon Trust',
  'Grants of up to GBP 3,000 for students with disabilities. Specifically targets disability-related costs that the Disabled Students'' Allowance (DSA) does not cover.',
  ARRAY['undergraduate', 'postgraduate'],
  'grant',
  'Up to GBP 3,000',
  500, 3000, 'variable',
  false, false,
  true, false,
  'https://www.snowdontrust.org',
  'Complements DSA by covering disability-related costs DSA does not fund. Check snowdontrust.org for current application windows.',
  true, CURRENT_DATE, '2025-26',
  70, true
);

-- 4.4 Winning Students 100
INSERT INTO public.bursaries (
  name, slug, administering_body, description, student_stages, award_type,
  amount_description, amount_frequency,
  is_means_tested, is_repayable, min_age,
  requires_scottish_residency,
  application_process, application_deadline, url, notes,
  is_active, last_verified_date, academic_year,
  priority_score, is_competitive
) VALUES (
  'Winning Students 100',
  'winning-students-100',
  'University of Stirling (funded by sportscotland, SFC, and Scottish HE/FE sector)',
  'Scholarship covering accommodation, competition fees, equipment, and support services for elite student athletes. Open to British passport holders aged 16+ studying 60+ credits at a Scottish college or university, competing in Olympic, Paralympic, or Commonwealth sports at national level or above. Dedicated hardship fund for students from higher-deprivation areas.',
  ARRAY['FE', 'undergraduate', 'postgraduate'],
  'bursary',
  'Variable (covers accommodation, fees, equipment, support)',
  'variable',
  false, false, 16,
  false,
  'Online portal. Application window: 1 August to 19 September. Outcomes end of October.',
  '19 September annually',
  'https://www.winningstudents-scotland.ac.uk/the-scholarship/',
  'British passport holders only. Must be in Olympic, Paralympic, or Commonwealth sport at national level or above. 106 athletes supported in 2025-26 across 31 sports and 18 institutions. Over 1,700 supported since 2008.',
  true, CURRENT_DATE, '2025-26',
  65, true
);
