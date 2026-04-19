# ai_rating Column Usage Audit

**Date:** 19 April 2026  
**Purpose:** Identify all code and config dependencies on `career_roles.ai_rating` before schema drop.  
**Scope:** Full codebase scan -- app/, components/, hooks/, lib/, types/, scripts/, docs/, supabase/migrations/.

---

## Summary

| Category | References | Files |
|----------|-----------|-------|
| A -- Display / UI | 28 | 6 |
| B -- Query / filter | 9 | 2 |
| C -- Types / schema | 3 | 1 |
| D -- Documentation | ~83 | 18 |
| E -- Migration history | (not counted) | 17 |
| **Total (A+B+C)** | **40** | **9** |

---

## Blockers to schema drop

The following **8 files** contain live functional dependencies that would break at runtime if `ai_rating` were dropped:

### Must fix before drop (Category A)

1. `app/discover/explore/page.tsx` -- tier filtering and AiRoleBadge display
2. `app/discover/career-search/page.tsx` -- tier filtering (4 bands) and AiRoleBadge display
3. `app/careers/[id]/page.tsx` -- sort comparator and AiRoleBadge display
4. `app/subjects/[id]/page.tsx` -- average ai_rating calculation and AiRoleBadge display
5. `app/simulator/page.tsx` -- dot/badge display and numeric `x/10` rendering
6. `app/ai-careers/page.tsx` -- sector average, tier filtering, AiRoleBadge display

### Must fix before drop (Category B)

7. `hooks/use-subjects.ts` -- `.order('ai_rating', ...)` Supabase query; JS sort comparator
8. `hooks/use-simulator.ts` -- `.order('ai_rating', ...)` Supabase query; average calculation; sort comparator

---

## Category A -- Display / UI

### `app/discover/explore/page.tsx`

| Line | Code / Context |
|------|---------------|
| 552 | `const resilient = roles.filter((r) => r.ai_rating <= 3 && !r.is_new_ai_role).slice(0, 8)` |
| 553 | `const transforming = roles.filter((r) => r.ai_rating >= 7 && !r.is_new_ai_role).slice(0, 6)` |
| 738 | `<AiRoleBadge rating={role.ai_rating} size="sm" />` |

**Impact:** Tier bucketing and badge display for the Explore page role lists.

---

### `app/discover/career-search/page.tsx`

| Line | Code / Context |
|------|---------------|
| 728 | `const resilient = roles.filter((r) => !r.is_new_ai_role && r.ai_rating <= 3)` |
| 729 | `const evolving = roles.filter((r) => !r.is_new_ai_role && r.ai_rating >= 4 && r.ai_rating <= 6)` |
| 730 | `const transforming = roles.filter((r) => !r.is_new_ai_role && r.ai_rating >= 7 && r.ai_rating <= 9)` |
| 731 | `const reshaped = roles.filter((r) => !r.is_new_ai_role && r.ai_rating === 10)` |
| 961 | `<AiRoleBadge rating={role.ai_rating} size="sm" showLabel={false} />` |

**Impact:** Full 4-band tier classification (resilient / evolving / transforming / reshaped) driving the career search UI. Removing `ai_rating` without a replacement column would collapse all tier displays.

---

### `app/careers/[id]/page.tsx`

| Line | Code / Context |
|------|---------------|
| 915 | `a.ai_rating !== b.ai_rating ? a.ai_rating - b.ai_rating : a.title.localeCompare(b.title)` |
| 919 | `a.ai_rating !== b.ai_rating ? b.ai_rating - a.ai_rating : a.title.localeCompare(b.title)` |
| 1305 | `<AiRoleBadge rating={role.ai_rating} size="md" />` |
| 1474 | `<AiRoleBadge rating={role.ai_rating} size="sm" showLabel={false} />` |

**Impact:** Sort-by-AI-rating (ascending and descending) and badge display on the career detail page.

---

### `app/subjects/[id]/page.tsx`

| Line | Code / Context |
|------|---------------|
| 814 | `? roles.reduce((acc, r) => acc + r.ai_rating, 0) / roles.length` |
| 907 | `<AiRoleBadge rating={role.ai_rating} size="sm" showLabel={false} />` |

