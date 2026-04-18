-- Round 1 careers expansion: Engineering & Manufacturing (+4 roles)
-- Source research: docs/research/round1/engineering-manufacturing.md
-- Salary source: ONS ASHE 2025 (scripts/ashe/ashe-2025-scotland.json, ashe-2025-uk.json)

INSERT INTO public.career_roles (
  career_sector_id, title, ai_rating, ai_description,
  is_new_ai_role, growth_outlook,
  soc_code_2020, salary_entry, salary_experienced,
  salary_median_scotland, salary_entry_uk, salary_median_uk, salary_experienced_uk,
  salary_source, salary_last_updated, salary_needs_verification, salary_notes
) VALUES (
  'd5dedc2d-1b24-433f-a962-df70f0ebeb97',
  'Chemical Engineer',
  3,
  'Chemical engineers design and optimise the processes that turn raw materials into fuels, medicines, food, plastics, and speciality chemicals, covering reactor design, plant safety cases, heat and mass balances, and environmental controls. The Scottish route is an IChemE-accredited BEng or MEng at Strathclyde, Edinburgh, Heriot-Watt, or Aberdeen, followed by chartered status (CEng MIChemE) after several years of monitored professional development, with Graduate Apprenticeship degree routes now running through Ineos and other operators. Scottish demand centres on Grangemouth petrochemicals and refining, GSK Irvine and Piramal pharmaceuticals, the whisky industry''s distilling and effluent sites, and the growing hydrogen and carbon-capture pipeline in the North East.',
  false,
  'Stable',
  '2125',
  39500,
  58500,
  45000,
  39500,
  47500,
  58500,
  'ONS ASHE 2025 (Scotland median + UK percentiles)',
  CURRENT_DATE,
  true,
  'SOC 2125 (Production and process engineers) used -- ONS has no dedicated Chemical Engineers unit group in SOC 2020 and chemical engineers fall primarily under 2125 (production/process) with a minority in 2129 (n.e.c.). Scotland p50 (44998) available; Scotland p25 and p75 suppressed. Entry (UK p25 39425) and experienced (UK p75 58527) sourced from UK. SOC 2125 groups chemical, production, and process engineers so dispersion is wide -- Prospects cites a chartered IChemE median near GBP 85,000 for experienced/senior chemical engineers, well above the 2125 median. Chartered professional role -- ASHE median covers the full career span; newly qualified (post-CEng MIChemE) earnings differ materially from Principal/Fellow level. Verify against IChemE published salary surveys before pilot.'
);

INSERT INTO public.career_roles (
  career_sector_id, title, ai_rating, ai_description,
  is_new_ai_role, growth_outlook,
  soc_code_2020, salary_entry, salary_experienced,
  salary_median_scotland, salary_entry_uk, salary_median_uk, salary_experienced_uk,
  salary_source, salary_last_updated, salary_needs_verification, salary_notes
) VALUES (
  'd5dedc2d-1b24-433f-a962-df70f0ebeb97',
  'Aerospace Engineer',
  3,
  'Aerospace engineers design, test, and certify aircraft, helicopter, satellite, and launch-vehicle systems, covering aerodynamics, structures, propulsion, avionics, and airworthiness compliance under CAA and EASA rules. The Scottish route is an RAeS-accredited BEng or MEng in aerospace or mechanical engineering at Strathclyde or Glasgow (with many graduates topping up via Cranfield), leading to chartered status (CEng MRAeS) and usually requiring UK security clearance for defence work. Scottish employers include Spirit AeroSystems Prestwick (Airbus wing aerostructures), Leonardo Helicopters Edinburgh, BAE Systems, Rolls-Royce East Kilbride, and the growing space launch sector at Skyrora, Orbex, and SaxaVord Spaceport in Shetland.',
  false,
  'Stable',
  '2126',
  38500,
  83500,
  NULL,
  NULL,
  55500,
  NULL,
  'ONS ASHE 2025 (UK -- partial data) + 1.5x tail-heavy multiplier',
  CURRENT_DATE,
  true,
  'SOC 2126 (Aerospace engineers) used -- this is the dedicated ONS unit group. Scotland p25, p50, and p75 all suppressed (small sample); UK p25 and p75 also suppressed. Only UK p50 (55817) available. Entry figure (38500) derived as a proxy from SOC 2122 (Mechanical engineers) UK p25 (38491), as most aerospace engineers in Scotland have mechanical-engineering backgrounds and share the early-career band. Experienced figure (83500) derived from UK p50 x 1.5 (tail-heavy multiplier applied per Task 4.1 for chartered professions with long seniority tails -- aerospace Principal and Fellow-level roles reach GBP 90k-plus at Leonardo, Spirit, and BAE). Chartered professional role -- actual pay at Spirit Prestwick, Leonardo, and BAE Systems is structured on cleared-defence bandings which ASHE under-represents. Verify against RAeS published salary surveys and Hays Aerospace salary guide before pilot.'
);

