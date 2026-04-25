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

## 3. Dentist salary verification ~~[CLEARED 2026-04-18]~~

~~- Current `career_roles` row for Dentist uses ASHE, but the early-career path in Scotland is dominated by NHS Dental Foundation Training (DFT) / Dental Core Training (DCT) pay progression.~~
~~- Need to cross-check the stored percentiles against published DFT/DCT bands and the BDA Scotland pay guidance.~~
~~- Likely lands as either a manual override or a sector-specific salary note.~~

**Resolved** by migration `20260423000016_verify_dentist_salary.sql`: entry £37,000 → £39,603 (NHS Scotland DVT Year 1, 2026/27, PCS(DD) circular -- Scotland uses DVT not DFT); experienced £90,000 → £90,600 (NHS Digital Dental Earnings & Expenses 2023/24 Scotland self-employed average). `salary_needs_verification` cleared.

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

## 6. Broader `ai_rating` sanity-check pass ~~[CLEARED 2026-04-18]~~

~~- Round-1 cleanup fixed the 30 Round-1 roles and the 94 rating-1 roles.~~
~~- ~100 roles with pre-Round-1 ratings of 2 – 8 were explicitly left alone this session. Most look reasonable against the 1 – 10 rubric on spot-checks, but a full audit has not been done.~~
~~- Low priority -- batch with any future content pass rather than standing it up on its own.~~

**Resolved** by migration `20260423000017_retag_pre_round1_ai_ratings.sql`: all 196 pre-Round-1 roles reviewed against the rubric. Seven retagged -- Data Scientist 3→8, Social Services Data Analyst 2→7, Learning Technologist 2→7, Senior Software Developer 4→6, Court Clerk 4→6, Communications Officer 4→6, Public Relations Officer 4→6. Remaining ~189 judged defensible.

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

#### ~~ai_rating retagging pass for pre-Round-1 roles~~ [CLEARED 2026-04-18]
~~Round 1 cleanup remapped 30 Round 1 roles plus 95 roles previously at rating 1. The remaining ~100 roles at ratings 2-8 were not re-examined against the new 1-10 rubric. A broader sanity-check pass may be warranted before the ratings become student-facing.~~

Resolved by migration `20260423000017_retag_pre_round1_ai_ratings.sql`. See also main item 6 above.

#### Bursary requirement flag logic (AND vs OR)
`match_bursaries_for_student` function uses AND semantics across all `requires_*` flags: a bursary with two flags requires the student to have both. This is the wrong default for most real-world widening-access bursaries, which typically grant eligibility if the student belongs to any one of several qualifying groups. Workaround applied in the April 2026 cleanup: multi-flag bursaries normalised to the single most inclusive flag (Buttle UK, Unite Foundation, Lone Parent Grant family). Proper fix options: (a) add `requirement_logic` enum column (any/all), (b) change function to OR-semantic default, (c) introduce `bursary_requirements` junction table. Decision needed before Round 2 expansion. Description text on affected bursaries should make multi-group eligibility explicit for students.

Related: several `requires_*` columns on `bursaries` are not consulted by the match function at all (`requires_young_carer`, `requires_lone_parent`). Either the function should reference them or the columns should be removed/repurposed -- decide as part of the same review.

##### Function/schema flag mismatch
`match_bursaries_for_student` reads `requires_care_experience`, `requires_estranged`, `requires_carer`, `requires_disability`, `requires_refugee_or_asylum`, `requires_young_parent`. It does NOT read `requires_young_carer` or `requires_lone_parent`, even though those columns exist on `bursaries`. April 2026 cleanup fix applied: migrate affected bursaries to use function-read flags (Young Carer-targeted bursaries -> `requires_carer`; Lone Parent Grant family -> `requires_young_parent`). Column-cleanup decisions for `requires_young_carer` and `requires_lone_parent` (drop, or wire into the function, or add matching `is_lone_parent` to students schema) deferred to Phase 2.

#### student_benefits vs offers consolidation
Two overlapping Layer 2 commercial offer tables exist. `student_benefits` (100 rows, older, flat list) vs `offers` (62 rows, shipped Offers Hub with `offer_categories`, `offer_support_groups` widening-access taxonomy, `saved_offers`, `offer_clicks` analytics, `partners` model for affiliate management). Deferred Round 1 cleanup session did not consolidate because the Offers Hub is production-shipped and dropping it would regress widening-access group coverage (mature-students, esol-eal, rural-island, lgbtq not in bursaries). Decision needed: retire `student_benefits` in favour of `offers`, or keep both with a defined boundary. Requires product and UX scoping before data migration.

### Salary data quality

#### ~~Dentist salary verification~~ [CLEARED 2026-04-18]
~~ASHE SOC 2253 was manually estimated during Session 2 (Healthcare) at GBP 37k entry / GBP 90k experienced. Verify against NHS DFT (Dental Foundation Training) and DCT (Dental Core Training) published pay progression before pilot.~~

Resolved by migration `20260423000016_verify_dentist_salary.sql`. See also main item 3 above.

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

### Process / tooling

Items surfaced 2026-04-18 during the cross-session self-improvement 
scaffolding install (commit 29c1a95). None are blocking; each has a 
natural trigger for when to pick it up.

