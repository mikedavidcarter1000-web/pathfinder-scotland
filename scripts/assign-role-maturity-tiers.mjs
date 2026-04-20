#!/usr/bin/env node
// Auto-assign career_roles.maturity_tier based on role_profiles.description
// pattern matching. Path 1 from Stage 1.5e, v2.1 ruleset after Gate A feedback.
//
// The SQL form of these rules is what was actually applied to the live DB
// (see docs/session-learnings.md entry for Stage 1.5e). This JS script is
// the portable / documented form -- keep the two in lock-step.
//
// Usage:
//   node scripts/assign-role-maturity-tiers.mjs --dry-run   (report only)
//   node scripts/assign-role-maturity-tiers.mjs --apply     (commit assignments)
//
// Rule precedence is fixed: specialised > foundational > intermediate > NULL.
// False positives are asymmetric: a junior role wrongly tagged specialised
// (hides it from S2-S3) is worse than a senior role wrongly tagged intermediate.
// NULL is the generous bucket -- anything that doesn't match cleanly is left
// for manual review at Gate A.
//
// Data caveat: the role_profiles.description column is written as
// day-in-the-life narrative, so most roles don't explicitly name their entry
// route. Hit rates are:
//   foundational:   2 / 269   (under-match; most trades don't mention apprenticeship)
//   intermediate:  18 / 269   (under-match; most descriptions don't name qualification)
//   specialised:   29 / 269   (good signal -- statutory registration is consistently named)
//   unassigned:   220 / 269   (phase-2: curate by hand)

import { Client } from 'pg'

// ---------------------------------------------------------------------------
// RULESET -- v2.1, matches the SQL applied to the live DB.
// Patterns are case-insensitive; Postgres POSIX ARE word-boundary is \y.
// These JS regex patterns use the JS \b equivalent (\b in PCRE).
// ---------------------------------------------------------------------------

const SPECIALISED_PATTERNS = [
  {
    name: 'chartered + named-profession qualifier',
    re: /\bchartered\s+(status|engineer|surveyor|architect|accountant|tax\s+adviser|practitioner|fellow|secretary|builder|insurance|geologist|biologist|chemist|physicist|psychologist|town\s+planner|landscape\s+architect|environmentalist|forester|scientist|member|professional|insurer|linguist)\b/i,
    why: 'Chartered status when paired with a named profession, not just a professional-body name.',
  },
  {
    name: 'chartered status (explicit)',
    re: /\bchartered\s+status\b/i,
    why: 'Direct mention of chartered status as an entry requirement.',
  },
  {
    name: 'professional post-nominal letters',
    re: /\b(?:CEng|MICE|MIStructE|MCIBSE|MIET|MRICS|FRICS|MRIAS|FRIAS|MCIPD|FCIPS|CIMA|ACCA|FCA|ACA|CTA)\b/,
    why: 'Chartered / full-member post-nominals imply professional review completion.',
  },
  {
    name: 'registered with (abbreviation)',
    re: /(?:must\s+be\s+|must\s+|currently\s+|now\s+|then\s+)?(?:registered|register|registration)\s+(?:with|on)\s+(?:the\s+)?(?:GMC|GDC|GPhC|NMC|HCPC|ARB|RCVS|SSSC|GOC)\b/i,
    why: 'Statutory professional register -- abbreviation form.',
  },
  {
    name: 'registered with (full name)',
    re: /(?:must\s+be\s+|must\s+|currently\s+|now\s+|then\s+)?(?:registered|register|registration)\s+(?:with|on)\s+(?:the\s+)?(?:General\s+Medical\s+Council|General\s+Dental\s+Council|General\s+Pharmaceutical\s+Council|General\s+Optical\s+Council|Nursing\s+and\s+Midwifery\s+Council|Health\s+and\s+Care\s+Professions\s+Council|Architects\s+Registration\s+Board|Royal\s+College\s+of\s+Veterinary\s+Surgeons|Law\s+Society|Faculty\s+of\s+Advocates|Scottish\s+Social\s+Services\s+Council|General\s+Teaching\s+Council)\b/i,
    why: 'Statutory professional register -- full-name form (how most descriptions are phrased).',
  },
  {
    name: 'consultant (excl. pharmacist/nurse/physiotherapist)',
    re: /\bconsultant\b/i,
    why: 'Senior specialism. Exclusions applied via pre-strip; "consultant pharmacist" etc preserved as intermediate.',
    preStrip: /consultant\s+(pharmacist|nurse|physiotherapist)/gi,
  },
  {
    name: 'advocate (excl. "advocate for")',
    re: /\badvocate\b/i,
    why: 'Scottish bar. Exclusions applied via pre-strip.',
    preStrip: /advocate\s+for\b/gi,
  },
  {
    name: 'senior specialist',
    re: /\bsenior\s+specialist\b/i,
    why: 'Senior specialism implies long restricted-entry path.',
  },
  {
    name: 'fully qualified named profession',
    re: /\bfully\s+qualified\s+(?:doctor|dentist|solicitor|barrister|architect|vet|veterinary\s+surgeon)\b/i,
    why: 'Named regulated profession with full qualification gate.',
  },
  {
    name: 'degree and professional qualification',
    re: /\brequires\s+(?:[a-z]+\s+)?degree\s+and\s+professional\s+qualification\b/i,
    why: 'Explicit dual gate -- degree plus professional registration.',
  },
]

