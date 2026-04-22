import { test, expect } from '@playwright/test'
import { ROUTES } from './helpers/routes'

// Smoke coverage of the non-auth-required public surfaces. These tests do
// not submit any form -- pilot-interest and homepage-teaser submissions
// would write to production tables and are deferred to Session 11c.

test.describe('Landing page', () => {
  test('renders postcode teaser with audience options in the year-group dropdown', async ({
    page,
  }) => {
    await page.goto(ROUTES.landing)

    // Hero heading on the PostcodeTeaser card
    await expect(
      page.getByRole('heading', { name: 'See what Pathfinder finds for you' }),
    ).toBeVisible()

    const postcode = page.getByLabel('Postcode', { exact: true })
    await expect(postcode).toBeVisible()

    // Year-group select is the dropdown we care about; must include S-year
    // options plus the three audience routing options.
    const yearGroup = page.getByLabel('Year group', { exact: true })
    await expect(yearGroup).toBeVisible()
    const optionTexts = await yearGroup
      .locator('option')
      .allTextContents()
    expect(optionTexts.some((t) => t.trim() === 'S2')).toBe(true)
    expect(optionTexts.some((t) => t.trim() === 'S6')).toBe(true)
    expect(optionTexts.some((t) => /parent or carer/i.test(t))).toBe(true)
    expect(optionTexts.some((t) => /teacher/i.test(t))).toBe(true)
    expect(optionTexts.some((t) => /careers adviser/i.test(t))).toBe(true)
  })
})

test.describe('For-parents page', () => {
  test('renders hero, three info sections, and a student sign-up link', async ({ page }) => {
    await page.goto(ROUTES.forParents)

    await expect(
      page.getByRole('heading', {
        name: /Supporting your child through Scotland’s education system/,
      }),
    ).toBeVisible()

    await expect(
      page.getByRole('heading', { name: 'What students get' }),
    ).toBeVisible()
    await expect(
      page.getByRole('heading', {
        name: 'Why it matters for widening access',
      }),
    ).toBeVisible()
    await expect(
      page.getByRole('heading', { name: 'How you can help' }),
    ).toBeVisible()

    // CTA and footer link both point at the student sign-up; assert at
    // least one link to /auth/sign-up is on the page.
    await expect(
      page.locator('a[href="/auth/sign-up"]').first(),
    ).toBeVisible()
  })
})

test.describe('For-teachers page', () => {
  test('renders page and exposes the pilot-interest contact form', async ({ page }) => {
    await page.goto(ROUTES.forTeachers)

    await expect(
      page.getByRole('heading', {
        name: 'Register interest in a pilot for your school',
      }),
    ).toBeVisible()
    await expect(page.getByLabel('Your name')).toBeVisible()
    await expect(page.getByLabel('Email', { exact: true })).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Register school interest' }),
    ).toBeVisible()
  })
})

test.describe('For-advisers page', () => {
  test('renders page and exposes the pilot-interest contact form', async ({ page }) => {
    await page.goto(ROUTES.forAdvisers)

    await expect(
      page.getByRole('heading', {
        name: 'Register interest in a pilot',
        exact: true,
      }),
    ).toBeVisible()
    await expect(page.getByLabel('Your name')).toBeVisible()
    await expect(page.getByLabel('Email', { exact: true })).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Register adviser interest' }),
    ).toBeVisible()
  })
})

test.describe('AI & careers page', () => {
  test('renders and shows the horizon toggle', async ({ page }) => {
    await page.goto(ROUTES.aiCareers)

    await expect(
      page.getByRole('heading', {
        name: /AI, robotics, and the future of careers/i,
      }),
    ).toBeVisible()
    // Horizon toggle buttons emit the full label text.
    await expect(
      page.getByRole('button', { name: /Near-term \(2030.2035\)/ }),
    ).toBeVisible()
    await expect(
      page.getByRole('button', { name: /Long-term \(2040.2045\)/ }),
    ).toBeVisible()
  })
})

test.describe('Careers compare page', () => {
  test('renders with example careers and the "Example comparison" banner', async ({
    page,
  }) => {
    await page.goto(ROUTES.compare)

    await expect(
      page.getByRole('heading', { name: 'Compare careers', exact: true }),
    ).toBeVisible()

    // Banner is blue-pill copy. Structural role="note" contains the strong
    // intro text "Example comparison." plus the body copy.
    await expect(page.getByText('Example comparison.')).toBeVisible()

    // Example roles are Electrician / Primary Teacher / Nurse -- at least
    // one should be populated (the page is tolerant of 2-of-3 matching).
    await expect(
      page
        .getByText(/Electrician|Primary Teacher|Nurse/, { exact: false })
        .first(),
    ).toBeVisible()
  })

  test('dismisses the example banner when the user edits a slot', async ({ page }) => {
    await page.goto(ROUTES.compare)

    // Wait for the banner to be present before we try to dismiss it.
    const banner = page.getByText('Example comparison.')
    await expect(banner).toBeVisible()

    // Removing any example career fires dismissExamples() via handleRemove.
    // The × buttons carry aria-label="Remove this career" on the populated
    // slots. Click the first one.
    const removeButtons = page.getByRole('button', {
      name: 'Remove this career',
    })
    await expect(removeButtons.first()).toBeVisible()
    await removeButtons.first().click()

    await expect(banner).toBeHidden()
  })
})
