-- Round 1 careers expansion: Healthcare & Medicine (+3 roles)
-- Source research: docs/research/round1/healthcare-medicine.md
-- Salary source: ONS ASHE 2025 (scripts/ashe/ashe-2025-scotland.json, ashe-2025-uk.json)

INSERT INTO public.career_roles (
  career_sector_id, title, ai_rating, ai_description,
  is_new_ai_role, growth_outlook,
  soc_code_2020, salary_entry, salary_experienced,
  salary_median_scotland, salary_entry_uk, salary_median_uk, salary_experienced_uk,
  salary_source, salary_last_updated, salary_needs_verification, salary_notes
) VALUES (
  '8e706fbe-1f19-4156-80a1-631faf1c211c',
  'Dentist',
  5,
  'Dentists diagnose and treat problems with teeth, gums and the mouth, carrying out fillings, extractions, root canals, crowns and preventive care, and referring more complex cases to dental specialists. Entry in Scotland is a 5-year Bachelor of Dental Surgery (BDS) at Dundee or Glasgow, followed by 1 year of Dental Foundation Training in an NHS practice, after which registration with the General Dental Council (GDC) is required to use the title and practise legally. Scottish dentists split their time between NHS work (paid partly on item-of-service fees with a shortage-list recruitment premium) and private practice, where earnings are substantially higher.',
  false,
  'Growing',
  '2253',
  37000,
  90000,
  NULL,
  NULL,
  NULL,
  NULL,
  'Manual estimate -- awaiting ASHE mapping or SDS LMI verification',
  CURRENT_DATE,
  true,
  'SOC 2253 (Dental practitioners) confirmed but ONS ASHE 2025 has suppressed all Scotland and UK percentiles (p25/p50/p75 all null), so AfC Task 4.1 x1.5 rule could not be applied. Manual estimate: entry (37000) uses NHS Scotland Dental Foundation Trainee year 1 salary; experienced (90000) reflects a typical associate or principal dentist mixing NHS item-of-service fees with private practice. NHS-only dentists on Agenda for Change or PCA contracts earn materially less than private practitioners; senior specialists (orthodontics, oral surgery) and practice owners can exceed GBP 120k. Verify against BDA and NHS Scotland dental workforce pay data at next review.'
);

INSERT INTO public.career_roles (
  career_sector_id, title, ai_rating, ai_description,
  is_new_ai_role, growth_outlook,
  soc_code_2020, salary_entry, salary_experienced,
  salary_median_scotland, salary_entry_uk, salary_median_uk, salary_experienced_uk,
  salary_source, salary_last_updated, salary_needs_verification, salary_notes
) VALUES (
  '8e706fbe-1f19-4156-80a1-631faf1c211c',
  'Midwife',
  5,
  'Midwives lead the care of women through pregnancy, labour and the first weeks after birth, running antenatal clinics, supporting deliveries in hospital and at home, spotting complications early, and safeguarding mother and baby. Entry in Scotland is a 3-year BSc (Hons) Midwifery at Edinburgh Napier, Robert Gordon, Dundee, Glasgow Caledonian, Stirling or the University of the West of Scotland, leading to registration with the Nursing and Midwifery Council (NMC) as a separately regulated profession from nursing. NHS Scotland has named midwifery as a long-standing workforce shortage and the role is on Agenda for Change Band 5 at entry, progressing to Band 7 for consultant and specialist midwives.',
  false,
  'Growing',
  '2231',
  29000,
  48000,
  37500,
  29000,
  39500,
  48000,
  'ONS ASHE 2025 (Scotland median + UK percentiles)',
  CURRENT_DATE,
  true,
  'SOC 2231 (Midwifery nurses) confirmed. Scotland p25 and p75 suppressed by ONS; UK p25 (29055) and UK p75 (47780) used as fallback for entry and experienced, rounded to nearest GBP 500. NHS Scotland midwives on Agenda for Change Band 5 at entry (approx GBP 31k) progressing through bands to Band 7 (approx GBP 48k plus) for specialist and consultant midwives. ASHE figures represent the cross-employer average; NHS-specific AfC pay bands may differ. Flagged for verification against NHS Scotland workforce data.'
);

INSERT INTO public.career_roles (
  career_sector_id, title, ai_rating, ai_description,
  is_new_ai_role, growth_outlook,
  soc_code_2020, salary_entry, salary_experienced,
  salary_median_scotland, salary_entry_uk, salary_median_uk, salary_experienced_uk,
  salary_source, salary_last_updated, salary_needs_verification, salary_notes
) VALUES (
  '8e706fbe-1f19-4156-80a1-631faf1c211c',
  'Occupational Therapist',
  4,
  'Occupational therapists help people of all ages do the everyday activities that matter to them - washing, dressing, cooking, working, going to school - after illness, injury, disability or mental ill health, often prescribing adaptations, equipment or step-by-step rehab plans. Entry in Scotland is a 3 or 4-year BSc (Hons) Occupational Therapy at Queen Margaret, Robert Gordon or Glasgow Caledonian, or a 2-year pre-registration MSc for graduates in a related subject, leading to registration with the Health and Care Professions Council (HCPC). The role is one of the largest allied health professions in NHS Scotland, also employed in social work, schools and mental health services, starting on Agenda for Change Band 5.',
  false,
  'Growing',
  '2222',
  29500,
  46500,
  37000,
  29500,
  37000,
  46500,
  'ONS ASHE 2025 (Scotland median + UK percentiles)',
  CURRENT_DATE,
  true,
  'SOC 2222 (Occupational therapists) confirmed. Scotland p25 and p75 suppressed by ONS; UK p25 (29424) and UK p75 (46309) used as fallback for entry and experienced, rounded to nearest GBP 500. NHS Scotland AHPs on Agenda for Change Band 5 at entry (approx GBP 31k) progressing through bands to Band 8 (approx GBP 60k plus) for senior specialist roles. ASHE figures represent the cross-employer average including social work and private practice; NHS-specific pay bands may differ. Flagged for verification against NHS Scotland AHP workforce data.'
);
