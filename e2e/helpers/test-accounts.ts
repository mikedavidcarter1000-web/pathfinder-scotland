import { randomUUID } from 'node:crypto'
import { config as loadEnv } from 'dotenv'
import { resolve } from 'node:path'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Load .env.local so service-role access works when Playwright spawns the
// helpers directly (outside the Next.js dev-server env). Safe to call
// repeatedly; dotenv no-ops if variables are already set.
loadEnv({ path: resolve(process.cwd(), '.env.local') })

// Password that satisfies the sign-up validator in app/auth/sign-up/page.tsx:
// >= 8 chars, 1 upper, 1 lower, 1 digit. No special char required.
export const TEST_PASSWORD = 'TestPassword123!'

// RFC 2606 reserves the `.invalid` TLD: it is non-routable and cannot
// accidentally deliver email to a real inbox. Every e2e test account must
// match this exact pattern. The pattern is also the hard-guard gate for
// destructive helpers below.
export const TEST_EMAIL_PATTERN = /^e2e-[0-9a-f-]+@pathfinder-test\.invalid$/

export function generateTestEmail(): string {
  return `e2e-${randomUUID()}@pathfinder-test.invalid`
}

// Hard guard: any destructive helper must refuse to touch an email that
// doesn't match TEST_EMAIL_PATTERN. Throws synchronously so bugs surface
// loudly rather than quietly deleting production data.
function assertTestEmail(email: string): void {
  if (!TEST_EMAIL_PATTERN.test(email)) {
    throw new Error(
      `Refused: "${email}" is not a test email pattern. ` +
        `Test emails must match ${TEST_EMAIL_PATTERN}.`,
    )
  }
}

function requireServiceRoleClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) {
    throw new Error(
      'Missing SUPABASE envs. Need NEXT_PUBLIC_SUPABASE_URL and ' +
        'SUPABASE_SERVICE_ROLE_KEY in .env.local (or CI secrets).',
    )
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

// Pre-create a confirmed auth user via the admin API. Skips the email
// confirmation step so tests can sign in immediately -- regardless of
// whether "Confirm email" is enabled on the Supabase project.
export async function createTestAccount(
  email: string,
  password: string = TEST_PASSWORD,
): Promise<{ userId: string }> {
  assertTestEmail(email)
  const client = requireServiceRoleClient()
  const { data, error } = await client.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })
  if (error) throw error
  if (!data.user) throw new Error('createUser returned no user row')
  return { userId: data.user.id }
}

// Delete every trace of a single test account from production. Each step
// is wrapped in its own try/catch so one failure does not block the
// others; the function is idempotent (no error if no row exists) and has
// a hard ceiling of one user per call.
export async function cleanupTestAccount(email: string): Promise<void> {
  assertTestEmail(email)
  const client = requireServiceRoleClient()

  const { data: users, error: lookupError } = await client
    .auth
    .admin
    .listUsers({ page: 1, perPage: 1000 })
  if (lookupError) throw lookupError

  const matches = (users?.users ?? []).filter((u) => u.email === email)
  if (matches.length === 0) {
    // Also purge any pilot_interest row that carries this email, because
    // the pilot forms don't create an auth user at all.
    await purgePilotInterest(client, email)
    return
  }
  if (matches.length > 1) {
    throw new Error(
      `Safety ceiling: lookup returned ${matches.length} users for ${email}`,
    )
  }

  const userId = matches[0].id

  // Order: child rows first, then auth.user. Each in its own try/catch.
  const tables = [
    'saved_comparisons',
    'saved_courses',
    'saved_offers',
    'student_grades',
    'student_checklist_progress',
    'students',
    'parents',
  ]
  for (const table of tables) {
    try {
      // Some tables key on user_id, students.id == auth.user.id.
      const keyCol = table === 'students' ? 'id' : 'user_id'
      await client.from(table).delete().eq(keyCol, userId)
    } catch (err) {
      if (process.env.DEBUG_E2E) {
        console.warn(`[e2e] cleanup ${table} failed for ${email}:`, err)
      }
    }
  }

  try {
    await purgePilotInterest(client, email)
  } catch (err) {
    if (process.env.DEBUG_E2E) {
      console.warn('[e2e] pilot_interest purge failed:', err)
    }
  }

  try {
    const { error: delErr } = await client.auth.admin.deleteUser(userId)
    if (delErr) throw delErr
  } catch (err) {
    if (process.env.DEBUG_E2E) {
      console.warn(`[e2e] deleteUser failed for ${email}:`, err)
    }
  }
}

async function purgePilotInterest(
  client: SupabaseClient,
  email: string,
): Promise<void> {
  assertTestEmail(email)
  await client.from('pilot_interest').delete().eq('email', email)
}
