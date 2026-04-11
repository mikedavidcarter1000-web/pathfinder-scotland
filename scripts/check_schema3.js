const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const PROJECT_REF = 'qexfszbhmdducszupyzi';
const connectionString = `postgresql://postgres.${PROJECT_REF}:${encodeURIComponent(process.env.SUPABASE_DB_PASSWORD)}@aws-1-eu-west-2.pooler.supabase.com:5432/postgres`;

async function main() {
  const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });
  const client = await pool.connect();
  try {
    console.log('=== UNIVERSITIES FULL SCHEMA ===');
    const schema = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'universities'
      ORDER BY ordinal_position
    `);
    schema.rows.forEach(r => console.log(`${r.column_name}: ${r.data_type} ${r.is_nullable === 'YES' ? '(nullable)' : '(NOT NULL)'}`));

    console.log('\n=== UNIVERSITIES FULL ROWS ===');
    const rows = await client.query('SELECT * FROM universities ORDER BY name');
    rows.rows.forEach(r => console.log(JSON.stringify(r, null, 2)));
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(e => { console.error(e); process.exit(1); });
