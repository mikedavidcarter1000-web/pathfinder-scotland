# Housekeeping -- [DATE]

**Model:** Opus, high effort
**Effort:** Small-medium
**Prerequisites:** Phase 0 orientation; git clean; on main
**Clear Claude Code context after session completes.**

---

## When to use this template (vs write ad-hoc)

Use this template when:
- You have 3+ unrelated small items that each need their own commit.
- At least two items need a STOP gate before applying.
- You want a predictable session-close pattern (learnings + backlog update + session commit).

Skip this template and write freehand when:
- One-item session (just write the Problem / Action directly).
- Exploratory work where scope is unclear until investigation begins.
- Feature work (use `docs/prompt-templates/feature-session.md` if/when it exists).

---

## Task 1 -- Phase 0 orientation

Standard session opener. Read in order:
- `CLAUDE.md` in full
- `docs/session-learnings.md` -- last 3 entries only
- `docs/phase-2-backlog.md` -- full file (scan for items in scope of this session)
- `docs/ai-rating-rubric.md` if any item touches `career_roles.ai_rating`

Confirm all loaded before proceeding. No commit at this stage.

---

## Tasks 2..N -- Housekeeping items

For each item, use the following sub-template. One item per task. Unrelated items get separate commits.

### Task N -- [Short title]

**Problem:** [One-paragraph statement of what's wrong or needs changing. Reference the backlog item, session-learnings entry, or incident that surfaced it.]

**Action:**
1. [First concrete step -- usually "read X" or "query Y"]
2. [Second step -- analyse / draft change]
3. **STOP GATE:** [What to show the user and wait for approval on. Use this when the change is irreversible-ish, touches production data, or changes a convention. Skip if the item is truly trivial.]
4. Apply the approved change.
5. **Commit:** `[type]([scope]): [brief]`

**Conditional-commit handling:** if verification shows no change is needed, do not commit an empty change. Instead commit a no-op note: `docs: confirm [thing] still correct` with the evidence in the body.

---

## Final task -- Session close

1. Append new entries to `docs/session-learnings.md` under a heading dated today with the session title. At minimum, one lesson per task where something non-obvious came up.
2. Update `docs/phase-2-backlog.md`: strike through items cleared this session; add any new deferrals surfaced during the session.
3. **Final commit:** `session: [title] -- [brief summary]`
4. Confirm `git log` shows clean sequential commits for the session.
5. Post-commit hook will nudge on the session-closing commit if `session-learnings.md` wasn't updated.

---

## Reminders (paste into every housekeeping prompt)

- British English, SI units, GBP (£), ASCII-safe outputs.
- Supabase migrations: no `BEGIN;` / `COMMIT;` -- `apply_migration` wraps its own transaction.
- **STOP gates are non-negotiable** -- do not proceed past them without explicit user approval.
- If any task reveals a problem that's out of scope (schema bug, broken function, stale data outside this item's remit), do not fix it in this session -- add it to `docs/phase-2-backlog.md` and move on.
- Before writing against a table used by a PL/pgSQL function, read the function body first (`pg_get_functiondef(oid)`). Never infer function behaviour from column names.
- Clear Claude Code context after this session closes.
