#!/usr/bin/env node
// Direct pg-client bulk insert. Connects with SUPABASE_DB_PASSWORD from
// .env.local via the Supabase session pooler. Issues batched multi-row
// INSERTs inside a transaction for speed and atomicity.

import { config as loadEnv } from 'dotenv'
loadEnv({ path: '.env.local' })

import pg from 'pg'
import { readFileSync } from 'node:fs'
import { parse as parseCsv } from 'csv-parse/sync'
import path from 'node:path'

const { Client } = pg

const CSV_PATH = path.resolve('data/postcodes/simd_postcodes_refresh.csv')
const BATCH_SIZE = 2000
const PROJECT_REF = 'qexfszbhmdducszupyzi'
const DB_PASSWORD = process.env.SUPABASE_DB_PASSWORD
if (!DB_PASSWORD) {
  console.error('SUPABASE_DB_PASSWORD missing in .env.local')
  process.exit(1)
}

// Supabase pooled connection string (works over IPv4; port 6543 is the
// transaction-mode pooler and supports prepared statements per transaction).
const POOLER_HOST = process.env.SUPABASE_POOLER_HOST || 'aws-1-eu-west-2.pooler.supabase.com'
const connectionString = `postgres://postgres.${PROJECT_REF}:${encodeURIComponent(DB_PASSWORD)}@${POOLER_HOST}:6543/postgres`

function loadRows() {
  console.log(`[load] reading ${CSV_PATH}`)
  const csv = readFileSync(CSV_PATH, 'utf8')
  const rows = parseCsv(csv, { columns: true, skip_empty_lines: true })
  const importedAt = new Date().toISOString()
  return { rows, importedAt }
}

async function main() {
  const { rows, importedAt } = loadRows()
  console.log(`[load] ${rows.length} rows`)

  const client = new Client({ connectionString })
  await client.connect()
  console.log('[pg] connected')

  try {
    await client.query('BEGIN')
    // Already truncated via MCP. Guard against a non-empty state by checking.
    const { rows: countRows } = await client.query('SELECT COUNT(*)::int AS n FROM simd_postcodes')
    const existing = countRows[0].n
    console.log(`[pg] existing rows: ${existing}`)
    if (existing !== 0) {
      console.log('[pg] table not empty -- truncating')
      await client.query('TRUNCATE simd_postcodes')
    }

    // Build and execute INSERTs in batches.
    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE)
      const placeholders = []
      const values = []
      batch.forEach((r, idx) => {
        const base = idx * 7
        placeholders.push(`($${base + 1},$${base + 2},$${base + 3},$${base + 4},$${base + 5},$${base + 6},$${base + 7})`)
        values.push(
          r.postcode,
          r.data_zone_2011,
          Number(r.simd_rank),
          Number(r.simd_decile),
          Number(r.simd_quintile),
          r.source,
          importedAt,
        )
      })
      const sql = `INSERT INTO simd_postcodes (postcode, datazone, simd_rank, simd_decile, simd_quintile, source, imported_at) VALUES ${placeholders.join(',')}`
      await client.query(sql, values)
      const done = Math.min(i + BATCH_SIZE, rows.length)
      process.stdout.write(`\r[pg] inserted ${done}/${rows.length}`)
    }
    process.stdout.write('\n')

    await client.query('COMMIT')
    console.log('[pg] committed')

    const { rows: verifyRows } = await client.query('SELECT COUNT(*)::int AS n FROM simd_postcodes')
    console.log(`[verify] final row count: ${verifyRows[0].n}`)
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {})
    throw err
  } finally {
    await client.end()
  }
}

main().catch(err => {
  console.error('[apply] failed:', err)
  process.exit(1)
})
