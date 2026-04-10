#!/usr/bin/env node
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const PROJECT_REF = 'qexfszbhmdducszupyzi';
const connectionString = `postgresql://postgres.${PROJECT_REF}:${encodeURIComponent(process.env.SUPABASE_DB_PASSWORD)}@aws-1-eu-west-2.pooler.supabase.com:5432/postgres`;

async function main() {
  const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });

  const checks = [
    {
      name: 'subjects without curricular_area_id',
      sql: `SELECT COUNT(*) AS c FROM subjects WHERE curricular_area_id IS NULL`,
      expected: 0,
    },
    {
      name: 'multi-level subjects without any progression link',
      sql: `
        SELECT COUNT(*) AS c FROM subjects s
        WHERE s.is_academy = false
          AND ((s.is_available_n4::int + s.is_available_n5::int + s.is_available_higher::int + s.is_available_adv_higher::int) > 1)
          AND NOT EXISTS (
            SELECT 1 FROM subject_progressions sp WHERE sp.from_subject_id = s.id
          )
      `,
      expected: 0,
    },
    {
      name: 'subjects with no career sector mapping',
      sql: `
        SELECT COUNT(*) AS c FROM subjects s
        WHERE NOT EXISTS (
          SELECT 1 FROM subject_career_sectors scs WHERE scs.subject_id = s.id
        )
      `,
      expected: 0,
    },
    {
      name: 'distinct transitions in course_choice_rules',
      sql: `SELECT COUNT(DISTINCT transition) AS c FROM course_choice_rules`,
      expected: 4,
    },
    {
      name: 'total subjects',
      sql: `SELECT COUNT(*) AS c FROM subjects`,
      expected: null,
    },
    {
      name: 'NPA subjects',
      sql: `SELECT COUNT(*) AS c FROM subjects WHERE is_npa = true`,
      expected: null,
    },
    {
      name: 'Academy subjects',
      sql: `SELECT COUNT(*) AS c FROM subjects WHERE is_academy = true`,
      expected: null,
    },
    {
      name: 'subjects available at Higher',
      sql: `SELECT COUNT(*) AS c FROM subjects WHERE is_available_higher = true`,
      expected: null,
    },
    {
      name: 'subjects available at Advanced Higher',
      sql: `SELECT COUNT(*) AS c FROM subjects WHERE is_available_adv_higher = true`,
      expected: null,
    },
    {
      name: 'total progressions',
      sql: `SELECT COUNT(*) AS c FROM subject_progressions`,
      expected: null,
    },
    {
      name: 'progressions by level',
      sql: `SELECT from_level, to_level, COUNT(*) AS c FROM subject_progressions GROUP BY from_level, to_level ORDER BY from_level, to_level`,
      expected: 'list',
    },
  ];

  try {
    const client = await pool.connect();
    console.log('=== Seed Verification ===\n');
    let failed = 0;
    for (const chk of checks) {
      const res = await client.query(chk.sql);
      if (chk.expected === 'list') {
        console.log(`${chk.name}:`);
        res.rows.forEach(r => console.log(`  ${r.from_level}→${r.to_level}: ${r.c}`));
      } else {
        const count = parseInt(res.rows[0].c, 10);
        const ok = chk.expected === null || count === chk.expected;
        const mark = chk.expected === null ? 'INFO' : (ok ? 'PASS' : 'FAIL');
        console.log(`[${mark}] ${chk.name}: ${count}${chk.expected !== null ? ` (expected ${chk.expected})` : ''}`);
        if (!ok) failed++;
      }
    }
    client.release();
    console.log('');
    console.log(failed === 0 ? 'All integrity checks passed.' : `${failed} check(s) FAILED.`);
    process.exit(failed === 0 ? 0 : 1);
  } catch (err) {
    console.error('Verification failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
