const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const PROJECT_REF = 'qexfszbhmdducszupyzi';
const connectionString = `postgresql://postgres.${PROJECT_REF}:${encodeURIComponent(process.env.SUPABASE_DB_PASSWORD)}@aws-1-eu-west-2.pooler.supabase.com:5432/postgres`;

async function main() {
  const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });
  const client = await pool.connect();
  try {
    console.log('=== UNIVERSITIES ===');
    const unis = await client.query('SELECT id, name FROM universities ORDER BY name');
    unis.rows.forEach(r => console.log(`${r.id}: ${r.name}`));

    console.log('\n=== COURSE COUNTS PER UNIVERSITY ===');
    const counts = await client.query(`
      SELECT u.name, u.id, COUNT(c.id) as course_count 
      FROM universities u 
      LEFT JOIN courses c ON c.university_id = u.id 
      GROUP BY u.id, u.name 
      ORDER BY u.name
    `);
    counts.rows.forEach(r => console.log(`${r.name} (${r.id}): ${r.course_count} courses`));

    console.log('\n=== TOTAL COURSES ===');
    const total = await client.query('SELECT COUNT(*) FROM courses');
    console.log(`Total: ${total.rows[0].count}`);

    console.log('\n=== COURSES TABLE SCHEMA ===');
    const schema = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'courses'
      ORDER BY ordinal_position
    `);
    schema.rows.forEach(r => console.log(`${r.column_name}: ${r.data_type} ${r.is_nullable === 'YES' ? '(nullable)' : '(NOT NULL)'}`));

    console.log('\n=== SAMPLE EXISTING COURSES (5) ===');
    const samples = await client.query(`
      SELECT c.name, u.name as university, c.degree_type, c.subject_area, c.duration_years, c.ucas_code, c.entry_requirements, c.widening_access_requirements
      FROM courses c
      JOIN universities u ON u.id = c.university_id
      ORDER BY random()
      LIMIT 5
    `);
    samples.rows.forEach(r => {
      console.log(`\n  ${r.name} (${r.university})`);
      console.log(`  degree: ${r.degree_type}, subject_area: ${r.subject_area}, duration: ${r.duration_years}, ucas: ${r.ucas_code}`);
      console.log(`  entry_req: ${JSON.stringify(r.entry_requirements)}`);
      console.log(`  widening: ${JSON.stringify(r.widening_access_requirements)}`);
    });

    console.log('\n=== DISTINCT SUBJECT AREAS ===');
    const areas = await client.query('SELECT DISTINCT subject_area, COUNT(*) FROM courses GROUP BY subject_area ORDER BY subject_area');
    areas.rows.forEach(r => console.log(`${r.subject_area}: ${r.count}`));

    console.log('\n=== DISTINCT DEGREE TYPES ===');
    const degrees = await client.query('SELECT DISTINCT degree_type, COUNT(*) FROM courses GROUP BY degree_type ORDER BY degree_type');
    degrees.rows.forEach(r => console.log(`${r.degree_type}: ${r.count}`));

  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(e => { console.error(e); process.exit(1); });
