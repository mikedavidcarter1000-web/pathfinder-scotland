const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const PROJECT_REF = 'qexfszbhmdducszupyzi';
const connectionString = `postgresql://postgres.${PROJECT_REF}:${encodeURIComponent(process.env.SUPABASE_DB_PASSWORD)}@aws-1-eu-west-2.pooler.supabase.com:5432/postgres`;

async function main() {
  const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });
  const client = await pool.connect();
  try {
    const res = await client.query(`
      SELECT conname, contype, pg_get_constraintdef(oid) as def
      FROM pg_constraint
      WHERE conrelid = 'courses'::regclass
    `);
    console.log('=== COURSES CONSTRAINTS ===');
    res.rows.forEach(r => console.log(`${r.conname} (${r.contype}): ${r.def}`));

    const res2 = await client.query(`
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE tablename = 'courses'
    `);
    console.log('\n=== COURSES INDEXES ===');
    res2.rows.forEach(r => console.log(`${r.indexname}: ${r.indexdef}`));

    const csrConstraints = await client.query(`
      SELECT conname, contype, pg_get_constraintdef(oid) as def
      FROM pg_constraint
      WHERE conrelid = 'course_subject_requirements'::regclass
    `);
    console.log('\n=== COURSE_SUBJECT_REQUIREMENTS CONSTRAINTS ===');
    csrConstraints.rows.forEach(r => console.log(`${r.conname} (${r.contype}): ${r.def}`));

    const csrIndexes = await client.query(`
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE tablename = 'course_subject_requirements'
    `);
    console.log('\n=== COURSE_SUBJECT_REQUIREMENTS INDEXES ===');
    csrIndexes.rows.forEach(r => console.log(`${r.indexname}: ${r.indexdef}`));
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(e => { console.error(e); process.exit(1); });
