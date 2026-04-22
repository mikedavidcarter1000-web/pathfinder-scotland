-- Round 1 careers expansion: Social Work & Community (+5 roles) -- ROUND 1 COMPLETE
-- Source research: docs/research/round1/social-work-community.md
-- Salary source: ONS ASHE 2025 (scripts/ashe/ashe-2025-scotland.json, ashe-2025-uk.json)
-- Sector ID: 79a0b9b2-5a56-487f-91d9-f0f34c65103d (Social Work & Community)

-- Criminal Justice Social Worker -- SOC 2461 (Social workers)
-- Scotland p50 = 44428; UK p25 = 35841, p50 = 42708, p75 = 48907
INSERT INTO public.career_roles (
  career_sector_id, title, ai_rating, ai_description,
  is_new_ai_role, growth_outlook,
  soc_code_2020, salary_entry, salary_experienced,
  salary_median_scotland, salary_entry_uk, salary_median_uk, salary_experienced_uk,
  salary_source, salary_last_updated, salary_needs_verification, salary_notes
) VALUES (
  '79a0b9b2-5a56-487f-91d9-f0f34c65103d',
  'Criminal Justice Social Worker',
  2,
  'Criminal Justice Social Workers are Scotland''s equivalent of probation officers in England and Wales -- Scotland routes all supervision of offenders through local authority social work departments rather than a standalone probation service, so postholders sit within council social work teams preparing court reports, supervising Community Payback Orders, and supporting people leaving custody. Entry is via a qualifying social work degree (BA Hons or two-year MSc) from a Scottish university such as Strathclyde, Edinburgh, Glasgow Caledonian, Robert Gordon, Stirling, Dundee, West of Scotland or Open University in Scotland, followed by registration with the Scottish Social Services Council (SSSC). Most postholders complete additional post-qualifying study in criminal justice social work and operate within the Community Justice Scotland framework, with shortage of qualified workers driving demand across all 32 council areas.',
  false,
  'Growing',
  '2461',
  36000,
  49000,
  44500,
  36000,
  42500,
  49000,
  'ONS ASHE 2025 (Scotland median + UK percentiles)',
  CURRENT_DATE,
  true,
  'Social work and community care pay in Scotland follows negotiated pay scales. Regulated social work (SSSC-registered) typically follows local authority pay scales aligned to Agenda for Change Band 6 (approximately GBP 37k entry, GBP 48k experienced) or Scottish Joint Council bands for council employees. Third-sector employers (Barnardo''s, Aberlour, Quarriers) pay scales vary; often below local authority for support work. Verify against SSSC guidance, COSLA pay circulars, or sector-specific salary surveys before pilot. SOC 2461 (Social workers) covers all qualified social work roles without specialism distinction -- generic Social Worker, Criminal Justice Social Worker, Child Protection Social Worker, Fostering Social Worker all share this SOC. ASHE median is a pooled figure; actual pay varies by local authority and specialism.'
);