const FOUNDATIONAL_PATTERNS = [
  { name: 'foundation apprenticeship',     re: /\bfoundation\s+apprentice/i,                                                                            why: 'FA route is school-age (S5/S6) entry to occupation.' },
  { name: 'N-year apprenticeship (trades)', re: /\b(?:two|three|four|five)(?:[\s-]+to[\s-]+(?:three|four|five|six))?[\s-]year\s+apprentice/i,            why: 'Multi-year trade apprenticeship -- standard foundational route.' },
  { name: 'apprenticeship from S4/S5/16',   re: /\bapprenticeship\s+(?:from|at|in)\s+(?:s[3-6]|age\s+1[5-7])\b/i,                                        why: 'Pre-18 apprenticeship route.' },
  { name: 'entry/route + school leaver',    re: /\b(?:entry|route|via|for)\s+school\s+leaver/i,                                                          why: 'School-leaver entry in qualification context.' },
  { name: 'school leavers + action verb',   re: /\bschool\s+leavers?\s+(?:can|may|enter|apprentice|via|directly|with|through|qualif)/i,                  why: 'School leavers as subject of entry verb.' },
  { name: 'open to school leavers',         re: /\bopen\s+to\s+school\s+leavers/i,                                                                       why: 'Explicitly inclusive of school leavers.' },
  { name: 'no formal qualifications',       re: /\bno\s+formal\s+qualifications?\s+(?:required|needed)\b/i,                                              why: 'Explicitly no qualification gate.' },
  { name: 'entry-level',                    re: /\bentry.level\b/i,                                                                                      why: 'Marketed as entry-level / no prior experience expected.' },
  { name: 'no experience required',         re: /\bno\s+experience\s+(?:required|needed)\b/i,                                                            why: 'Open-entry signal.' },
  { name: 'National 4/5 in entry context',  re: /\b(?:require|need|minimum|entry|with|via|requires?\s+at\s+least)\s+(?:a\s+|an\s+|the\s+)?(?:N(?:ational)?\s*[45])\b/i, why: 'N4/N5 as entry threshold (not as a subject taught).' },
]

