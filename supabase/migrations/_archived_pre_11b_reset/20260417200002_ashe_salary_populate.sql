-- ============================================
-- ASHE 2025 salary population for career_roles
-- Migration: 20260417200002
--
-- Source: ONS ASHE 2025 (Provisional)
--   Table 14: UK-wide p25/p50/p75 by SOC 2020 (4-digit)
--   Table 15: Scotland p50 by SOC 2020 (4-digit)
--
-- Scotland Table 15 only publishes medians (p50).
-- p25/p75 percentiles are universally suppressed in the
-- regional dataset due to sample-size constraints.
-- Therefore: salary_entry uses UK p25, salary_experienced uses UK p75,
-- and salary_median_scotland stores Scotland p50 where available.
--
-- Rounding: all GBP values rounded to nearest £500, floor £12,000.
-- ============================================

BEGIN;

-- Agricultural Data Analyst (SOC 3544, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '3544',
  salary_entry = '£30,000',
  salary_experienced = '£46,000',
  salary_median_scotland = NULL,
  salary_entry_uk = 30000,
  salary_median_uk = 38000,
  salary_experienced_uk = 46000,
  salary_source = 'ONS ASHE 2025 (UK fallback — Scotland data suppressed)',
  salary_needs_verification = true,
  salary_notes = 'Scotland-specific figures suppressed in ASHE 2025; UK figures used. Review against SDS Labour Market Insights before pilot.',
  salary_last_updated = CURRENT_DATE
WHERE id = '8b40301a-6a7d-40c4-8d6c-0a80767f73dc';

-- Agricultural Technician (SOC 3119, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '3119',
  salary_entry = '£27,000',
  salary_experienced = '£45,000',
  salary_median_scotland = 36000,
  salary_entry_uk = 27000,
  salary_median_uk = 34500,
  salary_experienced_uk = 45000,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14.',
  salary_last_updated = CURRENT_DATE
WHERE id = '3b8f49bf-8cc8-49e9-9ec9-0d2bb97a6dd5';

-- Carbon Footprint / Sustainability Officer (SOC 2152, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '2152',
  salary_entry = '£32,500',
  salary_experienced = '£50,500',
  salary_median_scotland = 45500,
  salary_entry_uk = 32500,
  salary_median_uk = 41500,
  salary_experienced_uk = 50500,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14. Scotland median pay for this role is competitive with or above the UK average (approx. +10%), likely driven by sector demand.',
  salary_last_updated = CURRENT_DATE
WHERE id = '6c2842c1-bc82-4a8d-b16b-1f3b8f0abc9d';

-- Drone Operator / Pilot (SOC 3417, confidence: low)
UPDATE public.career_roles SET
  soc_code_2020 = '3417',
  salary_entry = '£24,000',
  salary_experienced = '£36,000',
  salary_median_scotland = 30000,
  salary_entry_uk = 24000,
  salary_median_uk = 30500,
  salary_experienced_uk = 36000,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = true,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14. SOC mapping confidence: low. Verify SOC 3417 is appropriate for this role.',
  salary_last_updated = CURRENT_DATE
WHERE id = 'bba8a4f1-49a8-4955-889d-87ab1a53df68';

-- Ecologist (SOC 2112, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '2112',
  salary_entry = '£29,000',
  salary_median_scotland = NULL,
  salary_entry_uk = 29000,
  salary_median_uk = 44000,
  salary_experienced_uk = NULL,
  salary_source = 'ONS ASHE 2025 (UK — partial data)',
  salary_needs_verification = true,
  salary_notes = 'Only partial ASHE data available for this SOC code. Some salary percentiles suppressed due to sample size. Manual review recommended.',
  salary_last_updated = CURRENT_DATE
WHERE id = '4a4b4ef7-175b-4e21-96ef-41ea7a8d00f9';

-- Environmental Consultant (SOC 2152, confidence: high)
UPDATE public.career_roles SET
  soc_code_2020 = '2152',
  salary_entry = '£32,500',
  salary_experienced = '£50,500',
  salary_median_scotland = 45500,
  salary_entry_uk = 32500,
  salary_median_uk = 41500,
  salary_experienced_uk = 50500,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14. Scotland median pay for this role is competitive with or above the UK average (approx. +10%), likely driven by sector demand.',
  salary_last_updated = CURRENT_DATE
WHERE id = '012bf8eb-9ad3-447f-a2ed-fa80410a8144';

-- Environmental Data Scientist (SOC 2119, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '2119',
  salary_entry = '£32,000',
  salary_experienced = '£53,000',
  salary_median_scotland = 36000,
  salary_entry_uk = 32000,
  salary_median_uk = 41500,
  salary_experienced_uk = 53000,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14. Scotland median pay for this role is typically 13% below the UK average. London-based roles may pay significantly more.',
  salary_last_updated = CURRENT_DATE
WHERE id = '9dc2aa41-a166-48b4-a320-5017ce56e0a9';

-- Farm Worker (SOC 9111, confidence: high)
UPDATE public.career_roles SET
  soc_code_2020 = '9111',
  salary_needs_verification = true,
  salary_notes = 'No ASHE 2025 data available for SOC 9111 (Farm workers). Existing salary estimates retained. Manual review required.',
  salary_last_updated = CURRENT_DATE
WHERE id = '74439d0b-f149-416f-a468-7b5f0ae75e93';

-- Forestry Worker (SOC 9112, confidence: high)
UPDATE public.career_roles SET
  soc_code_2020 = '9112',
  salary_needs_verification = true,
  salary_notes = 'No ASHE 2025 data available for SOC 9112 (Forestry and related workers). Existing salary estimates retained. Manual review required.',
  salary_last_updated = CURRENT_DATE
WHERE id = '8b633fed-abf8-4e1e-b626-9a899b70fa53';

-- Landscape Manager (SOC 1211, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '1211',
  salary_entry = '£28,000',
  salary_median_scotland = NULL,
  salary_entry_uk = 28000,
  salary_median_uk = 35000,
  salary_experienced_uk = NULL,
  salary_source = 'ONS ASHE 2025 (UK — partial data)',
  salary_needs_verification = true,
  salary_notes = 'Only partial ASHE data available for this SOC code. Some salary percentiles suppressed due to sample size. Manual review recommended.',
  salary_last_updated = CURRENT_DATE
WHERE id = 'c603fa51-acf7-48ff-b238-0f8a3b773047';

-- Peatland Restoration Specialist (SOC 2151, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '2151',
  salary_entry = '£32,500',
  salary_median_scotland = 33000,
  salary_entry_uk = 32500,
  salary_median_uk = 38000,
  salary_experienced_uk = NULL,
  salary_source = 'ONS ASHE 2025 (UK — partial data)',
  salary_needs_verification = true,
  salary_notes = 'Only partial ASHE data available for this SOC code. Some salary percentiles suppressed due to sample size. Manual review recommended.',
  salary_last_updated = CURRENT_DATE
WHERE id = '312251af-9352-4387-8735-f3ee4e4056d2';

-- Precision Agriculture Technologist (SOC 3119, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '3119',
  salary_entry = '£27,000',
  salary_experienced = '£45,000',
  salary_median_scotland = 36000,
  salary_entry_uk = 27000,
  salary_median_uk = 34500,
  salary_experienced_uk = 45000,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14.',
  salary_last_updated = CURRENT_DATE
WHERE id = '85e18b40-d479-4c72-bc8f-9563f51c8525';

-- Accountant (Qualified) (SOC 2421, confidence: high)
UPDATE public.career_roles SET
  soc_code_2020 = '2421',
  salary_entry = '£34,000',
  salary_experienced = '£64,000',
  salary_median_scotland = NULL,
  salary_entry_uk = 34000,
  salary_median_uk = 45500,
  salary_experienced_uk = 64000,
  salary_source = 'ONS ASHE 2025 (UK fallback — Scotland data suppressed)',
  salary_needs_verification = true,
  salary_notes = 'Scotland-specific figures suppressed in ASHE 2025; UK figures used. Review against SDS Labour Market Insights before pilot.',
  salary_last_updated = CURRENT_DATE
WHERE id = '971cf3d5-897a-4f0f-b3f0-a57f727dc9a2';

-- Actuary (SOC 2433, confidence: high)
UPDATE public.career_roles SET
  soc_code_2020 = '2433',
  salary_entry = '£41,500',
  salary_experienced = '£73,500',
  salary_median_scotland = NULL,
  salary_entry_uk = 41500,
  salary_median_uk = 51500,
  salary_experienced_uk = 73500,
  salary_source = 'ONS ASHE 2025 (UK fallback — Scotland data suppressed)',
  salary_needs_verification = true,
  salary_notes = 'Scotland-specific figures suppressed in ASHE 2025; UK figures used. Review against SDS Labour Market Insights before pilot.',
  salary_last_updated = CURRENT_DATE
WHERE id = 'a3d291d3-b81a-4a4a-a85e-bbc82d58b307';

-- AI-Savvy Financial Analyst (SOC 2422, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '2422',
  salary_entry = '£33,500',
  salary_experienced = '£68,000',
  salary_median_scotland = 51500,
  salary_entry_uk = 33500,
  salary_median_uk = 48000,
  salary_experienced_uk = 68000,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14. Scotland median pay for this role is competitive with or above the UK average (approx. +7%), likely driven by sector demand.',
  salary_last_updated = CURRENT_DATE
WHERE id = 'bdbf0553-f38e-442e-99d6-976fd45eae4a';

-- Bank Clerk / Cashier (SOC 4123, confidence: high)
UPDATE public.career_roles SET
  soc_code_2020 = '4123',
  salary_entry = '£22,500',
  salary_experienced = '£33,500',
  salary_median_scotland = 27000,
  salary_entry_uk = 22500,
  salary_median_uk = 27500,
  salary_experienced_uk = 33500,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14.',
  salary_last_updated = CURRENT_DATE
WHERE id = '22bcd24e-2e89-4ee1-b399-0d7e32b58c0a';

-- Bookkeeper / Payroll Clerk (SOC 4122, confidence: high)
UPDATE public.career_roles SET
  soc_code_2020 = '4122',
  salary_entry = '£19,000',
  salary_experienced = '£35,500',
  salary_median_scotland = 27500,
  salary_entry_uk = 19000,
  salary_median_uk = 27500,
  salary_experienced_uk = 35500,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14.',
  salary_last_updated = CURRENT_DATE
WHERE id = 'fe89b76d-485e-48cc-b39c-eedf04d5b53b';

-- Data Governance Manager (Finance) (SOC 2132, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '2132',
  salary_entry = '£43,000',
  salary_experienced = '£73,000',
  salary_median_scotland = 52000,
  salary_entry_uk = 43000,
  salary_median_uk = 55500,
  salary_experienced_uk = 73000,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14.',
  salary_last_updated = CURRENT_DATE
WHERE id = 'e4da1ee0-150e-4d6f-a240-47f6d5df4642';

-- Financial Adviser (SOC 2422, confidence: high)
UPDATE public.career_roles SET
  soc_code_2020 = '2422',
  salary_entry = '£33,500',
  salary_experienced = '£68,000',
  salary_median_scotland = 51500,
  salary_entry_uk = 33500,
  salary_median_uk = 48000,
  salary_experienced_uk = 68000,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14. Scotland median pay for this role is competitive with or above the UK average (approx. +7%), likely driven by sector demand.',
  salary_last_updated = CURRENT_DATE
WHERE id = '123cefb1-e7bb-4976-bd9a-a067bbf687ed';

-- Financial AI Compliance Specialist (SOC 2482, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '2482',
  salary_entry = '£36,500',
  salary_experienced = '£64,500',
  salary_median_scotland = 49500,
  salary_entry_uk = 36500,
  salary_median_uk = 48000,
  salary_experienced_uk = 64500,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14.',
  salary_last_updated = CURRENT_DATE
WHERE id = 'dea139d4-1971-46de-ad8f-ed9953f09dd0';

-- FinTech Product Manager (SOC 2131, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '2131',
  salary_entry = '£40,000',
  salary_experienced = '£74,500',
  salary_median_scotland = 45500,
  salary_entry_uk = 40000,
  salary_median_uk = 58000,
  salary_experienced_uk = 74500,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14. Scotland median pay for this role is typically 22% below the UK average. London-based roles may pay significantly more.',
  salary_last_updated = CURRENT_DATE
WHERE id = '07dae8b6-135f-49b9-ac6b-555a0f6105ca';

-- Forensic AI Auditor (SOC 2421, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '2421',
  salary_entry = '£34,000',
  salary_experienced = '£64,000',
  salary_median_scotland = NULL,
  salary_entry_uk = 34000,
  salary_median_uk = 45500,
  salary_experienced_uk = 64000,
  salary_source = 'ONS ASHE 2025 (UK fallback — Scotland data suppressed)',
  salary_needs_verification = true,
  salary_notes = 'Scotland-specific figures suppressed in ASHE 2025; UK figures used. Review against SDS Labour Market Insights before pilot.',
  salary_last_updated = CURRENT_DATE
WHERE id = '2143d3e6-d9b6-4fc3-856f-053cabeb98c0';

-- Insurance Underwriter (SOC 3532, confidence: high)
UPDATE public.career_roles SET
  soc_code_2020 = '3532',
  salary_entry = '£30,000',
  salary_median_scotland = NULL,
  salary_entry_uk = 30000,
  salary_median_uk = 38500,
  salary_experienced_uk = NULL,
  salary_source = 'ONS ASHE 2025 (UK — partial data)',
  salary_needs_verification = true,
  salary_notes = 'Only partial ASHE data available for this SOC code. Some salary percentiles suppressed due to sample size. Manual review recommended.',
  salary_last_updated = CURRENT_DATE
WHERE id = 'ed847716-3319-4e2c-9e65-21730dba64e6';

-- AI / ML Engineer (SOC 2134, confidence: high)
UPDATE public.career_roles SET
  soc_code_2020 = '2134',
  salary_entry = '£41,000',
  salary_experienced = '£75,000',
  salary_median_scotland = 47500,
  salary_entry_uk = 41000,
  salary_median_uk = 55500,
  salary_experienced_uk = 75000,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14. Scotland median pay for this role is typically 14% below the UK average. London-based roles may pay significantly more.',
  salary_last_updated = CURRENT_DATE
WHERE id = 'f10b9ef7-25fa-43c1-8856-a1e561414f3c';

-- AI Ethics Officer (SOC 2139, confidence: low)
UPDATE public.career_roles SET
  soc_code_2020 = '2139',
  salary_entry = '£36,000',
  salary_experienced = '£69,000',
  salary_median_scotland = 40500,
  salary_entry_uk = 36000,
  salary_median_uk = 50500,
  salary_experienced_uk = 69000,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = true,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14. Scotland median pay for this role is typically 20% below the UK average. London-based roles may pay significantly more. SOC mapping confidence: low. Verify SOC 2139 is appropriate for this role.',
  salary_last_updated = CURRENT_DATE
WHERE id = 'fdb3f491-eea7-40a7-940b-51f3d31dc630';

-- AI Operations Engineer (SOC 2134, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '2134',
  salary_entry = '£41,000',
  salary_experienced = '£75,000',
  salary_median_scotland = 47500,
  salary_entry_uk = 41000,
  salary_median_uk = 55500,
  salary_experienced_uk = 75000,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14. Scotland median pay for this role is typically 14% below the UK average. London-based roles may pay significantly more.',
  salary_last_updated = CURRENT_DATE
WHERE id = '40596b52-34b2-46d3-b7b1-2392ddd0d332';

-- AI Product Manager (SOC 2131, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '2131',
  salary_entry = '£40,000',
  salary_experienced = '£74,500',
  salary_median_scotland = 45500,
  salary_entry_uk = 40000,
  salary_median_uk = 58000,
  salary_experienced_uk = 74500,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14. Scotland median pay for this role is typically 22% below the UK average. London-based roles may pay significantly more.',
  salary_last_updated = CURRENT_DATE
WHERE id = '73d91733-bd76-481a-b5aa-896d67a5f8da';

-- AI Safety Researcher (SOC 2162, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '2162',
  salary_entry = '£38,000',
  salary_median_scotland = 39500,
  salary_entry_uk = 38000,
  salary_median_uk = 42500,
  salary_experienced_uk = NULL,
  salary_source = 'ONS ASHE 2025 (UK — partial data)',
  salary_needs_verification = true,
  salary_notes = 'Only partial ASHE data available for this SOC code. Some salary percentiles suppressed due to sample size. Manual review recommended.',
  salary_last_updated = CURRENT_DATE
WHERE id = '8c8f11e0-4c79-43fb-9db6-2fa9a1233104';

-- AI Solutions Engineer (SOC 2134, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '2134',
  salary_entry = '£41,000',
  salary_experienced = '£75,000',
  salary_median_scotland = 47500,
  salary_entry_uk = 41000,
  salary_median_uk = 55500,
  salary_experienced_uk = 75000,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14. Scotland median pay for this role is typically 14% below the UK average. London-based roles may pay significantly more.',
  salary_last_updated = CURRENT_DATE
WHERE id = 'abf51422-7453-4f62-822e-6c07c0ef5bdf';

-- Cybersecurity Analyst (SOC 2135, confidence: high)
UPDATE public.career_roles SET
  soc_code_2020 = '2135',
  salary_entry = '£42,500',
  salary_experienced = '£73,000',
  salary_median_scotland = 52000,
  salary_entry_uk = 42500,
  salary_median_uk = 55000,
  salary_experienced_uk = 73000,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14.',
  salary_last_updated = CURRENT_DATE
WHERE id = 'b2fc4471-54c4-4a83-9414-2f8274c67e5d';

-- Data Analyst (SOC 3544, confidence: high)
UPDATE public.career_roles SET
  soc_code_2020 = '3544',
  salary_entry = '£30,000',
  salary_experienced = '£46,000',
  salary_median_scotland = NULL,
  salary_entry_uk = 30000,
  salary_median_uk = 38000,
  salary_experienced_uk = 46000,
  salary_source = 'ONS ASHE 2025 (UK fallback — Scotland data suppressed)',
  salary_needs_verification = true,
  salary_notes = 'Scotland-specific figures suppressed in ASHE 2025; UK figures used. Review against SDS Labour Market Insights before pilot.',
  salary_last_updated = CURRENT_DATE
WHERE id = '6340712e-e374-401a-85a1-7dec813f1e8f';

-- Data Engineer (SOC 2134, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '2134',
  salary_entry = '£41,000',
  salary_experienced = '£75,000',
  salary_median_scotland = 47500,
  salary_entry_uk = 41000,
  salary_median_uk = 55500,
  salary_experienced_uk = 75000,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14. Scotland median pay for this role is typically 14% below the UK average. London-based roles may pay significantly more.',
  salary_last_updated = CURRENT_DATE
WHERE id = 'afce4eca-6cda-4c57-afb8-756800e9228a';

-- IT Support Technician (SOC 3132, confidence: high)
UPDATE public.career_roles SET
  soc_code_2020 = '3132',
  salary_entry = '£28,000',
  salary_experienced = '£44,000',
  salary_median_scotland = 35000,
  salary_entry_uk = 28000,
  salary_median_uk = 34500,
  salary_experienced_uk = 44000,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14.',
  salary_last_updated = CURRENT_DATE
WHERE id = '4a0b553e-c411-421e-a521-14af7e1f3e8b';

-- Junior Software Developer (SOC 2134, confidence: high)
UPDATE public.career_roles SET
  soc_code_2020 = '2134',
  salary_entry = '£41,000',
  salary_experienced = '£75,000',
  salary_median_scotland = 47500,
  salary_entry_uk = 41000,
  salary_median_uk = 55500,
  salary_experienced_uk = 75000,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14. Scotland median pay for this role is typically 14% below the UK average. London-based roles may pay significantly more.',
  salary_last_updated = CURRENT_DATE
WHERE id = '0aac8ad5-cee1-403b-a097-9d10dad2cbcc';

-- Prompt Engineer (SOC 2139, confidence: low)
UPDATE public.career_roles SET
  soc_code_2020 = '2139',
  salary_entry = '£36,000',
  salary_experienced = '£69,000',
  salary_median_scotland = 40500,
  salary_entry_uk = 36000,
  salary_median_uk = 50500,
  salary_experienced_uk = 69000,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = true,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14. Scotland median pay for this role is typically 20% below the UK average. London-based roles may pay significantly more. SOC mapping confidence: low. Verify SOC 2139 is appropriate for this role.',
  salary_last_updated = CURRENT_DATE
WHERE id = 'a65b30dd-a8cc-434e-a805-e37962e488c0';

-- Senior Software Developer (SOC 2134, confidence: high)
UPDATE public.career_roles SET
  soc_code_2020 = '2134',
  salary_entry = '£41,000',
  salary_experienced = '£75,000',
  salary_median_scotland = 47500,
  salary_entry_uk = 41000,
  salary_median_uk = 55500,
  salary_experienced_uk = 75000,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14. Scotland median pay for this role is typically 14% below the UK average. London-based roles may pay significantly more.',
  salary_last_updated = CURRENT_DATE
WHERE id = '70533e10-9f52-4195-b480-99123273c071';

-- BIM / Digital Twin Manager (SOC 2455, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '2455',
  salary_entry = '£37,500',
  salary_experienced = '£56,500',
  salary_median_scotland = NULL,
  salary_entry_uk = 37500,
  salary_median_uk = 45500,
  salary_experienced_uk = 56500,
  salary_source = 'ONS ASHE 2025 (UK fallback — Scotland data suppressed)',
  salary_needs_verification = true,
  salary_notes = 'Scotland-specific figures suppressed in ASHE 2025; UK figures used. Review against SDS Labour Market Insights before pilot.',
  salary_last_updated = CURRENT_DATE
WHERE id = '8453ce56-63a5-4f29-ab99-9e41a0d5d4cb';

-- Bricklayer (SOC 5313, confidence: high)
UPDATE public.career_roles SET
  soc_code_2020 = '5313',
  salary_entry = '£26,500',
  salary_median_scotland = 32500,
  salary_entry_uk = 26500,
  salary_median_uk = 32500,
  salary_experienced_uk = NULL,
  salary_source = 'ONS ASHE 2025 (UK — partial data)',
  salary_needs_verification = true,
  salary_notes = 'Only partial ASHE data available for this SOC code. Some salary percentiles suppressed due to sample size. Manual review recommended.',
  salary_last_updated = CURRENT_DATE
WHERE id = 'd9022355-d8da-47c5-b252-fe0f924f72e3';

-- Construction Technology Specialist (SOC 3114, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '3114',
  salary_entry = '£28,500',
  salary_median_scotland = 35000,
  salary_entry_uk = 28500,
  salary_median_uk = 37000,
  salary_experienced_uk = NULL,
  salary_source = 'ONS ASHE 2025 (UK — partial data)',
  salary_needs_verification = true,
  salary_notes = 'Only partial ASHE data available for this SOC code. Some salary percentiles suppressed due to sample size. Manual review recommended.',
  salary_last_updated = CURRENT_DATE
WHERE id = 'e397ed77-f236-4b07-be0e-54261fa46b52';

-- Drone Survey Operator (SOC 3114, confidence: low)
UPDATE public.career_roles SET
  soc_code_2020 = '3114',
  salary_entry = '£28,500',
  salary_median_scotland = 35000,
  salary_entry_uk = 28500,
  salary_median_uk = 37000,
  salary_experienced_uk = NULL,
  salary_source = 'ONS ASHE 2025 (UK — partial data)',
  salary_needs_verification = true,
  salary_notes = 'Only partial ASHE data available for this SOC code. Some salary percentiles suppressed due to sample size. Manual review recommended. SOC mapping confidence: low. Verify SOC 3114 is appropriate.',
  salary_last_updated = CURRENT_DATE
WHERE id = '9e015239-5492-44c7-98f4-94c809bcabee';

-- Electrician (SOC 5241, confidence: high)
UPDATE public.career_roles SET
  soc_code_2020 = '5241',
  salary_entry = '£31,000',
  salary_experienced = '£48,500',
  salary_median_scotland = 38000,
  salary_entry_uk = 31000,
  salary_median_uk = 39000,
  salary_experienced_uk = 48500,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14.',
  salary_last_updated = CURRENT_DATE
WHERE id = 'd89a6072-656f-4957-b59c-b872b917e657';

-- Joiner / Carpenter (SOC 5316, confidence: high)
UPDATE public.career_roles SET
  soc_code_2020 = '5316',
  salary_entry = '£28,000',
  salary_experienced = '£40,000',
  salary_median_scotland = 33500,
  salary_entry_uk = 28000,
  salary_median_uk = 34000,
  salary_experienced_uk = 40000,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14.',
  salary_last_updated = CURRENT_DATE
WHERE id = '1cc2e57f-8ad0-4be5-81e6-7da084ac1a9b';

-- Plumber (SOC 5315, confidence: high)
UPDATE public.career_roles SET
  soc_code_2020 = '5315',
  salary_entry = '£29,500',
  salary_experienced = '£45,000',
  salary_median_scotland = 38000,
  salary_entry_uk = 29500,
  salary_median_uk = 36500,
  salary_experienced_uk = 45000,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14.',
  salary_last_updated = CURRENT_DATE
WHERE id = 'ee5efbee-25af-4e68-b1f7-39a19d9b901a';

-- Quantity Surveyor (SOC 2453, confidence: high)
UPDATE public.career_roles SET
  soc_code_2020 = '2453',
  salary_entry = '£41,000',
  salary_experienced = '£66,500',
  salary_median_scotland = 52000,
  salary_entry_uk = 41000,
  salary_median_uk = 52000,
  salary_experienced_uk = 66500,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14.',
  salary_last_updated = CURRENT_DATE
WHERE id = 'b5f6748d-3461-4c8c-9f6d-e60fc8a4993e';

-- Site Manager (SOC 1122, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '1122',
  salary_entry = '£39,500',
  salary_experienced = '£70,000',
  salary_median_scotland = 57500,
  salary_entry_uk = 39500,
  salary_median_uk = 55000,
  salary_experienced_uk = 70000,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14.',
  salary_last_updated = CURRENT_DATE
WHERE id = 'c4f412c6-c9eb-4da6-82d2-911867c74116';

-- Smart Building Technician (SOC 3112, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '3112',
  salary_entry = '£27,500',
  salary_median_scotland = NULL,
  salary_entry_uk = 27500,
  salary_median_uk = 35000,
  salary_experienced_uk = NULL,
  salary_source = 'ONS ASHE 2025 (UK — partial data)',
  salary_needs_verification = true,
  salary_notes = 'Only partial ASHE data available for this SOC code. Some salary percentiles suppressed due to sample size. Manual review recommended.',
  salary_last_updated = CURRENT_DATE
WHERE id = 'a1eb21e1-8515-49a3-8f7f-c93076f83025';

-- Sustainability / Energy Modelling Analyst (SOC 2129, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '2129',
  salary_entry = '£38,500',
  salary_experienced = '£61,000',
  salary_median_scotland = 46500,
  salary_entry_uk = 38500,
  salary_median_uk = 48000,
  salary_experienced_uk = 61000,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14.',
  salary_last_updated = CURRENT_DATE
WHERE id = '3877f5af-6c49-41a7-a58a-71927351dfd0';

-- AI Content Strategist (SOC 3554, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '3554',
  salary_entry = '£24,000',
  salary_experienced = '£39,000',
  salary_median_scotland = 28500,
  salary_entry_uk = 24000,
  salary_median_uk = 30500,
  salary_experienced_uk = 39000,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14.',
  salary_last_updated = CURRENT_DATE
WHERE id = '7874798f-f9a6-4dc1-9da7-cb12c7c55878';

-- AI Creative Director (SOC 2494, confidence: high)
UPDATE public.career_roles SET
  soc_code_2020 = '2494',
  salary_entry = '£33,500',
  salary_experienced = '£63,000',
  salary_median_scotland = 36000,
  salary_entry_uk = 33500,
  salary_median_uk = 46500,
  salary_experienced_uk = 63000,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14. Scotland median pay for this role is typically 23% below the UK average. London-based roles may pay significantly more.',
  salary_last_updated = CURRENT_DATE
WHERE id = '88bd88c6-771d-40da-9d16-c16ccf6db13e';

-- AI Ethics and Copyright Specialist (SOC 2419, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '2419',
  salary_entry = '£25,000',
  salary_median_scotland = NULL,
  salary_entry_uk = 25000,
  salary_median_uk = 34000,
  salary_experienced_uk = NULL,
  salary_source = 'ONS ASHE 2025 (UK — partial data)',
  salary_needs_verification = true,
  salary_notes = 'Only partial ASHE data available for this SOC code. Some salary percentiles suppressed due to sample size. Manual review recommended.',
  salary_last_updated = CURRENT_DATE
WHERE id = 'c1b4a2b2-fe5c-4676-b111-4293c271e74b';

-- CreaTech Specialist (SOC 2139, confidence: low)
UPDATE public.career_roles SET
  soc_code_2020 = '2139',
  salary_entry = '£36,000',
  salary_experienced = '£69,000',
  salary_median_scotland = 40500,
  salary_entry_uk = 36000,
  salary_median_uk = 50500,
  salary_experienced_uk = 69000,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = true,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14. Scotland median pay for this role is typically 20% below the UK average. London-based roles may pay significantly more. SOC mapping confidence: low. Verify SOC 2139 is appropriate for this role.',
  salary_last_updated = CURRENT_DATE
WHERE id = 'e7b53862-1aef-4bb0-8c80-aab853e08ce8';

-- Graphic Designer (SOC 2142, confidence: high)
UPDATE public.career_roles SET
  soc_code_2020 = '2142',
  salary_entry = '£26,000',
  salary_experienced = '£39,000',
  salary_median_scotland = 32500,
  salary_entry_uk = 26000,
  salary_median_uk = 31000,
  salary_experienced_uk = 39000,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14.',
  salary_last_updated = CURRENT_DATE
WHERE id = '30c66607-7c36-46c2-81f2-b6eb6a9179ac';

-- Journalist / Content Writer (SOC 2492, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '2492',
  salary_entry = '£31,000',
  salary_median_scotland = NULL,
  salary_entry_uk = 31000,
  salary_median_uk = 42000,
  salary_experienced_uk = NULL,
  salary_source = 'ONS ASHE 2025 (UK — partial data)',
  salary_needs_verification = true,
  salary_notes = 'Only partial ASHE data available for this SOC code. Some salary percentiles suppressed due to sample size. Manual review recommended.',
  salary_last_updated = CURRENT_DATE
WHERE id = 'd3172dd3-f51b-4d15-91fb-afedf99280c3';

-- Marketing Content Creator (SOC 3554, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '3554',
  salary_entry = '£24,000',
  salary_experienced = '£39,000',
  salary_median_scotland = 28500,
  salary_entry_uk = 24000,
  salary_median_uk = 30500,
  salary_experienced_uk = 39000,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14.',
  salary_last_updated = CURRENT_DATE
WHERE id = '988182e2-2968-4a79-abf3-6544d2b88358';

-- Photographer (SOC 3417, confidence: high)
UPDATE public.career_roles SET
  soc_code_2020 = '3417',
  salary_entry = '£24,000',
  salary_experienced = '£36,000',
  salary_median_scotland = 30000,
  salary_entry_uk = 24000,
  salary_median_uk = 30500,
  salary_experienced_uk = 36000,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14.',
  salary_last_updated = CURRENT_DATE
WHERE id = '4a5c2390-70ed-442a-b46c-9f8803845e8e';

-- Prompt Artist / Designer (SOC 2142, confidence: low)
UPDATE public.career_roles SET
  soc_code_2020 = '2142',
  salary_entry = '£26,000',
  salary_experienced = '£39,000',
  salary_median_scotland = 32500,
  salary_entry_uk = 26000,
  salary_median_uk = 31000,
  salary_experienced_uk = 39000,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = true,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14. SOC mapping confidence: low. Verify SOC 2142 is appropriate for this role.',
  salary_last_updated = CURRENT_DATE
WHERE id = '2c1db102-ae8c-46c6-8664-efe2c19f7a14';

-- UX Designer (SOC 2141, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '2141',
  salary_entry = '£30,500',
  salary_median_scotland = NULL,
  salary_entry_uk = 30500,
  salary_median_uk = 46500,
  salary_experienced_uk = NULL,
  salary_source = 'ONS ASHE 2025 (UK — partial data)',
  salary_needs_verification = true,
  salary_notes = 'Only partial ASHE data available for this SOC code. Some salary percentiles suppressed due to sample size. Manual review recommended.',
  salary_last_updated = CURRENT_DATE
WHERE id = '48b1f1a7-9ae8-4ba3-8138-e76bb5b28515';

-- Video Editor (SOC 3417, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '3417',
  salary_entry = '£24,000',
  salary_experienced = '£36,000',
  salary_median_scotland = 30000,
  salary_entry_uk = 24000,
  salary_median_uk = 30500,
  salary_experienced_uk = 36000,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14.',
  salary_last_updated = CURRENT_DATE
WHERE id = 'a30e605a-07bc-42b9-a860-57db6fa711f0';

-- AI Literacy Curriculum Developer (SOC 2319, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '2319',
  salary_entry = '£12,000',
  salary_experienced = '£30,500',
  salary_median_scotland = NULL,
  salary_entry_uk = 12000,
  salary_median_uk = NULL,
  salary_experienced_uk = 30500,
  salary_source = 'ONS ASHE 2025 (UK fallback — Scotland data suppressed)',
  salary_needs_verification = true,
  salary_notes = 'Scotland-specific figures suppressed in ASHE 2025; UK figures used. Review against SDS Labour Market Insights before pilot.',
  salary_last_updated = CURRENT_DATE
WHERE id = '4ba0a89f-99c4-4488-992e-07d2fa3a3217';

-- Digital Learning Designer (SOC 2319, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '2319',
  salary_entry = '£12,000',
  salary_experienced = '£30,500',
  salary_median_scotland = NULL,
  salary_entry_uk = 12000,
  salary_median_uk = NULL,
  salary_experienced_uk = 30500,
  salary_source = 'ONS ASHE 2025 (UK fallback — Scotland data suppressed)',
  salary_needs_verification = true,
  salary_notes = 'Scotland-specific figures suppressed in ASHE 2025; UK figures used. Review against SDS Labour Market Insights before pilot.',
  salary_last_updated = CURRENT_DATE
WHERE id = 'ee5b1c41-94eb-4f0f-b5d9-d3cb2f08a0c5';

-- Educational Psychologist (SOC 2226, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '2226',
  salary_entry = '£26,500',
  salary_experienced = '£56,000',
  salary_median_scotland = 49000,
  salary_entry_uk = 26500,
  salary_median_uk = 34000,
  salary_experienced_uk = 56000,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14. Scotland median pay for this role is competitive with or above the UK average (approx. +44%), likely driven by sector demand.',
  salary_last_updated = CURRENT_DATE
WHERE id = '5ae85890-2a28-488c-a0b9-d1dfb39dbdb9';

-- Learning Technologist (SOC 2319, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '2319',
  salary_entry = '£12,000',
  salary_experienced = '£30,500',
  salary_median_scotland = NULL,
  salary_entry_uk = 12000,
  salary_median_uk = NULL,
  salary_experienced_uk = 30500,
  salary_source = 'ONS ASHE 2025 (UK fallback — Scotland data suppressed)',
  salary_needs_verification = true,
  salary_notes = 'Scotland-specific figures suppressed in ASHE 2025; UK figures used. Review against SDS Labour Market Insights before pilot.',
  salary_last_updated = CURRENT_DATE
WHERE id = '1c4e0c82-3551-46d2-955f-bac192a775b3';

-- Nursery Practitioner / Childcare Worker (SOC 3232, confidence: high)
UPDATE public.career_roles SET
  soc_code_2020 = '3232',
  salary_entry = '£13,500',
  salary_experienced = '£24,500',
  salary_median_scotland = 23000,
  salary_entry_uk = 13500,
  salary_median_uk = 19500,
  salary_experienced_uk = 24500,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14. Scotland median pay for this role is competitive with or above the UK average (approx. +18%), likely driven by sector demand.',
  salary_last_updated = CURRENT_DATE
WHERE id = 'ab4a99fd-4fef-4dcd-8bc9-7e9d7d9fbf0f';

-- Online / AI-Assisted Tutoring Coordinator (SOC 2319, confidence: low)
UPDATE public.career_roles SET
  soc_code_2020 = '2319',
  salary_entry = '£12,000',
  salary_experienced = '£30,500',
  salary_median_scotland = NULL,
  salary_entry_uk = 12000,
  salary_median_uk = NULL,
  salary_experienced_uk = 30500,
  salary_source = 'ONS ASHE 2025 (UK fallback — Scotland data suppressed)',
  salary_needs_verification = true,
  salary_notes = 'Scotland-specific figures suppressed in ASHE 2025; UK figures used. Review against SDS Labour Market Insights before pilot. SOC mapping confidence: low. Verify SOC 2319 is appropriate for this role.',
  salary_last_updated = CURRENT_DATE
WHERE id = '6d1a648c-d256-45e0-8657-faea1f2f7eff';

-- Teacher (Primary/Secondary) (SOC 2314, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '2314',
  salary_entry = '£30,500',
  salary_experienced = '£50,000',
  salary_median_scotland = 46500,
  salary_entry_uk = 30500,
  salary_median_uk = 42000,
  salary_experienced_uk = 50000,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14. Scotland median pay for this role is competitive with or above the UK average (approx. +11%), likely driven by sector demand.',
  salary_last_updated = CURRENT_DATE
WHERE id = 'b3c4d46b-ea4f-40d0-b709-761731f70dc5';

-- Teaching Assistant (SOC 6112, confidence: high)
UPDATE public.career_roles SET
  soc_code_2020 = '6112',
  salary_entry = '£13,500',
  salary_experienced = '£21,500',
  salary_median_scotland = 17500,
  salary_entry_uk = 13500,
  salary_median_uk = 18000,
  salary_experienced_uk = 21500,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14.',
  salary_last_updated = CURRENT_DATE
WHERE id = '4e5939dd-1f69-4885-bd46-0392aee97b22';

-- AI Quality Systems Analyst (SOC 2481, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '2481',
  salary_entry = '£33,500',
  salary_experienced = '£54,000',
  salary_median_scotland = 44000,
  salary_entry_uk = 33500,
  salary_median_uk = 42500,
  salary_experienced_uk = 54000,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14.',
  salary_last_updated = CURRENT_DATE
WHERE id = '8cbe6ea2-f187-40a9-ac0e-9fa8058e66b1';

-- CNC Operator / Programmer (SOC 5221, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '5221',
  salary_entry = '£29,000',
  salary_experienced = '£42,500',
  salary_median_scotland = 36500,
  salary_entry_uk = 29000,
  salary_median_uk = 35500,
  salary_experienced_uk = 42500,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14.',
  salary_last_updated = CURRENT_DATE
WHERE id = '3961010f-e446-4c4f-9892-c4c9d4041a3f';

-- Digital Manufacturing Engineer (SOC 2125, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '2125',
  salary_entry = '£39,500',
  salary_experienced = '£58,500',
  salary_median_scotland = 45000,
  salary_entry_uk = 39500,
  salary_median_uk = 47500,
  salary_experienced_uk = 58500,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14.',
  salary_last_updated = CURRENT_DATE
WHERE id = '98ca56e8-f682-46a8-aaea-64f0d93383a9';

-- Electrical Engineer (SOC 2123, confidence: high)
UPDATE public.career_roles SET
  soc_code_2020 = '2123',
  salary_entry = '£43,000',
  salary_experienced = '£73,000',
  salary_median_scotland = 59500,
  salary_entry_uk = 43000,
  salary_median_uk = 60000,
  salary_experienced_uk = 73000,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14.',
  salary_last_updated = CURRENT_DATE
WHERE id = 'f844bcc4-1dc6-401e-bfc2-a4ae4ad92c6f';

-- Maintenance Engineer (SOC 5223, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '5223',
  salary_entry = '£30,000',
  salary_experienced = '£51,500',
  salary_median_scotland = 41500,
  salary_entry_uk = 30000,
  salary_median_uk = 40000,
  salary_experienced_uk = 51500,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14.',
  salary_last_updated = CURRENT_DATE
WHERE id = 'f7fb8ac5-7c63-4e98-94e3-adf79b637bec';

-- Manufacturing Technician (SOC 3119, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '3119',
  salary_entry = '£27,000',
  salary_experienced = '£45,000',
  salary_median_scotland = 36000,
  salary_entry_uk = 27000,
  salary_median_uk = 34500,
  salary_experienced_uk = 45000,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14.',
  salary_last_updated = CURRENT_DATE
WHERE id = '5af9e938-436e-4d17-bcb2-7f83a781f948';

-- Mechanical Engineer (SOC 2122, confidence: high)
UPDATE public.career_roles SET
  soc_code_2020 = '2122',
  salary_entry = '£38,500',
  salary_experienced = '£62,500',
  salary_median_scotland = 38500,
  salary_entry_uk = 38500,
  salary_median_uk = 50500,
  salary_experienced_uk = 62500,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14. Scotland median pay for this role is typically 24% below the UK average. London-based roles may pay significantly more.',
  salary_last_updated = CURRENT_DATE
WHERE id = 'ee08591c-bf52-439c-a1b7-73e017087979';

-- Predictive Maintenance Analyst (SOC 2481, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '2481',
  salary_entry = '£33,500',
  salary_experienced = '£54,000',
  salary_median_scotland = 44000,
  salary_entry_uk = 33500,
  salary_median_uk = 42500,
  salary_experienced_uk = 54000,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14.',
  salary_last_updated = CURRENT_DATE
WHERE id = 'c2948f32-77e7-410a-9bc8-26e9c6169c3b';

-- Quality Control Inspector (SOC 3115, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '3115',
  salary_entry = '£28,000',
  salary_experienced = '£42,000',
  salary_median_scotland = 35000,
  salary_entry_uk = 28000,
  salary_median_uk = 33000,
  salary_experienced_uk = 42000,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14. Scotland median pay for this role is competitive with or above the UK average (approx. +6%), likely driven by sector demand.',
  salary_last_updated = CURRENT_DATE
WHERE id = '5abc98ec-88ab-4245-a8a0-d9da3061e00d';

-- Robotics Technician (SOC 3113, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '3113',
  salary_entry = '£33,500',
  salary_experienced = '£55,000',
  salary_median_scotland = 42500,
  salary_entry_uk = 33500,
  salary_median_uk = 44500,
  salary_experienced_uk = 55000,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14.',
  salary_last_updated = CURRENT_DATE
WHERE id = 'ddec8e5c-8bca-4dff-be62-185b6404cac7';

-- Smart Factory Coordinator (SOC 3116, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '3116',
  salary_entry = '£29,000',
  salary_median_scotland = NULL,
  salary_entry_uk = 29000,
  salary_median_uk = 36000,
  salary_experienced_uk = NULL,
  salary_source = 'ONS ASHE 2025 (UK — partial data)',
  salary_needs_verification = true,
  salary_notes = 'Only partial ASHE data available for this SOC code. Some salary percentiles suppressed due to sample size. Manual review recommended.',
  salary_last_updated = CURRENT_DATE
WHERE id = '7b7296eb-71fa-4702-b6ee-c3e8ef2917e7';

-- AI Healthcare Data Analyst (SOC 3544, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '3544',
  salary_entry = '£30,000',
  salary_experienced = '£46,000',
  salary_median_scotland = NULL,
  salary_entry_uk = 30000,
  salary_median_uk = 38000,
  salary_experienced_uk = 46000,
  salary_source = 'ONS ASHE 2025 (UK fallback — Scotland data suppressed)',
  salary_needs_verification = true,
  salary_notes = 'Scotland-specific figures suppressed in ASHE 2025; UK figures used. Review against SDS Labour Market Insights before pilot.',
  salary_last_updated = CURRENT_DATE
WHERE id = '3477d18e-8a20-41bd-b3b8-2cac513abf8b';

-- Chief Nursing Information Officer (CNIO) (SOC 1171, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '1171',
  salary_entry = '£41,000',
  salary_experienced = '£74,500',
  salary_median_scotland = NULL,
  salary_entry_uk = 41000,
  salary_median_uk = 56000,
  salary_experienced_uk = 74500,
  salary_source = 'ONS ASHE 2025 (UK fallback — Scotland data suppressed)',
  salary_needs_verification = true,
  salary_notes = 'Scotland-specific figures suppressed in ASHE 2025; UK figures used. Review against SDS Labour Market Insights before pilot.',
  salary_last_updated = CURRENT_DATE
WHERE id = 'f7ab0688-176e-4d4a-8216-540813e42b87';

-- Clinical AI Safety Specialist (SOC 2482, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '2482',
  salary_entry = '£36,500',
  salary_experienced = '£64,500',
  salary_median_scotland = 49500,
  salary_entry_uk = 36500,
  salary_median_uk = 48000,
  salary_experienced_uk = 64500,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14.',
  salary_last_updated = CURRENT_DATE
WHERE id = '5a23c452-71df-4f4d-a75c-7e6abb3dd023';

-- Clinical Informatician (SOC 2139, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '2139',
  salary_entry = '£36,000',
  salary_experienced = '£69,000',
  salary_median_scotland = 40500,
  salary_entry_uk = 36000,
  salary_median_uk = 50500,
  salary_experienced_uk = 69000,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14. Scotland median pay for this role is typically 20% below the UK average. London-based roles may pay significantly more.',
  salary_last_updated = CURRENT_DATE
WHERE id = '61507572-ce66-4a80-96f5-c27b8d7140c6';

-- Digital Medicines Specialist (SOC 2251, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '2251',
  salary_entry = '£32,500',
  salary_experienced = '£57,500',
  salary_median_scotland = 52500,
  salary_entry_uk = 32500,
  salary_median_uk = 47500,
  salary_experienced_uk = 57500,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14. Scotland median pay for this role is competitive with or above the UK average (approx. +11%), likely driven by sector demand.',
  salary_last_updated = CURRENT_DATE
WHERE id = '839c1cd3-2c99-43ae-9e48-7f3af7c6aa4f';

-- Doctor / GP (SOC 2211, confidence: high)
UPDATE public.career_roles SET
  soc_code_2020 = '2211',
  salary_entry = '£36,500',
  salary_experienced = '£66,000',
  salary_median_scotland = 44500,
  salary_entry_uk = 36500,
  salary_median_uk = 52000,
  salary_experienced_uk = 66000,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14. Scotland median pay for this role is typically 14% below the UK average. London-based roles may pay significantly more.',
  salary_last_updated = CURRENT_DATE
WHERE id = '47764fc6-985e-4c02-8f61-877aaab678b9';

-- Health Data Scientist (SOC 2119, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '2119',
  salary_entry = '£32,000',
  salary_experienced = '£53,000',
  salary_median_scotland = 36000,
  salary_entry_uk = 32000,
  salary_median_uk = 41500,
  salary_experienced_uk = 53000,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14. Scotland median pay for this role is typically 13% below the UK average. London-based roles may pay significantly more.',
  salary_last_updated = CURRENT_DATE
WHERE id = 'e6da5b33-b2fc-4d1f-b97e-dd2b46980f5c';

-- Healthcare Assistant / Care Worker (SOC 6135, confidence: high)
UPDATE public.career_roles SET
  soc_code_2020 = '6135',
  salary_entry = '£13,500',
  salary_experienced = '£28,500',
  salary_median_scotland = 22000,
  salary_entry_uk = 13500,
  salary_median_uk = 21500,
  salary_experienced_uk = 28500,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14.',
  salary_last_updated = CURRENT_DATE
WHERE id = 'f1a01f52-a69f-4623-b05e-ca723cf703ae';

-- Nurse (SOC 2237, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '2237',
  salary_entry = '£25,000',
  salary_experienced = '£45,500',
  salary_median_scotland = 36500,
  salary_entry_uk = 25000,
  salary_median_uk = 37000,
  salary_experienced_uk = 45500,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14.',
  salary_last_updated = CURRENT_DATE
WHERE id = '3871eba8-df22-4bf8-8d20-d3047b94d596';

-- Pharmacist (SOC 2251, confidence: high)
UPDATE public.career_roles SET
  soc_code_2020 = '2251',
  salary_entry = '£32,500',
  salary_experienced = '£57,500',
  salary_median_scotland = 52500,
  salary_entry_uk = 32500,
  salary_median_uk = 47500,
  salary_experienced_uk = 57500,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14. Scotland median pay for this role is competitive with or above the UK average (approx. +11%), likely driven by sector demand.',
  salary_last_updated = CURRENT_DATE
WHERE id = '21ce10ca-767b-4dbb-a559-bedcb68aadac';

-- Physiotherapist / Paramedic (SOC 2221, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '2221',
  salary_entry = '£30,500',
  salary_experienced = '£48,500',
  salary_median_scotland = 40000,
  salary_entry_uk = 30500,
  salary_median_uk = 38000,
  salary_experienced_uk = 48500,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14. Scotland median pay for this role is competitive with or above the UK average (approx. +5%), likely driven by sector demand.',
  salary_last_updated = CURRENT_DATE
WHERE id = '400bef8c-cad5-4c06-a37a-6b47a790b1df';

-- Radiographer (SOC 2254, confidence: high)
UPDATE public.career_roles SET
  soc_code_2020 = '2254',
  salary_entry = '£34,000',
  salary_experienced = '£53,000',
  salary_median_scotland = 47000,
  salary_entry_uk = 34000,
  salary_median_uk = 44500,
  salary_experienced_uk = 53000,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14. Scotland median pay for this role is competitive with or above the UK average (approx. +6%), likely driven by sector demand.',
  salary_last_updated = CURRENT_DATE
WHERE id = '734786c4-c68b-45fb-88af-9aaa308ad8cf';

-- Chef (SOC 5434, confidence: high)
UPDATE public.career_roles SET
  soc_code_2020 = '5434',
  salary_entry = '£17,500',
  salary_experienced = '£33,000',
  salary_median_scotland = 27000,
  salary_entry_uk = 17500,
  salary_median_uk = 26500,
  salary_experienced_uk = 33000,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14.',
  salary_last_updated = CURRENT_DATE
WHERE id = '5ec417d0-00fd-4605-a803-c33a0cefbf3f';

-- Digital Concierge Manager (SOC 1221, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '1221',
  salary_entry = '£26,500',
  salary_median_scotland = 38500,
  salary_entry_uk = 26500,
  salary_median_uk = 33000,
  salary_experienced_uk = NULL,
  salary_source = 'ONS ASHE 2025 (UK — partial data)',
  salary_needs_verification = true,
  salary_notes = 'Only partial ASHE data available for this SOC code. Some salary percentiles suppressed due to sample size. Manual review recommended.',
  salary_last_updated = CURRENT_DATE
WHERE id = '145bdb5b-76dc-4e39-ae81-4da095e2825e';

-- Events Coordinator (SOC 3557, confidence: high)
UPDATE public.career_roles SET
  soc_code_2020 = '3557',
  salary_entry = '£22,000',
  salary_experienced = '£38,500',
  salary_median_scotland = 28500,
  salary_entry_uk = 22000,
  salary_median_uk = 29000,
  salary_experienced_uk = 38500,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14.',
  salary_last_updated = CURRENT_DATE
WHERE id = '200cb8fa-8ffa-4fda-bb03-049aa8867945';

-- Guest Experience Designer (SOC 1221, confidence: low)
UPDATE public.career_roles SET
  soc_code_2020 = '1221',
  salary_entry = '£26,500',
  salary_median_scotland = 38500,
  salary_entry_uk = 26500,
  salary_median_uk = 33000,
  salary_experienced_uk = NULL,
  salary_source = 'ONS ASHE 2025 (UK — partial data)',
  salary_needs_verification = true,
  salary_notes = 'Only partial ASHE data available for this SOC code. Some salary percentiles suppressed due to sample size. Manual review recommended. SOC mapping confidence: low. Verify SOC 1221 is appropriate.',
  salary_last_updated = CURRENT_DATE
WHERE id = '6847c5f5-4117-4851-af03-5692553374ae';

-- Hospitality Technology Manager (SOC 1221, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '1221',
  salary_entry = '£26,500',
  salary_median_scotland = 38500,
  salary_entry_uk = 26500,
  salary_median_uk = 33000,
  salary_experienced_uk = NULL,
  salary_source = 'ONS ASHE 2025 (UK — partial data)',
  salary_needs_verification = true,
  salary_notes = 'Only partial ASHE data available for this SOC code. Some salary percentiles suppressed due to sample size. Manual review recommended.',
  salary_last_updated = CURRENT_DATE
WHERE id = '99cdda29-0b42-498f-8bf6-dce32ca029b0';

-- Hotel Receptionist (SOC 4216, confidence: high)
UPDATE public.career_roles SET
  soc_code_2020 = '4216',
  salary_entry = '£12,500',
  salary_experienced = '£24,000',
  salary_median_scotland = 19000,
  salary_entry_uk = 12500,
  salary_median_uk = 18000,
  salary_experienced_uk = 24000,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14. Scotland median pay for this role is competitive with or above the UK average (approx. +6%), likely driven by sector demand.',
  salary_last_updated = CURRENT_DATE
WHERE id = 'e7e33963-7d7a-469e-b006-d648d16b52fc';

-- Restaurant Manager (SOC 1222, confidence: high)
UPDATE public.career_roles SET
  soc_code_2020 = '1222',
  salary_entry = '£24,000',
  salary_experienced = '£36,000',
  salary_median_scotland = 29500,
  salary_entry_uk = 24000,
  salary_median_uk = 30500,
  salary_experienced_uk = 36000,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14.',
  salary_last_updated = CURRENT_DATE
WHERE id = 'ac150b7c-b35e-4341-9f27-4431e940db7a';

-- Revenue / Yield Analyst (SOC 3549, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '3549',
  salary_entry = '£25,500',
  salary_experienced = '£43,500',
  salary_median_scotland = 38000,
  salary_entry_uk = 25500,
  salary_median_uk = 33000,
  salary_experienced_uk = 43500,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14. Scotland median pay for this role is competitive with or above the UK average (approx. +15%), likely driven by sector demand.',
  salary_last_updated = CURRENT_DATE
WHERE id = '25142f25-ebb5-46ba-8b89-743e2748392a';

-- Sustainability / Waste Optimisation Specialist (SOC 2152, confidence: low)
UPDATE public.career_roles SET
  soc_code_2020 = '2152',
  salary_entry = '£32,500',
  salary_experienced = '£50,500',
  salary_median_scotland = 45500,
  salary_entry_uk = 32500,
  salary_median_uk = 41500,
  salary_experienced_uk = 50500,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = true,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14. Scotland median pay for this role is competitive with or above the UK average (approx. +10%), likely driven by sector demand. SOC mapping confidence: low. Verify SOC 2152 is appropriate for this role.',
  salary_last_updated = CURRENT_DATE
WHERE id = '2f562008-f53c-4e29-8cfa-72fd5d908c13';

-- Waiter / Waitress / Bar Staff (SOC 9264, confidence: high)
UPDATE public.career_roles SET
  soc_code_2020 = '9264',
  salary_entry = '£12,000',
  salary_experienced = '£18,000',
  salary_median_scotland = NULL,
  salary_entry_uk = 12000,
  salary_median_uk = 12000,
  salary_experienced_uk = 18000,
  salary_source = 'ONS ASHE 2025 (UK fallback — Scotland data suppressed)',
  salary_needs_verification = true,
  salary_notes = 'Scotland-specific figures suppressed in ASHE 2025; UK figures used. Review against SDS Labour Market Insights before pilot.',
  salary_last_updated = CURRENT_DATE
WHERE id = '379303a9-24b2-4651-b8b5-b774eb10c440';

-- AI Compliance / Ethics Specialist (SOC 2419, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '2419',
  salary_entry = '£25,000',
  salary_median_scotland = NULL,
  salary_entry_uk = 25000,
  salary_median_uk = 34000,
  salary_experienced_uk = NULL,
  salary_source = 'ONS ASHE 2025 (UK — partial data)',
  salary_needs_verification = true,
  salary_notes = 'Only partial ASHE data available for this SOC code. Some salary percentiles suppressed due to sample size. Manual review recommended.',
  salary_last_updated = CURRENT_DATE
WHERE id = 'b7ce61ba-c46e-4d03-adf6-c671315c99ef';

-- Barrister (SOC 2411, confidence: high)
UPDATE public.career_roles SET
  soc_code_2020 = '2411',
  salary_entry = '£21,500',
  salary_experienced = '£60,000',
  salary_median_scotland = NULL,
  salary_entry_uk = 21500,
  salary_median_uk = 34500,
  salary_experienced_uk = 60000,
  salary_source = 'ONS ASHE 2025 (UK fallback — Scotland data suppressed)',
  salary_needs_verification = true,
  salary_notes = 'Scotland-specific figures suppressed in ASHE 2025; UK figures used. Review against SDS Labour Market Insights before pilot.',
  salary_last_updated = CURRENT_DATE
WHERE id = 'ad272595-44aa-44de-8aeb-f86c49fa58b4';

-- Court Clerk (SOC 3520, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '3520',
  salary_entry = '£24,500',
  salary_experienced = '£43,000',
  salary_median_scotland = NULL,
  salary_entry_uk = 24500,
  salary_median_uk = 32500,
  salary_experienced_uk = 43000,
  salary_source = 'ONS ASHE 2025 (UK fallback — Scotland data suppressed)',
  salary_needs_verification = true,
  salary_notes = 'Scotland-specific figures suppressed in ASHE 2025; UK figures used. Review against SDS Labour Market Insights before pilot.',
  salary_last_updated = CURRENT_DATE
WHERE id = '98938333-4962-4ec4-83cd-a826a96b630e';

-- LawTech Consultant (SOC 2431, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '2431',
  salary_entry = '£38,000',
  salary_experienced = '£68,500',
  salary_median_scotland = 44000,
  salary_entry_uk = 38000,
  salary_median_uk = 51500,
  salary_experienced_uk = 68500,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14. Scotland median pay for this role is typically 15% below the UK average. London-based roles may pay significantly more.',
  salary_last_updated = CURRENT_DATE
WHERE id = 'bd2dc0da-6119-47ca-88ab-31034840d54a';

-- Legal AI Product Manager (SOC 2131, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '2131',
  salary_entry = '£40,000',
  salary_experienced = '£74,500',
  salary_median_scotland = 45500,
  salary_entry_uk = 40000,
  salary_median_uk = 58000,
  salary_experienced_uk = 74500,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14. Scotland median pay for this role is typically 22% below the UK average. London-based roles may pay significantly more.',
  salary_last_updated = CURRENT_DATE
WHERE id = '822789d5-d4ef-4faa-a930-c6f640e518b3';

-- Legal Data Analyst (SOC 3544, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '3544',
  salary_entry = '£30,000',
  salary_experienced = '£46,000',
  salary_median_scotland = NULL,
  salary_entry_uk = 30000,
  salary_median_uk = 38000,
  salary_experienced_uk = 46000,
  salary_source = 'ONS ASHE 2025 (UK fallback — Scotland data suppressed)',
  salary_needs_verification = true,
  salary_notes = 'Scotland-specific figures suppressed in ASHE 2025; UK figures used. Review against SDS Labour Market Insights before pilot.',
  salary_last_updated = CURRENT_DATE
WHERE id = 'a3c57b35-3682-4934-9ce3-9a2c1495dbd9';

-- Legal Secretary (SOC 4212, confidence: high)
UPDATE public.career_roles SET
  soc_code_2020 = '4212',
  salary_entry = '£18,500',
  salary_experienced = '£28,500',
  salary_median_scotland = 25000,
  salary_entry_uk = 18500,
  salary_median_uk = 24500,
  salary_experienced_uk = 28500,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14.',
  salary_last_updated = CURRENT_DATE
WHERE id = '51263265-d83a-4251-8b0d-c0bf46c66dea';

-- Legal Technologist (SOC 2139, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '2139',
  salary_entry = '£36,000',
  salary_experienced = '£69,000',
  salary_median_scotland = 40500,
  salary_entry_uk = 36000,
  salary_median_uk = 50500,
  salary_experienced_uk = 69000,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14. Scotland median pay for this role is typically 20% below the UK average. London-based roles may pay significantly more.',
  salary_last_updated = CURRENT_DATE
WHERE id = '7541bdcf-84eb-4790-b80b-03f385eb9633';

-- Paralegal (SOC 3520, confidence: high)
UPDATE public.career_roles SET
  soc_code_2020 = '3520',
  salary_entry = '£24,500',
  salary_experienced = '£43,000',
  salary_median_scotland = NULL,
  salary_entry_uk = 24500,
  salary_median_uk = 32500,
  salary_experienced_uk = 43000,
  salary_source = 'ONS ASHE 2025 (UK fallback — Scotland data suppressed)',
  salary_needs_verification = true,
  salary_notes = 'Scotland-specific figures suppressed in ASHE 2025; UK figures used. Review against SDS Labour Market Insights before pilot.',
  salary_last_updated = CURRENT_DATE
WHERE id = 'c1c92bc7-9a8f-49f4-96c0-e2e402c10c9a';

-- Solicitor (Junior/Trainee) (SOC 2412, confidence: high)
UPDATE public.career_roles SET
  soc_code_2020 = '2412',
  salary_entry = '£38,000',
  salary_experienced = '£74,000',
  salary_median_scotland = 49500,
  salary_entry_uk = 38000,
  salary_median_uk = 53500,
  salary_experienced_uk = 74000,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14.',
  salary_last_updated = CURRENT_DATE
WHERE id = '190404b9-270a-4f11-b57e-c4e94f55410c';

-- Solicitor (Senior) / Partner (SOC 2412, confidence: high)
UPDATE public.career_roles SET
  soc_code_2020 = '2412',
  salary_entry = '£38,000',
  salary_experienced = '£74,000',
  salary_median_scotland = 49500,
  salary_entry_uk = 38000,
  salary_median_uk = 53500,
  salary_experienced_uk = 74000,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14.',
  salary_last_updated = CURRENT_DATE
WHERE id = 'ea05435c-b34f-426b-9c71-c0da585b6124';

-- AI News Verification Specialist (SOC 2492, confidence: low)
UPDATE public.career_roles SET
  soc_code_2020 = '2492',
  salary_entry = '£31,000',
  salary_median_scotland = NULL,
  salary_entry_uk = 31000,
  salary_median_uk = 42000,
  salary_experienced_uk = NULL,
  salary_source = 'ONS ASHE 2025 (UK — partial data)',
  salary_needs_verification = true,
  salary_notes = 'Only partial ASHE data available for this SOC code. Some salary percentiles suppressed due to sample size. Manual review recommended. SOC mapping confidence: low. Verify SOC 2492 is appropriate.',
  salary_last_updated = CURRENT_DATE
WHERE id = 'e85eccc7-05ce-44e8-b9d8-e386a2e2394d';

-- Automated Media Monitoring Analyst (SOC 3554, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '3554',
  salary_entry = '£24,000',
  salary_experienced = '£39,000',
  salary_median_scotland = 28500,
  salary_entry_uk = 24000,
  salary_median_uk = 30500,
  salary_experienced_uk = 39000,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14.',
  salary_last_updated = CURRENT_DATE
WHERE id = 'c79fe777-008b-4466-a11b-81fe758b1fc1';

-- Broadcast Journalist (SOC 2492, confidence: high)
UPDATE public.career_roles SET
  soc_code_2020 = '2492',
  salary_entry = '£31,000',
  salary_median_scotland = NULL,
  salary_entry_uk = 31000,
  salary_median_uk = 42000,
  salary_experienced_uk = NULL,
  salary_source = 'ONS ASHE 2025 (UK — partial data)',
  salary_needs_verification = true,
  salary_notes = 'Only partial ASHE data available for this SOC code. Some salary percentiles suppressed due to sample size. Manual review recommended.',
  salary_last_updated = CURRENT_DATE
WHERE id = 'ec5b5ced-19bf-465e-8016-bdfd8bd566a0';

-- Broadcast Technician (SOC 3417, confidence: high)
UPDATE public.career_roles SET
  soc_code_2020 = '3417',
  salary_entry = '£24,000',
  salary_experienced = '£36,000',
  salary_median_scotland = 30000,
  salary_entry_uk = 24000,
  salary_median_uk = 30500,
  salary_experienced_uk = 36000,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14.',
  salary_last_updated = CURRENT_DATE
WHERE id = '5b0ca74a-1592-471c-9894-af9dfd505bb1';

-- Communications Officer (SOC 2493, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '2493',
  salary_entry = '£28,500',
  salary_experienced = '£46,000',
  salary_median_scotland = 37000,
  salary_entry_uk = 28500,
  salary_median_uk = 36500,
  salary_experienced_uk = 46000,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14.',
  salary_last_updated = CURRENT_DATE
WHERE id = '443f6a5b-8550-4f51-9a03-2e21b371267a';

-- Copywriter (SOC 3412, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '3412',
  salary_entry = '£26,500',
  salary_median_scotland = NULL,
  salary_entry_uk = 26500,
  salary_median_uk = 37000,
  salary_experienced_uk = NULL,
  salary_source = 'ONS ASHE 2025 (UK — partial data)',
  salary_needs_verification = true,
  salary_notes = 'Only partial ASHE data available for this SOC code. Some salary percentiles suppressed due to sample size. Manual review recommended.',
  salary_last_updated = CURRENT_DATE
WHERE id = '62690d24-8cf6-4dd6-b316-3f07aa31ca89';

-- Public Relations Officer (SOC 2493, confidence: high)
UPDATE public.career_roles SET
  soc_code_2020 = '2493',
  salary_entry = '£28,500',
  salary_experienced = '£46,000',
  salary_median_scotland = 37000,
  salary_entry_uk = 28500,
  salary_median_uk = 36500,
  salary_experienced_uk = 46000,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14.',
  salary_last_updated = CURRENT_DATE
WHERE id = '0d33ffd4-4542-407d-9165-6fc6e1938248';

-- Publishing Editor (SOC 2491, confidence: high)
UPDATE public.career_roles SET
  soc_code_2020 = '2491',
  salary_entry = '£34,000',
  salary_experienced = '£54,500',
  salary_median_scotland = 36000,
  salary_entry_uk = 34000,
  salary_median_uk = 41500,
  salary_experienced_uk = 54500,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14. Scotland median pay for this role is typically 13% below the UK average. London-based roles may pay significantly more.',
  salary_last_updated = CURRENT_DATE
WHERE id = '501d4b66-dfc9-481f-b98d-9a9595cc4e19';

-- Social Media Manager (SOC 3554, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '3554',
  salary_entry = '£24,000',
  salary_experienced = '£39,000',
  salary_median_scotland = 28500,
  salary_entry_uk = 24000,
  salary_median_uk = 30500,
  salary_experienced_uk = 39000,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14.',
  salary_last_updated = CURRENT_DATE
WHERE id = 'af13cd79-6c6b-4fe8-bdbe-7f01f19a7e47';

-- TV / Film Producer (SOC 3416, confidence: high)
UPDATE public.career_roles SET
  soc_code_2020 = '3416',
  salary_entry = '£30,000',
  salary_experienced = '£51,500',
  salary_median_scotland = 36000,
  salary_entry_uk = 30000,
  salary_median_uk = 39500,
  salary_experienced_uk = 51500,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14.',
  salary_last_updated = CURRENT_DATE
WHERE id = '95179853-4790-45d4-9b50-433d484cdbae';

-- Actor (SOC 3413, confidence: high)
UPDATE public.career_roles SET
  soc_code_2020 = '3413',
  salary_needs_verification = true,
  salary_notes = 'No ASHE 2025 data available for SOC 3413 (Actors, entertainers and presenters). Existing salary estimates retained. Manual review required.',
  salary_last_updated = CURRENT_DATE
WHERE id = '5aef84cc-c5ba-4039-9d4c-c268bdcac1d3';

-- AI Music Production Specialist (SOC 3416, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '3416',
  salary_entry = '£30,000',
  salary_experienced = '£51,500',
  salary_median_scotland = 36000,
  salary_entry_uk = 30000,
  salary_median_uk = 39500,
  salary_experienced_uk = 51500,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14.',
  salary_last_updated = CURRENT_DATE
WHERE id = 'c054b55b-a064-4625-bfd2-2f6544d486b1';

-- Choreographer (SOC 3414, confidence: high)
UPDATE public.career_roles SET
  soc_code_2020 = '3414',
  salary_needs_verification = true,
  salary_notes = 'No ASHE 2025 data available for SOC 3414 (Dancers and choreographers). Existing salary estimates retained. Manual review required.',
  salary_last_updated = CURRENT_DATE
WHERE id = 'ffaa9572-705a-4ba2-a107-caa460c8ed91';

-- Dancer (SOC 3414, confidence: high)
UPDATE public.career_roles SET
  soc_code_2020 = '3414',
  salary_needs_verification = true,
  salary_notes = 'No ASHE 2025 data available for SOC 3414 (Dancers and choreographers). Existing salary estimates retained. Manual review required.',
  salary_last_updated = CURRENT_DATE
WHERE id = '81dff71b-c0bf-4753-a77d-cef3185a9765';

-- Lighting Designer (SOC 3429, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '3429',
  salary_entry = '£30,500',
  salary_median_scotland = NULL,
  salary_entry_uk = 30500,
  salary_median_uk = 37000,
  salary_experienced_uk = NULL,
  salary_source = 'ONS ASHE 2025 (UK — partial data)',
  salary_needs_verification = true,
  salary_notes = 'Only partial ASHE data available for this SOC code. Some salary percentiles suppressed due to sample size. Manual review recommended.',
  salary_last_updated = CURRENT_DATE
WHERE id = '72f69926-8c24-42bc-9eba-08dbf0bda03a';

-- Music Producer (SOC 3416, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '3416',
  salary_entry = '£30,000',
  salary_experienced = '£51,500',
  salary_median_scotland = 36000,
  salary_entry_uk = 30000,
  salary_median_uk = 39500,
  salary_experienced_uk = 51500,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14.',
  salary_last_updated = CURRENT_DATE
WHERE id = '56bbda9e-3c3a-4140-8df8-13c9b0885f84';

-- Musician (Live Performer) (SOC 3415, confidence: high)
UPDATE public.career_roles SET
  soc_code_2020 = '3415',
  salary_needs_verification = true,
  salary_notes = 'No ASHE 2025 data available for SOC 3415 (Musicians). Existing salary estimates retained. Manual review required.',
  salary_last_updated = CURRENT_DATE
WHERE id = '56cee6b2-d98c-4c10-86ee-84ab28fce095';

-- Sound Technician (SOC 3417, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '3417',
  salary_entry = '£24,000',
  salary_experienced = '£36,000',
  salary_median_scotland = 30000,
  salary_entry_uk = 24000,
  salary_median_uk = 30500,
  salary_experienced_uk = 36000,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14.',
  salary_last_updated = CURRENT_DATE
WHERE id = 'ce555525-b451-40f6-afca-c88f8c397374';

-- Stage Manager (SOC 3416, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '3416',
  salary_entry = '£30,000',
  salary_experienced = '£51,500',
  salary_median_scotland = 36000,
  salary_entry_uk = 30000,
  salary_median_uk = 39500,
  salary_experienced_uk = 51500,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14.',
  salary_last_updated = CURRENT_DATE
WHERE id = '1edca518-79db-49e2-afde-c5cc07ba731b';

-- Theatre Director (SOC 3416, confidence: high)
UPDATE public.career_roles SET
  soc_code_2020 = '3416',
  salary_entry = '£30,000',
  salary_experienced = '£51,500',
  salary_median_scotland = 36000,
  salary_entry_uk = 30000,
  salary_median_uk = 39500,
  salary_experienced_uk = 51500,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14.',
  salary_last_updated = CURRENT_DATE
WHERE id = 'ba72e58e-d9ca-4400-bee1-47424d2078dc';

-- Virtual Production Technician (SOC 3417, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '3417',
  salary_entry = '£24,000',
  salary_experienced = '£36,000',
  salary_median_scotland = 30000,
  salary_entry_uk = 24000,
  salary_median_uk = 30500,
  salary_experienced_uk = 36000,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14.',
  salary_last_updated = CURRENT_DATE
WHERE id = '1b44045b-29e1-4ac7-bece-8767acf61986';

-- Administrative Assistant (SOC 4159, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '4159',
  salary_entry = '£13,500',
  salary_experienced = '£30,000',
  salary_median_scotland = 25500,
  salary_entry_uk = 13500,
  salary_median_uk = 23500,
  salary_experienced_uk = 30000,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14. Scotland median pay for this role is competitive with or above the UK average (approx. +9%), likely driven by sector demand.',
  salary_last_updated = CURRENT_DATE
WHERE id = '60698092-2b21-43ce-b178-03e166706530';

-- AI Policy Analyst (SOC 2439, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '2439',
  salary_entry = '£41,000',
  salary_experienced = '£66,500',
  salary_median_scotland = 43000,
  salary_entry_uk = 41000,
  salary_median_uk = 55000,
  salary_experienced_uk = 66500,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14. Scotland median pay for this role is typically 22% below the UK average. London-based roles may pay significantly more.',
  salary_last_updated = CURRENT_DATE
WHERE id = 'ba5ebd4d-750d-4c03-9cc7-44f132891c0d';

-- Council Officer / Benefits Officer (SOC 3560, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '3560',
  salary_entry = '£31,500',
  salary_experienced = '£45,000',
  salary_median_scotland = 37000,
  salary_entry_uk = 31500,
  salary_median_uk = 38500,
  salary_experienced_uk = 45000,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14.',
  salary_last_updated = CURRENT_DATE
WHERE id = '21659c98-6477-4da4-80cc-a1f205494454';

-- Digital Transformation Manager (SOC 2132, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '2132',
  salary_entry = '£43,000',
  salary_experienced = '£73,000',
  salary_median_scotland = 52000,
  salary_entry_uk = 43000,
  salary_median_uk = 55500,
  salary_experienced_uk = 73000,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14.',
  salary_last_updated = CURRENT_DATE
WHERE id = 'c661da81-b94a-4a61-b067-fb932cf5b5a8';

-- Government Chief AI Officer (SOC 1137, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '1137',
  salary_entry = '£66,000',
  salary_experienced = '£116,500',
  salary_median_scotland = NULL,
  salary_entry_uk = 66000,
  salary_median_uk = 90000,
  salary_experienced_uk = 116500,
  salary_source = 'ONS ASHE 2025 (UK fallback — Scotland data suppressed)',
  salary_needs_verification = true,
  salary_notes = 'Scotland-specific figures suppressed in ASHE 2025; UK figures used. Review against SDS Labour Market Insights before pilot.',
  salary_last_updated = CURRENT_DATE
WHERE id = '6e11576d-fd78-43a2-b7ef-bdaabc6a186f';

-- HR Administrator (SOC 4136, confidence: high)
UPDATE public.career_roles SET
  soc_code_2020 = '4136',
  salary_entry = '£20,500',
  salary_experienced = '£29,000',
  salary_median_scotland = 26000,
  salary_entry_uk = 20500,
  salary_median_uk = 25500,
  salary_experienced_uk = 29000,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14.',
  salary_last_updated = CURRENT_DATE
WHERE id = '6653bd1f-b2a7-4461-bfa7-eaffeaaa9207';

-- i.AI Prototyping Specialist (SOC 2134, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '2134',
  salary_entry = '£41,000',
  salary_experienced = '£75,000',
  salary_median_scotland = 47500,
  salary_entry_uk = 41000,
  salary_median_uk = 55500,
  salary_experienced_uk = 75000,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14. Scotland median pay for this role is typically 14% below the UK average. London-based roles may pay significantly more.',
  salary_last_updated = CURRENT_DATE
WHERE id = '3fbee72a-01f8-4e21-978a-934fcecab9a1';

-- Policy Analyst / Civil Servant (Fast Stream) (SOC 2439, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '2439',
  salary_entry = '£41,000',
  salary_experienced = '£66,500',
  salary_median_scotland = 43000,
  salary_entry_uk = 41000,
  salary_median_uk = 55000,
  salary_experienced_uk = 66500,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14. Scotland median pay for this role is typically 22% below the UK average. London-based roles may pay significantly more.',
  salary_last_updated = CURRENT_DATE
WHERE id = '72507b69-9a99-4d28-bab4-612b43fdcaf4';

-- Public Sector AI Adoption Specialist (SOC 2431, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '2431',
  salary_entry = '£38,000',
  salary_experienced = '£68,500',
  salary_median_scotland = 44000,
  salary_entry_uk = 38000,
  salary_median_uk = 51500,
  salary_experienced_uk = 68500,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14. Scotland median pay for this role is typically 15% below the UK average. London-based roles may pay significantly more.',
  salary_last_updated = CURRENT_DATE
WHERE id = 'bd1dc7f4-532b-4205-92c4-cb669df799aa';

-- TechTrack Apprentice (SOC 3131, confidence: low)
UPDATE public.career_roles SET
  soc_code_2020 = '3131',
  salary_entry = '£28,000',
  salary_experienced = '£44,000',
  salary_median_scotland = 36000,
  salary_entry_uk = 28000,
  salary_median_uk = 34500,
  salary_experienced_uk = 44000,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = true,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14. SOC mapping confidence: low. Verify SOC 3131 is appropriate for this role.',
  salary_last_updated = CURRENT_DATE
WHERE id = '6a51880f-5d6c-4c6e-a3dc-50283956a8bb';

-- AI-Assisted Customer Experience Manager (SOC 4143, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '4143',
  salary_entry = '£23,500',
  salary_experienced = '£46,000',
  salary_median_scotland = NULL,
  salary_entry_uk = 23500,
  salary_median_uk = 33000,
  salary_experienced_uk = 46000,
  salary_source = 'ONS ASHE 2025 (UK fallback — Scotland data suppressed)',
  salary_needs_verification = true,
  salary_notes = 'Scotland-specific figures suppressed in ASHE 2025; UK figures used. Review against SDS Labour Market Insights before pilot.',
  salary_last_updated = CURRENT_DATE
WHERE id = 'cbbf7e45-4dfa-4a09-aba2-fc829df1b73e';

-- Chatbot / AI System Trainer (SOC 2139, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '2139',
  salary_entry = '£36,000',
  salary_experienced = '£69,000',
  salary_median_scotland = 40500,
  salary_entry_uk = 36000,
  salary_median_uk = 50500,
  salary_experienced_uk = 69000,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14. Scotland median pay for this role is typically 20% below the UK average. London-based roles may pay significantly more.',
  salary_last_updated = CURRENT_DATE
WHERE id = '8b5c7406-3c38-44f8-a401-a1456d514d41';

-- Customer Service Advisor (Call Centre) (SOC 7211, confidence: high)
UPDATE public.career_roles SET
  soc_code_2020 = '7211',
  salary_entry = '£20,500',
  salary_experienced = '£30,000',
  salary_median_scotland = 25500,
  salary_entry_uk = 20500,
  salary_median_uk = 25500,
  salary_experienced_uk = 30000,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14.',
  salary_last_updated = CURRENT_DATE
WHERE id = '70f04b10-b570-4850-81a5-03316b58b5a0';

-- E-commerce Personalisation Specialist (SOC 3554, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '3554',
  salary_entry = '£24,000',
  salary_experienced = '£39,000',
  salary_median_scotland = 28500,
  salary_entry_uk = 24000,
  salary_median_uk = 30500,
  salary_experienced_uk = 39000,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14.',
  salary_last_updated = CURRENT_DATE
WHERE id = '4679306e-b13c-4501-ab6c-99cb8623e852';

-- E-commerce Specialist (SOC 3554, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '3554',
  salary_entry = '£24,000',
  salary_experienced = '£39,000',
  salary_median_scotland = 28500,
  salary_entry_uk = 24000,
  salary_median_uk = 30500,
  salary_experienced_uk = 39000,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14.',
  salary_last_updated = CURRENT_DATE
WHERE id = '9b370e2e-380d-4dfa-9e8e-4cbff7ea6670';

-- Retail Data / AI Analyst (SOC 3544, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '3544',
  salary_entry = '£30,000',
  salary_experienced = '£46,000',
  salary_median_scotland = NULL,
  salary_entry_uk = 30000,
  salary_median_uk = 38000,
  salary_experienced_uk = 46000,
  salary_source = 'ONS ASHE 2025 (UK fallback — Scotland data suppressed)',
  salary_needs_verification = true,
  salary_notes = 'Scotland-specific figures suppressed in ASHE 2025; UK figures used. Review against SDS Labour Market Insights before pilot.',
  salary_last_updated = CURRENT_DATE
WHERE id = 'cee81768-07ae-4289-a7b7-4f15da639695';

-- Retail Manager (SOC 1150, confidence: high)
UPDATE public.career_roles SET
  soc_code_2020 = '1150',
  salary_entry = '£27,500',
  salary_experienced = '£50,000',
  salary_median_scotland = 34500,
  salary_entry_uk = 27500,
  salary_median_uk = 36000,
  salary_experienced_uk = 50000,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14.',
  salary_last_updated = CURRENT_DATE
WHERE id = '42115a8f-e7ab-4c78-b802-c9d676b82a0e';

-- Shop Assistant / Sales Associate (SOC 7111, confidence: high)
UPDATE public.career_roles SET
  soc_code_2020 = '7111',
  salary_entry = '£12,000',
  salary_experienced = '£22,000',
  salary_median_scotland = 13500,
  salary_entry_uk = 12000,
  salary_median_uk = 14500,
  salary_experienced_uk = 22000,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14.',
  salary_last_updated = CURRENT_DATE
WHERE id = '24c53f98-8be2-40bc-be55-b488e4764105';

-- Supply Chain Coordinator (SOC 1243, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '1243',
  salary_entry = '£36,500',
  salary_experienced = '£59,500',
  salary_median_scotland = NULL,
  salary_entry_uk = 36500,
  salary_median_uk = 45000,
  salary_experienced_uk = 59500,
  salary_source = 'ONS ASHE 2025 (UK fallback — Scotland data suppressed)',
  salary_needs_verification = true,
  salary_notes = 'Scotland-specific figures suppressed in ASHE 2025; UK figures used. Review against SDS Labour Market Insights before pilot.',
  salary_last_updated = CURRENT_DATE
WHERE id = 'e98ea33e-ddc9-49b3-b9e3-891829d3d994';

-- Visual Merchandiser (SOC 7125, confidence: high)
UPDATE public.career_roles SET
  soc_code_2020 = '7125',
  salary_median_scotland = NULL,
  salary_entry_uk = NULL,
  salary_median_uk = 25500,
  salary_experienced_uk = NULL,
  salary_source = 'ONS ASHE 2025 (UK — partial data)',
  salary_needs_verification = true,
  salary_notes = 'Only partial ASHE data available for this SOC code. Some salary percentiles suppressed due to sample size. Manual review recommended.',
  salary_last_updated = CURRENT_DATE
WHERE id = '48987f33-bfd2-400e-9c33-4970d7902746';

-- AI Drug Discovery Scientist (SOC 2113, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '2113',
  salary_entry = '£35,000',
  salary_experienced = '£54,500',
  salary_median_scotland = 39500,
  salary_entry_uk = 35000,
  salary_median_uk = 45500,
  salary_experienced_uk = 54500,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14. Scotland median pay for this role is typically 13% below the UK average. London-based roles may pay significantly more.',
  salary_last_updated = CURRENT_DATE
WHERE id = '0cbac2ba-b43e-434a-b325-55e15d1b9487';

-- AI Safety Researcher (Scientific) (SOC 2162, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '2162',
  salary_entry = '£38,000',
  salary_median_scotland = 39500,
  salary_entry_uk = 38000,
  salary_median_uk = 42500,
  salary_experienced_uk = NULL,
  salary_source = 'ONS ASHE 2025 (UK — partial data)',
  salary_needs_verification = true,
  salary_notes = 'Only partial ASHE data available for this SOC code. Some salary percentiles suppressed due to sample size. Manual review recommended.',
  salary_last_updated = CURRENT_DATE
WHERE id = 'ad6a4779-f954-4f0f-ad4e-277797d38800';

-- Bioinformatics Specialist (SOC 2113, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '2113',
  salary_entry = '£35,000',
  salary_experienced = '£54,500',
  salary_median_scotland = 39500,
  salary_entry_uk = 35000,
  salary_median_uk = 45500,
  salary_experienced_uk = 54500,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14. Scotland median pay for this role is typically 13% below the UK average. London-based roles may pay significantly more.',
  salary_last_updated = CURRENT_DATE
WHERE id = '483ab5c8-1865-485b-81e8-1d52d6fe70e5';

-- Clinical Researcher (SOC 2162, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '2162',
  salary_entry = '£38,000',
  salary_median_scotland = 39500,
  salary_entry_uk = 38000,
  salary_median_uk = 42500,
  salary_experienced_uk = NULL,
  salary_source = 'ONS ASHE 2025 (UK — partial data)',
  salary_needs_verification = true,
  salary_notes = 'Only partial ASHE data available for this SOC code. Some salary percentiles suppressed due to sample size. Manual review recommended.',
  salary_last_updated = CURRENT_DATE
WHERE id = 'fc4b5e5e-38a8-4e1a-858d-f0c81585d8bc';

-- Computational Scientist (SOC 2114, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '2114',
  salary_entry = '£42,500',
  salary_median_scotland = NULL,
  salary_entry_uk = 42500,
  salary_median_uk = 53000,
  salary_experienced_uk = NULL,
  salary_source = 'ONS ASHE 2025 (UK — partial data)',
  salary_needs_verification = true,
  salary_notes = 'Only partial ASHE data available for this SOC code. Some salary percentiles suppressed due to sample size. Manual review recommended.',
  salary_last_updated = CURRENT_DATE
WHERE id = '2359916e-a323-4904-88c0-9443cf8d62da';

-- Data Scientist (SOC 2433, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '2433',
  salary_entry = '£41,500',
  salary_experienced = '£73,500',
  salary_median_scotland = NULL,
  salary_entry_uk = 41500,
  salary_median_uk = 51500,
  salary_experienced_uk = 73500,
  salary_source = 'ONS ASHE 2025 (UK fallback — Scotland data suppressed)',
  salary_needs_verification = true,
  salary_notes = 'Scotland-specific figures suppressed in ASHE 2025; UK figures used. Review against SDS Labour Market Insights before pilot.',
  salary_last_updated = CURRENT_DATE
WHERE id = 'f49a9cdc-9123-410d-83b8-aa799fa393a0';

-- Environmental Scientist (SOC 2152, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '2152',
  salary_entry = '£32,500',
  salary_experienced = '£50,500',
  salary_median_scotland = 45500,
  salary_entry_uk = 32500,
  salary_median_uk = 41500,
  salary_experienced_uk = 50500,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14. Scotland median pay for this role is competitive with or above the UK average (approx. +10%), likely driven by sector demand.',
  salary_last_updated = CURRENT_DATE
WHERE id = '1a595140-0511-4443-9998-8be91b3cd02b';

-- Lab Technician (SOC 3111, confidence: high)
UPDATE public.career_roles SET
  soc_code_2020 = '3111',
  salary_entry = '£23,000',
  salary_experienced = '£32,500',
  salary_median_scotland = NULL,
  salary_entry_uk = 23000,
  salary_median_uk = 27000,
  salary_experienced_uk = 32500,
  salary_source = 'ONS ASHE 2025 (UK fallback — Scotland data suppressed)',
  salary_needs_verification = true,
  salary_notes = 'Scotland-specific figures suppressed in ASHE 2025; UK figures used. Review against SDS Labour Market Insights before pilot.',
  salary_last_updated = CURRENT_DATE
WHERE id = 'b01bbc32-43ce-4d0e-bfae-82ae2fa7e273';

-- Laboratory Automation Specialist (SOC 2129, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '2129',
  salary_entry = '£38,500',
  salary_experienced = '£61,000',
  salary_median_scotland = 46500,
  salary_entry_uk = 38500,
  salary_median_uk = 48000,
  salary_experienced_uk = 61000,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14.',
  salary_last_updated = CURRENT_DATE
WHERE id = '875c120d-4fd6-4895-b54b-9b8cf4cc71da';

-- Research Scientist (SOC 2162, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '2162',
  salary_entry = '£38,000',
  salary_median_scotland = 39500,
  salary_entry_uk = 38000,
  salary_median_uk = 42500,
  salary_experienced_uk = NULL,
  salary_source = 'ONS ASHE 2025 (UK — partial data)',
  salary_needs_verification = true,
  salary_notes = 'Only partial ASHE data available for this SOC code. Some salary percentiles suppressed due to sample size. Manual review recommended.',
  salary_last_updated = CURRENT_DATE
WHERE id = '701f27eb-f965-44df-b7b7-e38db56564a6';

-- Robotics Integration Engineer (SOC 2129, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '2129',
  salary_entry = '£38,500',
  salary_experienced = '£61,000',
  salary_median_scotland = 46500,
  salary_entry_uk = 38500,
  salary_median_uk = 48000,
  salary_experienced_uk = 61000,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14.',
  salary_last_updated = CURRENT_DATE
WHERE id = '4b17417a-150d-47a4-9aca-71726f8915d9';

-- Addiction Counsellor (SOC 3224, confidence: high)
UPDATE public.career_roles SET
  soc_code_2020 = '3224',
  salary_entry = '£18,500',
  salary_experienced = '£31,500',
  salary_median_scotland = NULL,
  salary_entry_uk = 18500,
  salary_median_uk = 27000,
  salary_experienced_uk = 31500,
  salary_source = 'ONS ASHE 2025 (UK fallback — Scotland data suppressed)',
  salary_needs_verification = true,
  salary_notes = 'Scotland-specific figures suppressed in ASHE 2025; UK figures used. Review against SDS Labour Market Insights before pilot.',
  salary_last_updated = CURRENT_DATE
WHERE id = 'e7a5e66a-0bba-4d97-a761-4efc3e07c65d';

-- Charity Manager (SOC 1135, confidence: high)
UPDATE public.career_roles SET
  soc_code_2020 = '1135',
  salary_needs_verification = true,
  salary_notes = 'No ASHE 2025 data available for SOC 1135 (Charitable organisation managers and directors). Existing salary estimates retained. Manual review required.',
  salary_last_updated = CURRENT_DATE
WHERE id = 'd588f5fe-41fc-4881-9b79-962290ed0666';

-- Community Development Worker (SOC 3221, confidence: high)
UPDATE public.career_roles SET
  soc_code_2020 = '3221',
  salary_entry = '£18,500',
  salary_experienced = '£35,000',
  salary_median_scotland = 29000,
  salary_entry_uk = 18500,
  salary_median_uk = 27500,
  salary_experienced_uk = 35000,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14. Scotland median pay for this role is competitive with or above the UK average (approx. +5%), likely driven by sector demand.',
  salary_last_updated = CURRENT_DATE
WHERE id = '8a47f2a9-2511-45aa-8a3b-059ee666157e';

-- Digital Inclusion Worker (SOC 3229, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '3229',
  salary_entry = '£19,500',
  salary_experienced = '£33,000',
  salary_median_scotland = 28500,
  salary_entry_uk = 19500,
  salary_median_uk = 26500,
  salary_experienced_uk = 33000,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14. Scotland median pay for this role is competitive with or above the UK average (approx. +8%), likely driven by sector demand.',
  salary_last_updated = CURRENT_DATE
WHERE id = 'd28cc237-cdd3-42c9-91d8-7d6990351e1e';

-- Family Support Worker (SOC 3229, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '3229',
  salary_entry = '£19,500',
  salary_experienced = '£33,000',
  salary_median_scotland = 28500,
  salary_entry_uk = 19500,
  salary_median_uk = 26500,
  salary_experienced_uk = 33000,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14. Scotland median pay for this role is competitive with or above the UK average (approx. +8%), likely driven by sector demand.',
  salary_last_updated = CURRENT_DATE
WHERE id = '315bd11a-7122-4d12-9cbc-7d78c9b736c1';

-- Homelessness Support Worker (SOC 3229, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '3229',
  salary_entry = '£19,500',
  salary_experienced = '£33,000',
  salary_median_scotland = 28500,
  salary_entry_uk = 19500,
  salary_median_uk = 26500,
  salary_experienced_uk = 33000,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14. Scotland median pay for this role is competitive with or above the UK average (approx. +8%), likely driven by sector demand.',
  salary_last_updated = CURRENT_DATE
WHERE id = '812b84df-c72c-4e88-9d95-f21e75ea83f6';

-- Mental Health Support Worker (SOC 3229, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '3229',
  salary_entry = '£19,500',
  salary_experienced = '£33,000',
  salary_median_scotland = 28500,
  salary_entry_uk = 19500,
  salary_median_uk = 26500,
  salary_experienced_uk = 33000,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14. Scotland median pay for this role is competitive with or above the UK average (approx. +8%), likely driven by sector demand.',
  salary_last_updated = CURRENT_DATE
WHERE id = '2227610c-d32d-4eae-b0a5-2d733e43fb6b';

-- Social Services Data Analyst (SOC 3544, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '3544',
  salary_entry = '£30,000',
  salary_experienced = '£46,000',
  salary_median_scotland = NULL,
  salary_entry_uk = 30000,
  salary_median_uk = 38000,
  salary_experienced_uk = 46000,
  salary_source = 'ONS ASHE 2025 (UK fallback — Scotland data suppressed)',
  salary_needs_verification = true,
  salary_notes = 'Scotland-specific figures suppressed in ASHE 2025; UK figures used. Review against SDS Labour Market Insights before pilot.',
  salary_last_updated = CURRENT_DATE
WHERE id = 'd3a0972d-ee95-44e1-bb5a-069b2762807f';

-- Social Worker (SOC 2461, confidence: high)
UPDATE public.career_roles SET
  soc_code_2020 = '2461',
  salary_entry = '£36,000',
  salary_experienced = '£49,000',
  salary_median_scotland = 44500,
  salary_entry_uk = 36000,
  salary_median_uk = 42500,
  salary_experienced_uk = 49000,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14.',
  salary_last_updated = CURRENT_DATE
WHERE id = '9428b809-d630-4ecf-841a-29080bbda1fb';

-- Youth Worker (SOC 3221, confidence: high)
UPDATE public.career_roles SET
  soc_code_2020 = '3221',
  salary_entry = '£18,500',
  salary_experienced = '£35,000',
  salary_median_scotland = 29000,
  salary_entry_uk = 18500,
  salary_median_uk = 27500,
  salary_experienced_uk = 35000,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14. Scotland median pay for this role is competitive with or above the UK average (approx. +5%), likely driven by sector demand.',
  salary_last_updated = CURRENT_DATE
WHERE id = 'eb13fc72-2961-4e36-ad41-e6f16290a397';

-- AI-Enhanced Performance Coach (SOC 3432, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '3432',
  salary_entry = '£12,000',
  salary_experienced = '£25,000',
  salary_median_scotland = NULL,
  salary_entry_uk = 12000,
  salary_median_uk = 12500,
  salary_experienced_uk = 25000,
  salary_source = 'ONS ASHE 2025 (UK fallback — Scotland data suppressed)',
  salary_needs_verification = true,
  salary_notes = 'Scotland-specific figures suppressed in ASHE 2025; UK figures used. Review against SDS Labour Market Insights before pilot.',
  salary_last_updated = CURRENT_DATE
WHERE id = '55b08868-564e-40b2-bedf-279d3c6e9028';

-- Digital Fitness Content Creator (SOC 3433, confidence: low)
UPDATE public.career_roles SET
  soc_code_2020 = '3433',
  salary_needs_verification = true,
  salary_notes = 'No ASHE 2025 data available for SOC 3433 (Fitness and wellbeing instructors). Existing salary estimates retained. Manual review required. SOC mapping confidence: low.',
  salary_last_updated = CURRENT_DATE
WHERE id = '05c2c546-5e26-41ee-a621-b3bc0ea1d657';

-- E-sports / Gaming Coach (SOC 3432, confidence: low)
UPDATE public.career_roles SET
  soc_code_2020 = '3432',
  salary_entry = '£12,000',
  salary_experienced = '£25,000',
  salary_median_scotland = NULL,
  salary_entry_uk = 12000,
  salary_median_uk = 12500,
  salary_experienced_uk = 25000,
  salary_source = 'ONS ASHE 2025 (UK fallback — Scotland data suppressed)',
  salary_needs_verification = true,
  salary_notes = 'Scotland-specific figures suppressed in ASHE 2025; UK figures used. Review against SDS Labour Market Insights before pilot. SOC mapping confidence: low. Verify SOC 3432 is appropriate for this role.',
  salary_last_updated = CURRENT_DATE
WHERE id = 'bdcb58b1-7d9d-46c1-9a7c-378a4c3358a4';

-- Fitness Instructor / Personal Trainer (SOC 3433, confidence: high)
UPDATE public.career_roles SET
  soc_code_2020 = '3433',
  salary_needs_verification = true,
  salary_notes = 'No ASHE 2025 data available for SOC 3433 (Fitness and wellbeing instructors). Existing salary estimates retained. Manual review required.',
  salary_last_updated = CURRENT_DATE
WHERE id = '36cce48f-315a-4e2d-b86b-ce332c4267e2';

-- Leisure Centre Manager (SOC 1224, confidence: high)
UPDATE public.career_roles SET
  soc_code_2020 = '1224',
  salary_entry = '£25,500',
  salary_experienced = '£42,000',
  salary_median_scotland = 30000,
  salary_entry_uk = 25500,
  salary_median_uk = 33500,
  salary_experienced_uk = 42000,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14. Scotland median pay for this role is typically 10% below the UK average. London-based roles may pay significantly more.',
  salary_last_updated = CURRENT_DATE
WHERE id = 'd6af9b1a-c21b-42e7-8c27-277b9e1399b1';

-- Outdoor Activities Instructor (SOC 3432, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '3432',
  salary_entry = '£12,000',
  salary_experienced = '£25,000',
  salary_median_scotland = NULL,
  salary_entry_uk = 12000,
  salary_median_uk = 12500,
  salary_experienced_uk = 25000,
  salary_source = 'ONS ASHE 2025 (UK fallback — Scotland data suppressed)',
  salary_needs_verification = true,
  salary_notes = 'Scotland-specific figures suppressed in ASHE 2025; UK figures used. Review against SDS Labour Market Insights before pilot.',
  salary_last_updated = CURRENT_DATE
WHERE id = '37ebcde8-b721-40f2-9298-3cebc46a1389';

-- PE Teacher (SOC 2313, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '2313',
  salary_entry = '£33,500',
  salary_experienced = '£52,000',
  salary_median_scotland = 49500,
  salary_entry_uk = 33500,
  salary_median_uk = 44000,
  salary_experienced_uk = 52000,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14. Scotland median pay for this role is competitive with or above the UK average (approx. +12%), likely driven by sector demand.',
  salary_last_updated = CURRENT_DATE
WHERE id = '03b64e4e-df23-4c2a-b42e-505afdd4f697';

-- Sports Coach (SOC 3432, confidence: high)
UPDATE public.career_roles SET
  soc_code_2020 = '3432',
  salary_entry = '£12,000',
  salary_experienced = '£25,000',
  salary_median_scotland = NULL,
  salary_entry_uk = 12000,
  salary_median_uk = 12500,
  salary_experienced_uk = 25000,
  salary_source = 'ONS ASHE 2025 (UK fallback — Scotland data suppressed)',
  salary_needs_verification = true,
  salary_notes = 'Scotland-specific figures suppressed in ASHE 2025; UK figures used. Review against SDS Labour Market Insights before pilot.',
  salary_last_updated = CURRENT_DATE
WHERE id = '0e034ee9-baa0-48f3-ae0e-6e3472581adb';

-- Sports Data Analyst (SOC 3544, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '3544',
  salary_entry = '£30,000',
  salary_experienced = '£46,000',
  salary_median_scotland = NULL,
  salary_entry_uk = 30000,
  salary_median_uk = 38000,
  salary_experienced_uk = 46000,
  salary_source = 'ONS ASHE 2025 (UK fallback — Scotland data suppressed)',
  salary_needs_verification = true,
  salary_notes = 'Scotland-specific figures suppressed in ASHE 2025; UK figures used. Review against SDS Labour Market Insights before pilot.',
  salary_last_updated = CURRENT_DATE
WHERE id = '2dd98b59-0f78-433c-aeb8-b11bc1b31562';

-- Sports Therapist (SOC 2229, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '2229',
  salary_entry = '£25,000',
  salary_experienced = '£45,000',
  salary_median_scotland = NULL,
  salary_entry_uk = 25000,
  salary_median_uk = 32500,
  salary_experienced_uk = 45000,
  salary_source = 'ONS ASHE 2025 (UK fallback — Scotland data suppressed)',
  salary_needs_verification = true,
  salary_notes = 'Scotland-specific figures suppressed in ASHE 2025; UK figures used. Review against SDS Labour Market Insights before pilot.',
  salary_last_updated = CURRENT_DATE
WHERE id = 'b6c398ad-08e4-42a5-870b-a1251ebcfce6';

-- Wearable Technology Specialist (SOC 3549, confidence: low)
UPDATE public.career_roles SET
  soc_code_2020 = '3549',
  salary_entry = '£25,500',
  salary_experienced = '£43,500',
  salary_median_scotland = 38000,
  salary_entry_uk = 25500,
  salary_median_uk = 33000,
  salary_experienced_uk = 43500,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = true,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14. Scotland median pay for this role is competitive with or above the UK average (approx. +15%), likely driven by sector demand. SOC mapping confidence: low. Verify SOC 3549 is appropriate for this role.',
  salary_last_updated = CURRENT_DATE
WHERE id = 'cebe2235-5dae-4c9c-aeb8-9592b028c94f';

-- AI Logistics Analyst (SOC 3544, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '3544',
  salary_entry = '£30,000',
  salary_experienced = '£46,000',
  salary_median_scotland = NULL,
  salary_entry_uk = 30000,
  salary_median_uk = 38000,
  salary_experienced_uk = 46000,
  salary_source = 'ONS ASHE 2025 (UK fallback — Scotland data suppressed)',
  salary_needs_verification = true,
  salary_notes = 'Scotland-specific figures suppressed in ASHE 2025; UK figures used. Review against SDS Labour Market Insights before pilot.',
  salary_last_updated = CURRENT_DATE
WHERE id = '3673999b-8ea9-4b21-afd2-e259c77ca93a';

-- AV Fleet Operations Manager (SOC 1241, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '1241',
  salary_entry = '£36,500',
  salary_experienced = '£61,500',
  salary_median_scotland = 47500,
  salary_entry_uk = 36500,
  salary_median_uk = 46500,
  salary_experienced_uk = 61500,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14.',
  salary_last_updated = CURRENT_DATE
WHERE id = 'c7428ccd-e944-4a36-819e-3f12cf110d04';

-- Delivery Driver (SOC 8214, confidence: high)
UPDATE public.career_roles SET
  soc_code_2020 = '8214',
  salary_entry = '£15,000',
  salary_experienced = '£30,500',
  salary_median_scotland = 21500,
  salary_entry_uk = 15000,
  salary_median_uk = 24500,
  salary_experienced_uk = 30500,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14. Scotland median pay for this role is typically 12% below the UK average. London-based roles may pay significantly more.',
  salary_last_updated = CURRENT_DATE
WHERE id = '68b699de-7aa2-43d4-a056-92512932a833';

-- Digital Supply Chain Manager (SOC 1243, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '1243',
  salary_entry = '£36,500',
  salary_experienced = '£59,500',
  salary_median_scotland = NULL,
  salary_entry_uk = 36500,
  salary_median_uk = 45000,
  salary_experienced_uk = 59500,
  salary_source = 'ONS ASHE 2025 (UK fallback — Scotland data suppressed)',
  salary_needs_verification = true,
  salary_notes = 'Scotland-specific figures suppressed in ASHE 2025; UK figures used. Review against SDS Labour Market Insights before pilot.',
  salary_last_updated = CURRENT_DATE
WHERE id = 'ee67c3eb-d32a-4cfd-91ba-cee30c8cac13';

-- Drone Delivery Operator (SOC 8214, confidence: low)
UPDATE public.career_roles SET
  soc_code_2020 = '8214',
  salary_entry = '£15,000',
  salary_experienced = '£30,500',
  salary_median_scotland = 21500,
  salary_entry_uk = 15000,
  salary_median_uk = 24500,
  salary_experienced_uk = 30500,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = true,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14. Scotland median pay for this role is typically 12% below the UK average. London-based roles may pay significantly more. SOC mapping confidence: low. Verify SOC 8214 is appropriate for this role.',
  salary_last_updated = CURRENT_DATE
WHERE id = 'cab71f32-1729-4d37-be56-37eb0188e68e';

-- EV / AV Maintenance Technician (SOC 5231, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '5231',
  salary_entry = '£28,500',
  salary_experienced = '£44,500',
  salary_median_scotland = 36000,
  salary_entry_uk = 28500,
  salary_median_uk = 36500,
  salary_experienced_uk = 44500,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14.',
  salary_last_updated = CURRENT_DATE
WHERE id = '7c1c4e72-17ea-4707-90d1-33707e781841';

-- HGV Driver (SOC 8211, confidence: high)
UPDATE public.career_roles SET
  soc_code_2020 = '8211',
  salary_entry = '£32,500',
  salary_experienced = '£46,500',
  salary_median_scotland = 38000,
  salary_entry_uk = 32500,
  salary_median_uk = 39000,
  salary_experienced_uk = 46500,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14.',
  salary_last_updated = CURRENT_DATE
WHERE id = 'd606e62a-ac04-420d-9389-5214d6c188eb';

-- Logistics Coordinator (SOC 1243, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '1243',
  salary_entry = '£36,500',
  salary_experienced = '£59,500',
  salary_median_scotland = NULL,
  salary_entry_uk = 36500,
  salary_median_uk = 45000,
  salary_experienced_uk = 59500,
  salary_source = 'ONS ASHE 2025 (UK fallback — Scotland data suppressed)',
  salary_needs_verification = true,
  salary_notes = 'Scotland-specific figures suppressed in ASHE 2025; UK figures used. Review against SDS Labour Market Insights before pilot.',
  salary_last_updated = CURRENT_DATE
WHERE id = '3fe9b56f-f624-407d-8910-91eb5c6878e4';

-- Remote Vehicle Operator (SOC 8239, confidence: low)
UPDATE public.career_roles SET
  soc_code_2020 = '8239',
  salary_median_scotland = NULL,
  salary_entry_uk = NULL,
  salary_median_uk = 32000,
  salary_experienced_uk = NULL,
  salary_source = 'ONS ASHE 2025 (UK — partial data)',
  salary_needs_verification = true,
  salary_notes = 'Only partial ASHE data available for this SOC code. Some salary percentiles suppressed due to sample size. Manual review recommended. SOC mapping confidence: low. Verify SOC 8239 is appropriate.',
  salary_last_updated = CURRENT_DATE
WHERE id = '5bc5fe79-ee7e-4797-92dd-61284926341e';

-- Traffic Planner (SOC 2121, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '2121',
  salary_entry = '£39,000',
  salary_experienced = '£64,000',
  salary_median_scotland = 54500,
  salary_entry_uk = 39000,
  salary_median_uk = 50500,
  salary_experienced_uk = 64000,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14. Scotland median pay for this role is competitive with or above the UK average (approx. +8%), likely driven by sector demand.',
  salary_last_updated = CURRENT_DATE
WHERE id = '442d468d-1f78-4124-a5b0-5ab10daf8af1';

-- Train Driver (SOC 8231, confidence: high)
UPDATE public.career_roles SET
  soc_code_2020 = '8231',
  salary_entry = '£63,500',
  salary_experienced = '£82,000',
  salary_median_scotland = 70500,
  salary_entry_uk = 63500,
  salary_median_uk = 76000,
  salary_experienced_uk = 82000,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14.',
  salary_last_updated = CURRENT_DATE
WHERE id = '29bfa139-f12f-40c4-a788-5e09259931e6';

-- Warehouse Automation / Robotics Engineer (SOC 2129, confidence: medium)
UPDATE public.career_roles SET
  soc_code_2020 = '2129',
  salary_entry = '£38,500',
  salary_experienced = '£61,000',
  salary_median_scotland = 46500,
  salary_entry_uk = 38500,
  salary_median_uk = 48000,
  salary_experienced_uk = 61000,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14.',
  salary_last_updated = CURRENT_DATE
WHERE id = '7d78a078-86e2-46d0-adfb-32e95058bb07';

-- Warehouse Operative (SOC 9252, confidence: high)
UPDATE public.career_roles SET
  soc_code_2020 = '9252',
  salary_entry = '£22,000',
  salary_experienced = '£32,000',
  salary_median_scotland = 26500,
  salary_entry_uk = 22000,
  salary_median_uk = 26500,
  salary_experienced_uk = 32000,
  salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles)',
  salary_needs_verification = false,
  salary_notes = 'Scotland ASHE Table 15 provides median only (p25/p75 suppressed). Entry and experienced figures use UK-wide percentiles from Table 14.',
  salary_last_updated = CURRENT_DATE
WHERE id = 'fc77f34e-72fe-4e37-9078-6557cc4991c1';

COMMIT;