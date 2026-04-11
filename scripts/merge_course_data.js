#!/usr/bin/env node
/**
 * Merge all agent research JSON files into a single master.json.
 * Deduplicates against existing DB courses.
 * Filters out bad data (bad degree_types, empty names, etc).
 */
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const PROJECT_REF = 'qexfszbhmdducszupyzi';
const connectionString = `postgresql://postgres.${PROJECT_REF}:${encodeURIComponent(process.env.SUPABASE_DB_PASSWORD)}@aws-1-eu-west-2.pooler.supabase.com:5432/postgres`;

const VALID_DEGREE_TYPES = new Set([
  'bsc', 'ba', 'ma', 'beng', 'meng', 'llb', 'mbchb', 'bds', 'bvm', 'bmus', 'bed', 'bnurs',
]);

function normaliseCourseName(name) {
  if (!name) return '';
  return name
    .replace(/\s*\(.*?\)\s*/g, '') // remove "(BSc)" etc.
    .replace(/\s+(BSc|BA|MA|BEng|MEng|LLB|MBChB|BDS|BVM|BMus|BEd|BNurs|BN|BMid|BDes|MPharm|MChem|MPhys|MDRad|MOccTh|MDiet|MPhys|MNutrition|MNutrition)(\s+\(Hons\))?$/i, '')
    .replace(/\s+\(Hons\)\s*$/i, '')
    .replace(/\s*\/\s*/g, ' ')
    .trim();
}

const ABERTAY_UUID = '5bfcbe33-3b8a-4860-987d-d59e2e3f0f4e';

function cleanCourse(c) {
  // Resolve Abertay placeholder
  if (c.university_id === 'ABERTAY_UUID') {
    c.university_id = ABERTAY_UUID;
  }
  // Resolve degree type quirks
  let dt = c.degree_type;
  if (dt === 'mpharm' || dt === 'mchem' || dt === 'mphys') dt = 'bsc';
  if (dt === 'bmid') dt = 'bnurs';
  if (!VALID_DEGREE_TYPES.has(dt)) dt = 'bsc';

  // Clean highers string - handle 5-grade variants
  const req = c.entry_requirements || {};
  if (req.highers && typeof req.highers === 'string') {
    // Normalise: remove spaces, uppercase, limit to valid letters
    req.highers = req.highers.replace(/\s/g, '').toUpperCase().replace(/[^A-D]/g, '');
  }

  // Clean required_subjects — remove bad values like "Science"
  if (req.required_subjects && Array.isArray(req.required_subjects)) {
    req.required_subjects = req.required_subjects.filter(s => {
      const lower = (s || '').toLowerCase().trim();
      return lower && lower !== 'science' && lower !== 'gaelic';
    });
    // Convert "Gaelic" to "Gàidhlig" (already filtered, re-map common names)
    req.required_subjects = req.required_subjects.map(s => {
      if (s === 'Gaelic') return 'Gàidhlig';
      return s;
    });
  }

  // Cast duration_years to 4 if bad
  let duration = c.duration_years;
  if (!duration || duration < 2 || duration > 6) {
    duration = (dt === 'mbchb' || dt === 'bds' || dt === 'bvm') ? 5 : 4;
  }

  // Clean UCAS code — null if looks random
  let ucas = c.ucas_code;
  if (ucas && /^[0-9A-F]{8}$/i.test(ucas)) ucas = null; // looks like a hash
  if (ucas && /^[A-Z]\d[A-Z]\d[A-Z]\d[A-Z]\d$/i.test(ucas)) ucas = null;
  if (ucas === '') ucas = null;

  return {
    name: normaliseCourseName(c.name),
    university_id: c.university_id,
    ucas_code: ucas,
    degree_type: dt,
    subject_area: c.subject_area || null,
    duration_years: duration,
    description: c.description || null,
    entry_requirements: req,
    widening_access_requirements: c.widening_access_requirements || {},
    course_url: c.course_url || null,
  };
}

async function main() {
  // Load existing courses from DB
  const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });
  const client = await pool.connect();
  const existingSet = new Set();
  try {
    const res = await client.query(`
      SELECT university_id, LOWER(name) as name_lower FROM courses
    `);
    res.rows.forEach(r => {
      existingSet.add(`${r.university_id}:${r.name_lower}`);
      // Also add normalised form
      const norm = normaliseCourseName(r.name_lower).toLowerCase();
      existingSet.add(`${r.university_id}:${norm}`);
    });
    console.log(`Loaded ${existingSet.size} existing course keys`);
  } finally {
    client.release();
    await pool.end();
  }

  // Load all agent files
  const dataDir = path.join(__dirname, 'course_research_data');
  const agentFiles = fs.readdirSync(dataDir).filter(f => f.startsWith('agent') && f.endsWith('.json'));
  console.log(`Found ${agentFiles.length} agent files`);

  const merged = [];
  const seenKeys = new Set();

  for (const f of agentFiles) {
    const content = JSON.parse(fs.readFileSync(path.join(dataDir, f), 'utf-8'));
    const unis = content.universities || {};
    let total = 0;
    for (const uniKey of Object.keys(unis)) {
      const courses = unis[uniKey];
      for (const c of courses) {
        const cleaned = cleanCourse(c);
        if (!cleaned.name || !cleaned.university_id) continue;
        const k = `${cleaned.university_id}:${cleaned.name.toLowerCase()}`;
        if (seenKeys.has(k)) continue;
        if (existingSet.has(k)) continue;
        seenKeys.add(k);
        merged.push(cleaned);
        total++;
      }
    }
    console.log(`  ${f}: added ${total} new courses`);
  }

  // Load all curated additional courses files
  const curatedFiles = fs.readdirSync(dataDir).filter(f => f.startsWith('curated_') && f.endsWith('.json'));
  for (const cf of curatedFiles) {
    const curated = JSON.parse(fs.readFileSync(path.join(dataDir, cf), 'utf-8'));
    let added = 0;
    for (const c of curated) {
      const cleaned = cleanCourse(c);
      if (!cleaned.name || !cleaned.university_id) continue;
      const k = `${cleaned.university_id}:${cleaned.name.toLowerCase()}`;
      if (seenKeys.has(k)) continue;
      if (existingSet.has(k)) continue;
      seenKeys.add(k);
      merged.push(cleaned);
      added++;
    }
    console.log(`  ${cf}: added ${added} new courses`);
  }

  console.log(`\nTotal unique new courses: ${merged.length}`);

  const outPath = path.join(dataDir, 'master.json');
  fs.writeFileSync(outPath, JSON.stringify(merged, null, 2));
  console.log(`Written to ${outPath}`);

  // Breakdown by university_id
  const breakdown = {};
  for (const c of merged) {
    breakdown[c.university_id] = (breakdown[c.university_id] || 0) + 1;
  }
  console.log('\nBreakdown by university_id:');
  Object.entries(breakdown).forEach(([k, v]) => console.log(`  ${k}: ${v}`));
}

main().catch(e => { console.error(e); process.exit(1); });
