# Audit: Bursary / Benefits / Offers UI References

**Date:** 2026-04-18
**Purpose:** Map every code reference to `bursaries`, `student_benefits`, and `offers*` tables before considering DROP TABLE on the offers feature. Required gate before Task 3 of the widening-access expansion.
**Scope:** TypeScript / TSX / JS / JSX under `D:\Dev\pathfinder-scotland`, excluding `node_modules`, `.next`, `supabase/migrations` (schema is already understood).

---

## Summary counts

| Concept | Code files referencing |
|---|---|
| `bursaries` (incl. routes, components, hooks, types, API, RPC) | 44 (excluding 16 SQL files) |
| `student_benefits` | 12 |
| `offers` and dependent tables | 71 |
| `match_bursaries_for_student` RPC callsites | 2 |

## Database row counts (current production)

| Table | Rows | Notes |
|---|---|---|
| `bursaries` | 43 active (post Task 2) | 31 pre-existing + 12 added in `20260423000011` |
| `student_benefits` | 100 | Includes ~16 government duplicates Task 3 plans to remove |
| `offers` | 62 | Hub data |
| `offer_categories` | 15 | RESTRICT FK from offers.category_id |
| `offer_clicks` | 3 | CASCADE from offers; analytics log |
| `offer_support_groups` | 51 | CASCADE from offers; junction to support hub |
| `saved_offers` | 0 | CASCADE from offers; no user data |
| `partners` | 0 | SET NULL from offers; commercial-relationships register, empty |
| `starting_uni_checklist_items` | 21 | SET NULL from offers (linked_offer_id) |
| `student_checklist_progress` | 0 | CASCADE from checklist_items; no user data |

## Foreign-key map (verified)

```
offers.id          <-- offer_clicks.offer_id          (CASCADE)
offers.id          <-- offer_support_groups.offer_id  (CASCADE)
offers.id          <-- saved_offers.offer_id          (CASCADE)
offers.id          <-- starting_uni_checklist_items.linked_offer_id (SET NULL)
offers.category_id --> offer_categories.id            (RESTRICT)
offers.partner_id  --> partners.id                    (SET NULL)
checklist_items.id <-- student_checklist_progress.checklist_item_id (CASCADE)
```

Implication for DROP TABLE offers:
- CASCADE will delete: `offer_clicks` (3 rows), `offer_support_groups` (51 rows), `saved_offers` (0 rows).
- SET NULL on `starting_uni_checklist_items.linked_offer_id` (21 rows) -- checklist items survive but lose deep-link target.
- RESTRICT from `offers.category_id -> offer_categories.id` blocks dropping `offer_categories` first. Order matters: drop offers, then offer_categories, then partners.

---

## 1. Bursaries

### Pages / routes
- `app/bursaries/page.tsx` -- bursary finder server page; calls `match_bursaries_for_student` RPC -- impact: low (no schema change)
- `app/bursaries/[slug]/page.tsx` -- bursary detail page -- impact: low
- `app/bursaries/bursaries-client.tsx` -- client component -- impact: low
- `app/bursaries/bursary-card.tsx` -- card UI -- impact: low
- `app/bursaries/bursary-filters.tsx` -- filter UI -- impact: low
- `app/bursaries/types.ts` -- TS type for Bursary row -- impact: low (will need new flag columns added)
- `app/widening-access/page.tsx` -- WA hub references bursaries -- impact: low

### API routes
- `app/api/bursaries/match/route.ts` -- POST handler invoking match RPC -- impact: low
- `app/api/bursaries/status/route.ts` -- status check route -- impact: low

### Cross-references
- `app/support/young-carers/page.tsx`, `app/support/young-parents/page.tsx`, `app/support/estranged-students/page.tsx`, `app/support/grt/page.tsx`, `app/support/lgbtq/page.tsx`, `app/support/mature-students/page.tsx` -- support-group pages link to bursaries
- `app/universities/[id]/page.tsx`, `app/colleges/[id]/page.tsx`, `app/colleges/page.tsx` -- institution pages reference bursaries
- `app/onboarding/page.tsx` -- onboarding references bursary matching
- `components/onboarding/demographics-step.tsx` -- existing widening-access flag UI (the file we will extend in Task 4c)
- `app/(main)/dashboard/settings/page.tsx` -- profile-edit (Task 4d target)
- `components/layout/footer.tsx`, `components/layout/navbar.tsx` -- nav links
- Blog content: `content/blog/{cost-of-university-scotland,widening-access-guide,simd-explained,career-change-remote-scotland,university-without-five-highers,highers-for-teaching}.md`
- Marketing pages: `app/about/page.tsx`, `app/demo/page.tsx`, `app/resources/page.tsx`, `app/prep/page.tsx`
- `app/tools/roi-calculator/{page,layout,constants}.tsx` -- references bursary as funding source
- `lib/parent-link-emails.ts` -- email templates
- `hooks/use-universities.ts` -- university data hook references bursary linkage
- `SECURITY_REVIEW.md` -- documentation

