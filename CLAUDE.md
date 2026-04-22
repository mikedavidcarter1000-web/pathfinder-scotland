# Pathfinder Scotland - Claude Code Context

**Last Updated:** 25 April 2026

> **Phase 2 backlog:** See `docs/phase-2-backlog.md` for items parked from Round 1 (growth_outlook enum rework, SOC bundling display, Dentist salary verification, tail-heavy salary policy, subject-to-career mapping, full horizon-rating retrofit for remaining 249 roles).
>
> **AI horizon rubric:** See `docs/ai-horizon-rubric.md` for the authoritative 1-10 scale used by `career_roles.ai_rating_2030_2035` and `career_roles.ai_rating_2040_2045`.

## Project Overview
Pathfinder is a B2C SaaS platform helping Scottish students navigate university applications, with emphasis on widening access programmes and the Scottish education system.

**Domain:** pathfinderscot.co.uk  
**Tech Stack:** Supabase (PostgreSQL), Next.js (assumed)  
**Project Location:** `D:\Dev\pathfinder-scotland`  
**Supabase Project Ref:** qexfszbhmdducszupyzi

## Current Status
- Core schema is deployed to Supabase (has real data - DO NOT reset)
- Social login UI implemented (Google, Apple, GitHub, X)
- AI-generated imagery approach for visuals (not commissioned photography)

### Social Login Setup (REQUIRES CONFIGURATION)

UI is ready. To enable providers, configure in Supabase Dashboard > Authentication > Providers:

