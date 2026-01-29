#!/usr/bin/env node
/**
 * Run a SQL migration file against the Supabase database
 * Usage: node scripts/run_migration.js <migration_file>
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const PROJECT_REF = 'qexfszbhmdducszupyzi';

async function main() {
  const migrationFile = process.argv[2];

  if (!migrationFile) {
    console.error('Usage: node scripts/run_migration.js <migration_file>');
    process.exit(1);
  }

  const filePath = path.resolve(migrationFile);
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }

  let connectionString = process.env.DATABASE_URL;
  if (!connectionString && process.env.SUPABASE_DB_PASSWORD) {
    connectionString = `postgresql://postgres.${PROJECT_REF}:${encodeURIComponent(process.env.SUPABASE_DB_PASSWORD)}@aws-1-eu-west-2.pooler.supabase.com:5432/postgres`;
  }

  if (!connectionString) {
    console.error('No database credentials found');
    process.exit(1);
  }

  console.log(`Running migration: ${path.basename(filePath)}`);

  const sql = fs.readFileSync(filePath, 'utf-8');
  const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });

  try {
    const client = await pool.connect();
    await client.query(sql);
    console.log('Migration completed successfully');
    client.release();
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
