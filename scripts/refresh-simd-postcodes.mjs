#!/usr/bin/env node
// Refresh the simd_postcodes dataset from authoritative upstream sources.
//
// Why: the original seed used gov.scot's SIMD 2020v2 postcode lookup alone,
// which includes terminated postcodes (e.g. AB2 2AE, recoded to AB24 in 1996)
// and lacks post-2020 live postcodes. This script produces a clean set by
// intersecting NRS SPD (live Scottish postcodes, authoritative live/deleted
// status) with SIMD 2020v2 rankings (authoritative decile/quintile/rank).
//
// Output: data/postcodes/simd_postcodes_refresh.csv (postcode, data_zone_2011,
// simd_rank, simd_decile, simd_quintile, source) plus a stats JSON manifest.
//
// Downstream: the DB apply step (truncate simd_postcodes + batched insert) is
// separate -- driven via Supabase MCP so the user can gate the write.

import { readFileSync, writeFileSync, createReadStream, existsSync, mkdirSync } from 'node:fs'
import { parse as parseCsv } from 'csv-parse'
import xlsx from 'xlsx'
import path from 'node:path'

const DATA_DIR = path.resolve('data/postcodes')
const SPD_SMALL = path.join(DATA_DIR, 'spd_extracted/SmallUser.csv')
const SPD_LARGE = path.join(DATA_DIR, 'spd_extracted/LargeUser.csv')
const SIMD_XLSX = path.join(DATA_DIR, 'simd-2020v2-postcode-lookup-updated-2025.xlsx')
const OUT_CSV = path.join(DATA_DIR, 'simd_postcodes_refresh.csv')
const STATS_JSON = path.join(DATA_DIR, 'simd_postcodes_refresh_stats.json')

const SOURCE_TAG = 'NRS_SPD_2026_1+SIMD_2020v2_2025update'

// Internal key form: uppercase, no whitespace -- used for lookups/dedup only.
function stripPostcode(pc) {
  return String(pc ?? '').trim().toUpperCase().replace(/\s+/g, '')
}

// Canonical storage format: uppercase with a single space before the 3-char
// inward code. Mirrors lib/postcode-validation.ts normalisePostcode so the DB
// row matches what the UI displays.
function canonicalPostcode(pc) {
  const stripped = stripPostcode(pc)
  if (stripped.length < 5) return stripped
  return `${stripped.slice(0, -3)} ${stripped.slice(-3)}`
}

// UK postcode regex in canonical form (single space, uppercase).
const POSTCODE_CANONICAL_RE = /^[A-Z]{1,2}[0-9][A-Z0-9]? [0-9][A-Z]{2}$/

// Step 1: Load SIMD lookup -- build DZ → {rank, decile, quintile} map.
// Also build postcode → DZ map for cross-checking.
function loadSimdLookup() {
  console.log(`[simd] reading ${SIMD_XLSX}`)
  const wb = xlsx.readFile(SIMD_XLSX)
  const ws = wb.Sheets['All postcodes']
  if (!ws) throw new Error('SIMD xlsx missing "All postcodes" sheet')

  const rows = xlsx.utils.sheet_to_json(ws, { defval: '' })
  const dzMap = new Map() // dz → { rank, decile, quintile }
  const postcodeDzMap = new Map() // stripped postcode → dz

  for (const r of rows) {
    const pc = stripPostcode(r.Postcode)
    const dz = String(r.DZ || '').trim()
    if (!pc || !dz) continue
    const rank = Number(r.SIMD2020_Rank)
    const decile = Number(r.SIMD2020_Decile)
    const quintile = Number(r.SIMD2020_Quintile)
    if (!Number.isFinite(rank) || !Number.isFinite(decile) || !Number.isFinite(quintile)) continue
    if (!dzMap.has(dz)) dzMap.set(dz, { rank, decile, quintile })
    postcodeDzMap.set(pc, dz)
  }
  console.log(`[simd] ${rows.length} rows, ${dzMap.size} distinct data zones, ${postcodeDzMap.size} postcode→DZ entries`)
  return { dzMap, postcodeDzMap, totalRows: rows.length }
}

