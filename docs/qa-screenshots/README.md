# Career comparison -- QA pass (Session 7, 21/04/2026)

This directory was created to hold screenshots from the end-to-end QA pass on
`/careers/compare` and `/account/saved-comparisons`. **No screenshots were
captured in this session** because the Claude Code environment used here has
no browser automation tooling (no Playwright, Puppeteer, Chromium, axe-core,
or Lighthouse CLI installed).

Rather than fabricate results, this file records exactly what was and was not
verified, so the outstanding browser-QA work is documented for a follow-up.

## Automated checks completed

- `npx tsc --noEmit` -- clean (0 errors)
- `npm test` -- 21 / 21 pass (`lib/earnings/__tests__` + `lib/compare/__tests__`)
- `npm run lint` -- 0 errors, 91 warnings (all pre-existing, none in
  `components/compare/**`, `lib/compare/**`, `lib/earnings/**`, or
  `app/account/saved-comparisons/**`)
- `npm run build` -- clean; `/careers/compare` prerenders static; 269 role
  pages still SSG-generate; `/account/saved-comparisons` is dynamic as
  expected (it calls `supabase.auth.getUser()`)

## Static code audit findings and fixes (applied this session)

- `components/compare/compare-shell.tsx` -- tab strip was using ARIA tab
  semantics incorrectly (`role="tab"` on a wrapping div that contained
  both the tab-switch button and the close button). axe-core would flag
  this as a "tab must be focusable" / "role tab must have tabpanel
  descendants" serious issue. Swapped to `aria-current="page"` on the
  active tab button; dropped `role="tablist"` / `role="tab"` /
  `aria-selected` since these are workspace switchers, not a classic
  tab-panel pattern.
- `components/compare/save-comparison-control.tsx` -- save modal did not
  respond to Escape (selector modal did). Added a window keydown
  listener that closes the modal on Escape (disabled while submitting
  to avoid losing an in-flight request). Linked the error `<p>` to the
  input via `aria-describedby` + `aria-invalid`, and marked the error as
  `role="alert"` so it is announced when it appears.

## Browser / user-flow QA not completed in this session

The following steps from the task prompt require a real browser and were
**not executed**. Each one should be re-attempted in a follow-up session
that runs with Chrome + an accessibility tool installed.

1. First-time visit of `/careers/compare` shows Electrician / Primary
   Teacher / Nurse example with dismiss-on-touch banner
2. Search finds "Electrician" in <200ms autocomplete
3. Adding a 2nd tab works; adding a 4th is blocked; close buttons behave
4. Toggling Net / Gross changes the earnings bar values (record before
   and after)
5. Toggling pension on changes lifetime total upward
6. Lifetime projection expands with training-phase hatching for Medicine
7. Self-employment caveat renders for a Common role (Electrician test)
8. Saving a comparison and reloading it from
   `/account/saved-comparisons` works end-to-end
9. "Compare this career" button on the role page adds the role to the
   active comparison (cookie round-trip)
10. Mobile view at 380px stacks correctly and tabs scroll horizontally
11. axe-core clean run on `/careers/compare`
12. Screen reader announcement check on a TierBar row and the earnings
    projection's hidden data table
13. Lighthouse run on `/careers/compare` with 3 careers loaded (target
    LCP <2.5s, CLS <0.1)

## Follow-up recommendation

Install Playwright + axe-core as devDependencies and run:

```bash
npm i -D @playwright/test @axe-core/playwright
npx playwright install chromium
```

A single `e2e.spec.ts` file covering steps 1-10 of this list would take
roughly 200 lines and would let every future change to the compare flow
regression-test without a manual walk-through.
