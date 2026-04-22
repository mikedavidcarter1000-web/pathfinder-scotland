#!/usr/bin/env tsx
/**
 * Weekly sweep: catch orphaned e2e test accounts whose afterEach hook
 * never ran (crash, Ctrl-C, CI runner kill). Lists every auth.user whose
 * email matches the test pattern and deletes it + related rows via
 * cleanupTestAccount. Run manually or via cron/calendar reminder.
 *
 * Safety: the cleanup helper itself enforces the .invalid pattern, so
 * this script cannot delete production users even if the listUsers
 * response is tampered with.
 */
import { config as loadEnv } from 'dotenv'
import { resolve } from 'node:path'
import { createClient } from '@supabase/supabase-js'
import {
  cleanupTestAccount,
  TEST_EMAIL_PATTERN,
} from '../e2e/helpers/test-accounts'

loadEnv({ path: resolve(process.cwd(), '.env.local') })

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    console.error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY',
    )
    process.exit(1)
  }

  const client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  // Page through all users -- Supabase Auth admin caps at 1000 per page.
  const orphans: string[] = []
  let page = 1
  const perPage = 1000
  // Reasonable upper bound -- production should never have more than a
  // few thousand users during pilot, but guard against a runaway loop.
  const MAX_PAGES = 100
  while (page <= MAX_PAGES) {
    const { data, error } = await client.auth.admin.listUsers({ page, perPage })
    if (error) throw error
    const users = data?.users ?? []
    for (const u of users) {
      if (u.email && TEST_EMAIL_PATTERN.test(u.email)) {
        orphans.push(u.email)
      }
    }
    if (users.length < perPage) break
    page += 1
  }

  console.log(`[sweep] Found ${orphans.length} orphaned test account(s).`)
  for (const email of orphans) {
    try {
      await cleanupTestAccount(email)
      console.log(`[sweep] Cleaned ${email}`)
    } catch (err) {
      console.warn(`[sweep] Failed to clean ${email}:`, err)
    }
  }

  // Also sweep pilot_interest rows whose email matches the pattern but
  // whose auth user was never created.
  const { data: pilotRows, error: pilotErr } = await client
    .from('pilot_interest')
    .select('email')
    .like('email', 'e2e-%@pathfinder-test.invalid')
  if (pilotErr) throw pilotErr
  const pilotEmails = Array.from(
    new Set((pilotRows ?? []).map((r: { email: string }) => r.email)),
  )
  for (const email of pilotEmails) {
    if (!TEST_EMAIL_PATTERN.test(email)) continue
    try {
      await client.from('pilot_interest').delete().eq('email', email)
      console.log(`[sweep] Cleaned pilot_interest row ${email}`)
    } catch (err) {
      console.warn(`[sweep] Failed to purge pilot_interest ${email}:`, err)
    }
  }

  console.log(
    `[sweep] Done. Auth users cleaned: ${orphans.length}. Pilot rows cleaned: ${pilotEmails.length}.`,
  )
}

main().catch((err) => {
  console.error('[sweep] fatal:', err)
  process.exit(1)
})
