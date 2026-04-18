# Pathfinder Scotland -- Session learnings

A running log of concrete, session-specific lessons not yet promoted to 
standing conventions in CLAUDE.md. Entries live here until a quarterly 
review decides whether to promote them, archive them, or leave them 
logged for reference.

Most recent session first.

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