| Provider | Dashboard Setting | OAuth App Setup |
|----------|-------------------|-----------------|
| Google | Enable Google | [Google Cloud Console](https://console.cloud.google.com/apis/credentials) |
| Apple | Enable Apple | [Apple Developer](https://developer.apple.com/account/resources/identifiers/list/serviceId) |
| GitHub | Enable GitHub | [GitHub Developer Settings](https://github.com/settings/developers) |
| X/Twitter | Enable Twitter | [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard) |

Callback URL for all providers: `https://qexfszbhmdducszupyzi.supabase.co/auth/v1/callback`

### Auth Email -> Resend SMTP (PILOT CONFIGURATION CHECKLIST)

Pathfinder routes Supabase Auth transactional email (sign-up confirmation,
password reset, magic link) through Resend SMTP rather than Supabase's
default sender. This keeps all transactional email on a single provider
with consistent deliverability and analytics.

**Manual setup steps (Supabase MCP cannot configure SMTP directly):**

1. Verify the sending domain in Resend has SPF, DKIM, and Return-Path
   records green (`pathfinderscot.co.uk` or whatever DNS-verified domain
   the account holds). If not green, STOP -- routing auth email through an
   unverified domain will silently bounce sign-ups.
2. Supabase Dashboard > Project Settings > Authentication > SMTP Settings:
   - Enable Custom SMTP
   - Host: `smtp.resend.com`
   - Port: `465`
   - Username: `resend`
   - Password: Resend API key (paste in dashboard; do NOT commit)
   - Sender email: `noreply@pathfinderscot.co.uk`
   - Sender name: `Pathfinder Scotland`
3. Trigger a password reset for a test account; confirm the email arrives
   from the Pathfinder sender and the Resend dashboard logs the delivery.

### Auth rate limits (raised for pilot)

Pathfinder raises Supabase Auth rate limits above defaults to accommodate
school-IP burst behaviour during pilot rollouts. Configure these in
Supabase Dashboard > Authentication > Rate Limits:

| Limit | Default | Pathfinder pilot |
|-------|---------|------------------|
| Email sends per hour (SMTP) | 4 | 30 |
| Sign-up attempts per hour per IP | 30 | 100 |
| Token refresh requests per 5 min | 150 | 150 (default) |

The client surfaces 429 responses via `friendlySignInMessage` /
`isRateLimitError` in `hooks/use-auth.tsx`. Sign-in / sign-up / reset
flows all emit a non-alarming "wait a moment" message; reset specifically
suggests waiting ~60 minutes before retrying.

### Stripe Integration (REQUIRES CONFIGURATION)

Tables: `stripe_customers`, `stripe_products`, `stripe_prices`, `stripe_subscriptions`, `stripe_payments`

**To enable:**
1. Create Stripe account at https://dashboard.stripe.com
2. Add to `.env.local`:
   ```
   STRIPE_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   NEXT_PUBLIC_STRIPE_STUDENT_PRICE_ID=price_...
   NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_...
   ```
3. Create products/prices in Stripe Dashboard
4. Set up webhook endpoint: `https://yourdomain.com/api/stripe/webhook`

**Webhook events to enable:**
- `customer.subscription.created/updated/deleted`
- `invoice.payment_succeeded/failed`
- `product.created/updated`
- `price.created/updated`
- `checkout.session.completed`

## SIMD Postcode Data (COMPLETE)

**Status:** 227,066 Scottish postcodes imported to database

Source: [Scottish Government SIMD 2020v2](https://www.gov.scot/publications/scottish-index-of-multiple-deprivation-2020v2-postcode-look-up/)

The `simd_postcodes` table now contains all Scottish postcodes with:
- `postcode` - Normalized postcode (no spaces, uppercase)
- `simd_decile` - 1 (most deprived) to 10 (least deprived)
- `datazone` - Scottish Government datazone code

**Usage:** When a student enters their postcode, the system automatically looks up their SIMD decile to determine eligibility for widening access programmes.

## Completed Features

### Promo Code System (COMPLETE)
Tables: `promo_codes`, `promo_code_redemptions`
Functions:
- `validate_promo_code(code, user_id, amount)` - Check if code is valid
- `redeem_promo_code(code, amount, order_id)` - Apply code to purchase
- `get_promo_code_stats(code_id)` - Admin stats

Sample codes created: `WELCOME10` (10% off), `STUDENT25` (25% off), `EARLYBIRD` (£5 off)

### GDPR/Data Security (COMPLETE)
Tables: `audit_log`
Functions:
- `export_user_data()` - GDPR Article 20 data portability
- `delete_user_data()` - GDPR Article 17 right to erasure
- `cleanup_old_audit_logs(days)` - Data retention management

Audit triggers on: `students`, `saved_courses`, `student_grades`, `promo_codes`, `promo_code_redemptions`

### Stripe Payments (COMPLETE)
Tables: `stripe_customers`, `stripe_products`, `stripe_prices`, `stripe_subscriptions`, `stripe_payments`
API Routes:
- `POST /api/stripe/checkout` - Create checkout session
- `POST /api/stripe/portal` - Open billing portal
- `POST /api/stripe/webhook` - Handle Stripe webhooks

Hooks: `useSubscription()`, `useHasActiveSubscription()`, `useManageSubscription()`
Pages: `/pricing` - Pricing page with 3 tiers (Free, Student £4.99/mo, Pro £9.99/mo)

### Subject Pathway & Curriculum Layer (MIGRATION READY — PASTE SQL TO RUN)
Migration: `supabase/migrations/20260410000002_create_subject_pathway_tables.sql`
**Status:** SQL written locally. Must be pasted into Supabase SQL Editor to apply.

Tables created:
- `curricular_areas` — 8 CfE areas, seeded
- `subjects` — SQA master subject list (structure only; data seeding is next step)
- `subject_progressions` — qualification-level progression map with grade thresholds
- `course_choice_rules` — year-group transition rules (s2→s3 through s5→s6), seeded with generic Scottish rules
- `career_sectors` — career sector taxonomy (structure only; data seeding is next step)
- `subject_career_sectors` — subject↔career junction with relevance weighting

Also: `student_grades.subject_id` FK added (nullable) for gradual migration from free-text.

> **subjects table column names (confirmed from live DB):**
> `is_available_n5`, `is_available_higher`, `is_available_adv_higher`
> NOT `available_at_n5` / `available_at_higher` / `available_at_adv_higher`

### Student Offers & Entitlements Hub (COMPLETE — all 6 tasks shipped)

A parallel `offer_*` namespace to the legacy `benefit_*` tables. Both systems coexist; `/offers` and `/benefits` are distinct surfaces and must not be conflated.

**Database tables** (migration: `supabase/migrations/20260414000002_student_offers_hub.sql`, seed: `supabase/seeds/offers_seed.sql`):
- `offer_categories` — 15 top-level categories (slugs include `government-entitlements`, `retail-and-fashion`, `streaming-and-media`, etc.)
- `partners` — commercial-relationship register (admin-only; RLS denies all public reads)
- `offers` — 40-column core table with `offer_type`, `eligible_stages[]`, `seasonal_tags[]`, `locations[]`, affiliate/commission metadata, `last_verified_at`, `needs_review`, `is_featured`, `featured_until`
- `offer_support_groups` — offer ↔ 13 support-group tags
- `offer_clicks` — engagement log (`outbound`, `save`, `unsave`, `detail_view`, `copy_code`); anon INSERT allowed, users read own rows only
- `saved_offers` — student bookmarks (composite PK)
- `starting_uni_checklist_items` — master checklist for "starting uni"
- `student_checklist_progress` — per-student tick state

**Seed data** (62 offers, 51 support-group junctions, 21 checklist items): covers government entitlements, free software, accommodation essentials, health, transport, streaming, banking, food, and retail. Each offer is tagged with relevant support groups for cross-linking.

**Public routes:**
- `/offers` — main hub, server component + `offers-client.tsx` (filter by category, stage, support group, location, search; featured offers pinned)
- `/offers/[slug]` — offer detail with CTA, related offers, support-group tags
- `/offers/saved` — logged-in students' bookmarked offers
- `/starting-uni` — 21-item checklist with progress tracking, linked to underlying offers

**Public API routes:**
- `GET /api/offers` — list offers with filtering and pagination
- `GET /api/offers/[slug]` — offer detail + related
- `POST /api/offers/click` — log click (fire-and-forget, 30/min rate limit); returns resolved URL for outbound clicks
- `POST /api/offers/save` — toggle save status (auth required)
- `GET /api/offers/saved` — list saved offers for current user
- `GET /api/starting-uni/checklist` — checklist with progress
- `POST /api/starting-uni/progress` — tick/untick items

**Support hub cross-linking**: `/support/[group]` pages (young-carers, estranged-students, young-parents, etc.) render a `<SupportGroupOffers>` section that pulls offers tagged for that group. All clicks from these pages carry `referrer_page` so analytics can attribute engagement back to the support hub.

**Admin routes** (ADMIN_EMAILS whitelist — set env var `ADMIN_EMAILS=me@example.com,other@example.com`):
- `/admin/offers` — analytics dashboard + offer management (client component for inline actions)
- `GET /api/admin/offers` — list all offers (active + inactive + needs_review) with category/status/search filters
- `GET /api/admin/offers/analytics` — JSON analytics payload (summary, top offers, categories, support referrals, saved, stale)
- `PUT /api/admin/offers/[id]` — update quick-edit fields (url, affiliate_url, promo_code, discount_text, is_active, is_featured, featured_until)
- `PUT /api/admin/offers/[id]/verify` — set `last_verified_at = today`, `needs_review = false`, `verified_by = admin email`
- `PUT /api/admin/offers/[id]/toggle-active` — flip `is_active`
- `PUT /api/admin/offers/[id]/toggle-featured` — flip `is_featured`; body `{ featured_until?: 'YYYY-MM-DD' | null }`. Unfeaturing clears `featured_until`.

All admin routes go through `requireAdminApi()` in `lib/admin-auth.ts`, which fail-closes when `ADMIN_EMAILS` is empty. The service-role client (also in `lib/admin-auth.ts`) bypasses RLS to read `offer_clicks` and `partners`.

**Monetisation hooks already wired:**
- `offers.affiliate_url` — preferred over `url` for outbound click redirects
- `offers.promo_code` — copied via `copy_code` click type (tracked separately)
- `offers.is_featured` + `featured_until` — pinned to top of `/offers`; managed via admin dashboard
- `partners` table — ready for affiliate network / contract tracking (RLS locked to service role)
- `offers.affiliate_network`, `commission_type`, `commission_value`, `cookie_days` — metadata columns for attribution modelling

**Triggers & functions:**
- `set_offers_updated_at()` BEFORE UPDATE trigger on `offers`
- `flag_stale_offers()` — marks offers with `last_verified_at` > 6 months old as `needs_review`. **pg_cron is NOT installed** on this project, so the weekly schedule is only registered conditionally by the migration's DO block. To enable: `CREATE EXTENSION pg_cron;` then re-run the scheduler snippet. Until then, call the function manually or rely on admin "Mark verified" flow.

Existing `benefit_*` tables (`student_benefits`, `benefit_categories`, `benefit_clicks`, `benefit_reminders`) and the `/benefits` page + `/api/benefits/click` + `/admin/revenue` dashboard are unchanged.

### Career Comparison (COMPLETE — 7-session build, 21/04/2026)

A side-by-side comparison tool for up to 3 Scottish careers, with saveable
comparisons for authenticated users and deep-link round-tripping via URL
state and a 24h cookie.

**Public routes:**
- `/careers/compare` — main comparison page (static SSG, 1h revalidate).
  Example seed on first visit: Electrician / Primary Teacher / Nurse.
  URL state lives in `?t=<tab1>|<tab2>|<tab3>` where each tab is a
  pipe-separated list of role UUIDs; 1-3 tabs, 2-3 roles each.
- `/account/saved-comparisons` — authenticated user's saved comparisons
  list (dynamic; redirects to `/auth/sign-in?redirect=/account/saved-comparisons`
  when unauthenticated).

**API routes:**
- `GET /api/saved-comparisons` — list the current user's saved rows
- `POST /api/saved-comparisons` — insert (validates name ≤60 chars,
  2-3 UUID role ids, user auth)
- `DELETE /api/saved-comparisons/[id]` — delete scoped by `user_id`

**Database:**
- `saved_comparisons` table — `(id, user_id, name, role_ids uuid[], created_at, updated_at)`
  with CHECK `array_length(role_ids, 1) BETWEEN 2 AND 3`, FK cascade on
  `auth.users`, btree index on `user_id`, RLS scoped to `auth.uid() = user_id`
  (all four verbs `TO authenticated`).
- `role_profiles` — gained `typical_entry_age`, `typical_hours_per_week`,
  `min_entry_qualification`, `typical_entry_qualification`,
  `typical_starting_salary_gbp`, `typical_experienced_salary_gbp` in the
  earlier Stage 1.5f migrations; the compare tool reads these directly.

**Library modules:**
- `lib/compare/url-state.ts` — typed parser + serialiser for `?t=` URL
  state; `MAX_TABS=3`, `MIN_SLOTS_PER_TAB=2`, `MAX_SLOTS_PER_TAB=3`
  constants live here and are imported everywhere else.
- `lib/compare/active-compare-cookie.ts` — `ACTIVE_COMPARE_COOKIE` name
  + `buildCompareHrefForRole` pure helper used by the "Compare this
  career" button on role pages to prepend the visiting role to an
  existing comparison.
- `lib/earnings/tax-ni.ts` — Scottish income tax 2025-26 bands (6 rates,
  starter / basic / intermediate / higher / advanced / top), personal
  allowance taper £100-125k, NI Class 1 employee primary / UEL bands.
- `lib/earnings/training-phases.ts` — slug-keyed lookup of pre-entry
  training salaries for ~14 roles (doctor FY1, dentist DFT, vet new-grad,
  pharmacist pre-reg, 4 teacher variants, 4 apprentice-trade stepped
  wages, clinical-psychologist DClinPsy stipend).
- `lib/earnings/role-slug.ts` — title → training-phase slug mapping
  (hand-curated switch; see Known limitations below).
- `lib/earnings/lifetime-calculator.ts` — `calculateLifetimeEarnings`
  main entry; exports `UK_MEDIAN_SALARY_GBP = 37430`.

**Components:**
- `components/compare/compare-shell.tsx` — top-level client component;
  owns tab state, URL sync, cookie sync, example-dismiss logic
- `components/compare/ComparisonGrid.tsx` — 6 `<details>` accordion
  sections (Headline / Earnings / Daily work / Wellbeing / Progression
  / Assumptions) fed by a React-Query fetch
- `components/compare/EarningsSection.tsx` — Net/Gross + pension toggles,
  Starting / Experienced / Lifetime NumericBars, expandable lifetime
  projection chart with training-phase opacity styling, hidden sr-only
  `<table>` mirror of the chart
- `components/compare/TierBar.tsx`, `NumericBar.tsx`, `LabelRow.tsx` —
  field-row primitives
- `components/compare/save-comparison-control.tsx` — Save button + modal
  (signed-in) / Sign-in link (unauthenticated) with return-to wiring
- `components/careers/compare-career-button.tsx` — role-page CTA that
  reads the active-compare cookie and computes a `/careers/compare?t=…`
  href in `useMemo` so the role page stays statically generated

**Known limitations (address in Phase 2 if the tool ships):**
- Two-phase pay model only — starting salary at `typical_entry_age`,
  linear ramp to experienced salary over 14 years, flat thereafter.
  No mid-career bump, no role-dependent promotion step.
- Training-phase coverage is sparse — only ~14 of 269 roles have a
  training segment defined (doctor, dentist, vet, pharmacist, advocate,
  solicitor, clinical psychologist, 4 teacher variants, 4 apprentice
  trades). All other roles use `typical_entry_age` with zero earnings
  before it; that's correct for most but understates apprentice-like
  starts for unmapped trades. The role → slug lookup is a hand-curated
  title switch in `lib/earnings/role-slug.ts`; promote to a
  `role_profiles.training_slug` column if the map grows past ~30 slugs.
- Tax model is Scottish-only (2025-26 bands). No UK RoW fallback, no
  student-loan Plan 4 repayment line (annual refresh every 6 April;
  re-verify against gov.scot budget publication).
- Employer-pension percentage is a blended 15% default that spans
  NHS (~20.5%), STPS (~26%), LGPS (~19%), and auto-enrolment minimum
  (3%). Not role-specific; the toggle is a single boolean, not a
  per-role knob.
- No in-browser visual QA has been run on the compare flow end-to-end.
  Typecheck + lint + unit tests + Next build are all clean; see
  `docs/qa-screenshots/README.md` for the QA gap and the Playwright
  recipe to close it.

## Important Commands

```bash
# Navigate to project
cd D:\Dev\pathfinder-scotland

# Link to Supabase (if needed)
npx supabase link --project-ref qexfszbhmdducszupyzi

# Push migrations (careful - check first)
npx supabase db push

# Check what's different between local and remote
npx supabase db diff

# Mark migration as applied (if already in DB)
npx supabase migration repair --status applied [migration_name]
```

## Conventions

### Migration file conventions
- Supabase migration files MUST NOT include `BEGIN;` / `COMMIT;` statements.
- The Supabase MCP `apply_migration` tool wraps its own transaction, and Supabase CLI's `db push` also wraps transactions. Explicit `BEGIN` / `COMMIT` in the file causes nested-transaction errors on re-apply.
- Convention: transaction boundary is owned by the applying tool, not the file.
- When writing multi-statement cleanup migrations, sequence statements assuming they will execute within an outer transaction.
- **All schema changes MUST go through a migration file**, generated with `npx supabase migration new <name>`, committed to git, and applied via `npx supabase db push` or the Supabase MCP `apply_migration` tool. Do NOT make schema changes via raw SQL through MCP `execute_sql` or Supabase Studio's SQL editor. (Data-level changes -- seed data, one-off corrections -- can still go through `execute_sql`; this rule applies to DDL only.)
- The migration history was reset on **22 April 2026 (Session 11b)**. The previous 94 files are archived under `supabase/migrations/_archived_pre_11b_reset/` and superseded by `20260422143617_baseline_production_schema.sql`. See `docs/migration-reset-11b.md` for the workflow.

### AI horizon ratings (`career_roles.ai_rating_2030_2035`, `career_roles.ai_rating_2040_2045`)
- Range: 1-10 integer (nullable), `CHECK` constraints enforce bounds on each column. `NULL` = not yet rated.
- Direction: 1 = AI barely affects the role (embodied, licensed, human-presence work). 10 = role is AI-native or exists primarily to supervise, train, govern or develop AI systems.
- `ai_rating_2030_2035`: early-career window — what the role looks like for students entering the workforce 2025–2035.
- `ai_rating_2040_2045`: mid-career window — what the role looks like for professionals mid-career in 2040–2045.
- Full rubric, drift guidance, heuristics, and pilot examples: `docs/ai-horizon-rubric.md`.
- Companion rubric: `docs/robotics-rating-rubric.md` (robotics 2030-2035 and 2040-2045 horizons).
- The old `ai_rating` column was dropped April 2026; historical snapshot at `docs/audits/ai_rating_historical_snapshot_2026-04-19.csv`.

### `is_new_ai_role` flag semantics
- Current meaning: role was created by AI / did not exist in recognisable form pre-2020.
- Does NOT mean "AI is central to this role today" — several roles where AI is now central (e.g. Bioinformatics Specialist) are correctly flagged false because the role pre-dates the current AI era.
- Phase 2 backlog: consider renaming to `is_post_2020_ai_role` for semantic clarity, or splitting into two flags for role novelty vs current AI-centrality.
- Do not rely on this flag as a proxy for AI impact. Use `ai_rating_2030_2035` for that.

### Reading PL/pgSQL functions before writing dependent data

Before writing UPDATE, INSERT, or DELETE statements against a table used 
by a PL/pgSQL function, read the function body first. Check every column 
reference in both the WHERE clause and the SELECT list. Never infer 
function behaviour from column names.

Pathfinder has had three incidents caused by violating this principle 
(AND/OR semantic assumptions on bursary requirement flags; ghost columns 
that exist in the schema but are not read by the function; unqualified 
table references in SECURITY DEFINER functions). Use 
pg_get_functiondef(oid) to inspect the function definition when in doubt.

### STOP gate principle

A STOP gate is a session pause where Claude Code must show the user what it
is about to do and wait for explicit approval. STOP gates are valuable when
they prevent irreversible mistakes; they add friction when applied to routine
operations. Apply this test before adding a STOP gate to any task prompt:

**A STOP gate is warranted only if at least one of these applies:**

1. The change is irreversible or expensive to reverse -- any DELETE, DROP,
   schema change, or sector creation with UI dependencies.
2. The content is user-facing and first-look review adds value -- new sector
   narratives, public-facing descriptions, external copy.
3. The session has branched on findings that warrant a product decision --
   unexpected data state, ambiguous research output, scope question.

**A STOP gate is NOT warranted for:**

- Input validation that is expected to pass (fail loudly if it fails; proceed
  silently if it passes).
- INSERT of pre-reviewed data (the review happened upstream; duplicating it
  is friction).
- Read-only operations.
- Routine reporting or summary output.

**Typical gate count for data-expansion sessions:**

- Gate A: pre-seed snapshot (count summary + 2-3 sample transformed rows)
  before any bulk INSERT.
- Gate B: before-after diff for any UPDATE to existing rows.
- Gate C: row-ID guard for any DELETE.

A session with only inserts needs one gate. A session with splits or
corrections needs one per update/delete pattern plus one for the bulk insert.

## Revenue Targets
- Year 1: £3-12k
- Year 3: £20-50k

## Key Contacts/Resources
- Domain connection: Sister works as careers advisor in England (validation + expansion opportunity)

---

## Phase 0 orientation (required at session start)

**Pre-flight reading (in order):**
1. `CLAUDE.md` (this file) in full
2. `docs/session-learnings.md` -- 3 most recent entries
3. `docs/phase-2-backlog.md` -- scan for items in scope of this session
4. `docs/ai-horizon-rubric.md` -- if the session touches `ai_rating_2030_2035` or `ai_rating_2040_2045`
5. Any session-specific research file in `docs/research/`

**Pre-flight shell:**
- `cd D:\Dev\pathfinder-scotland`
- `npx supabase db diff` to check for drift

**Project state (pointers, not inline duplication):**
- Current Status -- see `## Current Status` above
- Shipped features -- see `## Completed Features` above
- Active conventions -- see `## Conventions` above (migration rules, AI rating scale, `is_new_ai_role` semantics, read-function-before-writing-data)
- Subagent rules -- see `## Claude Code subagent patterns` below
- Session-close workflow -- see `## Session workflow` below

**Standing rules (always apply):**
- Database has real data. Never reset without explicit user confirmation.
- 99% accuracy standard on engineering outputs. No fabricated citations or specs.
- Minimise upfront costs. Pragmatic solutions preferred.
- British English, SI units, GBP (£), ASCII-safe outputs.
- Verify existing schema before writing a migration. Migrations MUST NOT contain `BEGIN;` / `COMMIT;`.

**STOP gates (pause and ask before proceeding):**
- Before destructive operations (db resets, bulk deletes, `git reset --hard`, `--force` pushes, dropping/renaming a shipped table/column/function).
- Before applying a migration that alters production data -- show the SQL and wait for approval.
- When memory claims a feature is complete -- verify against live schema + function behaviour before trusting.
- When a task surfaces an out-of-scope problem -- log it to `docs/phase-2-backlog.md` and move on; do not expand session scope without user approval.

## Claude Code subagent patterns

### Subagent file-deliverable verification

When delegating file creation to a subagent, the delegating prompt must:

1. Specify the absolute file path where the deliverable should be written
2. Require the subagent to confirm the file exists (e.g. via a view or ls 
   equivalent) before reporting task completion
3. Reject verbal-summary-only completions; the deliverable is the file, 
   not the subagent's summary

Subagents in current Claude Code versions can report "completed" after 
producing only a verbal summary of what the file would contain. The 
parent agent then assumes the file exists. This has caused incidents 
where downstream tasks failed because a named deliverable didn't exist 
on disk.

## Session workflow

### Capturing lessons at session end

Every session concludes with:

1. Final session report (verification queries, deviations, workflow 
   feedback)
2. Append new lessons to docs/session-learnings.md under a heading 
   dated today with the session title
3. Update docs/phase-2-backlog.md with any deferred items discovered 
   during the session
4. Commit with a session-closing commit message following the pattern 
   "session: [title] -- [brief summary]"
5. The post-commit hook will prompt if session-learnings.md was not 
   updated in this commit

Session learnings should be specific, actionable, and reference the 
session or incident that surfaced them. Avoid generic retrospective 
language; aim for "next time, do X" or "this fails when Y" entries a 
future Claude Code session could act on.

## Git hooks setup

After cloning the repo, install local git hooks:

    bash scripts/git-hooks/install.sh

The post-commit hook nudges learnings capture on session-closing commits.
