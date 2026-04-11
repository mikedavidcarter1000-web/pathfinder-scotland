const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const PROJECT_REF = 'qexfszbhmdducszupyzi';
const connectionString = `postgresql://postgres.${PROJECT_REF}:${encodeURIComponent(process.env.SUPABASE_DB_PASSWORD)}@aws-1-eu-west-2.pooler.supabase.com:5432/postgres`;

async function main() {
  const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });
  const client = await pool.connect();
  try {
    const existing = await client.query(
      "SELECT id FROM universities WHERE slug = 'abertay' OR name ILIKE '%abertay%'"
    );

    if (existing.rows.length > 0) {
      console.log(`Abertay already exists: ${existing.rows[0].id}`);
      return;
    }

    const result = await client.query(`
      INSERT INTO universities (name, slug, type, city, website, description, founded_year, russell_group, widening_access_info)
      VALUES (
        'Abertay University',
        'abertay',
        'modern',
        'Dundee',
        'https://www.abertay.ac.uk',
        'Modern university known for computer games, cybersecurity and applied sciences.',
        1994,
        false,
        '{}'::jsonb
      )
      RETURNING id
    `);

    console.log(`Created Abertay University with id: ${result.rows[0].id}`);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(e => { console.error(e); process.exit(1); });
