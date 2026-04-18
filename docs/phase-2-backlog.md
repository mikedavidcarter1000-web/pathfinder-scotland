# Phase 2 Backlog

Items parked from the Round 1 end-of-session cleanup (migration `20260423000009_round1_cleanup.sql`, April 2026). Each needs a discrete product or data decision before it can ship.

## 1. `growth_outlook` enumeration rework

- `career_roles.growth_outlook` currently has ~170 unique free-text values.
- Only 4 are canonical: `Growing`, `Stable`, `Declining`, `NULL`. Round-1 cleanup collapsed the one `Stable-Growing` hybrid back to `Stable`.
- Most free-text values use a canonical value as prefix: e.g. `Stable -- core courtroom work remains human`, `Growing -- 42% yearly growth in demand`.
- Decision needed:
  - (a) keep the free-text flavour (students see the nuance inline), **or**
  - (b) canonicalise the column to the 4-value enum and move nuance into a new `growth_outlook_detail TEXT` column, or a structured JSON blob.
- Option (b) is the cleaner long-term shape but needs a full content pass across all 226 roles and a copy review of anywhere the field is rendered.

## 2. SOC bundling display strategy

- Several SOC codes now hold multiple `career_roles` rows that all pool on the same ONS ASHE salary percentiles. Most visible today: 5 Creative Arts roles pooled on SOC 2142.
- Students currently see identical salary medians across those roles, which reads as a data bug even though the underlying source is correct.
- Decision needed:
  - Badge visibly as "grouped SOC estimate" on the role card, **or**
  - Diversify by applying small per-role offsets driven by SDS LMI or sector reports, **or**
  - Collapse near-identical roles into one card with sub-role variants.

## 3. Dentist salary verification

- Current `career_roles` row for Dentist uses ASHE, but the early-career path in Scotland is dominated by NHS Dental Foundation Training (DFT) / Dental Core Training (DCT) pay progression.
- Need to cross-check the stored percentiles against published DFT/DCT bands and the BDA Scotland pay guidance.
- Likely lands as either a manual override or a sector-specific salary note.

## 4. Tail-heavy professions -- salary override policy

- Professions with a very long right tail (Airline Pilot, Advocate, Judge, senior Aerospace Engineer, Chartered Building Services partners, etc.) are understated by ONS ASHE percentiles because the headline feed truncates or suppresses the top decile.
- Today we handle this ad-hoc via `1.5x tail-heavy multiplier` in `salary_source`.
- Decision needed:
  - Standardise which professions qualify for the tail-heavy multiplier (criteria, not case-by-case).
  - Document the multiplier in the role card so students understand the uplift.
  - Consider lifting this into a structured `salary_adjustments` table rather than embedding it in the `salary_source` string.

## 5. Subject-to-career mapping session

- `subject_career_sectors` and `subject_progressions` are seeded structurally but the content mapping (which SQA subjects lead into which career sectors, at what weighting) has not been done end-to-end.
- Pre-req: subjects master list needs to be seeded first (see `CLAUDE.md` -> Subject Pathway & Curriculum Layer).
- Scope: one focused session, probably Opus, working through the 8 CfE areas and tagging each subject to 1 – 3 career sectors with a relevance weighting.

## 6. Broader `ai_rating` sanity-check pass

- Round-1 cleanup fixed the 30 Round-1 roles and the 94 rating-1 roles.
- ~100 roles with pre-Round-1 ratings of 2 – 8 were explicitly left alone this session. Most look reasonable against the 1 – 10 rubric on spot-checks, but a full audit has not been done.
- Low priority -- batch with any future content pass rather than standing it up on its own.

---

## Appended 2026-04-18 -- Round 1 deferrals consolidation

Items surfaced but deliberately deferred during Round 1 (April 2026). Reviewed before each future work session; promoted to active work as timing and priorities allow.

### Data model / schema

#### is_new_ai_role flag semantic clarification
The flag currently conflates two concepts: "role is novel / did not exist pre-2020" versus "AI is central to this role today". Bioinformatics Specialist is tagged false but is AI-intensive; some AI-overlay roles are tagged true but existed before 2020. Options:
- Rename to is_post_2020_ai_role to match the (a) interpretation, plus retag edge cases
- Split into two flags: is_post_2020_role and ai_centrality_flag
- Deprecate the flag entirely and rely on ai_rating >= 8 as the AI-centrality signal

Requires product decision before schema change.

#### growth_outlook canonicalisation
Currently 170+ unique free-text values across 226 roles. Only 4 values map to a canonical enum (Growing / Stable / Declining / NULL). Most free-text values use the canonical value as a prefix ("Stable -- core courtroom work remains human"). Options:
- Canonicalise to 4-value enum, move nuance into new growth_outlook_detail column
- Canonicalise to 4-value enum, drop detail
- Leave as free text and add a display-layer normaliser

Requires product decision.