**Impact:** Average AI rating calculation displayed at the subject level; per-role badge display.

---

### `app/simulator/page.tsx`

| Line | Code / Context |
|------|---------------|
| 1773 | `<AiRoleDot rating={r.ai_rating} size={6} />` |
| 1775 | `<span style={{ color: 'var(--pf-grey-600)' }}>{r.ai_rating}/10</span>` |
| 2034 | `<AiRoleDot rating={role.ai_rating} size={8} />` |
| 2042 | `color: AI_ROLE_TIER_META[getAiRoleTier(role.ai_rating)].text` |
| 2046 | `{role.ai_rating}/10` |
| 2201 | `<AiRoleDot rating={role.ai_rating} size={8} />` |
| 2203 | `<AiRoleBadge rating={role.ai_rating} size="sm" showLabel={false} />` |

**Impact:** Numeric `x/10` display, dot and badge rendering, tier colour lookup in the simulator. Most verbose usage in the codebase.

---

### `app/ai-careers/page.tsx`

| Line | Code / Context |
|------|---------------|
| 41 | `sectorRoles.reduce((acc, r) => acc + r.ai_rating, 0) / sectorRoles.length` |
| 57 | `if (tierFilter === 'resilient') return role.ai_rating <= 3 && !role.is_new_ai_role` |
| 59 | `return role.ai_rating >= 4 && role.ai_rating <= 6 && !role.is_new_ai_role` |
| 60 | `if (tierFilter === 'transforming') return role.ai_rating >= 7` |
| 80 | `if (role.ai_rating > 3) continue` |
| 421 | `<AiRoleBadge rating={role.ai_rating} size="sm" />` |
| 818 | `<AiRoleBadge rating={role.ai_rating} size="sm" showLabel={false} />` |

**Impact:** The AI Careers page is built around `ai_rating` as its primary sort/filter axis. Sector averages, tier filters, and badge displays all depend on it.

---

## Category B -- Query / filter

### `hooks/use-subjects.ts`

| Line | Code / Context |
|------|---------------|
| 498 | `.order('ai_rating', { ascending: true })` |
| 634 | `.order('ai_rating', { ascending: true })` |
| 702 | `if (a.ai_rating !== b.ai_rating) return a.ai_rating - b.ai_rating` |
| 736 | `.order('ai_rating', { ascending: true })` |
| 894 | `if (a.ai_rating !== b.ai_rating) return a.ai_rating - b.ai_rating` |

**Impact:** Three separate Supabase `.order('ai_rating', ...)` calls would error at runtime on a dropped column. Two JS sort comparators would silently return `NaN` comparisons.

---

### `hooks/use-simulator.ts`

| Line | Code / Context |
|------|---------------|
| 113 | `.order('ai_rating', { ascending: true })` |
| 425 | `if (a.ai_rating !== b.ai_rating) return a.ai_rating - b.ai_rating` |
| 431 | `reachableRoles.reduce((acc, r) => acc + r.ai_rating, 0) / reachableRoles.length` |
| 436 | `.sort((a, b) => b.ai_rating - a.ai_rating)` |

**Impact:** One Supabase query with ORDER BY on the dropped column (runtime error); average and sort logic using the field in memory.

---

## Category C -- Types / schema

### `types/database.ts`

| Line | Type block | Field |
|------|-----------|-------|
| 352 | `career_roles.Row` | `ai_rating: number` |
| 373 | `career_roles.Insert` | `ai_rating: number` |
| 394 | `career_roles.Update` | `ai_rating?: number` |

**Impact:** TypeScript type definitions. Dropping the column without updating this file produces type errors at compile time.

**Note:** This file is maintained manually (not regenerated via `supabase gen types`). It currently does NOT include the four new horizon columns added in the 24 April 2026 schema migration (`ai_rating_2035_2045`, `robotics_rating_2030_2035`, `robotics_rating_2040_2045`, `robotics_description`). This is a pre-existing drift from the live schema -- see Unexpected Findings.

---

## Category D -- Documentation

References in the following files are informational only. No changes are required for a schema drop to succeed at runtime; update documentation after the code changes.

