#!/usr/bin/env node
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const PROJECT_REF = 'qexfszbhmdducszupyzi';

async function main() {
  let connectionString = process.env.DATABASE_URL;
  if (!connectionString && process.env.SUPABASE_DB_PASSWORD) {
    connectionString = `postgresql://postgres.${PROJECT_REF}:${encodeURIComponent(process.env.SUPABASE_DB_PASSWORD)}@aws-1-eu-west-2.pooler.supabase.com:5432/postgres`;
  }
  const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });
  const client = await pool.connect();
  try {
    const { rows } = await client.query(`
      SELECT name, ai_impact_rating, length(ai_impact_description) AS desc_len
      FROM career_sectors
      ORDER BY
        CASE ai_impact_rating
          WHEN 'human-centric' THEN 1
          WHEN 'ai-augmented' THEN 2
          WHEN 'ai-exposed' THEN 3
          ELSE 4
        END,
        name
    `);
    console.log(`Found ${rows.length} career sectors`);
    for (const row of rows) {
      const rating = (row.ai_impact_rating || 'MISSING').padEnd(14);
      console.log(`  ${rating}  ${row.name}  (desc ${row.desc_len || 0} chars)`);
    }
    const missing = rows.filter((r) => !r.ai_impact_rating).length;
    if (missing > 0) {
      console.error(`\nFAIL: ${missing} sectors missing ai_impact_rating`);
      process.exit(1);
    }
    console.log(`\nAll ${rows.length} sectors have AI ratings`);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
