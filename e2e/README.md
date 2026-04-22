# e2e tests (Playwright)

Playwright harness installed in Session 11a. The current suite covers
Tier 1 auth UI and public-page smoke tests; none of the tests create
real users, seed the database, or submit forms that write to production.

## Running locally

```bash
npm run test:e2e                  # full suite, chromium + webkit
npm run test:e2e -- e2e/auth.spec.ts         # one file
npm run test:e2e -- --project=chromium       # one browser
npm run test:e2e:ui               # Playwright UI mode
npm run test:e2e:debug            # PWDEBUG=1, step-through
```

The config auto-starts `npm run dev` against `http://localhost:3000` and
reuses an existing dev server if one is already running. To run against
a different URL (e.g. a preview deploy), set `PLAYWRIGHT_BASE_URL`:

```bash
PLAYWRIGHT_BASE_URL=https://pathfinder-preview.vercel.app npm run test:e2e
```

The `webServer` block only activates when `PLAYWRIGHT_BASE_URL` is
missing or points at localhost.

## Scope

This session (11a) installs Playwright and adds:

- `e2e/auth.spec.ts` -- sign-up / sign-in / forgot-password UI render
  + wrong-credentials error + simulated rate-limit response
- `e2e/smoke.spec.ts` -- landing, /for-parents, /for-teachers,
  /for-advisers, /ai-careers, /careers/compare (example banner +
  dismiss-on-edit)

Explicitly deferred to Session 11c:

- Sign-up success path (creates a real account). Needs a dedicated test
  database; writing to production is forbidden.
- Sign-in success path (needs a pre-seeded test user).
- Pilot-interest form submission on /for-teachers + /for-advisers +
  /for-parents (writes to `pilot_interest` in production).
- CI wiring (the config is CI-aware via env vars but no workflow has
  been added yet).
- Email-follow-up tests (magic link, password reset completion) --
  require an inbox automation harness.

`e2e/helpers/test-accounts.ts` exports a `cleanupTestAccount` stub
whose implementation is deferred to Session 11c when a dedicated test
database exists. Until then the auth spec only exercises flows that
do not need a real account.

## Debugging

- `trace: 'on-first-retry'` -- locally, retries are 0, so a failing
  test never produces a trace. Re-run with `--retries=1` to capture one,
  or `--trace=on` for every run.
- Screenshots are kept for failed tests only (`screenshot: 'only-on-failure'`).
- Reports land in `/playwright-report` (HTML) and `/test-results`
  (per-test artefacts). Both are gitignored.
