-- Round 1 careers expansion: Law & Justice (+4 roles)
-- Source research: docs/research/round1/law-justice.md
-- Salary source: ONS ASHE 2025 (scripts/ashe/ashe-2025-scotland.json, ashe-2025-uk.json)

INSERT INTO public.career_roles (
  career_sector_id, title, ai_rating, ai_description,
  is_new_ai_role, growth_outlook,
  soc_code_2020, salary_entry, salary_experienced,
  salary_median_scotland, salary_entry_uk, salary_median_uk, salary_experienced_uk,
  salary_source, salary_last_updated, salary_needs_verification, salary_notes
) VALUES (
  '0862ec29-22ae-460e-a045-1d3bf0794e89',
  'Advocate',
  3,
  'Advocates are Scotland''s specialist court lawyers, providing independent courtroom advocacy and written opinions across the Court of Session, High Court of Justiciary, UK Supreme Court, and specialist tribunals. The Scottish route is an LLB in Scots Law at Edinburgh, Glasgow, Aberdeen, Dundee, Strathclyde or Robert Gordon, followed by the Diploma in Legal Practice (DipLP), a qualifying period in a solicitor''s office, then devilling (a pupillage-equivalent training year) under the Faculty of Advocates before admission to the bar. Advocates are regulated separately from English and Welsh barristers, are almost all self-employed through stables rather than chambers, and earnings range from a modest devilling stipend during training to six figures for experienced senior counsel and King''s Counsel.',
  false,
  'Stable',
  '2411',
  21500,
  60000,
  NULL,
  21500,
  34500,
  60000,
  'ONS ASHE 2025 (UK fallback -- Scotland data suppressed)',
  CURRENT_DATE,
  true,
  'SOC 2411 (Barristers and judges) used -- ASHE does not distinguish Scottish advocates from English or Welsh barristers, so all three share this catch-all code. Scotland p25, p50, and p75 all suppressed; UK p25 (21705), p50 (34253), and p75 (60096) used as fallback. SOC 2411 is a catch-all spanning highly variable careers with dramatically different pay structures (pupils, junior barristers, QCs/KCs, and judges) -- the ASHE median is not meaningful for any individual role within this group. Advocates are typically self-employed; earnings vary very widely by practice area and seniority. Junior devilling stipend is minimal (approximately GBP 10k for the devilling year); senior advocates earn well into six figures. ASHE figures for SOC 2411 are an employee-only subset that does not capture self-employed bar earnings. Verify against Faculty of Advocates guidance before pilot.'
);

INSERT INTO public.career_roles (
  career_sector_id, title, ai_rating, ai_description,
  is_new_ai_role, growth_outlook,
  soc_code_2020, salary_entry, salary_experienced,
  salary_median_scotland, salary_entry_uk, salary_median_uk, salary_experienced_uk,
  salary_source, salary_last_updated, salary_needs_verification, salary_notes
) VALUES (
  '0862ec29-22ae-460e-a045-1d3bf0794e89',
  'Police Officer',
  2,
  'Police officers maintain public safety, respond to emergency calls, investigate crime, gather and preserve evidence, and work with communities and partner agencies to prevent harm. In Scotland the employer is Police Scotland -- Scotland''s single national force of roughly 17,000 officers across 13 territorial divisions -- with constable entry open from age 17.5 through application, fitness test, assessment centre, and vetting followed by initial training at the Scottish Police College at Tulliallan Castle. No degree is required for constable entry, Police Scotland follows its own Police Negotiating Board for Scotland pay scale with constables starting around GBP 29k and rising to approximately GBP 46k after seven years, and promotion pathways open into sergeant, inspector, detective, and specialist units.',
  false,
  'Stable',
  '3312',
  42500,
  61500,
  51000,
  NULL,
  NULL,
  NULL,
  'ONS ASHE 2025 (Scotland median only -- UK data suppressed) + 1.2x physical-trade multiplier',
  CURRENT_DATE,
  true,
  'SOC 3312 (Police officers, sergeant and below) used. Unusual data pattern -- Scotland p50 (51135) available, but Scotland p25/p75 and UK p25/p50/p75 all suppressed. Entry (42500) derived as Scotland p50 / 1.2 and experienced (61500) as Scotland p50 x 1.2 per embodied-enforcement multiplier rule. Police Scotland follows the Police Negotiating Board for Scotland pay scales. Constable entry pay is approximately GBP 29k rising to approximately GBP 46k after seven years; sergeant, inspector, and above are separate pay scales and are what pull the SOC 3312 median to GBP 51k. The ASHE median is not meaningful for constable entry pay because the unit group pools constables with sergeants. Verify against PNBS published scales before pilot.'
);