#### ~~Phase 0 orientation guidance is fragmented~~ [CLEARED 2026-04-18]
~~Phase 0 "read these at session start" guidance now lives in three 
places: the new `## Phase 0 orientation` section in CLAUDE.md, the 
existing `## Notes for Claude Code` section in CLAUDE.md, and the 
now-deleted `## Session Startup Checklist` (visible only in git 
history). Consolidate into a single authoritative Phase 0 section and 
prune or cross-reference the other two. Defer to the next housekeeping 
session.~~

Resolved by commit 95623ff: one coherent Phase 0 block covering pre-flight reading, shell, project-state pointers, standing rules, and STOP gates. `## Notes for Claude Code` deleted; Conventions / subagent patterns / session workflow / git hooks sections untouched.

#### Missing feature-session prompt template
`docs/prompt-templates/` currently holds data-expansion, data-cleanup 
and housekeeping starters. A feature-session template would cover work 
like the Offers Hub build, bursary finder UI, and upcoming 
subject-to-career mapping UI. Proposed shape: schema-design STOP -> 
API-surface STOP -> UI-wireup STOP. Write when the next feature 
session is imminent, rather than speculatively.

#### Missing function-repair prompt template
The pattern happened twice in April 2026 (AND-vs-OR bursary fixes in 
`match_bursaries_for_student`, SECURITY DEFINER qualification fixes in 
`log_audit_event` + siblings). Proposed shape: inspect function body 
-> identify bug class -> widen scope to sibling functions/rows -> 
migration with STOP before apply. Write when the next function 
rewrite session surfaces (likely the AND/OR match function rewrite 
logged above under "Bursary requirement flag logic").

#### ~~housekeeping.md template is too terse to be useful~~ [CLEARED 2026-04-18]
~~The current template is close to a no-op vs writing the prompt 
freehand. Either drop it or enrich with a "when to use this template 
vs write ad-hoc" decision gate at the top. Decide during the next 
housekeeping session that actually uses the template.~~

Resolved by commit b78827e: enriched with when-to-use decision gate at top, Problem/Action/STOP-gate/Commit sub-template per task, conditional-commit handling, session-close sequence, reminders block. Decision was enrich over delete because the structure was broadly right; what was missing was STOP-gate treatment and per-task framing.

#### Pre-commit hook variant (nice-to-have, low priority)
Today's post-commit hook nudges learnings capture AFTER the commit 
has landed. A pre-commit warn-earlier variant would give the 
developer a chance to amend before landing. Build only if the 
post-commit nudge proves insufficient in practice -- not speculatively.

---

## Appended 2026-04-19 -- Batch 1 career roles seeding deferrals

### Batch 2+ role seeding

Batch 1 added 39 roles across Armed Forces (7), Healthcare (7), Education (7), Construction (5), Engineering (8), Business & Finance (5). Several sectors still have coverage gaps and newly-identified roles pending research:

- Healthcare & Medicine: Counsellor (salary_notes confirm BACP data gap); Occupational Therapist; Midwife (split from Nurse SOC 2237); Child Nurse; Adult Nurse (SOC split)
- Education & Teaching: Educational Psychologist; Learning Technologist (already seeded under Computing)
- Engineering & Manufacturing: Civil Engineer (distinct from Structural); Electrical Engineer
- Armed Forces: RAF Regiment; Royal Engineers; Intelligence Analyst

Target: ~+30 roles in Batch 2. Post-pilot preferred to avoid seeding at scale before role-card UI is validated.

### salary_entry / salary_experienced vs UK equivalents -- column naming clarification

The schema has both `salary_entry` / `salary_experienced` (Scotland-specific, used where NHS AfC or SNCT applies) and `salary_entry_uk` / `salary_experienced_uk` (UK-wide ASHE percentiles). No column comment distinguishes them. This caused ambiguity in Batch 1 where some roles have identical Scotland and UK figures (Armed Forces AFPRB is UK-wide).

Decision needed before role-card UI: document which column to display as primary, and whether to surface both with a "Scotland vs UK" toggle. Add column comments at DB level matching the intent.

### Armed Forces salary_median_scotland = NULL -- document as by-design

All 7 Armed Forces roles have `salary_median_scotland = NULL`. This is correct: AFPRB pay is UK-wide and ONS ASHE Scotland Table 15 does not separately publish SOC 1171/3311 for Scotland. The NULL should not be treated as a data gap requiring filling.

Consider adding a `salary_scotland_note` or populating `salary_notes` with a standard phrase so the UI can display "UK-wide pay scale applies -- no Scotland variant" rather than a blank median.

### BVNA / BVA 2025 salary data refresh

Veterinary Surgeon and Veterinary Nurse both seeded with 2024 survey data (BVA Voice of the Veterinary Profession 2024; BVNA salary survey 2024) and `salary_needs_verification = true`. Both organisations publish annual surveys. Refresh when 2025 data is available, likely Q3 2025.

### Counsellor salary verification

Counsellor (seeded in a prior batch, SOC 3224) has no Scotland median. Verify against BACP Salary Survey 2024/25 and NHS Agenda for Change Band 6/7 community counsellor rates before pilot. Note: BACP survey covers private practice and third sector as well as NHS -- figures differ significantly by setting.

---

## Appended 2026-04-24 -- Horizon ratings session deferrals

### Full retrofit of horizon rating columns across remaining career_roles

