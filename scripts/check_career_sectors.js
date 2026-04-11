const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const PROJECT_REF = 'qexfszbhmdducszupyzi';
const connectionString = `postgresql://postgres.${PROJECT_REF}:${encodeURIComponent(process.env.SUPABASE_DB_PASSWORD)}@aws-1-eu-west-2.pooler.supabase.com:5432/postgres`;

async function main() {
  const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });
  const client = await pool.connect();
  try {
    console.log('=== career_sectors columns ===');
    const cols = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'career_sectors'
      ORDER BY ordinal_position
    `);
    cols.rows.forEach(r => console.log(`${r.column_name}: ${r.data_type} ${r.is_nullable === 'YES' ? '(nullable)' : '(NOT NULL)'}`));

    console.log('\n=== career_sectors rows ===');
    const rows = await client.query('SELECT id, name, description, display_order FROM career_sectors ORDER BY display_order');
    rows.rows.forEach(r => console.log(`${r.display_order}. ${r.name} — ${r.description?.slice(0, 80) || '(no desc)'}`));
    console.log(`\nTotal: ${rows.rows.length}`);

    console.log('\n=== Distinct course subject_area values ===');
    const areas = await client.query(`SELECT DISTINCT subject_area FROM courses WHERE subject_area IS NOT NULL ORDER BY subject_area`);
    areas.rows.forEach(r => console.log(`  ${r.subject_area}`));
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(e => { console.error(e); process.exit(1); });
