-- Split "Physiotherapist / Paramedic" merged row into Physiotherapist only.
-- Paramedic is seeded as a new row in migration 20260419000004_seed_batch1_career_roles.sql.
UPDATE career_roles SET
  title                  = 'Physiotherapist',
  soc_code_2020          = '2221',
  ai_rating              = 3,
  ai_description         = 'AI supports exercise prescription, rehabilitation outcome tracking, and movement analysis tools. Digital physiotherapy platforms automate home exercise delivery and monitor adherence. Manual therapy assessment, clinical reasoning, and the therapeutic relationship remain fundamentally human. Scottish AHP workforce shortfall sustains strong demand across NHS Scotland, private practice, and community rehabilitation services.',
  growth_outlook         = 'Stable -- HCPC-regulated AHP with NHS Scotland demand',
  salary_entry           = 33315,
  salary_experienced     = 41483,
  salary_median_scotland = NULL,
  salary_entry_uk        = 29500,
  salary_median_uk       = 38000,
  salary_experienced_uk  = 46000,
  salary_source          = 'NHS Scotland AfC 2025/26 Band 5 entry; Band 6 top-point for experienced; ONS ASHE 2025 Table 14 SOC 2221 for UK percentiles',
  salary_last_updated    = '2026-04-19',
  salary_needs_verification = true,
  salary_notes           = 'NHS Scotland AfC 2025/26 applied 4.4 percent uplift. Entry is Band 5 newly qualified (GBP 33,315); progresses to Band 6 top-point (GBP 41,483) with experience. Advanced Practice and Specialist Physiotherapist roles reach Band 7 (GBP 48,000-57,000). HCPC-registered; training via Queen Margaret University Edinburgh, Glasgow Caledonian, Robert Gordon Aberdeen. ONS ASHE 2025 Table 14 SOC 2221 UK percentiles used; Scotland ASHE Table 15 median suppressed for this SOC -- salary_median_scotland set null pending verification. Paramedic row seeded separately in Batch 1 (SOC 2255, Band 5/6 NHS Scotland AfC).'
WHERE id = '400bef8c-cad5-4c06-a37a-6b47a790b1df';
