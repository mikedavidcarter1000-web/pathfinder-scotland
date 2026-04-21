#!/usr/bin/env node
// Stage 1.5f: read-only export of 269 career_roles + role_profiles
// context, sorted by sector then role name. Produces
// data/role-classification-input/roles-to-classify.md for manual
// classification in a separate Claude.ai chat. No DB writes.

import { config as loadEnv } from 'dotenv'
loadEnv({ path: '.env.local' })

import pg from 'pg'
import { writeFileSync, mkdirSync } from 'node:fs'
import path from 'node:path'

const { Client } = pg

const OUT_PATH = path.resolve('data/role-classification-input/roles-to-classify.md')
const PROJECT_REF = 'qexfszbhmdducszupyzi'
const DB_PASSWORD = process.env.SUPABASE_DB_PASSWORD
if (!DB_PASSWORD) {
  console.error('SUPABASE_DB_PASSWORD missing in .env.local')
  process.exit(1)
}

const POOLER_HOST = process.env.SUPABASE_POOLER_HOST || 'aws-1-eu-west-2.pooler.supabase.com'
const connectionString = `postgres://postgres.${PROJECT_REF}:${encodeURIComponent(DB_PASSWORD)}@${POOLER_HOST}:6543/postgres`

// Normalise to ASCII-safe straight quotes/hyphens. Preserves meaning
// while keeping the file pastable into any chat surface.
function asciiSafe(input) {
  if (input == null) return ''
  return String(input)
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
    .replace(/[\u2013\u2014\u2015]/g, '-')
    .replace(/\u2026/g, '...')
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function truncate(text, limit) {
  if (!text) return ''
  if (text.length <= limit) return text
  return text.slice(0, limit).trim()
}

async function main() {
  const client = new Client({ connectionString })
  await client.connect()
  console.log('[pg] connected')

  const { rows } = await client.query(`
    SELECT
      cr.id::text AS role_id,
      cr.title AS role_name,
      cs.name AS sector,
      rp.description AS raw_description,
      rp.day_in_the_life AS raw_day,
      (rp.id IS NULL) AS no_profile
    FROM career_roles cr
    JOIN career_sectors cs ON cr.career_sector_id = cs.id
    LEFT JOIN role_profiles rp ON rp.career_role_id = cr.id
    ORDER BY cs.name ASC, cr.title ASC
  `)

  await client.end()
  console.log(`[pg] fetched ${rows.length} roles`)

  const sectorCounts = new Map()
  for (const r of rows) {
    sectorCounts.set(r.sector, (sectorCounts.get(r.sector) || 0) + 1)
  }

  const lines = []
  lines.push('# Career roles -- classification input')
  lines.push('')
  lines.push(`Total roles: ${rows.length}`)
  lines.push('')
  lines.push('Per sector:')
  for (const [sector, count] of [...sectorCounts.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    lines.push(`- ${sector}: ${count}`)
  }
  lines.push('')
  lines.push('Note: this file is an input-only export for manual classification in a separate Claude.ai chat. Not for commit. Directory is gitignored via /data/* in .gitignore.')
  lines.push('')
  lines.push('Return a single JSON array with objects carrying role_id plus five classification fields per role: min_entry_qualification, typical_entry_qualification, typical_starting_salary_gbp, typical_experienced_salary_gbp, maturity_tier.')
  lines.push('')
  lines.push('---')
  lines.push('')

  for (const r of rows) {
    const description = r.no_profile
      ? '(no profile)'
      : (r.raw_description ? asciiSafe(truncate(r.raw_description, 400)) : '(no description)')
    const day = r.no_profile
      ? '(no profile)'
      : (r.raw_day ? asciiSafe(truncate(r.raw_day, 300)) : '(no day-in-the-life)')

    lines.push(`## ${asciiSafe(r.role_name)}`)
    lines.push('')
    lines.push(`- role_id: ${r.role_id}`)
    lines.push(`- sector: ${asciiSafe(r.sector)}`)
    lines.push(`- description: ${description}`)
    lines.push(`- day_in_the_life: ${day}`)
    lines.push('')
    lines.push('---')
    lines.push('')
  }

  mkdirSync(path.dirname(OUT_PATH), { recursive: true })
  writeFileSync(OUT_PATH, lines.join('\n'), 'utf8')
  console.log(`[write] ${OUT_PATH} (${rows.length} roles, ${sectorCounts.size} sectors)`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
