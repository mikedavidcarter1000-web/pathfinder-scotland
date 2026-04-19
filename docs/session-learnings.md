# Pathfinder Scotland -- Session learnings

A running log of concrete, session-specific lessons not yet promoted to 
standing conventions in CLAUDE.md. Entries live here until a quarterly 
review decides whether to promote them, archive them, or leave them 
logged for reference.

Most recent session first.

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