// Step 2: Stream SPD CSV (SmallUser + LargeUser), filter live Scottish
// postcodes with DZ2011. Large-user postcodes (universities, big employers,
// halls) are real addresses students may use -- include them.
async function loadSpdFile(file, typeLabel) {
  if (!existsSync(file)) {
    throw new Error(`SPD file missing: ${file}. Unzip spd_postcodeindex_26_1.zip into data/postcodes/spd_extracted/ first.`)
  }
  console.log(`[spd:${typeLabel}] reading ${file}`)
  const parser = createReadStream(file).pipe(
    parseCsv({ columns: true, bom: true, skip_empty_lines: true, trim: true }),
  )
  const liveRows = []
  const nonStandardSamples = []
  let total = 0, deleted = 0, missingDz = 0, nonStandard = 0
  for await (const r of parser) {
    total++
    if (r.DateOfDeletion && String(r.DateOfDeletion).trim() !== '') { deleted++; continue }
    const dz = String(r.DataZone2011Code || '').trim()
    if (!dz) { missingDz++; continue }
    const pc = stripPostcode(r.Postcode)
    if (!pc) continue
    const canonical = canonicalPostcode(pc)
    // Drop non-standard postcodes (4-char inward codes, e.g. "AB12 3GQA").
    // The app's lib/postcode-validation.ts regex rejects these too, so they
    // would never be queryable from the UI. Log the first few as evidence.
    if (!POSTCODE_CANONICAL_RE.test(canonical)) {
      nonStandard++
      if (nonStandardSamples.length < 5) nonStandardSamples.push(canonical)
      continue
    }
    liveRows.push({
      postcode: pc, // stripped form, used as dedup/join key
      postcode_canonical: canonical,
      dz2011: dz,
      council: String(r.CouncilArea2019Code || '').trim(),
      spd_type: typeLabel,
    })
  }
  console.log(`[spd:${typeLabel}] total: ${total}, deleted: ${deleted}, missing DZ2011: ${missingDz}, non-standard: ${nonStandard} (e.g. ${nonStandardSamples.join(', ')}), live: ${liveRows.length}`)
  return { liveRows, totals: { total, deleted, missingDz, nonStandard, nonStandardSamples, live: liveRows.length } }
}

async function loadSpdLive() {
  const small = await loadSpdFile(SPD_SMALL, 'small')
  const large = await loadSpdFile(SPD_LARGE, 'large')
  // Dedupe by postcode (small vs large should never overlap, but be defensive).
  const seen = new Set()
  const combined = []
  for (const r of [...small.liveRows, ...large.liveRows]) {
    if (seen.has(r.postcode)) continue
    seen.add(r.postcode)
    combined.push(r)
  }
  console.log(`[spd] combined live: ${combined.length} (small ${small.liveRows.length} + large ${large.liveRows.length}, dedup removed ${small.liveRows.length + large.liveRows.length - combined.length})`)
  return {
    liveRows: combined,
    totals: {
      small: small.totals,
      large: large.totals,
      combined_live: combined.length,
    },
  }
}

// Step 3: Join live SPD postcodes with SIMD by DZ2011. Fallback to postcode
// lookup in SIMD when DZ mapping is missing (shouldn't happen for valid DZs).
function join(liveRows, simd) {
  const out = []
  const unmapped = []
  const dzHits = new Map() // dz → count of matches
  for (const row of liveRows) {
    const hit = simd.dzMap.get(row.dz2011)
    if (!hit) {
      // Secondary: maybe the SPD postcode itself is in the SIMD file (rare
      // case of DZ code drift). Use its DZ instead.
      const altDz = simd.postcodeDzMap.get(row.postcode)
      if (altDz && simd.dzMap.has(altDz)) {
        const hit2 = simd.dzMap.get(altDz)
        out.push({ ...row, dz2011: altDz, ...hit2, via: 'postcode_fallback' })
        continue
      }
      unmapped.push(row)
      continue
    }
    out.push({ ...row, ...hit, via: 'dz' })
    dzHits.set(row.dz2011, (dzHits.get(row.dz2011) || 0) + 1)
  }
  console.log(`[join] matched: ${out.length}, unmapped: ${unmapped.length}`)
  return { out, unmapped }
}

