// Stage 1.5f (part 2): read the 269-row classifications JSON and emit an
// atomic SQL block that updates role_profiles (4 cols) and career_roles
// (maturity_tier) from a single VALUES payload. Idempotent -- re-running
// the SQL with the same JSON leaves rows unchanged.

import fs from 'node:fs'

const INPUT = 'data/role-classification-input/role-classifications-import.json'
const OUTPUT = 'data/role-classification-input/apply-classifications.sql'

const ENTRY_QUAL = new Set([
  'none',
  'national_4',
  'national_5',
  'highers',
  'hnc',
  'hnd',
  'degree',
  'degree_plus_professional',
])
const TIERS = new Set(['foundational', 'intermediate', 'specialised'])

const rows = JSON.parse(fs.readFileSync(INPUT, 'utf8'))

for (const [i, r] of rows.entries()) {
  if (!/^[0-9a-f-]{36}$/.test(r.role_id)) throw new Error(`row ${i}: bad role_id`)
  if (!ENTRY_QUAL.has(r.min_entry_qualification)) throw new Error(`row ${i}: min_eq`)
  if (!ENTRY_QUAL.has(r.typical_entry_qualification)) throw new Error(`row ${i}: typ_eq`)
  if (!Number.isInteger(r.typical_starting_salary_gbp)) throw new Error(`row ${i}: start`)
  if (!Number.isInteger(r.typical_experienced_salary_gbp)) throw new Error(`row ${i}: exp`)
  if (!TIERS.has(r.maturity_tier)) throw new Error(`row ${i}: tier`)
}

const profileValues = rows
  .map(
    (r) =>
      `('${r.role_id}'::uuid, '${r.min_entry_qualification}', '${r.typical_entry_qualification}', ${r.typical_starting_salary_gbp}, ${r.typical_experienced_salary_gbp})`,
  )
  .join(',\n  ')

const tierValues = rows
  .map((r) => `('${r.role_id}'::uuid, '${r.maturity_tier}')`)
  .join(',\n  ')

const sql = `-- Apply hand-classified role fields (Stage 1.5f part 2).
-- Source JSON: ${INPUT}
-- Row count: ${rows.length}
-- Generated: ${new Date().toISOString()}

UPDATE public.role_profiles AS rp
SET
  min_entry_qualification        = v.min_eq::public.entry_qualification,
  typical_entry_qualification    = v.typ_eq::public.entry_qualification,
  typical_starting_salary_gbp    = v.start_sal,
  typical_experienced_salary_gbp = v.exp_sal
FROM (VALUES
  ${profileValues}
) AS v(career_role_id, min_eq, typ_eq, start_sal, exp_sal)
WHERE rp.career_role_id = v.career_role_id;

UPDATE public.career_roles AS cr
SET maturity_tier = v.tier::public.role_maturity_tier
FROM (VALUES
  ${tierValues}
) AS v(role_id, tier)
WHERE cr.id = v.role_id;
`

fs.writeFileSync(OUTPUT, sql)
console.log(`wrote ${OUTPUT} (${sql.length} bytes, ${rows.length} rows)`)