-- Child Protection Social Worker -- SOC 2461 (Social workers)
INSERT INTO public.career_roles (
  career_sector_id, title, ai_rating, ai_description,
  is_new_ai_role, growth_outlook,
  soc_code_2020, salary_entry, salary_experienced,
  salary_median_scotland, salary_entry_uk, salary_median_uk, salary_experienced_uk,
  salary_source, salary_last_updated, salary_needs_verification, salary_notes
) VALUES (
  '79a0b9b2-5a56-487f-91d9-f0f34c65103d',
  'Child Protection Social Worker',
  2,
  'Child Protection Social Workers safeguard children at risk of harm by carrying out home visits, leading multi-agency case conferences and child protection investigations, and arranging foster placements or kinship care when families cannot keep children safe. The route is a four-year qualifying social work degree (BA Hons) or two-year MSc from a Scottish university (Strathclyde, Edinburgh, Glasgow Caledonian, Robert Gordon, Stirling, Dundee, West of Scotland or Open University in Scotland), followed by registration with the Scottish Social Services Council (SSSC) and a supported first year in practice. Most posts sit within local authority children and families teams, with charities including Children 1st, Aberlour and Barnardo''s Scotland providing complementary support; chronic shortage of qualified workers means strong demand across all 32 Scottish council areas.',
  false,
  'Growing',
  '2461',
  36000,
  49000,
  44500,
  36000,
  42500,
  49000,
  'ONS ASHE 2025 (Scotland median + UK percentiles)',
  CURRENT_DATE,
  true,
  'Social work and community care pay in Scotland follows negotiated pay scales. Regulated social work (SSSC-registered) typically follows local authority pay scales aligned to Agenda for Change Band 6 (approximately GBP 37k entry, GBP 48k experienced) or Scottish Joint Council bands for council employees. Third-sector employers (Barnardo''s, Aberlour, Quarriers) pay scales vary; often below local authority for support work. Verify against SSSC guidance, COSLA pay circulars, or sector-specific salary surveys before pilot. SOC 2461 (Social workers) covers all qualified social work roles without specialism distinction -- generic Social Worker, Criminal Justice Social Worker, Child Protection Social Worker, Fostering Social Worker all share this SOC. ASHE median is a pooled figure; actual pay varies by local authority and specialism.'
);

-- Counsellor -- SOC 3224 (Counsellors)
-- Scotland all suppressed; UK p25 = 18448, p50 = 27082, p75 = 31356
INSERT INTO public.career_roles (
  career_sector_id, title, ai_rating, ai_description,
  is_new_ai_role, growth_outlook,
  soc_code_2020, salary_entry, salary_experienced,
  salary_median_scotland, salary_entry_uk, salary_median_uk, salary_experienced_uk,
  salary_source, salary_last_updated, salary_needs_verification, salary_notes
) VALUES (
  '79a0b9b2-5a56-487f-91d9-f0f34c65103d',
  'Counsellor',
  2,
  'Counsellors provide one-to-one talking therapy to help people work through anxiety, depression, bereavement, relationship breakdown, trauma or other emotional difficulties in a confidential setting, typically through weekly sessions over several months. The standard Scottish route is a COSCA Counselling Skills certificate, followed by a diploma or degree in counselling or psychotherapy and accreditation with the British Association for Counselling and Psychotherapy (BACP) or Counselling and Psychotherapy in Scotland (COSCA). Counsellors work across NHS Scotland talking therapy services, school and university wellbeing teams, third-sector organisations such as the Scottish Association for Mental Health (SAMH), Cruse Bereavement Care Scotland and Relationships Scotland, and private practice; many combine employed and self-employed work.',
  false,
  'Growing',
  '3224',
  18500,
  31500,
  NULL,
  18500,
  27000,
  31500,
  'ONS ASHE 2025 (UK percentiles only)',
  CURRENT_DATE,
  true,
  'Social work and community care pay in Scotland follows negotiated pay scales. Most counsellors work in multiple settings with mixed employed/self-employed arrangements. BACP-accredited registered counsellors in NHS Scotland roles sit on Agenda for Change Band 6-7 (approximately GBP 37k-46k); private practice rates vary widely (GBP 40-90 per hour). ASHE figures capture PAYE-employed counsellors only and understate total earnings. Verify against BACP salary survey before pilot. Scotland p25, p50 and p75 all suppressed -- UK percentiles used throughout. SOC 3224 (Counsellors) pools generalist and specialist counselling practitioners. ASHE median does not distinguish BACP-registered from non-registered counsellors, or between Addiction Counsellor (existing), generalist Counsellor, Bereavement Counsellor or other specialisms.'
);

