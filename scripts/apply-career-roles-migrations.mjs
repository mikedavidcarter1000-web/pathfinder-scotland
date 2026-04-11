// Applies the 4 career_roles migrations to the remote Supabase DB.
//
// PostgREST (what the Supabase service_role key authenticates against)
// only exposes tables and RPC functions — it cannot execute DDL. So
// this script uses a direct pg connection with the SUPABASE_DB_PASSWORD
// from .env.local for DDL, and falls back to supabase-js REST with the
// service role key for verification queries where that's sufficient.
//
// Usage: node scripts/apply-career-roles-migrations.mjs

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import pg from 'pg'

const { Client } = pg
const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(__dirname, '..')

// Load .env.local
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
  '20260412000001_create_career_roles_schema.sql',
  '20260412000002_seed_career_roles.sql',
  '20260412000003_seed_career_role_subjects.sql',
  '20260412000004_seed_career_roles_extra_sectors.sql',
]

// Try connection candidates in order until one succeeds.
const CONNECTION_CANDIDATES = [
  // Direct connection (IPv6 only on newer projects)
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
  // Session pooler (IPv4, port 5432) — good for DDL + long transactions
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
      label: 'career_sectors',
      sql: 'SELECT COUNT(*)::int AS n FROM career_sectors',
      min: 18,
    },
    {
      label: 'career_roles',
      sql: 'SELECT COUNT(*)::int AS n FROM career_roles',
      min: 180,
    },
    {
      label: 'career_role_subjects',
      sql: 'SELECT COUNT(*)::int AS n FROM career_role_subjects',
      min: 900,
    },
    {
      label: 'sectors with < 8 roles',
      sql: `SELECT COUNT(*)::int AS n FROM (
              SELECT cs.id
              FROM career_sectors cs
              LEFT JOIN career_roles r ON r.career_sector_id = cs.id
              GROUP BY cs.id
              HAVING COUNT(r.id) < 8
            ) t`,
      max: 0,
    },
    {
      label: 'roles with < 3 linked subjects',
      sql: `SELECT COUNT(*)::int AS n FROM (
              SELECT r.id
              FROM career_roles r
              LEFT JOIN career_role_subjects crs ON crs.career_role_id = r.id
              GROUP BY r.id
              HAVING COUNT(crs.subject_id) < 3
            ) t`,
      max: 0,
    },
    {
      label: 'new AI roles flagged',
      sql: 'SELECT COUNT(*)::int AS n FROM career_roles WHERE is_new_ai_role',
      min: 50,
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

  // Per-sector counts
  const bySector = await client.query(`
    SELECT cs.name, COUNT(r.id)::int AS n
    FROM career_sectors cs
    LEFT JOIN career_roles r ON r.career_sector_id = cs.id
    GROUP BY cs.name
    ORDER BY n DESC
  `)
  console.log('\n[verify] roles per sector:')
  for (const row of bySector.rows) {
    console.log(`  ${row.name}: ${row.n}`)
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
