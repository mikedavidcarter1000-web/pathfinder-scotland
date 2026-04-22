-- Round 1 careers expansion: Transport & Logistics (+2 roles)
-- Source research: docs/research/round1/transport-logistics.md
-- Salary source: ONS ASHE 2025 (scripts/ashe/ashe-2025-scotland.json, ashe-2025-uk.json)

INSERT INTO public.career_roles (
  career_sector_id, title, ai_rating, ai_description,
  is_new_ai_role, growth_outlook,
  soc_code_2020, salary_entry, salary_experienced,
  salary_median_scotland, salary_entry_uk, salary_median_uk, salary_experienced_uk,
  salary_source, salary_last_updated, salary_needs_verification, salary_notes
) VALUES (
  'bfedf558-8f23-4063-822b-ef35db3b58cb',
  'Freight Forwarder',
  3,
  'Freight forwarders arrange the international movement of goods on behalf of importers and exporters, booking sea, air, road and rail capacity, preparing customs paperwork, and tracking shipments from origin to destination. Entry in Scotland is typically through a Level 3 Freight Forwarding Specialist apprenticeship with a forwarder such as DHL, Kuehne+Nagel or DB Schenker, or through an HNC/HND in logistics followed by on-the-job training and BIFA or CILT qualifications. The role has grown in importance since Brexit, as UK-EU trade now requires full customs declarations for every consignment.',
  false,
  'Growing',
  '4134',
  26000,
  38500,
  31500,
  26000,
  32000,
  38500,
  'ONS ASHE 2025 (Scotland median + UK percentiles)',
  CURRENT_DATE,
  true,
  'SOC 4134 (Transport and distribution clerks and assistants); confidence medium. Senior freight forwarders may map to SOC 3539 and earn above the UK p75. Scotland p25 and p75 suppressed by ONS; UK percentiles used as fallback.'
);

INSERT INTO public.career_roles (
  career_sector_id, title, ai_rating, ai_description,
  is_new_ai_role, growth_outlook,
  soc_code_2020, salary_entry, salary_experienced,
  salary_median_scotland, salary_entry_uk, salary_median_uk, salary_experienced_uk,
  salary_source, salary_last_updated, salary_needs_verification, salary_notes
) VALUES (
  'bfedf558-8f23-4063-822b-ef35db3b58cb',
  'Airline Pilot',
  4,
  'Airline pilots fly commercial passenger and cargo aircraft on scheduled and chartered routes, taking full responsibility for flight planning, navigation, fuel, weather decisions and the safety of everyone on board. Entry routes are an integrated ATPL course at an approved training school (around 18 months, either self-funded at GBP 80,000 plus or through an airline cadet scheme), or via the Royal Air Force followed by a civilian conversion. Progression is from First Officer to Captain after several thousand hours of line flying, and the role is protected from automation by safety regulation and the requirement for licensed human command on board.',
  false,
  'Growing',
  '3511',
  79000,
  112500,
  83500,
  79000,
  107500,
  NULL,
  'ONS ASHE 2025 (UK -- partial data)',
  CURRENT_DATE,
  true,
  'SOC 3511 in SOC 2020 combines airline pilots and air traffic controllers. Scotland p25 and p75 suppressed; UK p75 also suppressed. salary_experienced (112,500) estimated as Scotland p50 multiplied by 1.35 proxy ratio for the suppressed p75. Research literature places senior captains at GBP 150k plus, so this figure is conservative.'
);
