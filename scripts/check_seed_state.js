#!/usr/bin/env node
/**
 * Check current row counts for subject/career seed tables.
 * Used to confirm whether seeding is needed before running it.
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
    console.log('=== Row counts ===');
    const tables = [
      'curricular_areas',
      'subjects',
      'career_sectors',
      'subject_career_sectors',
      'subject_progressions',
    ];
    for (const t of tables) {
      const r = await client.query(`SELECT COUNT(*)::int AS c FROM ${t}`);
      console.log(`${t}: ${r.rows[0].c}`);
    }

    console.log('\n=== curricular_areas (id, name) ===');
    const ca = await client.query(`SELECT id, name, display_order FROM curricular_areas ORDER BY display_order`);
    ca.rows.forEach(r => console.log(`${r.display_order}. ${r.name}  [${r.id}]`));

    console.log('\n=== career_sectors (sample) ===');
    const cs = await client.query(`SELECT name, display_order FROM career_sectors ORDER BY display_order NULLS LAST, name LIMIT 25`);
    cs.rows.forEach(r => console.log(`- ${r.name} (order: ${r.display_order})`));

    console.log('\n=== subjects (sample) ===');
    const subj = await client.query(`SELECT s.name, ca.name AS area FROM subjects s LEFT JOIN curricular_areas ca ON ca.id = s.curricular_area_id ORDER BY ca.display_order, s.name LIMIT 10`);
    subj.rows.forEach(r => console.log(`- ${r.name}  (${r.area})`));
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(e => { console.error(e); process.exit(1); });
