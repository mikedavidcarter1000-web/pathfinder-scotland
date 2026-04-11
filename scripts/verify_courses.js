#!/usr/bin/env node
/**
 * Post-migration verification for course data
 */
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const PROJECT_REF = 'qexfszbhmdducszupyzi';
const connectionString = `postgresql://postgres.${PROJECT_REF}:${encodeURIComponent(process.env.SUPABASE_DB_PASSWORD)}@aws-1-eu-west-2.pooler.supabase.com:5432/postgres`;

async function main() {
  const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });
  const client = await pool.connect();
  try {
    console.log('=== TOTAL COURSE COUNT ===');
    const total = await client.query('SELECT COUNT(*) FROM courses');
    console.log(`Total: ${total.rows[0].count}`);

    console.log('\n=== COURSES PER UNIVERSITY ===');
    const byUni = await client.query(`
      SELECT u.name, COUNT(c.id) as count
      FROM universities u
      LEFT JOIN courses c ON c.university_id = u.id
      GROUP BY u.id, u.name
      ORDER BY count DESC
    `);
    byUni.rows.forEach(r => console.log(`  ${r.name}: ${r.count}`));

    console.log('\n=== COURSES WITH EMPTY ENTRY_REQUIREMENTS ===');
    const empty = await client.query(`
      SELECT u.name as uni, c.name
      FROM courses c
      JOIN universities u ON u.id = c.university_id
      WHERE c.entry_requirements = '{}'::jsonb
      ORDER BY u.name, c.name
    `);
    console.log(`Count: ${empty.rows.length}`);
    empty.rows.slice(0, 30).forEach(r => console.log(`  [${r.uni}] ${r.name}`));
    if (empty.rows.length > 30) console.log(`  ... and ${empty.rows.length - 30} more`);

    console.log('\n=== COURSE_SUBJECT_REQUIREMENTS COUNT ===');
    const csr = await client.query('SELECT COUNT(*) FROM course_subject_requirements');
    console.log(`Total: ${csr.rows[0].count}`);

    console.log('\n=== DUPLICATE CHECK ===');
    const dupes = await client.query(`
      SELECT university_id, name, COUNT(*)
      FROM courses
      GROUP BY university_id, name
      HAVING COUNT(*) > 1
    `);
    if (dupes.rows.length === 0) {
      console.log('No duplicates.');
    } else {
      dupes.rows.forEach(r => console.log(`  DUPLICATE: uni=${r.university_id} name=${r.name} count=${r.count}`));
    }

    console.log('\n=== DISTINCT SUBJECT_AREAS ===');
    const areas = await client.query(`
      SELECT subject_area, COUNT(*) FROM courses GROUP BY subject_area ORDER BY subject_area
    `);
    areas.rows.forEach(r => console.log(`  ${r.subject_area || '(null)'}: ${r.count}`));

    console.log('\n=== DISTINCT DEGREE_TYPES ===');
    const degs = await client.query(`
      SELECT degree_type, COUNT(*) FROM courses GROUP BY degree_type ORDER BY degree_type
    `);
    degs.rows.forEach(r => console.log(`  ${r.degree_type}: ${r.count}`));

    console.log('\n=== SPOT CHECK: 10 RANDOM COURSES ===');
    const spots = await client.query(`
      SELECT c.name, u.name as uni, c.degree_type, c.subject_area, c.duration_years, c.ucas_code,
             c.entry_requirements, c.widening_access_requirements
      FROM courses c
      JOIN universities u ON u.id = c.university_id
      ORDER BY random()
      LIMIT 10
    `);
    spots.rows.forEach(r => {
      console.log(`\n  [${r.uni}] ${r.name}`);
      console.log(`    ${r.degree_type}, ${r.subject_area}, ${r.duration_years}y, UCAS: ${r.ucas_code}`);
      console.log(`    Entry: ${JSON.stringify(r.entry_requirements)}`);
      console.log(`    Widening: ${JSON.stringify(r.widening_access_requirements)}`);
    });

    console.log('\n=== NEW SUBJECT_AREAS (not in original list) ===');
    const originalAreas = new Set([
      'Architecture', 'Art and Design', 'Biological Sciences', 'Business Management',
      'Chemistry', 'Computing Science', 'Dentistry', 'Economics', 'Education',
      'Engineering', 'English', 'Environmental Science', 'Geology', 'Health Sciences',
      'History', 'Law', 'Mathematics', 'Media Studies', 'Medicine', 'Music', 'Nursing',
      'Performing Arts', 'Pharmacy', 'Philosophy', 'Physics', 'Politics', 'Psychology',
      'Sport and Fitness', 'Travel and Tourism', 'Veterinary Medicine',
    ]);
    const newAreas = areas.rows
      .filter(r => r.subject_area && !originalAreas.has(r.subject_area))
      .map(r => `${r.subject_area} (${r.count})`);
    if (newAreas.length === 0) console.log('  None — all areas match existing list');
    else newAreas.forEach(a => console.log(`  ${a}`));
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(e => { console.error(e); process.exit(1); });
