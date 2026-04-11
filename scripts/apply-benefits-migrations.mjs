// Applies the 2 student_benefits migrations to the remote Supabase DB.
//
// Usage: node scripts/apply-benefits-migrations.mjs

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import pg from 'pg'

const { Client } = pg
const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(__dirname, '..')

const env = Object.fromEntries(
  readFileSync(join(repoRoot, '.env.local'), 'utf8')
    .split('\n')
    .filter((l) => l && !l.startsWith('#') && l.includes('='))
    .map((l) => {
      const i = l.indexOf('=')
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()]
    })
)

const PROJECT_REF = 'qexfszbhmdducszupyzi'
const DB_PASSWORD = env.SUPABASE_DB_PASSWORD
if (!DB_PASSWORD) {
  console.error('Missing SUPABASE_DB_PASSWORD in .env.local')
  process.exit(1)
}

const MIGRATIONS = [
  '20260412000007_create_student_benefits.sql',
  '20260412000008_seed_student_benefits.sql',
]

const CONNECTION_CANDIDATES = [
  {
    label: 'direct (db.*.supabase.co:5432)',
    config: {
      host: `db.${PROJECT_REF}.supabase.co`,
      port: 5432,
      user: 'postgres',
      password: DB_PASSWORD,
      database: 'postgres',
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 10000,
    },
  },
  ...['eu-west-2', 'eu-west-1', 'eu-central-1', 'us-east-1', 'us-east-2', 'us-west-1']
    .map((region) => ({
      label: `session pooler ${region} (5432)`,
      config: {
        host: `aws-0-${region}.pooler.supabase.com`,
        port: 5432,
        user: `postgres.${PROJECT_REF}`,
        password: DB_PASSWORD,
        database: 'postgres',
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 10000,
      },
    })),
]

async function connectWithFallback() {
  for (const candidate of CONNECTION_CANDIDATES) {
    const client = new Client(candidate.config)
    try {
      await client.connect()
      console.log(`[connect] OK via ${candidate.label}`)
      return client
    } catch (err) {
      const msg = err && err.message ? err.message : String(err)
      console.log(`[connect] FAIL via ${candidate.label}: ${msg}`)
      try { await client.end() } catch {}
    }
  }
  throw new Error('No working connection candidate found')
}

async function runMigration(client, filename) {
  const path = join(repoRoot, 'supabase', 'migrations', filename)
  const sql = readFileSync(path, 'utf8')
  console.log(`\n[apply] ${filename} (${sql.length.toLocaleString()} bytes)`)
  const start = Date.now()
  try {
    const res = await client.query(sql)
    const ms = Date.now() - start
    const notices = Array.isArray(res) ? res.length : 1
    console.log(`[apply] OK in ${ms} ms (${notices} statement block${notices === 1 ? '' : 's'})`)
  } catch (err) {
    console.error(`[apply] FAIL: ${err.message}`)
    if (err.position) console.error(`  position: ${err.position}`)
    if (err.detail) console.error(`  detail:   ${err.detail}`)
    if (err.hint) console.error(`  hint:     ${err.hint}`)
    throw err
  }
}

async function verify(client) {
  console.log('\n[verify] running counts')
  const checks = [
    {
      label: 'benefit_categories',
      sql: 'SELECT COUNT(*)::int AS n FROM benefit_categories',
      min: 11,
      max: 11,
    },
    {
      label: 'student_benefits',
      sql: 'SELECT COUNT(*)::int AS n FROM student_benefits',
      min: 80,
    },
    {
      label: 'government-scheme benefits',
      sql: "SELECT COUNT(*)::int AS n FROM student_benefits WHERE is_government_scheme = true",
      min: 10,
    },
    {
      label: 'benefits with affiliate_network set',
      sql: 'SELECT COUNT(*)::int AS n FROM student_benefits WHERE affiliate_network IS NOT NULL',
      min: 15,
    },
  ]
  let ok = true
  for (const c of checks) {
    const { rows } = await client.query(c.sql)
    const n = rows[0].n
    const min = c.min ?? 0
    const max = c.max ?? Number.MAX_SAFE_INTEGER
    const pass = n >= min && n <= max
    const tag = pass ? 'OK' : 'FAIL'
    const bounds =
      c.min != null && c.max == null
        ? `>= ${c.min}`
        : c.max != null && c.min == null
          ? `<= ${c.max}`
          : `in [${c.min ?? 0}, ${c.max ?? '∞'}]`
    console.log(`  [${tag}] ${c.label}: ${n}  (${bounds})`)
    if (!pass) ok = false
  }

  const byCategory = await client.query(`
    SELECT category, COUNT(*)::int AS n
    FROM student_benefits
    GROUP BY category
    ORDER BY n DESC
  `)
  console.log('\n[verify] benefits per category:')
  for (const row of byCategory.rows) {
    console.log(`  ${row.category}: ${row.n}`)
  }
  return ok
}

async function main() {
  const client = await connectWithFallback()
  try {
    for (const filename of MIGRATIONS) {
      await runMigration(client, filename)
    }
    const ok = await verify(client)
    if (!ok) {
      console.error('\n[verify] FAILED — one or more checks did not meet expected bounds')
      process.exit(2)
    }
    console.log('\n[done] all migrations applied and verified')
  } finally {
    await client.end()
  }
}

main().catch((err) => {
  console.error('\n[fatal]', err.message || err)
  process.exit(1)
})
