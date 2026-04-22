# Reference data files

JSON files in this directory are reference data that feeds seed/import
scripts at `scripts/import-*.js`. These are intentionally separate from
Supabase migrations -- migrations own schema; these JSONs own values
that need periodic manual refresh.

## `university-rankings-2026.json`

Overall institutional rankings from Complete University Guide, Guardian,
and Times/Sunday Times 2026 guides plus institutional graduate employment
rate. 18 rows (one per Scottish university).

**Known gaps (needs_verification: true on every row):**
- Several Times/Sunday Times and Guardian ranks not captured for lower-tier
  institutions -- sources reviewed did not consistently enumerate all 14.
- Institutional `graduate_employment_rate` is null everywhere; HESA's
  institution-level Graduate Outcomes publications need to be ingested
  separately.
- GSA, RCS, SRUC, UHI carry null ranks -- specialist / federated
  institutions don't appear in mainstream UK league tables.

Annual refresh: see `docs/data-maintenance.md`.

## `course-outcomes.json`

Per-course graduate outcome data from Discover Uni / HESA Graduate
Outcomes / LEO. Current file is a **starter scaffold** with only 2 rows.

**Why so few rows:** bulk Discover Uni dataset download was not accessible
from the environment this file was authored in. Per-course figures must
be entered from the Discover Uni course pages (one URL per course) or
from the HESA Open Data annual release.

**Rule (per CLAUDE.md "never hallucinate"):** do NOT populate this file
with estimated or sector-average figures. Leave rows absent or mark
`needs_verification: true` with explicit nulls. The UI hides cards when
data is null, so missing data is silent, not misleading.

The `scripts/import-outcomes-data.js` import script is idempotent and
merge-only -- re-running after adding rows does not overwrite existing
non-null values unless the new row also supplies non-null data. Safe to
run repeatedly as the file grows.

Priority subjects to expand first (see `/admin/data-quality` for current
coverage): Medicine, Nursing, Law, Computer Science, Engineering,
Business/Accounting, Teaching/Education, Psychology.
