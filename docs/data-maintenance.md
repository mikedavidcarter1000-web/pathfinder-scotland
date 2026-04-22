# Data maintenance

Pathfinder ships with reference datasets that need periodic refresh. This
document is the single source of truth for how to update them and where
each dataset lives.

## Graduate Outcomes and Rankings Data

### Sources
- **Discover Uni dataset** -- course-level employment, salary, satisfaction,
  continuation. Download from
  [discoveruni.gov.uk](https://discoveruni.gov.uk/about-our-data/) or
  the HESA annual Graduate Outcomes release.
- **Complete University Guide** --
  [thecompleteuniversityguide.co.uk](https://www.thecompleteuniversityguide.co.uk/league-tables/rankings/scotland)
  (overall + subject ranks, free).
- **Guardian University Guide** -- published each September via
  [theguardian.com/education/universityguide](https://www.theguardian.com/education/universityguide).
- **Times / Sunday Times Good University Guide** -- full tables behind
  the Times paywall; individual university rankings are often
  press-released by each institution on their rankings page.

### Schema references
- Migration: `supabase/migrations/20260422204126_add_graduate_outcomes_and_rankings.sql`
- `courses` columns: `employment_rate_15m`, `highly_skilled_employment_pct`,
  `salary_median_1yr`, `salary_median_3yr`, `salary_median_5yr`,
  `student_satisfaction_pct`, `continuation_rate_pct`,
  `subject_ranking_cug`, `outcomes_data_year`, `outcomes_needs_verification`.
- `universities` columns: `ranking_cug`, `ranking_cug_scotland`,
  `ranking_guardian`, `ranking_times`, `graduate_employment_rate`,
  `rankings_year`, `rankings_needs_verification`.

### Seed data files
- `data/university-rankings-2026.json` -- 18 rows, one per Scottish uni.
- `data/course-outcomes.json` -- sparse scaffold; expand as data is
  verified against each course's Discover Uni page. Do **not** populate
  with sector-average estimates (CLAUDE.md rule: never hallucinate).

### Annual update process
1. Download the new Discover Uni CSV (typically released September-October
   each year). The file contains a row per course-subject, keyed by
   UKPRN and course KISCOURSEID / UCAS code.
2. Filter the CSV to Scottish providers (UKPRN prefix list in
   `scripts/ashe/` if re-generated).
3. Update `data/course-outcomes.json`:
   - Match each course to the Pathfinder row by `ucas_code` + university
     slug. Use the `course_name` ilike fallback only when UCAS code is
     absent in the DB.
   - Set `needs_verification: true` on every new row so the
     `/admin/data-quality` page surfaces it for review.
4. Update `data/university-rankings-2026.json` (rename file to reflect
   the new year; update the `rankings_year` field inside).
5. Run `node scripts/import-outcomes-data.js`. Requires
   `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` in
   `.env.local`. The script is idempotent and merge-only -- null values
   in the JSON don't overwrite existing non-null values.
6. Review the import log for UNMATCHED rows (UCAS code changed, course
   renamed, etc.) and hand-correct.
7. Spot-check 10 random courses against Discover Uni. When satisfied,
   flip `outcomes_needs_verification = false` on the verified rows
   (either via `/admin/data-quality` one-click actions, when built, or
   via a targeted UPDATE through the Supabase MCP `execute_sql`).
8. Update `outcomes_data_year` on all refreshed rows (e.g. `2023-24`
   once the next Graduate Outcomes release lands).

### Data caveats to surface in UI and docs
- Discover Uni **suppresses** data where fewer than 15 graduates
  responded, so small courses will legitimately have nulls. Treat null
  as "not available", not "zero".
- LEO salary data **excludes self-employed graduates**, which can
  understate medicine / dentistry / veterinary earnings.
- Salary figures include both full-time and part-time workers.
- Rankings change annually and do **not** measure teaching quality
  directly -- they're an aggregation over heterogeneous metrics
  (graduate prospects, research intensity, entry standards, etc.).

### Known gaps (as of this document's creation)
- `data/course-outcomes.json` has only a starter scaffold. Priority
  subjects to populate first: Medicine, Nursing, Law, Computer Science,
  Engineering, Business/Accounting, Teaching/Education, Psychology.
- Times/Sunday Times 2026 ranks are missing for several Scottish
  universities because the full table is paywalled.
- Institutional `graduate_employment_rate` is null everywhere; ingest
  from HESA's institution-level Graduate Outcomes publication.
- GSA, RCS, SRUC, UHI don't appear in mainstream league tables -- they
  carry null ranks by design.

## SIMD postcodes (already deployed)

227,066 postcodes in `simd_postcodes`. Refresh only when the Scottish
Government publishes a new SIMD vintage (every ~4-5 years; last one was
SIMD 2020v2). See `scripts/apply-simd-refresh-pg.mjs` for the refresh
script.

## University rankings annual refresh cadence

- **Complete University Guide**: usually released **May** each year for
  the following academic year (e.g. 2026 table published May 2025).
- **Guardian**: released **September**.
- **Times / Sunday Times**: released **mid-September**.

Tie the annual update to these release dates; don't run ahead of time
against the prior year's numbers.
