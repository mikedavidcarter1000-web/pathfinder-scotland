import { test, expect, type Page } from '@playwright/test'
import { ROUTES } from './helpers/routes'
import { TEST_PASSWORD, generateTestEmail } from './helpers/test-accounts'

// Every test in this file is a client-side render / interaction check. No
// test creates, modifies, or deletes real Supabase accounts. Network calls
// to Supabase Auth endpoints are intercepted via page.route in the tests
// that trigger a form submission -- full-path success tests (create a real
// account, sign in against it) are deferred to Session 11c.

// Function-based URL matchers are more reliable across browsers than glob
// strings -- webkit and chromium differ on how the query-string portion of
// a URL interacts with trailing `**` globs, and the URLs here include
// `?grant_type=password` on the token endpoint.
const isSupabaseTokenUrl = (url: URL): boolean =>
  url.pathname === '/auth/v1/token'
const isSupabaseRecoverUrl = (url: URL): boolean =>
  url.pathname === '/auth/v1/recover'

// Cross-origin supabase fetches require proper CORS response headers for
// the browser (webkit in particular) to hand the Response back to the
// supabase-js client; without these the fetch rejects as a network error
// and the hook never sees status 400/429, so no alert is rendered.
const CORS_HEADERS: Record<string, string> = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, OPTIONS',
  'access-control-allow-headers': '*',
  'access-control-allow-credentials': 'true',
}

async function fulfillJson(
  page: Page,
  matcher: (url: URL) => boolean,
  status: number,
  body: unknown,
): Promise<void> {
  await page.route(
    (u) => matcher(u),
    (route) => {
      if (route.request().method() === 'OPTIONS') {
        return route.fulfill({ status: 204, headers: CORS_HEADERS })
      }
      return route.fulfill({
        status,
        headers: { ...CORS_HEADERS, 'content-type': 'application/json' },
        body: JSON.stringify(body),
      })
    },
  )
}

async function mockInvalidCredentials(page: Page): Promise<void> {
  await fulfillJson(page, isSupabaseTokenUrl, 400, {
    code: 'invalid_credentials',
    error_code: 'invalid_credentials',
    msg: 'Invalid login credentials',
    message: 'Invalid login credentials',
  })
}

async function mockRateLimit(page: Page): Promise<void> {
  await fulfillJson(page, isSupabaseTokenUrl, 429, {
    code: 429,
    error_code: 'over_request_rate_limit',
    msg: 'rate limit exceeded',
    message: 'rate limit exceeded: too many requests',
  })
}

async function mockResetSuccess(page: Page): Promise<void> {
  await fulfillJson(page, isSupabaseRecoverUrl, 200, {})
}

// Pathfinder's production CSP (set in next.config.js) does not include
// `'unsafe-eval'`. WebKit's JavaScriptCore refuses to evaluate the eval()
// calls that React dev-mode makes for debugging features, which breaks
// interactive form handlers on the auth pages. `bypassCSP` in the
// Playwright context does not disable this in WebKit, so we strip the CSP
// response header from HTML document responses in the test runner. This
// affects only the Playwright-driven browser -- production users are
// unaffected because the app code is not modified.
// WebKit's handling of `Locator.fill()` on `<input type="email">` inside a
// React controlled input has been seen to no-op in practice (the value
// appears in the DOM momentarily and then React resets it from stale state).
// `pressSequentially` types character-by-character so React's onChange
// fires for every keystroke and state stays in sync. The small delay is
// needed for React's batched updates under WebKit's scheduler.
async function fillEmail(page: Page, email: string): Promise<void> {
  const field = page.getByLabel('Email address')
  await field.click()
  await field.fill('')
  await field.pressSequentially(email, { delay: 15 })
  await expect(field).toHaveValue(email)
}

async function fillPassword(page: Page, password: string): Promise<void> {
  const field = page.getByLabel('Password', { exact: true })
  await field.click()
  await field.fill('')
  await field.pressSequentially(password, { delay: 15 })
  await expect(field).toHaveValue(password)
}

async function stripCspFromDocuments(page: Page): Promise<void> {
  await page.route('**/*', async (route) => {
    if (route.request().resourceType() !== 'document') {
      return route.fallback()
    }
    const response = await route.fetch()
    const headers = { ...response.headers() }
    delete headers['content-security-policy']
    delete headers['content-security-policy-report-only']
    return route.fulfill({
      response,
      headers,
    })
  })
}

