# Archived migrations -- pre Session 11b reset

These migration files were active under `supabase/migrations/` until **22 April 2026**,
when Session 11b reset the migration tracking system to a single baseline.

## Why archived

Production tracking (`supabase_migrations.schema_migrations`) had drifted from
the local files in three ways:

1. **Duplicate timestamps.** Multiple files shared the same timestamp prefix
   (e.g. two files at `20260419000001`, two at `20260419000002`, two at
   `20260420000001`, two at `20260421000001`, five at `20260425000001`).
   Supabase CLI cannot disambiguate these.
2. **Timestamp drift.** ~30 local files had early-day `000001` style
   timestamps while production tracking recorded the actual MCP-apply
   timestamp (e.g. local `20260419000004` vs remote `20260419075435`).
   `npx supabase db push` would have attempted to re-apply these.
3. **Untracked local files.** ~13 local files were never recorded in the
   production tracking table at all (mostly the `round1_*` series of
   career-role data seeds and three `retrofit_*` horizon-rating updates).

Rather than continuing to patch the drift case-by-case, Session 11b dumped
the live production schema into a single canonical baseline migration
(`20260422143617_baseline_production_schema.sql` in the parent directory)
and reset the tracking table to point at that single row.

## Reading these files

These files are **historical reference only**. Do not re-apply them: their
contents are subsumed by the baseline. They retain useful context about
why specific columns, policies, and seed data exist -- the baseline itself
contains DDL only, with no commentary on motivation.

For each historical migration, use:
- `git log -- _archived_pre_11b_reset/<filename>` for commit history
- `git blame _archived_pre_11b_reset/<filename>` for line-level provenance
- The matching session entry in `docs/session-learnings.md` for the
  surrounding decisions

## Going forward

All new migrations live in `supabase/migrations/` (not this archive).
Generate them with `supabase migration new <name>`. See
`docs/migration-reset-11b.md` for the canonical workflow.
