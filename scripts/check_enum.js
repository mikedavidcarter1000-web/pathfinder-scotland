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
      SELECT t.typname, c.column_name
      FROM information_schema.columns c
      JOIN pg_type t ON t.oid = (SELECT pg_typeof(1::text)::regtype::oid) OR t.typname = c.udt_name
      WHERE c.table_name = 'courses' AND c.column_name = 'degree_type'
    `);
    console.log(res.rows);

    const res2 = await client.query(`
      SELECT udt_name FROM information_schema.columns
      WHERE table_name='courses' AND column_name='degree_type'
    `);
    console.log('udt_name:', res2.rows[0]);

    const res3 = await client.query(`
      SELECT typname FROM pg_type
      WHERE typname LIKE '%degree%'
    `);
    console.log('matching types:', res3.rows);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(e => { console.error(e); process.exit(1); });