### Risk
**Trivial / no rewrite needed.** Task 1 already added the three new flag columns. Tasks 4c-d need to extend onboarding and profile UI to write those flags. The bursary RPC and surface area is unaffected by Task 3.

---

## 2. Student Benefits

### Pages / components
- `app/benefits/page.tsx` -- benefits index page -- impact: medium (Task 3 deletes 16 rows; some IDs may be exposed in URLs)
- `app/benefits/benefits-client.tsx` -- client filter/list -- impact: medium (also references offers table; needs disentangling)
- `app/benefits/benefit-card.tsx` -- card UI -- impact: low
- `app/benefits/benefit-recommendations.tsx` -- recommendations component -- impact: low
- `components/dashboard/benefits-card.tsx` -- dashboard card -- impact: low

### API routes
- `app/api/benefits/click/route.ts` -- click tracking endpoint
- `app/api/reminders/send/route.ts` -- reminder email sender (uses benefits)
- `app/api/reminders/generate/route.ts` -- reminder generation (uses benefits)

### Admin
- `app/admin/revenue/page.tsx` -- benefits-clicks revenue dashboard -- impact: medium

### Types
- `types/database.ts` -- StudentBenefit row type -- impact: low (no schema change in Task 3)

### Cross-references
- `app/universities/[id]/page.tsx`, `hooks/use-universities.ts` -- joined references

### Risk
**Low.** Task 3 deletes ~16 duplicate rows by name match. No schema change. The page and components keep working unchanged. `app/benefits/benefits-client.tsx` does reference both `student_benefits` and `offers` -- if Task 3 also drops offers, this file needs surgical edits.

---

## 3. Offers (and dependent tables)

### Public pages
- `app/offers/page.tsx` -- main hub server component -- impact: **HIGH (would need full rewrite or removal)**
- `app/offers/offers-client.tsx` -- client-side filter/list with category, stage, support group, location, search filters; featured pinning -- impact: HIGH
- `app/offers/[slug]/page.tsx` + `offer-detail-client.tsx` -- offer detail pages -- impact: HIGH
- `app/offers/saved/page.tsx` + `saved-client.tsx` -- saved offers (0 user data; deletion safe) -- impact: HIGH
- `app/starting-uni/page.tsx` + `starting-uni-client.tsx` -- 21-item checklist linked to offers -- impact: HIGH

### Components
- `components/offers/offer-card.tsx` -- shared card component
- `components/offers/offer-filters.tsx` -- filter chips
- `components/offers/offer-utils.tsx` -- helpers
- `components/offers/save-offer-button.tsx` -- bookmark toggle
- `components/offers/support-group-offers.tsx` -- **embedded in /support/[group] pages**
- `components/ui/offer-tracker.tsx` -- presentational
- `hooks/use-offers.ts` -- offers fetching hook

### Admin
- `app/admin/offers/page.tsx` + `offers-admin-client.tsx` -- admin dashboard with analytics, verify, toggle-active, toggle-featured -- impact: HIGH
- `lib/admin-offers-analytics.ts` -- analytics data layer (uses service-role client)

### API routes (all offer-specific)
- `app/api/offers/route.ts` -- list with filtering
- `app/api/offers/[slug]/route.ts` -- detail
- `app/api/offers/click/route.ts` -- click logging (anon allowed)
- `app/api/offers/save/route.ts` -- save/unsave
- `app/api/offers/saved/route.ts` -- list saved
- `app/api/admin/offers/route.ts` -- admin list
- `app/api/admin/offers/analytics/route.ts` -- analytics JSON
- `app/api/admin/offers/[id]/route.ts` -- admin update
- `app/api/admin/offers/[id]/verify/route.ts` -- mark verified
- `app/api/admin/offers/[id]/toggle-active/route.ts` -- flip is_active
- `app/api/admin/offers/[id]/toggle-featured/route.ts` -- flip is_featured
- `app/api/starting-uni/checklist/route.ts` -- checklist data
- `app/api/starting-uni/progress/route.ts` -- tick/untick state

