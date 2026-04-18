# [SECTOR/AREA NAME] -- Data Expansion Session

**Model:** Opus, high effort
**Effort:** Medium  
**Prerequisites:** Phase 0 orientation; git clean; on main; research file saved
**Clear context after session completes.**

---

## Setup step (do BEFORE running this prompt in Claude Code)

Save the accompanying research file to:
`D:\Dev\pathfinder-scotland\docs\research\[subfolder]\[name].md`

---

## Context and goal

[Current state: X rows. Target: Y rows. Adding Z new entries.]

[Observation: note existing coverage skew, biggest gaps, Scotland-
specificity priorities.]

Research file: [relative path]

Out of scope: other sectors, UI changes, any table other than [target table].

---

## Task 1: Load current state

[SQL query to load current rows + STRING_AGG of existing titles for 
cross-reference.]

---

## Task 2: Read and analyse the research file, propose N new roles

Selection criteria:
- Clearly distinct from existing
- Scottish/UK entry routes nameable
- Fill identified gaps
- [Sector-specific criteria]

Exclude: near-duplicates, seniority variants, executive positions, 
cross-sector roles already covered elsewhere.

### Task 2.1 -- Cross-sector duplicate check

[SQL query searching for overlapping titles in other sectors.]

### Output

| # | Proposed Title | SOC 2020 | Rationale | Research source | Cross-sector duplicates |
|---|----------------|----------|-----------|-----------------|-------------------------|

**STOP 1: wait for review before Task 3.**

---

## Task 3: Generate role content

Required fields: title, sector_id, ai_rating (1-10 per rubric), 
ai_description, soc_code_2020.

[AI rating anchors for this sector.]

[ai_description guidance with Scotland-specific institutions.]

Output CSV at scripts/[sector]/proposed-roles.csv.

**STOP 2: wait for CSV review before Task 3.5.**

---

## Task 3.5: SOC verification

Grep scripts/ashe/ashe-2025-scotland.json for each proposed SOC. 
Verify description matches.

[Sector-specific SOC reference table -- flag as reference-list, 
verify against JSON.]

---

## Task 4: Fetch ASHE salary data

[Standard hierarchy: Scotland p50, UK p25/p50/p75, fallback multiplier 
rules, canonical salary_source strings with ASCII double-hyphen.]

---

## Task 5: Migration

Create supabase/migrations/[timestamp]_[name].sql. No BEGIN/COMMIT.

---

## Task 6: Verification

[Standard 6-query verification block.]

---

## Task 7: Commit

`feat(careers): [area] expansion -- [summary]`

---

## Final output

1. Task 1 current state
2. Task 2 proposed list + cross-sector check
3. Task 3 CSV path
4. Task 3.5 SOC verification table
5. Verification query results
6. Sample of new rows
7. Deviations and workflow feedback

Clear Claude Code context after this session completes.
