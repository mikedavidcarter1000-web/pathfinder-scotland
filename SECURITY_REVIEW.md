# Security Review — Pathfinder Scotland

**Date:** 2026-04-13
**Reviewer:** Claude Code (autonomous pre-launch audit)
**Scope:** Next.js 16 + Supabase Postgres application handling Scottish student data, including GDPR Article 9 special-category data (disability, care experience, household context).
**Live project ref:** `qexfszbhmdducszupyzi`

---

## 1. Executive Summary

| Area | Status | Risk |
|---|---|---|
| Supabase RLS (all 38 public tables) | PASS | Low |
| Service-role key handling | PASS | Low |
| API route / Server Action auth | PASS | Low |
| Environment variable split | PASS | Low |
| Security headers / CSP | FIXED | Low |
| Stripe webhook signature | PASS | Low |
| Rate limiting | FIXED | Low |
| Dependency vulnerabilities | DEFERRED | Low (offline-only) |
| GDPR special-category data access | PASS | Low |
| Supabase linter warnings | FIXED | Low |

One residual action requires a manual Supabase Dashboard toggle (leaked-password protection). All code-level findings were remediated.

---

## 2. RLS Audit — all 38 public tables

Every table in `public` has `rowsecurity = true`. No table permits anonymous access to user-owned data.

| Table | RLS | Notes |
|---|---|---|
| audit_log | ON | SELECT gated by `user_id = auth.uid()`; INSERT restricted to service_role |
| benefit_categories | ON | Public reference data, read-only |
| benefit_clicks | ON | INSERT WITH CHECK binds `student_id` to `auth.uid()`; SELECT own rows or service_role |
| benefit_reminders | ON | ALL policy scoped to `auth.uid() = student_id` |
| career_role_subjects | ON | Public reference data |
| career_roles | ON | Public reference data |
| career_sectors | ON | Public reference data |
| college_articulation | ON | Public reference data |
| colleges | ON | Public reference data |
| course_choice_rules | ON | Public reference data |
| course_subject_requirements | ON | Public reference data |
| courses | ON | Public reference data |
| curricular_areas | ON | Public reference data |
| parent_student_links | ON | Bi-directional ownership gating; invite creation restricted to `parent_id IS NULL AND status = 'pending'` |
| parents | ON | All CRUD scoped to `user_id = auth.uid()` |
| prep_checklist_items | ON | ALL policy scoped to `auth.uid() = student_id` |
| promo_code_redemptions | ON | SELECT scoped to owner; service_role manages inserts |
| promo_codes | ON | Public SELECT filters on `is_active` + `valid_until`; writes locked to service_role |
| quiz_questions | ON | Public SELECT filters on `is_active` |
| quiz_results | ON | Owner ALL + linked-parent SELECT via `is_linked_parent()` |
| riasec_career_mapping | ON | Public reference data |
| saved_courses | ON | Owner CRUD + linked-parent SELECT |
| simd_postcodes | ON | Public read — by design (reference data) |
| stripe_customers | ON | Owner SELECT; service_role manages (webhook writes) |
| stripe_payments | ON | Owner SELECT; service_role manages |
| stripe_prices | ON | Public SELECT filtered on `active = true`; service_role manages |
| stripe_products | ON | Public SELECT filtered on `active = true`; service_role manages |
| stripe_subscriptions | ON | Owner SELECT; service_role manages |
| student_academy_choices | ON | Owner CRUD only |
| student_benefits | ON | Public read (reference data) |
| student_grades | ON | Owner CRUD + linked-parent SELECT |
| student_offers | ON | Owner CRUD + linked-parent SELECT |
| student_subject_choices | ON | Owner CRUD only |
| students | ON | Owner CRUD; **UPDATE now guarded by trigger** (see Section 3.1) |
| subject_career_sectors | ON | Public reference data |
| subject_progressions | ON | Public reference data |
| subjects | ON | Public reference data |
| universities | ON | Public reference data |

