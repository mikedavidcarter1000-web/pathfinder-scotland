# Pathfinder Scotland - Claude Code Context

**Last Updated:** 29 January 2026

## Project Overview
Pathfinder is a B2C SaaS platform helping Scottish students navigate university applications, with emphasis on widening access programmes and the Scottish education system.

**Domain:** pathfinderscot.co.uk  
**Tech Stack:** Supabase (PostgreSQL), Next.js (assumed)  
**Project Location:** `C:\Users\marmu\pathfinder-scotland`  
**Supabase Project Ref:** qexfszbhmducszupyzi

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

## Important Commands

```bash
# Navigate to project
cd C:\Users\marmu\pathfinder-scotland

# Link to Supabase (if needed)
npx supabase link --project-ref qexfszbhmducszupyzi

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
1. `cd C:\Users\marmu\pathfinder-scotland`
2. `npx supabase db diff` (check current state)
3. Review pending features above
4. Continue implementation
