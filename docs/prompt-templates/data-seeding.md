# [BATCH NAME] -- Data Seeding Session

**Model:** Sonnet, low effort  
**Prerequisites:** Phase 0 orientation; git clean; on main; input file saved to `docs/research/`
**Clear context after session completes.**

---

## When to use
- Adding a batch of pre-reviewed rows from a structured input (JSON, CSV).
- Input has been validated upstream (Claude.ai or similar).
- No exploratory research required in the session itself.

## When NOT to use
- Exploratory data addition requiring research -- use `data-expansion.md`
- Corrections or cleanup of existing rows -- use `data-cleanup.md`
- Schema changes only -- use `housekeeping.md`

---

## Task 1: Phase 0 orientation
[Standard]

---

## Task 2: Validate input

Load the input file and check:
- Required fields present for every row
- Enums and ranges within allowed values (query `pg_constraint` for constrained columns)
- No duplicate titles within the same sector
- Apostrophes in text fields identified and escaped (`''`)

Fail loudly on any issue; proceed silently if clean. No STOP gate on passing validation.

---

## Task 3: Existing-row handling (if any)

For each row that updates or splits an existing record:
- Show a before-after diff.

**STOP GATE B -- one gate per distinct update/delete pattern. Wait for approval before applying.**

---

## Task 4: Bulk seed

Build the migration from the validated input. Include:
- Pre-seed snapshot: row count per sector + 2-3 sample transformed rows showing all columns.

**STOP GATE A -- show snapshot. Wait for approval before applying the migration.**

Apply migration via MCP `apply_migration`. Write the local SQL file first, then apply, then commit.

---

## Task 5: Deletions (if any)

For each DELETE:
- Show the row ID and current values.

**STOP GATE C -- row-ID guard. Wait for approval before deleting.**

---

## Task 6: Post-seed validation

Run verification queries:
- Count summary (total rows, rows per sector)
- Spot-check 3-5 rows covering edge cases (nulls, apostrophes, enum values)
- Confirm no duplicate `(career_sector_id, title)` pairs

No commit at this step.

---

## Task 7: Session close

- Update `docs/phase-2-backlog.md` with any deferred items.
- Append session learnings to `docs/session-learnings.md`.
- Final commit: `session: [batch name] -- [summary]`

---

## Reminders
- British English, SI units, GBP (£), ASCII-safe.
- No `BEGIN;` / `COMMIT;` in migrations.
- STOP gates are non-negotiable where present; do not add more than the template calls for.
- Out-of-scope findings go to Phase 2 backlog, not in-session fixes.
- Write local migration file before applying via MCP; both must exist before committing.
