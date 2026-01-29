#!/usr/bin/env node
/**
 * Auto-detect credentials and import SIMD postcodes
 * Tries multiple authentication methods in order
 */

const { createClient } = require('@supabase/supabase-js');
const { Pool } = require('pg');
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

// Load env file if exists
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
}

const PROJECT_REF = 'qexfszbhmdducszupyzi';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || `https://${PROJECT_REF}.supabase.co`;
const BATCH_SIZE = 500;

function normalizePostcode(postcode) {
  if (!postcode) return null;
  return postcode.toString().toUpperCase().replace(/\s+/g, '');
}

async function loadPostcodes() {
  console.log('📂 Loading Excel file...');
  const excelPath = path.join(__dirname, '..', 'simd_postcodes.xlsx');
  const workbook = XLSX.readFile(excelPath);
  const sheet = workbook.Sheets['All postcodes'];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  const postcodes = data.slice(1).filter(row => row[0] && row[4]);
  console.log(`📊 Found ${postcodes.length.toLocaleString()} postcodes`);
  return postcodes;
}

async function importViaSupabaseAPI(postcodes) {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return false;

  console.log('🔑 Using Supabase API with service role key...');
  const supabase = createClient(SUPABASE_URL, serviceKey, {
    auth: { persistSession: false }
  });

  // Delete existing
  console.log('🗑️  Clearing existing postcodes...');
  await supabase.from('simd_postcodes').delete().neq('postcode', '');

  let imported = 0;
  for (let i = 0; i < postcodes.length; i += BATCH_SIZE) {
    const batch = postcodes.slice(i, i + BATCH_SIZE);
    const records = batch
      .map(row => {
        const postcode = normalizePostcode(row[0]);
        const decile = parseInt(row[4]);
        if (postcode && decile >= 1 && decile <= 10) {
          return { postcode, simd_decile: decile, datazone: row[1] || null };
        }
        return null;
      })
      .filter(Boolean);

    if (records.length > 0) {
      const { error } = await supabase.from('simd_postcodes').upsert(records, { onConflict: 'postcode' });
      if (!error) imported += records.length;
    }
    process.stdout.write(`\r  Progress: ${imported.toLocaleString()} (${Math.round(100 * (i + batch.length) / postcodes.length)}%)`);
  }
  console.log('');
  return imported;
}

async function importViaPostgres(postcodes) {
  let connectionString = process.env.DATABASE_URL;
  if (!connectionString && process.env.SUPABASE_DB_PASSWORD) {
    connectionString = `postgresql://postgres.${PROJECT_REF}:${encodeURIComponent(process.env.SUPABASE_DB_PASSWORD)}@aws-1-eu-west-2.pooler.supabase.com:5432/postgres`;
  }
  if (!connectionString) return false;

  console.log('🔌 Using direct PostgreSQL connection...');
  const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });

  try {
    const client = await pool.connect();

    console.log('🗑️  Clearing existing postcodes...');
    await client.query('DELETE FROM simd_postcodes');

    let imported = 0;
    for (let i = 0; i < postcodes.length; i += BATCH_SIZE) {
      const batch = postcodes.slice(i, i + BATCH_SIZE);
      const values = [];
      const placeholders = [];
      let idx = 1;

      for (const row of batch) {
        const postcode = normalizePostcode(row[0]);
        const decile = parseInt(row[4]);
        if (postcode && decile >= 1 && decile <= 10) {
          values.push(postcode, decile, row[1] || null);
          placeholders.push(`($${idx++}, $${idx++}, $${idx++})`);
        }
      }

      if (placeholders.length > 0) {
        await client.query(`
          INSERT INTO simd_postcodes (postcode, simd_decile, datazone)
          VALUES ${placeholders.join(', ')}
          ON CONFLICT (postcode) DO UPDATE SET simd_decile = EXCLUDED.simd_decile, datazone = EXCLUDED.datazone
        `, values);
        imported += placeholders.length;
      }
      process.stdout.write(`\r  Progress: ${imported.toLocaleString()} (${Math.round(100 * (i + batch.length) / postcodes.length)}%)`);
    }
    console.log('');
    client.release();
    await pool.end();
    return imported;
  } catch (err) {
    console.error('PostgreSQL error:', err.message);
    await pool.end();
    return false;
  }
}

async function main() {
  console.log('======================================');
  console.log('SIMD Postcode Auto-Import');
  console.log('======================================\n');

  const postcodes = await loadPostcodes();

  // Try Supabase API first
  let imported = await importViaSupabaseAPI(postcodes);

  // Fallback to PostgreSQL
  if (!imported) {
    imported = await importViaPostgres(postcodes);
  }

  if (imported) {
    console.log('\n✅ Import complete!');
    console.log(`📊 Total imported: ${imported.toLocaleString()} postcodes`);
  } else {
    console.log('\n❌ No credentials found. Please add one of:');
    console.log('');
    console.log('  Option 1 - Service role key (recommended):');
    console.log('    Add to .env.local: SUPABASE_SERVICE_ROLE_KEY=eyJ...');
    console.log('    Find at: Supabase Dashboard > Project Settings > API');
    console.log('');
    console.log('  Option 2 - Database password:');
    console.log('    Add to .env.local: SUPABASE_DB_PASSWORD=...');
    console.log('    Or set: DATABASE_URL=postgresql://...');
    console.log('    Find at: Supabase Dashboard > Project Settings > Database');
    process.exit(1);
  }
}

main().catch(console.error);
