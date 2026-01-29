#!/usr/bin/env node
/**
 * Import Scottish SIMD postcodes to Supabase
 * Reads directly from Excel file and inserts to database
 *
 * Requires: DATABASE_URL environment variable
 * Example: DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-1-eu-west-2.pooler.supabase.com:5432/postgres"
 */

const { Pool } = require('pg');
const XLSX = require('xlsx');
const path = require('path');

const PROJECT_REF = 'qexfszbhmdducszupyzi';
const BATCH_SIZE = 1000;

function normalizePostcode(postcode) {
  if (!postcode) return null;
  return postcode.toString().toUpperCase().replace(/\s+/g, '');
}

async function main() {
  // Get database URL
  let connectionString = process.env.DATABASE_URL;

  if (!connectionString && process.env.SUPABASE_DB_PASSWORD) {
    connectionString = `postgresql://postgres.${PROJECT_REF}:${encodeURIComponent(process.env.SUPABASE_DB_PASSWORD)}@aws-1-eu-west-2.pooler.supabase.com:5432/postgres`;
  }

  if (!connectionString) {
    console.error('❌ No database connection string provided.');
    console.error('');
    console.error('Set DATABASE_URL or SUPABASE_DB_PASSWORD:');
    console.error(`  set DATABASE_URL=postgresql://postgres.${PROJECT_REF}:[PASSWORD]@aws-1-eu-west-2.pooler.supabase.com:5432/postgres`);
    console.error('  node scripts/import_postcodes_v2.js');
    console.error('');
    console.error('Find your password in Supabase Dashboard > Project Settings > Database');
    process.exit(1);
  }

  console.log('📂 Loading Excel file...');
  const excelPath = path.join(__dirname, '..', 'simd_postcodes.xlsx');
  const workbook = XLSX.readFile(excelPath);
  const sheet = workbook.Sheets['All postcodes'];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  // Skip header row
  const postcodes = data.slice(1).filter(row => row[0] && row[4]);
  console.log(`📊 Found ${postcodes.length} postcodes to import`);

  console.log('🔌 Connecting to database...');
  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 5
  });

  try {
    const client = await pool.connect();
    console.log('✅ Connected!');

    // Delete existing data
    console.log('🗑️  Clearing existing sample postcodes...');
    await client.query('DELETE FROM simd_postcodes');

    // Process in batches
    console.log('📥 Importing postcodes...');
    let imported = 0;
    let errors = 0;

    for (let i = 0; i < postcodes.length; i += BATCH_SIZE) {
      const batch = postcodes.slice(i, i + BATCH_SIZE);

      const values = [];
      const placeholders = [];
      let paramIndex = 1;

      for (const row of batch) {
        const postcode = normalizePostcode(row[0]);
        const datazone = row[1] || null;
        const decile = parseInt(row[4]);

        if (postcode && decile >= 1 && decile <= 10) {
          values.push(postcode, decile, datazone);
          placeholders.push(`($${paramIndex++}, $${paramIndex++}, $${paramIndex++})`);
        }
      }

      if (placeholders.length > 0) {
        try {
          const query = `
            INSERT INTO simd_postcodes (postcode, simd_decile, datazone)
            VALUES ${placeholders.join(', ')}
            ON CONFLICT (postcode) DO UPDATE SET
              simd_decile = EXCLUDED.simd_decile,
              datazone = EXCLUDED.datazone
          `;
          await client.query(query, values);
          imported += placeholders.length;
        } catch (err) {
          errors++;
          console.error(`  Batch error: ${err.message}`);
        }
      }

      // Progress
      const pct = Math.round(100 * (i + batch.length) / postcodes.length);
      process.stdout.write(`\r  Progress: ${imported.toLocaleString()} imported (${pct}%)`);
    }

    console.log('');
    console.log('');
    console.log('=== Import Complete ===');
    console.log(`✅ Imported: ${imported.toLocaleString()} postcodes`);
    if (errors > 0) console.log(`⚠️  Errors: ${errors}`);

    // Verify
    const result = await client.query('SELECT COUNT(*) as count FROM simd_postcodes');
    console.log(`📊 Total in database: ${parseInt(result.rows[0].count).toLocaleString()}`);

    // Sample data
    const sample = await client.query(`
      SELECT postcode, simd_decile, datazone
      FROM simd_postcodes
      ORDER BY random()
      LIMIT 5
    `);
    console.log('\n📍 Sample postcodes:');
    sample.rows.forEach(row => {
      console.log(`   ${row.postcode} - Decile ${row.simd_decile} (${row.datazone})`);
    });

    client.release();
  } catch (err) {
    console.error('❌ Database error:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