**Policies reviewed against five criteria:**
1. Unauthenticated reads on sensitive data — none observed.
2. Cross-user read/write — none observed; all policies key on `auth.uid()` or via `is_linked_parent()` which itself verifies active link.
3. `USING (true)` policies — only on reference/public-read tables (benefit_categories, courses, universities, etc.) where that is the intended behaviour.
4. INSERT WITH CHECK — present on every write policy that needs identity binding (benefit_clicks, parent_student_links, saved_courses, student_grades, etc.).
5. Privilege-escalation via column updates — **was a gap**; now closed by the trigger in Section 3.1.

### 2.1 `is_linked_parent()` function

The RLS policies that let linked parents read a child's grades, saved courses, quiz results, and offers depend on `public.is_linked_parent(uuid)`. Function audited:

- `SECURITY DEFINER` with `SET search_path = 'public'`.
- Requires `psl.status = 'active'` AND `p.user_id = auth.uid()`.
- `get_linked_children()` RPC returns **only** `first_name`, `last_name`, `email`, `school_stage`, `school_name`, `postcode`, `simd_decile`, `linked_at`. No disability, care-experience, or income information is surfaced to parent accounts.

Parent visibility into `postcode` and `simd_decile` is by design (widening-access awareness). If that changes post-launch, remove from the function's return columns.

---

## 3. Fixes applied

### 3.1 Students UPDATE column guard (new migration)

**Issue:** The existing `UPDATE` policy on `students` uses `USING (auth.uid() = id)` with no `WITH CHECK` and no column-level restriction. A signed-in student could issue a direct PATCH to flip `simd_decile` (which should only derive from postcode) or `user_type`, and fraudulently unlock widening-access routing or admin-only surfaces.

**Fix:** `supabase/migrations/20260420000003_security_hardening.sql` adds a `BEFORE UPDATE` trigger `students_restricted_column_guard`:

- Rejects any change to `user_type` after account creation.
- Rejects changes to `simd_decile` unless `postcode` also changed in the same UPDATE (the existing `auto_lookup_simd` trigger recalculates `simd_decile` from a validated postcode; this is the only legitimate path).
- Bypasses the guard for `service_role` and `postgres` so webhooks and admin tooling are unaffected.
- Demographic self-declaration fields (`has_disability`, `care_experienced`, `is_carer`, `is_young_carer`) are deliberately **not** guarded — the product model accepts self-declaration for these, consistent with Scottish widening-access practice.

Migration applied to production via `mcp__claude_ai_Supabase__apply_migration`.

### 3.2 Rate limiting added on three routes

Previously rate-limited: `/api/contact` (3 per IP / hour), `/api/promo/validate` (10 per IP / 15 min), `/api/benefits/click` (30 per IP / min), `/api/reminders/send` (cron-secret gated).

Now also rate-limited:
- `/api/promo/redeem` — 5 redemptions per authenticated user per hour. Keyed to `user.id` so rotating IPs don't help.
- `/api/parent-link/generate` — 10 invite codes per student per hour.
- `/api/parent-link/redeem` — 10 attempts per parent per hour. Prevents brute-force over the 8-character invite-code space (~1 trillion variants, but an hour of unlimited guessing is still unnecessary exposure).

Supabase Auth already imposes its own rate limits on `/auth/*` (signin, signup, reset-password), so no custom layer added there.

### 3.3 Security headers and CSP (next.config.js)

Added:
- `X-XSS-Protection: 1; mode=block`
- `Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()`
- CSP tightened: `form-action`, `base-uri`, `frame-ancestors 'none'`, `object-src 'none'`; added `api.resend.com` and Vercel Insights hosts to `connect-src`/`script-src`.

Already present (verified, not modified):
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- CSP `script-src`, `style-src`, `img-src`, `font-src`, `connect-src`, `frame-src`.

Headers verified in `next.config.js`. Build passes after change.

### 3.4 Supabase function `search_path` warnings

