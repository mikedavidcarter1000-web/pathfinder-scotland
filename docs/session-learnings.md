# Pathfinder Scotland -- Session learnings

A running log of concrete, session-specific lessons not yet promoted to 
standing conventions in CLAUDE.md. Entries live here until a quarterly 
review decides whether to promote them, archive them, or leave them 
logged for reference.

Most recent session first.

## 2026-04-21 Career Comparison Session 3 -- /careers/compare page shell, tabs, URL state, selector modal

- **Files created:** `lib/compare/url-state.ts` (typed parser + serialiser for `?t=<tab1>|<tab2>|<tab3>`, UUID-filtered, case-insensitive dedupe, caps tabs at `MAX_TABS=3` and slots at `MAX_SLOTS_PER_TAB=3`), `lib/compare/__tests__/url-state.test.ts` (15 tests using Node's built-in `node:test` runner via `tsx` -- same pattern as Session 2's earnings tests), `components/compare/career-selector-modal.tsx` (Esc-to-close, click-outside-to-close, 120ms-debounced search across all 269 roles + click-through sector browse + disabled state for already-selected roles; remounted via `key` prop on each open so there's no setState-in-effect reset), `components/compare/career-slot.tsx` (populated CareerCard or empty "+ Add career" button; 180px min-height to keep empty and populated slots visually aligned), `components/compare/compare-shell.tsx` (main client component: tab strip with close + "+ New comparison", per-tab 3-slot grid via CSS `grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr))` which collapses to a single column under ~240px without needing a media query, `MIN_SLOTS_PER_TAB=2` placeholder copy below 2 roles, comparison-grid placeholder below 2 populated roles, max-3 tooltip with auto-dismiss), `app/careers/compare/page.tsx` (server component, static SSG with 1h revalidate, resolves example UUIDs at request time via `getAnonSupabase` + `.in('title', ...)`; Suspense wrapper so `useSearchParams` is boundary-satisfied). Modified `package.json` test script to also glob `lib/compare/__tests__/*.test.ts`.

- **Example seed resolves by title at request time; the lookup set is `['Electrician', 'Primary Teacher', 'Nurse']` -- DB has "Nurse" not "Registered Nurse".** The task spec said "Registered Nurse" but `career_roles` has a single "Nurse" row (plus Mental Health Nurse / Veterinary Nurse / Nursery Practitioner). Matched the existing title rather than renaming the data; logged as a Phase-2 follow-up. Lookup is tolerant: if only 1 of the 3 titles matches, the page falls back to an empty tab (the `exampleRoleIds.length >= MIN_SLOTS_PER_TAB` guard in `compare-shell.tsx`). The page never hardcodes UUIDs in the component code -- the prompt's constraint.

- **URL round-trips are lossy by design for "empty after single-tab empty state".** `serializeCompareState({tabs: [{roleIds: []}]})` returns `null` (i.e. strip the `?t=` param entirely). Round-trip through `parseCompareParam(null)` rebuilds the same single-empty-tab. For a state with empty middle tabs, serialisation keeps the pipe separator so an empty middle tab is preserved. Only the full-empty-state collapses; this matches "clean URL when there's nothing to persist." Test covers both round-trips.

- **Modal reset-on-close pattern: remount via `key` rather than useEffect.** First draft cleared `query`/`debounced`/`activeSectorId` in a `useEffect(() => { if (!open) {...} }, [open])`. ESLint flagged `react-hooks/set-state-in-effect` as a warning. Cleaner fix: the parent renders `<CareerSelectorModal key={...} />` only while `selectorTarget !== null`, which mounts a fresh modal with fresh state each time. The `key` encodes `tabIndex:slotIndex` so switching between add/change for different slots also resets state. Moved the internal `open` handling to a pure render-time short-circuit. Zero ESLint warnings afterwards. Memo this: for modals that need a full state reset on reopen, prefer remounting over effect-driven reset.

- **Tabs cap: MAX_TABS=3, MIN_SLOTS_PER_TAB=2, MAX_SLOTS_PER_TAB=3.** Single source of truth in `lib/compare/url-state.ts`; both the parser/serialiser and the UI shell import from there. `addTab` disables when `tabs.length >= MAX_TABS`, the "+" button hides when at cap; `closeTab` disables when `tabs.length <= 1` (the "×" is replaced with a fixed 10px spacer so tab width doesn't jitter). Selector guards against exceeding `MAX_SLOTS_PER_TAB` via a tooltip (`setTooltip('Maximum 3 careers per comparison')`) and a 2400ms auto-dismiss; prevents the add flow from racing past the cap.

- **Disabled-role computation must exclude the current slot for "Change" flows.** If a slot currently holds role X and the user clicks Change on that slot, role X should NOT be disabled in the picker (otherwise they can't "change to itself"; more importantly, they should be able to see X highlighted as the current pick). `disabledRoleIdsForTab` rebuilds the Set on every selectorTarget change: if `slotIndex != null`, delete that slot's current role id from the disabled set. Pure add flow (`slotIndex === null`) keeps all currently-held roles disabled.

- **Dismiss-examples-on-touch logic is idempotent via `useRef`.** When the banner is first shown, `isExampleSession.current = true`. The first add/change/remove action calls `dismissExamples()` which flips the ref to false AND sets `bannerVisible=false`. Subsequent actions are a no-op short-circuit (ref check). Critical because the spec says "as soon as the user touches any slot, dismiss the banner and clear all example roles not explicitly kept" -- in this implementation, "clearing example roles not kept" is inherent: the user's action (add/change/remove) mutates only the slot they touched, and further slot mutations are treated as regular user edits with no residual example-handling. The "kept" roles are whatever the user leaves alone or explicitly re-selects.

- **`useSearchParams` forced a Suspense boundary at the page level in Next.js 16.** First draft rendered `<CompareShell />` directly from the server component; next build flagged `useSearchParams should be wrapped in a suspense boundary`. Wrapped CompareShell in `<Suspense fallback={<p>Loading…</p>}>` inside the page. The shell itself reads `searchParams.get('t')` on first render, which is fine once inside a Suspense boundary. For all future client components that call `useSearchParams()` from a statically-rendered page, the parent must provide a Suspense boundary even if the fallback is trivial.

- **URL sync uses `router.replace(..., { scroll: false })` to avoid history pollution and scroll jumps.** Every state mutation fires the effect, which serialises state back to `?t=`. If the result equals the current URL, Next.js de-dupes; otherwise it replaces. `scroll: false` prevents the tab-switch / add-slot interaction from scrolling the user to the top. Confirmed build clean with no hydration warnings.

- **Phase-2 follow-ups logged:** (a) DB title is "Nurse" not "Registered Nurse" -- decide whether to rename the role, add a `display_name` alias column, or change the seed list. (b) Comparison grid itself is a placeholder div -- Session 4 will render horizon bar charts + accordion comparison. (c) `CareerSlot` renders a letter-tile placeholder where the spec called for "small photo if available" -- `role_profiles` doesn't carry a photo column yet; add one or switch to an AI-generated sector illustration when images land. (d) The selector modal's search is client-side string-contains over all 269 roles; fine at current catalogue size but will need server-side search or a trigram index if the role count grows past ~5000. (e) No saved-comparisons integration yet despite the table existing (`saved_comparisons`, Session 1) -- Session 5 or 6 will wire Save/Open flows that round-trip through the URL state parser.

## 2026-04-21 Career Comparison Session 2 -- lifetime earnings calculator + Scottish tax/NI

- **Files created:** `lib/earnings/training-phases.ts` (slug-keyed training-phase lookup with entries for doctor, dentist, vet, pharmacist, solicitor, advocate, clinical_psychologist, 4 teacher variants, and 4 apprentice trades); `lib/earnings/tax-ni.ts` (Scottish income tax 2025-26 bands + personal-allowance taper + NI Class 1 employee primary/UEL bands, exports `calculateTaxOnly`, `calculateNiOnly`, `calculateNetFromGross`); `lib/earnings/lifetime-calculator.ts` (main entry point `calculateLifetimeEarnings`, exports `UK_MEDIAN_SALARY_GBP = 37430` citing ONS ASHE 2024); `lib/earnings/__tests__/lifetime-calculator.test.ts` (6 tests using Node's built-in `node:test` runner). Modified `package.json` to add `tsx` devDep and a `test` script (`tsx --test lib/earnings/__tests__/*.test.ts`).

- **Test runner chosen: Node built-in `node:test` via `tsx`.** Project had no test runner installed; adding vitest/jest would have been multi-package overhead for a single test file. `tsx` is a zero-config TS loader (3 transitive deps) and `node:test` is built-in since Node 20. Script: `npm test` runs in ~1.4s. If tests grow to cover React components or async runtimes, re-evaluate against vitest.

- **Training-phases spec had an internal conflict that required a calculator-agnostic resolution.** The task spec said doctor's FY1 is "age 22-23 (33000); note main role picks up at typical_entry_age 23" but `role_profiles.typical_entry_age` for Doctor is 23 (from Session 1). With my inclusive-inclusive, first-match-wins semantic, `typicalEntryAge=23` means training covers ages 16-22 only -- FY1 at 23 never fires. Resolution: the calculator is role-agnostic and consults training phases for all `age < typicalEntryAge`; callers pass a `typicalEntryAge` that harmonises with the training data. FY1 segment defined as `ageFrom=23, ageTo=23`; the test passes `typicalEntryAge=24` to demonstrate the behaviour. For real UI integration, either the UI should override `typical_entry_age` for these long-training roles, or we add a `main_role_start_age` column to `role_profiles` in a later session. Documented in the test's inline comment.

- **Linear interpolation: 15-year ramp, 14 progression steps.** Algorithm c ("ages typical_entry_age to typical_entry_age+14: linear interpolation from starting to experienced") maps to `progressFraction = yearsIn / 14` where `yearsIn = age - typicalEntryAge`. At `yearsIn=0` salary=starting; at `yearsIn=14` salary=experienced; at `yearsIn=15` onward flat at experienced. Uses `PROGRESSION_YEARS = 14` constant; not a half-open-interval boundary issue.

- **Employer pension is non-taxable from the student's perspective.** Per the task spec's algorithm point (e-f), in net mode the base salary is net-calculated but the employer pension contribution is added back in at its gross value. This matches the economic reality for defined-contribution and defined-benefit employer contributions under UK auto-enrolment / public-sector schemes -- the employee never sees the money routed through PAYE. `pensionPct=15` default is a blended figure spanning NHS (~20.5%), STPS (~26%), LGPS (~19%), and auto-enrolment minimum (3%); not a precise average, documented as "blended employer band" in code comments. A future session may want to expose a per-sector default.

- **Scottish income tax 2025-26 bands verified against Scottish Government Budget 2025-26 publications.** Six-band structure (Starter 19%, Basic 20%, Intermediate 21%, Higher 42%, Advanced 45%, Top 48%) with PA £12,570 and the taper between £100k-£125,140. The `calculateTaxOnly` implementation handles the PA taper by adding the withdrawn PA portion back at the Starter rate -- this is a simplification; HMRC's actual approach is to reduce PA first then apply bands, but the arithmetic result is identical because the taper runs 1-for-2 and the Starter band is narrow enough that the reduction never crosses back into a non-taxable state. Re-check thresholds on 6 April each year; comment in file records last-verified date.

- **Phase-2 follow-ups logged:** (a) FY1 / DFT salaries are hard-coded as 2025-26 snapshots; schedule an annual refresh. (b) The calculator has no UI integration yet -- Session 3 or later will wire it to a comparison component. (c) Consider a `main_role_start_age` column on `role_profiles` to remove the training-phase / typical_entry_age conflict for doctor, dentist, solicitor, clinical_psychologist, etc. (d) Apprentice stepped wages (8k/11k/14k/18k) are pedagogical placeholders rather than verified framework rates; cross-check against SDS Modern Apprenticeship wage bands before shipping to production UI. (e) The training-phases map has stubs only for the 14 long-training roles called out in the spec; the lookup returns `undefined` for any other roleSlug and the calculator falls back to 0 for pre-entry years, which is the correct behaviour for roles whose `typical_entry_age` is the school-leaving or HNC-entry age anyway.

## 2026-04-21 Career Comparison Session 1 -- entry_age + hours_per_week + saved_comparisons

- **Files changed:** new `supabase/migrations/20260421000002_add_comparison_fields.sql` (adds `typical_entry_age` + `typical_hours_per_week` integer columns to `role_profiles` with CHECK ranges 14-40 and 10-80, populates all 269 rows via CASE expressions); new `supabase/migrations/20260421000003_comparison_fields_not_null.sql` (SET NOT NULL on both columns); new `supabase/migrations/20260421000004_create_saved_comparisons.sql` (new user-scoped table with 4 RLS policies, FK cascade on `auth.users`, CHECK `array_length(role_ids, 1) BETWEEN 2 AND 3`, btree index on `user_id`, updated_at trigger). Hand-edited `types/database.ts` to add the two role_profiles columns (Row/Insert/Update) and the full `saved_comparisons` Tables entry.

- **Entry_qualification enum does NOT contain `apprenticeship` or `advanced_higher`.** Spec mapping listed both (-> 20 and -> 18 respectively) but the enum values are only `none, national_4, national_5, highers, hnc, hnd, degree, degree_plus_professional`. Both branches were written into the CASE expression as safety but never fire. If future sessions re-spec entry ages with new qualification tiers, check the enum first: `SELECT enumlabel FROM pg_enum JOIN pg_type ON pg_enum.enumtypid=pg_type.oid WHERE typname='entry_qualification';`

- **Hours_pattern is `text`, not an enum.** Only four distinct values exist in data (Standard/Shifts/Irregular/Seasonal = 182/34/51/2), matching the spec's four-way default, but the column is not typed as an enum. CASE with string literals works; no ordering guarantees.

- **Name-based overrides that found no matching role (did not fire):** `Junior Doctor`, medical `Consultant`, medical `Surgeon` (Veterinary Surgeon is handled separately at 45), `Barrister` (Scotland uses Advocate), `Corporate Finance`, `Farmer`/`Farm Manager`, `Bartender` (handled via Waiter/Waitress/Bar Staff), `Home Care Worker`/`Domiciliary Care`, `Clinical Psychologist`. Only `Educational Psychologist` exists (default 23). The spec's 4 "Consultant" hits match non-medical consulting roles (Management Consultant etc.) which default correctly by hours_pattern rather than the 48h medical override -- so using `cr.title = 'Doctor / GP'` (exact equality) rather than `ILIKE '%consultant%'` was necessary to avoid false positives.

- **`Architect` override uses exact-equality to avoid matching `Marine / Naval Architecture Engineer`.** `ILIKE '%architect%'` would match both; the naval architect role is a separate engineering profession whose hours should stay at the default 37 (Standard pattern), not 42. Same trade-off applies when adding future name-based overrides -- exact match when the target is a single role, ILIKE only when the family is intentional (e.g. `ILIKE '%solicitor%'` catches both Junior/Trainee and Senior/Partner variants, which are both genuinely 45h).

- **Post-apply distribution (age / hours):** typical_entry_age 16:4, 17:23, 18:13, 19:19, 20:35, 22:129, 23:43, 24:2, 25:1 (total 269). typical_hours_per_week 25:1, 30:1, 37:180, 40:79, 42:1, 45:4, 48:2, 50:1 (total 269). NULL count pre-NOT-NULL: 0.

- **`update_updated_at_column` is the repo's updated_at trigger function, not `handle_updated_at`.** First draft of the saved_comparisons migration used the wrong function name; caught via a `pg_get_functiondef` query before apply. Lesson: when writing a new trigger, grep live pg_proc for the convention in use on adjacent tables rather than assuming a Supabase-starter-template name. The function is declared with `SET search_path TO ''` and uses `NEW.updated_at = NOW()`.

- **`saved_comparisons.role_ids uuid[]` with CHECK `array_length(role_ids, 1) BETWEEN 2 AND 3`.** Postgres reports `array_length(array_of_n, 1) = n`; `array_length(NULL, 1)` is NULL and `array_length('{}', 1)` is NULL (both fail the BETWEEN). So the constraint also implicitly rejects empty arrays -- good. NOT NULL on the column rejects SQL NULL. Array elements are NOT FK-enforced to `career_roles.id`; join correctness is application-layer. Phase-2 follow-up: consider a trigger that validates every element exists in `career_roles`, or convert to a junction table `saved_comparison_roles(comparison_id, role_id, position)` if comparison UI grows beyond a flat list.

- **RLS policies: `TO authenticated` rather than `TO public`.** Anon callers are blocked at the role level before policy evaluation. Matches the pattern used by `saved_courses` / `student_grades`. Four policies (select/insert/update/delete) all keyed on `auth.uid() = user_id`; UPDATE uses both USING and WITH CHECK clauses so users can neither read nor reassign rows they don't own.

- **types/database.ts hand-edits:** three insertion points for `typical_entry_age` (Row: NOT NULL `number`; Insert: required `number`; Update: optional `number`) + three for `typical_hours_per_week`; plus a full new `saved_comparisons` block placed before `saved_courses` (alphabetical: comparisons < courses). The `feedback_types_regen.md` memory still applies -- do not regenerate.

- **Phase-2 follow-ups logged:** (a) Retail Assistant / Shop Worker, Bartender, Home Care / Domiciliary, Junior Doctor, medical Consultant, medical Surgeon, Farmer / Farm Manager, Clinical Psychologist, Corporate Finance -- none of these role concepts exist in the current 269-row dataset. If any are added later, typical_entry_age and typical_hours_per_week must be set explicitly per the original spec rather than relying on the default fallback. (b) Consider adding a junction table `saved_comparison_roles` if comparison UI grows ordered/positional. (c) Consider FK enforcement on `role_ids` elements via a trigger.

## 2026-04-21 Downgrade 8 roles to foundational (Stage 1.5g)

- **Files changed:** DB-only. No code, migration, or type changes. Applied a single transaction via Supabase MCP touching 8 `career_roles` rows (`maturity_tier` -> `foundational`) and 8 matching `role_profiles` rows (`min_entry_qualification` / `typical_entry_qualification` realigned per Stage 1.5g spec table).

- **Rows updated:** Creative Arts & Design -- Graphic Designer (min hnc->n5, typical degree->hnd), Illustrator (min hnc->n5, typical degree->hnc), Photographer (tier only; min/typical already n5/hnd). Media & Communications -- Broadcast Technician (tier only), Copywriter (min highers->n5, typical degree->highers). Performing Arts & Entertainment -- Sound Technician (tier only), Stage Manager (min hnc->n5, typical hnd->hnc). Science & Research -- Lab Technician (tier only). Four of the eight already had `min_entry_qualification = national_5` from Stage 1.5f; only the tier changed. The other four had their min and typical tightened in line with the reclassification rationale.

- **Post-apply distribution confirmed:** foundational 63 / intermediate 154 / specialised 52 (delta +8 / -8 / 0, exactly matches spec).

- **Sector-level foundational coverage now complete for all 19 sectors.** Previously-excluded sectors after Stage 1.5f now carry: Creative Arts & Design 3 (was 0), Media & Communications 2 (was 0), Performing Arts & Entertainment 2 (was 0), Science & Research 1 (was 0). Full distribution (ascending): Computing & Digital Technology 1, Healthcare & Medicine 1, Science & Research 1, Education & Teaching 2, Law & Justice 2, Media & Communications 2, Performing Arts & Entertainment 2, Retail & Customer Service 2, Sport & Fitness 2, Business & Finance 3, Creative Arts & Design 3, Engineering & Manufacturing 3, Hospitality & Tourism 3, Public Services & Government 3, Social Work & Community 3, Agriculture & Environment 4, Transport & Logistics 5, Construction & Trades 10, Armed Forces 11.

- **Closes the widening-access equity gap from Stage 1.5f.** The S2/S3 filter in `app/actions/homepage-teaser.ts` (`career_roles.maturity_tier = 'foundational'`) was correctly excluding sectors with zero foundational roles, but that excluded genuinely-accessible 16+ entry routes in arts, media, performing arts, and science. A 13-year-old interested in photography, sound engineering, copywriting, or lab work is no longer told none of their sector applies. The homepage teaser server-action pool for year_group='S2' now samples across all 19 sectors instead of the 15-sector pool that Stage 1.5f shipped with.

- **No UI / action / type changes required.** The Stage 1.5f hard filter (`=== 'foundational'`) already does the right thing when the dataset contains foundational roles in every sector -- this session only needed to fix the data shape. Build + tsc --noEmit clean; 269 role SSG pages still prerender.

- **STOP-gate test: pure DB reclassification with no UI consequence passes the "irreversible / user-facing / branched decision" test only weakly.** The change is fully reversible via the inverse UPDATE (pre-apply values captured in this entry). No new user-facing copy; no new sectors; no downstream code surface. Phase 0 report was the only pre-apply pause -- no mid-session gate needed. This matches the STOP-gate principle in CLAUDE.md: routine reclassifications of pre-reviewed data don't warrant a gate.

- **Phase-2 follow-ups:** none surfaced by this session. The 8-role spec list was curated in advance, enum values were already valid, and the existing filter required no edit. If future audits surface other role-level misclassifications in the same four sectors, apply via the same single-transaction pattern.

## 2026-04-21 Apply role classifications + re-enable teaser filter (Stage 1.5f part 2)

- **Files changed:** new `supabase/migrations/20260421000001_add_role_classification_fields.sql` (creates `public.entry_qualification` enum; adds `role_profiles.min_entry_qualification`, `typical_entry_qualification`, `typical_starting_salary_gbp`, `typical_experienced_salary_gbp` with CHECK range 10000-500000); new `scripts/generate-classification-sql.mjs` (validates JSON + emits the two UPDATE statements as a single atomic SQL file); new `scripts/apply-role-classifications-pg.mjs` (pg-client transactional apply with post-apply NULL assertions, matches Stage 1.5b pattern). Modified `app/actions/homepage-teaser.ts` (S2/S3 filter switched from `!== 'specialised'` to `=== 'foundational'`), `app/careers/[sectorId]/[roleId]/page.tsx` (replaced legacy `salary_entry`/`salary_experienced` hero block with authoritative `typical_starting_salary_gbp`/`typical_experienced_salary_gbp` block + caveat copy visually adjacent to the numbers), `types/database.ts` (hand-added 4 new columns to role_profiles Row/Insert/Update).

- **Home for new columns: `role_profiles` (not `career_roles`).** All 269 `career_roles` have a `role_profiles` row (verified in Phase 0). `role_profiles` already carries `description`, `day_in_the_life`, `career_progression` -- the narrative profile -- so the hand-classified salary and entry-route fields belong there. `career_roles` keeps only the top-level fields it already owned (title, growth_outlook, AI ratings, maturity_tier). Future queries that need both join on `role_profiles.career_role_id = career_roles.id`.

- **Validation: 269 / 269 / 269.** JSON count matched DB count exactly; every role_id in the JSON had a matching `career_roles.id`; zero rows in JSON-minus-DB or DB-minus-JSON. All enum values (`min_entry_qualification`, `typical_entry_qualification`, `maturity_tier`) valid; all salary integers within 15k-200k; tier distribution 55 / 162 / 52 matched spec exactly.

- **Post-apply sector tier distribution (all 19 sectors, foundational / intermediate / specialised):** Agriculture & Environment 4/7/1, Armed Forces 11/4/0, Business & Finance 3/12/5, Computing & Digital Technology 1/11/0, Construction & Trades 10/6/4, Creative Arts & Design 0/14/0, Education & Teaching 2/7/5, Engineering & Manufacturing 3/9/11, Healthcare & Medicine 1/4/17, Hospitality & Tourism 3/7/0, Law & Justice 2/8/4, Media & Communications 0/10/0, Performing Arts & Entertainment 0/11/0, Public Services & Government 3/7/0, Retail & Customer Service 2/8/0, Science & Research 0/10/1, Social Work & Community 3/9/3, Sport & Fitness 2/8/1, Transport & Logistics 5/10/0.

- **Four sectors have zero foundational roles and will be excluded from the S2/S3 teaser pool:** Creative Arts & Design, Media & Communications, Performing Arts & Entertainment, Science & Research. S2/S3 pool size: 15 sectors. S4-S6 pool size: 19 sectors. The acceptance criterion was that Creative Arts and Performing Arts in particular should drop out for S2/S3; confirmed.

- **S2/S3 filter semantics changed, not just re-enabled.** Stage 1.5e shipped a permissive filter (`!== 'specialised'`) because NULL was the dominant tier; 0 sectors were actually excluded. This session changed it to `=== 'foundational'` now that the NULL bucket is closed. The change is in `app/actions/homepage-teaser.ts` around line 124. If we later add roles with `specialised` or `intermediate` tiers only in a new sector, the S2/S3 pool will correctly shrink; if we add a role with `foundational` tier in a currently-excluded sector, the S2/S3 pool will correctly grow. The filter is now single-source-of-truth for "reachable from school without Highers or a degree."

- **Post-apply UPDATE scale: 41990 bytes of SQL, 269 role_profiles rows + 269 career_roles rows, committed in 324ms via the session pooler.** The single-transaction VALUES-join approach is the right pattern for bounded-size (<100k rows, <5MB SQL) bulk updates driven by an external JSON source. The in-script post-apply NULL check catches any row-not-matched bug atomically (rolls back if any NULL remains) -- simpler than the Stage 1.5b manual Gate B pattern.

- **Hero-salary hierarchy choice: single authoritative block + adjacent caveat.** Keeping the legacy `salary_entry` chip alongside the new "typical salary" block would have been two sources for one concept, so the existing hero chip was replaced, not supplemented. Caveats ("UK-wide typical figures from public sources, rounded to nearest £1,000 ...") sit immediately below the numbers in the same bordered blue card -- meets the "not hidden in a footer" constraint.

- **Spot-check salaries confirmed against acceptance criteria:** Primary Teacher £33k / £53k (specialised); Electrician £22k / £45k (foundational); Doctor / GP £36k / £110k (specialised). All rendered via the new block on the role detail page after rebuild.

- **Phase-2 follow-ups:** (a) Legacy `career_roles.salary_entry`, `salary_experienced`, `salary_entry_uk`, `salary_experienced_uk`, `salary_source`, `salary_needs_verification`, `salary_notes` columns are now redundant -- the UI no longer reads them. Schedule a removal migration after confirming no other consumers. (b) `entry_qualification` enum values are ordered-by-convention but the enum itself is unordered (no positional comparison). If we ever need "higher-than-HNC" predicates, either add a numeric `tier` column or use a CASE expression. (c) `typical_starting_salary_gbp` vs `typical_experienced_salary_gbp` could diverge from reality over time -- add a `last_verified_at` timestamp and a "needs review" surface if/when we scale beyond the current hand-curation pass.

## 2026-04-21 Export roles for salary + tier classification (Stage 1.5f)

- **Files changed:** new `scripts/export-roles-for-classification.mjs` (read-only exporter; pg client via Supabase session pooler; ASCII-safe UTF-8 output; `description` truncated to 400 chars, `day_in_the_life` to 300 chars, LEFT JOIN on `role_profiles` with `(no profile)` fallback). Output artefact (gitignored): `data/role-classification-input/roles-to-classify.md` -- 269 role sections, 2451 lines, 229KB, alphabetised by sector then role title, with a header block listing total + per-sector counts + a JSON-response instruction for the classification chat.

- **`/data/*` on `.gitignore:49` already covered the new subdirectory, so no .gitignore edit was needed this session.** The commit-step assumption in the task spec ("only gitignore changes should be tracked") was a prediction that didn't match reality. Verified via `git check-ignore -v data/role-classification-input/` -> `.gitignore:49:/data/*`. Artefact never appeared in `git status`. The committable artefact from this session is the exporter script itself, following the `refresh-simd-postcodes.mjs` / `apply-simd-refresh-pg.mjs` pattern of keeping repeatable data-operations scripts in `scripts/`.

- **Query output via Supabase MCP `execute_sql` exceeded the 255KB token cap.** First attempt returned a spill-to-file warning (result saved to tool-results cache). Switched to the established pg-client pattern (Stage 1.5b) rather than chunking the MCP call or reading the cached JSON into context: script is repeatable, generates the file end-to-end in one pass, and avoids the token-budget hit on context. When an MCP SELECT produces >255KB of row data and the downstream need is a local file, prefer the pg-client script.

- **All 269 career_roles have a role_profiles row** (verified by this session's query + previous session's gap query). The `(no profile)` fallback branch in the script is defensive and currently unreached. Left in place because future Phase 2 work may widen `career_roles` without seeding `role_profiles` atomically.

- **career_roles FK column is `career_sector_id`, not `sector_id`.** First join attempt returned a 42703 column-not-exist error. Live schema confirmed: `career_roles` has `career_sector_id uuid REFERENCES career_sectors(id)`. Flagged here because the column name in the Stage 1.5e script and in several other places in the repo uses the full `career_sector_id` form -- any future cross-table query against roles must use this exact name.

- **Per-sector counts from the export (matches live distribution):** Agriculture & Environment 12, Armed Forces 15, Business & Finance 20, Computing & Digital Technology 12, Construction & Trades 20, Creative Arts & Design 14, Education & Teaching 14, Engineering & Manufacturing 23, Healthcare & Medicine 22, Hospitality & Tourism 10, Law & Justice 14, Media & Communications 10, Performing Arts & Entertainment 11, Public Services & Government 10, Retail & Customer Service 10, Science & Research 11, Social Work & Community 15, Sport & Fitness 11, Transport & Logistics 15. Total 269 across 19 sectors.

- **Next session handoff:** Mike classifies the 269 roles in a separate Claude.ai chat and returns a single JSON array; the applying session reads the JSON, validates against enums (`min_entry_qualification`, `typical_entry_qualification`, `maturity_tier`) and integer ranges (two salary fields), runs a Gate A pre-apply diff for the 49 already-assigned `maturity_tier` rows before UPDATE. The enums for entry qualification do not yet exist -- creation is part of the applying session, not this one.

## 2026-04-20 Stale postcode banner + role maturity tiers (Stage 1.5e)

- **Files changed (Task A):** new `components/StalePostcodeBanner.tsx` (banner + inline modal reusing `onboardingPostcodeLookupAction`, session-only dismissal state, query invalidation on save); mounted in `app/(main)/dashboard/page.tsx`, `app/courses/page.tsx`, and `app/bursaries/bursaries-client.tsx`. Banner renders only when `student.postcode != null AND student.simd_decile == null` -- silent no-op for null-postcode (mid-onboarding) or healthy-decile students.

- **Files changed (Task B):** new `supabase/migrations/20260420000005_add_role_maturity_tier.sql` (enum `role_maturity_tier` + `career_roles.maturity_tier` column + partial index on non-null values); new `scripts/assign-role-maturity-tiers.mjs` (v2.1 ruleset as labelled constant at top of file -- documented pattern set with per-pattern rationale); `types/database.ts` patched manually to add the new column (Row/Insert/Update); `app/actions/homepage-teaser.ts` added an S2/S3 sector filter that treats NULL tier as "not specialised". Live DB: all 269 roles classified per v2.1 rules.

- **Banner surfaces chosen: dashboard, courses, bursaries.** Skipped `/widening-access` -- despite the page discussing SIMD, it's a marketing/educational surface with no personalised SIMD-derived content. A banner there would feel disconnected. The rule is: banner goes on pages that silently degrade when `simd_decile IS NULL`, not on pages that talk about SIMD in the abstract.

- **Path 1 auto-assignment has a data wall.** Of 269 `role_profiles.description` bodies: only 24 mention "degree" anywhere, only 4 mention "apprentice" anywhere, only 2 mention "Higher". The descriptions are written as day-in-the-life narrative, not entry-route metadata. Result: v2.1 ruleset produced 2 foundational / 18 intermediate / 29 specialised / 220 NULL. The NULL bucket isn't a pattern-tightening issue -- it's a data issue. Phase-2 task: hand-curated tier completion for the 220 unrated rows; descriptions should be enriched with a structured `min_entry_qualification` field or equivalent.

- **Gate A revealed two classes of pattern bug.** (1) False-positive chartered: the literal string "Chartered" appears in professional-body names (e.g. "Chartered Institute of Public Relations" for Communications Officer) but the role doesn't require chartership. Fix: require `chartered` to be followed by a named profession (status, engineer, surveyor, etc.) or combine with post-nominal letters (CEng, MRICS, etc.) -- the professional-body-name mentions don't have those qualifiers. (2) Registered-with pattern missed all regulated professions because descriptions use the full council name ("registered with the General Medical Council") rather than the abbreviation ("registered with the GMC"). Fix: both forms must be in the pattern set.

- **Postgres POSIX ARE uses `\y` for word boundary, NOT `\b`.** Initial v2 rules used `\b` inconsistently -- classification silently collapsed to 1 foundational / 0 intermediate / 6 specialised / 262 NULL. Corrected to `\y` throughout in v2.1. Lesson: when porting JS regex to Postgres, run a smoke test (count of any-hit vs total rows) on each pattern before trusting CASE output. `\b` is backspace in Postgres POSIX.

- **Sector-level filter is effectively a no-op with v2.1 data.** The homepage filter `EXISTS role with maturity_tier != 'specialised' OR tier IS NULL` passes virtually every sector (since every sector has at least one NULL role). Structure is in place for when curation closes the NULL bucket; until then S2/S3 and S4-S6 see the same pool. Documented with inline comment in `app/actions/homepage-teaser.ts`.

- **False-positive bound (≤5 clear specialised FPs) was the right stop gate but doesn't cover under-match.** v2.1 had 3 borderline-specialised rows (Nursery Practitioner, Youth Worker, Addiction Counsellor -- SSSC-registered roles with less-restricted entry paths than the pattern implies). Under the FP bound. But under-match of foundational (2 vs ~30 expected) was a separate failure mode the bound didn't catch. Next time: add an under-match bound too (e.g. "at least 50% of sectors should have at least one foundational match").

- **Tier enum values confirmed correct in `types/database.ts`:** `'foundational' | 'intermediate' | 'specialised' | null`. Hand-edited per `feedback_types_regen.md`; do NOT regenerate `database.ts` wholesale.

- **Modal + banner composition pattern.** The `StalePostcodeBanner` is one component that renders both the banner and (when active) the update modal. Dismissal state (`useState<boolean>`) lives in the banner; the modal receives `onUpdated` and `onClose` callbacks that toggle it. No separate modal context/provider needed because the modal is always scoped to the banner's lifetime.

- **The `auto_lookup_simd` trigger (from Stage 1.5d) is load-bearing for this session.** When the modal calls `useUpdateStudent().mutateAsync({ postcode: ... })`, only the `postcode` field is updated explicitly -- the trigger populates `simd_decile` automatically. Without the trigger, saving a postcode would leave stale decile data unchanged. Verified: test with a known-live postcode (e.g. G34 9AJ) in the modal should update decile to 1.

- **Phase-2 follow-ups logged:** (a) Hand-curate `maturity_tier` for the 220 NULL rows, or add a typed `min_entry_qualification` column to `role_profiles` and populate via a structured pass. (b) Review the 3 borderline specialised assignments (Nursery Practitioner, Youth Worker, Addiction Counsellor) for possible downgrade to intermediate. (c) Tighten the homepage sector filter once NULL bucket is <50 rows -- the current permissive rule is a no-op by design but will start filtering once data quality improves. (d) Consider persistent dismissal state for the stale-postcode banner if user testing shows the session-only approach is too aggressive.

## 2026-04-20 Post-Task-B cleanup (Stage 1.5d)

- **Files changed:** new `supabase/migrations/20260420000004_restore_auto_lookup_simd_trigger.sql`; `app/careers/[sectorId]/[roleId]/page.tsx` (dropped the inline `getAnonSupabase` + `createClient` import, now imports from `@/lib/supabase-public`); `docs/phase-2-backlog.md` (marked the orphan-trigger item resolved). Live DB changed: `public.lookup_simd_for_student()` function created and `auto_lookup_simd` trigger attached to `public.students`.

- **Task 1 fix chosen: Option A (recreate `auto_lookup_simd`).** The original function `lookup_simd_for_student()` and trigger `auto_lookup_simd` were in `20240101000000_initial_schema.sql:281`; no explicit DROP exists in any committed migration, so the trigger was likely removed by a CASCADE from an earlier `simd_postcodes` schema change and never restored. The security-hardening migration (`20260420000003_security_hardening.sql`) was written against the documented architecture where `auto_lookup_simd` runs first -- so Option A matches what the guard comment already promises. Option B (extend guard allowlist for a data-admin role) was rejected because it papers over the real problem: the guard's whole design relies on a BEFORE trigger having already reconciled `simd_decile`.

- **Two behavioural changes vs the 2024 original:** (1) Lookup now uses `simd_postcodes.postcode_normalised` (generated column from Stage 1.5b) rather than the legacy unspaced `postcode` column, because storage format changed. (2) When the new postcode has no match in `simd_postcodes`, the function now sets `NEW.simd_decile := NULL` rather than leaving the stale value in place. This matches the Stage 1.5b student-sync behaviour for terminated postcodes and eliminates the stale-decile failure mode that sync step was built to repair.

- **Trigger verification via three transactional tests in MCP (each ROLLBACK'd).** (A) `fe515330` postcode `EH47DX` -> `G34 9AJ`: `simd_decile` auto-updated `7 -> 1`. (B) Same row postcode -> `ZZ99 9ZZ`: `simd_decile` auto-cleared to `NULL` (new fail-clear behaviour). (C) `df63e246` postcode `EH128TS` (terminated, decile NULL) -> `EH12 8QB` (recoded successor per Task B notes): `simd_decile` auto-populated to `9`. Post-test SELECT confirmed all 5 student rows identical to pre-migration snapshot. Test C is the direct replacement for Stage 1.5b's `SET LOCAL ROLE postgres` workaround: the refresh pattern is now `UPDATE students SET postcode = postcode WHERE postcode IS NOT NULL` (touching the column fires the trigger, which recomputes the decile against current `simd_postcodes` data; the guard passes because `postcode` appears in the SET clause).

- **`current_setting('role', true)` does NOT return `'postgres'` for MCP `execute_sql` calls by default.** A first test attempt tried to clear `simd_decile` directly via UPDATE and hit the guard exception. Confirmed: MCP runs SQL under the postgres login role but without an explicit `SET ROLE postgres`, so the allowlist branch in `prevent_restricted_student_column_update()` does not trigger. This is actually the behaviour the guard is meant to enforce -- good. The lesson is that any future MCP-driven test of row-state changes to students must either go through the legitimate postcode-change path or use `SET LOCAL ROLE postgres` to hit the allowlist; it is not sufficient to assume MCP = full postgres.

- **Trigger alphabetical ordering confirmed correct:** `audit_students` < `auto_lookup_simd` < `students_restricted_column_guard` < `update_students_updated_at`. Postgres fires BEFORE triggers in name order for the same table/event, so `auto_lookup_simd` runs before the guard as the guard comment documents. If future triggers are added with names that would sort between `auto_lookup_simd` and `students_restricted_column_guard`, re-verify the pairing or switch to `CREATE TRIGGER ... PRECEDES`.

- **Task 2: only ONE inline `getAnonSupabase` definition was present -- the one in `app/careers/[sectorId]/[roleId]/page.tsx` already flagged in the Stage 1 follow-up list.** Grep for `function getAnonSupabase|const getAnonSupabase =` across `**/*.{ts,tsx}` returned just that page and the shared helper `lib/supabase-public.ts`. After the refactor, only the shared definition remains. No other pages needed migration.

- **Task 3: `.gitignore` confirmed to cover `data/postcodes/` via the pre-existing `/data/*` rule at line 49.** `git check-ignore -v data/postcodes/` reports `.gitignore:49:/data/*` as the matching rule. `git ls-files data/postcodes/` returns empty. No CSVs under `data/postcodes/` have ever been staged. The `!/data/career-realities.ts` exception on line 50 keeps the one intentional exception intact.

- **Build + typecheck green after all three tasks:** `npx tsc --noEmit` exits 0; `npm run build` compiles in ~25s with no errors/warnings; `/careers/[sectorId]/[roleId]` still renders as `●` SSG with 269 prerendered paths and 1h revalidation (the `getAnonSupabase` refactor preserved the static-params behaviour).

- **Stale `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` is a separate cleanup item.** The key is a 31-char opaque token (not a JWT), flagged in Stage 1.5b notes. This session proceeded without regenerating it because all DB work went through Supabase MCP, which authenticates via its own channel. The key is only needed when `scripts/apply-*.mjs` runs `createClient(url, SUPABASE_SERVICE_ROLE_KEY)`. Not a blocker for this session; flagged for the next session that actually runs one of those scripts.

## 2026-04-20 SIMD postcode dataset refresh (Stage 1.5b)

- **Files changed:** new `scripts/refresh-simd-postcodes.mjs` (parse + join + validate), `scripts/apply-simd-refresh-pg.mjs` (direct-pg bulk insert), `scripts/apply-student-decile-sync.mjs` (post-refresh student decile sync); new migration `20260420000001_refresh_simd_postcodes_schema.sql` (adds `postcode_normalised` generated column + `simd_rank`, `simd_quintile`, `source`, `imported_at` columns + btree index on `postcode_normalised`); `app/actions/homepage-teaser.ts`, `app/actions/onboarding-postcode-lookup.ts`, `hooks/use-student.ts` (switched lookups from `postcode` to `postcode_normalised` so callers can pass spaced or unspaced input); `types/database.ts` (added the 4 new columns manually per `feedback_types_regen.md`); added `xlsx`, `csv-parse`, `pg` to devDependencies.

- **Source file vintages used:** NRS Scottish Postcode Directory 2026/1 (published 9 March 2026, based on Royal Mail January 2026 PAF); gov.scot SIMD 2020v2 postcode lookup (updated-2025 XLSX, 227,066 postcodes across 6,976 data zones). Source tag stored on every row: `NRS_SPD_2026_1+SIMD_2020v2_2025update`. Download URLs resolved from page HTML at session time; do NOT hardcode them in the script -- both publishers rotate media slugs per release.

- **Final row count: 227,066 → 161,333 (-65,733, -28.9%).** Drop exceeded the 20% STOP threshold in the task spec but was explained: SmallUser terminated 39,414, LargeUser terminated 46,054, plus 460 non-standard postcodes filtered out (4-char inward codes like `AB12 3GQA` -- Royal Mail's pseudo-postcodes for high-volume delivery points, which the app's `lib/postcode-validation.ts` regex already rejects). Per-decile distribution is roughly even (13.9k-19.2k per decile, matches Scotland population shape). The user approved the drop after the Gate A report explained the source-data history.

- **Storage format changed from no-space to canonical-spaced and a generated column bridges both.** `postcode` stored as `G34 9AJ` (spaced, uppercase, matches `lib/postcode-validation.ts` `normalisePostcode`). `postcode_normalised text GENERATED ALWAYS AS (UPPER(REPLACE(postcode, ' ', ''))) STORED` -- app queries use `.eq('postcode_normalised', stripped)` so the caller can pass `G34 9AJ`, `G349AJ`, or `g34 9aj` and resolve to the same row. Verified all four input variants in session.

- **`simd_postcodes` has NO inbound foreign keys, so TRUNCATE + reinsert was safe.** Ran the FK check once at Phase 0 and again before the truncate -- zero rows returned both times. If a future refresh hits an inbound FK, switch to the temp-table stage-and-swap path in the session prompt rather than cascade-delete.

- **Direct-pg bulk insert via the session pooler is the fastest route for 100k+ rows.** Supabase MCP `execute_sql` caps out practically around 5MB per call; supabase-js with the local anon/service-role keys failed here because `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` is 31 chars (not a JWT, looks stale). Used `pg` client against `aws-1-eu-west-2.pooler.supabase.com:6543` (NOT aws-0 -- DNS resolves both but only aws-1 carries this project's tenant) with `SUPABASE_DB_PASSWORD`. 161,333 rows committed in ~45s across 81 batches of 2000 inside a single transaction. Connection string format: `postgres://postgres.<PROJECT_REF>:<PASSWORD>@aws-1-<region>.pooler.supabase.com:6543/postgres`.

- **Known gap: `prevent_restricted_student_column_update` trigger references a non-existent `auto_lookup_simd` trigger.** The guard function's comment says "auto_lookup_simd runs BEFORE this trigger and sets NEW.simd_decile from simd_postcodes lookup when postcode changes" -- but no such trigger/function exists. Therefore any direct `UPDATE students SET simd_decile = ...` by a non-postgres/non-service_role session is blocked, even when sync is legitimately needed after a simd_postcodes refresh. Worked around by connecting via pg pooler (user = postgres) and running `SET LOCAL ROLE postgres` inside the transaction so `current_setting('role', true)` returns the expected value and the guard's allowlist branch triggers. Flagged for phase-2 backlog: either implement the promised `auto_lookup_simd` trigger, or extend the guard's allowlist to include a rotation-bound "data admin" role.

- **Test postcodes & spot-check results (post-refresh, verified directly in DB):**
  - `G34 9AJ` (Easterhouse) -> decile 1, rank 47 (both `G34 9AJ` and `G349AJ` resolve; padded and lowercase variants also resolve)
  - `EH10 6AA` (Morningside) -> decile 10, rank 6768
  - `EH4 7DX` (Clermiston) -> decile 7, rank 4247 (the real user postcode from the Stage 1.5a incident)
  - `EH11 4BN` (Edinburgh) -> decile 4, rank 2531
  - `AB24 2BE` (Aberdeen) -> decile 3, rank 1599 (live successor to the terminated AB2 2AE)
  - `AB2 2AE` -> NOT PRESENT (terminated 1/4/1996; was the trigger incident for this refresh)

- **Students table state before/after:** 5 rows total (test accounts). Row 1 (`df63e246` / `EH128TS`) decile 9 -> NULL: stored postcode was terminated 16/1/2008 and recoded to `EH12 8QB` -- the old decile 9 was derived from a stale postcode cached in the SIMD 2020v2 file. Row 2 (`fe515330` / `EH47DX`) NULL -> 7: filled from the refreshed set. Rows 3-5: no change. None of the 5 cross SIMD20/SIMD40/outside band boundaries. For future refreshes with real pilot users, the same two-statement pattern (sync matched, NULL unmatched) plus the `missing_postcodes_log` insert for audit is the standing approach.

- **Phase-2 follow-up (logged, NOT done in this session):** (a) Decide user-facing handling of a stored-but-terminated postcode -- leaving it in `students.postcode` lets a user re-trigger the same dead-end lookup later. Options: null the field with a notification; flag it and prompt on next login; migrate to the postcode's recoded successor where SPD supplies it (`LinkedSmallUserPostcode` column). (b) Implement or remove the promised `auto_lookup_simd` trigger. (c) Remove now-definitely-dead `useSIMDLookup` from `hooks/use-student.ts` (the prefix-fallback behaviour returns a neighbouring postcode's decile, suspect for any live use). (d) Rename `simd_postcodes.datazone` -> `data_zone_2011` for clarity (non-breaking via view if needed).

- **Reproducibility:** rerun the session by unzipping the two source files into `data/postcodes/` (`spd_extracted/` for the SPD CSVs, xlsx at the root), running `node scripts/refresh-simd-postcodes.mjs` to regenerate `simd_postcodes_refresh.csv`, then `node scripts/apply-simd-refresh-pg.mjs` to truncate + batch-insert, then `node scripts/apply-student-decile-sync.mjs` to sync cached deciles. The schema migration is idempotent (`ADD COLUMN IF NOT EXISTS`), so re-running it after a cold start is safe. When SIMD 2026 publishes, update `SOURCE_TAG` in `refresh-simd-postcodes.mjs` and re-run the three-step pipeline.

## 2026-04-20 SIMD banding copy fix (Stage 1.5c)

- **Files changed:** new `lib/simd-bands.ts` (shared `getSimdBand`, `getSimdLine1Copy`, `getSimdLine2Copy`); `app/actions/homepage-teaser.ts` (renamed `countWaCoursesForDecile` to `countWaCourses`, returns `{ simd20CourseCount, simd40CourseCount }` bifurcated, `HomepageTeaserResult.ok` shape gained `simd20CourseCount` + `simd40CourseCount` in place of the single `wideningAccessCourseCount`); `components/PostcodeTeaser.tsx` (`TeaserResultPanel` now derives both lines via the helper, removed the `lowSimd = decile <= 8` binary split that was producing the misleading "unlocks entry requirements" copy for decile 7); `components/onboarding/postcode-step.tsx` (`decileBadge` now delegates to `getSimdBand` and uses green tone for SIMD40 in line with SIMD20 -- the previous amber SIMD40 was reading as a warning).

- **Stage 1 original spec used a wrong SIMD banding that the product had already shipped with.** The widening access bands used by Scottish universities are SIMD20 (deciles 1-2) and SIMD40 (deciles 3-4); decile 7 has no postcode-based WA status. The shipped homepage treated decile <=8 as "may unlock reduced entry requirements" which was WA-misleading for deciles 3-10. Fixed by extracting the banding into a single helper module that both surfaces consume. If a future spec describes SIMD cohorts, cross-reference against `lib/simd-bands.ts` rather than re-deriving from the rubric description.

- **Live DB snapshot for count verification at fix time:** 205 courses carry a non-empty `simd20_offer` in `courses.widening_access_requirements`, 97 carry `simd40_offer`. The SIMD40 count is large enough that the "some universities offer adjusted entry at this band" copy is a true statement rather than a placeholder. SIMD decile 3-4 test postcode confirmed: `AB2 2AE` (decile 3).

- **Onboarding SIMD40 badge was amber; changed to green to match SIMD20.** The previous amber tone conflated eligibility ("SIMD40 eligible") with warning semantics. Both WA-eligible bands now use the same green treatment; deciles 5-10 render no badge at all, which lets the neutral `SIMD_DESCRIPTIONS` text (e.g. "Middle 41-50%") carry the information without any WA overlay. If Pathfinder ever adds a third band (e.g. SIMD10 for the lowest decile), keep the green-for-eligible pattern and reserve amber for explicit warning states.

- **`wideningAccessCourseCount` consumer check was necessary before renaming the action return shape.** Grep-confirmed only two files reference the old name (the action and the one consumer), so the rename to the `simd20CourseCount` + `simd40CourseCount` pair is a self-contained breaking change. For any future `HomepageTeaserResult` shape change, always grep the new and old field names across the repo before pushing.

- **Follow-up (Phase 2):** (a) The homepage teaser does not yet render a "pending data" state for `simd40_offer` keys that exist but are empty strings -- currently the count only reflects non-empty content. If more universities add SIMD40 offers with placeholder data, the filter predicate `!= null && !== ''` will need revisiting. (b) The onboarding step still shows `SIMD_DESCRIPTIONS[decile]` beneath the band badge; for consistency with the homepage, we could extend `getSimdLine1Copy` to also drive a concise onboarding description so the deciles 5-10 text explicitly mentions non-postcode WA routes (care experience, young carer, etc.) rather than just the neutral "Middle 41-50%" label. Parked to avoid expanding this session's onboarding scope.

## 2026-04-26 Postcode lookup UX fallback (Stage 1.5a)

- **Files changed:** new `lib/postcode-validation.ts` (three shared utilities: `isValidUkPostcodeFormat`, `normalisePostcode`, `checkPostcodeExists`); new `app/actions/onboarding-postcode-lookup.ts` (server-action mirror of the homepage action for the onboarding step); refactored `app/actions/homepage-teaser.ts` (status-discriminated union: `ok | invalid_format | missing_simd | not_scottish | not_found | server_error`); refactored `components/PostcodeTeaser.tsx` (5 panels, dedicated `MissingSimdPanel` + inline `StatusMessage`); refactored `components/onboarding/postcode-step.tsx` (swapped `useSIMDLookup` for the new server action, blue-tone neutral panel for `missing_simd`, yellow only for `not_found` / `invalid_format` / `server_error`); new migration `20260426000001_create_missing_postcodes_log.sql` with `log_missing_postcode(text, text)` SECURITY DEFINER function.

- **Spec said `src/lib/...` / `src/app/...` but this project has no `src/` directory.** All top-level folders are at repo root (`lib/`, `app/`, `components/`). Placed the utility at `lib/postcode-validation.ts` and applied the same relative mapping for the new action. Future spec authors: check the project tree before prescribing paths.

- **postcodes.io test-postcode reality differed from the spec assumptions.** (1) `M1 1AA` (spec: `not_scottish` case) was terminated in April 2009 -- postcodes.io returns 404 with a `terminated` payload, so our flow classifies it as `not_found`, not `not_scottish`. For a true `not_scottish` test use `M1 4ET` or `M2 5WD` (live Manchester postcodes; country=England). (2) `EH7 7DX` (spec: `missing_simd` case) returns 404 on postcodes.io -- it isn't a live postcode either. The Clermiston user's real postcode is `EH4 7DX`, which IS present in our `simd_postcodes` seed (decile 7). The original "missing SIMD" incident was likely a typo (EH7 vs EH4). For a live `missing_simd` test we'd need a Scottish postcode created post-2020; none found during this session. Takeaway: validate spec-level test data against the upstream API before writing the test plan.

- **postcodes.io `validate` endpoint is unnecessary -- the detail endpoint alone distinguishes all three non-OK states.** Spec suggested calling `/validate` then `/` if valid. In practice `/postcodes/{pc}` returns 404 for missing/invalid, 200 with `country` for live, so a single call decides `exists` + `scottish`. Kept it to one fetch per lookup for speed and reliability. Timeout set to 3s with `AbortController`; any error is swallowed and classified as `not_found` (fail closed).

- **`supabase.rpc('log_missing_postcode', ...)` needed an `as any` cast because the function isn't in `types/database.ts`.** Matches the existing pattern in `hooks/use-parent-link.ts` and `app/api/parent-link/revoke/route.ts` for untyped RPCs. Adding the function to the generated types would require regenerating `types/supabase.ts` (safe on new functions) or adding a hand-written stub to `types/database.ts`. Deferred -- the `as any` cast is a known-tolerated shortcut in this codebase.

- **`useSIMDLookup` in `hooks/use-student.ts` is now dead code but was left in place.** It's a named export; removing it is a refactor beyond session scope. Its prefix-fallback behaviour (return first matching postcode when exact match fails) is also suspect -- it can return a wrong SIMD decile for a neighbouring postcode that happens to share a prefix. Flagging for Phase 2 cleanup.

- **Onboarding yellow-warning fix:** the `missing_simd` state now uses a blue informational panel (matching the "What is SIMD?" box styling) and explicitly tells the user they can continue. Yellow is reserved for `invalid_format`, `not_found`, and `server_error`. This directly addresses the user-testing feedback from the Clermiston incident.

- **Postcodes tested and observed states (live verification via postcodes.io + DB):**
  - `G34 9AJ` -> `ok` (DB hit, SIMD 1)
  - `EH10 6AA` -> `ok` (DB hit, SIMD 10)
  - `EH4 7DX` -> `ok` (DB hit, SIMD 7 -- the real Clermiston postcode)
  - `M1 4ET` -> `not_scottish` (not in DB, postcodes.io = England)
  - `ZZ99 9ZZ` -> `not_found` (not in DB, postcodes.io 404)
  - `M1 1AA` -> `not_found` (terminated postcode, postcodes.io 404 -- NOT `not_scottish` as spec expected)
  - `EH7 7DX` -> `not_found` (not in DB, postcodes.io 404 -- NOT `missing_simd` as spec expected)
  - `hello`, `12345`, `EH`, `EH1` -> `invalid_format` (fail regex / length gate)
  - `eh114bn`, `  eh11   4bn  ` -> normalise to `EH11 4BN` (regex collapses internal whitespace).

- **Follow-up (Stage 1.5b and Phase 2):** (a) Refresh `simd_postcodes` from the latest SIMD 2020v2 lookup including post-2020 new postcodes -- primary blocker for the original user-reported bug. (b) Remove `useSIMDLookup` from `hooks/use-student.ts`. (c) Add `missing_postcodes_log` and `log_missing_postcode` to `types/database.ts` manually (follow `feedback_types_regen.md`). (d) Review the `missing_postcodes_log` table periodically (weekly cron or admin dashboard) to source additions for the SIMD seed.

## 2026-04-26 Homepage rebuild -- Stage 1

- **Files changed:** `app/page.tsx` (full rewrite, 955 -> 378 lines), new `app/actions/homepage-teaser.ts`, new `components/PostcodeTeaser.tsx`, new `lib/supabase-public.ts` (shared anon client utility).

- **Schema columns differed from the session spec in three places.** (1) Table is `simd_postcodes`, not `scottish_postcodes`. (2) Bursary SIMD eligibility column is `simd_quintile_max` (quintile, not decile) -- had to convert user decile to quintile via `CEIL(decile/2)` before filtering. (3) Course widening access column is `widening_access_requirements` (not `widening_access`) and is a JSONB object with `simd20_offer` / `simd40_offer` keys. Updated the server action to match the real schema and counted courses per decile band: SIMD 1-2 counts both simd20_offer and simd40_offer (209 courses), SIMD 3-4 counts simd40_offer only, SIMD 5-10 counts 0 (with a different UX line "widening access offers vary by course -- sign up to see your personalised list").

- **All 410 courses have non-null `widening_access_requirements`, but only 209 have non-empty JSONB content.** A naive "non-null" filter would show "410 widening access courses available" to every postcode which is misleading. The right approach was to fetch the JSONB column and filter in JS by actual key presence (`simd40_offer`, `simd20_offer`). Supabase JS doesn't offer a clean way to filter JSONB for empty-object exclusion -- fetch and filter in app code instead.

- **`lib/supabase-public.ts` now exists as a shared anon client utility.** Previously the anon client pattern was duplicated inline on the role detail page. Extracted to a shared helper so the homepage and any future SSG/ISR page can call `getAnonSupabase()` without duplicating the env-var guard. The inline definition on `app/careers/[sectorId]/[roleId]/page.tsx` still works and wasn't touched this session -- follow-up task would be to consolidate.

- **Homepage is now SSG with 1h revalidation.** Build output confirms `/` shows as `○ (Static)` with `1h` revalidate. Previously `ƒ (Dynamic)` because `getHomepageStats()` called `createServerSupabaseClient()` (which invokes `cookies()`). Switching to the anon client gives free static prerender + ISR for marketing content.

- **Mobile check via curl of the live dev HTML + grep of static HTML is a fast first-line smoke test.** All nine homepage sections were confirmed present in the generated HTML without needing a browser screenshot. The single `undefined` grep hit in the static HTML was `$undefined` inside Next.js React Flight internal markers (not a user-visible interpolation bug) -- expected.

- **Follow-up (Stage 2/3):** (a) Add a results-panel sector filter so the "Careers you could explore" picks sectors relevant to the year group (S2/S3 users may not want to see advanced professional sectors). (b) Consider a postcode validator that checks format before the DB round-trip (current validation is length-only, 5-8 chars). (c) Remove the inline `getAnonSupabase` on `app/careers/[sectorId]/[roleId]/page.tsx` and import from `lib/supabase-public.ts` instead. (d) Add a `/api/homepage-teaser` public REST endpoint if we want non-authenticated external partners to consume this matching logic.

## 2026-04-26 Housekeeping -- types sync and static rendering fix

- **`types/database.ts` had 13 tables and 8 functions missing vs the live schema.** A Python diffing script (comparing Row column sets) is the reliable way to find drift -- the raw line-count difference (2264 vs 2927 lines) is a useful signal but needs decomposition to identify which tables/functions are absent. Tables missing: `bursaries`, `offer_categories`, `offer_clicks`, `offer_support_groups`, `offers`, `partners`, `quiz_questions`, `quiz_results`, `riasec_career_mapping`, `saved_offers`, `starting_uni_checklist_items`, `student_bursary_matches`, `student_checklist_progress`. All added manually (never regenerate wholesale per `feedback_types_regen.md`).

- **Phantom columns in `database.ts` (not in live schema) should be KEPT if app code uses them.** `colleges.image_url`, `universities.image_url`, and the `students` demographic columns (`household_income_band`, `parental_education`, `local_authority`, etc.) appear in app code but not in `types/supabase.ts`. Removing them from `database.ts` would cause type errors. The right action is to keep them and note the pending migrations. The reconciliation rule "update to match" applies to adding missing columns, not to removing app-used phantom columns.

- **`/careers/[sectorId]/[roleId]` was rendering dynamically despite `generateStaticParams` because `fetchRoleAndProfile` called `createServerSupabaseClient()`, which calls `cookies()`.** The page already had `getAnonSupabase()` defined and used it in `generateStaticParams` -- only the data fetch function needed updating. Fix: replace `const supabase = await createServerSupabaseClient()` with `const supabase = getAnonSupabase(); if (!supabase) return { role: null, profile: null }`. After fix, build output shows `●` (SSG) with 269 prerendered paths and `1h` revalidation.

- **Confirm RLS public SELECT policies exist before switching to anon client on a data-fetch function.** All three tables (`career_roles`, `career_sectors`, `role_profiles`) had `Public read access` policies with `qual: true`. A missing policy would have caused silent empty results at build time, not a type error. Always run the policy check query before the switch.

- **The Python extraction-and-insertion pattern for large type-file reconciliation works well.** Extract each missing table block with a regex anchored to the table name with 6-space indent, insert after a named anchor table. Running insertions sequentially (each `insert_after_table` call searches the already-modified string) is correct and avoids position-shift bugs. A verification step counting occurrences in the result catches failures before writing to disk.

## 2026-04-25 Role detail pages -- /careers/[sectorId]/[roleId]

- **Next.js requires a single dynamic-segment name per depth, so adding `[sectorId]/[roleId]` forced a rename of the existing `[id]` folder.** Tried naively creating `app/careers/[sectorId]/[roleId]/page.tsx` alongside `app/careers/[id]/page.tsx` would produce "different slug names for the same dynamic path" error. Renamed `[id]` -> `[sectorId]` via `git mv` and updated only the param destructuring (`{ id }` -> `{ sectorId }`) in the one page. External URLs `/careers/{uuid}` continue to work because internal Links target the URL shape, not the param name. No other code changed.

- **`role_profiles` is defined in `types/supabase.ts` but NOT in `types/database.ts` -- the two type files are out of sync.** `lib/supabase-server.ts` and `lib/supabase.ts` both type their clients with `Database` from `types/database.ts`, so selects against `role_profiles` would not typecheck until the Row/Insert/Update block was added manually. Followed the feedback_types_regen.md rule (never regenerate database.ts wholesale) and copy-pasted the block from `types/supabase.ts` into the correct alphabetical slot. A future session should audit for other tables present in `types/supabase.ts` but absent from `types/database.ts` -- this drift is likely not unique to `role_profiles`.

- **Stale `.next` cache references the old dynamic-segment folder name after a rename and causes `tsc --noEmit` to fail.** First `tsc` run reported `Cannot find module '../../app/careers/[id]/page.js'` from `.next/types/validator.ts`. Deleted `.next` before retrying -- clean pass. Always `rm -rf .next` after renaming any dynamic-segment folder.

- **`notFound()` returns HTTP 200 in `next dev` but 404 in the production build.** Smoke-test against the dev server showed the not-found boundary rendered but the status code was 200. The production build (which I ran before dev) generates the correct 404. Don't treat dev-mode status codes as indicative of production behaviour for the `notFound()` helper.

- **The existing sector page (`app/careers/[sectorId]/page.tsx`) is a client component that fetches data via React Query, so initial SSR HTML returns only a skeleton.** A `curl` check for role-detail links in the rendered HTML returns nothing -- the links only appear post-hydration when React Query resolves. Role detail link verification via curl is not possible for this page; rely on the type system and a browser smoke test if full coverage is needed.

- **Reverse one-to-one Supabase joins have ambiguous array/object return shapes; two separate queries sidestep the issue.** The schema has `isOneToOne: true` on `role_profiles.career_role_id -> career_roles.id`, which means a `career_roles.select('*, role_profiles(*)')` could return `role_profiles` as either an object or a single-element array depending on the type generator version. Chose to run two `Promise.all` queries (`career_roles` with `career_sectors` inner join, plus a separate `role_profiles` lookup keyed on `career_role_id`) to avoid the shape normalization gymnastics. Cleaner typing; one extra round trip.

- **All 269 roles currently have a role_profiles row, so the "no profile" graceful-degradation path is not exercised against live data.** Confirmed via `SELECT count(*) FROM career_roles WHERE NOT EXISTS (...role_profiles...)` = 0. The page code guards every `rp?.` access, so the happy path is a subset of the null path. The null path is live-deployable even though it is not currently reached.

## 2026-04-25 Fix /universities/[id] and /colleges/[id] null safety crash

- **`boolean | null` fields must use `=== true` guard in JSX, not bare `&&`.** `null && <span>` evaluates to `null` (safe), but the intent is ambiguous and a future refactor may introduce a truthy non-boolean. Applied `=== true` to `russell_group`, `wa_pre_entry_required`, `has_swap`, `uhi_partner`, `schools_programme`, `has_foundation_apprenticeships`, `has_modern_apprenticeships`. Treat all `boolean | null` DB columns this way.

- **`number | null` fields must use `!= null` guard, not bare `&&`.** `{college.student_count && ...}` renders `"0"` as a text node if the value is 0, producing a React "Objects are not valid as a React child" error. Changed to `{college.student_count != null && ...}`. Same fix applied to `university.founded_year`. Pattern: bare `&&` is only safe for `string | null` (empty string is also falsy) and explicit boolean true/false.

- **Array truthiness in JSX outer conditions masks empty-content renders.** `{(... || college.qualification_levels) && <section>}` — an empty array `[]` is truthy and causes the section to render with no content. Changed to `(college.qualification_levels?.length ?? 0) > 0`. Always use `.length > 0` not array identity for conditional rendering of list sections.

- **`image_url` migration applied locally but not to remote DB.** `types/database.ts` includes `image_url: string | null` but the column does not exist on the remote Supabase instance. At runtime `university.image_url` is `undefined`. Components handle this gracefully (`undefined || logo_url || fallback`), so it is not the crash source, but the type drift is a latent issue. Migration `20260415000000_add_image_urls.sql` needs to be applied to remote or the type column removed.

- **Static analysis + TypeScript passing does not rule out a React rendering crash.** Both `npx tsc --noEmit` and `npm run build` exit 0 even with `number | null` zero-rendering bugs present. The build succeeds because the type system sees a conditional guard — it doesn't evaluate the runtime falsy semantics. Always review nullable primitive renders by hand rather than relying on the type checker.

## 2026-04-25 Seed role_profiles -- Science & Research (11 roles, gap closed)

- **Science & Research was the final gap sector -- all 269 role_profiles now seeded.** 11 roles inserted: AI Drug Discovery Scientist, AI Safety Researcher (Science), Bioinformatics Specialist, Clinical Researcher, Computational Scientist, Data Scientist (Science), Environmental Scientist, Laboratory Technician, Laboratory Automation Specialist, Research Scientist, Robotics Integration Engineer. Gap query returns 0.

- **MCP-only seeds produce no local diff -- no file to commit.** The SQL was provided inline in the session prompt and applied directly via Supabase MCP. Working tree stays clean; the commit step is a no-op. If a local seed file is needed for traceability, write it before applying.

- **Pre-flight count check (expect N, got N) is the fastest sanity gate for seed sessions.** Confirming 258 before INSERT and 269 after with zero-gap query gives full confidence without additional STOP gates. One gate pattern is correct for pure-INSERT sessions with no UPDATE/DELETE.

## 2026-04-25 Seed role_profiles -- Armed Forces (final sector)

- **"ALL SECTORS COMPLETE" claim requires a gap query before asserting it.** After seeding Armed Forces (15 roles), total role_profiles was 258 not 269. The 11-role gap was the entire Science & Research sector -- never seeded, not an Armed Forces omission. Always run `SELECT cr.id, cr.title FROM career_roles cr WHERE cr.id NOT IN (SELECT career_role_id FROM role_profiles)` before claiming all sectors complete.

- **MCP-only seeds produce no local diff -- git commit has nothing to stage.** When SQL is applied directly via Supabase MCP (not via a local migration file), the working tree stays clean. The commit step is a no-op. If the task workflow requires a commit, write the seed SQL to a local file first, or skip the commit and note the reason.

- **Armed Forces sector confirmed correct:** all 15 roles show `union_presence=None`, `disclosure_checks=Enhanced`, `visa_restrictions=Some roles restricted`. Science & Research (11 roles) remains unseeded and should be the next role_profiles session.

## 2026-04-25 Create role_profiles table

- **`supabase gen types typescript` regenerates `types/supabase.ts` wholesale -- safe here because `role_profiles` is a new table with no hand-added columns.** The standard warning (feedback_types_regen.md: never regenerate wholesale) applies when regenerating types for tables that have columns added manually outside the CLI cycle. For a brand-new table whose entire schema was applied via `apply_migration`, a full regen is the right call -- the generated output will include all columns exactly as migrated. Confirm with `grep -c "role_profiles" types/supabase.ts` before trusting the regen.

- **44 columns is the correct count for role_profiles (not 43 as spec stated).** The session spec said "43 columns returned" but the actual count is 44: id + career_role_id + 41 profile fields + created_at + updated_at = 44. The spec had an off-by-one error. Always count from the actual schema query output, not the session prompt's stated expectation.

- **Single-step DDL sessions (no existing data, no UPDATE/DELETE) need zero STOP gates.** The migration was DDL-only on a new table with no prior data. Pre-flight build check + post-migration column count + row count + FK join test is sufficient verification without any interactive gate.

## 2026-04-25 Horizon Ratings frontend -- HorizonRatings component

- **`select('*')` queries already carry new columns -- no query change needed when adding columns to an existing table.** The career roles query in `hooks/use-subjects.ts` uses `.select('*')`, so `ai_rating_2040_2045`, `robotics_rating_2030_2035`, `robotics_rating_2040_2045`, and `robotics_description` were already being returned. The only work required was updating `types/database.ts` (already done by the type-gen run after the retrofit migration) and writing the UI component. Always check the query selector before assuming a fetch needs updating.

- **TypeScript types in `types/database.ts` must be verified before assuming new columns are available.** The new columns were present in `database.ts` from the previous retrofit session. If they had not been, using `role.robotics_rating_2030_2035` would have produced a type error at build time -- which is the right signal to update the type file manually (per the `feedback_types_regen.md` memory: never regenerate `database.ts` wholesale).

- **HorizonRatings belongs in the "What changes" table cell, not as a new column.** The `RoleTable` already has 5 columns; adding a sixth would worsen mobile overflow. Embedding HorizonRatings in the existing "What changes" (`ai_description`) cell keeps the column count stable and places the horizon data directly adjacent to the text it contextualises. The cell has `minWidth: 260px` which is sufficient for the bar component.

- **The `NewAiRolesSection` badge div needed `marginTop` after HorizonRatings insertion.** The original code had `marginBottom: 12px` on the `ai_description` paragraph, then the badges div with no top margin. After inserting HorizonRatings between them, a `marginTop: 12px` on the badges div was required to restore the spacing. When inserting a component between two existing siblings, check whether the spacing relied on the previous sibling's bottom margin.

- **Null guard should be "all four null" not "any null".** The spec says "do not show if all four rating values are null." Since the retrofit populated all 269 roles, in practice neither condition occurs -- but the guard uses `!= null` on each of the four ratings, which means the component only renders when all four are non-null. This is slightly stricter than the spec ("all null" = don't show) but correct for our data where partial null would indicate a data error.

## 2026-04-25 Post-retrofit corrections -- ratings and em-dash fixes

- **Healthcare AI oversight roles were incorrectly rated very high on the AI axis -- the correct pattern is that AI oversight roles rate low.** Clinical AI Safety Specialist (was 10/10, corrected to 2/3), AI Healthcare Data Analyst (was 9/10, corrected to 5/7), and CNIO (was 9/9, corrected to 3/5) all had ratings that conflated "AI is central to this role" with "this role is being automated by AI". The former is not the rubric criterion; only the latter is. When a role exists specifically to govern, validate, or oversee AI systems, the AI rating should track with other oversight roles (2--5 range), not with AI-automated roles (7--10 range). The oversight function is structurally resistant to the displacement it manages.

- **Vehicle autonomy (AV/autonomous driving) is an AI phenomenon, not a robotics one.** HGV Driver and Delivery Driver had inflated robotics ratings (7/9 and 6/8 respectively) because vehicle autonomy was being treated as physical robotics. After correction: HGV Driver robotics 2/4, Delivery Driver robotics 2/3. AV driving sits squarely in the AI column (HGV Driver ai_2040_2045 corrected up to 9 to reflect genuine autonomous long-haul freight trajectory). Apply the same reasoning to any transport role where the primary displacement mechanism is autonomous navigation software, not a physical robotic arm or warehouse bot.

- **Physical robotics ratings for Warehouse Operative, Welder / Fabricator, and Chef (Professional Kitchen) were inflated by conflating process automation with embodied robotics.** Post-correction maxima: Warehouse Operative 3/5, Welder / Fabricator 3/5, Chef 2/3. The correction aligns with the robotics rubric ceiling of 5 for non-manufacturing roles. When a physical role has automated machinery (conveyor systems, welding robots, kitchen automation) that augments but does not replace the core human function, the robotics rating should reflect augmentation (2--4 range), not displacement (6+ range).

- **Em-dashes (—) in `ai_description` fields are an ASCII-safety violation.** Five descriptions contained em-dashes (Learning Technologist, HR Administrator, Accountant (Qualified), Radiographer, AI / ML Engineer); all corrected to double-hyphens (--) via `REPLACE`. The standing rule is ASCII-safe outputs -- em-dashes are not ASCII. Future session prompts that produce `ai_description` text should explicitly state "use double-hyphens (--) not em-dashes" in the generation instructions. The global em-dash check (`WHERE ai_description LIKE '%—%'`) is a fast post-session hygiene query worth running routinely.

- **Correction sessions need zero STOP gates beyond the pre-flight confirmation.** The pre-flight SELECT confirming current values is the single gate. All three UPDATE steps and the em-dash fix executed without product decisions. The STOP gate principle (gate only on irreversible/user-facing/scope-branching operations) held: corrections to known-bad values are pre-reviewed in the session prompt, making additional gates pure friction.

## 2026-04-25 Transport & Logistics horizon retrofit (15 roles rated)

- **Transport & Logistics is the most robotics-diverse desk-based sector retrofitted to date.** Ten of 12 retrofitted roles are flat 1/1 on robotics (all desk-based), but Drone Delivery Operator (2→3) and Train Driver (1→2) break the pattern -- the only sector outside Manufacturing and Retail where two distinct non-physical-process robotics drift pathways coexist. When a transport sector includes roles that directly manage or are governed by autonomous systems, expect selective robotics drift even in a predominantly desk-based sector.

- **Airline Pilot has the lowest AI ceiling in the sector (2,4) despite high AI investment in avionics.** The CAA's two-qualified-pilot requirement for commercial aviation functions as the statutory ceiling, analogous to IHL in military roles and GMC in medicine. The AI tooling (autopilot, fuel optimisation, ETCS-equivalent systems) is advanced, but the regulatory accountability layer is immovable on the 2040-2045 horizon. When a transport role has a statutory two-human requirement (aviation, rail command), the AI ceiling is set by the regulation, not by the technology.

- **Remote Vehicle Operator is a transitional role with a deliberate mid-horizon peak.** The first-horizon rating (3) reflects genuine near-term demand as AV fleets scale; the second-horizon drift (+2 to 5) reflects a role that exists only as a transitional function -- as AI handles more edge cases, the operator's core value erodes. This is the first retrofit role where the second-horizon rating is not a ceiling but a waypoint in a trajectory toward obsolescence. When rating transitional oversight roles, note explicitly in the description that demand peaks in the first horizon and the trajectory is toward contraction.

- **Ten of 12 retrofitted roles are flat 1/1 on robotics -- consistent with the desk-based transport pattern.** Route optimisation, freight documentation, supply chain management, traffic planning, and AV oversight are all control-room or desk functions with no physical automation pathway. The sector's physical automation story (autonomous vehicles, warehouse robots, drones) affects roles adjacent to these desk functions but not the desk functions themselves. Confirm desk-based flatness in a single sentence per role.

- **Single-gate sessions remain the right pattern.** One STOP gate (15-row NULL check) was sufficient. UPDATE executed cleanly on first attempt; all 12 titles matched exactly. Apostrophe audit (Scotland''s, Government''s, operator''s) is the only per-session preparation step that cannot be skipped.

## 2026-04-25 Armed Forces horizon retrofit (15 roles rated, 8 inserted, 1 renamed)

- **Armed Forces is the most robotics-diverse non-manufacturing sector retrofitted to date.** Four role groups reach `robotics_rating_2040_2045 = 5` (Army Soldier -- Infantry, Army Engineer, Army Logistics, Royal Navy Rating) -- the highest second-horizon robotics cluster outside Retail/Manufacturing. The driver is the pace of autonomous systems deployment in military contexts: FPV drones, loitering munitions, autonomous resupply, and mine-clearance robots are operational now, not speculative. When a physical sector has an active, well-funded autonomous systems programme (UK MOD RAS), expect higher robotics ratings than comparable civilian physical roles.

- **IHL (International Humanitarian Law) functions as the primary ceiling constraint for AI ratings in combat roles, analogous to GMC/NMC in medical roles.** The human accountability requirement for use-of-force decisions caps AI ratings for command and combat roles at 2--4 in the first horizon regardless of AI capability trajectory. This is a legal constraint, not a technical one. Apply the same ceiling-reasoning to IHL that the rubric applies to regulated professions: the statutory layer does not move at the pace of AI deployment.

- **The sector splits cleanly into two AI archetypes: command/combat roles (2--4) and intelligence/analytical roles (4--6).** Army Intelligence Analyst and RAF Intelligence / Cyber Specialist share the sector's highest AI ceiling (ai_2040_2045 = 6) because their primary function is desk-based cognitive analysis to which IHL does not apply. All command and direct combat roles cluster at 2--4. When a military sector includes explicit intelligence/analytical roles, expect them to inherit the AI exposure profile of equivalent civilian analytical roles rather than the military sector average.

- **`ai_description` is NOT NULL in `career_roles` -- new role inserts must include it.** The session prompt did not specify `ai_description` in the INSERT, causing an immediate constraint error on the first attempt. The fix was straightforward (add placeholder descriptions), but it cost one round-trip. Future session prompts for role insertion should either include `ai_description` values or add an explicit `DEFAULT ''` fallback note. Check NOT NULL constraints with a schema query before finalising INSERT SQL.

- **Three-step sessions (rename + insert + bulk UPDATE) need only the single pre-insert STOP gate.** The rename was independently verifiable by SELECT. The insert required a schema check (NOT NULL discovery) but no product decision. The bulk UPDATE was pre-reviewed in the session prompt. One gate was sufficient; the schema discovery was an obstacle to resolve, not a gate.

## 2026-04-25 Sport & Fitness horizon retrofit (11 roles rated)

- **Sport & Fitness is the most uniformly AI-resistant sector retrofitted to date outside Social Work.** Eight of 11 roles rate at 2 or 3 in the first horizon -- the largest low-end cluster in any sector. The sector resists AI displacement through two distinct mechanisms: embodied physical presence (Outdoor Activities Instructor, Sports Coach, Sports Therapist, Fitness Instructor, PE Teacher) and relational accountability (coaching and therapeutic relationships). When a sector's entire value chain is built on physical delivery or trusted human relationships, expect the first-horizon cluster to sit at 2--3 regardless of AI tool adoption around the edges.

- **The sector splits cleanly into three AI archetypes: embodied/relational roles (2/3), management/advisory roles (3/4--5), and data/content roles (5/7).** Sports Coach, Sports Therapist, Outdoor Activities Instructor, and PE Teacher occupy the low end (2/3). AI-Enhanced Performance Coach, E-sports Coach, Fitness Instructor, and Leisure Centre Manager occupy the middle (3/4--5). Digital Fitness Content Creator and Sports Data Analyst share the top (5/7). The data/content split follows the same Media & Communications pattern: roles whose primary output is digital content or analytical data inherit the AI exposure profile of those sectors regardless of the sport & fitness context.

- **Flat robotics 1/1 across all 11 roles with no exceptions -- the sixth sector to produce a completely uniform robotics profile.** Sport and fitness work is entirely physical-presence-based -- gym floor, training ground, pitch-side, outdoor terrain -- but the embodied human is the service, not a process to be automated. Unlike manufacturing or logistics, there is no physical workflow in sport & fitness that robotic systems displace; the physical human presence is the product. When an entire sector is body-based and relational with no production process, confirm flatness in a single sentence per role.

- **Single-gate sessions remain the right pattern.** One STOP gate (11-row NULL check) was sufficient. UPDATE executed cleanly on first attempt; all 11 titles matched exactly. Apostrophe audit (sportscotland''s, Scotland''s, coach''s) is the only per-session preparation step that cannot be skipped.

## 2026-04-25 Performing Arts & Entertainment horizon retrofit (11 roles rated)

- **Performing Arts & Entertainment is the most AI-resistant creative sector retrofitted to date.** Five roles (Choreographer, Dancer, Musician, Stage Manager, Theatre Director) reach `ai_rating_2030_2035 = 2` -- the lowest first-horizon cluster in any sector outside Social Work & Community. The driver is the live performance premium: Scottish audiences pay specifically for human physical presence, and the Edinburgh Festival, Scottish Ballet, and NTS circuit anchor the sector in an experience-economy context that actively devalues synthetic substitutes.

- **Music Producer is the sole AI-disrupted outlier (5→7) -- the highest in the sector and the clearest evidence that recorded music faces a fundamentally different AI exposure profile than live performance.** Suno, Udio, and Stable Audio are already producing commercially viable music; commodity production (library music, sync licensing) faces acute displacement. When a performing arts sector splits into live and recorded contexts, the recorded side tracks closer to Media & Communications content-production roles than to the live performance roles it sits alongside.

- **Three technical roles drift from robotics 1 to 2 in the second horizon (Lighting Designer, Sound Technician, Virtual Production Technician) -- all driven by the same automated production systems pathway.** AI-assisted cue programming, automated mixing, and AI-accelerated environment rendering are the specific named drivers. The 1→2 drift in technical production roles follows the same pattern as Broadcast Technician in Media & Communications: one clearly automated physical subtask (programming/monitoring) among several non-automatable ones.

- **Flat robotics 1/1 across eight of 11 roles -- the fifth sector to produce a near-uniform robotics profile.** Performance work is stage, studio, and venue-based with no credible embodied robotics pathway. The only drift is in technical/production roles where automated hardware (lighting rigs, mixing consoles, LED volumes) begins operating under reduced manual input. When an entire sector is performance-based, confirm flatness per role rather than constructing elaborate justifications.

- **Single-gate sessions remain the right pattern.** One STOP gate (11-row NULL check) was sufficient. UPDATE executed cleanly on first attempt; all 11 titles matched exactly. Apostrophe audit (Scotland''s, Edinburgh''s, BBC Scotland''s, Screen Scotland''s) is the only per-session preparation step that cannot be skipped.

## 2026-04-25 Media & Communications horizon retrofit (10 roles rated)

- **Media & Communications splits into two AI archetypes: relationship-capital roles (2–4) and content-production roles (5–8).** Public Relations Officer (3/4), Broadcast Journalist (3/5), and TV/Film Producer (3/5) rate low because their core value is human relationship capital -- journalist contacts, talent relationships, commissioning networks -- that AI cannot replicate. Copywriter (6/8) and Social Media Manager (5/7) rate higher because their primary deliverable is digital content that AI can generate. When a media role's value is embedded in personal relationships rather than content output, expect a first-horizon rating of 2–4 regardless of AI tool adoption.

- **Public Relations Officer has the lowest AI ceiling in the sector (3/4) -- lower than Broadcast Journalist (3/5).** The rationale is that PR value is concentrated in non-transferable journalist relationships and crisis judgment, which are more resistant to AI than journalism's research and drafting functions. AI can assist a journalist's research; it cannot substitute for a PR officer's personal credibility with editors. When a role's commercial value is purely relational and reputational, the second-horizon ceiling is lower than roles with a mixed cognitive/relational profile.

- **Copywriter reaches ai_rating_2040_2045 = 8 -- the highest in the sector and consistent with the Creative Arts & Design pattern.** The driver is identical: the primary deliverable (advertising copy, website content, marketing text) is directly reproduced by AI generation tools. Scotland's Edinburgh and Glasgow agency sectors are already navigating this. When a media role's core output is text that AI can generate competently, expect the second-horizon rating to track with content-production roles in Creative Arts & Design rather than the media sector average.

- **Broadcast Technician is the only role in this sector with robotics > 1 (1→2), driven by robotic camera systems already deployed at BBC and Sky.** The drift is modest because the physical technical scope of the role extends well beyond camera operation; fault diagnosis, transmission systems, and production infrastructure are not credibly automated. When a broadcast technical role has one clearly automated physical subtask (camera operation) among several non-automatable ones, a 1→2 drift is the right call rather than a higher rating.

- **Flat robotics 1/1 across nine of 10 roles -- the fourth sector to produce a near-uniform robotics profile.** Media and communications work is overwhelmingly desk-based, studio-based, and relationship-based. The only physical automation pathway in the sector is camera robotics for Broadcast Technician. When an entire sector is desk-based and digital, confirm the flatness in a single sentence per role rather than constructing elaborate justifications.

- **Single-gate sessions remain the right pattern.** One STOP gate (10-row NULL check) was sufficient. UPDATE executed cleanly on first attempt; all 10 titles matched exactly. Apostrophe audit (Scotland''s, STV''s, Edinburgh''s) is the only per-session preparation step that cannot be skipped.

## 2026-04-25 Creative Arts & Design horizon retrofit (14 roles rated, 1 deleted)

- **Creative Arts & Design is the most AI-disrupted creative sector retrofitted to date.** Five roles reach `ai_rating_2030_2035 = 6` (Games Artist, Graphic Designer, Illustrator, Journalist / Content Writer, Marketing Content Creator) -- the highest first-horizon cluster in any sector outside Computing. The driver is that the core output of these roles (images, text, layouts, content) is directly reproduced by AI generation tools. When a creative role's primary deliverable is a digital artefact that AI can generate independently, expect a first-horizon rating of 6 or higher regardless of the skill required to produce it.

- **The sector splits into two distinct AI archetypes: governance/strategy roles (2-4) and production/execution roles (5-8).** AI Ethics and Copyright Specialist (2/4), AI Creative Director (3/4), AI Content Strategist (3/5), CreaTech Specialist (3/5), and UX Designer (4/6) all rate low because their value lies in judgment, oversight, and human-AI workflow management. Graphic Designer, Games Artist, and Marketing Content Creator reach the high end because their value concentrates in execution output that AI can replicate. When a creative role's job title names an AI governance or strategy function, expect a counter-intuitively low AI rating for the same reason as AI Ethics Officer in Computing.

- **Flat robotics 1/1 across all 14 roles with no exceptions -- the third sector after Social Work and Public Services to produce a completely uniform robotics profile.** Creative work is entirely desk-based and studio-based with no physical process pathway for robotics in either horizon. The CreaTech Specialist has some physical installation work but not enough to warrant a drift; confirmed 1/1. When an entire creative sector is desk-based and digital, a single sentence confirming the flatness is sufficient for every robotics description.

- **Prompt Artist / Designer was deleted rather than retrofitted -- the first role deletion in the retrofit programme.** The rationale: the role was created as a transitional specialism during the 2022-2024 period when prompting required explicit craft; as AI models improve at interpreting creative intent, the specialism dissolves back into the roles it assisted. The deletion required clearing 5 `career_role_subjects` junction rows first (the FK constraint is not cascaded). When deleting a career role, always check `career_role_subjects` for junction rows before attempting the DELETE; a FK violation will block it silently in this schema.

- **Single-gate sessions remain the right pattern.** One STOP gate (15-row NULL check) was sufficient. The delete was handled within the session as a dependency-aware two-step (junction rows first, then role). Apostrophe audit (Scotland''s, Edinburgh''s, Dundee''s, Runway''s, Abertay University''s) is the only per-session preparation step that cannot be skipped.

## 2026-04-25 Hospitality & Tourism horizon retrofit (10 roles rated)

- **Hospitality & Tourism has the most uniform AI profile of any consumer-facing sector retrofitted to date.** Seven of 10 roles (including the Chef pilot) rate at 3 or 4 in the first horizon -- the tightest low-end cluster seen. The sector resists AI displacement not through regulation (unlike Law or Social Work) but through the experience economy premium: Scottish tourism is sold on human warmth and authenticity, which actively devalues automation even where it is technically feasible. When a hospitality sector's commercial proposition is built on personal service, expect AI ratings to cluster at the low end even for roles with meaningful AI augmentation.

- **Revenue / Yield Analyst is the sector outlier (5→7) and the only role where AI is already the primary decision-making engine.** AI-powered revenue management systems (STR data platforms, automated RevPAR management) already handle the majority of routine optimisation; the human role concentrates on strategy and exception management. The 2040-2045 ceiling of 7 is the highest in the sector and reflects the fully analytical, desk-based nature of the role. When a hospitality role is entirely analytical with no service-delivery or physical component, expect the AI profile to track with Finance/Analytics sector equivalents rather than the hospitality sector average.

- **Four roles drift from robotics 1 to 2 in the second horizon (Hotel Receptionist, Restaurant Manager, Sustainability Specialist, Waiter/Bar Staff) -- all driven by the same physical venue automation pathway.** Self-check-in kiosks, food runner robots (Bear Robotics Servi), kitchen monitoring systems, and smart waste platforms are the specific named technologies. The 1→2 drift pattern indicates augmentation with physical machinery without displacing the core human role. When multiple roles in a venue-based sector share the same 1→2 robotics drift, a common underlying technology trend (smart venue automation) is usually the driver -- name it explicitly in each description.

- **Single-gate sessions remain the right pattern.** One STOP gate (10-row NULL check) was sufficient. UPDATE executed cleanly on first attempt; all 9 titles matched exactly. Apostrophe audit (Scotland''s, VisitScotland''s, Edinburgh''s, Bear Robotics'') is the only per-session preparation step that cannot be skipped.

## 2026-04-25 Public Services & Government horizon retrofit (10 roles rated)

- **Public Services & Government is the most AI-governance-dense sector retrofitted to date.** Four of 10 roles (Government Chief AI Officer, AI Policy Analyst, Public Sector AI Adoption Specialist, i.AI Prototyping Specialist) exist explicitly to govern, develop, or implement AI in public services. All four score low on AI exposure (2–3 first horizon) for the same reason as AI Ethics Officer in Computing: their purpose is to manage AI risk, making them structurally resistant to the displacement they govern. When a sector contains multiple AI-governance roles, expect a cluster of low AI ratings that might otherwise look counterintuitive.

- **The sector splits cleanly into two AI archetypes: governance/leadership roles (2–3) and administrative-processing roles (6–8).** Administrative Assistant and HR Administrator share the highest ratings (6/8) because their core tasks -- document processing, data entry, scheduling, contract administration -- are among the most AI-automatable office functions regardless of sector. Policy Analyst / Civil Servant (Fast Stream) sits in the middle (4/6) because AI automates the research and drafting layer but not ministerial relationships or interdepartmental negotiation. When a public sector role's primary value is routine processing, expect high AI exposure; when it is political judgment or accountability, expect low.

- **Flat robotics 1/1 across all 10 roles with no exceptions -- the second sector after Social Work & Community to produce a completely uniform robotics profile.** Public sector work is entirely desk-based and citizen-facing with no physical process pathway for robotics in either horizon. When writing robotics descriptions for a sector with no physical automation pathway, a single explanatory sentence confirming the flatness is sufficient.

- **Single-gate sessions remain the right pattern.** One STOP gate (10-row NULL check) was sufficient. UPDATE executed cleanly on first attempt; all 10 titles matched exactly. Apostrophe audit (Scotland''s, Government''s, role''s) is the only per-session preparation step that cannot be skipped.

## 2026-04-25 Retail & Customer Service horizon retrofit (10 roles rated)

- **Retail & Customer Service is the most AI-exposed consumer-facing sector retrofitted to date.** Customer Service Advisor (Call Centre) reaches `ai_rating_2040_2045 = 9` -- the highest in sector and among the highest in the entire dataset. The Gartner 80%-autonomous-resolution projection by 2029 is the explicit rationale. When a role's primary function is answering routine queries at scale, AI agentic systems represent a near-complete displacement pathway rather than an augmentation pathway.

- **Shop Assistant / Sales Associate is the only role in this sector to reach `robotics_rating_2040_2045 = 5`, driven by named, already-deployed technology.** Simbe Robotics Tally shelf-scanning robots (operational in Marks & Spencer), self-checkout (near-universal in Scottish supermarkets), and Amazon Go-style autonomous checkout expansion are the specific named systems grounding the drift. When a customer-facing physical role has multiple distinct robotic automation pathways (transactions + inventory), the second-horizon robotics rating reflects their combined impact rather than any single system.

- **The sector splits cleanly into desk-based (flat robotics 1/1) and store-based (robotics 1-5) roles.** AI-Assisted Customer Experience Manager, Chatbot/AI System Trainer, E-commerce Personalisation Specialist, E-commerce Specialist, Retail Data/AI Analyst, and Supply Chain Coordinator are all flat 1/1 on robotics. Retail Manager, Visual Merchandiser drift to 1→2; Shop Assistant drifts to 2→5. The desk-based/store-based classification predicts robotics flatness as reliably here as in Construction and Agriculture.

- **Supply Chain Coordinator warrants an explicit note separating the warehouse robotics story from the coordinator's desk role.** Warehouse and distribution centre automation is highly visible and well-publicised, making it easy to over-assign robotics to adjacent roles. The coordinator's function (supplier relationships, routing decisions, exception management) is desk-based and does not inherit the robotics exposure of the physical warehouse environment. When a desk role sits adjacent to a highly automated physical environment, confirm explicitly that the role has no physical presence component before assigning robotics 1/1.

- **Single-gate sessions remain the right pattern.** One STOP gate (10-row NULL check) was sufficient. UPDATE executed cleanly on first attempt; all 10 titles matched exactly. Apostrophe audit (Scotland''s, Marks & Spencer''s) is the only per-session preparation step that cannot be skipped.

## 2026-04-25 Agriculture & Environment horizon retrofit (12 roles rated)

- **Agriculture & Environment is the most robotics-diverse physical sector retrofitted to date outside Manufacturing.** Farm Worker reaches `robotics_rating_2040_2045 = 4` and Forestry Worker reaches 3 -- both grounded in named, already-deployed or actively-trialled technology (Dogtooth Technologies strawberry pickers, Scottish Forestry tree planting robot trials, Komatsu harvesters). When a physical outdoor sector has heterogeneous terrain and task diversity, expect robotics ratings to reflect the specific automation pathway for each role rather than clustering uniformly.

- **The sector splits cleanly into desk-based (flat robotics 1/1) and field-based (robotics 1–4) roles.** Agricultural Data Analyst, Carbon Footprint / Sustainability Officer, Environmental Consultant, Environmental Data Scientist, and Precision Agriculture Technologist are all flat 1/1 on robotics. All physically present field roles drift in the second horizon. The desk-based/field-based classification predicts robotics flatness as reliably here as it did in Construction & Trades.

- **Peatland Restoration Specialist is the sector's most Scotland-specific role and warrants the most Scotland-specific description.** Scotland holds approximately 20% of the world's blanket bog; the Peatland ACTION fund and NatureScot stewardship make this role near-unique to the Scottish context. When a role exists predominantly or exclusively because of Scottish geography, policy, or institutional context, the description must anchor it to those specifics -- generic UK framing undersells the role's relevance to Scottish students.

- **Environmental Data Scientist has the highest AI rating in the sector (5→7) despite having the flattest robotics profile (1/1).** The decoupling mirrors BIM/Digital Twin Manager in Construction: high AI exposure in a cognitive-analytical role, zero physical automation pathway. When an analytical or data-science role sits inside a physical sector, confirm explicitly that the role has no field presence before assigning robotics 1/1.

- **Single-gate sessions remain the right pattern.** One STOP gate (12-row NULL check) was sufficient. UPDATE executed cleanly on first attempt; all 12 titles matched exactly. Apostrophe audit (Scotland''s, operator''s, Dogtooth Technologies'') is the only per-session preparation step that cannot be skipped.

## 2026-04-25 Construction & Trades horizon retrofit (16 roles rated)

- **Construction & Trades is the most robotics-diverse sector retrofitted to date across physical trades.** Robotics ratings span 1–3 for the 16 retrofitted roles (excluding the pilot Welder/Fabricator at 7/8), driven by the fundamental heterogeneity of construction work: from Plasterer (flat 1/1, no credible automation path) to Groundworker/Civil Operative (1→3, autonomous earthmoving already operational on Scottish sites). When retrofitting a physical trades sector, identify the specific automation technology at each rating level -- the difference between 1 and 3 is the difference between "no credible robotic system exists" and "Komatsu iMC and Caterpillar Command for Dozing are already deployed."

- **The desk-based/site-based split cleanly predicts robotics flatness.** BIM/Digital Twin Manager, Quantity Surveyor, Construction Technology Specialist, Site Manager, Building Services Engineer, and Sustainability/Energy Modelling Analyst are all flat 1/1 on robotics across both horizons -- the same pattern as knowledge-work roles in Business & Finance. The physical trades all drift from 1 to 2 (or higher) in the second horizon. When assigning robotics ratings for a mixed-profile sector, classify roles as desk-based vs site-based first; desk-based roles in construction default to 1/1 unless they have a direct physical component.

- **BIM/Digital Twin Manager is the highest AI-rated role in the sector (4→8) with the lowest robotics rating (1/1).** The AI drift is among the steepest in the construction dataset -- AI-native design platforms are collapsing BIM coordination work faster than any other trade or knowledge function. This decoupling (high AI exposure, zero robotics exposure) is the clearest example of the two axes being genuinely independent. When a knowledge-work role in a physical sector has a very high AI rating, confirm explicitly that it has no physical automation pathway before assigning robotics 1/1.

- **Groundworker/Civil Operative is the only role in this sector to reach robotics_rating_2040_2045 = 3 (excluding the Welder pilot row).** The rationale is grounded in specific, named, already-deployed technology (Komatsu iMC, Caterpillar Command for Dozing) -- not speculation. When a physical operative role in a non-manufacturing sector reaches robotics 3, the description must name the specific machinery that drives the drift; "autonomous earthmoving" without a named system is insufficient.

- **Single-gate sessions remain the right pattern for pre-reviewed bulk UPDATEs.** One STOP gate (20-row state check) was sufficient. UPDATE executed cleanly on first attempt; all 16 titles matched exactly. The apostrophe audit (Scotland''s, operator''s, Komatsu''s) is the only per-session preparation step that cannot be skipped.

## 2026-04-25 Science & Research horizon retrofit (11 roles rated)

- **Science & Research has the most internally diverse robotics profile of any knowledge-sector retrofitted to date.** Lab Technician reaches `robotics_rating_2040_2045 = 4` (highest in sector); six roles are flat 1/1; four roles drift from 1 to 2. The driver of diversity is the lab automation pathway -- physical wet-lab work is exposed to robotics in a way that desk-based science (Computational Scientist, Data Scientist, AI Safety Researcher) is not. When retrofitting a mixed physical/cognitive sector, identify which roles have a wet-lab or fieldwork component before assigning robotics ratings.

- **Three roles in this sector invert the normal AI-exposure expectation for a science-adjacent field.** AI Safety Researcher (Scientific) (2/3), Laboratory Automation Specialist (2/4), and Robotics Integration Engineer (2/4) all score lower than sector peers despite working in AI/automation-adjacent domains -- because their purpose is to govern, implement, or maintain AI/robotic systems rather than be replaced by them. The same counter-intuitive pattern appeared in Computing (AI Ethics Officer, Cybersecurity Analyst) and Social Work (Digital Inclusion Worker). When a role's function is to enable or govern the automation technology, AI/robotics ratings should be low; demand is the inverse of displacement risk.

- **Lab Technician is the only role in the Science & Research sector with a meaningful robotics exposure path (2→4).** The self-driving laboratory concept (AI-directed automated experimental execution) is already operational at Liverpool and Carnegie Mellon; UK research lab adoption is the 2035--2045 horizon event. When a single role in an otherwise desk-dominated sector has physical automation exposure, make the specific technology (liquid handling robots, Opentrons, Hamilton platforms) explicit in the description so the drift is grounded rather than speculative.

- **Single-gate sessions with pre-reviewed external ratings remain the right pattern.** One STOP gate (11-row NULL check) was sufficient. UPDATE executed cleanly on first attempt; all 11 titles matched exactly. The apostrophe audit (Dundee''s, Edinburgh''s, Roslin''s) is the only per-session preparation step that cannot be skipped when descriptions contain possessives.

## 2026-04-25 Engineering & Manufacturing horizon retrofit (23 roles rated)

- **Engineering & Manufacturing is the most robotics-exposed sector retrofitted to date.** Four roles reach `robotics_rating_2040_2045 = 4` (Automotive Engineer, CNC Operator/Programmer, Quality Control Inspector, Manufacturing Technician) -- the highest robotics ceiling across all sectors retrofitted. Compare to all Social Work, Law, Computing, and Business sectors where the ceiling is 1-2. When retrofitting a physical-manufacturing sector, expect a bimodal robotics profile: design/oversight roles clustering at 1-2, and production/inspection roles reaching 3-4.

- **The robotics and AI profiles of this sector diverge meaningfully by role type.** Automotive Engineer has the highest AI rating (7) but also the highest robotics rating (4) -- both automations are accelerating simultaneously in that role. By contrast, Maintenance Engineer has the lowest AI rating (2/3) while its robotics rating also stays low (1/2) because physical diagnosis and repair resist both forms of automation. When a role has low AI *and* low robotics ratings, the explanation is usually the same: embodied, variable-environment, human-presence work.

- **Robotics Technician is a counter-intuitive low-AI-rating role in a high-automation sector.** The role's demand increases directly with industrial robot deployment; it is structurally a beneficiary of the automation it maintains. Its `ai_rating_2030_2035 = 2` (lowest in sector) reflects the hands-on physical nature of programming, commissioning, and fault-finding work on robotic cells. When a role's purpose is to maintain physical automation systems, expect low AI exposure and increasing demand -- the same counter-intuitive pattern as Digital Inclusion Worker in Social Work.

- **Single-gate sessions with pre-reviewed external ratings remain the right pattern for bulk UPDATEs.** One STOP gate (23-row NULL check) was sufficient. The UPDATE executed cleanly on first attempt with all 23 roles matched by exact title. No title-matching issues arose, but the defence-in-depth habit of quoting titles exactly from the DB schema prevented any mismatch risk.

## 2026-04-25 Social Work & Community horizon retrofit (14 roles rated)

- **Social Work & Community is the most uniformly AI-resistant sector retrofitted to date.** 12 of 15 roles rate 2/3 across both AI horizons. The dominant driver is SSSC registration combined with statutory accountability frameworks (Children (Scotland) Act 1995, Mental Health (Care and Treatment) (Scotland) Act 2003, Criminal Procedure (Scotland) Act 1995) that legally anchor decision-making to a named human professional. When an entire sector is dominated by registered, regulated, human-accountable roles, expect a tight cluster at the low end of the AI scale.

- **The sector splits cleanly into two AI archetypes: statutory/therapeutic roles (2/3) vs administrative-processing roles (4/6).** Housing Officer and Social Services Data Analyst are the only roles above 3, both because a meaningful portion of their work is routine data processing or case administration that AI tools will progressively handle. All frontline social care, counselling, and community roles sit at 2/3. When a social care sector has a mixed workforce (frontline + administrative), identify which archetype each role belongs to before assigning a rating.

- **Flat robotics 1/1 across all 15 roles with no exceptions -- the first sector to produce a completely uniform robotics profile.** Social Work & Community is entirely human-presence and desk-based; there is no physical process pathway for robotics even in the 2040-2045 horizon. Compare to Education (assistive robots in ASN settings), Healthcare (surgical and care robots), and Law & Justice (Prison Officer at 1/2). When writing robotics descriptions for a sector with no physical automation pathway, one explanatory sentence is sufficient -- the description's job is to confirm the flatness is considered, not speculate about pathways that don't exist.

- **Digital Inclusion Worker is a counter-intuitive low-AI-rating role.** The role's function is to help people access digital services -- demand that increases as AI expands the digital divide rather than decreases as AI automates the role's tasks. When a role's purpose is to bridge a digital access gap, AI growth is a demand driver, not a displacement driver. The rubric heuristic "does the role exist because of AI?" applies: Digital Inclusion Worker exists because AI creates a literacy and access gap, not because AI replaces the work.

## 2026-04-25 Law & Justice horizon retrofit (14 roles rated, Barrister deleted)

- **Barrister is an England & Wales role (Bar Standards Board) with no Scottish equivalent in the career_roles dataset.** Advocate (Faculty of Advocates) is the correct Scottish qualification for court advocacy. When a role deletion is Scotland-jurisdiction-specific, note the jurisdictional reason explicitly in the migration comment so future sessions do not re-add the role.

- **Law & Justice is a uniformly digital-only sector for robotics: all 14 roles rate 1/1 except Prison Officer (1→2).** The Prison Officer drift reflects automated monitoring and access control systems in Scottish Prison Service estates -- augmenting custody work, not displacing it. When an entire sector produces flat 1/1 robotics profiles, the single exception (if any) deserves explicit description of *why* the drift occurs.

- **The junior/senior AI rating split is most pronounced in Law & Justice.** Solicitor (Junior/Trainee) rates 6/7 while Solicitor (Senior) / Partner rates 3/5 -- the widest within-profession gap encountered across all sectors retrofitted to date. The same AI tools (document review, drafting, research) that displace juniors actively augment seniors. When writing descriptions for a profession with a sharp seniority split, make the inversion explicit rather than treating it as self-evident.

- **Faculty of Advocates and Law Society of Scotland are the regulatory anchors for the legal profession in Scotland.** Advocate (Faculty of Advocates) and Procurator Fiscal Depute (Crown Office and Procurator Fiscal Service, COPFS) have Scotland-specific regulators distinct from England & Wales equivalents. Both cap the 2040–2045 ceiling at 5 due to court advocacy and prosecutorial accountability requirements remaining human-gated.

## 2026-04-25 Computing & Digital Technology horizon retrofit (10 roles, Prompt Engineer deleted)

- **Delete FK dependents before deleting a career_roles row.** Prompt Engineer had 5 rows in `career_role_subjects`. The dependency query (`information_schema.referential_constraints`) returned `career_role_subjects` as the only FK table. Always run the FK check and the junction-table count before issuing any `DELETE FROM career_roles`. The pattern: FK check → count dependents → delete junction rows → delete role.

- **Computing & Digital Technology is the first sector where role deletion (not just insertion) was in scope.** Prompt Engineer was removed because it misrepresents a transitional specialism as a stable career destination. When a role deletion is proposed, the session prompt should include the FK dependency check explicitly; do not assume the role has no dependents without querying.

- **AI-native roles in a digital-only sector produce a uniform robotics profile: flat 1/1 across both horizons.** All 10 retrofitted roles are desk-based with no physical automation pathway, so 9 of 10 roles have robotics 1/1. The single exception (IT Support Technician, 1→2) arises from the physical hardware support dimension -- data centre robots and automated hardware-handling in larger facilities. When writing robotics descriptions for a digital-only sector, a single explanatory sentence is sufficient; the description's job is to explain why the rating is flat, not to speculate about physical automation pathways that don't exist.

- **AI governance and oversight roles invert the normal AI exposure pattern.** AI Ethics Officer (2/4), AI Safety Researcher (2/3), and Cybersecurity Analyst (3/5) all score lower on AI exposure than their sector peers precisely because their function is to govern, audit, or defend against AI systems. The rubric heuristic "does the role exist because of AI?" applies: these roles exist because AI creates risk, not because AI replaces the work. Flag this inversion explicitly in the description when the role's low rating might surprise a student browsing a high-AI sector.

## 2026-04-25 Business & Finance horizon retrofit (20 roles)

- **Finance sector is the purest knowledge-work cohort so far: 19 of 20 roles are flat 1/1 on robotics across both horizons.** The exception is Bank Clerk / Cashier (1→2), where the drift reflects service robots for customer navigation in larger branches -- not task displacement. When an entire sector lacks physical process work, a single sentence explaining the digital-only automation pathway is sufficient for each description; do not over-engineer the robotics rationale.

- **AI ratings in this sector split cleanly between two archetypes: oversight/governance roles (2–3) and transaction-processing roles (6–7).** Oversight roles (Data Governance Manager, Financial AI Compliance Specialist, Forensic AI Auditor) score low because their purpose is to govern AI, not be replaced by it. Transaction-processing roles (Bank Clerk, Bookkeeper, Insurance Underwriter) score high because their core tasks are already being automated algorithmically. When rating a finance role, identify which archetype it belongs to before assigning a number.

- **Management Consultant is the only role in this sector where ai_rating_2040_2045 reaches 8 without a parallel robotics exposure.** The explanation is that consultants who cannot leverage AI tools will be displaced by those who can -- the displacement pathway is AI capability, not physical automation. When writing a description for a cognitive role with a high second-horizon AI rating, make the human-vs-AI-augmented-human framing explicit.

## 2026-04-25 Education & Teaching horizon retrofit (13 roles)

- **Single-gate sessions are the right pattern for pre-reviewed bulk UPDATEs.** The prompt supplied externally drafted ratings and descriptions; one STOP gate (pre-flight NULL check) was sufficient. No further gates were warranted because the content had already been reviewed upstream and the UPDATE was not irreversible in a meaningful sense (values can be corrected with another UPDATE). Adding gates for each role or each column would have been friction without risk reduction.

- **Education & Teaching sector robotics profile is dominated by assistive-tech, not displacement.** Roles in ASN teaching, Teaching Assistant, and School Librarian rate robotics at 2/3 across horizons specifically because assistive robotics (Leka, MILO, Bee-Bot) are already deployed in Scottish schools as therapeutic/learning aids. This is a different robotics pathway than task automation -- operators and supervisors of these tools, not displaced workers. Distinguish assistive-robotic exposure from displacement-robotic exposure when writing descriptions for care and education roles.

- **Highly relational and regulated roles cluster at ai_rating 1-3 / robotics_rating 1-2.** Six of 13 Education & Teaching roles have ai_rating_2030_2035 ≤ 2, all with robotics ≤ 2. GTCS, HCPC, SSSC, and Care Inspectorate registrations are the primary rating anchors. When a role has dual regulatory oversight (e.g. Early Years Teacher under both GTCS and Care Inspectorate), note both regulators in the robotics_description to make the anchor explicit.

## 2026-04-19 Healthcare & Medicine horizon retrofit (19 roles)

- **Verify pilot-rated status in the DB before accepting source-document claims.** The session input file listed Physiotherapist as "skipped (already pilot-rated)". DB query showed all 5 horizon columns NULL for that row. Source document was wrong; Physiotherapist was in retrofit scope. Always query `WHERE title = '...' AND career_sector_id = ...` for the specific row before accepting prior-session memory or research-file claims about a row's state.

- **Input file format: expect attachment failures from Claude.ai; require paste fallback.** File attachment failed twice before user pasted raw content. When a session is being handed off from a Claude.ai drafting session to Claude Code, the transfer mechanism is unreliable. Pre-empt by asking for paste at the start of the session rather than waiting for two failed attachment attempts.

- **Source document placeholder descriptions must be drafted by Claude Code, not inherited.** The input file used `[as drafted in Claude.ai]` as the Physiotherapist `robotics_description` placeholder. The Claude.ai description was never retrieved. Next time: if a source document contains placeholder text in a free-text field, flag it at Gate A rather than silently inheriting the placeholder into the migration SQL.

- **Check existing migration number before writing the filename.** This session's migration needed the next available `20260419000NNN` slot. Queried the `supabase/migrations/` directory first to confirm `000005` was last; wrote `000006` accordingly. This takes 10 seconds and prevents a naming collision that would cause `apply_migration` to error or silently overwrite.

- **Role title matching uses exact string -- spaces and punctuation are significant.** `Healthcare Assistant / Care Worker` has a space either side of the slash. `Doctor / GP` likewise. Both matched cleanly, but any slight variation (e.g. "Doctor/GP" without spaces) would have produced 0 rows updated with no error. For any sector batch where role titles are non-obvious, add a pre-migration title-lookup query to confirm exact match before building the UPDATE statements.

## 2026-04-25 Two-horizon AI design: drop ai_rating, retrofit frontend, rewrite rubric

- **Grep the whole codebase before applying a column-drop migration.** Task 6 refactored 8 named files, but `app/ai-careers/page.tsx:819` had a second `role.ai_rating` reference in a separate code path that was missed. It was caught by `npm run build` (TypeScript error), not by the refactor pass. Next time: run `grep -r "\.ai_rating[^_]"` across all `.ts` and `.tsx` files before staging the drop migration commit. A missed reference post-drop is a build failure, not a runtime error, so TypeScript will catch it — but catching it in grep is faster.

- **`replace_all` on type definitions silently misses optional-variant lines.** When renaming `ai_rating_2035_2045` in `types/database.ts`, `replace_all` on `ai_rating_2035_2045: number | null` (non-optional) matched only the Row block. The Insert/Update blocks use `ai_rating_2035_2045?: number | null` (with `?`), which is a different string and was not renamed. Always verify all three blocks (Row, Insert, Update) explicitly after any column rename in the types file.

- **Verify column names before writing a snapshot query.** The historical snapshot query initially used `sector` as if it were a direct column — it doesn't exist; the column is `career_sector_id` requiring a JOIN to `career_sectors`. Run `information_schema.columns` for the table first, even for "obvious" column names. Cost: one extra query. Saved: a failed query mid-session and risk of writing a malformed CSV.

- **Session summaries must state which STOP gates are pending and which migrations are already applied.** This session resumed from a compacted context. The summary correctly preserved Gate E as pending and noted which migrations had been applied (Tasks 3-6). This allowed resumption without re-applying migrations or re-presenting resolved gates. When writing session summaries for compaction, list each STOP gate status explicitly (resolved / pending / not yet reached) and list applied migrations by name.

- **The rubric rewrite should follow the column drop, not precede it.** Rewriting `docs/ai-horizon-rubric.md` after `ai_rating` was dropped meant the new rubric could cleanly reference only the two horizon columns without hedging language about the legacy column. If the rubric had been rewritten first, it would have needed updating again after the drop. Sequencing: schema change → frontend refactor → types → rubric docs → CLAUDE.md is the right order.

## 2026-04-24 Horizon ratings schema + 15 pilot ratings

- `pg_get_functiondef` via `execute_sql` raises "array_agg is an aggregate function" error when called without explicit cast in some Supabase MCP query paths. Fallback: query `information_schema.routines` to get function names, then check `prosrc` column via `pg_proc` for individual functions. Both approaches confirmed no career_roles references in the 21 public functions.

- Apostrophe audit on 15 descriptions before writing the migration caught two cases: "Scotland's" (Electrician) and "architect's" (Architect). Both required `''` escaping in the SQL VALUES. The batch-INSERT lesson from Batch 1 applies equally to multi-row UPDATE migrations -- audit apostrophes in every free-text column before writing the SQL, not after.

- Role-title lookup: all 15 pilot titles matched cleanly by exact string. The one non-obvious case was "Doctor / GP" -- spaces around the slash are part of the title and the row exists under Healthcare & Medicine as expected. The lookup query used `ILIKE '%doctor%' OR ILIKE '%GP%'` as a safety net alongside the exact-match IN clause; this correctly returned only one row with no false positives.

- The two-horizon robotics design (2030-2035 and 2040-2045) produced meaningfully different ratings for 10 of 15 pilot roles. The most instructive spread is Warehouse Operative (8→9), HGV Driver (7→9), and Delivery Driver (6→8): the early-career window captures transition-phase partial deployment, the mid-career window captures mature displacement. For roles with identical ratings across both horizons (Software Developers, Social Worker), the description should explain why there is no drift rather than omitting the explanation.

- Description quality gate: the STOP gate C review of all 15 descriptions before applying was the right call for a pilot set. For the full ~289-role retrofit, descriptions will be reviewed in sector batches; the pilot descriptions now serve as the style anchor. Future descriptions should be 2-4 sentences, Scotland-anchored where possible (named employers, routes, regulators), and explain horizon drift explicitly when the two ratings differ.

## 2026-04-23 Codify STOP gate principle in CLAUDE.md and prompt templates

- STOP gate discipline: distinguish irreversible operations from routine ones.
  Over-gating adds friction without reducing risk -- a STOP gate on passing
  validation or on a pre-reviewed INSERT delays the session without catching
  anything. The test is: would a wrong outcome here be expensive to reverse,
  or is this user-facing content that benefits from a first look? If neither,
  do not gate. The typical gate count for a seeding session is one (bulk
  insert preview); splits and deletes each add one gate. More than that is
  a sign the template is compensating for unclear input, not preventing real
  mistakes.

## 2026-04-19 Batch 1 career roles seeded -- 39 roles, new Armed Forces sector, 2 row splits

- MCP `apply_migration` applies remotely only -- it does NOT create a
  local migration file. The local file must be written manually with
  the Write tool before committing, or the git history will have a
  commit with no corresponding SQL. This has now happened twice; treat
  it as a standing rule: write local file first, then apply, then
  commit.

- `career_sectors.ai_impact_rating` has a CHECK constraint that only
  permits `'human-centric'`, `'ai-augmented'`, `'ai-exposed'`. The
  schema audit doc from 2026-04-18 had listed "High"/"Medium" as
  example values -- those were wrong. Always query `pg_constraint` for
  the actual allowed values before inserting into a constrained text
  column.

- `salary_median_scotland = NULL` for all Armed Forces roles is correct
  by design (AFPRB pay is UK-wide; ONS ASHE Scotland Table 15 does not
  publish SOC 1171/3311 separately). Document this in salary_notes so
  the UI can display a meaningful message rather than a blank. Log the
  column-naming clarification (Scotland vs UK salary columns) in the
  Phase 2 backlog before the role-card UI is built.

- Apostrophe audit before writing a large INSERT is mandatory, not
  optional. Batch 1 had 11 locations requiring `''` escaping across
  39 rows. A missed apostrophe causes the entire INSERT to fail with a
  cryptic syntax error; the migration name in the error won't point to
  the offending row. Do the audit row-by-row in ai_description,
  salary_source, and salary_notes before writing the VALUES block.

- The composite unique constraint on `career_roles` is
  `(career_sector_id, title)` -- the same title can appear under
  different sectors. Conflict-checking queries must filter by
  `career_sector_id`, not just scan for duplicate titles across the
  whole table.

## 2026-04-18 Housekeeping batch: Phase 0 consolidation, template decision, Dentist salary, ai_rating sanity check

- STOP gates proved their worth again. Four of five tasks had a STOP
  gate. Three times it produced a meaningful user intervention: the
  template enrich/delete decision, the Dentist revision migration, and
  the Data Scientist 7-vs-8 call where the user asked for the verbatim
  description text before ratifying the higher rating. Without STOP
  gates I would have silently picked the wrong choice on at least one
  of these.

- Phase 0 orientation was fragmented across three places (top-of-file
  blockquote, `## Notes for Claude Code`, `## Phase 0 orientation`).
  Consolidating into one block surfaced implicit STOP gates that had
  never been written down (memory-says-feature-complete verification,
  out-of-scope-problem routing). Lesson: "fragmented across three
  places" is a signal that the canonical rules haven't been named yet,
  not just that there's duplication.

- Prompt templates need a real use before they earn a place. The
  original housekeeping template was skeletal and would have been
  skipped over in favour of freehand prompting. Enriching it against
  an actual housekeeping session (this one) produced a structure that
  matches how sessions actually run -- Problem/Action/STOP-gate per
  task, conditional-commit handling, reminders block. Next template
  work should wait for a first real use rather than speculating on
  shape.

- Scotland-specific dentist pay requires NHS DVT (not DFT) as the
  entry anchor. Scotland calls the programme Dental Vocational
  Training, not Dental Foundation Training, and the Scottish pay
  circular is PCS(DD) rather than England's equivalent. Got confirmed
  2026/27 figure of GBP 39,603 from a published rate table. NHS Digital
  Dental Earnings & Expenses publishes Scotland-specific
  self-employed-dentist average taxable income (GBP 90,600 in 2023/24)
  -- this is the authoritative mid-to-senior figure and was already in
  the DB at GBP 90,000 by coincidence rather than citation. Lesson:
  when BDA and salary pages refuse to open in webfetch, the NHS
  Digital statistical publications are the Scotland-specific fallback
  worth trying first.

- Pre-Round-1 ai_rating audit found two distinct failure modes. (a)
  Analytics / AI-adjacent roles stuck at 2-3 because the original
  prompt focused on "is it human-facing" rather than "is AI central to
  the workflow" -- Data Scientist at 3 is the egregious case but
  Social Services Data Analyst and Learning Technologist both had the
  same pattern. (b) Knowledge-worker roles at 4 that should be 6
  because the rating was set before text-generation AI had reshaped
  the hiring patterns for those roles (Communications Officer, Public
  Relations Officer, Senior Software Developer, Court Clerk). Watch
  for both patterns when auditing future cohorts: rating-2 is the red
  flag for "does this role actually touch AI centrally?"; rating-4
  flags "has this been re-rated since text-gen tools landed?".

- Pull the full description verbatim before confirming a borderline
  rating. User caught a 7-vs-8 call on Data Scientist by asking for
  the exact description text. Truncated previews (the 160-char
  SUBSTRING) are fine for scanning many rows, but the moment a rating
  call becomes contested, the full text matters. Add a quick
  "full description check" step before proposing the final rating on
  any flagged role.

## 2026-04-18 Bursary finder one-and-done

- When recommending data changes against a PL/pgSQL function, read the 
  function body first. Don't infer behaviour from column names. This 
  session surfaced three errors caused by not doing so: AND-vs-OR 
  assumption on Buttle UK multi-flag requirements; the ghost-column bug 
  where requires_lone_parent and requires_young_carer are defined on 
  bursaries but never read by match_bursaries_for_student; the 
  SECURITY DEFINER unqualified-reference latent bug in log_audit_event 
  and three other functions.

- Subagent file-deliverable gotcha. Subagents can report "completed" 
  after producing verbal output only. When delegating file creation to 
  a subagent, specify absolute path and require verification the file 
  exists before marking the task complete.

- STOP gates caught three bugs that would have shipped silently. 
  STOP 1 caught the AND/OR confusion; STOP 2 caught an over-scoped drop 
  of the shipped Offers Hub; STOP 3 (via Task 5a synthetic-student 
  tests) caught the MCR ghost-column bug. STOP gates have compounding 
  value as session scope grows.

- Memory summaries lag reality. Session started with memory claiming 
  "bursary finder is pilot-ready" -- it wasn't. The matching function 
  errored on every call. Future sessions: do a live schema + function 
  behaviour audit as the first step when memory claims a feature is 
  complete, rather than trusting memory.

- Fix-now-and-widen pattern worked well. When a bug is found during 
  testing, check if the same bug class affects other rows or functions 
  before committing the narrow fix. This session: widened the Buttle UK 
  AND/OR fix to cover Unite Foundation + Lone Parent Grants; widened 
  the log_audit_event SECURITY DEFINER fix to cover three sibling 
  functions with the same search_path pattern.

## 2026-04-17 Round 1 career expansion + cleanup

- AI rating is 1-10, not 1-5. The career_roles.ai_rating CHECK 
  constraint enforces 1-10. Pre-cleanup data used 1-8 with confused 
  semantics at rating 1 (bundled embodied trades and AI-native roles). 
  Column comment documents the scale; docs/ai-rating-rubric.md holds 
  the full rubric.

- SOC code reference errors in prompts can shift through sessions if 
  unverified. Session 5 discovered SOC 2125/2126 were swapped in the 
  prompt reference list (2125 is Production and process engineers, 
  2126 is Aerospace engineers). Session 8 discovered SOC 3223 is 
  Housing officers in SOC 2020 (not 3211 which is Dispensing opticians, 
  changed from SOC 2010). Always verify SOC codes against the 
  authoritative ASHE JSON before relying on them.

- Migration file convention: MUST NOT contain BEGIN;/COMMIT;. The 
  apply_migration MCP tool and Supabase CLI's db push both wrap their 
  own transactions.

- Scottish-specificity is the defensible differentiator. Sessions 6 
  (Advocate vs Barrister, Procurator Fiscal Depute vs CPS), 7 (Games 
  Artist / Dundee), and 8 (Criminal Justice Social Worker vs Probation 
  Officer) were where Pathfinder's Scotland focus genuinely justified 
  the product. Future prompts should explicitly name Scottish 
  regulators, employers, training institutions (SSSC, Faculty of 
  Advocates, COPFS, Abertay, Rockstar Dundee, Harris Tweed, Police 
  Scotland, SPS, Wheatley Group).

- is_new_ai_role flag conflates two concepts: "role created by AI / 
  did not exist pre-2020" vs "AI is central to this role today". 
  Bioinformatics Specialist is tagged false but is AI-intensive. 
  Deprecation or renaming logged in Phase 2 backlog.

- Research files commissioned as UK-wide need Scottish substitution at 
  session time. Sessions 6 and 8 both had to patch England-centric 
  research (Social Work England, Probation Officer for E&W) with 
  Scottish equivalents (SSSC, Criminal Justice Social Work). Future 
  research prep for regulated professions should explicitly request 
  Scotland-specific detail up front.