**Progress:** 15 pilot roles (April 2026-04-24) + Healthcare & Medicine 22 roles (2026-04-19) = 37 roles fully rated. Remaining ~227 roles across ~17 sectors. Next sector batch: choose from Armed Forces, Engineering & Manufacturing, Education & Teaching, Law & Justice, Computing & Technology, or another sector with a prepared research file.

Retrofit approach: batch by sector (18 sectors), ~45-60 min per sector batch. Pilot descriptions set the quality bar -- specific, Scotland-anchored, horizon drift explained.

Note: `ai_rating` was dropped 2026-04-25 (historical snapshot at `docs/audits/ai_rating_historical_snapshot_2026-04-19.csv`). The old baseline audit advice no longer applies as a live column check. Instead, cross-reference each role's `ai_rating_2030_2035` against the snapshot CSV during the sector batch -- if the 2030-2035 value seems unexpectedly high or low relative to the historical `ai_rating`, that's the signal to investigate. The pilot found a 13% drift rate (Architect 3→6); assume similar drift in other sectors and budget time for corrections.

### Chef split (holding pattern)

"Chef" renamed to "Chef (Professional Kitchen)" as a scope-clarifying placeholder. A full split into Chain/Volume Kitchen Chef and Independent/Fine Dining Chef is worth doing when the broader role-split audit runs (likely during Hospitality & Tourism sector expansion). The robotics_description already notes the divergence between the two sub-markets, so the data is honest in the interim.

### Horizon rubric re-review cadence

Both rubric docs (`docs/ai-horizon-rubric.md`, `docs/robotics-rating-rubric.md`) set a review cadence of 18-24 months. Target: late 2027. Current assumptions: UK-centric deployment lag, LFP battery cost trajectory, no major regulatory shock (UBI, robot tax, HGV Level 4 approval timeline). Add a calendar prompt before late 2027 session.

### ~~Third AI horizon column (deferred by design)~~ [CLEARED 2026-04-25]

~~Consider adding `ai_rating_2030_2035` if student feedback indicates the jump from current `ai_rating` to `ai_rating_2035_2045` is too large to interpret in a single step.~~

**Resolved:** `ai_rating_2030_2035` added as the early-career horizon column (migration `20260425000002`). Two AI horizon columns now exist: `ai_rating_2030_2035` (early career) and `ai_rating_2040_2045` (mid career), matching the two robotics horizons.

### NULL-state UI: sector average suppression threshold

`app/ai-careers/page.tsx` shows a sector average AI rating for each sector card. With only 15/264 roles rated (5.7%), most sector averages are calculated on 0-2 data points. An average of `5.7` from two roles in a 14-role sector misleads students.

Decision needed before the ai-careers page becomes a primary navigation surface:
- Suppress sector average display until N% of roles in the sector are rated (suggested threshold: 30%)
- Or show average with a "based on N of M roles" qualifier
- Or show a "ratings coming soon" placeholder when below threshold

Also affects `app/subjects/[id]/page.tsx` which shows average AI rating for careers linked to a subject — same threshold question applies.

### Radiographer ai_rating_2040_2045 = 7 -- rubric tension flag

The ai-horizon-rubric.md states regulated professions cap at 5-6 for 2040-2045. Radiographer was rated 7 because image interpretation is task-level AI displacement (NHS Scotland already piloting AI-first chest X-ray reporting). This is a documented exception, not an error -- the description explains the reasoning. However, when the rubric is next reviewed (target late 2027), revisit whether 7 is the right ceiling for the Radiographer class of roles (image analysis directly in AI capability zone, HCPC registration but not GMC-level liability anchor). At least two other potential candidates when other sectors are retrofitted: Sonographer, Medical Photographer.

### Healthcare Assistant / Care Worker robotics_rating_2040_2045 = 5 -- watch item

The robotics jump from 3 (2030-2035) to 5 (2040-2045) is the largest single-horizon jump in the Healthcare sector. It reflects humanoid deployment in care settings driven by Scottish demographic pressures (ageing population, rural labour shortages, Free Personal Care funding). The description makes this explicit. When the robotics rubric is re-reviewed or if credible evidence of slower-than-expected care-home humanoid deployment emerges, revisit this rating. The 5 is the key signal for students: "this role changes materially if you're mid-career in 2040."

### Terminated-postcode user handling

