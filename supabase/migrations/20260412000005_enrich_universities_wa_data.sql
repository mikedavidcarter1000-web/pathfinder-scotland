-- ============================================
-- Enrich universities with detailed widening-access data
-- Migration: 20260412000005
-- ============================================
-- Adds 11 new columns describing each Scottish HE institution's widening-access
-- programmes, inserts 2 previously missing specialist institutions
-- (Glasgow School of Art, Scotland's Rural College), and populates WA data for
-- all 18 institutions in the catalogue.
--
-- Note on schema alignment:
--   * The existing `universities.type` column uses the `university_type` enum
--     (ancient / traditional / modern / specialist).
--   * This migration adds a new `university_type` TEXT column with a CHECK
--     constraint (ancient / established / modern / specialist) per task spec.
--     The naming reflects the classification used in the research document
--     (the 4 "established" universities are Strathclyde, Dundee, Heriot-Watt,
--     Stirling). PostgreSQL resolves the name collision between the enum TYPE
--     and the COLUMN via separate namespaces.
-- ============================================

BEGIN;

-- ============================================
-- PART 1: Schema additions
-- ============================================

ALTER TABLE universities ADD COLUMN IF NOT EXISTS wa_programme_name TEXT;
ALTER TABLE universities ADD COLUMN IF NOT EXISTS wa_programme_description TEXT;
ALTER TABLE universities ADD COLUMN IF NOT EXISTS wa_programme_url TEXT;
ALTER TABLE universities ADD COLUMN IF NOT EXISTS wa_pre_entry_required BOOLEAN DEFAULT false;
ALTER TABLE universities ADD COLUMN IF NOT EXISTS wa_pre_entry_details TEXT;
ALTER TABLE universities ADD COLUMN IF NOT EXISTS care_experienced_guarantee TEXT;
ALTER TABLE universities ADD COLUMN IF NOT EXISTS wa_bursary_info TEXT;
ALTER TABLE universities ADD COLUMN IF NOT EXISTS articulation_info TEXT;
ALTER TABLE universities ADD COLUMN IF NOT EXISTS wa_grade_reduction TEXT;
ALTER TABLE universities ADD COLUMN IF NOT EXISTS shep_programmes TEXT[];
ALTER TABLE universities
  ADD COLUMN IF NOT EXISTS university_type TEXT
  CHECK (university_type IN ('ancient', 'established', 'modern', 'specialist'));

-- ============================================
-- PART 2: Insert missing specialist institutions
-- ============================================
-- RCS already exists in the catalogue; GSA and SRUC are genuinely missing.

INSERT INTO universities (name, slug, type, city, website, description, founded_year, russell_group, widening_access_info)
VALUES
  (
    'Glasgow School of Art',
    'gsa',
    'specialist',
    'Glasgow',
    'https://www.gsa.ac.uk',
    'Scotland''s specialist institution for creative education and research. Portfolio and interview required for all programmes.',
    1845,
    false,
    '{}'::jsonb
  ),
  (
    'Scotland''s Rural College',
    'sruc',
    'specialist',
    'Edinburgh',
    'https://www.sruc.ac.uk',
    'Specialist tertiary institution for agriculture, rural sciences, land-based industries and veterinary nursing. Headquartered in Edinburgh with campuses across Scotland (Aberdeen, Ayr, Dumfries, Fife, West Lothian). Gained own degree-awarding powers in October 2024.',
    1899,
    false,
    '{}'::jsonb
  )
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- PART 3: Populate WA data for all 18 universities
-- ============================================

-- ---------- ANCIENT ----------

UPDATE universities SET
  wa_programme_name = 'Flag / Plus Flag System',
  wa_programme_description = 'One WA indicator earns a Flag (priority at standard grades). Two or more indicators, or care experience/SWAP, earns a Plus Flag — assessed one to two grades below standard.',
  wa_pre_entry_required = false,
  wa_pre_entry_details = 'LEAPS partnership (Lothians schools). SWAP East accepted for Plus Flag.',
  care_experienced_guarantee = 'Care-experienced applicants pledged an offer at minimum requirements.',
  wa_grade_reduction = 'Plus Flag: typically one to two grades below standard entry.',
  articulation_info = 'No formal guaranteed HNC/HND articulation, but some Science and Engineering routes exist. Most limited articulation of any Scottish university.',
  shep_programmes = ARRAY['LEAPS']::text[],
  university_type = 'ancient'
WHERE slug = 'edinburgh';

UPDATE universities SET
  wa_programme_name = 'Priority 1 / Priority 2 System with Pre-Entry Programmes',
  wa_programme_description = 'Priority 1 (SIMD deciles 1-2, care-experienced, estranged, carers, asylum seekers, refugees) = guaranteed adjusted offer. Priority 2 (SIMD deciles 3-4) = prioritised offer. All WA applicants must complete a pre-entry programme.',
  wa_pre_entry_required = true,
  wa_pre_entry_details = 'Must complete one of: Top-Up, Summer School, Reach, or University Experience Week. Summer School subject passes can substitute for Higher results.',
  care_experienced_guarantee = 'Guaranteed adjusted offer at Priority 1 thresholds. Lowest published thresholds of any ancient university for care-experienced applicants.',
  wa_grade_reduction = 'Priority 1 offers typically two to three grades below standard. Arts/Sciences guaranteed at BBBB. Computing guaranteed at ABBB.',
  wa_bursary_info = 'Bespoke HNC articulation programmes with Glasgow colleges — students UofG-enrolled from day one.',
  articulation_info = 'Bespoke HNC programmes in Life Sciences, Social Sciences, Engineering with Glasgow colleges. Direct Year 2 entry. Students are UofG-enrolled from day one.',
  shep_programmes = ARRAY['FOCUS West']::text[],
  university_type = 'ancient'
WHERE slug = 'glasgow';

UPDATE universities SET
  wa_programme_name = 'Standard / Minimum / Gateway',
  wa_programme_description = 'Three tiers: Standard, Minimum (one+ WA indicator), and Gateway (BBBB). Gateway to Arts and Gateway to Science offer supported entry at BBBB with interview, mentoring, and a designated adviser.',
  wa_pre_entry_required = false,
  wa_pre_entry_details = 'Participation in LEAPS, Sutton Trust, Focus West, Lift Off, Aspire North, Reach, or SWAP triggers Minimum entry assessment.',
  care_experienced_guarantee = 'Care-experienced applicants or those from SIMD20 + low-progression schools receive a guaranteed offer at Minimum grades (the St Andrews Pledge).',
  wa_grade_reduction = 'Minimum: one to two grades below standard. Gateway: BBBB for all eligible programmes.',
  articulation_info = 'HNC with A graded unit or HND with AA graded units accepted. FE-HE Pathway to Arts and Science for college articulation.',
  shep_programmes = ARRAY['LEAPS','FOCUS West','Aspire North','Lift Off']::text[],
  university_type = 'ancient'
WHERE slug = 'st-andrews';

UPDATE universities SET
  wa_programme_name = 'Access Aberdeen / Contextual Admissions',
  wa_programme_description = 'Among the most generous WA offers in Scotland. Standard BBBB reduced to BBC guaranteed unconditional, or BB conditional asking for one additional C.',
  wa_pre_entry_required = false,
  care_experienced_guarantee = 'Guaranteed unconditional offers at BBC. Free university accommodation for SIMD20 students.',
  wa_grade_reduction = 'BBC guaranteed unconditional. BB conditional (asking for one more C). Most generous of any established university.',
  wa_bursary_info = 'Free university accommodation for SIMD20 students. Extensive HNC/HND articulation (13+ pathways via NESCol).',
  articulation_info = 'Extensive HNC/HND articulation — 13+ pathways via NESCol and other colleges. Reach Programme covers Medicine and Law.',
  shep_programmes = ARRAY['Aspire North']::text[],
  university_type = 'ancient'
WHERE slug = 'aberdeen';

-- ---------- ESTABLISHED ----------

UPDATE universities SET
  wa_programme_name = 'Standard Entry Requirements (SER) / Minimum Entry Requirements (MER)',
  wa_programme_description = 'Meeting any one of five contextual indicators qualifies for MER offers (typically 1-2 grades below). FOCUS West Top-Up participants receive a further one-grade reduction on top of MER.',
  wa_pre_entry_required = false,
  wa_pre_entry_details = 'Named programmes: Accelerate (summer subject tasters), Young Strathclyder (P5-S6), FOCUS West.',
  care_experienced_guarantee = 'Guaranteed offer at MER for care-experienced applicants.',
  wa_grade_reduction = 'MER typically one to two grades below standard. FOCUS West Top-Up gives a further one-grade reduction.',
  shep_programmes = ARRAY['FOCUS West']::text[],
  university_type = 'established'
WHERE slug = 'strathclyde';

UPDATE universities SET
  wa_programme_name = 'Contextual Admissions + Reach Tayside + Access Summer School',
  wa_programme_description = 'Two to three grade reductions for WA applicants — among the most generous of established universities. Seven contextual factors assessed.',
  wa_pre_entry_required = false,
  wa_pre_entry_details = 'Access Summer School (running since 1993) provides a second chance to demonstrate readiness.',
  care_experienced_guarantee = 'Gateway to Medicine: SIMD Q1, care-experienced, carers, refugees, estranged auto-eligible. No UCAT required.',
  wa_grade_reduction = 'Two to three grades below standard. Engineering/Science from AABB to BBBB.',
  articulation_info = 'Formal articulation with Dundee and Angus College via Additional Funded Places scheme (guaranteed progression). ACES Tayside for Art/Design.',
  shep_programmes = ARRAY['Lift Off']::text[],
  university_type = 'established'
WHERE slug = 'dundee';

UPDATE universities SET
  wa_programme_name = 'Fair Access Policy',
  wa_programme_description = 'Guaranteed minimum offer of BBBC for SIMD20 and care-experienced applicants across almost all programmes.',
  wa_pre_entry_required = false,
  care_experienced_guarantee = 'Guaranteed BBBC offer across almost all programmes.',
  wa_grade_reduction = 'Guaranteed BBBC for SIMD20 and care-experienced. SIMD40 receives 1-2 grade reductions.',
  wa_bursary_info = 'GBP 1,000/year Widening Access Bursary for all WA Scottish students. LEAPS Pledge signed.',
  articulation_info = 'Strong HNC/HND articulation + Associate Student Partnership. Global College Foundation programmes offer guaranteed Year 2 entry.',
  shep_programmes = ARRAY['LEAPS']::text[],
  university_type = 'established'
WHERE slug = 'heriot-watt';

UPDATE universities SET
  wa_programme_name = 'Contextual Admissions',
  wa_programme_description = 'Reduces offers by up to two grades for all WA categories.',
  wa_pre_entry_required = false,
  care_experienced_guarantee = 'Guaranteed offer at minimum entry plus guaranteed year-round accommodation and a named support contact.',
  wa_grade_reduction = 'Up to two grades below standard for all WA categories.',
  wa_bursary_info = 'Guaranteed year-round accommodation for care-experienced students.',
  articulation_info = 'Access to Degree Studies — Stirling''s own part-time evening access course guaranteeing a degree place. INTO Stirling pathways. SWAP East and West accepted. Pathways partnerships with colleges in Forth Valley, Edinburgh, Lothians, Fife, and Borders.',
  shep_programmes = ARRAY['LEAPS','Lift Off']::text[],
  university_type = 'established'
WHERE slug = 'stirling';

-- ---------- MODERN ----------

UPDATE universities SET
  wa_programme_name = 'Contextual Admissions / GCU Pathways / Care Connect',
  wa_programme_description = 'Scotland''s leading university by SIMD20 intake volume — 22.1% of undergraduates from the 20% most deprived areas. WA minimum typically BCCC or CCC for Nursing.',
  wa_pre_entry_required = false,
  care_experienced_guarantee = 'Care Connect team with free accommodation (365 days, up to 2 years).',
  wa_grade_reduction = 'Standard reduced to BCCC (4 Highers). GCU Pathways entry at just 2 Highers at BB.',
  wa_bursary_info = 'Free accommodation for care-experienced students (365 days, up to 2 years). Caledonian Club (community outreach ages 3-18).',
  articulation_info = 'GCU Pathways — enrol as GCU student from day one, complete HND at partner college for 2 years, then enter Year 3. College Connect for HNC/HND articulation with Glasgow colleges.',
  shep_programmes = ARRAY['FOCUS West']::text[],
  university_type = 'modern'
WHERE slug = 'gcu';

UPDATE universities SET
  wa_programme_name = 'Contextual Admissions (2 grades below)',
  wa_programme_description = 'WA minimum entry is consistently two Higher grades below standard. Founding partner of Hub for SUCCESS.',
  wa_pre_entry_required = false,
  care_experienced_guarantee = 'Two grade reduction applied. WA students may double-count Highers and Advanced Highers.',
  wa_grade_reduction = 'Consistently two Higher grades below standard across all programmes.',
  articulation_info = 'Strong HNC/HND articulation to Year 2/3. LEAPS partner.',
  shep_programmes = ARRAY['LEAPS']::text[],
  university_type = 'modern'
WHERE slug = 'napier';

UPDATE universities SET
  wa_programme_name = 'QMU Contextual Admissions',
  wa_programme_description = 'One-grade reduction in one or two positions for WA applicants. Specialist strengths in health sciences, performing arts, and speech/language therapy.',
  wa_pre_entry_required = false,
  care_experienced_guarantee = 'Contextual admissions applied for care-experienced, LEAPS, Focus West, young carers, estranged, armed forces, refugees.',
  wa_grade_reduction = 'One-grade reduction in one or two positions.',
  articulation_info = 'HNC/HND articulation widely available. SWAP accepted.',
  shep_programmes = ARRAY['LEAPS','FOCUS West']::text[],
  university_type = 'modern'
WHERE slug = 'qmu';

UPDATE universities SET
  wa_programme_name = 'Contextual Admissions + Access To + ACES',
  wa_programme_description = 'Two to three grade reductions for WA applicants. Scotland''s strongest college articulation partnership with NESCol (400+ advanced-entry students per year).',
  wa_pre_entry_required = false,
  care_experienced_guarantee = 'Contextual reductions applied. Free first-year accommodation offered to WA students.',
  wa_grade_reduction = 'Two to three grades below standard. Engineering from BBBC to CCCC.',
  wa_bursary_info = 'Free first-year accommodation for WA students. Northern Lights (S1/S2 outreach). Access To programme (S5/S6 engagement).',
  articulation_info = 'Scotland''s strongest college articulation — 400+ advanced-entry students per year via NESCol. Degree Link portfolio. Additional Funded Places scheme with guaranteed progression.',
  shep_programmes = ARRAY['Aspire North']::text[],
  university_type = 'modern'
WHERE slug = 'rgu';

UPDATE universities SET
  wa_programme_name = 'Minimum Access Threshold',
  wa_programme_description = 'First Scottish university to introduce a minimum access threshold — reduces from 4 Highers to 3 Highers for WA applicants. First in Scotland with Frank Buttle Trust Quality Mark.',
  wa_pre_entry_required = false,
  care_experienced_guarantee = '3-Higher minimum for care-experienced applicants. Frank Buttle Trust Quality Mark.',
  wa_grade_reduction = '4 Highers reduced to 3 Highers. Foundation Apprenticeships count as 2 Highers at BB.',
  articulation_info = 'Over one-third of students enter via college articulation (Dundee and Angus College, Fife College). SWAP accepted.',
  shep_programmes = ARRAY['Lift Off']::text[],
  university_type = 'modern'
WHERE slug = 'abertay';

UPDATE universities SET
  wa_programme_name = 'Contextual Admissions / Foundation Academy / WeCare',
  wa_programme_description = 'Scotland''s leading university for social inclusion. WA minimum CCC (3 Highers) or CC plus named WA programme — the lowest threshold in the Scottish university sector.',
  wa_pre_entry_required = false,
  care_experienced_guarantee = 'WeCare Team for care-experienced, estranged, carers, refugees. Priority 365-day accommodation, named contacts.',
  wa_grade_reduction = 'CCC (3 Highers) or CC plus named WA programme. Lowest threshold in Scotland.',
  wa_bursary_info = 'UWS Foundation Academy (in-school module = 1 Higher at B). FOCUS West Top-Up (= Higher at C). Next Steps to University (online module). Summer School for conditional admissions.',
  articulation_info = 'HNC/HND articulation with 8+ Scottish colleges — very strong.',
  shep_programmes = ARRAY['FOCUS West']::text[],
  university_type = 'modern'
WHERE slug = 'uws';

UPDATE universities SET
  wa_programme_name = 'Contextual Admissions (individual assessment)',
  wa_programme_description = 'Structurally unique — collegiate university integrating FE and HE. Degree Year 1 = HNC, Year 2 = HND, Years 3-4 = Honours. Most accessible university in Scotland.',
  wa_pre_entry_required = false,
  care_experienced_guarantee = 'LEEP Ahead care-experienced pre-entry programme — 90% progression rate. Won Herald HE Widening Access Award 2023. Buttle UK Quality Mark.',
  wa_grade_reduction = 'Standard BBC. Contextually assessed on individual basis. Computing BSc via HNC entry at 1 Higher at C plus 3 N5s.',
  articulation_info = 'HNC = Year 1, HND = Year 2 — seamlessly integrated. The most accessible university in Scotland. Access to HE NQ courses at SCQF Levels 5-6 across multiple campuses.',
  shep_programmes = ARRAY['Aspire North']::text[],
  university_type = 'modern'
WHERE slug = 'uhi';

-- ---------- SPECIALIST ----------

UPDATE universities SET
  wa_programme_name = 'Fair Access / Transitions Programme / Access Courses',
  wa_programme_description = 'Three new Access Courses (SCQF Level 6) from 2025 for SIMD20, care-experienced, Global Majority, and refugee applicants. Transitions Programme provides multi-year support including artform training, audition prep, and life coaching.',
  wa_pre_entry_required = false,
  care_experienced_guarantee = 'Academic requirements can be relaxed via Non-Standard Entry. Audition fee waivers for financial hardship.',
  wa_grade_reduction = 'Entry primarily audition-based. Academic minimum typically 3 Highers at CCC. Access Course completers may receive unconditional offers.',
  university_type = 'specialist'
WHERE slug = 'rcs';

UPDATE universities SET
  wa_programme_name = 'GSA Contextual / ACES',
  wa_programme_description = 'Uniform reduction from ABBB to BBCC for all WA-eligible applicants. Part of ACES (Access to Creative Education Scotland) and FOCUS West. Free taster sessions, portfolio courses, application support.',
  wa_pre_entry_required = false,
  care_experienced_guarantee = 'Contextual admissions applied. Portfolio and interview required for all programmes.',
  wa_grade_reduction = 'Standard ABBB reduced to BBCC for WA applicants across all programmes.',
  wa_bursary_info = 'Part of ACES programme providing free taster sessions and portfolio courses.',
  shep_programmes = ARRAY['FOCUS West']::text[],
  university_type = 'specialist'
WHERE slug = 'gsa';

UPDATE universities SET
  wa_programme_name = 'SRUC Mission-Led Admissions',
  wa_programme_description = 'Contextual admissions with reductions to BBCC. Gained own degree-awarding powers October 2024. HNC/HND pathways are the primary WA mechanism.',
  wa_pre_entry_required = false,
  care_experienced_guarantee = 'Contextual admissions for care-experienced, young carers, free school meals, Gypsy/Roma/Traveller, Gaelic-speaking areas, refugees.',
  wa_grade_reduction = 'Standard ABBB reduced to BBCC. HNC entry typically 2 Highers at CC. LEAPS Transitions Course recognised as equivalent to one Higher.',
  articulation_info = 'HNC/HND pathways are the primary WA mechanism.',
  university_type = 'specialist'
WHERE slug = 'sruc';

COMMIT;
