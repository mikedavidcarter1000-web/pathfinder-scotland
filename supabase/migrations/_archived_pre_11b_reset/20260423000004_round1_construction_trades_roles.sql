-- Round 1 careers expansion: Construction & Trades (+4 roles)
-- Source research: docs/research/round1/construction-trades.md
-- Salary source: ONS ASHE 2025 (scripts/ashe/ashe-2025-scotland.json, ashe-2025-uk.json)

INSERT INTO public.career_roles (
  career_sector_id, title, ai_rating, ai_description,
  is_new_ai_role, growth_outlook,
  soc_code_2020, salary_entry, salary_experienced,
  salary_median_scotland, salary_entry_uk, salary_median_uk, salary_experienced_uk,
  salary_source, salary_last_updated, salary_needs_verification, salary_notes
) VALUES (
  '5d65f7b5-4f66-4c64-aaac-18ff258866c9',
  'Civil Engineer',
  3,
  'Designs and oversees the construction of infrastructure such as roads, bridges, tunnels, rail, flood defences and water networks, producing structural calculations, running site surveys and supervising works through construction. The standard Scottish route is a BEng or MEng in civil engineering at Heriot-Watt, Strathclyde, Edinburgh, Glasgow or Dundee followed by chartered membership of the Institution of Civil Engineers (ICE MICE/CEng) via the Professional Review, with degree apprenticeships through Transport Scotland, Scottish Water, Balfour Beatty and Morrison Construction as an earn-as-you-learn alternative. Scotland has an unusually large infrastructure pipeline covering rail electrification, active travel schemes, coastal flood defences and water network upgrades, and civil engineering is reported on the Scottish Shortage Occupation list.',
  false,
  'Growing',
  '2121',
  39000,
  64000,
  54500,
  39000,
  50500,
  64000,
  'ONS ASHE 2025 (Scotland median + UK percentiles)',
  CURRENT_DATE,
  true,
  'SOC 2121 (Civil engineers) confirmed. Scotland p50 (54668) available; Scotland p25 and p75 suppressed. Entry (UK p25 39138) and experienced (UK p75 64249) sourced from UK. Chartered professional role -- ASHE median covers the full career span; newly qualified (post-CEng Professional Review) earnings differ materially from senior chartered/Fellow level. Civil engineering is reported on the Scottish Shortage Occupation list and actual pay on major infrastructure programmes (rail, water, flood defence) often exceeds the ASHE median. Verify against ICE published salary surveys and SDS LMI before pilot.'
);

INSERT INTO public.career_roles (
  career_sector_id, title, ai_rating, ai_description,
  is_new_ai_role, growth_outlook,
  soc_code_2020, salary_entry, salary_experienced,
  salary_median_scotland, salary_entry_uk, salary_median_uk, salary_experienced_uk,
  salary_source, salary_last_updated, salary_needs_verification, salary_notes
) VALUES (
  '5d65f7b5-4f66-4c64-aaac-18ff258866c9',
  'Architect',
  3,
  'Designs buildings and interiors that meet clients'' needs, planning rules and Scottish building standards, producing drawings, specifications and models and coordinating contractors through construction. The route is seven years in total: an ARB/RIBA Part 1 undergraduate degree, a year of practice, Part 2 postgraduate study and the Part 3 professional practice examination, most commonly taken in Scotland at the University of Edinburgh (ECA), Glasgow School of Art (Mackintosh), Strathclyde, Dundee or Robert Gordon in Aberdeen, with RIAS chartered membership standard after Part 3. Scottish retrofit work, affordable housing delivery and the conservation of listed tenements sustain steady demand, though practice salaries run materially lower than banking or law until chartered.',
  false,
  'Stable',
  '2451',
  37000,
  54000,
  41000,
  37000,
  45500,
  54000,
  'ONS ASHE 2025 (Scotland median + UK percentiles)',
  CURRENT_DATE,
  true,
  'SOC 2451 (Architects) confirmed. Scotland p50 (41197) available; Scotland p25 and p75 suppressed. Entry (UK p25 36831) and experienced (UK p75 54100) sourced from UK. Chartered professional role -- ASHE median covers the full career span; newly qualified (post-Part 3) earnings differ materially from senior chartered/practice principal level. Practice salaries in Scotland typically lag London by 15-25 percent until chartered. Verify against RIAS and RIBA published salary surveys before pilot.'
);