const INTERMEDIATE_PATTERNS = [
  { name: 'Higher / HNC / HND / degree / MA / GA / bachelor / master', re: /\b(?:higher|hnc|hnd|modern\s+apprentice|graduate\s+apprentice|bachelor|master'?s|degree)\b/i, why: 'Post-16 qualification or apprenticeship (no chartered/registered gate).' },
]

// ---------------------------------------------------------------------------
// Classification logic.
// ---------------------------------------------------------------------------

function classify(description) {
  const text = description || ''

  const specialisedHits = SPECIALISED_PATTERNS.filter((p) => {
    const candidate = p.preStrip ? text.replace(p.preStrip, '') : text
    return p.re.test(candidate)
  })
  const foundationalHits = FOUNDATIONAL_PATTERNS.filter((p) => p.re.test(text))
  const intermediateHits = INTERMEDIATE_PATTERNS.filter((p) => p.re.test(text))

  if (specialisedHits.length > 0 && foundationalHits.length > 0) {
    return { tier: null, reason: `ambiguous: both specialised and foundational matched` }
  }
  if (specialisedHits.length > 0) {
    return { tier: 'specialised', reason: specialisedHits.map((h) => h.name).join(', ') }
  }
  if (foundationalHits.length > 0) {
    return { tier: 'foundational', reason: foundationalHits.map((h) => h.name).join(', ') }
  }
  if (intermediateHits.length > 0) {
    return { tier: 'intermediate', reason: intermediateHits.map((h) => h.name).join(', ') }
  }
  return { tier: null, reason: 'no pattern matched -- review at Gate A' }
}

// ---------------------------------------------------------------------------
// Main.
// ---------------------------------------------------------------------------

async function main() {
  const args = new Set(process.argv.slice(2))
  const dryRun = args.has('--dry-run')
  const apply = args.has('--apply')

  if (!dryRun && !apply) {
    console.error('Usage: node scripts/assign-role-maturity-tiers.mjs (--dry-run|--apply)')
    process.exit(2)
  }
  if (dryRun && apply) {
    console.error('Pick one: --dry-run OR --apply.')
    process.exit(2)
  }

  const password = process.env.SUPABASE_DB_PASSWORD
  if (!password) {
    console.error('SUPABASE_DB_PASSWORD env var required (Supabase project DB password).')
    process.exit(2)
  }

  const client = new Client({
    connectionString: `postgres://postgres.qexfszbhmdducszupyzi:${encodeURIComponent(password)}@aws-1-eu-west-2.pooler.supabase.com:6543/postgres`,
  })
  await client.connect()

  try {
    const { rows } = await client.query(`
      SELECT cr.id, cr.title, cs.name AS sector, COALESCE(rp.description, '') AS description
      FROM career_roles cr
      JOIN career_sectors cs ON cs.id = cr.career_sector_id
      LEFT JOIN role_profiles rp ON rp.career_role_id = cr.id
      ORDER BY cs.name, cr.title
    `)

    const classified = rows.map((r) => ({ ...r, ...classify(r.description) }))

    const counts = { foundational: 0, intermediate: 0, specialised: 0, null: 0 }
    for (const r of classified) counts[r.tier ?? 'null'] += 1

    console.log('=== Tier distribution ===')
    console.log(`foundational: ${counts.foundational}`)
    console.log(`intermediate: ${counts.intermediate}`)
    console.log(`specialised : ${counts.specialised}`)
    console.log(`unassigned  : ${counts.null}`)
    console.log(`total       : ${classified.length}`)

    const bySector = new Map()
    for (const r of classified) {
      const s = bySector.get(r.sector) || { foundational: 0, intermediate: 0, specialised: 0, null: 0 }
      s[r.tier ?? 'null'] += 1
      bySector.set(r.sector, s)
    }
    console.log('\n=== Per-sector distribution ===')
    console.table([...bySector.entries()].map(([sector, c]) => ({
      sector, foundational: c.foundational, intermediate: c.intermediate, specialised: c.specialised, unassigned: c.null,
    })))

    if (dryRun) {
      console.log('\n[dry-run] No DB writes. Re-run with --apply to commit.')
      return
    }

    console.log('\n=== Applying tier assignments ===')
    await client.query('BEGIN')
    try {
      let updated = 0
      for (const r of classified) {
        if (r.tier === null) continue
        await client.query('UPDATE career_roles SET maturity_tier = $1::role_maturity_tier WHERE id = $2', [r.tier, r.id])
        updated += 1
      }
      await client.query('COMMIT')
      console.log(`Committed ${updated} updates. ${counts.null} rows left NULL for manual review.`)
    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    }
  } finally {
    await client.end()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