// Step 4: Write refresh CSV + stats manifest.
function writeOutputs(joined, spdTotals, simdTotals, unmapped) {
  // Assertion: every canonical postcode must match the UK format. Halt on
  // any row that doesn't, so bad data never reaches the DB.
  const bad = []
  for (const r of joined) {
    if (!POSTCODE_CANONICAL_RE.test(r.postcode_canonical)) bad.push(r.postcode_canonical)
    if (bad.length >= 10) break
  }
  if (bad.length > 0) {
    throw new Error(`[assert] ${bad.length}+ rows have non-canonical postcodes. Examples: ${bad.join(', ')}`)
  }

  const header = 'postcode,data_zone_2011,simd_rank,simd_decile,simd_quintile,source\n'
  const body = joined.map(r =>
    [r.postcode_canonical, r.dz2011, r.rank, r.decile, r.quintile, SOURCE_TAG].join(','),
  ).join('\n')
  writeFileSync(OUT_CSV, header + body + '\n', 'utf8')
  console.log(`[write] ${OUT_CSV} (${joined.length} rows, canonical format validated)`)

  // Sample rows across the three bands for STOP gate A.
  const byBand = {
    'SIMD20 (decile 1-2)': joined.filter(r => r.decile <= 2),
    'SIMD40 (decile 3-4)': joined.filter(r => r.decile === 3 || r.decile === 4),
    'outside (decile 5-10)': joined.filter(r => r.decile >= 5),
  }
  const samples = {}
  for (const [band, rows] of Object.entries(byBand)) {
    samples[band] = {
      count: rows.length,
      examples: rows.slice(0, 3).map(r => ({
        postcode: r.postcode, dz: r.dz2011, rank: r.rank, decile: r.decile, quintile: r.quintile,
      })),
    }
  }

  // Spot-check known postcodes for the STOP gate. Key on stripped form.
  const testPostcodes = ['G349AJ', 'EH106AA', 'AB22AE', 'AB242BE', 'EH47DX', 'EH114BN']
  const spotCheck = {}
  const outByPostcode = new Map(joined.map(r => [r.postcode, r]))
  for (const pc of testPostcodes) {
    const hit = outByPostcode.get(pc)
    spotCheck[pc] = hit
      ? { present: true, canonical: hit.postcode_canonical, decile: hit.decile, rank: hit.rank, dz: hit.dz2011 }
      : { present: false }
  }

  const stats = {
    source: SOURCE_TAG,
    generated_at: new Date().toISOString(),
    spd: spdTotals,
    simd_lookup_rows: simdTotals.totalRows,
    simd_distinct_dzs: simdTotals.dzMap?.size ?? null,
    output_rows: joined.length,
    unmapped_rows: unmapped.length,
    unmapped_sample: unmapped.slice(0, 10).map(r => ({ postcode: r.postcode, dz: r.dz2011 })),
    band_summary: samples,
    spot_check: spotCheck,
  }
  writeFileSync(STATS_JSON, JSON.stringify(stats, null, 2), 'utf8')
  console.log(`[write] ${STATS_JSON}`)
  return stats
}

async function main() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true })
  const simd = loadSimdLookup()
  const { liveRows, totals: spdTotals } = await loadSpdLive()
  const { out, unmapped } = join(liveRows, simd)
  const stats = writeOutputs(
    out,
    spdTotals,
    { totalRows: simd.totalRows, dzMap: simd.dzMap },
    unmapped,
  )

  console.log('\n=== Summary ===')
  console.log(`Live Scottish postcodes (SPD 2026/1, small+large): ${spdTotals.combined_live}`)
  console.log(`Mapped to SIMD 2020v2: ${out.length}`)
  console.log(`Unmapped: ${unmapped.length}`)
  console.log('Band sample counts:')
  for (const [band, s] of Object.entries(stats.band_summary)) {
    console.log(`  ${band}: ${s.count} postcodes; e.g. ${s.examples.map(e => `${e.postcode} (decile ${e.decile})`).join(', ')}`)
  }
  console.log('\nSpot-check:')
  for (const [pc, res] of Object.entries(stats.spot_check)) {
    console.log(`  ${pc} →`, res.present ? `decile ${res.decile} (DZ ${res.dz}, rank ${res.rank})` : 'NOT PRESENT')
  }
}

main().catch(err => {
  console.error('[refresh] failed:', err)
  process.exit(1)
})
