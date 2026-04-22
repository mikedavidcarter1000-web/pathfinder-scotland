// Imports graduate outcomes (Discover Uni / HESA) and university rankings
// (CUG / Guardian / Times) from data/course-outcomes.json and
// data/university-rankings-2026.json into the live Supabase database.
//
// Usage: node scripts/import-outcomes-data.js
//
// Requires NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in
// .env.local. Uses the service role to bypass RLS on universities and
// courses.
//
// Merge semantics (both tables):
//   - If the incoming value is non-null, it overwrites the DB row value
//     regardless of whether the DB already has a non-null value. This is
//     intentional: annual refreshes should replace stale figures.
//   - If the incoming value is null, the existing DB value is preserved.
//     A null in the JSON means "don't touch this column", not "clear it".
//
// Both JSON files carry `needs_verification: true` on every row until an
// admin has spot-checked against the source publication. The import
// writes that flag through to `outcomes_needs_verification` /
// `rankings_needs_verification` so the /admin/data-quality page can
// count it.
//
// Logs per-row action (matched-and-updated / no-match / skipped-all-null)
// and a summary at the end.

const fs = require('node:fs')
const path = require('node:path')
const { createClient } = require('@supabase/supabase-js')

const UNI_RANKINGS_FILE = path.join(__dirname, '..', 'data', 'university-rankings-2026.json')
const COURSE_OUTCOMES_FILE = path.join(__dirname, '..', 'data', 'course-outcomes.json')

function readEnv(envPath) {
  const out = {}
  if (!fs.existsSync(envPath)) return out
  const raw = fs.readFileSync(envPath, 'utf8')
  for (const line of raw.split('\n')) {
    if (!line || line.startsWith('#') || !line.includes('=')) continue
    const i = line.indexOf('=')
    out[line.slice(0, i).trim()] = line.slice(i + 1).trim()
  }
  return out
}

// Columns to merge from each JSON row onto the universities table.
const UNI_COLUMNS = [
  'ranking_cug',
  'ranking_cug_scotland',
  'ranking_guardian',
  'ranking_times',
  'graduate_employment_rate',
  'rankings_year',
]

// Columns to merge from each JSON row onto the courses table.
const COURSE_COLUMNS = [
  'employment_rate_15m',
  'highly_skilled_employment_pct',
  'salary_median_1yr',
  'salary_median_3yr',
  'salary_median_5yr',
  'student_satisfaction_pct',
  'continuation_rate_pct',
  'subject_ranking_cug',
  'outcomes_data_year',
]

function buildUpdate(row, columns) {
  const update = {}
  for (const col of columns) {
    if (row[col] !== null && row[col] !== undefined) {
      update[col] = row[col]
    }
  }
  return update
}

async function importUniversityRankings(supabase) {
  const rows = JSON.parse(fs.readFileSync(UNI_RANKINGS_FILE, 'utf8'))
  const stats = { matched: 0, unmatched: 0, skipped: 0 }
  for (const row of rows) {
    const update = buildUpdate(row, UNI_COLUMNS)
    if (Object.keys(update).length === 0) {
      // Still update the needs_verification flag even if all ranks null.
      update.rankings_needs_verification = row.needs_verification !== false
    } else {
      update.rankings_needs_verification = row.needs_verification !== false
    }

    const { data, error } = await supabase
      .from('universities')
      .update(update)
      .eq('slug', row.slug)
      .select('id, name')

    if (error) {
      console.error(`  ERROR updating ${row.slug}: ${error.message}`)
      stats.unmatched++
      continue
    }
    if (!data || data.length === 0) {
      console.warn(`  UNMATCHED: no university with slug "${row.slug}"`)
      stats.unmatched++
      continue
    }
    const cols = Object.keys(update).filter((k) => k !== 'rankings_needs_verification')
    if (cols.length === 0) {
      console.log(`  SKIPPED (all null): ${row.slug}`)
      stats.skipped++
    } else {
      console.log(`  UPDATED: ${row.slug} (${cols.join(', ')})`)
      stats.matched++
    }
  }
  return stats
}

async function importCourseOutcomes(supabase) {
  const rows = JSON.parse(fs.readFileSync(COURSE_OUTCOMES_FILE, 'utf8'))

  // Preload universities once so we can resolve slug -> id without a round-trip per row.
  const { data: unis, error: uniErr } = await supabase
    .from('universities')
    .select('id, slug, name')
  if (uniErr) throw new Error(`Failed to load universities: ${uniErr.message}`)
  const uniBySlug = new Map(unis.map((u) => [u.slug, u]))

  const stats = { matched: 0, unmatched: 0, skipped: 0 }

  for (const row of rows) {
    const uni = uniBySlug.get(row.university_slug)
    if (!uni) {
      console.warn(`  UNMATCHED university slug: "${row.university_slug}" (course: ${row.course_name})`)
      stats.unmatched++
      continue
    }

    const update = buildUpdate(row, COURSE_COLUMNS)
    update.outcomes_needs_verification = row.needs_verification !== false

    // Match first by (ucas_code, university_id); fall back to (name, university_id).
    // Using ilike on name gives light forgiveness for casing drift.
    let query = supabase
      .from('courses')
      .update(update)
      .eq('university_id', uni.id)

    if (row.ucas_code) {
      query = query.eq('ucas_code', row.ucas_code)
    } else if (row.course_name) {
      query = query.ilike('name', row.course_name)
    } else {
      console.warn(`  SKIPPED: row has no ucas_code or course_name`)
      stats.skipped++
      continue
    }

    const { data, error } = await query.select('id, name')

    if (error) {
      console.error(`  ERROR updating ${row.course_name} at ${row.university_slug}: ${error.message}`)
      stats.unmatched++
      continue
    }
    if (!data || data.length === 0) {
      console.warn(
        `  UNMATCHED course: "${row.course_name}" (UCAS ${row.ucas_code ?? 'n/a'}) at ${row.university_slug}`
      )
      stats.unmatched++
      continue
    }
    const dataCols = Object.keys(update).filter((k) => k !== 'outcomes_needs_verification')
    if (dataCols.length === 0) {
      console.log(`  VERIFY-FLAG ONLY: ${row.course_name} at ${row.university_slug}`)
      stats.skipped++
    } else {
      console.log(`  UPDATED: ${data.length} row(s) for "${row.course_name}" at ${row.university_slug}`)
      stats.matched++
    }
  }
  return stats
}

async function main() {
  const env = readEnv(path.join(__dirname, '..', '.env.local'))
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
    process.exit(1)
  }
  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  console.log('== University rankings ==')
  const uniStats = await importUniversityRankings(supabase)
  console.log(
    `\nUniversities: ${uniStats.matched} updated, ${uniStats.unmatched} unmatched, ${uniStats.skipped} skipped (all null)\n`
  )

  console.log('== Course outcomes ==')
  const courseStats = await importCourseOutcomes(supabase)
  console.log(
    `\nCourses: ${courseStats.matched} updated, ${courseStats.unmatched} unmatched, ${courseStats.skipped} skipped (verify-flag only)\n`
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