#### ai_rating retagging pass for pre-Round-1 roles
Round 1 cleanup remapped 30 Round 1 roles plus 95 roles previously at rating 1. The remaining ~100 roles at ratings 2-8 were not re-examined against the new 1-10 rubric. A broader sanity-check pass may be warranted before the ratings become student-facing.

#### Bursary requirement flag logic (AND vs OR)
`match_bursaries_for_student` function uses AND semantics across all `requires_*` flags: a bursary with two flags requires the student to have both. This is the wrong default for most real-world widening-access bursaries, which typically grant eligibility if the student belongs to any one of several qualifying groups. Workaround applied in the April 2026 cleanup: multi-flag bursaries normalised to the single most inclusive flag (Buttle UK, Unite Foundation, Lone Parent Grant family). Proper fix options: (a) add `requirement_logic` enum column (any/all), (b) change function to OR-semantic default, (c) introduce `bursary_requirements` junction table. Decision needed before Round 2 expansion. Description text on affected bursaries should make multi-group eligibility explicit for students.

Related: several `requires_*` columns on `bursaries` are not consulted by the match function at all (`requires_young_carer`, `requires_lone_parent`). Either the function should reference them or the columns should be removed/repurposed -- decide as part of the same review.

##### Function/schema flag mismatch
`match_bursaries_for_student` reads `requires_care_experience`, `requires_estranged`, `requires_carer`, `requires_disability`, `requires_refugee_or_asylum`, `requires_young_parent`. It does NOT read `requires_young_carer` or `requires_lone_parent`, even though those columns exist on `bursaries`. April 2026 cleanup fix applied: migrate affected bursaries to use function-read flags (Young Carer-targeted bursaries -> `requires_carer`; Lone Parent Grant family -> `requires_young_parent`). Column-cleanup decisions for `requires_young_carer` and `requires_lone_parent` (drop, or wire into the function, or add matching `is_lone_parent` to students schema) deferred to Phase 2.

#### student_benefits vs offers consolidation
Two overlapping Layer 2 commercial offer tables exist. `student_benefits` (100 rows, older, flat list) vs `offers` (62 rows, shipped Offers Hub with `offer_categories`, `offer_support_groups` widening-access taxonomy, `saved_offers`, `offer_clicks` analytics, `partners` model for affiliate management). Deferred Round 1 cleanup session did not consolidate because the Offers Hub is production-shipped and dropping it would regress widening-access group coverage (mature-students, esol-eal, rural-island, lgbtq not in bursaries). Decision needed: retire `student_benefits` in favour of `offers`, or keep both with a defined boundary. Requires product and UX scoping before data migration.

### Salary data quality

#### Dentist salary verification
ASHE SOC 2253 was manually estimated during Session 2 (Healthcare) at GBP 37k entry / GBP 90k experienced. Verify against NHS DFT (Dental Foundation Training) and DCT (Dental Core Training) published pay progression before pilot.

#### Tail-heavy professions salary override policy
Several Round 1 roles have ASHE entry figures materially higher than research file "newly qualified" figures: Airline Pilot, Advocate (devilling stipend), Doctor / GP, Solicitor (trainee), senior aerospace engineers. Decide systematic rule: override ASHE with newly-qualified figure, keep ASHE and add caveat, or case-by-case.

#### SOC bundling display strategy
Five Creative Arts & Design roles share SOC 2142 (Graphic and multimedia designers) and display identical ASHE medians: Graphic Designer, Prompt Artist, Games Artist, Animator, Illustrator. Same issue in Social Work & Community (3 roles on SOC 2461; 5 on SOC 3229). Students browsing a sector will see multiple different careers with the same median salary. Options:
- UI overlay using sector-specific surveys (TIGA for games, Creative Scotland freelance rates, BACP counsellor survey)
- Add a "data pooled with: [list]" chip on role cards sharing SOC
- Leave as-is; caveat in salary_notes is sufficient

#### Counsellor salary data freshness
Counsellor (SOC 3224) landed with no Scotland median (UK percentiles only). Verify against BACP Salary Survey and NHS Agenda for Change Band 6 / 7 before pilot.

### Sector coverage

#### Scotland-specific research prompts for regulated professions
Session 6 (Law & Justice) and Session 8 (Social Work & Community) both discovered research files were UK-centric and needed Scottish substitutions (SSSC, Criminal Justice Social Work, Faculty of Advocates, COPFS). Future research prep for regulated professions should explicitly request Scotland-specific detail up front rather than patching UK-centric content.

#### Round 2 Tier 2 sectors
Performing Arts & Entertainment, Education & Teaching, Hospitality & Tourism, Agriculture & Environment, Retail & Customer Service. Target ~+35 roles total. Post-pilot preferred.

### Subject-to-career mapping

#### subject_career_roles table population
Major next work item. Takes all 226 roles and produces the mapping between SCQF-level subject choices and career destinations. Core UX value for students using the pathway planner. Requires:
- Decision on mapping granularity (strict / suggestive / weighted)
- Handling of Broad General Education / Senior Phase differences
- Review process for contested mappings (e.g. can you become a Vet without Higher Physics?)