When `students.postcode` holds a postcode that is no longer live (e.g. a student's test account with `EH12 8TS`, terminated 16/1/2008), the Stage 1.5b refresh NULLs the cached `simd_decile` but leaves the terminated postcode string in place. This means the user can re-trigger the same dead-end lookup later. Options for the follow-up session: (a) null the `postcode` field in the same sweep with an advisory flag so the user is prompted for a current postcode on next login; (b) auto-migrate to the recoded successor using the SPD `LinkedSmallUserPostcode` column where one exists; (c) surface the terminated-postcode set in an admin view and email users manually. Captured in `missing_postcodes_log` with `source = 'student_decile_refresh'` for the audit trail.

### Orphan auto_lookup_simd trigger reference -- RESOLVED (Stage 1.5d, 2026-04-20)

Option (a) implemented in migration `20260420000004_restore_auto_lookup_simd_trigger.sql`. The trigger now fires BEFORE INSERT OR UPDATE OF postcode on students, writes `simd_decile` from `simd_postcodes.postcode_normalised` lookup, and sets it to NULL when the postcode has no match (improved behaviour vs the 2024 original, which left stale values). Verified via three transactional tests in Stage 1.5d session. The Stage 1.5b `SET LOCAL ROLE postgres` workaround is no longer required; the sync pattern is `UPDATE students SET postcode = postcode WHERE postcode IS NOT NULL`.

### Canonical `simd_postcodes.datazone` column rename

The column is named `datazone` but stores DZ2011 codes (e.g. `S01008517`). As of Stage 1.5b the refresh writes these same values, but a rename to `data_zone_2011` would be clearer, future-proof when DZ2022 codes become the primary unit, and match the column naming used elsewhere (SIMD lookup's `DZ`, SPD's `DataZone2011Code`). Defer until a session is touching this table anyway -- a straight rename is fine; app code only reads `datazone` via `select('*')` on the public anon client and `types/database.ts`.

### Role maturity tier curation (Stage 1.5e)

The Path 1 auto-assignment via `scripts/assign-role-maturity-tiers.mjs` (v2.1 ruleset) populated 49 of 269 roles -- the remaining 220 are NULL because `role_profiles.description` is written as day-in-the-life narrative without entry-route metadata (only 24/269 mention "degree", only 4/269 mention "apprentice"). Two follow-ups:

1. **Hand-curate the 220 NULL rows.** Roughly: most trades (Bricklayer, Joiner, Plasterer, Electrician, Painter, Hairdresser) should be `foundational`; most degree-only roles (Software Developer, Data Analyst, Marketing Manager) should be `intermediate`; most regulated professions missed by the regex (GP, Vet, Solicitor, Architect-via-ARB) should be `specialised`. A focused 1-hour Opus session reading title + sector + first 200 chars of description and tagging tier should resolve it.
2. **Or add a typed `min_entry_qualification` column to `role_profiles`** with values like `n4_n5`, `higher`, `hnc_hnd`, `degree`, `chartered`, `professional_register` -- then the tier becomes a derived calculation. Cleaner long-term but expands the data model.

Also re-review the 3 borderline `specialised` assignments from Stage 1.5e: Nursery Practitioner, Youth Worker, Addiction Counsellor. SSSC registration is required but entry routes are typically more accessible than the regex implies (HNC / Modern Apprenticeship rather than degree+chartership). Likely should be `intermediate`.

When the NULL bucket drops below ~50 rows, tighten the homepage S2/S3 sector filter in `app/actions/homepage-teaser.ts`. Currently it treats NULL as "not specialised" (permissive no-op); it should instead require `EXISTS role with maturity_tier = 'foundational'` per the original spec.

### Tier threshold re-evaluation after full horizon retrofit

Current tier thresholds (resilient ≤3, transforming ≥7) were calibrated against the old `ai_rating` column and carried forward to `ai_rating_2030_2035` unchanged. This is probably correct for the 2030-2035 column. For `ai_rating_2040_2045`, the drift guidance in `docs/ai-horizon-rubric.md` pushes many knowledge-work roles 2-3 points higher — which means more roles will land at 6-8 under the mid-career horizon.

When 80%+ of roles have horizon ratings, revisit whether the tier boundaries should differ between the two horizon columns, or whether UI copy ("resilient in the near term", "resilient across both horizons") is the right differentiator rather than numeric threshold shifts.

---

## Appended 2026-04-26 -- Quick wins session (exit button / UCAS calc / feedback)

### Feedback admin page: server-component rewrite

`app/admin/feedback/page.tsx` is currently a client component that redirects unauthenticated users and then calls `/api/admin/feedback`. This means a logged-in non-admin user lands on the page briefly before the API 403 is received. Other admin pages (`app/admin/data-quality`, `app/admin/offers`) are server components that do the admin check at render time (no flash). When there is a convenient session to refactor, convert the feedback page to a server component + client sub-component pattern matching those other admin pages.

### Feedback `types/database.ts` update

The `feedback` table was added via Supabase MCP `apply_migration` and is not yet in `types/database.ts` (project convention: never regenerate wholesale). If `feedback` rows are ever queried with the typed client in a future server component, manually add the interface to `types/database.ts` under `public.Tables`. For now all access uses `(supabase as any).from('feedback')` which is correct per convention.

### UCAS Calculator: pre-fill expansion

Current pre-fill only surfaces `higher` and `advanced_higher` grades from `student_grades`. If `national_5` rows are ever added to `student_grades`, the pre-fill banner in `/tools/ucas-calculator` will silently ignore them (N5 has no tariff points, so the omission is academically correct but might confuse a student who expects all their grades to appear).

### Quick-exit button: keyboard shortcut

A keyboard shortcut (e.g. `Escape × 3` within 1s) would allow users to trigger the exit without a mouse click. Accessibility win for users in distress. Not shipped in this session to avoid complexity; worth revisiting if the feature is promoted in GDPR or safeguarding documentation.

---

## Appended 2026-04-25 -- Schools-8 import follow-ups

### Stub student promotion on signup

Pupil import creates stub `students` rows keyed on SCN with a synthetic email (`stub+<scn>@import.pathfinderscot.co.uk`). When a real student signs up, there is no flow that matches the stub to the new `auth.users` row and merges their `school_student_links` + `tracking_entries`. Currently the student creates a fresh account and the stub stays orphaned until an admin manually deletes it. Add a post-signup hook that checks for a matching stub (by SCN, falling back to name + school) and offers to merge. Gate with school admin confirmation if name-only match.

### Full import rollback

Import deletion removes only the `seemis_imports` / `sqa_results_imports` audit row; the data stays. Full rollback (delete `sqa_results` by `import_id`, delete `class_students` by `import_id`, null-out the columns that were set by a pupil import) is deliberately deferred because the blast radius on a mid-term import deletion is large. Worth revisiting once pilot schools have real data and the "I uploaded the wrong file" scenario happens.

### MCP apply_migration rename automation

`scripts/apply-migration.sh` only wraps `supabase db push`. When migrations apply via MCP `apply_migration` (faster inside Claude Code sessions), the timestamp drift still occurs and the rename is manual. Either wrap the MCP call or document the MCP-specific workflow so the next session doesn't rediscover this.

### CES Horizons alumni-blending tuning

The current formula blends current-cohort engagement (80%) with historic alumni positive-destination rate (20%). The ratio is a first guess. Revisit once 5+ schools have 2+ years of destinations data so the component weights can be calibrated against actual student-outcome correlations.

### SCN-less name fallback on SQA + destinations imports

The pupil importer falls back to name matching when SCN doesn't match an existing student. SQA and destinations importers do not -- they skip rows with missing / non-matching SCN. For legacy results data (especially pre-2025 where some schools didn't record SCN in their SQA feeds) a name-based fallback would improve match rates. Add `nameMatches()` to `runSqaImport` + `runDestinationsImport`.