### Types
- `types/offers.ts` -- 40+ column types: offer, partner, category, support_group, click, saved, checklist_item -- impact: HIGH (no equivalent on student_benefits)

### Support-hub embedding
- `<SupportGroupOffers>` rendered on the following pages, each pulling offers tagged for that support group:
  - `app/support/young-carers/page.tsx`
  - `app/support/young-parents/page.tsx`
  - `app/support/estranged-students/page.tsx`
  - `app/support/refugees-asylum-seekers/page.tsx`
  - `app/support/mature-students/page.tsx`
  - `app/support/lgbtq/page.tsx`
  - `app/support/esol-eal/page.tsx`
  - `app/support/rural-island/page.tsx`
  - `app/support/home-educated/page.tsx`
- Also referenced in `app/support/page.tsx`, `app/support/grt/page.tsx`

### Other places `offers` appears
- `app/sitemap.ts` -- generates URLs for /offers/[slug]
- `app/layout.tsx` -- root nav
- `components/layout/navbar.tsx` -- nav link to /offers
- `app/(main)/dashboard/page.tsx` -- dashboard widget
- `components/dashboard/widening-access-card.tsx`, `prep-hub-card.tsx`, `applications-section.tsx`, `parent-dashboard.tsx` -- dashboard widgets
- `app/page.tsx`, `app/about/page.tsx`, `app/parents/page.tsx`, `app/results-day/page.tsx`, `app/widening-access/page.tsx`, `app/prep/page.tsx`, `app/demo/page.tsx`, `app/blog/[slug]/page.tsx`, `app/compare/subjects/page.tsx`, `app/courses/[id]/page.tsx`, `app/contact/layout.tsx`, `app/courses/layout.tsx`, `app/pathways/alternatives/page.tsx` -- marketing/CTA references
- `data/career-realities.ts` -- content data file
- `lib/shep.ts` -- helpers
- `hooks/index.ts`, `hooks/use-course-matching.ts` -- exports
- `scripts/verify_colleges.js` -- script
- `app/benefits/benefits-client.tsx` -- mixed references with student_benefits

---

## 4. `match_bursaries_for_student` references

| File | Line | Purpose |
|---|---|---|
| `app/bursaries/page.tsx` | 73 | Server page calls RPC for logged-in student |
| `app/api/bursaries/match/route.ts` | 84 | POST endpoint invoking RPC |

Two callsites; both pass a student id. After Task 1 they execute without error.

---

## 5. Risk assessment for original Task 3 plan ("drop offers, merge into student_benefits")

### Schema-level blockers

1. **40+ columns on `offers` have no equivalent on `student_benefits`.** Examples: `affiliate_url`, `affiliate_network`, `commission_type`, `commission_value`, `cookie_days`, `partner_id`, `category_id`, `eligible_stages[]`, `seasonal_tags[]`, `locations[]`, `last_verified_at`, `verified_by`, `needs_review`, `is_featured`, `featured_until`, `support_groups` (M-to-M), `slug`. Merging loses the entire monetisation, verification, and admin-workflow surface.

2. **`offer_categories` (15 categories, RESTRICT FK)** is a normalised taxonomy. `student_benefits` uses a flat `category` text column. Merging requires either adding a categories table to benefits or flattening category names into strings (loses category metadata).

3. **`offer_support_groups` junction table (51 rows)** powers `<SupportGroupOffers>` on 11 support-hub pages. `student_benefits` has no equivalent. Without porting this table, every support-hub cross-link breaks.

4. **`partners` table (0 rows but RLS-locked)** is intentionally empty pending commercial relationships. Defined for future affiliate contracts. Dropping it removes an intentionally-staged monetisation hook.

5. **`starting_uni_checklist_items` (21 rows)** has SET NULL FK to offers, so dropping offers leaves the checklist alive but with broken deep links.

### Code-level blast radius

- **71 TS/TSX files reference offers**, including:
  - 14 dedicated offer pages/components/hooks
  - 13 offer API routes (public + admin)
  - 11 support-hub pages embedding `<SupportGroupOffers>`
  - The admin dashboard at `/admin/offers` with analytics, verify, toggle workflows
  - The dashboard widgets in `(main)/dashboard`
  - Sitemap, navbar, layout