INSERT INTO public.career_roles (
  career_sector_id, title, ai_rating, ai_description,
  is_new_ai_role, growth_outlook,
  soc_code_2020, salary_entry, salary_experienced,
  salary_median_scotland, salary_entry_uk, salary_median_uk, salary_experienced_uk,
  salary_source, salary_last_updated, salary_needs_verification, salary_notes
) VALUES (
  '5d65f7b5-4f66-4c64-aaac-18ff258866c9',
  'Building Services Engineer',
  3,
  'Designs and commissions the heating, ventilation, electrical, lighting, water and controls systems that make buildings habitable, and increasingly models operational energy performance to meet Scottish net-zero building standards. The Scottish route is a CIBSE-accredited BEng or MEng at Heriot-Watt, Strathclyde or Edinburgh Napier, or an HNC/HND plus graduate apprenticeship through consultancies such as Arup, Atkins, Hulley and Kirkwood and Cundall, with chartered status (CEng MCIBSE) following the CIBSE Professional Review. Scotland''s Heat in Buildings strategy and the retrofit of around 1 million homes by 2030 have made CIBSE-qualified building services engineers central to hitting net-zero targets, and the role features on most UK and Scottish construction shortage lists.',
  false,
  'Growing',
  '2129',
  38500,
  61000,
  46500,
  38500,
  48000,
  61000,
  'ONS ASHE 2025 (Scotland median + UK percentiles)',
  CURRENT_DATE,
  true,
  'SOC 2129 (Engineering professionals n.e.c.) used for CIBSE-chartered building services engineers, as ONS has no dedicated building services unit group. Scotland p50 (46487) available; Scotland p25 and p75 suppressed. Entry (UK p25 38739) and experienced (UK p75 61160) sourced from UK. SOC 2129 is an n.e.c. bucket spanning multiple sub-disciplines so salary dispersion is wide. Chartered professional role -- newly qualified (post-CEng MCIBSE) earnings differ materially from senior associate/partner level in top M and E consultancies. Verify against CIBSE published salary surveys and Hays Building Services salary guide before pilot.'
);

INSERT INTO public.career_roles (
  career_sector_id, title, ai_rating, ai_description,
  is_new_ai_role, growth_outlook,
  soc_code_2020, salary_entry, salary_experienced,
  salary_median_scotland, salary_entry_uk, salary_median_uk, salary_experienced_uk,
  salary_source, salary_last_updated, salary_needs_verification, salary_notes
) VALUES (
  '5d65f7b5-4f66-4c64-aaac-18ff258866c9',
  'Plasterer',
  4,
  'Applies skim, float and render coats to internal walls and ceilings and to external elevations, preparing surfaces for decoration and, on heritage buildings, running mouldings and cornices by hand. The Scottish entry route is a 3-year SVQ Level 3 Modern Apprenticeship in Plastering and Solid Finishing delivered by a CITB-approved provider such as the National Construction College at Inchinnan, Forth Valley College or Glasgow Kelvin, combined with on-site work for a plastering contractor or larger builder such as CCG, Robertson or City Building. Plasterers sit on the Scottish Shortage Occupation list and skilled self-employed finishers routinely earn above the ASHE median, especially on heritage tenement conservation work in Edinburgh and Glasgow.',
  false,
  'Growing',
  '5321',
  27500,
  38000,
  32000,
  27500,
  34000,
  NULL,
  'ONS ASHE 2025 (Scotland median + UK percentiles + 1.2x physical-trade multiplier)',
  CURRENT_DATE,
  true,
  'SOC 5321 (Plasterers) confirmed. Scotland p50 (31821) available; Scotland p25 and p75 suppressed; UK p75 also suppressed. Entry (UK p25 27623) and median (UK p50 33789) sourced from UK. Experienced figure (38000) derived from Scotland p50 x 1.2 (physical-trade multiplier applied per Task 4.1 for double-suppressed p75). Scottish Shortage Occupation -- Scotland has an acute shortage of this trade and actual pay is often above the ASHE median. Self-employed rates exceed employed rates substantially, particularly on heritage tenement conservation. Verify against CITB Scotland and SDS LMI before pilot.'
);