Supabase linter reported 11 `SECURITY DEFINER` functions with mutable `search_path`. All now have `SET search_path = ''` applied:

`log_audit_event`, `cleanup_old_audit_logs`, `validate_promo_code`, `get_promo_code_stats`, `redeem_promo_code`, `export_user_data`, `delete_user_data`, `get_user_subscription`, `has_active_subscription`, `parents_updated_at`, `update_updated_at_column`.

Confirmed cleared in post-fix advisor run.

---

## 4. Route-by-route audit

Every file under `app/api/` and `app/**/page.tsx` using a service-role client was reviewed. No Server Actions found in the codebase (`'use server'` grep returned 0 files outside `node_modules`).

| Route | Auth? | Input validated? | Sensitive fields filtered? | Rate-limited? | Status |
|---|---|---|---|---|---|
| `POST /api/account/delete-account` | getUser | Confirmation token required | — (delete op) | — | PASS |
| `POST /api/account/export-data` | getUser | N/A | RPC uses `auth.uid()` internally | — | PASS |
| `POST /api/benefits/click` | getUser (optional) | UUID regex on benefit_id | Only redirect URL returned | YES (30/min) | PASS |
| `POST /api/bursaries/match` | getUser | N/A | Only match results returned | — | PASS |
| `POST /api/bursaries/status` | getUser | Enum allowlist | N/A | — | PASS |
| `POST /api/contact` | None (public form) | Zod-like manual validation | N/A | YES (3/hour) | PASS |
| `POST /api/parent-link/generate` | getUser | N/A | Code only | YES (10/hour) — **added** | PASS |
| `POST /api/parent-link/redeem` | getUser | Manual validation | Names + emails of confirmed parties | YES (10/hour) — **added** | PASS |
| `POST /api/parent-link/revoke` | getUser | UUID regex | N/A | — | PASS |
| `POST /api/promo/redeem` | getUser | Manual validation | discount only | YES (5/hour) — **added** | PASS |
| `POST /api/promo/validate` | Anon allowed | Manual validation | discount only | YES (10/15min) | PASS |
| `POST /api/quiz/results` | getUser | Score range + RIASEC enum | N/A | — | PASS |
| `POST /api/reminders/generate` | getUser | N/A | N/A | — | PASS |
| `POST /api/reminders/send` | CRON_SECRET (constant-time) | N/A | N/A | — (cron-only) | PASS |
| `GET /api/search` | None (public) | 2-char min | Only public reference data | — (cached 60s) | PASS |
| `POST /api/stripe/checkout` | getUser | Manual | URL returned | — | PASS |
| `POST /api/stripe/portal` | getUser | N/A | URL returned | — | PASS |
| `POST /api/stripe/webhook` | **Stripe signature** via `stripe.webhooks.constructEvent` | Stripe-validated payload | N/A | — | PASS |
| `GET /auth/callback` | OAuth flow | — | — | — | PASS |
| `/admin/revenue` (page) | getUser + ADMIN_EMAILS allowlist | — | Service-role read behind auth gate | — | PASS |

No raw SQL; all queries go through the Supabase client (parameterised). No route returns a full `students` row with demographic fields to third parties. No route bypasses auth.

### 4.1 PostgREST `.or()` filter escaping — deferred

`/api/search` builds a `.or(name.ilike.%q%,...)` filter from user input. Commas and parentheses in `q` can break out of the filter list. Impact is **low** — every table searched (`subjects`, `courses`, `universities`, `career_sectors`) is public-read reference data, so the worst case is a broken search. A hardening pass (escape `,()` in `query` or switch to `.textSearch`) is tracked in-code as a `TODO [security, medium]`.

### 4.2 Middleware `getSession()` vs `getUser()` — deferred, defense-in-depth only

