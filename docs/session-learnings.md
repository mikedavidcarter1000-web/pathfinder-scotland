# Pathfinder Scotland -- Session learnings

A running log of concrete, session-specific lessons not yet promoted to 
standing conventions in CLAUDE.md. Entries live here until a quarterly 
review decides whether to promote them, archive them, or leave them 
logged for reference.

Most recent session first.

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
