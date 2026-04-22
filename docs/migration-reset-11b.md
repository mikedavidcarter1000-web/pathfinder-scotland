# Migration tracking reset -- Session 11b

**Date:** 22 April 2026
**Session:** 11b
**Scope:** Full reset of `supabase_migrations.schema_migrations` to a single
baseline row that captures the entire production schema as of this date.

## What this reset did

1. **Captured production schema.** Reconstructed the full `public` schema
   DDL from production via Supabase MCP queries against `pg_catalog` and
   `information_schema` (no local `pg_dump` available). Output: 53 tables,
   8 enums, 23 functions, 25 triggers, ~92 RLS policies, ~90 indexes,
   ~190 constraints.
2. **Wrote a single baseline migration file.**
   `supabase/migrations/20260422143617_baseline_production_schema.sql`
   is the new single source of truth. Applying it to an empty database
   produces the production schema.
3. **Archived the previous 94 migration files** under
   `supabase/migrations/_archived_pre_11b_reset/` for historical reference.
   They must not be re-applied; they are kept only so that
   `git log -- <file>` and `git blame` continue to work for provenance
   research.
4. **Reset the production tracking table.** TRUNCATE'd
   `supabase_migrations.schema_migrations` and INSERTed a single row
   pointing at the new baseline version (`20260422143617`). No DDL was
   re-run against production -- production already has the schema; only
   the tracking row was changed.
5. **Verified reproducibility on a Supabase branch** (Task 30): created
   a temporary branch, applied the baseline from scratch, diffed table
   counts against production, deleted the branch.

## Why the reset was necessary

The migration tracking table had drifted from the local file set in three
ways that made future `supabase db push` runs unsafe:

1. **Duplicate local timestamps.** Multiple files shared the same
   timestamp prefix (e.g. `20260419000001` had both `gdpr_compliance`
   and `add_armed_forces_sector`). Supabase CLI cannot disambiguate these.
2. **Timestamp drift between local and remote.** Many migrations applied
   via the Supabase MCP `apply_migration` tool got a server-side
   timestamp that did not match the local file's filename. E.g. local
   `20260419000004_seed_batch1_career_roles.sql` was tracked as version
   `20260419075435`. `npx supabase db push` would have attempted to
   re-apply because the local version is "missing" from the tracking
   table even though the file content was already in production.
3. **Untracked local files.** Thirteen local files (`round1_*` data
   seeds, three `retrofit_*` horizon-rating updates, and a handful of
   bursary-related fixes) were never recorded in the tracking table at
   all -- it was unclear without per-file inspection whether each was
   applied via MCP or never run at all.

The accumulated drift meant the local file set was no longer a faithful
representation of production state, and any branch / fork / new project
would have failed to reproduce production from `db push`.

## How to add migrations going forward

1. **Create the file via the CLI.** Always:

   ```bash
   npx supabase migration new <descriptive_name>
   ```

   This generates a file with the correct UTC timestamp prefix and
   guarantees uniqueness against the existing files in the directory.

2. **Write the SQL in the new file.** Convention:
   - No `BEGIN;` / `COMMIT;` (Supabase CLI and MCP wrap their own
     transaction).
   - Use `IF NOT EXISTS` on `CREATE TABLE` and `CREATE INDEX` where the
     migration may safely re-run.
   - Use `CREATE OR REPLACE FUNCTION` for functions.
   - For new policies, drop-then-create or wrap in a `DO $$ BEGIN ...
     EXCEPTION WHEN duplicate_object THEN NULL; END $$;` block.

3. **Apply via one of:**
   - `npx supabase db push` -- the standard CLI path. Requires a working
     local CLI auth and the Supabase project link present at
     `supabase/.temp/linked-project.json`.
   - `mcp__claude_ai_Supabase__apply_migration` -- the MCP path. The
     migration name argument must match the local filename's name part
     so the local file and the tracking row stay aligned.

   Either tool will INSERT a row into `supabase_migrations.schema_migrations`
   with the version derived from the filename's timestamp prefix.

4. **Commit the file.** Always commit the migration file in the same
   commit (or a contiguous series of commits) as the apply step. This
   keeps git history aligned with production tracking history.

5. **Never make schema changes via raw SQL outside a migration file.**
   This includes: ad-hoc `execute_sql` calls via MCP that touch DDL,
   Supabase Studio's SQL editor, or `psql` against the connection string.
   Data-level changes (seed data, one-off corrections, audit cleanups)
   can still go through `execute_sql` -- the rule applies to schema
   changes only. (See `CLAUDE.md > Conventions` for the formal rule.)

## What to do if drift recurs

If a future audit finds local files don't match remote tracking, do not
patch case-by-case. Instead repeat the Session 11b workflow at a smaller
scale:

1. Audit the gap (`SELECT version, name FROM
   supabase_migrations.schema_migrations` vs `ls supabase/migrations/`).
2. Pick a cutoff version. Treat everything before it as "baseline";
   anything after stays as a regular migration file.
3. Generate a new baseline file capturing the schema as of that cutoff
   (use the queries from this session as a starting point: see
   `_archived_pre_11b_reset/` for the original migration content).
4. Archive the now-superseded files.
5. Update the tracking table to drop the archived entries and insert
   the new baseline.

For the full contemporaneous record of how the 22 April 2026 reset was
executed, see `docs/session-learnings.md` under the "Migration tracking
reset Session 11b" entry.
