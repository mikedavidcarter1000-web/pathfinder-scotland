#!/usr/bin/env node
/**
 * Import Scottish SIMD postcodes to Supabase
 *
 * Usage:
 *   DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-1-eu-west-2.pooler.supabase.com:5432/postgres" node scripts/import_postcodes.js
 *
 * Or with individual params:
 *   SUPABASE_DB_PASSWORD="your-password" node scripts/import_postcodes.js
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const PROJECT_REF = 'qexfszbhmdducszupyzi';

async function main() {
  // Get database URL
  let connectionString = process.env.DATABASE_URL;

  if (!connectionString && process.env.SUPABASE_DB_PASSWORD) {
    connectionString = `postgresql://postgres.${PROJECT_REF}:${process.env.SUPABASE_DB_PASSWORD}@aws-1-eu-west-2.pooler.supabase.com:5432/postgres`;
  }

  if (!connectionString) {
    console.error('Error: No database connection string provided.');
    console.error('Please set DATABASE_URL or SUPABASE_DB_PASSWORD environment variable.');
    console.error('');
    console.error('Example:');
    console.error(`  DATABASE_URL="postgresql://postgres.${PROJECT_REF}:[PASSWORD]@aws-1-eu-west-2.pooler.supabase.com:5432/postgres" node scripts/import_postcodes.js`);
    console.error('');
    console.error('You can find your database password in the Supabase Dashboard:');
    console.error('  Project Settings > Database > Connection string > Password');
    process.exit(1);
  }

  console.log('Connecting to database...');

  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    // Test connection
    const client = await pool.connect();
    console.log('Connected successfully!');

    // Read migration file
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20240129000001_simd_postcodes_full.sql');
    console.log(`Reading migration file: ${migrationPath}`);

    const sqlContent = fs.readFileSync(migrationPath, 'utf-8');

    // Split into individual statements
    const statements = sqlContent
      .split(/;\s*\n/)
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`Found ${statements.length} SQL statements to execute`);

    // Execute each statement
    let executed = 0;
    let errors = 0;

    for (const statement of statements) {
      try {
        await client.query(statement);
        executed++;

        // Progress update
        if (executed % 10 === 0 || executed === statements.length) {
          console.log(`Progress: ${executed}/${statements.length} statements (${Math.round(100 * executed / statements.length)}%)`);
        }
      } catch (err) {
        errors++;
        console.error(`Error in statement ${executed + 1}:`, err.message);
        // Continue with next statement
      }
    }

    console.log('');
    console.log('=== Import Complete ===');
    console.log(`Executed: ${executed} statements`);
    console.log(`Errors: ${errors}`);

    // Verify count
    const result = await client.query('SELECT COUNT(*) as count FROM simd_postcodes');
    console.log(`Total postcodes in database: ${result.rows[0].count}`);

    client.release();
  } catch (err) {
    console.error('Database error:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