-- Housing Officer -- SOC 3223 (Housing officers)
-- Scotland p50 = 34866; UK p25 = 25873, p50 = 32542, p75 = 37821
INSERT INTO public.career_roles (
  career_sector_id, title, ai_rating, ai_description,
  is_new_ai_role, growth_outlook,
  soc_code_2020, salary_entry, salary_experienced,
  salary_median_scotland, salary_entry_uk, salary_median_uk, salary_experienced_uk,
  salary_source, salary_last_updated, salary_needs_verification, salary_notes
) VALUES (
  '79a0b9b2-5a56-487f-91d9-f0f34c65103d',
  'Housing Officer',
  3,
  'Housing Officers manage tenancies for council and housing association tenants -- letting empty properties, dealing with rent arrears, responding to antisocial behaviour complaints, supporting tenants at risk of eviction, and inspecting homes for repairs and safety. Entry is accessible without a degree: many start through a housing apprenticeship or SVQ in Housing Practice, then progress via Chartered Institute of Housing (CIH) Scotland qualifications such as the Level 4 Certificate or Level 5 Diploma in Housing Practice. Major Scottish employers include Wheatley Group (the largest social landlord in Scotland with around 90,000 homes), all 32 local authorities, and the 100+ Registered Social Landlords represented by the Scottish Federation of Housing Associations, making this one of the most accessible routes into a stable professional career for school leavers.',
  false,
  'Stable',
  '3223',
  26000,
  38000,
  35000,
  26000,
  32500,
  38000,
  'ONS ASHE 2025 (Scotland median + UK percentiles)',
  CURRENT_DATE,
  true,
  'Social work and community care pay in Scotland follows negotiated pay scales. Housing Officer pay in Scotland varies by employer type: local authority housing (aligned to Scottish Joint Council bands, approximately GBP 30k entry); Registered Social Landlords / housing associations (Wheatley Group, Scottish Federation of Housing Associations member rates); private housing management. Verify via employer-specific published pay scales (Wheatley Group, Link Group, Hillcrest Homes, Sanctuary Scotland) before pilot. SOC 3223 (Housing officers) is a dedicated unit group with no shared-pooling caveat.'
);

-- Advice Worker / Welfare Rights Officer -- SOC 3229 (Welfare and housing associate professionals n.e.c.)
-- Scotland p50 = 28667; UK p25 = 19304, p50 = 26640, p75 = 32866
INSERT INTO public.career_roles (
  career_sector_id, title, ai_rating, ai_description,
  is_new_ai_role, growth_outlook,
  soc_code_2020, salary_entry, salary_experienced,
  salary_median_scotland, salary_entry_uk, salary_median_uk, salary_experienced_uk,
  salary_source, salary_last_updated, salary_needs_verification, salary_notes
) VALUES (
  '79a0b9b2-5a56-487f-91d9-f0f34c65103d',
  'Advice Worker / Welfare Rights Officer',
  3,
  'Advice Workers help people understand and claim the social security benefits they are entitled to, challenge wrong decisions through tribunal appeals, and resolve debt, housing and consumer problems through detailed case work. Entry does not require a degree -- most start as volunteers with Citizens Advice Scotland or a local Citizens Advice Bureau and complete the Adviser Training Programme, with senior roles often holding a Level 4 Certificate in Welfare Benefits or specialist case work accreditation. Welfare rights teams sit within Citizens Advice Scotland''s network of 59 bureaux, council welfare rights units, the Money Advice Trust, and specialist charities; demand has grown sharply alongside the rollout of Scottish Government devolved benefits delivered by Social Security Scotland.',
  false,
  'Growing',
  '3229',
  19500,
  33000,
  28500,
  19500,
  26500,
  33000,
  'ONS ASHE 2025 (Scotland median + UK percentiles)',
  CURRENT_DATE,
  true,
  'Social work and community care pay in Scotland follows negotiated pay scales. Advice Worker pay in Scotland varies by employer: local authority welfare rights units (Scottish Joint Council bands); Citizens Advice Scotland bureaux (third-sector grades, often below LA equivalent); specialist debt and benefits charities. Many roles funded via Scottish Government Welfare Advice and Health Partnerships grants -- pay can be time-limited to grant cycles. Verify against employer-specific pay scales and Citizens Advice Scotland workforce data before pilot. SOC 3229 (Welfare and housing associate professionals n.e.c.) is a catch-all spanning multiple support worker specialisms. ASHE median pools across Family Support Worker, Homelessness Support Worker, Mental Health Support Worker, Digital Inclusion Worker (all existing) and Advice Worker; actual pay varies by employer (local authority vs third sector) and specialism.'
);
