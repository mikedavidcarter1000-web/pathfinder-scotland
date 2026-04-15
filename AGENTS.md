# AGENTS.md -- Pathfinder Scotland

> Shared agent instructions for Google Antigravity, OpenAI Codex, and Google Jules.
> Place in the project root alongside CLAUDE.md and GEMINI.md.
> Antigravity reads this file automatically from v1.20.3+.
> For Antigravity-specific overrides, see GEMINI.md.

---

## Project identity

- **Name:** Pathfinder Scotland
- **Purpose:** B2C SaaS platform helping Scottish secondary school students (S2--S6, ages 13--18) navigate subject choices and university/college pathways. Strong widening access mission targeting students from disadvantaged areas (SIMD-linked).
- **Project path:** `D:\Dev\pathfinder-scotland`
- **Live URL:** https://pathfinder-scotland.vercel.app
- **Domain:** pathfinderscot.co.uk
- **Git remote:** mikedavidcarter1000-web/pathfinder-scotland

## Tech stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| Database | Supabase (project ref: `qexfszbhmdducszupyzi`) |
| Hosting | Vercel |
| Payments | Stripe |
| Email | Resend (integrated with Supabase SMTP) |
| Auth | Supabase Auth (email/password, OAuth) |

## Build and test commands

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production (always run before committing)
npm run build

# Lint
npm run lint

# Apply Supabase migration
npx supabase migration up --project-ref qexfszbhmdducszupyzi
```

## Directory structure

```
src/
  app/
    (main)/          # Authenticated routes (dashboard, pathways, careers, etc.)
    (auth)/          # Login, signup, password reset
    (public)/        # Public pages (blog, support hub)
    api/             # API routes
  components/        # Shared React components
  lib/               # Utilities, Supabase client, hooks
  types/             # TypeScript type definitions
public/              # Static assets (logos, favicons, images)
supabase/
  migrations/        # SQL migration files (timestamped)
  seeds/             # Seed data files
```

## Code conventions

### General
- TypeScript throughout. No `any` types without justification.
- UK English in all user-facing text (colour, organisation, programme, etc.).
- ASCII-safe output in all content: use `--` not em-dash, `->` not arrow symbols, `GBP` or spelled-out amounts not pound signs, straight quotes only.
- All monetary values in GBP.
- "Qualifications Scotland" (not "SQA" -- SQA was dissolved February 2026).

### React / Next.js
- App Router conventions: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`.
- Server Components by default. Only add `'use client'` when hooks or interactivity are required.
- Use Supabase SSR helpers (`createServerClient`) in Server Components.
- Use Supabase browser client (`createBrowserClient`) in Client Components.
- All data fetching in Server Components where possible.
- Null-safe access on all database query results. Never assume a field exists.
- Error boundaries on dynamic routes.

### Database / Supabase
- Schema: all student demographic columns live on the `students` table (no separate demographics table).
- RLS enabled on every table. Policies use `auth.uid()`.
- Migrations are timestamped SQL files in `supabase/migrations/`.
- Never expose `service_role` key in client-side code or `NEXT_PUBLIC_` variables.

### Git
- Commit messages: `type: description` (e.g., `feat: add career realities component`, `fix: null safety on university detail page`, `docs: update AGENTS.md`).
- Stage and commit only files changed by the current task.
- Do not commit `node_modules/`, `.env.local`, or `.next/`.
- Run `npm run build` before committing to verify zero build errors.

### Styling
- Tailwind CSS utility classes.
- Consistent colour palette (defined in `tailwind.config.ts`).
- Mobile-first responsive design -- teenagers are the primary users and use phones.

## Key domain terminology

| Term | Meaning |
|------|---------|
| SIMD | Scottish Index of Multiple Deprivation -- postcode-based deprivation measure |
| Highers | Scottish qualifications typically taken in S5 (age 16--17), main university entry qualification |
| Advanced Highers | Taken in S6, equivalent to A-levels |
| S2/S3/S4/S5/S6 | Secondary school year groups (ages 13--18) |
| SCQF | Scottish Credit and Qualifications Framework (levels 1--12) |
| Widening access | Policies enabling students from disadvantaged backgrounds to enter university |
| Contextualised admissions | Adjusted entry offers for students from target postcodes/backgrounds |
| SAAS | Student Awards Agency for Scotland (funding body) |
| Foundation Apprenticeship | Work-based learning qualification taken alongside school subjects |
| EMA | Education Maintenance Allowance (GBP 30/week for eligible 16--19 year olds) |
| Qualifications Scotland | Replaced SQA in February 2026 |

## Important context for tasks

### Database schema notes
- `has_disability` and `is_carer` columns exist on `students` table.
- `is_young_carer` column was added separately.
- SIMD data: 227,066 postcodes imported into `simd_postcodes` table.
- Promo code tables: `promo_codes` and `user_promo_codes` (verify existence before creating).
- Check for existing tables/routes before creating new ones -- multiple Claude Code sessions have built infrastructure incrementally.

### Existing infrastructure to be aware of
- Auth: email/password + OAuth, with error boundaries and timeout handling.
- Cookie consent banner: implemented (essential cookies only).
- Blog: 16 published articles at `/blog/[slug]`.
- Support hub: 12 sub-pages at `/support/[group]` covering widening access groups.
- Career sectors: 18 sector pages with career data.
- Navigation: 5 dropdown groups (Explore, Plan, Browse, Tools, Support).
- Security sweep completed: RLS, env vars, API routes, auth, headers all audited.

### Known bugs
- `/universities/[id]` and `/colleges/[id]` detail pages crash -- React rendering error from null safety. Data and RLS are fine; fix is component-level.

## Session workflow

1. **Read this file first** before making any changes.
2. **Check what exists** before creating new files, tables, or routes. Run queries or grep the codebase.
3. **One task at a time.** Complete, test (build), commit, then move to next.
4. **Build must pass.** Run `npm run build` after changes. Zero errors required.
5. **Commit after each task.** Use descriptive commit messages. Stage only changed files.

## What NOT to do

- Do not modify `.env.local` or any environment variable files.
- Do not run `npm run dev` in background processes that persist.
- Do not delete or restructure existing routes without explicit instruction.
- Do not install new npm packages without justification in the task prompt.
- Do not use `NEXT_PUBLIC_` prefix for any secret or server-side-only value.
- Do not assume SQA still exists -- it is now Qualifications Scotland.
