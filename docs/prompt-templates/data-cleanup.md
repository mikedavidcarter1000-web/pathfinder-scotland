# [CLEANUP NAME] -- Data Cleanup Session

**Model:** Opus, high effort
**Effort:** Medium-high  
**Prerequisites:** Phase 0 orientation; git clean; on main
**Clear context after session completes.**

---

## Context

[Current state of the data quality issues; count of rows affected.]

This session bundles N cleanup items into ONE migration so post-session 
state is consistent.

Cleanup items:
1. [Item 1 -- scope]
2. [Item 2 -- scope]
...

Out of scope: [explicitly list deferred items with pointers to 
docs/phase-2-backlog.md entries.]

---

## Task 1: Phase 0 orientation

Read CLAUDE.md + docs/session-learnings.md (3 most recent entries) + 
docs/phase-2-backlog.md.

---

## Task 2: [First cleanup item] -- authoritative change list

[If the item affects specific rows, provide the exact mapping table. 
Do not ask Claude Code to decide which rows to change -- specify them.]

---

## Task 3: [Second cleanup item]

[As above.]

---

## Task N: Apply all changes as ONE migration

Create supabase/migrations/[timestamp]_[name].sql. No BEGIN/COMMIT.

Structure:
- Task 2 changes
- Task 3 changes  
- ...
- Any column comments or constraints

Apply via Supabase MCP.

---

## Task N+1: Verification

[Query for each cleanup item verifying the change landed as expected.]

---

## Task N+2: Commit

`chore(data): [cleanup name]`

---

## Final output

1. Verification query results for each cleanup item
2. Deviations from explicit mapping tables (if any) with reasons
3. Any new Phase 2 items discovered during cleanup
4. Workflow feedback

Clear Claude Code context after this session completes.
