# career_roles Schema Audit -- 2026-04-18

Captured from live Supabase project qexfszbhmdducszupyzi via information_schema and pg_catalog queries.
All column comments reflect the current pg_description values on the live table.

---

## Section 1: Column Definitions

| # | Column | Data Type | Nullable | Default | Column Comment |
|---|--------|-----------|----------|---------|----------------|
| 1 | id | uuid | NO | gen_random_uuid() | |
| 2 | career_sector_id | uuid | NO | | |
| 3 | title | text | NO | | |
| 4 | ai_rating | integer | NO | | AI impact rating on a 1-10 scale. 1 = AI barely affects this role (embodied, licensed, human-presence). 10 = role is AI-native or exists primarily to supervise, train, govern or develop AI systems. See docs/ai-rating-rubric.md for full rubric. |
| 5 | ai_description | text | NO | | |
| 6 | is_new_ai_role | boolean | YES | false | |
| 7 | growth_outlook | text | YES | | |
| 8 | created_at | timestamp with time zone | YES | now() | |
| 9 | soc_code_2020 | text | YES | | |
| 10 | salary_median_scotland | integer | YES | | |
| 11 | salary_entry_uk | integer | YES | | |
| 12 | salary_median_uk | integer | YES | | |
| 13 | salary_experienced_uk | integer | YES | | |
| 14 | salary_source | text | YES | | |
| 15 | salary_last_updated | date | YES | | |
| 16 | salary_needs_verification | boolean | YES | false | |
| 17 | salary_notes | text | YES | | |
| 18 | salary_entry | integer | YES | | |
| 19 | salary_experienced | integer | YES | | |

**Notes:**
- `salary_entry` and `salary_experienced` appear to be Scotland-specific counterparts to `salary_entry_uk` and `salary_experienced_uk`. No column comment distinguishes them -- see Phase 2 backlog.
- `growth_outlook` is plain text (not an enum), despite being a candidate for enumeration. Phase 2 backlog item.
- Only `ai_rating` has a column comment. All other columns are undocumented at the DB level.

---

## Section 2: Constraints

### Primary Key
| Constraint Name | Column |
|-----------------|--------|
| career_roles_pkey | id |

### Foreign Keys
| Constraint Name | Column | Referenced Table | Referenced Column | On Update | On Delete |
|-----------------|--------|-----------------|-------------------|-----------|-----------|
| career_roles_career_sector_id_fkey | career_sector_id | career_sectors | id | NO ACTION | CASCADE |

**Note:** CASCADE delete means deleting a career sector deletes all its career roles. Handle with care.

### Unique Constraints
| Constraint Name | Columns |
|-----------------|---------|
| career_roles_career_sector_id_title_key | (career_sector_id, title) |

**Note:** The unique constraint is composite -- the same title can appear under different sectors. Title alone is not guaranteed unique across the table.

### Check Constraints
| Constraint Name | Expression |
|-----------------|-----------|
| career_roles_ai_rating_check | ((ai_rating >= 1) AND (ai_rating <= 10)) |

### NOT NULL (from system-generated checks)
The following columns carry implicit NOT NULL, confirmed by system CHECK constraints:
- id
- career_sector_id
- title
- ai_rating
- ai_description

---

## Section 3: Indexes

| Index Name | Unique | Primary | Columns |
|------------|--------|---------|---------|
| career_roles_pkey | YES | YES | id |
| career_roles_career_sector_id_title_key | YES | NO | career_sector_id, title |
| idx_career_roles_soc | NO | NO | soc_code_2020 |
| idx_cr_rating | NO | NO | ai_rating |
| idx_cr_sector | NO | NO | career_sector_id |

Total: 5 indexes. Three non-unique lookup indexes covering the most likely filter axes (SOC code, AI rating, sector).

---

## Section 4: Triggers

None. No triggers are defined on `career_roles`.

---

## Section 5: Example Rows

### Example A -- Traditional role (Nurse)

```
id:                      3871eba8-df22-4bf8-8d20-d3047b94d596
career_sector_id:        8e706fbe-1f19-4156-80a1-631faf1c211c
title:                   Nurse
ai_rating:               3
ai_description:          AI handles admin (scheduling, notes, bed management) and supports
                         clinical decisions. Patient advocacy, complex care, and emotional
                         support remain human. Nursing projected to grow 45%+ by 2032.
is_new_ai_role:          false
growth_outlook:          Projected to grow 45%+ by 2032
created_at:              2026-04-11 18:09:29.768301+00
soc_code_2020:           2237
salary_median_scotland:  36500
salary_entry_uk:         25000
salary_median_uk:        37000
salary_experienced_uk:   45500
salary_source:           ONS ASHE 2025 (Scotland median + UK percentiles)
salary_last_updated:     2026-04-17
salary_needs_verification: true
salary_notes:            SOC 2020 disaggregated nursing into 2231-2237. 2237 used as
                         catch-all for generic Nurse role. Consider splitting into Adult
                         Nurse, Mental Health Nurse (2235), Children's Nurse (2236),
                         Midwife (2231) in a future session. NHS Scotland Band 5 entry
                         salary may be a better pilot display figure than ASHE 2237 median.
salary_entry:            25000
salary_experienced:      45500
```

