const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const PROJECT_REF = 'qexfszbhmdducszupyzi';
const connectionString = `postgresql://postgres.${PROJECT_REF}:${encodeURIComponent(process.env.SUPABASE_DB_PASSWORD)}@aws-1-eu-west-2.pooler.supabase.com:5432/postgres`;

async function main() {
  const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });
  const client = await pool.connect();
  try {
    console.log('=== DEGREE TYPE ENUM VALUES ===');
    const enums = await client.query(`
      SELECT unnest(enum_range(NULL::degree_type_enum))::text AS val
    `).catch(async () => {
      return await client.query(`
        SELECT enumlabel AS val FROM pg_enum e
        JOIN pg_type t ON e.enumtypid = t.oid
        WHERE t.typname LIKE '%degree%'
      `);
    });
    enums.rows.forEach(r => console.log(r.val));

    console.log('\n=== COURSE_SUBJECT_REQUIREMENTS SCHEMA ===');
    const csr = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'course_subject_requirements'
      ORDER BY ordinal_position
    `);
    csr.rows.forEach(r => console.log(`${r.column_name}: ${r.data_type} ${r.is_nullable === 'YES' ? '(nullable)' : '(NOT NULL)'}`));

    console.log('\n=== SUBJECTS TABLE SCHEMA ===');
    const subjsch = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'subjects'
      ORDER BY ordinal_position
    `);
    subjsch.rows.forEach(r => console.log(`${r.column_name}: ${r.data_type} ${r.is_nullable === 'YES' ? '(nullable)' : '(NOT NULL)'}`));

    console.log('\n=== ALL SUBJECTS ===');
    const subjects = await client.query('SELECT id, name FROM subjects ORDER BY name');
    console.log(`Total subjects: ${subjects.rows.length}`);
    subjects.rows.forEach(r => console.log(`  ${r.name}`));

    console.log('\n=== COURSE_SUBJECT_REQUIREMENTS COUNT ===');
    const csrCount = await client.query('SELECT COUNT(*) FROM course_subject_requirements');
    console.log(`Total rows: ${csrCount.rows[0].count}`);

    console.log('\n=== SAMPLE COURSE_SUBJECT_REQUIREMENTS ===');
    const csrSample = await client.query(`
      SELECT c.name as course_name, u.name as uni, s.name as subject, csr.qualification_level, csr.min_grade, csr.is_mandatory
      FROM course_subject_requirements csr
      JOIN courses c ON c.id = csr.course_id
      JOIN universities u ON u.id = c.university_id
      JOIN subjects s ON s.id = csr.subject_id
      LIMIT 10
    `);
    csrSample.rows.forEach(r => console.log(`  ${r.course_name} (${r.uni}): ${r.subject} [${r.qualification_level}/${r.min_grade}] mandatory=${r.is_mandatory}`));

    console.log('\n=== EXISTING COURSE SLUGS (10) ===');
    const slugs = await client.query('SELECT name, slug FROM courses ORDER BY random() LIMIT 10');
    slugs.rows.forEach(r => console.log(`  ${r.name} => ${r.slug}`));

    console.log('\n=== ALL EXISTING COURSES (for duplicate check) ===');
    const all = await client.query(`
      SELECT c.name, u.name as uni, c.subject_area, c.degree_type
      FROM courses c JOIN universities u ON u.id = c.university_id
      ORDER BY u.name, c.name
    `);
    all.rows.forEach(r => console.log(`  [${r.uni}] ${r.name} (${r.degree_type}, ${r.subject_area})`));

    console.log('\n=== WIDENING ACCESS FORMATS (sample) ===');
    const wa = await client.query(`
      SELECT DISTINCT widening_access_requirements::text
      FROM courses
      WHERE widening_access_requirements != '{}'::jsonb
      LIMIT 20
    `);
    wa.rows.forEach(r => console.log(`  ${r.widening_access_requirements}`));

    console.log('\n=== ENTRY REQUIREMENTS FORMATS (distinct structures) ===');
    const er = await client.query(`
      SELECT entry_requirements::text, COUNT(*)
      FROM courses
      GROUP BY entry_requirements::text
      ORDER BY count DESC
      LIMIT 20
    `);
    er.rows.forEach(r => console.log(`  (${r.count}) ${r.entry_requirements}`));

  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(e => { console.error(e); process.exit(1); });