| File | Nature of reference |
|------|-------------------|
| `CLAUDE.md` | Conventions section pointer to rubric; Phase 2 backlog mention; Phase 0 reading list |
| `docs/ai-rating-rubric.md` | Entire document defines the `ai_rating` 1-10 scale |
| `docs/ai-horizon-rubric.md` | References `ai_rating` as the current-reality anchor |
| `docs/phase-2-backlog.md` | Multiple backlog items reference the column by name |
| `docs/session-learnings.md` | Historical session entries mentioning rating audit work |
| `docs/audits/career_roles_schema_2026-04-18.md` | Schema snapshot capturing the column |
| `docs/audits/career_roles_export_2026-04-18.csv` | CSV header includes `ai_rating` |
| `docs/audits/batch1_roles.json` | 39 seed-data records with `ai_rating` values |
| `docs/prompt-templates/housekeeping.md` | Instructs Claude to read the rubric when touching `ai_rating` |
| `docs/prompt-templates/data-expansion.md` | Lists `ai_rating` as a required field in role INSERT prompts |
| `scripts/round1/*.csv` (8 files) | Round 1 input data with `ai_rating` as a column header |

---

## Category E -- Migration history

17 migration files reference `ai_rating`. All are historical and immutable; they cannot be changed and are not blockers.

Notable files:
- `20260412000001_create_career_roles_schema.sql` -- original column definition
- `20260423000009_round1_cleanup.sql` -- rating remapping migration
- `20260423000017_retag_pre_round1_ai_ratings.sql` -- pre-Round-1 audit correction
- `20260424000001_add_horizon_rating_columns.sql` -- adds horizon columns alongside `ai_rating`
- `20260424000002_pilot_horizon_ratings.sql` -- sets `ai_rating_2035_2045` values (references `ai_rating` only in context)
- 12 seed/role migration files -- INSERT statements that populate `ai_rating`

---

## Unexpected findings

### 1. types/database.ts is stale -- missing 4 horizon columns

The live `career_roles` table now has 23 columns (19 original + 4 added 24 April 2026). `types/database.ts` reflects 19 columns only -- the four horizon columns (`ai_rating_2035_2045`, `robotics_rating_2030_2035`, `robotics_rating_2040_2045`, `robotics_description`) are absent from Row, Insert, and Update type blocks.

This is not a blocker to any schema drop work, but it means any TypeScript code that attempts to access the new columns will produce type errors. The file should be updated before the horizon columns are used in the frontend.

### 2. `app/api/` routes have zero ai_rating references

All 30 API route handlers were checked. None reference `ai_rating`. The column is queried exclusively through hooks (client-side Supabase calls via `use-subjects.ts` and `use-simulator.ts`) and consumed directly in page components from server-side fetches. There are no REST API surface dependencies to update.

### 3. `components/` directory has zero ai_rating references

The `AiRoleBadge` and `AiRoleDot` components receive `ai_rating` as a `rating` prop -- they do not import it directly from a database type. Updating the prop source in calling pages is sufficient; the components themselves need no changes for any rating column substitution.

---

## Recommendation

**Drop blocked -- 8 files need updating first.**

`ai_rating` is deeply embedded in the UI and query layers across 6 pages and 2 hooks (37 functional references). The column drives:
- The entire tier classification system (resilient / evolving / transforming / reshaped) used across 3 pages
- Sort order in 2 hooks via Supabase `.order()` -- these will produce server errors on drop
- AiRoleBadge and AiRoleDot display in 5 pages
- Numeric `x/10` display in the simulator

No schema drop can proceed without first deciding which column (or combination of columns) replaces `ai_rating` in each of these locations, and updating all 8 files to use the replacement.

If the intent is to migrate the UI to show `ai_rating_2035_2045` instead of (or alongside) `ai_rating`, the frontend work is estimable at approximately 2-3 hours: all 8 files are well-understood, the changes are straightforward substitutions, and `AiRoleBadge`/`AiRoleDot` need no changes. However, the tier thresholds (resilient <= 3, transforming >= 7) would need re-evaluation against the new column's distribution before any substitution.

**Separately recommended regardless of drop decision:** Update `types/database.ts` to add the 4 horizon columns from the 24 April 2026 migration. This is a standing schema drift that should be resolved before any frontend work begins on the horizon data.
