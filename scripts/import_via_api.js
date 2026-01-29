#!/usr/bin/env node
/**
 * Import Scottish SIMD postcodes via Supabase API
 * Uses service role key for admin access
 *
 * Add SUPABASE_SERVICE_ROLE_KEY to your .env.local file:
 *   SUPABASE_SERVICE_ROLE_KEY=eyJ...
 *
 * Find it at: Supabase Dashboard > Project Settings > API > service_role key
 */

const { createClient } = require('@supabase/supabase-js');
const XLSX = require('xlsx');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BATCH_SIZE = 500;

function normalizePostcode(postcode) {
  if (!postcode) return null;
  return postcode.toString().toUpperCase().replace(/\s+/g, '');
}

async function main() {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error('Missing environment variables.');
    console.error('');
    console.error('Add to your .env.local file:');
    console.error('  SUPABASE_SERVICE_ROLE_KEY=eyJ...');
    console.error('');
    console.error('Find it at: Supabase Dashboard > Project Settings > API > service_role key');
    process.exit(1);
  }

  console.log('Loading Excel file...');
  const excelPath = path.join(__dirname, '..', 'simd_postcodes.xlsx');
  const workbook = XLSX.readFile(excelPath);
  const sheet = workbook.Sheets['All postcodes'];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  // Skip header
  const postcodes = data.slice(1).filter(row => row[0] && row[4]);
  console.log(`Found ${postcodes.length} postcodes`);

  // Create Supabase client with service role key (bypasses RLS)
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false }
  });

  // Delete existing data
  console.log('Clearing existing postcodes...');
  const { error: deleteError } = await supabase.from('simd_postcodes').delete().neq('postcode', '');
  if (deleteError) {
    console.error('Delete error:', deleteError.message);
  }

  // Process in batches
  console.log('Importing postcodes...');
  let imported = 0;
  let errors = 0;

  for (let i = 0; i < postcodes.length; i += BATCH_SIZE) {
    const batch = postcodes.slice(i, i + BATCH_SIZE);

    const records = batch
      .map(row => {
        const postcode = normalizePostcode(row[0]);
        const datazone = row[1] || null;
        const decile = parseInt(row[4]);

        if (postcode && decile >= 1 && decile <= 10) {
          return { postcode, simd_decile: decile, datazone };
        }
        return null;
      })
      .filter(Boolean);

    if (records.length > 0) {
      const { error } = await supabase
        .from('simd_postcodes')
        .upsert(records, { onConflict: 'postcode' });

      if (error) {
        errors++;
        console.error(`Batch error: ${error.message}`);
      } else {
        imported += records.length;
      }
    }

    // Progress
    const pct = Math.round(100 * (i + batch.length) / postcodes.length);
    process.stdout.write(`\rProgress: ${imported.toLocaleString()} imported (${pct}%)`);
  }

  console.log('');
  console.log('');
  console.log('=== Import Complete ===');
  console.log(`Imported: ${imported.toLocaleString()} postcodes`);
  if (errors > 0) console.log(`Batch errors: ${errors}`);

  // Verify
  const { count } = await supabase
    .from('simd_postcodes')
    .select('*', { count: 'exact', head: true });
  console.log(`Total in database: ${count?.toLocaleString() || 'unknown'}`);
}

main().catch(console.error);