INSERT INTO public.career_roles (
  career_sector_id, title, ai_rating, ai_description,
  is_new_ai_role, growth_outlook,
  soc_code_2020, salary_entry, salary_experienced,
  salary_median_scotland, salary_entry_uk, salary_median_uk, salary_experienced_uk,
  salary_source, salary_last_updated, salary_needs_verification, salary_notes
) VALUES (
  'd5dedc2d-1b24-433f-a962-df70f0ebeb97',
  'Renewable Energy Engineer',
  3,
  'Renewable energy engineers plan, design, and commission wind, solar, tidal, and hydrogen systems, covering site assessment, turbine and array selection, grid connection, cabling, and long-term performance optimisation. The Scottish route is a BEng or MEng in mechanical, electrical, or dedicated renewable energy engineering at Strathclyde, Heriot-Watt, Edinburgh, or Robert Gordon, with chartered status via IMechE, IET, or the Energy Institute and a rapidly expanding Graduate Apprenticeship pipeline. Scotland sits at the centre of UK renewables delivery with roles at SSE Renewables, ScottishPower Renewables, Vattenfall, Equinor, EMEC Orkney, and the ScotWind offshore lease awards that underpin the UK''s 2030 offshore-wind targets.',
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
  'SOC 2129 (Engineering professionals n.e.c.) used -- ONS has no dedicated renewable energy unit group and the role straddles 2122 (turbine-mechanical), 2123 (grid/power systems), and 2129. Scotland p50 (46487) available; Scotland p25 and p75 suppressed. Entry (UK p25 38739) and experienced (UK p75 61160) sourced from UK. SOC 2129 is a catch-all for engineering roles without a dedicated ONS code; actual pay in this specific discipline may differ materially from the 2129 median due to sectoral variation. Scotland''s energy transition and offshore wind pipeline drive actual pay above ASHE medians in this role -- offshore and remote location allowances, vessel-days, and project-based premiums add 15-30 percent for experienced engineers. Chartered professional role -- verify against IMechE, IET, and Energy Institute published salary surveys before pilot.'
);

INSERT INTO public.career_roles (
  career_sector_id, title, ai_rating, ai_description,
  is_new_ai_role, growth_outlook,
  soc_code_2020, salary_entry, salary_experienced,
  salary_median_scotland, salary_entry_uk, salary_median_uk, salary_experienced_uk,
  salary_source, salary_last_updated, salary_needs_verification, salary_notes
) VALUES (
  'd5dedc2d-1b24-433f-a962-df70f0ebeb97',
  'Nuclear Engineer',
  4,
  'Nuclear engineers design, operate, and decommission reactor and fuel systems and the associated safety cases, working across power generation, naval propulsion, and medical isotope production under ONR regulation. The Scottish route is an accredited BEng or MEng in nuclear, mechanical, chemical, or electrical engineering at Strathclyde or Edinburgh with a Nuclear Industry Council-recognised progression to CEng via IMechE, IChemE, IET, or the Nuclear Institute, and UK security clearance is standard. Scottish roles sit at EDF Energy Torness, Magnox decommissioning at Hunterston, Rolls-Royce Submarines and the East Kilbride nuclear campus, and the planned Small Modular Reactor and Advanced Modular Reactor programmes.',
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
  'SOC 2129 (Engineering professionals n.e.c.) used -- ONS has no dedicated nuclear engineering unit group and the role straddles 2122 (mechanical), 2126 (chemical-process for fuel/reprocessing), and 2129. Scotland p50 (46487) available; Scotland p25 and p75 suppressed. Entry (UK p25 38739) and experienced (UK p75 61160) sourced from UK. SOC 2129 is a catch-all for engineering roles without a dedicated ONS code; actual pay in this specific discipline may differ materially from the 2129 median due to sectoral variation. Nuclear pay sits above the 2129 median in practice -- safety-case and licensed-site roles at Torness, Hunterston, and Rolls-Royce Submarines carry regulated pay premiums, remote-site allowances, and cleared-defence bandings that ASHE under-represents, often adding 15-30 percent for experienced chartered engineers. Chartered professional role with an unusually long seniority tail (Principal and Fellow-level safety-case engineers reach GBP 90k-plus). Verify against Nuclear Institute and IMechE published salary surveys before pilot.'
);