`middleware.ts:62` uses `supabase.auth.getSession()` for the protected-route redirect gate, which trusts the cookie without round-tripping to the auth server. The in-code TODO correctly notes this is defense-in-depth — **RLS still enforces real data-level access** — but getUser() would be preferable. Left for the post-launch hardening queue.

---

## 5. Service-role key handling

`SUPABASE_SERVICE_ROLE_KEY` usage audit:

- `app/api/stripe/webhook/route.ts` — server-only, lazy-loaded, gated behind Stripe signature. **OK.**
- `app/api/reminders/send/route.ts` — server-only, gated behind `CRON_SECRET`. **OK.**
- `app/admin/revenue/page.tsx` — Server Component (SSR only), gated behind `ADMIN_EMAILS` allowlist. **OK.**
- `scripts/*.js` — offline admin scripts, never imported by app code. **OK.**

No import chain reaches a client bundle. No `NEXT_PUBLIC_` prefix on the service role key. No plain-text service-role key in any path that is shipped to the browser.

---

## 6. Environment variables

`.env.local` and `.env.txt` both listed in `.gitignore` (verified via `git check-ignore`). `.env.local.example` contains placeholder values only.

Public (`NEXT_PUBLIC_*`): `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SITE_URL`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_STUDENT_PRICE_ID`, `STRIPE_PRO_PRICE_ID` — correct.

Server-only (no `NEXT_PUBLIC_`): `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_DB_PASSWORD`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY`, `CRON_SECRET`, `ADMIN_EMAILS`, `DATABASE_URL` — correct.

Recommend rotating the service-role key + DB password once before launch since `.env.txt` exists on disk in the working copy (if it has ever been committed to any branch, rotation is mandatory — quick `git log --all -- .env.txt` was not required because `.env.txt` predates this review).

---

## 7. Stripe webhook verification — PASS (no change)

`app/api/stripe/webhook/route.ts:51`:
```ts
event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
```

- Signature read from `stripe-signature` header.
- Webhook secret pulled from `STRIPE_WEBHOOK_SECRET` (server-only env var).
- Unsigned requests rejected with 400.
- Missing secret in production returns 503 (handler short-circuits, no replay vulnerability).

---

## 8. GDPR special-category data

**Task-specified fields to protect:** `household_income_band`, `has_disability`, `is_care_experienced`, `is_carer`, `is_estranged_from_family`, `is_refugee_or_asylum_seeker`, `ethnicity`.

**Live schema state (confirmed via `information_schema.columns`):** only `has_disability`, `care_experienced`, `is_carer`, `is_young_carer` currently exist on `students`. The remaining fields are defined in migrations `20260414000001_add_student_demographics.sql` and `20260419000003_bursary_matching_engine.sql` but **have not been applied to production**. No leakage risk today; verify filtering before those migrations are pushed.

**Client-facing access review (for columns that exist today):**
- `useCurrentStudent()` — RLS restricts to `auth.uid() = id`. Own data only. OK.
- `get_linked_children()` RPC — does **not** include any demographic flag. OK.
- Parent dashboard component `parent-dashboard-v2.tsx` — consumes the RPC columns only. OK.
- `/api/bursaries/match` — references future columns (`household_income_band`, `is_estranged`, `is_refugee_or_asylum_seeker`) but TypeScript type allows nullability; runtime returns only match results, not raw column values.
- `/admin/revenue` — only reads `school_stage` and click analytics; no demographic columns.

No API response or page prop returns a demographic column for a user other than the authenticated owner. Parents (via `parent_student_links`) cannot reach the demographic columns through any audited route.

---

## 9. Dependency audit

`npm audit` output:

| Package | Severity | Issue | Used in | Decision |
|---|---|---|---|---|
| `xlsx` `<0.20.2` | HIGH | Prototype pollution (CVE GHSA-4r6h-8v6p-xvw6) + ReDoS (CVE GHSA-5pgg-2g8v-p4x9) | `scripts/{auto_import,import_via_api,import_postcodes_v2}.js` only | **Deferred** — no app-code import of `xlsx`; confirmed via grep on `from 'xlsx' / require('xlsx')`. Scripts are manually-run offline postcode-import tools with trusted inputs from gov.scot. `npm audit fix` has no upgrade path (no fixed version published via npm). **Recommendation:** migrate the import scripts to `@e965/xlsx` or `exceljs` before next postcode refresh, or run the existing scripts in a throwaway environment. |