### Transition primaries as a lookup table

`transition_profiles.source_primary` is free text. Once 5+ secondaries use the feature and have stable cluster primaries, promote to a `cluster_primaries` lookup so dashboards can aggregate across all secondaries in a local-authority view.

### Attendance upsert UNIQUE constraint

The attendance importer upserts on (school_id, student_id, academic_year, term) but there is no UNIQUE constraint. Two concurrent admin imports could race. Add `UNIQUE (school_id, student_id, academic_year, term)` to `attendance_records` once pilot schools are running concurrent admin sessions.

### Grade-to-numeric uses hard-coded A-D scale

`lib/school/import-parsing.ts::gradeToNumeric` is a fixed 0-4 scale (A=4, D=1, NoAward=0). National 5 / Higher / Advanced Higher have different grade scales and different tariff points. Use the existing `grade_scales` table with `ucas_points` for more accurate value-added calculation.

### XLSX sheet picker

`parseXlsx()` reads `wb.SheetNames[0]`. If a school submits a workbook with a summary tab first and data on tab 2, rows go missing silently. Add a sheet-picker to the upload UI when the file has more than one non-empty sheet.

### Stub + name fallback policy

Name-match fallback on pupil import currently logs a warning and proceeds. This is fine for cluster schools with unique names but risks silent misattribution for common names (e.g. a new "James Smith S4" matching an existing unrelated "James Smith" in the linked cohort). Consider adding a confirmation step or requiring full DOB match for name-only merges.

---

## Appended 2026-04-25 -- Schools-9 (Stripe billing + feature gating) deferrals

### School-API tier gating

`/api/school/dyw/*`, `/api/school/parents-evening/*`, `/api/school/cpd/school-summary` etc. are NOT tier-gated at the API layer -- only the UI is gated via `<PremiumGate />`. A sophisticated standard-tier user could hit the API directly. Add a `requirePremiumTier()` guard in each premium-only API route before pilot billing go-live.

### Subscription-expiry blocks on non-dashboard school pages

The `<SubscriptionOverlay />` is rendered on `/school/dashboard` only. Deep-linking to `/school/dyw` or `/school/guidance/123` bypasses the overlay for expired schools. Either (a) move the overlay into a shared layout that every `/school/*` route includes, or (b) add a server-side subscription check to each page.

### Founding-school discount on Stripe portal upgrades

`STRIPE_FOUNDING_SCHOOL_COUPON_ID` is applied in the checkout route only. If a founding school upgrades standard -> premium via the Stripe customer portal, the coupon is NOT carried over. Document that founding schools must resubscribe via `/school/subscribe` (not the portal) to keep the discount, OR configure the portal's upgrade flow to preserve coupons.

### Trial-warning notification branding

The trial-expiry sweep uses the generic `genericSchoolMessageEmail` template. Consider moving to a dedicated `trialExpiryReminderEmail` template that matches other school-branded email messaging (CTA button, school logo slot, etc.).

### Trial-warning notification fallback recipients

Trial-expiry warnings target `is_school_admin = true` only. A school whose only admin leaves mid-trial could miss the warning. Extend to `can_manage_school = true` staff as a fallback.

### Webhook dead-letter queue

The school webhook routing falls back from metadata -> DB lookup. If both fail (e.g. webhook fires before the checkout-completed write lands), the event is logged as "Customer not found" and lost. Add a short retry + dead-letter queue for webhook events that hit this path.

### MCP apply-migration post-rename automation

