# Testing strategy

**Last updated:** 2026-04-25 (Session 11c)

This document captures Pathfinder's e2e testing approach and the
compromises behind it.

## The compromise: disposable production accounts

The Supabase Free plan caps a single organisation at two projects.
Pathfinder already uses both slots (the production project `qexfszbhmdducszupyzi`
and a second project for an adjacent pilot). Upgrading to Pro would
unlock branching and a dedicated test project, but that spend is parked
in the Phase 2 queue until revenue exists to justify it.

As a result, the e2e suite runs against the **production Supabase
project**. Tests create short-lived auth users, exercise real flows,
and then delete everything they created before the process exits.

This is a deliberate compromise. The mitigations below make it
defensible for a pilot project; they would not be acceptable for a
production app with real customer traffic alongside the tests.

## Hard guards

Every destructive helper in `e2e/helpers/test-accounts.ts` enforces:

1. **RFC 2606 `.invalid` TLD.** Test emails match the pattern
   `/^e2e-[0-9a-f-]+@pathfinder-test\.invalid$/`. The `.invalid` TLD is
   reserved and non-routable, so even if a test leaked a sign-up, no real
   email could be delivered to it.
2. **Pattern-only cleanup.** `cleanupTestAccount(email)` refuses
   (throws) any email that doesn't match the test pattern. The function
   has no "delete user by id" or "delete arbitrary email" surface -- the
   only way to invoke it is through the pattern-gated email.
3. **One-user-per-call ceiling.** If a lookup returns more than one user
   matching the target email, cleanup throws instead of deleting any of
   them. This is a belt-and-braces guard against a collision in an
   automatically-generated email.
4. **Idempotent.** Cleanup silently succeeds when nothing matches, so
   `afterEach` can call it unconditionally without needing to track
   whether the test actually created a user.

## Test lifecycle

1. `beforeEach`: generate a fresh UUID-based email via
   `generateTestEmail()`. Optionally create a pre-confirmed auth user
   via the service-role `createTestAccount` helper to bypass email
   confirmation.
2. Test body: run the UI flow as the real user would.
3. `afterEach`: `try/finally` block calls `cleanupTestAccount(email)`.
   The `finally` ensures cleanup runs even if the test body threw.

## Weekly sweep

Test crashes, CI runner kills, and `afterEach` timeouts can still leak
orphan accounts. To catch those:

- `npm run test:sweep` runs `scripts/sweep-test-accounts.ts`
- The script lists every `auth.user` whose email matches the test
  pattern and deletes each one via the same pattern-gated helper
- Also purges any `pilot_interest` row whose email matches the pattern

**Operator responsibility:** run the sweep weekly. A calendar reminder
is the low-tech solution; a cron job on a personal laptop or Vercel
Scheduled Function would be the next step up.

## Why the service-role key is in `.env.local` (not committed)

The sweep and cleanup helpers need `SUPABASE_SERVICE_ROLE_KEY` to
invoke `auth.admin.*` APIs. The key is injected via:

- Local: `.env.local` (gitignored)
- CI: GitHub Actions secret `SUPABASE_SERVICE_ROLE_KEY`

If the key ever leaks: rotate it immediately via the Supabase Dashboard
(Project Settings > API > "Reset service role key"). The UUID-based
pattern provides defence-in-depth -- even with the key, the cleanup
helper refuses to touch non-test emails.

## Phase 2 follow-up

When Supabase Pro is available (triggered by revenue):

1. Provision a dedicated test project.
2. Point the e2e suite at the test-project URL via
   `PLAYWRIGHT_BASE_URL` and `NEXT_PUBLIC_SUPABASE_URL` overrides in
   CI.
3. Retire the `.invalid`-only guard -- it becomes defence in depth
   rather than the primary gate.
4. Delete `scripts/sweep-test-accounts.ts` (no production surface to
   sweep once tests run elsewhere).

This item is tracked in `docs/phase-2-backlog.md`.