INSERT INTO public.career_roles (
  career_sector_id, title, ai_rating, ai_description,
  is_new_ai_role, growth_outlook,
  soc_code_2020, salary_entry, salary_experienced,
  salary_median_scotland, salary_entry_uk, salary_median_uk, salary_experienced_uk,
  salary_source, salary_last_updated, salary_needs_verification, salary_notes
) VALUES (
  '0862ec29-22ae-460e-a045-1d3bf0794e89',
  'Procurator Fiscal Depute',
  3,
  'Procurator Fiscal Deputes are Scotland''s public prosecutors, reviewing police reports, making independent charging decisions, preparing indictments, and conducting trials in the Sheriff Court and Justice of the Peace Court on behalf of the Lord Advocate. Entry is via the Crown Office and Procurator Fiscal Service (COPFS) Legal Trainee Scheme after an LLB and the Diploma in Legal Practice (DipLP), typically with initial qualification as a solicitor in Scotland regulated by the Law Society of Scotland before specialising in prosecution. Scotland''s prosecution service is structurally distinct from the English Crown Prosecution Service because prosecutorial independence sits constitutionally with the Lord Advocate as head of the system of criminal prosecution, and COPFS follows Scottish Government Legal Service pay bands rather than private-practice solicitor rates.',
  false,
  'Stable',
  '2412',
  38000,
  74000,
  49500,
  38000,
  53500,
  74000,
  'ONS ASHE 2025 (Scotland median + UK percentiles)',
  CURRENT_DATE,
  true,
  'SOC 2412 (Solicitors and lawyers) used -- ASHE does not distinguish Procurator Fiscal Deputes from private-practice solicitors, so all Scottish solicitor-qualified roles share this code. Scotland p50 (49581) available; Scotland p25 and p75 suppressed. Entry (UK p25 37751) and experienced (UK p75 74190) sourced from UK. Crown Office and Procurator Fiscal Service (COPFS) follows Scottish Government Legal Service pay bands which are typically GBP 37k-GBP 65k for PFDs before senior roles, distinct from private-practice solicitor rates. Actual COPFS pay bands differ materially from the 2412 ASHE median because the unit group pools in-house, private-practice, and public-sector lawyers. Verify against COPFS published pay scales before pilot.'
);

INSERT INTO public.career_roles (
  career_sector_id, title, ai_rating, ai_description,
  is_new_ai_role, growth_outlook,
  soc_code_2020, salary_entry, salary_experienced,
  salary_median_scotland, salary_entry_uk, salary_median_uk, salary_experienced_uk,
  salary_source, salary_last_updated, salary_needs_verification, salary_notes
) VALUES (
  '0862ec29-22ae-460e-a045-1d3bf0794e89',
  'Prison Officer',
  2,
  'Prison officers supervise people held in custody, maintain order and safety on the wings, manage daily regimes, de-escalate conflict, and support rehabilitation, education, and reintegration activities. The Scottish employer is the Scottish Prison Service (SPS), which operates separately from HM Prison and Probation Service in England across 13 publicly run establishments plus two privately operated prisons, with recruitment through the SPS website followed by initial training at the SPS College in Polmont and a structured probation period. Entry requires no degree and is open to applicants aged 18 and over who pass SPS fitness and aptitude tests, and the role sits on SPS-specific pay scales with operational staff starting around GBP 28-30k and progressing into residential, operations, intelligence, and first-line management functions.',
  false,
  'Stable',
  '3314',
  25500,
  38000,
  NULL,
  25500,
  31500,
  NULL,
  'ONS ASHE 2025 (UK fallback -- Scotland data suppressed) + 1.2x physical-trade multiplier',
  CURRENT_DATE,
  true,
  'SOC 3314 (Prison service officers, below principal officer) used -- dedicated ONS unit group. Scotland p25, p50, and p75 all suppressed; UK p25 (25714) and p50 (31603) available; UK p75 suppressed. Entry (25500) sourced from UK p25. Experienced (38000) derived as UK p50 x 1.2 per embodied-enforcement multiplier rule. Scottish Prison Service follows SPS-specific pay bands separate from HMPPS in England -- SPS publishes its own scales with operational officers starting around GBP 28-30k and progressing through first-line management. Verify against SPS published pay scales before pilot.'
);