### Example B -- Traditional trade (Electrician)

```
id:                      d89a6072-656f-4957-b59c-b872b917e657
career_sector_id:        5d65f7b5-4f66-4c64-aaac-18ff258866c9
title:                   Electrician
ai_rating:               2
ai_description:          Requires fine manual dexterity, problem-solving in unique
                         environments, and safety-critical judgment. 71% already use AI
                         for business admin. Core trade work is essentially
                         automation-proof. High demand.
is_new_ai_role:          false
growth_outlook:          High demand -- automation-proof core work
created_at:              2026-04-11 18:09:29.768301+00
soc_code_2020:           5241
salary_median_scotland:  38000
salary_entry_uk:         31000
salary_median_uk:        39000
salary_experienced_uk:   48500
salary_source:           ONS ASHE 2025 (Scotland median + UK percentiles)
salary_last_updated:     2026-04-17
salary_needs_verification: false
salary_notes:            Scotland ASHE Table 15 provides median only (p25/p75 suppressed).
                         Entry and experienced figures use UK-wide percentiles from Table 14.
salary_entry:            31000
salary_experienced:      48500
```

### Example C -- AI-native role (AI Solutions Engineer)

```
id:                      abf51422-7453-4f62-822e-6c07c0ef5bdf
career_sector_id:        aec5b7f6-b5a2-4bc3-92f8-3a3b13d2b991
title:                   AI Solutions Engineer
ai_rating:               10
ai_description:          Client-facing engineer who helps customers implement AI tools
                         and systems. Blends deep technical knowledge with communication
                         skills.
is_new_ai_role:          true
growth_outlook:          Growing -- strong hiring from AI platform companies
created_at:              2026-04-11 18:09:29.768301+00
soc_code_2020:           2134
salary_median_scotland:  47500
salary_entry_uk:         41000
salary_median_uk:        55500
salary_experienced_uk:   75000
salary_source:           ONS ASHE 2025 (Scotland median + UK percentiles)
salary_last_updated:     2026-04-17
salary_needs_verification: false
salary_notes:            Scotland ASHE Table 15 provides median only (p25/p75 suppressed).
                         Entry and experienced figures use UK-wide percentiles from Table 14.
                         Scotland median pay for this role is typically 14% below the UK
                         average. London-based roles may pay significantly more.
salary_entry:            41000
salary_experienced:      75000
```

---

## Section 6: Enum Types Used

**None.** No column on `career_roles` uses a PostgreSQL enum type.

- `growth_outlook` is plain `text`. A Phase 2 backlog item exists to rework this as an enum
  (e.g. `growing`, `stable`, `declining`, `emerging`).
- `ai_rating` is `integer` with a CHECK constraint rather than an enum.

---

## Section 7: Related Tables Referenced by FK

### career_sectors (referenced by career_roles.career_sector_id -> career_sectors.id)

| # | Column | Data Type | Nullable | Default |
|---|--------|-----------|----------|---------|
| 1 | id | uuid | NO | gen_random_uuid() |
| 2 | name | text | NO | |
| 3 | description | text | YES | |
| 4 | display_order | integer | YES | |
| 5 | example_jobs | text[] | YES | '{}'::text[] |
| 6 | salary_range_entry | text | YES | |
| 7 | salary_range_experienced | text | YES | |
| 8 | growth_outlook | text | YES | |
| 9 | course_subject_areas | text[] | YES | '{}'::text[] |
| 10 | ai_impact_rating | text | YES | |
| 11 | ai_impact_description | text | YES | |
| 12 | ai_impact_source | text | YES | 'Based on research by Anthropic (2024), OpenAI/University of Pennsylvania (2023), and McKinsey Global Institute (2023). Last updated April 2026.'::text |
| 13 | ai_sector_narrative | text | YES | |
| 14 | sqa_subjects_text | text | YES | |
| 15 | apprenticeships_text | text | YES | |
| 16 | scottish_context | text | YES | |
| 17 | external_links | jsonb | YES | '[]'::jsonb |

**Note:** `career_sectors.ai_impact_rating` is plain text (e.g. "High", "Medium") -- different type
and different scale from `career_roles.ai_rating` (integer 1-10). These are parallel but
semantically distinct fields. Do not confuse them.

---

## Summary

| Metric | Count |
|--------|-------|
| Columns | 19 |
| Foreign keys | 1 (career_sector_id -> career_sectors.id, CASCADE delete) |
| Unique constraints | 1 composite (career_sector_id, title) |
| Check constraints | 1 named (ai_rating 1-10) + 5 system NOT NULL checks |
| Indexes | 5 |
| Triggers | 0 |
| Enum types | 0 |
| Example rows captured | 3 (Nurse, Electrician, AI Solutions Engineer) |
