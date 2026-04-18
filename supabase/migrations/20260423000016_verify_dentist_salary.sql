-- Dentist salary verification against NHS Scotland sources
-- Entry: GBP 37,000 -> GBP 39,603 (DVT Year 1 Scotland, 2026/27, PCS(DD) pay circular)
-- Experienced: GBP 90,000 -> GBP 90,600 (NHS Digital Dental Earnings & Expenses 2023/24 Scotland self-employed average taxable income)
-- Also: refresh source, clear needs_verification flag, update last_updated

UPDATE career_roles
SET
  salary_entry = 39603,
  salary_experienced = 90600,
  salary_source = 'NHS Scotland DVT Year 1 (GBP 39,603, 2026/27, PCS(DD) circular) for entry; NHS Digital Dental Earnings & Expenses 2023/24 Scotland self-employed average taxable income (GBP 90,600) for experienced',
  salary_last_updated = '2026-04-18',
  salary_needs_verification = false,
  salary_notes = 'Entry figure is the NHS Scotland Dental Vocational Trainee Year 1 salary effective 1 April 2026 (GBP 39,603), set by the Scottish PCS(DD) pay circular -- the Scottish equivalent of the DFT/DCT route. Experienced figure is the NHS Digital Dental Earnings & Expenses Scotland 2023/24 average taxable income for self-employed dentists (Principal and Associate combined), which mixes NHS item-of-service fees with private practice and is the most authoritative cross-practice figure available. Salaried PDS Band A tops out around GBP 112k and consultant dental reaches c. GBP 125k, but these cover a minority of the workforce so GBP 90.6k is the representative mid-to-senior figure. Verify annually against the NHS Digital publication and against the latest PCS(DD) circular.'
WHERE title = 'Dentist' AND soc_code_2020 = '2253';