Ninth consecutive school session where the MCP `apply_migration` tool produced a different timestamp than the drafted local migration filename. `scripts/apply-migration.sh` only wraps `supabase db push`. Options: (a) wrap the MCP call similarly, (b) document the workflow so the manual rename is always immediate after `apply_migration`, (c) always prefer `supabase db push` + the wrapper for DDL when Docker is available. The wrapper was shipped in Schools-7 but has no effect on the MCP path.

### Subscription state module promotion

`lib/school/subscription.ts` is a single source of truth for trial/tier state. Phase-2: audit remaining places that read `subscription_status` or `subscription_tier` as strings directly and migrate them to use `getSubscriptionState()` so drift between callers can't happen (e.g. if we ever add a new status like `paused` or `past_due`).

---

## Appended 2026-04-25 -- Graduate outcomes, rankings, personal statement drafts

### Bulk seed of Discover Uni / HESA graduate outcomes for 410 courses

Schema + display components are shipped (`components/courses/graduate-outcomes.tsx`, `components/universities/rankings-section.tsx`, compare-by-subject outcomes columns). Only 1 of 410 courses currently has outcomes data populated and only 14 of 18 universities have rankings populated. Next sessions should:
- Request a Discover Uni CSV export (or use their public HEP data API if available) for all Scottish providers.
- Write an import script that matches on UKPRN + subject area, populates `employment_rate_15m`, `highly_skilled_employment_pct`, `salary_median_1yr/3yr/5yr`, `student_satisfaction_pct`, `continuation_rate_pct`, `subject_ranking_cug`, `outcomes_data_year`, and sets `outcomes_needs_verification=false` for rows that match cleanly (true for partial matches so admins can spot-check).
- Populate `graduate_employment_rate` + `student_satisfaction_overall` at institution level from HESA open data tables (Scottish providers only).
- Leave specialist providers (Glasgow School of Art, Royal Conservatoire of Scotland, Scotland's Rural College, UHI) with NULL general-UK rankings -- they don't meaningfully appear in Complete University Guide / Guardian / Times general league tables. Add a display-layer advisory in `rankings-section.tsx` for these institutions so the section doesn't silently disappear.

### Rankings verification pass against primary sources (CUG / Guardian / Times)

Existing 14 universities have `rankings_needs_verification=true` but the values may pre-date the 2026 editions. Secondary sources (e.g. thetab.com) show some DB values drift by 5-25 places vs the 2026 CUG list. Next session should cross-check every row against the primary CUG / Guardian / Times sites, update where they differ, and clear the flag. One of this-session's updates (`Strathclyde ranking_times = 11`) is verified and landed, but the rest weren't overwritten to respect the previous admin import.

### is_new_ai_role semantic clarification (carried over)

Already logged further up. Still unresolved.

### Personal statement drafts -- UX / analytics polish

Shipped in Schools-9b: migration `20260424195138_personal_statement_drafts.sql` creates the table with RLS (students see own + leadership of school see read-only), API at `/api/personal-statement/drafts` (GET/PUT/DELETE), client auto-sync every 30s + on-blur + manual "Save now", school guidance profile shows per-Q char counts with traffic lights. Phase-2 ideas:
- Allow guidance staff to add feedback threads directly on the draft (comment sidebar) rather than requiring them to open the student's live tool to read the text.
- Version history so students can revert to an earlier draft state (currently one row per student, last-write-wins).
- Cross-session analytics: which prompts drive the longest answers, where do students get stuck on Q2 vs Q3.
- Export to DOCX or direct UCAS format once UCAS publishes the 2026-entry format API.
- Surface draft-in-progress on the student's main dashboard so S6 students don't have to navigate back to `/tools/personal-statement` each time.
- Optional: parent view of char counts (not text) for engaged parents who want to nudge their S6 child; gated behind a per-student "share with parent" toggle that defaults off.

### Personal statement localStorage migration path

First time an authenticated student opens the drafting tool, their existing anonymous localStorage draft (if any) is lifted into the DB via the first PUT (see the load effect in `personal-statement-client.tsx`). A student who drafted offline, signed in, then drafted MORE offline could find the offline tail overwritten on next cloud save. Consider a conflict-resolution prompt if both localStorage and DB have content and they diverge by more than N characters.

## Appended 2026-04-25 -- Results Day hub + worksheet + EC page deferrals

### Verify the 18 university admissions contacts in `data/results-day-contacts.json`

Built with `needs_verification: true` on every entry. Edinburgh and Heriot-Watt have verified phone numbers; the other 16 have `null` for `admissions_phone` and a "See Clearing page" placeholder in the rendered table. Before Results Day 2026 (4 August), an admin should:
- Phone each university's switchboard or check the live Clearing landing page to confirm the dedicated Clearing hotline number.
- Update `admissions_phone`, `admissions_email`, and `clearing_page` in the JSON.
- Verify the `clearing_page` URL still 200s -- some universities restructure their admissions site annually.
- Set `needs_verification: false` on each row that has been confirmed, so the page can later filter out unverified entries if needed.
- Update `_meta.last_reviewed`.

### Anonymous worksheet -- save / share path for logged-in users

The new `/tools/subject-choice-worksheet` is intentionally anonymous-friendly (no sign-in, no DB writes, all state in React). The existing `/tools/worksheet` is the personalised version that pulls from the student profile. Phase-2 idea: when an anonymous user fills in the new worksheet and is logged in, offer "save this worksheet to my account" via a new `worksheet_drafts` table (or reuse `student_subject_choices` JSONB). The cleaner approach is to merge the two worksheets into one with a "use my saved choices" toggle, but that's a bigger UX call.

### Sector-aware "missing subject" suggestions on the worksheet

Currently the worksheet's "What you might be missing" section only flags career sectors the student has selected but their subjects don't connect to. Phase-2: also surface specific subject suggestions ("Adding Maths would unlock 47 more courses and connect to STEM Engineering"). Requires a richer query than the current `course_subject_requirements` count -- need to compute course-count delta per candidate subject, capped at 3-5 suggestions to keep the worksheet uncluttered.

### Worksheet PDF as a download (not browser print)

Both worksheets currently use `window.print()`. This works on desktop browsers but mobile Safari / Chrome's "Save as PDF" route is hidden in the share menu and unfamiliar to students. Phase-2: integrate `@react-pdf/renderer` or a server-side Chromium-headless render so the "Download as PDF" button produces a real .pdf download. Caveat: adds ~2MB to the bundle (react-pdf) or requires a Vercel Edge / serverless Chromium dependency.

### Extenuating circumstances vs difficult circumstances -- decide the long-term IA

Two pages now exist: `/support/difficult-circumstances` (narrative tone, helpline-led, comprehensive) and `/support/extenuating-circumstances` (procedural / formal-process focus, action-oriented). Both link to each other. This-session's decision was to ship both because the spec was explicit about a new URL, but the IA could be cleaner with one page that has two clear modes (Get help / Make a formal claim). Phase-2 review: gather user analytics for 2-3 months, then decide whether to merge, redirect, or keep both.

### Results Day decision tree -- pre-fill from result outcome

The new `ResultsDayDecisionTree` is a manual chooser. The existing `AdviceCard` block in the same page auto-detects an outcome from `predicted vs actual` grade comparison. Phase-2: when a logged-in student enters their actual results, pre-select the matching radio in the decision tree so they don't have to repeat the choice. Avoid making it irreversible -- students may want to explore other branches.


---

## LA Portal -- deferred from Authority-1 (2026-04-25)

### Idle timeout wiring to authority layout

`hooks/use-idle-timeout.tsx` is built (8h timeout, 5-min warning modal,
signOut + redirect on expiry) but not wired into any layout. Need a
client layout wrapper covering `/authority/dashboard` and
`/authority/settings/**` routes that mounts the hook with `enabled`
when the user has an active session. Authority-2.

### QIO school assignment UI

The schema supports QIOs being assigned to a subset of schools
(`authority_staff` has `assigned_school_ids uuid[]`) but there is no UI
to set this from the staff management page. Authority-2.

### Additional tables from architecture spec not yet built

Architecture doc (Section 5) specifies three tables not yet created:
- `authority_saved_reports` -- QIO/analyst saved report configs
- `authority_alerts` -- configured alert rules per LA
- `platform_engagement_log` -- LA-level event log for audit trail

Build these in Authority-3 alongside the dashboard metrics feature.

### LA verification admin route

LAs register but verification is manual (Pathfinder admin must flip
`local_authorities.verified = true` directly in Supabase Studio).
Architecture spec calls for a `/admin/authorities` admin route with
verify/reject actions. Build in Authority-2 alongside the dashboard.

### `visible_to_authority` boolean on schools table

Architecture doc (Section 2e) specifies schools can opt out of LA
visibility via a `visible_to_authority boolean DEFAULT true` column on
the `schools` table. Column does not yet exist. Add in Authority-2
migration alongside dashboard query implementation.

### Founding LA pilot programme flag

Architecture doc (Section 10e) specifies a founding-LA tier (first 3
LAs get 12 months free). Needs a `founding_la boolean DEFAULT false`
column on `local_authorities` and Stripe subscription logic to honour
it. Defer to Authority-14 (Stripe session per the build plan).

### Authority-2 deferred items

#### `calculateSchoolDataQuality` not yet wired into LA dashboard

`lib/authority/data-quality.ts` is implemented and tested at build time,
but no LA-facing route or dashboard component consumes it yet. Wire into
the Authority dashboard (student data quality panel) in Authority-3.

#### Idle-timeout hook still unwired in authority layout (carried from Authority-1)

`hooks/use-idle-timeout.tsx` exists but is not mounted in any layout wrapper
for `/authority/**` routes. Add to a client layout boundary in Authority-3.

#### LA admin verification UI still manual

`/admin/authorities` route for verify/reject still not built. Manual
Supabase Studio workaround remains. Authority-3.

#### `/account/profile` not linked from account nav

The profile page (`/account/profile`) exists and works but is not surfaced
in the account navigation sidebar or the saved-comparisons page nav.
Add a "Profile" link in the account area (Authority-3 or standalone session).

#### SEEMIS import: no link from school/import hub

`/school/import/demographics` has no entry point from `/school/import`.
Add a card to the import hub page for demographics upload (Authority-3).

---

## LA Portal -- deferred from Authority-3 (2026-04-25)

### Wire `resetEngagementContext()` into auth state changes

`lib/engagement/track.ts` caches the current student/school context at
module scope. On sign-in/sign-out the cache is stale until a page
reload. `resetEngagementContext()` is exported and ready to call from
`hooks/use-auth.tsx`'s `onAuthStateChange` handler. Low-impact while
single-tenant pilot is one student per browser, but worth wiring before
production traffic where a shared device (school library, careers
adviser desk) could see two different students sign in back-to-back.

### Schedule `flag_stale_offers` now that pg_cron is installed

CLAUDE.md notes that `flag_stale_offers()` was authored but never
scheduled because pg_cron was not installed on the project. As of
Authority-3 the extension is live (migration `20260425150251`). A
follow-up session can run a single `cron.schedule(...)` call to wire
the weekly refresh that's been deferred since the offers hub shipped.

### Materialised view refresh on first dashboard load

Both `mv_authority_subject_choices` and `mv_authority_engagement` are
empty until the next pg_cron tick. For a freshly-verified LA the
dashboard will look empty for up to 6 hours. Two options for the
next session: (a) trigger an immediate refresh from the server-side
verify-LA admin route, (b) add a "refresh now" button for LA admins
that hits a service-role endpoint.

### Authority dashboard data-quality drill-down

The dashboard now shows aggregated student data quality across all
schools in the LA. A QIO drilling into a single school will want
the same view scoped to that school -- `calculateSchoolDataQuality`
already supports it but no per-school dashboard route exists.
Authority-4 or later.

### Remaining LA Portal entities (architecture section 5)

`authority_saved_reports` and `authority_alerts` tables exist (created
in Authority-1) but have no UI yet. `platform_engagement_log` was added
in Authority-3. The schema side of section 5 is now complete; UI sits
behind feature flags / placeholder tiles on the dashboard.

### LA admin verification UI (still manual)

Carried over from Authority-2. `/admin/authorities` still not built;
manual verification via Supabase Studio remains the workflow. Worth
addressing before any real LA pilot to avoid Pathfinder admin needing
direct DB access.

### Engagement tracking is anon-only -- not yet wired into school staff

Staff and parents are not students and currently get no engagement log
rows. This is correct for the LA dashboard scope (the spec only counts
student engagement). Phase-2: a separate `staff_engagement_log` if
school-side dashboards ever need to track teacher tool adoption per the
"Teacher adoption" metric in section 3d of the architecture doc.

### Reconcile the four `currentAcademicYear()` implementations

Authority-4 added `lib/academic-year.ts` as the canonical source of
truth using the architecture-spec `YYYY-YY` hyphen format. Four
pre-existing helpers still ship their own format-divergent versions:

- `lib/school/cpd.ts` and `lib/school/dyw.ts` -> `2025/26` (slash, 2-digit suffix)
- `lib/school/import-parsing.ts` -> `2025-26` (hyphen, matches the new module)
- `app/school/tracking/page.tsx`, `app/school/tracking/classes/new/page.tsx`,
  `app/school/choices/new/page.tsx` -> `2025/2026` (slash, 4-digit)

The slash variants persist data into `attendance_records.academic_year`,
`class_assignments.academic_year`, `bursaries.academic_year`,
`tracking_cycles.academic_year` etc. as text. A reconciliation pass
needs to (a) decide on the canonical format (default: hyphen, matching
the new module + architecture spec), (b) backfill existing rows in
each affected table, (c) replace the four legacy helpers with imports
from `lib/academic-year`. Risk: the school-portal CPD / DYW filters
may break mid-migration if data and code aren't backfilled together.

### Backfill engagement view's academic_year column for historical events

`get_academic_year` now buckets engagement events by Edinburgh-local
academic year, but events logged before
`20260425154714_fix_academic_year_function_tz` were grouped under the
old (UTC-evaluated) function. The materialised view was rebuilt from
scratch in the same migration, so the live data is consistent with
the new function. No backfill needed today, but worth a sanity check
when the view first carries production volume across an Aug 1 boundary.

---

## Appended 2026-04-25 -- Security review P1 #6/#7 deferrals

### `get_user_subscription` p_user_id privilege escalation

`public.get_user_subscription(p_user_id uuid)` is `SECURITY DEFINER` and accepts a caller-supplied UUID. Any authenticated user can invoke `supabase.rpc('get_user_subscription', { p_user_id: '<another user uuid>' })` and read back that user's subscription status (plan name, period end, cancel date).

Surfaced during Codex second-opinion on the P1 #6 fix (2026-04-25). Not introduced by the session -- the parameter pre-exists in the baseline schema. Subscription data is low-sensitivity (no payment method, no PII beyond dates), but the pattern is wrong.

Fix options:
- Drop `p_user_id` parameter; function always uses `auth.uid()` (correct for client calls)
- Keep parameter but add `IF p_user_id IS DISTINCT FROM auth.uid() AND NOT (SELECT usesuper FROM pg_user WHERE usename = current_user) THEN RAISE EXCEPTION ...`
- Prefix the admin-facing variant with `admin_` and keep the client variant clean

Pick up before public launch. The parameter is only used in admin tooling (if at all); check callers first.

### Stripe payments null payment_intent edge case (P2 #8 scope)

`handlePaymentSucceeded` and `handlePaymentFailed` now skip recording when `invoice.payment_intent` is null (free trials, £0 invoices). A future pass should add a `stripe_invoice_id` UNIQUE column to `stripe_payments` (P2 #8 from security review) to make all invoice events recordable and idempotent, not just those with a payment intent.
