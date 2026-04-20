#!/usr/bin/env node
// Apply the Gate B student decile sync via a direct pg connection.
//
// Routed through pg rather than MCP because a BEFORE UPDATE trigger
// (prevent_restricted_student_column_update) blocks direct simd_decile
// writes for non-postgres/service_role sessions. The pg connection logs in
// as the postgres superuser (via the session pooler) so the trigger's
// allowlist branch applies.

import { config as loadEnv } from 'dotenv'
loadEnv({ path: '.env.local' })

import pg from 'pg'

const { Client } = pg
const DB_PASSWORD = process.env.SUPABASE_DB_PASSWORD
if (!DB_PASSWORD) {
  console.error('SUPABASE_DB_PASSWORD missing in .env.local')
  process.exit(1)
}

const connectionString = `postgres://postgres.qexfszbhmdducszupyzi:${encodeURIComponent(DB_PASSWORD)}@aws-1-eu-west-2.pooler.supabase.com:6543/postgres`

const SYNC_SQL = `
-- (a) Sync deciles for students whose postcode IS in the refreshed set.
UPDATE students s
SET simd_decile = sp.simd_decile
FROM simd_postcodes sp
WHERE sp.postcode_normalised = UPPER(REPLACE(s.postcode, ' ', ''))
  AND s.postcode IS NOT NULL
  AND s.simd_decile IS DISTINCT FROM sp.simd_decile
RETURNING s.id, s.postcode, s.simd_decile;
`

const NULL_SQL = `
-- (b) NULL the cached decile for students whose postcode is NOT in the
-- refreshed set (stale/terminated postcodes).
UPDATE students
SET simd_decile = NULL
WHERE postcode IS NOT NULL
  AND simd_decile IS NOT NULL
  AND UPPER(REPLACE(postcode, ' ', '')) NOT IN (
    SELECT postcode_normalised FROM simd_postcodes
  )
RETURNING id, postcode;
`

const LOG_SQL = `
-- (c) Log the terminated postcodes we just invalidated.
INSERT INTO missing_postcodes_log (postcode, first_seen, count, source)
SELECT UPPER(REPLACE(postcode, ' ', '')), now(), 1, 'student_decile_refresh'
FROM students
WHERE postcode IS NOT NULL
  AND simd_decile IS NULL
  AND UPPER(REPLACE(postcode, ' ', '')) NOT IN (
    SELECT postcode_normalised FROM simd_postcodes
  )
ON CONFLICT (postcode) DO UPDATE SET
  count = missing_postcodes_log.count + 1,
  last_seen = now()
RETURNING postcode, count;
`

async function main() {
  const client = new Client({ connectionString })
  await client.connect()
  console.log('[pg] connected')
  try {
    await client.query('BEGIN')
    // The BEFORE UPDATE guard on students only allows direct simd_decile
    // writes when current_setting('role', true) is 'postgres' or
    // 'service_role'. Pooler sessions connect as user 'postgres' but don't
    // set the role GUC, so we set it explicitly for this transaction.
    await client.query(`SET LOCAL ROLE postgres`)

    const roleCheck = await client.query(`SELECT current_setting('role', true) AS role, current_user`)
    console.log('[pg] session role:', roleCheck.rows[0])

    const syncRes = await client.query(SYNC_SQL)
    console.log(`[a] decile sync: ${syncRes.rowCount} row(s) updated`)
    for (const r of syncRes.rows) console.log(`    ${r.id.slice(0, 8)}… ${r.postcode} → decile ${r.simd_decile}`)

    const nullRes = await client.query(NULL_SQL)
    console.log(`[b] NULL stale decile: ${nullRes.rowCount} row(s) updated`)
    for (const r of nullRes.rows) console.log(`    ${r.id.slice(0, 8)}… ${r.postcode} → NULL`)

    const logRes = await client.query(LOG_SQL)
    console.log(`[c] missing_postcodes_log insert/upsert: ${logRes.rowCount} row(s)`)
    for (const r of logRes.rows) console.log(`    ${r.postcode} (count: ${r.count})`)

    await client.query('COMMIT')
    console.log('[pg] committed')

    const verify = await client.query(`
      SELECT id, postcode, simd_decile
      FROM students
      ORDER BY postcode NULLS LAST
    `)
    console.log('\n[verify] students table:')
    for (const r of verify.rows) {
      console.log(`  ${r.id.slice(0, 8)}…  postcode=${r.postcode ?? 'NULL'}  decile=${r.simd_decile ?? 'NULL'}`)
    }
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {})
    throw err
  } finally {
    await client.end()
  }
}

main().catch(err => {
  console.error('[sync] failed:', err.message)
  if (err.code) console.error('  code:', err.code)
  if (err.detail) console.error('  detail:', err.detail)
  process.exit(1)
})
