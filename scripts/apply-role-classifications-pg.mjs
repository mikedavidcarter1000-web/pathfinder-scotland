#!/usr/bin/env node
// Stage 1.5f (part 2): apply hand-classified role fields to live DB.
// Reads role-classifications-import.json and the generated
// apply-classifications.sql, runs both UPDATEs in a single transaction
// via the Supabase session pooler, and verifies the post-state.
//
// Idempotent: re-running against the same JSON writes the same values.
// Matches the Stage 1.5b apply-simd-refresh-pg.mjs pattern -- pg client
// with SUPABASE_DB_PASSWORD from .env.local.

import { config as loadEnv } from 'dotenv'
loadEnv({ path: '.env.local' })

import pg from 'pg'
import { readFileSync } from 'node:fs'
import path from 'node:path'

const { Client } = pg

const SQL_PATH = path.resolve('data/role-classification-input/apply-classifications.sql')
const JSON_PATH = path.resolve('data/role-classification-input/role-classifications-import.json')
const PROJECT_REF = 'qexfszbhmdducszupyzi'
const DB_PASSWORD = process.env.SUPABASE_DB_PASSWORD
if (!DB_PASSWORD) {
  console.error('SUPABASE_DB_PASSWORD missing in .env.local')
  process.exit(1)
}

const POOLER_HOST =
  process.env.SUPABASE_POOLER_HOST || 'aws-1-eu-west-2.pooler.supabase.com'
const connectionString = `postgres://postgres.${PROJECT_REF}:${encodeURIComponent(DB_PASSWORD)}@${POOLER_HOST}:6543/postgres`

async function main() {
  const sql = readFileSync(SQL_PATH, 'utf8')
  const json = JSON.parse(readFileSync(JSON_PATH, 'utf8'))
  console.log(`[load] ${json.length} classifications, ${sql.length} bytes of SQL`)

  const client = new Client({ connectionString })
  await client.connect()
  console.log('[pg] connected')

  try {
    await client.query('BEGIN')

    const t0 = Date.now()
    await client.query(sql)
    console.log(`[apply] UPDATEs executed in ${Date.now() - t0}ms`)

    const { rows: r1 } = await client.query(
      `SELECT COUNT(*)::int AS n FROM role_profiles WHERE min_entry_qualification IS NULL`,
    )
    const { rows: r2 } = await client.query(
      `SELECT COUNT(*)::int AS n FROM role_profiles WHERE typical_starting_salary_gbp IS NULL`,
    )
    const { rows: r3 } = await client.query(
      `SELECT COUNT(*)::int AS n FROM career_roles WHERE maturity_tier IS NULL`,
    )
    const { rows: r4 } = await client.query(
      `SELECT maturity_tier, COUNT(*)::int AS n
       FROM career_roles
       GROUP BY maturity_tier
       ORDER BY maturity_tier`,
    )

    console.log(`[verify] role_profiles NULL min_entry_qualification: ${r1[0].n}`)
    console.log(`[verify] role_profiles NULL typical_starting_salary_gbp: ${r2[0].n}`)
    console.log(`[verify] career_roles NULL maturity_tier: ${r3[0].n}`)
    console.log('[verify] tier distribution:')
    for (const row of r4) console.log(`           ${row.maturity_tier.padEnd(14)} ${row.n}`)

    if (r1[0].n !== 0 || r2[0].n !== 0 || r3[0].n !== 0) {
      throw new Error('Post-apply NULL check failed -- rolling back')
    }

    await client.query('COMMIT')
    console.log('[pg] committed')
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {})
    console.error('[pg] rolled back due to error:', err.message)
    process.exitCode = 1
  } finally {
    await client.end()
  }
}

main()