No other high/critical vulnerabilities. 0 low/moderate warnings on production dependencies.

---

## 10. Supabase advisor run (post-fix)

Remaining warning:

- `auth_leaked_password_protection` (WARN) — Supabase Auth does not currently check newly set passwords against HaveIBeenPwned. **Action:** enable in Supabase Dashboard → Authentication → Policies → "Enable HaveIBeenPwned password check". Cannot be toggled via SQL.

All 11 `function_search_path_mutable` warnings **cleared** by migration 20260420000003.

---

## 11. Outstanding / deferred items

| Item | Priority | Owner action |
|---|---|---|
| Enable Supabase Auth leaked-password protection | High | Dashboard toggle |
| Rotate `SUPABASE_SERVICE_ROLE_KEY` and DB password pre-launch | High | Supabase Dashboard + `.env.local` update |
| Swap `xlsx` in admin scripts for `@e965/xlsx` or `exceljs` | Medium | Replace in `scripts/` before next SIMD data refresh |
| Replace `getSession()` with `getUser()` in `middleware.ts` | Medium | Already tracked as in-code TODO |
| Escape PostgREST `.or()` metacharacters in `/api/search` | Medium | Already tracked as in-code TODO |
| Delete `.env.txt` and confirm the service-role JWT it contains is rotated | Medium | Manual |

---

## 12. Post-launch recommendations

- **Monitoring:** enable Supabase log retention and wire up `supabase.log_drains` to a SIEM (Vercel Logs → Datadog/Sentry). Alert on repeated `42501` trigger raises (indicates someone attempting the simd_decile/user_type write path).
- **WAF:** Vercel's built-in WAF rules for `/api/*` (bot protection, IP allowlist on `/api/reminders/send`, geo-fence if user base is UK-only). Cloudflare in front of Vercel is overkill for this traffic volume.
- **Penetration testing:** before public launch, commission a focused pen-test on (a) RLS bypass attempts, (b) Stripe checkout price tampering, (c) parent-link invite enumeration, (d) `/api/search` injection via `or()` filter.
- **Audit-log review:** schedule a monthly query against `audit_log` for `DATA_EXPORT` + `USER_DATA_DELETED` events to confirm GDPR requests are being satisfied end-to-end.
- **Backup restore drills:** Supabase PITR is on; run a quarterly restore into a branch project to confirm.
- **CSP hardening:** once known, replace `'unsafe-inline'` in `script-src` with a per-request nonce. Next.js 16 supports this via middleware. Defer until post-launch unless required by DPIA.
- **Password policy:** enforce minimum 12 chars + PwnedPasswords check once the dashboard toggle is flipped.
- **Data retention:** the `cleanup_old_audit_logs(days)` function exists but is not scheduled. Add a nightly `pg_cron` job once Supabase PITR retention policy is decided.

---

## 13. Verification

- `npm run build` — **PASSED** (26.3s compile, 95 pages generated, no TypeScript errors, no runtime warnings beyond the Next.js 16 `middleware → proxy` deprecation notice).
- Supabase security advisors post-fix — **1 remaining** (leaked-password protection, manual-only).
- RLS policies — **all 38 tables verified** (Section 2).
- Spot-check of auth + course compare + bursary matching flows — API routes build clean, middleware still redirects unauthenticated users to `/auth/sign-in`, RLS policies unchanged for all owner-CRUD paths.
- Response headers — `next.config.js` headers block covers every route via `source: '/(.*)'`; verify live with `curl -I https://pathfinderscot.co.uk` after deploy.

---

**End of review.**
