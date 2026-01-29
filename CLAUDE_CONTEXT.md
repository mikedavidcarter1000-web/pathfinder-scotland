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
- Social login integration planned (Google, Apple, Facebook, GitHub, X, Reddit)
- AI-generated imagery approach for visuals (not commissioned photography)

## Pending Features (NOT YET IMPLEMENTED)

### 1. Promo Code System
- Ability to create promo codes for discounts
- Track usage and redemptions
- Expiry dates and usage limits

### 2. GDPR/Data Security Features
- `delete_user_data()` function - fully delete user and their data
- `audit_log` table - track data access and changes
- `export_user_data()` function - generate user data export for GDPR requests

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