- Removing offers means deleting ALL of the above OR rewriting each to consume `student_benefits` -- but `student_benefits` lacks the columns and junction tables they depend on.

### Verdict

**The original Task 3 plan to "drop offers and merge into student_benefits" is UNSAFE as specified.**

It would either:
- (a) Delete the entire shipped Student Offers Hub feature (admin + public + support-hub embedding + checklist deep-links), losing weeks of prior work and removing the monetisation runway; or
- (b) Require a multi-day effort to add 30+ columns and 3 junction tables to `student_benefits`, then rewrite 71 files to point at it -- which is a rename, not a merge.

### Recommended Task 3 scope reduction

Three options to discuss with Mike:

**Option 1 (safest, recommended):** Keep `offers` and all dependent tables intact. Limit Task 3 to:
- 3a only: delete the ~16 duplicate government rows from `student_benefits` whose Layer-1 equivalents now exist in `bursaries`.
- Skip 3b (no offers->benefits migration needed; they coexist by design per CLAUDE.md).
- Skip 3c (no DROP TABLE).

**Option 2:** Consolidate `student_benefits` INTO `offers` (the richer model wins). Migrate the ~84 surviving student_benefits rows into offers, retire `student_benefits`. Big rewrite (the 12 student_benefits-using files), but ends with one coherent commercial-discount/entitlement model. Defer to dedicated session.

**Option 3 (original plan, NOT recommended):** Push through the drop. High risk of feature regression and revenue impact.

---

## Notes for Task 4 (UI retrofit)

**Update 2026-04-18 (post-audit, post-Task-1):** The whole UI for the three new flags was already shipped, ahead of the schema. Task 1's column additions activated dormant code rather than requiring new code. Verified end-to-end:

- `components/onboarding/demographics-step.tsx:47-49,244-255` -- form state, three checkbox UI, "None of these" toggle behaviour
- `app/onboarding/page.tsx:108-110,287-289,321-323` -- defaults, validation, INSERT to students table
- `app/(main)/dashboard/settings/page.tsx:295-297,317-319,381-392` -- profile-edit useState, UPDATE handler, profile summary chips
- `types/database.ts:1475-1543` -- Row, Insert, Update interface signatures already include all three columns (no `gen types` regeneration needed)
- `app/benefits/benefits-client.tsx:491-494` -- SupportEstimateCard reads them
- `app/benefits/benefit-recommendations.tsx:67-70` -- recommendation scoring uses them
- `app/bursaries/page.tsx`, `app/api/bursaries/match/route.ts` -- bursary surface reads them
- `app/prep/page.tsx`, `app/support/page.tsx`, `app/bursaries/types.ts` -- additional read sites confirmed

A11y check: existing checkboxes use semantic `<label><input type="checkbox" />text</label>` wrapping (implicit label association). Keyboard-accessible by default, no colour-only state, helper text uses `<span>` with proper colour contrast. No additional a11y work required.

Conclusion: **Task 4c-f required zero net code changes**. Tasks 5 (E2E verification) and 6 (commits) can proceed directly.

## Empty-category check (added 2026-04-18 per user soft-flag at STOP 2)

Post Task-3a delete, two `student_benefits` categories are degraded:
- `government` -> 0 rows
- `funding` -> 1 row (Student Loan SAAS)

Verified handling in `app/benefits/benefits-client.tsx`:
- **Government section (line 347):** conditionally rendered with `{governmentBenefits.length > 0 && ...}`. Empty section gracefully hides. **No fix needed.**
- **Category tabs (lines 125-130):** built from `benefit_categories` table, NOT from active row counts. Tabs for `government` ("Government Schemes") and `funding` ("Funding & Bursaries") will still render. Clicking the `government` tab will show the "No matching benefits" empty state (line 417-431) which is correct fallback behaviour.
- **Hero badge (line 149):** hard-coded "100+ benefits" -- now 81. Cosmetic; defer.
- **FAQ schema (page.tsx:20-49):** mentions free tuition, Young Scot card, free bus travel, free NHS prescriptions, free eye tests, free period products, EMA, School Clothing Grant -- these now live on `/bursaries`. The FAQ answers are still factually accurate, but the page they sit on no longer hosts these entitlements. Cosmetic; defer to Phase 2 consolidation.

No blocking UI bug from the delete. Phase 2 consolidation will retire the `government` category entirely as part of the student_benefits vs offers decision.
