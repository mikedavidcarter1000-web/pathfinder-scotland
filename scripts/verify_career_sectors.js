const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const PROJECT_REF = 'qexfszbhmdducszupyzi';
const connectionString = `postgresql://postgres.${PROJECT_REF}:${encodeURIComponent(process.env.SUPABASE_DB_PASSWORD)}@aws-1-eu-west-2.pooler.supabase.com:5432/postgres`;

async function main() {
  const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });
  const client = await pool.connect();
  try {
    const rows = await client.query(`
      SELECT name, display_order,
             (description IS NOT NULL) AS has_desc,
             array_length(example_jobs, 1) AS jobs_count,
             (salary_range_entry IS NOT NULL) AS has_entry,
             (salary_range_experienced IS NOT NULL) AS has_exp,
             (growth_outlook IS NOT NULL) AS has_growth,
             array_length(course_subject_areas, 1) AS areas_count
      FROM career_sectors
      ORDER BY display_order
    `);
    let ok = 0;
    rows.rows.forEach(r => {
      const complete = r.has_desc && r.jobs_count >= 8 && r.has_entry && r.has_exp && r.has_growth;
      if (complete) ok++;
      console.log(`${complete ? 'OK' : 'MISS'} ${r.display_order}. ${r.name} — jobs:${r.jobs_count} areas:${r.areas_count}`);
    });
    console.log(`\n${ok}/${rows.rows.length} sectors fully populated`);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(e => { console.error(e); process.exit(1); });