test.describe('Sign-up page structure', () => {
  test('renders heading, email, passwords, terms, submit, sign-in link', async ({ page }) => {
    await page.goto(ROUTES.signUp)

    await expect(
      page.getByRole('heading', { name: 'Create your account' }),
    ).toBeVisible()
    await expect(page.getByLabel('Email address')).toBeVisible()
    await expect(page.getByLabel('Password', { exact: true })).toBeVisible()
    await expect(page.getByLabel('Confirm password')).toBeVisible()
    // Terms checkbox lives with a label that wraps terms/privacy links.
    await expect(page.getByRole('checkbox')).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Create account', exact: true }),
    ).toBeVisible()
    // The app nav also has a "Sign in" link, so scope to the auth card.
    await expect(
      page.locator('main').getByRole('link', { name: 'Sign in', exact: true }),
    ).toBeVisible()
  })
})

test.describe('Sign-in page structure', () => {
  test('renders heading, email, password, submit, sign-up and forgot-password links', async ({
    page,
  }) => {
    await page.goto(ROUTES.signIn)

    await expect(
      page.getByRole('heading', { name: 'Welcome back' }),
    ).toBeVisible()
    await expect(page.getByLabel('Email address')).toBeVisible()
    await expect(page.getByLabel('Password', { exact: true })).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Sign in', exact: true }),
    ).toBeVisible()
    await expect(
      page.getByRole('link', { name: 'Sign up free', exact: true }),
    ).toBeVisible()
    await expect(
      page.getByRole('link', { name: 'Forgot password?' }),
    ).toBeVisible()
  })
})

test.describe('Sign-in with wrong credentials', () => {
  test('shows invalid-credential error and preserves form state', async ({ page }) => {
    await stripCspFromDocuments(page)
    await mockInvalidCredentials(page)
    await page.goto(ROUTES.signIn)

    const email = generateTestEmail()
    await fillEmail(page, email)
    await fillPassword(page, TEST_PASSWORD)
    await page.getByRole('button', { name: 'Sign in', exact: true }).click()

    // Filter away Next.js's empty `__next-route-announcer__` role=alert div
    // by matching on the error text directly.
    await expect(
      page.getByText('Invalid email or password.').first(),
    ).toBeVisible({ timeout: 15_000 })
    await expect(page).toHaveURL(new RegExp(`${ROUTES.signIn}(\\?.*)?$`))
    await expect(page.getByLabel('Email address')).toHaveValue(email)
  })
})

test.describe('Forgot-password confirmation screen', () => {
  test('renders the "check your email" state after submission', async ({ page }) => {
    await stripCspFromDocuments(page)
    await mockResetSuccess(page)
    await page.goto(ROUTES.forgotPassword)

    const email = generateTestEmail()
    await fillEmail(page, email)
    await page.getByRole('button', { name: 'Reset password' }).click()

    await expect(
      page.getByRole('heading', { name: 'Check your email' }),
    ).toBeVisible()
    // Intro line of the confirmation panel is deterministic; the <strong>
    // with the email interpolates inside the same <p>. Anchoring on the
    // panel copy is reliable across chromium and webkit.
    await expect(
      page.getByText('sent a password reset link to', { exact: false }),
    ).toBeVisible()
    await expect(
      page.getByRole('link', { name: /Back to sign in/i }),
    ).toBeVisible()
  })
})

test.describe('Rate-limit handling on sign-in', () => {
  test('renders the friendly rate-limit message and preserves form state', async ({
    page,
  }) => {
    await stripCspFromDocuments(page)
    await mockRateLimit(page)
    await page.goto(ROUTES.signIn)

    const email = generateTestEmail()
    await fillEmail(page, email)
    await fillPassword(page, TEST_PASSWORD)
    await page.getByRole('button', { name: 'Sign in', exact: true }).click()

    // RATE_LIMIT_MESSAGE in hooks/use-auth.tsx opens with this phrase.
    await expect(
      page
        .getByText("You've tried a few times in a short window", {
          exact: false,
        })
        .first(),
    ).toBeVisible({ timeout: 15_000 })
    await expect(page).toHaveURL(new RegExp(`${ROUTES.signIn}(\\?.*)?$`))
    await expect(page.getByLabel('Email address')).toHaveValue(email)
  })
})
