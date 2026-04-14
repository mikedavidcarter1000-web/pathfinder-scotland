# Pathfinder Scotland - Claude Code Context

**Last Updated:** 14 April 2026

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

## Revenue Targets
- Year 1: £3-12k
- Year 3: £20-50k

## Key Contacts/Resources
- Domain connection: Sister works as careers advisor in England (validation + expansion opportunity)

## Notes for Claude Code
- Database has real data - never reset without explicit confirmation
- Always verify outputs with 99% accuracy standard
- Minimise upfront costs - pragmatic solutions preferred
- Check existing schema before creating migrations

---

## Session Startup Checklist
1. `cd D:\Dev\pathfinder-scotland`
2. `npx supabase db diff` (check current state)
3. Review pending features above
4. Continue implementation
