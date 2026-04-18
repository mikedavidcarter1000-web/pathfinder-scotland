-- Round 1 careers expansion: Business & Finance (+4 roles)
-- Source research: docs/research/round1/business-finance.md
-- Salary source: ONS ASHE 2025 (scripts/ashe/ashe-2025-scotland.json, ashe-2025-uk.json)

INSERT INTO public.career_roles (
  career_sector_id, title, ai_rating, ai_description,
  is_new_ai_role, growth_outlook,
  soc_code_2020, salary_entry, salary_experienced,
  salary_median_scotland, salary_entry_uk, salary_median_uk, salary_experienced_uk,
  salary_source, salary_last_updated, salary_needs_verification, salary_notes
) VALUES (
  '13a2285b-3e6b-4e24-9129-5dcf652d8d89',
  'Tax Adviser',
  3,
  'Helps individuals and businesses plan their affairs to pay the right amount of tax legally, interpreting UK and Scottish tax legislation and representing clients in HMRC enquiries. Most Scottish entrants join a Big 4 tax department at Deloitte, KPMG, PwC or EY in Edinburgh or Glasgow after a degree, then qualify as a Chartered Tax Adviser through the CIOT exams over three to four years. Tax work is judgement-heavy and regulation-driven, which keeps it more resistant to full automation than general compliance work, even as AI tools speed up routine returns.',
  false,
  'Stable',
  '2423',
  33000,
  69500,
  NULL,
  32808,
  46280,
  NULL,
  'ONS ASHE 2025 (UK percentiles + 1.5x fallback multiplier)',
  CURRENT_DATE,
  true,
  'SOC 2423 (Taxation experts) confirmed. ASHE Scotland p25, p50 and p75 all suppressed; UK p75 also suppressed. Entry (UK p25 32808) and median (UK p50 46280) sourced from UK. Experienced (69500) estimated as UK p50 x 1.5 (double-suppression fallback with 1.5x tail-heavy multiplier applied per Task 4.1, because Tax Adviser is a senior finance profession with bonus-heavy compensation). ASHE figures are base salary only. Bonuses and performance pay commonly add 20-100 percent in mid-career investment, consulting and senior tax roles. Student-facing display uses ASHE base; students should research total compensation via employer career pages.'
);

INSERT INTO public.career_roles (
  career_sector_id, title, ai_rating, ai_description,
  is_new_ai_role, growth_outlook,
  soc_code_2020, salary_entry, salary_experienced,
  salary_median_scotland, salary_entry_uk, salary_median_uk, salary_experienced_uk,
  salary_source, salary_last_updated, salary_needs_verification, salary_notes
) VALUES (
  '13a2285b-3e6b-4e24-9129-5dcf652d8d89',
  'Management Consultant',
  3,
  'Advises organisations on strategy, operations and change programmes, diagnosing problems, building business cases and helping clients implement improvements across sectors. Typical entry in Scotland is a graduate scheme at Accenture, Deloitte, KPMG or PwC in Edinburgh or Glasgow, usually with a 2:1 degree in any numerate or business-related subject. Career progression runs analyst, consultant, manager, partner, and a sector specialism (public sector, financial services, digital transformation) often develops within the first three years.',
  false,
  'Growing',
  '2431',
  38000,
  68500,
  44000,
  37901,
  51500,
  68392,
  'ONS ASHE 2025 (Scotland median + UK percentiles)',
  CURRENT_DATE,
  true,
  'SOC 2431 (Management consultants and business analysts) confirmed. Scotland p50 (44197) available; Scotland p25 and p75 suppressed. Entry (UK p25 37901) and experienced (UK p75 68392) sourced from UK. ASHE figures are base salary only. Bonuses and performance pay commonly add 20-100 percent in mid-career investment, consulting and senior tax roles. Student-facing display uses ASHE base; students should research total compensation via employer career pages.'
);

INSERT INTO public.career_roles (
  career_sector_id, title, ai_rating, ai_description,
  is_new_ai_role, growth_outlook,
  soc_code_2020, salary_entry, salary_experienced,
  salary_median_scotland, salary_entry_uk, salary_median_uk, salary_experienced_uk,
  salary_source, salary_last_updated, salary_needs_verification, salary_notes
) VALUES (
  '13a2285b-3e6b-4e24-9129-5dcf652d8d89',
  'Investment Banker',
  2,
  'Raises capital for companies and governments and advises on mergers, acquisitions and public listings, building financial models, preparing pitch materials and negotiating deals. Entry is highly competitive and almost always through a summer internship followed by a graduate analyst programme at a major bank, with Edinburgh housing back- and middle-office teams for firms such as JPMorgan, Barclays and Morgan Stanley while front-office deal roles cluster in London. The work is target-driven with long hours, heavy FCA regulation, and modelling and pitch research are among the finance tasks most exposed to generative AI.',
  false,
  'Stable',
  '2422',
  33500,
  68000,
  51500,
  33356,
  48000,
  67913,
  'ONS ASHE 2025 (Scotland median + UK percentiles)',
  CURRENT_DATE,
  true,
  'SOC 2422 (Finance and investment analysts and advisers) confirmed. Scotland p50 (51665) available; Scotland p25 and p75 suppressed. Entry (UK p25 33356) and experienced (UK p75 67913) sourced from UK. SOC 2422 bundles analysts, retail advisers and investment bankers together, so ASHE base understates pure front-office investment banking compensation. ASHE figures are base salary only. Bonuses and performance pay commonly add 20-100 percent in mid-career investment, consulting and senior tax roles. Student-facing display uses ASHE base; students should research total compensation via employer career pages.'
);

INSERT INTO public.career_roles (
  career_sector_id, title, ai_rating, ai_description,
  is_new_ai_role, growth_outlook,
  soc_code_2020, salary_entry, salary_experienced,
  salary_median_scotland, salary_entry_uk, salary_median_uk, salary_experienced_uk,
  salary_source, salary_last_updated, salary_needs_verification, salary_notes
) VALUES (
  '13a2285b-3e6b-4e24-9129-5dcf652d8d89',
  'Economist',
  3,
  'Studies how people, businesses and governments make choices about resources, building models and interpreting data on inflation, employment, trade and public finances to inform decisions. Scottish employers include the Scottish Government, the Bank of England agency in Glasgow, the Scottish Fiscal Commission and the Fraser of Allander Institute, with most entrants holding an economics degree and many progressing via the Government Economic Service fast stream or a master''s degree. Policy judgement and communication remain central to the role, though routine forecasting and data preparation are increasingly automated.',
  false,
  'Growing',
  '2433',
  41500,
  73500,
  NULL,
  41471,
  51500,
  73468,
  'ONS ASHE 2025 (UK percentiles)',
  CURRENT_DATE,
  true,
  'SOC 2433 (Actuaries, economists and statisticians) confirmed. ASHE Scotland p25, p50 and p75 all suppressed; UK p25 (41471), UK p50 (51520) and UK p75 (73468) used for entry, median and experienced. SOC 2433 bundles economists with actuaries and statisticians; actuarial compensation is typically higher, so these figures may slightly overstate pure economist base salaries. Flagged for verification against Government Economic Service and Scottish Government economist pay scales at next review.'
);
